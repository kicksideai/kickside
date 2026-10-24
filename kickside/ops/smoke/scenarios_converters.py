"""Published converter SDK checks through a disposable MCP probe.

Install tooling with: python3 -m pip install -r ops/smoke/requirements-converters.txt
"""
import base64
from io import BytesIO
from pathlib import Path
import subprocess

from harness import Scenario, require
from scenarios_providers import load_fixture
from mcp_client import MCPClient


NS = 'app.smoke.converters'
ALIAS = 'NorthwindHTML2PDFProbe'
MARKERS = ('Northwind Traders', 'NW-PDF-731', 'Fictional invoice', 'Packing materials')
HTML = '''<!doctype html>
<html><head><meta charset="utf-8"><style>
body { font-family: sans-serif; font-size: 14px; }
table { border-collapse: collapse; } td { padding: 8px; border: 1px solid black; }
</style></head><body>
<h1>Northwind Traders</h1><p>Fictional invoice NW-PDF-731</p>
<table><tr><td>Packing materials</td><td>17 cartons</td><td>USD 731.00</td></tr></table>
</body></html>'''
PROBE = '''local html2pdf = require("html2pdf")
local base64 = require("base64")

local function handler(args: any): (any?, any)
    local pdf, err = html2pdf.render({ html = args.html })
    if err ~= nil then return nil, err end
    if type(pdf) ~= "string" then return nil, "HTML2PDF SDK returns no PDF bytes" end
    local encoded, encode_err = base64.encode(pdf)
    if encode_err ~= nil then return nil, encode_err end
    return { pdf_base64 = encoded, byte_count = #pdf }, nil
end

return { handler = handler }
'''


def inspect_pdf(pdf, markers):
    from pypdf import PdfReader
    require(pdf.startswith(b'%PDF-'), 'HTML2PDF result lacks a PDF header')
    reader = PdfReader(BytesIO(pdf), strict=True)
    require(len(reader.pages) == 1, 'HTML2PDF result must contain exactly one page')
    text = reader.pages[0].extract_text()
    for marker in markers:
        require(marker in text, 'HTML2PDF result lacks embedded text: ' + marker)
    return {'pages': len(reader.pages), 'text': text, 'byte_count': len(pdf)}


def html2pdf_sdk(ctx):
    import yaml
    inst = ctx.inst
    inst.install('kickside/html2pdf')
    fixture = inst.app / 'src' / 'converter-smoke'
    fixture.mkdir(parents=True)
    (fixture / 'probe.lua').write_text(PROBE)
    entry = {
        'name': 'probe', 'kind': 'function.lua', 'source': 'file://probe.lua',
        'method': 'handler', 'modules': ['base64'],
        'imports': {'html2pdf': 'kickside.convert.html2pdf:html2pdf'},
        'meta': {'type': 'tool', 'public': True, 'llm_alias': ALIAS,
                 'title': 'Northwind HTML2PDF SDK probe',
                 'input_schema': {'type': 'object', 'properties': {'html': {'type': 'string'}},
                                  'required': ['html'], 'additionalProperties': False}},
    }
    (fixture / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': NS, 'entries': [entry]}, sort_keys=False))
    load_fixture(ctx)
    credential = inst.request('POST', '/api/v1/mcp/credentials',
                              {'label': 'Northwind converter smoke',
                               'allowed_tool_ids': [NS + ':probe']},
                              label='html2pdf-probe-credential')['credential']
    token = credential['token']
    inst.redactor.add(token)
    inst.cleanup.add('converter probe credential', lambda: inst.request(
        'DELETE', '/api/v1/mcp/credentials/' + credential['credential_id']))
    call = {'jsonrpc': '2.0', 'id': 'html2pdf-render', 'method': 'tools/call',
            'params': {'name': ALIAS, 'arguments': {'html': HTML}}}
    denied = inst.request('POST', '/api/public/mcp', call, auth='', expect=(401,),
                          label='html2pdf-unauthorized')
    require(denied.get('error'), 'HTML2PDF probe permits an unauthenticated call')
    outside = inst.request('POST', '/api/public/mcp',
                           {**call, 'params': {'name': 'kickside.convert.html2pdf:render',
                                              'arguments': {'html': HTML}}}, auth=token,
                           label='html2pdf-outside-credential')
    require(outside.get('error') or outside.get('result', {}).get('isError'),
            'Converter credential permits a target outside its probe allow-list')
    value = MCPClient(inst, token, '/api/public/mcp', stateful=False).call(ALIAS, {'html': HTML})
    pdf = base64.b64decode(value['pdf_base64'], validate=True)
    require(len(pdf) == value['byte_count'], 'HTML2PDF bytes change during probe transport')
    artifact = inst.root / inst.evidence.label / 'northwind-invoice.pdf'
    artifact.parent.mkdir(parents=True, exist_ok=True)
    artifact.write_bytes(pdf)
    inst.evidence.paths.append(str(artifact))
    inst.evidence.save('html2pdf-inspection', inspect_pdf(pdf, MARKERS))
    inst.manifest()


REGISTRY = [Scenario(
    'converters_html2pdf_sdk', 'full', html2pdf_sdk, ('boot',),
    features=('kickside/html2pdf|converter|kickside.convert.html2pdf:render',), issues=('R5-T07',), instance_setup=True)]


def shipped_wasm_artifacts(source):
    """Return source-owned Wasm files from a checkout or immutable archive."""
    source = Path(source)
    artifacts = sorted((source / 'src').rglob('*.wasm'))
    has_git_metadata = any((parent / '.git').exists() for parent in (source, *source.parents))
    if not has_git_metadata:
        # A source cohort is mounted as a verified archive, so its complete
        # source tree is the ownership boundary when Git metadata is absent.
        return [(artifact, 'archived') for artifact in artifacts]
    shipped = []
    for artifact in artifacts:
        tracked = subprocess.check_output(['git', '-C', str(source), 'ls-files', '--',
                                           str(artifact.relative_to(source))], text=True).strip()
        if tracked:
            shipped.append((artifact, 'tracked'))
    return shipped


def wasm_artifact_paths(ctx):
    import hashlib
    import re

    rows = []
    for module, directory in sorted(ctx.inst.config['replace'].items()):
        source = Path(directory)
        for artifact, ownership in shipped_wasm_artifacts(source):
            raw = artifact.read_bytes()
            local_paths = any(marker in raw for marker in (b'/home/', b'/Users/'))
            local_paths = local_paths or re.search(rb'[A-Za-z]:[\\/]+Users[\\/]', raw) is not None
            local_paths = local_paths or str(source.resolve()).encode() in raw
            rows.append({'module': module, 'artifact': str(artifact.relative_to(source)),
                         'sha256': hashlib.sha256(raw).hexdigest(), 'ownership': ownership,
                         'portable_paths': not local_paths})
    ctx.inst.evidence.save('wasm-artifact-paths', rows)
    require(rows, 'Wasm artifact guard requires declared component sources')
    require(all(row['portable_paths'] for row in rows),
            'Wasm artifacts contain local source paths: ' + str([row for row in rows if not row['portable_paths']]))


REGISTRY += [Scenario('wasm_artifact_paths', 'regression', wasm_artifact_paths,
                      issues=('WASM-ARTIFACT-PORTABLE-PATHS',))]
