"""Focused compatibility proofs keep host resources and isolate suite fixtures."""
import os
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def compat_suite_fixtures(ctx):
    scratch = ctx.inst.root / 'temp/compat-suite-fixtures'
    scratch.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [sys.executable, '-m', 'unittest', 'ops.compat.tests.test_focused_fixtures',
         'ops.compat.tests.test_migration_repeat_workspace'],
        cwd=Path(__file__).resolve().parents[2],
        env=dict(os.environ, TMPDIR=str(scratch),
                 COMPAT_MODULE_ROOTS=os.pathsep.join(sorted(set(ctx.inst.config['replace'].values())))),
        capture_output=True, text=True, timeout=60,
    )
    ctx.inst.evidence.save('compat-suite-fixtures', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, 'Compatibility suite fixtures: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('regression_compat_suite_fixtures', 'regression', compat_suite_fixtures,
                     issues=('COMPAT-FOCUSED-SUITE-FIXTURES', 'COMPAT-REPLACEMENT-SOURCE-MIRROR',
                             'COMPAT-REPEAT-WORKSPACE-ISOLATION'))]
