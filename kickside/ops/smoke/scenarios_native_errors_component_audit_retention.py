"""Audit retention preserves native dependency and cleanup outcomes."""
from harness import Scenario
from module_harness import run_focused_module_test


def audit_retention(ctx):
    run_focused_module_test(ctx, "kickside/component", "audit_retention_native_test")
    run_focused_module_test(ctx, "kickside/component", "identity_audit_expiry_test")
    run_focused_module_test(ctx, "kickside/component", "owner_gc_test")


REGISTRY = [Scenario("native_errors_component_audit_retention", "regression", audit_retention, issues=("NE-209",), parallel=('native-root:kickside/component',))]
