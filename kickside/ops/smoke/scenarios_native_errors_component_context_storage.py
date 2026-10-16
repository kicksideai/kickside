"""Private context storage retains native failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def context_storage(ctx):
    run_focused_module_test(ctx, "kickside/component", "context_storage_native_test")
    run_focused_module_test(ctx, "kickside/component", "patch_context_test")
    run_focused_module_test(ctx, "kickside/component", "context_revision_test")


REGISTRY = [Scenario("native_errors_component_context_storage", "regression", context_storage, issues=("NE-213",))]
