"""Permanent receipt purge proof failures stop retrying."""
from harness import Scenario
from module_harness import run_focused_module_test


def purge(ctx):
    run_focused_module_test(ctx, "kickside/core", "receipt_purge_response_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_receipt_purge_response", "regression", purge, issues=("NE-106",))]
