"""CRM schema failures, receipt integrity, and callable ownership."""
from harness import Scenario
from module_harness import run_focused_module_test


def schema_index_cause(ctx):
    run_focused_module_test(ctx, "kickside/crm", "crm_schema_error_test")


def sink_receipt_integrity(ctx):
    run_focused_module_test(ctx, "kickside/crm", "crm_sink_receipts_test")


def callable_ownership(ctx):
    run_focused_module_test(ctx, "kickside/crm", "crm_callable_owner_test")


REGISTRY = [
    Scenario("crm_schema_index_cause", "regression", schema_index_cause,
             issues=("CRM-SCHEMA-INDEX-CAUSE",)),
    Scenario("crm_sink_receipt_integrity", "regression", sink_receipt_integrity,
             issues=("CRM-SINK-RECEIPT-REFERENCE", "CRM-SINK-REPLAY-DEPENDENCY")),
    Scenario("crm_callable_ownership", "regression", callable_ownership,
             issues=("CRM-CALLABLE-OWNERSHIP",)),
]
