"""Primary-event authority reads keep native cleanup causes and result proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def release(ctx):
    run_focused_module_test(ctx, "kickside/core", "authorization_release_test")
    run_focused_module_test(ctx, "kickside/core", "thread_event_declarations_test")


REGISTRY = [Scenario("native_errors_core_authorization_release", "regression", release, issues=("NE-251",))]
