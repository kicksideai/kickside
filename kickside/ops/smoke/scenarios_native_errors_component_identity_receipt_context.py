"""Identity receipt readers report corrupt stored private context."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_receipt_context(ctx):
    run_focused_module_test(ctx, "kickside/component", "identity_receipt_context_test")
    run_focused_module_test(ctx, "kickside/component", "identity_native_test")


REGISTRY = [Scenario("native_errors_component_identity_receipt_context", "regression", identity_receipt_context, issues=("NE-221",))]
