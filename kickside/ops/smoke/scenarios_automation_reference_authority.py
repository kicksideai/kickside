"""Reconfigure validates retained resource grants for the operator."""
from harness import Scenario
from module_harness import run_focused_module_test


def reference_authority(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'declaration_writer_test')
    run_focused_module_test(ctx, 'kickside/automation', 'recurring_test')


REGISTRY = [Scenario('automation_reconfigure_reference_authority', 'regression', reference_authority,
                     issues=('AUTOMATION-RECONFIGURE-RETAINED-REFERENCE-AUTHORITY',))]
