import json
import os
from pathlib import Path
import sqlite3
import tempfile
from types import SimpleNamespace
import unittest

from harness import Failure
from workflow_history_contract import tracker


class PublishedHistoryTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(dir=os.environ['TMPDIR'])
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / 'data').mkdir()
        self.database = sqlite3.connect(self.root / 'data/app.db')
        self.addCleanup(self.database.close)
        self.inst = SimpleNamespace(engine='sqlite', root=self.root)

    def test_distinguishes_a_legacy_schema_from_empty_durable_history(self):
        self.assertIsNone(tracker(self.inst, 'workflow'))
        self.database.execute('CREATE TABLE workflow_undo_history (workflow_id TEXT, tracker TEXT)')
        self.database.commit()
        self.assertEqual(tracker(self.inst, 'workflow'), {'undo': [], 'redo': []})

    def test_retains_the_exact_published_history(self):
        self.database.execute('CREATE TABLE workflow_undo_history (workflow_id TEXT, tracker TEXT)')
        before = {'undo': [{'forward': ['saved edit'], 'inverse': ['previous value']}], 'redo': []}
        self.database.execute('INSERT INTO workflow_undo_history VALUES (?, ?)',
                              ('workflow', json.dumps(before)))
        self.database.commit()
        self.assertEqual(tracker(self.inst, 'workflow'), before)

    def test_duplicate_history_owners_remain_an_error(self):
        self.database.execute('CREATE TABLE workflow_undo_history (workflow_id TEXT, tracker TEXT)')
        self.database.executemany('INSERT INTO workflow_undo_history VALUES (?, ?)',
                                 [('workflow', '{}'), ('workflow', '{}')])
        self.database.commit()
        with self.assertRaisesRegex(Failure, 'duplicate history owners'):
            tracker(self.inst, 'workflow')
