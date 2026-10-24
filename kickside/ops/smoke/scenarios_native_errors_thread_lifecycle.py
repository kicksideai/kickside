"""Lifecycle persistence preserves native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def lifecycle(ctx):
    run_focused_module_test(ctx, "kickside/core", "lifecycle_native_test")
    run_focused_module_test(ctx, "kickside/core", "lifecycle_test")


REGISTRY = [Scenario("native_errors_thread_lifecycle", "regression", lifecycle, issues=("NE-126",), parallel=('native-root:kickside/core',))]
