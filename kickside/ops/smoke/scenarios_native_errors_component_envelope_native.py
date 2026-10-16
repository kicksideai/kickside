"""Component envelopes preserve native failure policy and cause data."""
from harness import Scenario
from module_harness import run_focused_module_test


def envelope_native(ctx):
    run_focused_module_test(ctx, "kickside/component", "envelope_native_test")
    run_focused_module_test(ctx, "kickside/component", "envelope_test")
    run_focused_module_test(ctx, "kickside/component", "failure_classification_test")
    run_focused_module_test(ctx, "kickside/component", "placement_rules_test")
    run_focused_module_test(ctx, "kickside/contract", "cause_snapshot_test")
    run_focused_module_test(ctx, "kickside/contract", "annotated_error_test")


REGISTRY = [Scenario("native_errors_component_envelope_native", "regression", envelope_native, issues=("NE-193",))]
