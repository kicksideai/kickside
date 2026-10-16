"""Access context validation and security frames preserve native errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def context_access(ctx):
    for pattern in ("context_access_native_test", "get_access_context_by_meta_test", "context_revision_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_context_access", "regression", context_access, issues=("NE-229",))]
