"""Cursor waiter dependency failures retain native policies and details."""
from harness import Scenario
from module_harness import run_focused_module_test


def cursor_waiter(ctx):
    run_focused_module_test(ctx, "kickside/core", "cursor_waiter_native_test")
    run_focused_module_test(ctx, "kickside/core", "cursor_waiter_shutdown_test")
    run_focused_module_test(ctx, "kickside/core", "cursor_waiter_upgrade_test")


REGISTRY = [Scenario("native_errors_cursor_waiter", "regression", cursor_waiter, issues=("NE-153",))]
