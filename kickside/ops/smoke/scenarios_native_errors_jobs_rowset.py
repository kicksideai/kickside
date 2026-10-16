"""SQL row collections require dense table rows before reaching Jobs consumers."""
from harness import Scenario
from module_harness import run_focused_module_test


def rowset(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "rowset_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "execute_job_routing_test")


REGISTRY = [Scenario("native_errors_jobs_rowset", "regression", rowset, issues=("NE-173",))]
