"""Declared component cleanup setup preserves native failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def cleanup_setup(ctx):
    run_focused_module_test(ctx, "kickside/component", "cleanup_setup_test")
    run_focused_module_test(ctx, "kickside/component", "teardown_purge_retry_test")


REGISTRY = [Scenario("native_errors_component_cleanup_setup", "regression", cleanup_setup, issues=("NE-192",))]
