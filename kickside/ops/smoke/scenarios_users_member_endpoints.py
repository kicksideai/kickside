"""Every Users member endpoint has its native directory capability."""
from harness import Scenario
from module_harness import run_focused_module_test


def users_member_endpoint_coverage(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'module_access_policy')
    run_focused_module_test(ctx, 'kickside/users', 'user_endpoint_policy_test')


REGISTRY = [Scenario('regression_users_member_endpoint_coverage', 'regression', users_member_endpoint_coverage,
                    issues=('USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE',))]
