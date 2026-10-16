"""Committed Component failures retain native causes without duplicate effects."""
from harness import Scenario
from module_harness import run_focused_module_test


def committed_retry(ctx):
    for pattern in ("committed_retry_test", "command_cause_test", "binding_tx_native_test", "registration_tx_native_test"):
        run_focused_module_test(ctx, "kickside/component", pattern)


REGISTRY = [Scenario("native_errors_component_committed_retry", "regression", committed_retry, issues=("NE-211",))]
