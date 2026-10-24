"""Natural upsert connections preserve native cleanup failures."""
from harness import Scenario
from module_harness import run_focused_module_test

def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "sql_transaction_boundary_test")
    run_focused_module_test(ctx, "kickside/core", "natural_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "natural_key_integrity_test")

REGISTRY = [Scenario("native_errors_core_natural_cleanup", "regression", cleanup, issues=("NE-285",), parallel=('native-root:kickside/core', 'native-root:kickside/jobs'))]
