"""Process supervision preserves dependency and execution causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def causes(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "supervision_cause_test")
    run_focused_module_test(ctx, "kickside/jobs", "proc_supervision_test")
    run_focused_module_test(ctx, "kickside/jobs", "supervision_pair_test")


REGISTRY = [Scenario("native_errors_jobs_supervision_cause", "regression", causes, issues=("NE-180",))]
