"""Privileged component commands preserve native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def command_causes(ctx):
    run_focused_module_test(ctx, "kickside/component", "command_cause_test")
    run_focused_module_test(ctx, "kickside/component", "declaration_state_test")
    run_focused_module_test(ctx, "kickside/contract", "cleanup_error_test")


REGISTRY = [Scenario("native_errors_component_command_causes", "regression", command_causes, issues=("NE-195",), parallel=('native-root:kickside/component', 'native-root:kickside/contract'))]
