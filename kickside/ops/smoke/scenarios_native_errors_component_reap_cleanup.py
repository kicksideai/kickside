"""Teardown reap cleanup retains native failures and stops subsequent effects."""
from harness import Scenario
from module_harness import run_focused_module_test


def reap_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", "teardown_reap_cleanup_test")
    run_focused_module_test(ctx, "kickside/component", "teardown_cause_test")


REGISTRY = [Scenario("native_errors_component_reap_cleanup", "regression", reap_cleanup, issues=("NE-202",))]
