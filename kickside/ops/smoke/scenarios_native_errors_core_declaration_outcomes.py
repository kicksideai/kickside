"""Declared projections preserve native causes and mandatory lookup/registration proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/core", "declaration_proof_test")
    run_focused_module_test(ctx, "kickside/core", "thread_projection_declarations_test")


REGISTRY = [Scenario("native_errors_core_declaration_outcomes", "regression", outcomes, issues=("NE-258",))]
