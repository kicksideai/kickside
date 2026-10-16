"""Teardown preserves transaction cleanup causes before further effects."""
from harness import Scenario
from module_harness import run_focused_module_test


def teardown_tx_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", "teardown_tx_cleanup_test")
    run_focused_module_test(ctx, "kickside/component", "fence_test")


REGISTRY = [Scenario("native_errors_component_teardown_tx_cleanup", "regression", teardown_tx_cleanup, issues=("NE-203",))]
