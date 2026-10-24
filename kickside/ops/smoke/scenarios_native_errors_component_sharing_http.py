"""Sharing and adoption HTTP operations retain complete native errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def boundary(ctx):
    run_focused_module_test(ctx, "kickside/component", "sharing_http_native_test")
    run_focused_module_test(ctx, "kickside/component", "api_context_error_test")
    run_focused_module_test(ctx, "kickside/component", "trusted_read_guard_test")


REGISTRY = [Scenario("native_errors_component_sharing_http", "regression", boundary, issues=("NE-270",), parallel=('native-root:kickside/component',))]
