"""Component admission retains authenticated restrictions and identity provenance."""
from harness import Scenario
from module_harness import run_focused_module_test


def component_creation_identity(ctx):
    run_focused_module_test(ctx, "kickside/component", "canonical_register_test")
    run_focused_module_test(ctx, "kickside/component", "ops_test")
    run_focused_module_test(ctx, "kickside/component", "placement_writer_native_test")
    run_focused_module_test(ctx, "kickside/automation", "declaration_writer_test")


REGISTRY = [Scenario("component_creation_identity", "regression", component_creation_identity,
                     issues=("COMPONENT-CAPTURED-CREATION-IDENTITY",))]
