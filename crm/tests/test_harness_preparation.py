from pathlib import Path
import json
import os
import shutil
import tempfile
import subprocess
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]

class HarnessPreparationTests(unittest.TestCase):
    def test_runner_owns_execution_and_preserves_failure_verdicts(self):
        with tempfile.TemporaryDirectory(dir=ROOT) as directory:
            root = Path(directory)
            (root / 'test').mkdir()
            (root / 'bin').mkdir()
            shutil.copy2(ROOT / 'test/run.sh', root / 'test/run.sh')
            prepare = root / 'test/prepare.sh'
            prepare.write_text('#!/bin/sh\nexit 0\n')
            prepare.chmod(0o755)
            runtime = root / 'bin/wippy'
            runtime.write_text('#!/bin/sh\nprintf "%s\\n" "$TEST_OUTPUT"\nexit "$TEST_EXIT"\n')
            runtime.chmod(0o755)
            for output, status, expected in [('PASSED', '0', 0), ('FAILED', '0', 1),
                                             ('No tests found', '0', 1), ('PASSED', '7', 1)]:
                with self.subTest(output=output, status=status):
                    result = subprocess.run(['bash', 'test/run.sh'], cwd=root,
                        env=os.environ | {'PATH': str(root / 'bin') + os.pathsep + os.environ['PATH'],
                                          'TEST_OUTPUT': output, 'TEST_EXIT': status},
                        capture_output=True, text=True, timeout=30)
                    self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
            self.assertEqual(list((root / 'test/.wippy').iterdir()), [])

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
