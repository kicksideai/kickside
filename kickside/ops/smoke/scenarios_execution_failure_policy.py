"""Execution failures retain their classification and recoverable work."""
from harness import Scenario
from module_harness import run_focused_module_test


def classifier(ctx):
    run_focused_module_test(ctx, "kickside/automation", "failure_classification_test")


def recovery(ctx):
    run_focused_module_test(ctx, "kickside/automation", "recovery_test")


def channel_lookup(ctx):
    run_focused_module_test(ctx, "kickside/channel", "receive_test")


def root_admin(ctx):
    run_focused_module_test(ctx, "kickside/users", "users_directory_scope_resolution_test")


REGISTRY = [
    Scenario("execution_classifier_precedence", "regression", classifier,
             issues=("EXECUTION-CLASSIFIER-PRECEDENCE", "AUTOMATION-INFRASTRUCTURE-PARKING")),
    Scenario("automation_infrastructure_command_retention", "regression", recovery,
             issues=("AUTOMATION-INFRASTRUCTURE-PARKING",)),
    Scenario("channel_owner_lookup_failure", "regression", channel_lookup,
             issues=("CHANNEL-OWNER-LOOKUP-ERROR",)),
    Scenario("execution_root_admin_failure_class", "regression", root_admin,
             issues=("IDENTITY-ROOT-ADMIN-CLASS",)),
]
