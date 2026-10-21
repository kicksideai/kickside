"""Component identity writes take declaration fences before access rows."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_lock_order(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'component_identity_boundary')


REGISTRY = [Scenario('component_identity_declaration_lock_order', 'regression', identity_lock_order,
                     issues=('COMPONENT-IDENTITY-DECLARATION-LOCK-ORDER',))]
