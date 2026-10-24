"""Native child exits preserve classification and retry metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def child_exit(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "child_exit_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "child_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_supervision_test")


REGISTRY = [Scenario("native_errors_jobs_child_exit", "regression", child_exit, issues=("NE-184",), parallel=('native-root:kickside/jobs',))]
