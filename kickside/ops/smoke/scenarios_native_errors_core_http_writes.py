"""Thread mutation HTTP responses retain native metadata and unchanged successful JSON."""
from harness import Scenario
from module_harness import run_focused_module_test


def writes(ctx):
    run_focused_module_test(ctx, "kickside/core", "http_write_native_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_http_writes", "regression", writes, issues=("NE-247",), parallel=('native-root:kickside/core',))]
