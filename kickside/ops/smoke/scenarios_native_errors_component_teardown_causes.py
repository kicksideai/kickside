"""Component teardown boundaries preserve native dependency causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def teardown_causes(ctx):
    run_focused_module_test(ctx, "kickside/component", "teardown_cause_test")
    run_focused_module_test(ctx, "kickside/component", "teardown_purge_retry_test")


REGISTRY = [Scenario("native_errors_component_teardown_causes", "regression", teardown_causes, issues=("NE-190",))]
