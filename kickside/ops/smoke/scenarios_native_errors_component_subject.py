"""Share subject normalization retains native fields through subtree bindings."""
from harness import Scenario
from module_harness import run_focused_module_test


def subjects(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'share_subject_native_test')
    run_focused_module_test(ctx, 'kickside/component', 'share_subject_test')


REGISTRY = [Scenario('native_errors_component_share_subject', 'regression', subjects,
                     issues=('NE-62',))]
