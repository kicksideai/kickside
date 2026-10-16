import subprocess
from tests.test_module_test_targets import invoke
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULES = ('core/jobs', 'core/core', 'core/component', 'platform/automation', 'platform/channel', 'platform/users')


class ModuleBackendGateTests(unittest.TestCase):
    def command(self, module, target, *settings):
        return subprocess.check_output(['make', '--no-print-directory', '-n', target, *settings],
                                       cwd=ROOT / module, text=True)

    def test_lint_checks_the_complete_test_harness(self):
        for module in MODULES:
            with self.subTest(module=module):
                command = self.command(module, 'lint')
                self.assertIn('cd test && wippy lint', command)
                self.assertNotIn('--ns', command)

    def test_lint_gate_forwards_the_database_profile(self):
        for module in MODULES:
            with self.subTest(module=module):
                command = self.command(module, 'lint', 'WIPPY_LINT_ARGS=--profile postgres')
                self.assertIn('wippy lint --profile postgres', command)

    def test_test_gate_forwards_database_configuration(self):
        for module in MODULES:
            with self.subTest(module=module):
                run, arguments = invoke(module,
                    arguments='--profile postgres --set vars.pg_database=gate_probe')
                self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
                self.assertEqual(arguments[0], 'test')
                profile = arguments.index('--profile')
                self.assertEqual(arguments[profile + 1], 'postgres')
                self.assertIn('vars.pg_database=gate_probe',
                    [arguments[i + 1] for i, value in enumerate(arguments[:-1]) if value == '--set'])


if __name__ == '__main__':
    unittest.main()
