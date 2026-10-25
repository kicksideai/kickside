"""Token stores resolve environment signing keys before boot configuration decode."""

from harness import Scenario
from module_harness import _private_suite_root, run_focused_app_test


def tokenstore_boot_env_signing(ctx):
    root = _private_suite_root() / 'ops/smoke/fixtures/runtime-tokenstore-env'
    run_focused_app_test(ctx, root, 'tokenstore_boot_env_test')


REGISTRY = [Scenario('runtime_tokenstore_boot_env_signing', 'regression', tokenstore_boot_env_signing,
                     issues=('RUNTIME-TOKENSTORE-BOOT-ENV-SIGNING',))]


def unsigned_token_signing_continuity(ctx):
    root = _private_suite_root() / 'ops/smoke/fixtures/runtime-tokenstore-env'
    run_focused_app_test(ctx, root, 'unsigned_token_transition_test')


REGISTRY.append(Scenario('runtime_unsigned_token_signing_continuity', 'regression',
    unsigned_token_signing_continuity, issues=('RUNTIME-UNSIGNED-TOKEN-SIGNING-CONTINUITY',)))


from scenarios_unsigned_token_transition import role_transition


browser_unsigned_token_signing_continuity = role_transition('admin')


REGISTRY.append(Scenario('browser_unsigned_token_signing_continuity', 'regression',
    browser_unsigned_token_signing_continuity, ('boot',), instance_setup=True,
    issues=('RUNTIME-UNSIGNED-TOKEN-SIGNING-CONTINUITY', 'HOST-UNBOUND-AUTH-EXPIRY-CALLBACK')))
