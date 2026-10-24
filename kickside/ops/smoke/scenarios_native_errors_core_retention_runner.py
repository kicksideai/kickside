"""Retention pass errors retain native fields and permanent responses stop retrying."""
from harness import Scenario
from module_harness import run_focused_module_test


def retention_pass(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_runner_native_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_retention_runner", "regression", retention_pass, issues=("NE-98",), parallel=('native-root:kickside/core',))]
