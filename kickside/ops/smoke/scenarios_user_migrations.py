from harness import Scenario
from module_harness import run_focused_module_test


def canonical_email_migration(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'canonical_email_migration_test')


REGISTRY = [Scenario('regression_users_email_grant_migration', 'regression', canonical_email_migration,
                     issues=('USERS-EMAIL-GRANT-MIGRATION-SCHEMA',))]
