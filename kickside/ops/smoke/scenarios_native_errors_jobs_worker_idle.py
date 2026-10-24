"""Native worker idle-offer send capability retains SDK failure fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def boundary(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_idle_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_process_test")


REGISTRY = [Scenario("native_errors_jobs_worker_idle", "regression", boundary, issues=("NE-271",), parallel=('native-root:kickside/jobs',))]
