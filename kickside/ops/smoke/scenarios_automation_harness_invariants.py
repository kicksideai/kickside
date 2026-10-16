"""Automation harness fresh test-dependency regression guard."""
from harness import Scenario
from module_harness import run_focused_module_test


def automation_harness_invariants(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'install_basics_and_rollback_test', lint=True)
    run_focused_module_test(ctx, 'kickside/automation', 'ledger_order_test')
    run_focused_module_test(ctx, 'kickside/automation', 'automations_control_test')


REGISTRY = [Scenario('automation_harness_invariants', 'regression', automation_harness_invariants,
                     issues=('WAVE3-AUTOMATION-TEST-DEPENDENCY', 'AUTOMATION-HARNESS-UNDECLARED-DELEGATION'))]
