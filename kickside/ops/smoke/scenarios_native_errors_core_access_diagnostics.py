"""Thread access diagnostics retain native fields through seven HTTP boundaries."""
from harness import Scenario
from module_harness import run_focused_module_test


def diagnostics(ctx):
    run_focused_module_test(ctx, "kickside/core", "access_diagnostics_test")
    run_focused_module_test(ctx, "kickside/core", "projection_retention_http_test")
    run_focused_module_test(ctx, "kickside/core", "thread_access_test")


REGISTRY = [Scenario("native_errors_core_access_diagnostics", "regression", diagnostics, issues=("NE-262",))]
