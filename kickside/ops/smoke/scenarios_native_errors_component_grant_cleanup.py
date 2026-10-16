"""Principal grant cleanup retains native dependency and cleanup causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def grant_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", "grant_cleanup_native_test")
    run_focused_module_test(ctx, "kickside/component", "access_cause_test")


REGISTRY = [Scenario("native_errors_component_grant_cleanup", "regression", grant_cleanup, issues=("NE-201",))]
