"""Native thread completion keeps read failures and complete purge causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def attachment(ctx):
    run_focused_module_test(ctx, "kickside/core", "attachment_errors_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_attachment_errors", "regression", attachment, issues=("NE-245",))]
