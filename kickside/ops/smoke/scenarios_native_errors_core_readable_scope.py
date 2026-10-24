"""Readable thread mapping preserves native SQL and pooled release failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def scope(ctx):
    run_focused_module_test(ctx, "kickside/core", "readable_scope_test")
    run_focused_module_test(ctx, "kickside/core", "job_scope_pagination_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_readable_scope", "regression", scope, issues=("NE-254",), parallel=('native-root:kickside/core',))]
