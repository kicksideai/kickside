"""Compatibility fixtures use published checkpoints and preserve retired data."""
import os
from pathlib import Path
import subprocess
import sys

from harness import Scenario, require


def migration_fixtures(ctx):
    scratch = ctx.inst.root / 'temp/compat-migration-fixtures'
    scratch.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [sys.executable, '-m', 'unittest', 'ops.compat.tests.test_migrations', 'ops.compat.tests.test_delegation_fixture',
         'ops.compat.tests.test_compare',
         'ops.compat.integration.test_delegation_upgrade',
         'ops.compat.integration.test_retired_data_upgrade'],
        cwd=Path(__file__).resolve().parents[2],
        env=dict(os.environ, TMPDIR=str(scratch),
                 COMPAT_MODULE_ROOTS=os.pathsep.join(sorted(set(ctx.inst.config['replace'].values())))),
        capture_output=True, text=True, timeout=600,
    )
    ctx.inst.evidence.save('compat-migration-fixtures', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
    })
    require(result.returncode == 0, result.stdout + result.stderr)


REGISTRY = [Scenario('regression_compat_migration_fixtures', 'regression', migration_fixtures,
                     issues=('COMPAT-PUBLISHED-MIGRATION-CHECKPOINT',
                             'COMPAT-MIGRATION-PRESERVATION-RECIPES',
                             'COMPAT-IMPLIED-SCHEMA-ALTERNATIVES'))]
