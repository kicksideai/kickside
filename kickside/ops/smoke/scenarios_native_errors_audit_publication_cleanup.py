"""Identity audit publication retains native connection release errors."""
from harness import Scenario
from module_harness import run_focused_module_test

def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/core", "audit_publication_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "audit_publication_native_test")
    run_focused_module_test(ctx, "kickside/core", "audit_publication_response_test")
    run_focused_module_test(ctx, "kickside/core", "lifecycle_test")

REGISTRY = [Scenario("native_errors_core_audit_publication_cleanup", "regression", cleanup, issues=("NE-291",))]
