"""Metadata transactions preserve native failures and committed retry policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def metadata_transactions(ctx):
    run_focused_module_test(ctx, "kickside/component", "metadata_tx_native_test")
    run_focused_module_test(ctx, "kickside/component", "committed_retry_test")
    run_focused_module_test(ctx, "kickside/component", "lifecycle_seam_test")


REGISTRY = [Scenario("native_errors_component_metadata_transactions", "regression", metadata_transactions, issues=("NE-222",))]
