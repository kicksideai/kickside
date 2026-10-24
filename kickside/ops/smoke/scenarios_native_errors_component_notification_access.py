"""Component notification access normalization preserves native failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def notification_access(ctx):
    run_focused_module_test(ctx, "kickside/component", "notification_access_native_test")
    run_focused_module_test(ctx, "kickside/component", "notify_access_test")


REGISTRY = [Scenario("native_errors_component_notification_access", "regression", notification_access, issues=("NE-223",), parallel=('native-root:kickside/component',))]
