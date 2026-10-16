"""Workflow history preserves native errors and transaction cleanup causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def history_errors(ctx):
    run_focused_module_test(ctx, 'kickside/workflows', 'history_native_errors_test')
    run_focused_module_test(ctx, 'kickside/workflows', 'undo_restart_test')


REGISTRY = [Scenario('workflow_history_native_errors', 'regression', history_errors,
                     issues=('WORKFLOW-NATIVE-HISTORY-ERRORS',))]
