"""Deferred event resync retains and revalidates operator authority."""
from harness import Scenario
from module_harness import run_focused_module_test


def resync_authority(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'resync_authority_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_control_test_3')


REGISTRY = [Scenario('automation_resync_operator_authority', 'regression', resync_authority,
                     issues=('AUTOMATION-RESYNC-OPERATOR-AUTHORITY',))]
