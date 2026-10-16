"""Lifecycle boot retains native refusals in direct and monitored exits."""
from harness import Scenario
from module_harness import run_focused_module_test


def boot(ctx):
    run_focused_module_test(ctx, "kickside/core", "lifecycle_boot_native_test")
    run_focused_module_test(ctx, "kickside/core", "provision_test")


REGISTRY = [Scenario("native_errors_core_lifecycle_boot", "regression", boot, issues=("NE-282",))]
