"""Component access persistence preserves native dependency causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def access_causes(ctx):
    run_focused_module_test(ctx, "kickside/component", "access_cause_test")
    run_focused_module_test(ctx, "kickside/component", 'share_subject_test')
    run_focused_module_test(ctx, "kickside/component", "effective_access_test")


REGISTRY = [Scenario("native_errors_component_access_causes", "regression", access_causes, issues=("NE-191",), parallel=('native-root:kickside/component',))]
