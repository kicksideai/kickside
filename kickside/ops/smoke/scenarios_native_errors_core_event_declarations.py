"""Event declaration dependency failures retain native fields and domain causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def declarations(ctx):
    run_focused_module_test(ctx, "kickside/core", "event_declarations_test")
    run_focused_module_test(ctx, "kickside/core", "thread_event_declarations_test")


REGISTRY = [Scenario("native_errors_core_event_declarations", "regression", declarations, issues=("NE-250",), parallel=('native-root:kickside/core',))]
