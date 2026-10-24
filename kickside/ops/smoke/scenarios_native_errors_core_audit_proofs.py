"""Committed audit publication refuses permanent malformed responses."""
from harness import Scenario
from module_harness import run_focused_module_test


def publication(ctx):
    run_focused_module_test(ctx, "kickside/core", "audit_publication_response_test")


REGISTRY = [Scenario("native_errors_core_audit_proofs", "regression", publication, issues=("NE-116",), parallel=('native-root:kickside/core',))]
