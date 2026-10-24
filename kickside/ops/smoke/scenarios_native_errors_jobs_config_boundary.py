"""Configuration dependency failures preserve native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def config_boundary(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "config_boundary_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "config_test")


REGISTRY = [Scenario("native_errors_jobs_config_boundary", "regression", config_boundary, issues=("NE-188",), parallel=('native-root:kickside/jobs',))]
