"""Jobs migration callbacks raise original native SQL failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def callbacks(ctx):
    run_focused_module_test(ctx, 'kickside/jobs', 'jobs_migration_native')

REGISTRY = [Scenario('native_errors_jobs_migration_callbacks', 'regression', callbacks, issues=('NE-77',))]
