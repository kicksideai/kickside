"""Retention preserves native dependency and transaction errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def retention(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "retention_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "owner_retention_test")


REGISTRY = [Scenario("native_errors_retention", "regression", retention, issues=("NE-159",), parallel=('native-root:kickside/jobs',))]
