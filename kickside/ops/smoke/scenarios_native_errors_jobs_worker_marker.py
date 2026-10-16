"""Worker assignment-marker failures retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def marker(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_marker_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_completion_test")


REGISTRY = [Scenario("native_errors_jobs_worker_marker", "regression", marker, issues=("NE-88",))]
