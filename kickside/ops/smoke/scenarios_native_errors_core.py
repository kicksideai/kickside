"""Native error regression guards for Core libraries."""
import shutil
from pathlib import Path

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test

HERE = Path(__file__).resolve().parent


def native_errors_core_source_ref(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'source_ref_test')
    with ctx.paused():
        fixture = ctx.inst.app / 'src' / 'native-errors-core'
        fixture.mkdir()
        shutil.copyfile(HERE / 'mocks/native_errors_core/source_ref.lua', fixture / 'source_ref.lua')
        entries = [
            {'name': 'source_ref_errors', 'kind': 'function.lua', 'source': 'file://source_ref.lua',
             'method': 'source_ref_errors', 'modules': ['http'],
             'imports': {'source_ref': 'kickside.core.provenance:source_ref'}},
            {'name': 'source_ref_errors.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/native-errors-core/source-ref',
             'func': 'app.native_errors_core:source_ref_errors'},
        ]
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': 'app.native_errors_core', 'entries': entries}, sort_keys=False))
    result = ctx.inst.request('GET', '/api/v1/native-errors-core/source-ref',
                              label='native-error-core-source-ref')
    expected = {
        'args': 'source_ref_args_invalid',
        'origin_type': 'source_ref_origin_type_required',
        'origin_id': 'source_ref_origin_id_required',
    }
    for field, code in expected.items():
        error = result.get(field, {})
        require(error.get('kind') == 'Invalid' and error.get('retryable') is False and error.get('code') == code,
                'source_ref does not return the expected native validation error: ' + field + '=' + str(error))


REGISTRY = [Scenario(
    'native_errors_core_source_ref', 'regression', native_errors_core_source_ref, ('boot',), issues=('NE-13',),
    features=(), instance_setup=True)]
