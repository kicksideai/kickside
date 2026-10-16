"""Engine startup failures retain owned control receipts and diagnostics."""
from pathlib import Path
import os
import subprocess
import sys
from harness import Scenario, require


def startup(ctx):
    root = Path(__file__).resolve().parents[2]
    environment = dict(os.environ)
    environment['PYTHONPATH'] = str(root / 'ops/smoke') + os.pathsep + environment.get('PYTHONPATH', '')
    command = [sys.executable, '-m', 'unittest', 'discover', '-s', 'ops/smoke/tests',
               '-p', 'test_fast_loop.py', '-k', 'constructor_failure']
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('engine-startup-receipts', {'command': command, 'exit_code': result.returncode,
        'stdout': result.stdout, 'stderr': result.stderr})
    require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario('native_errors_smoke_startup_receipts', 'regression', startup, issues=('NE-125',))]
