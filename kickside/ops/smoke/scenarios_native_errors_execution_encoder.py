"""Execution row encoding retains native causes and declaration classification."""
from harness import Scenario
from module_harness import run_focused_module_test


def encoder(ctx):
    run_focused_module_test(ctx, "kickside/execution", "encoder_native_test")
    run_focused_module_test(ctx, "kickside/execution", "execution_identity_test")


REGISTRY = [Scenario("native_errors_execution_encoder", "regression", encoder, issues=("NE-145",), parallel=('native-root:kickside/execution',))]
