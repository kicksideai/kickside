"""Opaque automation configuration requires the execution subject's authority."""
from harness import Scenario
from module_harness import run_focused_module_test


def transform_authority(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'declaration_writer_test')
    run_focused_module_test(ctx, 'kickside/sync', 'sync_kind_test')


REGISTRY = [Scenario('automation_transform_authority', 'regression', transform_authority,
                     issues=('AUTOMATION-OPAQUE-DECLARATION-AUTHORITY',))]
