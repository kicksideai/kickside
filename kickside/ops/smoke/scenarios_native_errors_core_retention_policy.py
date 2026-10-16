"""Retention policy dependencies retain native error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def policy(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_policy_native_test")
    run_focused_module_test(ctx, "kickside/core", "policy_test")


REGISTRY = [Scenario("native_errors_core_retention_policy", "regression", policy, issues=("NE-86",))]
