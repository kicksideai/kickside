"""Native job child startup errors retain cleanup causes and mandatory proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def startup(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "job_child_startup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "execute_job_routing_test")
    run_focused_module_test(ctx, "kickside/jobs", "loop_test")


REGISTRY = [Scenario("native_errors_jobs_child_startup", "regression", startup, issues=("NE-278",))]
