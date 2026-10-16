"""Committed identity audit publication preserves native causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def publication(ctx):
    run_focused_module_test(ctx, "kickside/core", "audit_publication_native_test")
    run_focused_module_test(ctx, "kickside/core", "component_lifecycle_test")


REGISTRY = [Scenario("native_errors_core_audit_publication", "regression", publication, issues=("NE-115",))]
