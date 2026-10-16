"""Lifecycle event bodies use strict native persisted-data decoding."""
from harness import Scenario
from module_harness import run_focused_module_test

def bodies(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'reaper_body_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'reaper_native_test')
    run_focused_module_test(ctx, 'kickside/core', 'reaper_test')

REGISTRY = [Scenario('native_errors_core_reaper_body', 'regression', bodies, issues=('NE-70',))]
