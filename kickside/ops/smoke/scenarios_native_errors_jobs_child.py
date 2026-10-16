"""Worker child supervision preserves native dependency causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def child(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "child_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_supervision_test")
    run_focused_module_test(ctx, "kickside/jobs", "child_termination_test")


REGISTRY = [Scenario("native_errors_jobs_child", "regression", child, issues=("NE-179",))]
