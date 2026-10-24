"""Natural key persistence retains native dependency and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def natural_key(ctx):
    run_focused_module_test(ctx, "kickside/core", "natural_key_native_test")
    run_focused_module_test(ctx, "kickside/core", "natural_key_integrity_test")


REGISTRY = [Scenario("native_errors_natural_key", "regression", natural_key, issues=("NE-156",), parallel=('native-root:kickside/core',))]
