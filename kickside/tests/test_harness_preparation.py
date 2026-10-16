from copy import deepcopy
from pathlib import Path
import json
import re
import subprocess
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]
CASES = [('app/test', 'app/src/app/registry/documentation/_index.yaml', 'src/documentation_tool_fixture.yaml', 'documentation', {'source': 'file://fixtures/documentation.lua'}), ('platform/uploads/test', 'app/src/app/security/_index.yaml', 'src/fixtures/app_upload_policy.yaml', 'user.runtime_contracts', {}), ('platform/uploads/test', 'app/src/app/registry/storage/_index.yaml', 'src/fixtures/app_upload_storage.yaml', 'uploads', {})]

class HarnessPreparationTests(unittest.TestCase):
    def test_regression_runs_in_repository_gate(self):
        self.assertIn(['python3', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_harness_preparation.py'], json.loads((ROOT / ".github/modules.json").read_text())["checks"])

    def test_preparation_preserves_selected_declarations_without_python(self):
        for harness, source, target, name, changes in CASES:
            with self.subTest(harness=harness, target=target):
                script = ROOT / harness / 'prepare.sh'
                self.assertNotRegex(script.read_text(), r'(?i)\bpython(?:[0-9.]+)?\b')
                subprocess.run(['bash', str(script)], check=True, timeout=30)
                declaration = yaml.safe_load((ROOT / source).read_text())
                entries = deepcopy([entry for entry in declaration['entries']
                                    if entry.get('name') == name] if name else
                                   [entry for entry in declaration['entries']
                                    if entry.get('kind') == 'ns.requirement' or entry.get('name') == 'provider'])
                self.assertTrue(entries)
                for key, value in changes.items():
                    item = entries[0]
                    fields = key.split('.')
                    for field in fields[:-1]:
                        item = item[field]
                    item[fields[-1]] = value
                self.assertEqual(yaml.safe_load((ROOT / harness / target).read_text()),
                                 {'version': '1.0', 'namespace': declaration['namespace'], 'entries': entries})

if __name__ == '__main__':
    unittest.main()
