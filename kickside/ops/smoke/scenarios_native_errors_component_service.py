"""Component service opening retains native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def service_open(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'service_open_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'context_revision_test')

REGISTRY = [Scenario('native_errors_component_service_open', 'regression', service_open, issues=('NE-63',))]
