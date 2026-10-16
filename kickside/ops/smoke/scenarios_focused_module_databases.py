"""Focused module harness database plans remain isolated and complete."""
from pathlib import Path
import subprocess
import os
import sys
from harness import Scenario, require

def databases(ctx):
    root = Path(__file__).resolve().parents[2]
    command = [sys.executable, '-m', 'unittest', 'discover', '-s', 'ops/smoke/tests', '-p', 'test_module_harness.py', '-t', '.']
    environment = dict(os.environ)
    environment['PYTHONPATH'] = str(root / 'ops/smoke') + os.pathsep + environment.get('PYTHONPATH', '')
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('focused-module-databases', {'command': command, 'code': result.returncode,
        'output': result.stdout, 'error': result.stderr})
    require(result.returncode == 0, result.stdout + result.stderr)

REGISTRY = [Scenario('regression_focused_module_databases', 'regression', databases, issues=('NE-73',))]
