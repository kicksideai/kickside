"""Historical pending migrations receive the same data-preservation gate."""
import json
import os
from pathlib import Path
import tempfile
import unittest

from ops.compat.inventory import ROOT
from ops.compat.migrations import checkpoint_entries, rehearse


class PendingMigrationTests(unittest.TestCase):
    def test_published_session_drop_fails_preservation_on_both_engines(self):
        entries = json.loads((ROOT / 'ops/compat/tests/fixtures/journal-pending-05.json').read_text())['entries']
        identity = 'chestor.journal.migrations:05_drop_sessions'
        before, through = checkpoint_entries(entries, identity)
        recipes = json.loads((ROOT / 'ops/compat/migration-fixtures.json').read_text())
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            for engine in ('sqlite', 'postgres'):
                with self.subTest(engine=engine), self.assertRaises(ValueError):
                    rehearse(before, through, Path(directory) / engine, recipes, engines=(engine,))
                baseline_log = (Path(directory) / engine / (engine + '-baseline.log')).read_text()
                self.assertIn('PASSED', baseline_log)
                update_log = (Path(directory) / engine / (engine + '-update.log')).read_text()
                self.assertIn('FAILED', update_log)
                self.assertIn('chestor_journal_sessions', update_log)
