"""Native SQL conflict policy controls natural-key retry without text matching."""
from harness import Scenario
from module_harness import run_focused_module_test


def transient(ctx):
    run_focused_module_test(ctx, "kickside/core", "natural_transient_native_test")
    run_focused_module_test(ctx, "kickside/core", "sql_transient_native_probe")
    run_focused_module_test(ctx, "kickside/core", "natural_key_integrity_test")


REGISTRY = [Scenario("native_errors_core_natural_transient", "regression", transient, issues=("NE-284",), parallel=('native-root:kickside/core',))]
