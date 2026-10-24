"""Native resource list failures retain cleanup causes and mandatory result proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def listing(ctx):
    run_focused_module_test(ctx, "kickside/core", "resource_list_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_resource_list", "regression", listing, issues=("NE-241",), parallel=('native-root:kickside/core',))]
