"""Identity reads retain native database release failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_read_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/component", "identity_read_cleanup_test")
    run_focused_module_test(ctx, "kickside/component", "identity_native_test")


REGISTRY = [Scenario("native_errors_component_identity_read_cleanup", "regression", identity_read_cleanup, issues=("NE-220",), parallel=('native-root:kickside/component',))]
