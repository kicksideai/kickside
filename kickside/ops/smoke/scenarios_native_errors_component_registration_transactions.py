"""Registration retains complete native transaction and lifecycle outcomes."""
from harness import Scenario
from module_harness import run_focused_module_test


def registration_transactions(ctx):
    run_focused_module_test(ctx, "kickside/component", "registration_tx_native_test")
    run_focused_module_test(ctx, "kickside/component", "failure_classification_test")


REGISTRY = [Scenario("native_errors_component_registration_transactions", "regression", registration_transactions, issues=("NE-208",))]
