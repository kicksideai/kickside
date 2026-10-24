"""Native thread lookup cleanup preserves release failures and soft read absence."""
from harness import Scenario
from module_harness import run_focused_module_test


def lookup(ctx):
    run_focused_module_test(ctx, "kickside/core", "find_release_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_find_release", "regression", lookup, issues=("NE-240",), parallel=('native-root:kickside/core',))]
