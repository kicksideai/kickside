"""Portable shell export retains native dependency and codec fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def portable_json(ctx):
    run_focused_module_test(ctx, "kickside/component", "portable_json_native_test")
    run_focused_module_test(ctx, "kickside/component", "base_portable_test")


REGISTRY = [Scenario("native_errors_component_portable_json", "regression", portable_json, issues=("NE-206",))]
