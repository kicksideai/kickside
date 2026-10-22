"""Age-bounded retirement of settled event delivery mappings."""
from harness import Scenario
from module_harness import run_focused_module_test


def settled_event_receipt_retention(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'receipt_retention_test', lint=True)
    run_focused_module_test(ctx, 'kickside/automation', 'recovery_dispatch_test')


REGISTRY = [Scenario('automation_settled_event_receipt_retention', 'regression', settled_event_receipt_retention,
                     issues=('AUTOMATION-SETTLED-EVENT-RECEIPT-RETENTION',))]
