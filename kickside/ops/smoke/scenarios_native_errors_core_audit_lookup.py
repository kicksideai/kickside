"""Lifecycle audit lookup preserves native fields and canonical authority proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/core", "audit_lookup_test")
    run_focused_module_test(ctx, "kickside/core", "contract_lifecycle_test")


REGISTRY = [Scenario("native_errors_core_audit_lookup", "regression", outcomes, issues=("NE-261",), parallel=('native-root:kickside/core',))]
