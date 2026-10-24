"""Component listing validation retains native refusal metadata."""
from harness import Scenario
from module_harness import run_focused_module_test

def listing(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'list_validation_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'list_access_level_test')
    run_focused_module_test(ctx, 'kickside/component', 'failure_classification_test')

REGISTRY = [Scenario('native_errors_component_list_validation', 'regression', listing, issues=('NE-66',), parallel=('native-root:kickside/component',))]
