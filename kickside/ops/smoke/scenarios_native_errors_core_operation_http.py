"""Native projection and retention HTTP operation and pooled cleanup errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def boundary(ctx):
    run_focused_module_test(ctx, "kickside/core", "operation_http_test")
    run_focused_module_test(ctx, "kickside/core", "access_diagnostics_test")


REGISTRY = [Scenario("native_errors_core_operation_http", "regression", boundary, issues=("NE-269",), parallel=('native-root:kickside/core',))]
