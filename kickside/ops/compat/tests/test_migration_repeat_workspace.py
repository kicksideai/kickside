import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from ops.compat.integration import test_migration_repeat as integration


class MigrationRepeatWorkspaceTests(unittest.TestCase):
    def test_repeated_suite_runs_preserve_prior_evidence_and_use_separate_workspaces(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            previous = root / 'sqlite-safe'
            previous.mkdir()
            receipt = previous / 'receipt'
            receipt.write_text('prior evidence')
            workspaces = []

            def verify(case, engines, evidence):
                self.assertEqual(engines, ('sqlite', 'postgres'))
                evidence = Path(evidence)
                workspaces.append(evidence)
                (evidence / 'sqlite-safe').mkdir()

            with patch.dict(os.environ, TMPDIR=str(root)), patch.object(integration.MigrationRepeatTests, 'verify', verify):
                for _ in range(2):
                    integration.MigrationRepeatTests().test_repeat_checks_new_data_preservation_on_both_engines()
            self.assertEqual(receipt.read_text(), 'prior evidence')
            self.assertEqual(len(set(workspaces)), 2)
            self.assertTrue(all(path.parent == root for path in workspaces))
