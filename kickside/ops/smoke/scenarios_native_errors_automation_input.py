"""Install and recurring port validation retain native metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def input_errors(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'input_native_validation_test')
    run_focused_module_test(ctx, 'kickside/automation', 'schedule_input_validation_test')
    run_focused_module_test(ctx, 'kickside/automation', 'schedule_public_state_test')
    run_focused_module_test(ctx, 'kickside/automation', 'kickside_automation_recurring')


REGISTRY = [Scenario('native_errors_automation_input_validation', 'regression', input_errors,
                     issues=('NE-57', 'NE-58'))]
