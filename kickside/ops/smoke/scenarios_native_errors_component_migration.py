"""Component migration callbacks raise original native SQL failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def callbacks(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'migration_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'meta_unique_migration_test')

REGISTRY = [Scenario('native_errors_component_migration_callbacks', 'regression', callbacks, issues=('NE-72',), parallel=('native-root:kickside/component',))]
