"""Delete retry scanning surfaces native release errors before later deletion."""
from harness import Scenario
from module_harness import run_focused_module_test


def retry_release(ctx):
    run_focused_module_test(ctx, "kickside/component", "retry_release_native_test")
    run_focused_module_test(ctx, "kickside/component", 'component_pending_delete_native')


REGISTRY = [Scenario("native_errors_component_retry_release", "regression", retry_release, issues=("NE-200",))]
