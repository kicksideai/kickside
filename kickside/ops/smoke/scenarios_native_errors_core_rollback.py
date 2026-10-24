"""Secondary transaction failures preserve both native causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def rollback(ctx):
    run_focused_module_test(ctx, "kickside/contract", "secondary_error_test")
    run_focused_module_test(ctx, "kickside/core", "receipt_purge_rollback_test")
    run_focused_module_test(ctx, "kickside/core", "control_error_test")


REGISTRY = [Scenario("native_errors_core_rollback", "regression", rollback, issues=("NE-107",), parallel=('native-root:kickside/contract', 'native-root:kickside/core'))]
