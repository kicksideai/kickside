"""Component deletion retains native causes and cleanup proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def deletion(ctx):
    run_focused_module_test(ctx, "kickside/component", "delete_native_test")
    run_focused_module_test(ctx, "kickside/component", "placement_test")
    run_focused_module_test(ctx, "kickside/component", "teardown_purge_retry_test")


REGISTRY = [Scenario("native_errors_component_delete", "regression", deletion, issues=("NE-134",))]
