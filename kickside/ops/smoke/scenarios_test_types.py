"""Compile and execute the module test fixtures through fresh harnesses."""
from harness import Scenario
from module_harness import run_focused_module_test


def checked_test_types(ctx, component, entries):
    for index, entry in enumerate(entries):
        run_focused_module_test(ctx, component, entry, lint=index == 0)


def core_test_types(ctx):
    checked_test_types(ctx, 'kickside/core', ('boot_test', 'workspace_plugin_test', 'slot_failure_test'))


REGISTRY = [
    Scenario('regression_core_test_types', 'regression', core_test_types,
             issues=('R5-T01', 'SMOKE-FRESH-TEST-TYPE-LINT')),
]


def jobs_test_types(ctx):
    checked_test_types(ctx, 'kickside/jobs', ('owner_retention_test', 'live_cancellation_test'))


def jobs_native_errors(ctx):
    checked_test_types(ctx, 'kickside/jobs', ('worker_supervision_test', 'worker_process_test', 'lifecycle_helpers_test'))


REGISTRY.append(Scenario('regression_jobs_test_types', 'regression', jobs_test_types,
                        issues=('R5-T02', 'SMOKE-FRESH-TEST-TYPE-LINT')))
REGISTRY.append(Scenario('regression_jobs_native_errors', 'regression', jobs_native_errors,
                        issues=('NE-11', 'SMOKE-FRESH-TEST-TYPE-LINT')))
