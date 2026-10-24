"""Process worker failures retain native classification and metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcome(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "dispatch_outcome_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_process_test")
    run_focused_module_test(ctx, "kickside/jobs", "proc_supervision_test")


REGISTRY = [Scenario("native_errors_jobs_dispatch_outcome", "regression", outcome, issues=("NE-185",), parallel=('native-root:kickside/jobs',))]
