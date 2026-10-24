"""Permanent retention process startup/report failures stop retrying."""
from harness import Scenario
from module_harness import run_focused_module_test


def retention(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_process_response_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_retention_process_response", "regression", retention, issues=("NE-109",), parallel=('native-root:kickside/core',))]
