"""Worker settlement retains native dependencies and failed rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def worker_completion(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_completion_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "claim_dispatch_finalize_test")


REGISTRY = [Scenario("native_errors_worker_completion", "regression", worker_completion, issues=("NE-155",), parallel=('native-root:kickside/jobs',))]
