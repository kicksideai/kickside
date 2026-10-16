"""UI HTTP guards use the Users token store with current subject authority."""
from harness import Scenario
from module_harness import run_focused_module_test


def ui_harness_live_principal(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'branding_storage_test', lint=True)
    run_focused_module_test(ctx, 'kickside/ui', 'nav_broadcast_test')


REGISTRY = [Scenario('ui_harness_live_principal', 'regression', ui_harness_live_principal,
                     issues=('UI-HARNESS-LIVE-PRINCIPAL',))]
