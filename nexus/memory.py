"""Portable SQLite memory store. Explicit retrieval only; no chat interception."""
import json
import sqlite3
import time
import uuid
from pathlib import Path

class MemoryStore:
 def __init__(self, path):
  self.path=str(Path(path))
  with self.connect() as db:
   db.execute("""CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY, scope TEXT NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL, source TEXT NOT NULL, confidence TEXT NOT NULL, created_at REAL NOT NULL, expires_at REAL, deleted_at REAL)""")
   db.execute('CREATE INDEX IF NOT EXISTS memories_scope ON memories(scope,kind,deleted_at)')

 def connect(self):
  db=sqlite3.connect(self.path,timeout=10)
  db.row_factory=sqlite3.Row
  return db

 def remember(self, scope, kind, body, source, confidence='unverified', expires_at=None):
  if not all(isinstance(x,str) and x.strip() for x in (scope,kind,body,source)): raise ValueError('scope, kind, body and source required')
  if confidence not in ('verified','user-stated','unverified'): raise ValueError('Invalid confidence')
  memory_id=str(uuid.uuid4())
  with self.connect() as db:
   db.execute('INSERT INTO memories VALUES(?,?,?,?,?,?,?,?,NULL)',(memory_id,scope,kind,body,source,confidence,time.time(),expires_at))
  return memory_id

 def recall(self, scope, query='',limit=20):
  if not scope or limit<1 or limit>100: raise ValueError('Invalid retrieval parameters')
  now=time.time()
  with self.connect() as db:
   rows=db.execute("""SELECT id,scope,kind,body,source,confidence,created_at FROM memories WHERE scope=? AND deleted_at IS NULL AND (expires_at IS NULL OR expires_at>?) AND body LIKE ? ESCAPE '\\' ORDER BY created_at DESC LIMIT ?""",(scope,now,'%'+query.replace('\\','\\\\').replace('%','\\%').replace('_','\\_')+'%',limit)).fetchall()
   return [dict(r) for r in rows]

 def forget(self, memory_id):
  with self.connect() as db:
   cur=db.execute('UPDATE memories SET deleted_at=? WHERE id=? AND deleted_at IS NULL',(time.time(),memory_id))
   return cur.rowcount==1
