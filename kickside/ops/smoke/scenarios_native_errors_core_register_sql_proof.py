"""Native proof distinguishes absent registration replies from confirmed SQL outcomes."""
from harness import Scenario
from module_harness import run_focused_module_test


def proof(ctx):
    run_focused_module_test(ctx, "kickside/core", "register_sql_proof_test")
    run_focused_module_test(ctx, "kickside/core", "projection_register_native_test")
    run_focused_module_test(ctx, "kickside/core", "register_completion_test")


REGISTRY = [Scenario("native_errors_core_register_sql_proof", "regression", proof, issues=("NE-268",))]
