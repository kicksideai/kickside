from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def kb10_browser_deadline(ctx):
    module = Path(ctx.inst.config['replace']['kickside/kb10'])
    result = subprocess.run(['make', 'test-ui-layout', 'PYTHON=' + sys.executable],
                            cwd=module, capture_output=True, text=True, timeout=150)
    ctx.inst.evidence.save('kb10-browser-deadline', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, 'KB10 layout/deadline guard: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('kb10_browser_deadline', 'regression', kb10_browser_deadline,
                     issues=('KB10-BROWSER-TRANSPORT-DEADLINE',))]
