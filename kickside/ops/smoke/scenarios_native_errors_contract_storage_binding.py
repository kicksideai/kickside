"""Contract binding responses preserve their native failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def binding_response(ctx):
    run_focused_module_test(ctx, "kickside/contract", "binding_response_test")


REGISTRY = [Scenario("native_errors_contract_binding", "regression", binding_response, issues=("NE-199",))]
