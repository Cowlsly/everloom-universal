"""Run: python -m unittest discover -s tests -p 'test_nexus_engine.py' -v"""
import tempfile
import unittest
from pathlib import Path
from nexus.engine import Engine

class EngineTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory()
  self.engine=Engine(Path(self.tmp.name)/'tasks.sqlite')
 def tearDown(self): self.tmp.cleanup()
 def test_complete_requires_independent_review(self):
  task=self.engine.submit('Build prototype')
  claimed=self.engine.claim('builder')
  self.assertEqual(claimed['id'],task)
  self.engine.submit_result(task,'builder',{'ok':True},['test-log'])
  with self.assertRaises(ValueError): self.engine.review(task,'builder',True,'looks fine')
  self.assertEqual(self.engine.review(task,'reviewer',True,'independent test passed'),'COMPLETE')
  self.assertIsNone(self.engine.claim('another'))
 def test_failed_review_requeues(self):
  task=self.engine.submit('Repair')
  self.engine.claim('builder')
  self.engine.submit_result(task,'builder',{},['log'])
  self.assertEqual(self.engine.review(task,'qa',False,'broken'),'PENDING')
  self.assertEqual(self.engine.claim('builder2')['attempt'],2)
 def test_ownership(self):
  task=self.engine.submit('Owned')
  self.engine.claim('builder')
  with self.assertRaises(ValueError): self.engine.submit_result(task,'intruder',{},['log'])
  self.assertTrue(self.engine.heartbeat(task,'builder'))
  self.assertFalse(self.engine.heartbeat(task,'intruder'))
 def test_evidence_required(self):
  task=self.engine.submit('Proof')
  self.engine.claim('builder')
  with self.assertRaises(ValueError): self.engine.submit_result(task,'builder',{},[])

if __name__=='__main__': unittest.main()
