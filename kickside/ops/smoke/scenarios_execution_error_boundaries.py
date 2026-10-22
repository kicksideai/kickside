"""Execution boundaries retain error precedence and infrastructure recovery."""
from harness import Scenario
from module_harness import run_focused_module_test


def automation_errors(ctx):
    run_focused_module_test(ctx, "kickside/automation", "failure_classification_test")
    run_focused_module_test(ctx, "kickside/automation", "recovery_test")


def channel_lookup(ctx):
    run_focused_module_test(ctx, "kickside/channel", "receive_test")


def root_admin(ctx):
    run_focused_module_test(ctx, "kickside/users", "users_directory_scope_resolution_test")


REGISTRY = [
    Scenario("automation_execution_error_boundaries", "regression", automation_errors,
             issues=("AUTOMATION-ERROR-PRECEDENCE", "AUTOMATION-INFRASTRUCTURE-RETRY")),
    Scenario("channel_execution_lookup_error", "regression", channel_lookup,
             issues=("CHANNEL-EXECUTION-LOOKUP-ERROR", "CHANNEL-CONCURRENT-ACTIVITY-FENCE")),
    Scenario("execution_root_admin_classification", "regression", root_admin,
             issues=("EXECUTION-ROOT-ADMIN-CLASSIFICATION",)),
]
