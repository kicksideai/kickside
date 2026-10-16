"""Focused compatibility proofs retain their declared harness dependencies."""
import os
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def fixture_selection(ctx):
    root = Path(__file__).resolve().parents[2]
    scratch = ctx.inst.root / 'temp/compat-fixture-selection'
    scratch.mkdir(parents=True, exist_ok=True)
    command = [sys.executable, '-m', 'unittest', 'ops.compat.tests.test_focused_fixtures']
    result = subprocess.run(command, cwd=root, env=dict(os.environ, TMPDIR=str(scratch)),
                            capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('compat-fixture-selection', {'command': command,
        'code': result.returncode, 'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario('compat_focused_fixture_selection', 'regression', fixture_selection,
                    issues=('SMOKE-COMPAT-HARNESS-SELECTION', 'COMPAT-TRACKED-HARNESS-SOURCES'))]
