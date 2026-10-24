"""Lifecycle reaper retains structured cleanup failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def cleanup(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'reaper_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'reaper_test')

REGISTRY = [Scenario('native_errors_core_lifecycle_reaper', 'regression', cleanup, issues=('NE-67',), parallel=('native-root:kickside/core',))]
