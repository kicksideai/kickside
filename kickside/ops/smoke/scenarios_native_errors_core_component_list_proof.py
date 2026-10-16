"""Thread component listing rejects missing or malformed authority page proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def pages(ctx):
    run_focused_module_test(ctx, "kickside/core", "component_list_proof_test")
    run_focused_module_test(ctx, "kickside/core", "job_scope_pagination_test")


REGISTRY = [Scenario("native_errors_core_component_list_proof", "regression", pages, issues=("NE-253",))]
