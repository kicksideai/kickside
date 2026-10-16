"""Registry failures retain native fields and snapshot resolution stays current."""
from harness import Scenario
from module_harness import run_focused_module_test


def registry_errors(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'registry_native_test')
    run_focused_module_test(ctx, 'kickside/automation', 'catalog_snapshot_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')


REGISTRY = [Scenario('native_errors_automation_registry', 'regression', registry_errors,
                     issues=('NE-52', 'NE-53', 'NE-54'))]
