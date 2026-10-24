"""Core principal resolution retains native failures before thread effects."""
from harness import Scenario
from module_harness import run_focused_module_test


def principals(ctx):
    run_focused_module_test(ctx, "kickside/core", "principal_resolution_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_principal_resolution", "regression", principals, issues=("NE-239",), parallel=('native-root:kickside/core',))]
