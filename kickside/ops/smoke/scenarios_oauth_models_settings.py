"""OAuth authorization generations and persisted configuration stay authoritative."""
from harness import Scenario
from module_harness import run_focused_module_test


def oauth_authorization_generation(ctx):
    run_focused_module_test(ctx, 'kickside/oauth', 'refresh_endpoint_test')


def models_secret_decode(ctx):
    run_focused_module_test(ctx, 'kickside/models', 'models_secret_decode_test')
    run_focused_module_test(ctx, 'kickside/models', 'discovery_retains_assignments_test')


def models_reference_vendor(ctx):
    run_focused_module_test(ctx, 'kickside/models', 'reference_openrouter_test')


def settings_override_load(ctx):
    run_focused_module_test(ctx, 'kickside/settings', 'settings_test')


REGISTRY = [
    Scenario('oauth_authorization_generation', 'regression', oauth_authorization_generation,
             issues=('OAUTH-REFRESH-AUTHORIZATION-GENERATION', 'EE2-2445')),
    Scenario('models_secret_decode', 'regression', models_secret_decode,
             issues=('MODELS-PERSISTED-SECRET-DECODE', 'MODELS-PERSISTED-JSON-DECODE', 'MODELS-DISCOVERY-PERSISTENCE-FAILURE', 'MODELS-PROFILE-ERROR-ISOLATION')),
    Scenario('models_reference_vendor', 'regression', models_reference_vendor,
             issues=('MODELS-REFERENCE-VENDOR-IDENTITY',)),
    Scenario('settings_override_load', 'regression', settings_override_load,
             issues=('SETTINGS-OVERRIDE-LOAD-FAILURE', 'SETTINGS-FALSE-PREDECESSOR', 'SETTINGS-OVERRIDE-ERROR-ISOLATION')),
]
