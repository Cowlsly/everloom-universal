"""SQLite-backed durable task queue. Standard library only; no model calls or network access."""
import json
import sqlite3
import time
import uuid
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, payload TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('PENDING','ACTIVE','VERIFY','COMPLETE','BLOCKED','FAILED')),
 attempt INTEGER NOT NULL DEFAULT 0, max_attempts INTEGER NOT NULL DEFAULT 3,
 owner TEXT, lease_until REAL, result TEXT, evidence TEXT,
 created_at REAL NOT NULL, updated_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_claim ON tasks(state,lease_until,created_at);
CREATE TABLE IF NOT EXISTS events (
 seq INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT NOT NULL,
 kind TEXT NOT NULL, detail TEXT NOT NULL, at REAL NOT NULL
);
"""

class Engine:
 def __init__(self, path):
  self.path = str(Path(path))
  with self.connect() as db: db.executescript(SCHEMA)

 def connect(self):
  db = sqlite3.connect(self.path, timeout=10, isolation_level=None)
  db.row_factory = sqlite3.Row
  db.execute('PRAGMA busy_timeout=10000')
  return db

 def event(self, db, task_id, kind, detail):
  db.execute('INSERT INTO events(task_id,kind,detail,at) VALUES(?,?,?,?)', (task_id,kind,json.dumps(detail,sort_keys=True),time.time()))

 def submit(self, title, payload=None, max_attempts=3):
  if not title.strip() or max_attempts < 1: raise ValueError('Invalid task')
  task_id=str(uuid.uuid4()); now=time.time()
  with self.connect() as db:
   db.execute('INSERT INTO tasks(id,title,payload,state,max_attempts,created_at,updated_at) VALUES(?,?,?,?,?,?,?)', (task_id,title,json.dumps(payload or {}),'PENDING',max_attempts,now,now))
   self.event(db,task_id,'SUBMITTED',{})
  return task_id

 def get(self, task_id):
  with self.connect() as db:
   row=db.execute('SELECT * FROM tasks WHERE id=?',(task_id,)).fetchone()
   return dict(row) if row else None

 def claim(self, worker, lease_seconds=120):
  if not worker.strip() or lease_seconds <= 0: raise ValueError('Invalid lease')
  now=time.time()
  with self.connect() as db:
   db.execute('BEGIN IMMEDIATE')
   # Expired work can be reclaimed, but exhausted tasks are failed, never retried indefinitely.
   expired=db.execute("SELECT id FROM tasks WHERE state='ACTIVE' AND lease_until<=? AND attempt>=max_attempts",(now,)).fetchall()
   for row in expired:
    db.execute("UPDATE tasks SET state='FAILED',owner=NULL,lease_until=NULL,updated_at=? WHERE id=?",(now,row['id']))
    self.event(db,row['id'],'RETRIES_EXHAUSTED',{})
   row=db.execute("""SELECT * FROM tasks WHERE state='PENDING' OR (state='ACTIVE' AND lease_until<=? AND attempt<max_attempts) ORDER BY created_at,id LIMIT 1""",(now,)).fetchone()
   if not row: return None
   db.execute("UPDATE tasks SET state='ACTIVE',owner=?,lease_until=?,attempt=attempt+1,updated_at=? WHERE id=?",(worker,now+lease_seconds,now,row['id']))
   self.event(db,row['id'],'CLAIMED',{'worker':worker,'attempt':row['attempt']+1})
   return self.get(row['id'])

 def heartbeat(self, task_id, worker, lease_seconds=120):
  if lease_seconds<=0: raise ValueError('Invalid lease')
  now=time.time()
  with self.connect() as db:
   cur=db.execute("UPDATE tasks SET lease_until=?,updated_at=? WHERE id=? AND state='ACTIVE' AND owner=? AND lease_until>?",(now+lease_seconds,now,task_id,worker,now))
   return cur.rowcount==1

 def submit_result(self, task_id, worker, result, evidence):
  if not evidence: raise ValueError('Evidence required for verification')
  now=time.time()
  with self.connect() as db:
   cur=db.execute("UPDATE tasks SET state='VERIFY',result=?,evidence=?,owner=NULL,lease_until=NULL,updated_at=? WHERE id=? AND state='ACTIVE' AND owner=? AND lease_until>?",(json.dumps(result),json.dumps(evidence),now,task_id,worker,now))
   if cur.rowcount!=1: raise ValueError('Task not owned or lease expired')
   self.event(db,task_id,'SUBMITTED_FOR_REVIEW',{'worker':worker})

 def review(self, task_id, reviewer, passed, notes):
  if not reviewer.strip() or not notes.strip(): raise ValueError('Reviewer and notes required')
  now=time.time()
  with self.connect() as db:
   db.execute('BEGIN IMMEDIATE')
   row=db.execute('SELECT * FROM tasks WHERE id=?',(task_id,)).fetchone()
   if row is None or row['state']!='VERIFY': raise ValueError('Not awaiting review')
   # Reviewer identity must differ from the producing worker, recorded in event history.
   worker=db.execute("SELECT detail FROM events WHERE task_id=? AND kind='SUBMITTED_FOR_REVIEW' ORDER BY seq DESC LIMIT 1",(task_id,)).fetchone()
   if worker and json.loads(worker['detail'])['worker']==reviewer: raise ValueError('Independent reviewer required')
   state='COMPLETE' if passed else ('FAILED' if row['attempt']>=row['max_attempts'] else 'PENDING')
   db.execute('UPDATE tasks SET state=?,updated_at=? WHERE id=?',(state,now,task_id))
   self.event(db,task_id,'REVIEW',{'reviewer':reviewer,'passed':bool(passed),'notes':notes,'next_state':state})
   return state

 def history(self, task_id):
  with self.connect() as db:
   return [dict(x) for x in db.execute('SELECT * FROM events WHERE task_id=? ORDER BY seq',(task_id,))]
