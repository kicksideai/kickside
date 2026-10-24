"""Registered component cleanup keeps complete native causes and stops unsafe replay."""
from harness import Scenario
from module_harness import run_focused_module_test


def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/core", "component_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "component_cleanup_retry_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_component_cleanup", "regression", cleanup, issues=("NE-244",), parallel=('native-root:kickside/core',))]
