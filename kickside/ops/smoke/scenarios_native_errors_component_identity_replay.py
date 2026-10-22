"""Execution-identity replay preserves native read failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_replay(ctx):
    run_focused_module_test(ctx, "kickside/component", "identity_replay_native_test")
    run_focused_module_test(ctx, "kickside/component", 'tsplit_ops_test_set_execution_identity_fence')


REGISTRY = [Scenario("native_errors_component_identity_replay", "regression", identity_replay, issues=("NE-217", "COMPONENT-IDENTITY-REPLAY-GENERATION"))]
