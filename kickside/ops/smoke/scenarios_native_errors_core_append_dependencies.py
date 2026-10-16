"""Transactional append keeps native storage and normalization failure fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def append(ctx):
    run_focused_module_test(ctx, "kickside/core", "append_native_test")
    run_focused_module_test(ctx, "kickside/core", "append_test")


REGISTRY = [Scenario("native_errors_core_append_dependencies", "regression", append, issues=("NE-255", "DESIGN-CORE-EVENT-METADATA-COERCION"))]
