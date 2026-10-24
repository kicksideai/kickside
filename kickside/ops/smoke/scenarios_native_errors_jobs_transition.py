"""Lifecycle transitions retain native policy, rollback causes and fenced counts."""
from harness import Scenario
from module_harness import run_focused_module_test


def transition(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "transition_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_revocation_test")


REGISTRY = [Scenario("native_errors_jobs_transition", "regression", transition, issues=("NE-172",), parallel=('native-root:kickside/jobs',))]
