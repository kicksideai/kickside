"""Automation install preflight retains native refusals and dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def install_preflight(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'install_preflight_native_test')
    run_focused_module_test(ctx, 'kickside/automation', 'install_basics_and_rollback_test')


REGISTRY = [Scenario('native_errors_automation_install_preflight', 'regression', install_preflight,
                     issues=('NE-59', 'NE-60'), parallel=('native-root:kickside/automation',))]
