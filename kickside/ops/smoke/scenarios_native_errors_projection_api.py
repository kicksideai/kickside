"""Projection contract boundaries retain native SQL and cleanup errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def projection_api(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_api_native_test")
    run_focused_module_test(ctx, "kickside/core", "projection_api_retry_test")
    run_focused_module_test(ctx, "kickside/core", "projection_catchup_address_test")


REGISTRY = [Scenario("native_errors_projection_api", "regression", projection_api, issues=("NE-151",), parallel=('native-root:kickside/core',))]
