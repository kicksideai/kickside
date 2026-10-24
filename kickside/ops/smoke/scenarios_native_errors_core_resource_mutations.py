"""Native resource mutations stop retry after durable writes and retain release causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def mutations(ctx):
    run_focused_module_test(ctx, "kickside/core", "resource_mutations_test")
    run_focused_module_test(ctx, "kickside/core", "resource_mutations_retry_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_resource_mutations", "regression", mutations, issues=("NE-243",), parallel=('native-root:kickside/core',))]
