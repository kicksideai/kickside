"""Jobs pool startup and capacity keep native dependency policies."""
from harness import Scenario
from module_harness import run_focused_module_test


def pool_boundary(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "pool_boundary_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_claim_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_version_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_drain_test")
    run_focused_module_test(ctx, "kickside/jobs", "pool_registration_and_timers_test")


REGISTRY = [Scenario("native_errors_jobs_pool_boundary", "regression", pool_boundary, issues=("NE-147",), parallel=('native-root:kickside/jobs',))]
