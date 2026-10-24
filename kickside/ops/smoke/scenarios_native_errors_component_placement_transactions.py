"""Placement transactions preserve native failure causes and committed policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def placement_transactions(ctx):
    for pattern in ("placement_tx_native_test", "committed_retry_test", "placement_test", "lifecycle_seam_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_placement_transactions", "regression", placement_transactions, issues=("NE-225",), parallel=('native-root:kickside/component',))]
