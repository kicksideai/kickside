"""Execution authority rejects missing constructor grants and failed builders."""
from harness import Scenario
from module_harness import run_focused_module_test


def authorizer_constructor(ctx):
    run_focused_module_test(ctx, "kickside/execution", "tsplit_execution_identity_test_execution_live_authority")


def subject_builder(ctx):
    run_focused_module_test(ctx, "kickside/users", "users_directory_scope_resolution_test")


REGISTRY = [
    Scenario("execution_authorizer_constructor_grant", "regression", authorizer_constructor,
             issues=("EXECUTION-AUTHORIZER-CONSTRUCTOR-GRANT",)),
    Scenario("users_subject_builder_result", "regression", subject_builder,
             issues=("USERS-SUBJECT-BUILDER-RESULT",)),
]
