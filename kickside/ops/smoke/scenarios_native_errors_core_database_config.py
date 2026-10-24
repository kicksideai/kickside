"""Core database configuration failures raise native errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def configuration(ctx):
    run_focused_module_test(ctx, "kickside/core", "database_config_native_test")
    run_focused_module_test(ctx, "kickside/core", "contract_cursor_test")


REGISTRY = [Scenario("native_errors_core_database_config", "regression", configuration, issues=("NE-95",), parallel=('native-root:kickside/core',))]
