"""Declaration and creation serialization preserve native failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def declaration_serialization(ctx):
    run_focused_module_test(ctx, "kickside/component", "declaration_serial_native_test")
    run_focused_module_test(ctx, "kickside/component", "declaration_state_test")


REGISTRY = [Scenario("native_errors_component_declaration_serialization", "regression", declaration_serialization, issues=("NE-215",), parallel=('native-root:kickside/component',))]
