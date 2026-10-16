"""Sync source declarations retain native validation and dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def sync_source_errors(ctx):
    run_focused_module_test(ctx, 'kickside/sync', 'sync_source_native_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_dependency_native_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')


REGISTRY = [Scenario('native_errors_sync_source', 'regression', sync_source_errors,
                     issues=('NE-48', 'NE-49'))]
