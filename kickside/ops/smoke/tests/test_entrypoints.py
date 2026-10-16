import importlib
from pathlib import Path
import subprocess
import sys
import unittest


class EntrypointTests(unittest.TestCase):
    def test_direct_module_runs_every_declared_case(self):
        root = Path(__file__).resolve().parents[1]
        for name in ('test_mocks',):
            module_name = 'tests.' + name
            module = importlib.import_module(module_name)
            expected = unittest.defaultTestLoader.loadTestsFromModule(module).countTestCases()
            with self.subTest(module=module_name):
                result = subprocess.run([sys.executable, '-m', module_name, '-v'], cwd=root,
                                        capture_output=True, text=True, timeout=10)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn(f'Ran {expected} tests', result.stderr)


if __name__ == '__main__':
    unittest.main()
