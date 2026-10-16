"""Component contract opening retains native runtime failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def contract_open(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'contract_open_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'context_revision_test')


REGISTRY = [Scenario('native_errors_component_contract_open', 'regression', contract_open,
                     issues=('NE-61',))]
