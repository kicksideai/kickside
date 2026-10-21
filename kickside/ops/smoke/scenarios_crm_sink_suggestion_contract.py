"""CRM delivery conflicts and suggestion outputs follow their public contracts."""
from harness import Scenario
from module_harness import run_focused_module_test


def sink_conflicts(ctx):
    run_focused_module_test(ctx, "kickside/crm", "crm_sink_receipt_test")
    run_focused_module_test(ctx, "kickside/crm", "crm_sink_receipts_test")
    run_focused_module_test(ctx, "kickside/crm", "crm_sink_reconciliation_test")


def suggestion_output(ctx):
    run_focused_module_test(ctx, "kickside/crm", "crm_suggestion_output_test")


REGISTRY = [
    Scenario("crm_sink_idempotency_classification", "regression", sink_conflicts,
             issues=("CRM-SINK-IDEMPOTENCY-CLASSIFICATION",)),
    Scenario("crm_resolve_suggestion_output", "regression", suggestion_output,
             issues=("CRM-RESOLVE-SUGGESTION-OUTPUT",)),
]
