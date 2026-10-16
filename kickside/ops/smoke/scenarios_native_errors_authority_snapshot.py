"""Authority snapshot failures retain native causes and permission policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def authority(ctx):
    run_focused_module_test(ctx, "kickside/execution", "authority_native_test")
    run_focused_module_test(ctx, "kickside/execution", "execution_identity_test")


REGISTRY = [Scenario("native_errors_authority_snapshot", "regression", authority, issues=("NE-150",))]
