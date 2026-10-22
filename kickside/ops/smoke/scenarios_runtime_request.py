"""Runtime library logging and numeric keys survive a real application request."""
import uuid

import yaml

from harness import Scenario, require
from runtime_fixtures import isolated_fixture


LIBRARY = '''local named = require("logger"):named("smoke.request.library")
local fields = require("logger"):with({ fixture = "request-library" }):named("smoke.request.fields")
local M = {}
function M.run(marker)
    named:warn(marker .. ":library-named")
    fields:warn(marker .. ":library-fields")
    require("logger"):named("smoke.request.active"):warn(marker .. ":active-context")
    return { named = true, fields = true, active = true }
end
return M
'''

HANDLER = '''local http = require("http")
local json = require("json")
local library = require("library")
return { handler = function()
    local req, res = http.request(), http.response()
    local body, body_err = req:body()
    if body_err then error(tostring(body_err)) end
    local args, decode_err = json.decode(body)
    if decode_err then error(tostring(decode_err)) end
    local logged = library.run(args.marker)
    local matrix = {}
    for _, number in ipairs(args.keys) do
        local integer = math.tointeger(number)
        local float = tonumber(tostring(number) .. ".0")
        local a, b = {}, {}
        a[integer] = "stored"
        b[float] = "stored"
        matrix[#matrix + 1] = {
            number = number, equal = integer == float,
            integer_to_float = a[float] == "stored",
            float_to_integer = b[integer] == "stored",
        }
    end
    res:write_json({success = true, logged = logged, matrix = matrix,
                    literal_type = math.type(-1), negation_type = math.type(-math.tointeger(1))})
end }
'''


def request_fixture(ctx, check):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        suffix = uuid.uuid4().hex[:12]
        namespace = 'app.smoke.runtime_' + suffix
        with fixture.paused():
            directory = inst.app / 'src' / ('runtime-request-' + suffix)
            directory.mkdir()
            (directory / 'library.lua').write_text(LIBRARY)
            (directory / 'handler.lua').write_text(HANDLER)
            entries = [
                {'name': 'library', 'kind': 'library.lua', 'source': 'file://library.lua', 'modules': ['logger']},
                {'name': 'handler', 'kind': 'function.lua', 'source': 'file://handler.lua', 'method': 'handler',
                 'modules': ['http', 'json'], 'imports': {'library': namespace + ':library'}},
                {'name': 'endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
                 'method': 'POST', 'path': '/runtime-request-' + suffix, 'func': namespace + ':handler'},
            ]
            (directory / '_index.yaml').write_text(yaml.safe_dump(
                {'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
        marker = 'RUNTIME-REQUEST-' + suffix
        result = inst.request('POST', '/api/v1/runtime-request-' + suffix,
                              {'marker': marker, 'keys': [-2, -1, 0, 1, 2, 67108865]}, label='runtime-request-result')
        if check == 'numeric':
            require(result['matrix'] and all(row['equal'] and row['integer_to_float'] and row['float_to_integer']
                                             for row in result['matrix']),
                    'Equal JSON numeric values address different Lua keys: ' + str(result['matrix']))
            require(result['literal_type'] == result['negation_type'] == 'integer',
                    'Integer negation loses its subtype: ' + str(result))
        else:
            lines = [line for line in (inst.root / 'runtime.log').read_text().splitlines() if marker in line]
            inst.evidence.save('request-library-logs', {'result': result, 'lines': lines})
            require(result['logged'] == {'named': True, 'fields': True, 'active': True},
                    'The HTTP handler does not execute all logging calls')
            for name in ('active-context', 'library-named', 'library-fields'):
                require(sum(marker + ':' + name in line for line in lines) == 1,
                        'Request library log is absent or duplicated: ' + name + ': ' + str(lines))


REGISTRY = [
    Scenario('runtime_library_logger_request', 'regression', lambda ctx: request_fixture(ctx, 'logger'),
             issues=('RUNTIME-LIBRARY-LOGGER-CONTEXT',),
             features=()),
    Scenario('runtime_numeric_key_request', 'regression', lambda ctx: request_fixture(ctx, 'numeric'),
             issues=('RUNTIME-NUMERIC-KEY-EQUALITY',),
             features=()),
]
