"""Supervisor outcomes retain typed causes and bounded lifecycle handling."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcome(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "supervision_outcome_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "supervision_pair_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_supervision_test")


REGISTRY = [Scenario("native_errors_jobs_supervision_outcome", "regression", outcome, issues=("NE-186",))]
