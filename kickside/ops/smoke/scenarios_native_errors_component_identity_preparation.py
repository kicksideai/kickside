"""Identity preparation stops at native actor and access snapshot failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_preparation(ctx):
    run_focused_module_test(ctx, "kickside/component", "identity_prepare_native_test")
    run_focused_module_test(ctx, "kickside/component", 'tsplit_ops_test_set_execution_identity_fence')


REGISTRY = [Scenario("native_errors_component_identity_preparation", "regression", identity_preparation, issues=("NE-216",))]
