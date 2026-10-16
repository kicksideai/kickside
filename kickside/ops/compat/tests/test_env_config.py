import os
from pathlib import Path
import tempfile
import unittest
import yaml
from ops.compat.migrations import write_entries

class EnvironmentConfigTests(unittest.TestCase):
    def test_unbound_environment_uses_harness_os_storage(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            write_entries(work, {'m:env': {'Kind': 'env.variable', 'Meta': {}, 'Data': {'name': 'FLAG', 'storage': ''}}})
            row = yaml.safe_load((work / 'entries-0.yaml').read_text())['entries'][0]
            self.assertEqual(row['storage'], 'app:env_storage')
