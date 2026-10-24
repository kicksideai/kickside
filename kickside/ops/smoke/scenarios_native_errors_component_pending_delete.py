"""Durable component cleanup preserves native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", 'component_pending_delete_native')
    run_focused_module_test(ctx, "kickside/component", "fence_test")


REGISTRY = [Scenario("native_errors_component_pending_delete", "regression", cleanup, issues=("NE-138",), parallel=('native-root:kickside/component',))]
