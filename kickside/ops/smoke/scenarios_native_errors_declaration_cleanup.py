"""Existing thread declarations preserve native database cleanup failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/core", "declaration_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "thread_event_declarations_test")
    run_focused_module_test(ctx, "kickside/core", "resource_cleanup_test")

REGISTRY = [Scenario("native_errors_core_declaration_cleanup", "regression", cleanup, issues=("NE-287",))]
