"""Compile and execute the module test fixtures through fresh harnesses."""
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import run_focused_module_test


def checked_test_types(ctx, component, entries):
    for entry in entries:
        run_focused_module_test(ctx, component, entry)
    root = Path(ctx.inst.config['replace'][component]) / 'test'
    command = [ctx.inst.config['binary'], 'lint']
    done = subprocess.run(command, cwd=root, env=ctx.inst.env, capture_output=True, text=True, timeout=900)
    ctx.inst.evidence.save('test-fixture-types', {'command': command, 'code': done.returncode,
        'output': done.stdout, 'error': done.stderr})
    require(done.returncode == 0, 'Module test types fail: ' + done.stdout + done.stderr)


def core_test_types(ctx):
    checked_test_types(ctx, 'kickside/core', ('boot_test', 'workspace_plugin_test', 'slot_failure_test'))


REGISTRY = [
    Scenario('regression_core_test_types', 'regression', core_test_types, issues=('R5-T01',)),
]


def jobs_test_types(ctx):
    checked_test_types(ctx, 'kickside/jobs', ('owner_retention_test', 'live_cancellation_test'))


def jobs_native_errors(ctx):
    checked_test_types(ctx, 'kickside/jobs', ('worker_supervision_test', 'worker_process_test', 'lifecycle_helpers_test'))


REGISTRY.append(Scenario('regression_jobs_test_types', 'regression', jobs_test_types, issues=('R5-T02',)))
REGISTRY.append(Scenario('regression_jobs_native_errors', 'regression', jobs_native_errors, issues=('NE-11',)))
