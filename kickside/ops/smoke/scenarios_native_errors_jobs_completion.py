"""Fenced Jobs completion retains native dependency failure fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def completion_fields(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "completion_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_completion_test")
    run_focused_module_test(ctx, "kickside/jobs", "completion_contract_test")


REGISTRY = [Scenario("native_errors_jobs_completion", "regression", completion_fields, issues=("NE-133",), parallel=('native-root:kickside/jobs',))]
