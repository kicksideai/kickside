"""Run history boundaries preserve native causes and bounded row proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def history(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "run_history_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "run_history_reclaim_test")


REGISTRY = [Scenario("native_errors_jobs_run_history", "regression", history, issues=("NE-171",), parallel=('native-root:kickside/jobs',))]
