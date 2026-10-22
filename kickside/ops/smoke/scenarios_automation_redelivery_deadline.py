"""Deadline-free ledger work stays due across round clock boundaries."""
from harness import Scenario
from module_harness import run_focused_module_test


def immediate_redelivery_deadline(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'ledger_order_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_authority_test')


REGISTRY = [Scenario('automation_immediate_redelivery_deadline', 'regression', immediate_redelivery_deadline,
                     issues=('AUTOMATION-IMMEDIATE-REDELIVERY-DEADLINE',))]
