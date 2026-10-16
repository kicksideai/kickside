"""Thread purge preserves native database cleanup failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/core", "purge_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "resource_mutations_test")
    run_focused_module_test(ctx, "kickside/core", "lifecycle_test")

REGISTRY = [Scenario("native_errors_core_purge_cleanup", "regression", cleanup, issues=("NE-288",))]
