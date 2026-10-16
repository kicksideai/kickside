"""Update batches preserve native failures and committed retry policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def update_transactions(ctx):
    run_focused_module_test(ctx, "kickside/component", "update_tx_native_test")
    run_focused_module_test(ctx, "kickside/component", "committed_retry_test")
    run_focused_module_test(ctx, "kickside/component", "context_revision_test")
    run_focused_module_test(ctx, "kickside/component", "lifecycle_seam_test")


REGISTRY = [Scenario("native_errors_component_update_transactions", "regression", update_transactions, issues=("NE-224",))]
