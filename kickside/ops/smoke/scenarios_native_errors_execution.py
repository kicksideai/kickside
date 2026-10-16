"""Native execution errors retain their structured envelope through HTTP."""
import shutil
from pathlib import Path

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test

HERE = Path(__file__).resolve().parent
NAMESPACE = 'smoke.native_errors_execution'


def install_fixture(ctx):
    inst = ctx.inst
    with ctx.paused():
        fixture = inst.app / 'src' / 'native-errors-execution'
        fixture.mkdir(exist_ok=True)
        shutil.copyfile(HERE / 'mocks/native_errors_execution/trace_boundary.lua', fixture / 'trace_boundary.lua')
        entries = [
            {'name': 'trace_boundary', 'kind': 'function.lua', 'source': 'file://trace_boundary.lua',
             'method': 'normalize', 'modules': ['http'],
             'imports': {'trace': 'kickside.execution:trace'}},
            {'name': 'trace_boundary.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/native-errors/execution/trace',
             'func': NAMESPACE + ':trace_boundary'},
        ]
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))


def native_execution_trace_boundary(ctx):
    run_focused_module_test(ctx, 'kickside/execution', 'execution_identity_test')
    run_focused_module_test(ctx, 'kickside/execution', 'trace_test')
    run_focused_module_test(ctx, 'kickside/channel', 'receive_test')
    run_focused_module_test(ctx, 'kickside/jobs', 'job_enqueue_test')
    run_focused_module_test(ctx, 'kickside/core', 'append_test')
    run_focused_module_test(ctx, 'kickside/knowledge', 'thread_ingest_identity_test')
    install_fixture(ctx)
    inst = ctx.inst
    invalid = inst.request('POST', '/api/v1/native-errors/execution/trace', {'run_id': 'run-only'},
                           expect=(400,), label='native-execution-trace-invalid')
    require(invalid.get('success') is False, 'Trace validation HTTP response reports success')
    require(invalid.get('kind') == 'Invalid', 'Trace validation HTTP response loses error kind')
    require(invalid.get('retryable') is False, 'Trace validation HTTP response loses retryability')
    require((invalid.get('details') or {}).get('code') == 'trace_context_trace_id_required',
            'Trace validation HTTP response loses the machine code')
    valid = inst.request('POST', '/api/v1/native-errors/execution/trace',
                         {'trace_id': 'native-trace', 'run_id': 'native-run'},
                         label='native-execution-trace-valid')
    require(valid == {'success': True, 'trace_context': {'trace_id': 'native-trace', 'run_id': 'native-run'}},
            'Trace normalization HTTP response differs from the canonical context')
    inst.evidence.save('native-execution-trace-boundary', {'invalid': invalid, 'valid': valid})


REGISTRY = [
    Scenario('native_execution_trace_boundary', 'regression', native_execution_trace_boundary, ('boot',),
             issues=('NE-05',), instance_setup=True),
]
