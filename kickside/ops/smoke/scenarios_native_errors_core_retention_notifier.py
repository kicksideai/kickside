"""Retention notification preserves native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def notification(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_notifier_native_test")


REGISTRY = [Scenario("native_errors_core_retention_notifier", "regression", notification, issues=("NE-96",), parallel=('native-root:kickside/core',))]
