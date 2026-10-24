import subprocess
import sys

from harness import Scenario, require
from module_harness import selected_module_overlay


KB10_LAYOUT_CHECKS = (
    ('ops/smoke/mocks/kb10-browser-layout/test_drawer_deadline.py', 'ui/tests/test_drawer_deadline.py'),
    ('ops/smoke/mocks/kb10-browser-layout/drawer_layout_test.py', 'ui/tests/drawer_layout_test.py'),
)


def kb10_browser_deadline(ctx):
    with selected_module_overlay(ctx, 'kickside/kb10', KB10_LAYOUT_CHECKS) as module:
        checks = (
            ('kb10-browser-deadline-deadline',
             [sys.executable, '-m', 'unittest', 'discover', '-s', 'ui/tests', '-p', 'test_drawer_deadline.py']),
            ('kb10-browser-deadline-layout', [sys.executable, 'ui/tests/drawer_layout_test.py']),
        )
        for label, command in checks:
            result = subprocess.run(command, cwd=module, env=ctx.inst.env,
                                    capture_output=True, text=True, timeout=150)
            ctx.inst.evidence.save(label, {
                'command': command, 'exit_code': result.returncode,
                'stdout': result.stdout, 'stderr': result.stderr,
            })
            require(result.returncode == 0,
                    'KB10 layout/deadline guard: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('kb10_browser_deadline', 'regression', kb10_browser_deadline,
                     issues=('KB10-BROWSER-TRANSPORT-DEADLINE',))]
