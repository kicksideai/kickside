"""Awaited job catalog retains native registry failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def catalog(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "awaited_catalog_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_claim_test")


REGISTRY = [Scenario("native_errors_jobs_awaited_catalog", "regression", catalog, issues=("NE-143",), parallel=('native-root:kickside/jobs',))]
