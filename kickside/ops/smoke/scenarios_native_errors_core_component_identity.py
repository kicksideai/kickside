"""Component execution identity loading keeps native validation failures and proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def identities(ctx):
    run_focused_module_test(ctx, "kickside/core", "component_identity_errors_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_component_identity", "regression", identities, issues=("NE-246",), parallel=('native-root:kickside/core',))]
