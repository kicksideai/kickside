"""Worker dispatch wrappers preserve native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def cause(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "dispatch_cause_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "execute_job_routing_test")
    run_focused_module_test(ctx, "kickside/jobs", "dispatch_context_test")


REGISTRY = [Scenario("native_errors_jobs_dispatch_cause", "regression", cause, issues=("NE-187",))]
