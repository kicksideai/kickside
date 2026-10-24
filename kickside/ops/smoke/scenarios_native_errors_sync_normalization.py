"""Sync declaration normalization retains native metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def sync_normalization_errors(ctx):
    run_focused_module_test(ctx, 'kickside/sync', 'sync_native_validation_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')


REGISTRY = [Scenario('native_errors_sync_normalization', 'regression', sync_normalization_errors,
                     issues=('NE-42',), parallel=('native-root:kickside/sync',))]
