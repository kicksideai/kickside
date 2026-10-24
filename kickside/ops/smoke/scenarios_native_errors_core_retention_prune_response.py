"""Invalid retention prune SQL proofs stop retrying with stable details."""
from harness import Scenario
from module_harness import run_focused_module_test


def proofs(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_prune_response_test")
    run_focused_module_test(ctx, "kickside/core", "sweeper_missing_result_test")


REGISTRY = [Scenario("native_errors_core_retention_prune_response", "regression", proofs, issues=("NE-102",), parallel=('native-root:kickside/core',))]
