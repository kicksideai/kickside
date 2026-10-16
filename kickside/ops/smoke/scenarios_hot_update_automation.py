"""Focused module-harness regression for automation hot-update behavior."""
from harness import Scenario


def hot_update_automation_watcher_name(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/automation', 'registry_native_test', timeout=900)


REGISTRY = [
    Scenario('hot_update_automation_watcher_name', 'regression', hot_update_automation_watcher_name,
             issues=('HOT-UPDATE-AUTOMATION-WATCHER-NAME',)),
]
