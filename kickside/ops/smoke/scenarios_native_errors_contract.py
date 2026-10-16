"""Focused regression coverage for Contract native-error boundaries."""
from pathlib import Path

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test


HERE = Path(__file__).parent
NAMESPACE = 'app.smoke.native_errors_contract'


def install_parameter_probe(ctx):
    inst = ctx.inst
    with ctx.paused():
        fixture = inst.app / 'src' / 'native-errors-contract'
        fixture.mkdir()
        (fixture / 'parameter_probe.lua').write_text(
            (HERE / 'mocks/native_errors_contract/parameter_probe.lua').read_text())
        entries = [
            {'name': 'parameter_probe', 'kind': 'function.lua', 'source': 'file://parameter_probe.lua',
             'method': 'handler', 'modules': ['http'],
             'imports': {'http_params': 'kickside.contract:http_params'}},
            {'name': 'parameter_probe.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/native-errors-contract/parameter-probe',
             'func': NAMESPACE + ':parameter_probe'},
        ]
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))
    ctx.restart()


def contract_parameter_native_error(ctx):
    for entry in ('http_params_test', 'model_failure_test', 'persisted_json_test'):
        run_focused_module_test(ctx, 'kickside/contract', entry)
    install_parameter_probe(ctx)
    for path, message, label in (
        ('/api/v1/native-errors-contract/parameter-probe?limit=0', 'limit must be between 1 and 100', 'contract-native-parameter'),
        ('/api/v1/threads?limit=0', 'limit must be between 1 and 1000', 'core-native-parameter'),
        ('/api/v1/jobs?limit=0', 'limit must be between 1 and 500', 'jobs-native-parameter'),
        ('/api/v1/job-runs?limit=0', 'limit must be between 1 and 500', 'job-runs-native-parameter'),
        ('/api/v1/threads/native-parameter/children?limit=0', 'limit must be between 1 and 1000', 'children-native-parameter'),
        ('/api/v1/threads/native-parameter/graph?limit=0', 'limit must be between 1 and 1000', 'graph-native-parameter'),
        ('/api/v1/threads/native-parameter/events?limit=0', 'limit must be between 1 and 1000', 'events-native-parameter'),
        ('/api/v1/threads/native-parameter/projections?limit=0', 'limit must be between 1 and 500', 'projections-native-parameter'),
    ):
        response = ctx.inst.request('GET', path, expect=(400,), label=label)
        require(response.get('success') is False and response.get('error') == message,
                'Parameter error changes its published envelope: ' + str(response))
        require(response.get('kind') == 'Invalid' and response.get('retryable') is False,
                'Parameter error loses kind or retryability: ' + str(response))
        require(response.get('details') == {'code': 'invalid_query_parameter', 'parameter': 'limit'},
                'Parameter error loses details: ' + str(response))


REGISTRY = [Scenario('contract_parameter_native_error', 'regression', contract_parameter_native_error, ('boot',),
                     issues=('NE-06',), instance_setup=True)]
