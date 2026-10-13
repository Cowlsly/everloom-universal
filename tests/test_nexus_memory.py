import tempfile
import unittest
from pathlib import Path
from nexus.memory import MemoryStore

class MemoryTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.store=MemoryStore(Path(self.temp.name)/'memory.sqlite')
 def tearDown(self): self.temp.cleanup()
 def test_scope_and_forget(self):
  mid=self.store.remember('project:alpha','decision','Use local prototype','owner',confidence='user-stated')
  self.assertEqual(len(self.store.recall('project:alpha','prototype')),1)
  self.assertEqual(self.store.recall('project:beta'),[])
  self.assertTrue(self.store.forget(mid))
  self.assertEqual(self.store.recall('project:alpha'),[])
 def test_literal_search(self):
  self.store.remember('agent:marla','style','Use 100% clarity','user')
  self.assertEqual(len(self.store.recall('agent:marla','%')),1)
  self.assertEqual(self.store.recall('agent:marla','other'),[])

if __name__=='__main__': unittest.main()
