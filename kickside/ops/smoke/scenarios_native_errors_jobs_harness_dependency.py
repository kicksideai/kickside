"""Core harnesses resolve their test runner independently of production dependencies."""
from harness import Scenario
from module_harness import run_focused_module_test


def packaging(ctx):
    for component in ("kickside/jobs", "kickside/core", "kickside/component"):
        run_focused_module_test(ctx, component, "packaging_test")


REGISTRY = [Scenario("native_errors_jobs_harness_dependency", "regression", packaging, issues=("NE-111",), parallel=('native-root:kickside/component', 'native-root:kickside/core', 'native-root:kickside/jobs'))]
