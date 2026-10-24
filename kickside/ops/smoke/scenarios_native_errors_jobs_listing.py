"""Jobs listing preserves native SQL metadata and row-collection proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def listing(ctx):
    run_focused_module_test(ctx, "kickside/jobs", 'jobs_listing_native')
    run_focused_module_test(ctx, "kickside/jobs", "listing_pagination_test")
    run_focused_module_test(ctx, "kickside/jobs", "owner_listing_test")


REGISTRY = [Scenario("native_errors_jobs_listing", "regression", listing, issues=("NE-140",), parallel=('native-root:kickside/jobs',))]
