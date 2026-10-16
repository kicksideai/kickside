"""Provider icon precedence and deterministic binding fallback preserve display icons."""
from harness import Scenario
from module_harness import run_focused_module_test


def connection_icon_binding_selection(ctx):
    run_focused_module_test(ctx, 'kickside/connection', 'connection_reason_test')


REGISTRY = [Scenario('connection_icon_binding_selection', 'regression', connection_icon_binding_selection,
                     issues=('CONNECTION-PROVIDER-ICON-BINDING-SELECTION', 'CONNECTION-PROVIDER-SOURCE-ICON-FALLBACK'))]
