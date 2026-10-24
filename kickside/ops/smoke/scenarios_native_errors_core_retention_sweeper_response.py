"""Permanent retention sweeper response failures stop retrying."""
from harness import Scenario
from module_harness import run_focused_module_test


def sweep(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_sweeper_response_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_retention_sweeper_response", "regression", sweep, issues=("NE-105",), parallel=('native-root:kickside/core',))]
