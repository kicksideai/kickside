"""Component lifecycle failure envelopes retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test

def lifecycle(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'lifecycle_native_result_test')
    run_focused_module_test(ctx, 'kickside/component', 'lifecycle_seam_test')
    run_focused_module_test(ctx, 'kickside/component', 'envelope_test')

REGISTRY = [Scenario('native_errors_component_lifecycle_result', 'regression', lifecycle, issues=('NE-64', 'NE-65'))]
