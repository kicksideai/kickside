"""Focused compatibility proofs keep host resources and isolate suite fixtures."""
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def compat_suite_fixtures(ctx):
    result = subprocess.run(
        [sys.executable, '-m', 'unittest', 'ops.compat.tests.test_focused_fixtures',
         'ops.compat.tests.test_migration_repeat_workspace'],
        cwd=Path(__file__).resolve().parents[2], capture_output=True, text=True, timeout=60,
    )
    ctx.inst.evidence.save('compat-suite-fixtures', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, 'Compatibility suite fixtures: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('regression_compat_suite_fixtures', 'regression', compat_suite_fixtures,
                     issues=('COMPAT-FOCUSED-SUITE-FIXTURES', 'COMPAT-REPLACEMENT-SOURCE-MIRROR',
                             'COMPAT-REPEAT-WORKSPACE-ISOLATION'))]
