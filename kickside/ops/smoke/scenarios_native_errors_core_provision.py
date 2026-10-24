"""Thread provisioning failures retain native causes through returns and summaries."""
from harness import Scenario
from module_harness import run_focused_module_test


def provision(ctx):
    run_focused_module_test(ctx, "kickside/core", "provision_native_test")
    run_focused_module_test(ctx, "kickside/core", "provision_release_native_test")
    run_focused_module_test(ctx, "kickside/core", "provision_grant_proof_test")
    run_focused_module_test(ctx, "kickside/core", "provision_test")
    run_focused_module_test(ctx, "kickside/core", "thread_provision_race_test")


REGISTRY = [Scenario("native_errors_core_provision", "regression", provision, issues=("NE-118",), parallel=('native-root:kickside/core',))]
