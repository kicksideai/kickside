"""Placement primitives preserve native database errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def placement_storage(ctx):
    for pattern in ("placement_storage_native_test", "placement_test", "read_port_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_placement_storage", "regression", placement_storage, issues=("NE-226",))]
