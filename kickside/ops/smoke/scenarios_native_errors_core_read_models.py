"""Committed read-model dependency failures preserve native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def models(ctx):
    run_focused_module_test(ctx, "kickside/core", "read_model_native_test")
    run_focused_module_test(ctx, "kickside/core", "provision_test")


REGISTRY = [Scenario("native_errors_core_read_models", "regression", models, issues=("NE-113",))]
