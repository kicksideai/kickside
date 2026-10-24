"""Committed thread attachment keeps native postcommit failures permanent."""
from harness import Scenario
from module_harness import run_focused_module_test

def completion(ctx):
    run_focused_module_test(ctx, "kickside/core", "attachment_completion_test")
    run_focused_module_test(ctx, "kickside/core", "attachment_completion_retry_test")
    run_focused_module_test(ctx, "kickside/core", "resource_cleanup_test")
    run_focused_module_test(ctx, "kickside/core", "thread_event_declarations_test")

REGISTRY = [Scenario("native_errors_core_attachment_completion", "regression", completion, issues=("NE-290",), parallel=('native-root:kickside/core',))]
