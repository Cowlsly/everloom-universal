import tempfile
import unittest
from pathlib import Path
from nexus.memory import MemoryStore
from nexus.session import bootstrap, render_context
from nexus.backup import snapshot

class SessionTests(unittest.TestCase):
    def test_bootstrap_is_scoped(self):
        with tempfile.TemporaryDirectory() as directory:
            store = MemoryStore(Path(directory) / "source.sqlite")
            store.remember("agent:marla", "style", "Warm and precise", "owner", "user-stated")
            store.remember("project:nexus", "decision", "Hybrid storage", "owner", "user-stated")
            store.remember("project:other", "private", "Never retrieve me", "owner")
            ctx = bootstrap(store, "marla", "nexus")
            rendered = render_context(ctx)
            self.assertIn("Hybrid storage", rendered)
            self.assertIn("Warm and precise", rendered)
            self.assertNotIn("Never retrieve me", rendered)
            destination = Path(directory) / "backup.sqlite"
            snapshot(str(Path(directory) / "source.sqlite"), str(destination))
            self.assertEqual(len(MemoryStore(destination).recall("project:nexus")), 1)
            with self.assertRaises(ValueError):
                snapshot(str(destination), str(destination))

if __name__ == "__main__":
    unittest.main()
