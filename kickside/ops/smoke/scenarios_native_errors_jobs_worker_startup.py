"""Worker startup dependencies preserve native failures and release causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def startup(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_startup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_startup_exit_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_idle_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "registry_version_native_test")


REGISTRY = [Scenario("native_errors_jobs_worker_startup", "regression", startup, issues=("NE-273",))]
