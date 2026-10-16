"""Generic action refusals expose native classifications."""
from harness import Scenario
from module_harness import run_focused_module_test


def action_errors(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'action_native_validation_test')
    run_focused_module_test(ctx, 'kickside/automation', 'actions_error_test')
    run_focused_module_test(ctx, 'kickside/automation', 'generic_actions_test')


REGISTRY = [Scenario('native_errors_automation_action_validation', 'regression', action_errors,
                     issues=('NE-55', 'NE-56'))]
