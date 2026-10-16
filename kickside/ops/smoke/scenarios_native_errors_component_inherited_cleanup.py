"""Inherited cleanup annotations retain native classification and metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def inherited_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", "inherited_cleanup_native_test")
    run_focused_module_test(ctx, "kickside/component", "system_delete_native_test")
    run_focused_module_test(ctx, "kickside/component", "fence_test")


REGISTRY = [Scenario("native_errors_component_inherited_cleanup", "regression", inherited_cleanup, issues=("NE-204",))]
