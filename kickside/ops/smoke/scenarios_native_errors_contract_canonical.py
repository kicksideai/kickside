"""Canonical codec dependencies retain native error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def canonical(ctx):
    run_focused_module_test(ctx, "kickside/contract", "canonical_native_test")
    run_focused_module_test(ctx, "kickside/contract", "canonical_json_test")


REGISTRY = [Scenario("native_errors_contract_canonical", "regression", canonical, issues=("NE-84",), parallel=('native-root:kickside/contract',))]
