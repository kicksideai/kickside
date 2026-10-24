"""Implementation visibility preserves native SQL failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def visibility(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'implementation_native_test')

REGISTRY = [Scenario('native_errors_component_implementation', 'regression', visibility, issues=('NE-79',), parallel=('native-root:kickside/component',))]
