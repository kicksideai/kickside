"""Registry version boundaries retain native causes and validated identities."""
from harness import Scenario
from module_harness import run_focused_module_test


def registry_version(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "registry_version_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "config_boundary_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_version_test")


REGISTRY = [Scenario("native_errors_jobs_registry_version", "regression", registry_version, issues=("NE-189",), parallel=('native-root:kickside/jobs',))]
