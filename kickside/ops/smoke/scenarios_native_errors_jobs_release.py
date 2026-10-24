"""Database release failures retain native and operation causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def release(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "release_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_supervision_test")


REGISTRY = [Scenario("native_errors_jobs_release", "regression", release, issues=("NE-182",), parallel=('native-root:kickside/jobs',))]
