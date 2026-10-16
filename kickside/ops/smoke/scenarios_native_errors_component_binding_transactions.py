"""Adoption and subtree commands use complete native transaction boundaries."""
from harness import Scenario
from module_harness import run_focused_module_test


def binding_transactions(ctx):
    run_focused_module_test(ctx, "kickside/component", "binding_tx_native_test")
    run_focused_module_test(ctx, "kickside/component", "adopt_component_test")
    run_focused_module_test(ctx, "kickside/component", "command_cause_test")


REGISTRY = [Scenario("native_errors_component_binding_transactions", "regression", binding_transactions, issues=("NE-207",))]
