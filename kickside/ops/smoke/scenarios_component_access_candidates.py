"""Component reads authorize only implementations reached by the SQL filters."""
from harness import Scenario
from module_harness import run_focused_module_test


def scoped_implementations(ctx):
    for entry in ('implementation_candidates_test', 'implementation_native_test', 'reader_native_test'):
        run_focused_module_test(ctx, 'kickside/component', entry)


REGISTRY = [Scenario('component_scoped_implementation_candidates', 'regression', scoped_implementations,
                     issues=('COMPONENT-IMPLEMENTATION-GLOBAL-AUTH-SCAN', 'COMPONENT-CANDIDATE-BUILD-RESOURCE-LIFETIME'))]
