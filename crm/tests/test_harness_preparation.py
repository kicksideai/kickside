from pathlib import Path
import json
import subprocess
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]

class HarnessPreparationTests(unittest.TestCase):
    def test_regression_runs_in_repository_gate(self):
        self.assertIn(['python3', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_harness_preparation.py'], json.loads((ROOT / ".github/modules.json").read_text())["checks"])

    def test_mirror_preserves_manifest_without_publish_filter_or_python(self):
        for script in ('prepare.sh', 'run.sh'):
            self.assertNotRegex((ROOT / 'test' / script).read_text(), r'(?i)\bpython(?:[0-9.]+)?\b')
        subprocess.run(['bash', 'test/prepare.sh'], cwd=ROOT, check=True, timeout=30)
        original = yaml.safe_load((ROOT / 'wippy.yaml').read_text())
        original.pop('exclude_meta', None)
        self.assertEqual(yaml.safe_load((ROOT / 'test/module-mirror/wippy.yaml').read_text()), original)
        self.assertEqual((ROOT / 'test/src/query_handler_source.lua').read_bytes(),
                         (ROOT / 'src/api/query.lua').read_bytes())

if __name__ == '__main__':
    unittest.main()
