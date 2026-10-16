"""Public Jobs database scopes preserve native failure and release policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def scope(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "scope_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "scope_native_retry_test")


REGISTRY = [Scenario("native_errors_jobs_scope", "regression", scope, issues=("NE-167",))]
