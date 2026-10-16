"""Identity storage errors retain native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test

def identity(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'identity_native_test')

REGISTRY = [Scenario('native_errors_component_identity', 'regression', identity, issues=('NE-81',))]
