"""Jobs pool notification dependencies retain native error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def nudge(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "pool_nudge_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "wake_recovery_test")


REGISTRY = [Scenario("native_errors_jobs_pool_nudge", "regression", nudge, issues=("NE-87",), parallel=('native-root:kickside/jobs',))]
