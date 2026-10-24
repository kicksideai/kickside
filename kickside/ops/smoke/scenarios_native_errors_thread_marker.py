"""Thread marker cleanup retains both native failure causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def marker(ctx):
    run_focused_module_test(ctx, "kickside/core", "marker_native_test")
    run_focused_module_test(ctx, "kickside/core", "provision_test")


REGISTRY = [Scenario("native_errors_thread_marker", "regression", marker, issues=("NE-149",), parallel=('native-root:kickside/core',))]
