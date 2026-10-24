import subprocess
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
from scenarios_hub_ai_review import frontend


class HubFrontendVerdictTests(unittest.TestCase):
    def context(self):
        return SimpleNamespace(inst=SimpleNamespace(
            config={'replace': {'kickside/hub': '/source/platform/hub'}, 'binary': '/runtime/bin/wippy'},
            env={}, evidence=Mock()))

    def test_accepts_a_nonempty_passing_suite_with_terminal_formatting(self):
        output = '\x1b[2m      Tests\x1b[22m  \x1b[32m28 passed\x1b[39m (28)\n'
        ctx = self.context()
        completed = subprocess.CompletedProcess([], 0, output, '')
        with patch('scenarios_automation_task_forms.frontend_specs', return_value=completed) as specs, \
             patch('subprocess.run', return_value=completed):
            frontend(ctx)
        specs.assert_called_once_with(ctx, 'hub', ('src/app/InstallDialog_ai_review.spec.ts',),
                                      'hub-ai-frontend-guards')

    def test_rejects_failed_empty_or_missing_verdicts(self):
        for code, output in ((1, 'Tests 28 passed (28)'), (0, 'Tests 0 passed (0)'),
                             (0, 'Tests 1 failed | 28 passed (29)'), (0, 'Tests 28 passed | 1 failed (29)'),
                             (0, 'Test Files 1 passed (1)')):
            completed = subprocess.CompletedProcess([], code, output, '')
            with self.subTest(code=code, output=output), \
                 patch('scenarios_automation_task_forms.frontend_specs', return_value=completed), \
                 patch('subprocess.run', return_value=completed):
                with self.assertRaises(Failure):
                    frontend(self.context())
