"""Trusted Component teardown retains native failure policy and causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def system_delete(ctx):
    run_focused_module_test(ctx, "kickside/component", "system_delete_native_test")
    run_focused_module_test(ctx, "kickside/component", "teardown_purge_retry_test")


REGISTRY = [Scenario("native_errors_component_system_delete", "regression", system_delete, issues=("NE-196",), parallel=('native-root:kickside/component',))]
