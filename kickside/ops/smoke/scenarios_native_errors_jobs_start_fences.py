"""Jobs child-start and unstarted-release fences preserve native causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def start_fences(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "start_fence_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_recycle_test")


REGISTRY = [Scenario("native_errors_jobs_start_fences", "regression", start_fences, issues=("NE-137",), parallel=('native-root:kickside/jobs',))]
