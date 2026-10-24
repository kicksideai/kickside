"""Focused module guards for native structured-error conversion."""
from harness import Scenario, require
from module_harness import run_focused_module_test


def component_validation_errors(ctx):
    run_focused_module_test(ctx, 'kickside/component', 'access_policy_test')
    run_focused_module_test(ctx, 'kickside/component', 'base_portable_test')
    run_focused_module_test(ctx, 'kickside/component', 'failure_classification_test')
    run_focused_module_test(ctx, 'kickside/component', 'api_context_error_test')
    run_focused_module_test(ctx, 'kickside/component', 'envelope_test')
    run_focused_module_test(ctx, 'kickside/skills', 'access_errors_test')
    response = ctx.inst.request('POST', '/api/v1/component-access/share/native-validation',
                                {'subject_id': 'native-subject'}, expect=(400,),
                                label='component-native-share-validation')
    require(response.get('success') is False and
            response.get('error') == 'subject_type is required: one of user, group, service',
            'Component share changes its published validation response: ' + str(response))
    require(response.get('kind') == 'Invalid' and response.get('retryable') is False and
            (response.get('details') or {}).get('code') == 'component_access_invalid',
            'Component share loses native validation fields: ' + str(response))


REGISTRY = [
    Scenario('native_errors_component_validation', 'regression', component_validation_errors,
             ('boot',), issues=('NE-10',), instance_setup=True),
]


def core_endpoint_errors(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'endpoint_resolver_test')


REGISTRY += [
    Scenario('native_errors_core_endpoint', 'regression', core_endpoint_errors,
             issues=('NE-16',), parallel=('native-root:kickside/core',)),
]
