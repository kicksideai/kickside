"""Persisted JSON faults retain native decoder causes and storage classification."""
from harness import Scenario
from module_harness import run_focused_module_test


def causes(ctx):
    run_focused_module_test(ctx, "kickside/contract", "persisted_cause_native_test")
    run_focused_module_test(ctx, "kickside/contract", "persisted_json_test")


REGISTRY = [Scenario("native_errors_contract_persisted_causes", "regression", causes, issues=("NE-141",))]
