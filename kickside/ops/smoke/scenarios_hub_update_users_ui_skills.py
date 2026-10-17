"""Stored password hashes survive updates from earlier releases."""
from harness import Scenario
from module_harness import run_focused_module_test


def credentials(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'password_formats_test')


REGISTRY = [
    Scenario('hub_update_password_hashes', 'regression', credentials,
             issues=('USERS-PUBLISHED-PASSWORD-HASH-UPDATE',)),
]
