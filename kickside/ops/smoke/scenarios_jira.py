"""EE2 regressions against declared UI, persistence and local provider contracts."""
import json
from pathlib import Path
import re
import time
import uuid

from browser import CHAT_STATE
from fixture_member_permissions import register_member_policy_grants
from harness import Scenario, require
from mocks.jira_regressions import DiscordIngress
from mocks.jira_network import jira_endpoints
from jira_contracts import assert_tool_turn, assert_documents, assert_paused_drive, assert_discord_reply, assert_sync_config, assert_responder_tool_failure, assert_capability_action
from scenarios import nav, pdf_fixture
from scenarios_providers import probe, configure_provider_endpoints
from mcp_client import MCPClient

HERE = Path(__file__).resolve().parent
NS = 'app.smoke.jira'
KB_READER = 'kickside.knowledge.traits:kb_reader'
KB_WRITER = 'kickside.knowledge.traits:kb_writer'


def features(component, category, *keys):
    return tuple('kickside/' + component + '|' + category + '|' + key for key in keys)


def ui(ctx, viewport=None):
    browser = ctx.browser_check()
    browser.settle()
    storage = browser.context.storage_state()
    browser.reset_context(storage_state=storage, viewport=viewport or {'width': 1440, 'height': 1000})
    browser.page.goto(ctx.inst.base + '/', wait_until='domcontentloaded', timeout=30000)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    return browser


def jira_setup(ctx):
    import yaml
    inst, browser = ctx.inst, ctx.browser_check()
    browser.settle()
    browser.page.goto('about:blank')
    inst.cleanup.add('Jira provider fixtures', ctx.fixtures.stop)
    bases = {name: ctx.fixtures.start(name) for name in ('fireflies', 'discord', 'google')}
    for name in ('fireflies', 'google', 'discord', 'channel', 'mcp'):
        inst.install('kickside/' + name)
    fixture = inst.app / 'src' / 'jira-smoke'
    fixture.mkdir()
    (fixture / 'probe.lua').write_text((HERE / 'mocks/providers_probe.lua').read_text())
    (fixture / 'ingress.lua').write_text((HERE / 'mocks/jira_ingress.lua').read_text())
    entries = [
        {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'resources': [base + '/*' for base in bases.values()], 'actions': ['http_client.request'], 'effect': 'allow'}},
        {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'resources': ['127.0.0.1'], 'actions': ['http_client.private_ip'], 'effect': 'allow'}},
        {'name': 'inbound', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'resources': ['*'], 'actions': ['channel.receive.inject'], 'effect': 'allow'}},
        {'name': 'probe', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'handler',
         'modules': ['funcs', 'contract', 'registry', 'json'], 'imports': {'component': 'kickside.component:component'},
         'meta': {'type': 'tool', 'public': True, 'llm_alias': 'NorthwindProviderProbe', 'title': 'Local provider probe',
                  'input_schema': {'type': 'object', 'properties': {'connection_id': {'type': 'string'}, 'write': {'type': 'boolean'},
                     'tool': {'type': 'string'}, 'trait': {'type': 'string'}, 'context': {'type': 'object'}, 'arguments': {'type': 'object'}}, 'required': ['arguments']}}},
        {'name': 'ingress', 'kind': 'function.lua', 'source': 'file://ingress.lua', 'method': 'handler', 'modules': ['funcs'],
         'meta': {'type': 'tool', 'public': True, 'llm_alias': 'JiraDiscordIngress', 'title': 'Local Discord ingress',
                  'input_schema': {'type': 'object', 'properties': {'connection_id': {'type': 'string'}, 'event': {'type': 'object'}}, 'required': ['connection_id', 'event']}}},
    ]
    entries = register_member_policy_grants(inst.app, entries)
    (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))
    endpoints = jira_endpoints(bases)
    configure_provider_endpoints(ctx, endpoints)
    config_path = inst.app / '.wippy.yaml'
    config = yaml.safe_load(config_path.read_text())
    config['profiles']['quickstart']['override']['kickside.discord.gateway:gateway.service:lifecycle.auto_start'] = False
    config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    ctx.restart()
    inst.manifest()
    gateway = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.discord.gateway:gateway.service', label='gateway-disabled')['entry']
    require(gateway['data']['lifecycle']['auto_start'] is False, 'External Discord gateway remains enabled')
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Local Jira fixtures',
        'allowed_tool_ids': [NS + ':probe', NS + ':ingress']}, label='fixture-credential')['credential']
    inst.redactor.add(credential['token'])
    ctx.state['provider_probe_token'] = credential['token']
    ctx.state['provider_probe_client'] = MCPClient(inst, credential['token'], '/api/public/mcp', stateful=False)
    ctx.state['jira_bases'] = bases
    inst.cleanup.add('Jira fixture credential', lambda: inst.request('DELETE', '/api/v1/mcp/credentials/' + credential['credential_id']))
    for requirement, value in endpoints.items():
        declared = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + requirement, label='jira-endpoint')['entry']
        require(declared['data']['default'] == value, 'Provider endpoint leaves the local fixture: ' + requirement)
    ctx.state['jira_fireflies'] = [inst.request('POST', '/api/v1/connections', {
        'impl_id': 'kickside.fireflies.connection:fireflies_connection', 'name': 'EE2 Fireflies ' + str(number),
        'private_context': {'api_key': 'fictional-fireflies-key'}, 'validate': True}, label='fireflies-connection')['component_id']
        for number in (1, 2)]
    require(len(ctx.fixtures.requests('fireflies')) == 2, 'Fireflies validation does not reach the local fixture')
    ui(ctx)


def kb(ctx, name):
    created = ctx.inst.request('POST', '/api/v1/knowledge/create', {
        'name': name, 'kb_type': 'document', 'embedding_model': ctx.state['embed'],
        'config': {'analysis_model': ctx.state['model']}}, label='kb-create')
    require(created.get('success') and created.get('id'), 'KB creation fails: ' + str(created))
    return created['id']


def agent_form(ctx, name=None):
    nav(ctx, 'Agents')
    if name:
        ctx.browser.frame.get_by_role('button', name='Edit ' + name, exact=True).click()
    else:
        ctx.browser.frame.get_by_role('button', name='New agent', exact=True).first.click()
    form = ctx.browser.frame.locator('kickside-agents')
    form.get_by_label('Agent name', exact=True).wait_for(timeout=30000)
    form.get_by_role('tab', name=re.compile('^Capabilities')).click()
    return form


def add_capability(form, title):
    box = form.get_by_role('combobox', name='Search capabilities to add')
    box.fill(title)
    form.get_by_role('option').filter(has_text=title).first.click()
    return form.locator('.kx-trait').filter(has_text=title)


def pick_kb(row, title):
    row.get_by_role('textbox', name='Search knowledge bases…', exact=True).fill(title)
    row.locator('.ms-row').filter(has_text=title).first.click()


def regression_2517(ctx):
    from playwright.sync_api import expect
    browser = ui(ctx)
    title = 'EE2-2517 context base'
    kid = kb(ctx, title)
    form = agent_form(ctx)
    form.get_by_label('Agent name', exact=True).fill('EE2-2517 assistant')
    form.get_by_role('tab', name='Model', exact=True).click()
    model_picker = form.locator('wc-model-picker')
    model_picker.get_by_role('combobox', name='Choose model', exact=True).click()
    model_picker.get_by_role('option').first.click()
    tokens = form.get_by_role('spinbutton', name=re.compile(r'^Max tokens'))
    ceiling = tokens.get_attribute('max')
    require(ceiling and int(ceiling) > 0, 'Selected agent model has no output budget')
    tokens.fill(ceiling)
    form.get_by_role('tab', name=re.compile('^Capabilities')).click()
    for capability in ('Knowledge Base Reader', 'Knowledge Base Writer'):
        pick_kb(add_capability(form, capability), title)
    reader = add_capability(form, 'Fireflies Reader')
    reader.get_by_role('combobox').click()
    reader.get_by_role('option').filter(has_text='EE2 Fireflies 1').click()
    reader.get_by_role('combobox').click()
    reader.get_by_role('option').filter(has_text='EE2 Fireflies 2').click()
    expect(form.get_by_role('button', name='Create agent', exact=True)).to_be_enabled(timeout=30000)
    with browser.page.expect_response(lambda r: '/api/v1/user-agents' in r.url and r.request.method == 'POST') as response:
        form.get_by_role('button', name='Create agent', exact=True).click()
    result = response.value.json()
    require(response.value.status == 200 and result.get('success'), 'Agent Save fails: ' + str(result))
    aid = result['component_id']
    expect(form.get_by_label('Agent name', exact=True)).to_have_count(0, timeout=30000)
    saved = ctx.inst.request('GET', '/api/v1/user-agents/' + aid, label='saved-agent')['agent']
    for trait in (KB_READER, KB_WRITER):
        require(saved['trait_contexts'][trait] == {'kb_ids': [kid]}, 'Saved KB context differs: ' + str(saved['trait_contexts']))
    require(saved['trait_contexts']['kickside.fireflies.traits:reader']['connection_id'] == ctx.state['jira_fireflies'][1], 'Connection edit does not persist')
    edited_kid = kb(ctx, 'EE2-2517 edited context base')
    form = agent_form(ctx, 'EE2-2517 assistant')
    for capability in ('Knowledge Base Reader', 'Knowledge Base Writer'):
        row = form.locator('.kx-trait').filter(has_text=capability)
        pick_kb(row, 'EE2-2517 edited context base')
    reader = form.locator('.kx-trait').filter(has_text='Fireflies Reader')
    reader.get_by_role('combobox').click()
    reader.get_by_role('option').filter(has_text='EE2 Fireflies 1').click()
    with browser.page.expect_response(lambda r: '/api/v1/user-agents/' + aid in r.url and r.request.method == 'PUT') as response:
        form.get_by_role('button', name='Save changes', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success'), 'Agent edit Save fails: ' + str(response.value.json()))
    expect(form.get_by_label('Agent name', exact=True)).to_have_count(0, timeout=30000)
    edited = ctx.inst.request('GET', '/api/v1/user-agents/' + aid, label='edited-agent')['agent']
    for trait in (KB_READER, KB_WRITER):
        require(edited['trait_contexts'][trait] == {'kb_ids': [kid, edited_kid]}, 'Edited KB context includes stale values or UI fields: ' + str(edited['trait_contexts']))
    require(edited['trait_contexts']['kickside.fireflies.traits:reader'] == {'connection_id': ctx.state['jira_fireflies'][0]}, 'Edited connection context differs')



def start_chat(ctx, agent_id):
    nav(ctx, 'Agents')
    agent = ctx.inst.request('GET', '/api/v1/user-agents/' + agent_id)['agent']
    card = ctx.browser.frame.locator('kickside-agents .kx-card').filter(has_text=agent['title'])
    card.locator('.kx-card-chat').click()
    chat = ctx.browser.frame.locator('wippy-chat')
    chat.get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)
    return chat


def regression_2465(ctx):
    from playwright.sync_api import expect
    browser = ui(ctx)
    aid = ctx.inst.request('POST', '/api/v1/user-agents', {'title': 'EE2-2465 tool errors', 'model': ctx.state['model'],
        'prompt': 'Obey the requested tool call exactly once. After a tool failure, stop using tools, explain the actual error, and end the turn. Never retry.',
        'traits': ['kickside.automation.traits:reader']}, label='error-agent')['component_id']
    chat = start_chat(ctx, aid)
    box = chat.get_by_placeholder('Type a message', exact=True)
    browser.tool_error('Call AutomationsRead exactly once with action read_config and omit id. This tests its required-id error. Show the actual error and finish without retrying.',
        'id is required', 'tool-error')
    expect(box).to_be_enabled()
    previous_text = chat.evaluate(CHAT_STATE)['text']
    box.fill('Do not call tools. Continue with one short response.')
    box.press('Enter')
    ctx.inst.wait(lambda: chat.evaluate(CHAT_STATE)['text'] != previous_text and chat.evaluate(CHAT_STATE)['enabled'] and not chat.evaluate(CHAT_STATE)['busy'],
                  'Chat accepts the next message', seconds=180, pump=browser.page.wait_for_timeout)


def sync_form(ctx):
    nav(ctx, 'Automations')
    ctx.browser.frame.get_by_role('button', name='Add automation', exact=True).first.click()
    ctx.browser.frame.get_by_role('button').filter(has_text=re.compile('^Data Sync')).first.click()
    form = ctx.browser.frame.locator('kickside-sync-create')
    form.locator('[data-test=pl-title]').wait_for(timeout=30000)
    return form


def regression_2459(ctx):
    browser = ui(ctx)
    kid = kb(ctx, 'EE2-2459 transcripts')
    form = sync_form(ctx)
    form.locator('[data-test=pl-title]').fill('EE2-2459 Fireflies sync')
    form.get_by_role('combobox', name='When this runs').click()
    form.get_by_role('option').filter(has_text='Fireflies Transcripts').first.click()
    instance = form.locator('[data-test=tc-instance]')
    instance.get_by_role('combobox').first.click()
    instance.get_by_role('option').filter(has_text='EE2 Fireflies 1').click()
    form.get_by_role('checkbox', name='At specific times', exact=True).uncheck()
    form.locator('[data-test=tc-periodic-n]').fill('30')
    form.locator('[data-test=tc-periodic-unit]').click()
    form.get_by_role('option', name='minutes', exact=True).click()
    form.locator('[data-test=tc-history-kind]').click()
    form.get_by_role('option', name='Only new', exact=True).click()
    form.locator('.kx-stage').filter(has_text='Destination').get_by_role('combobox').first.click()
    form.get_by_role('option').filter(has_text='Add to Knowledge Base').click()
    destination = form.locator('.kx-stage').filter(has_text='Destination')
    destination.get_by_role('textbox', name='Search knowledge bases…', exact=True).fill('EE2-2459 transcripts')
    destination.locator('.ms-row').filter(has_text='EE2-2459 transcripts').click()
    transform = form.locator('kickside-transform-assist')
    transform.get_by_role('combobox', name='Transform strategy').click()
    transform.get_by_role('option', name='Expression', exact=True).click()
    transform.locator('[data-test=expr-editor]').fill('{ content: payload.summary.overview, title: payload.title }')
    transform.locator('[data-test=expr-editor]').press('Tab')
    with browser.page.expect_response(lambda r: '/api/v1/automations' in r.url and r.request.method == 'POST') as response:
        browser.frame.get_by_role('button', name='Create', exact=True).click()
    body, result = response.value.request.post_data_json, response.value.json()
    ctx.inst.evidence.save('sync-create', {'request': body, 'response': result})
    require(body['input'].get('enabled') is True, 'Data Sync UI omits enabled=true')
    require(response.value.status == 200 and result.get('success'), 'Data Sync Create fails: ' + str(result))
    browser.frame.get_by_role('button', name='Open EE2-2459 Fireflies sync details', exact=True).wait_for(timeout=30000)
    require(body['input'].get('sink_config') == {'kb_ids': [kid]}, 'UI saves another destination')
    config = ctx.inst.request('GET', '/api/v1/automations/' + result['id'] + '/config', label='persisted-sync-config')
    status = ctx.inst.request('GET', '/api/v1/automations/' + result['id'] + '/status', label='persisted-sync-drive')
    assert_sync_config(config, status, kid)


def regression_2516(ctx):
    from docx import Document
    from upload_chat_contract import upload_in_chat
    browser = ui(ctx)
    chat = start_chat(ctx, ctx.state['agent'])
    docx = ctx.inst.root / 'temp' / 'EE2-2516-policy.docx'
    document = Document()
    document.add_paragraph('Fictional Northwind policy NW-SMOKE-731: returns within 17 days.')
    document.save(docx)
    rows = [upload_in_chat(ctx, chat, path) for path in (docx, pdf_fixture(ctx.inst, 'EE2-2516-policy'))]
    frame_start = len(browser.frames)
    browser.stream('Read both attached policy documents. Give five short policy bullets and end with EE2-2516-READY.',
                   'EE2-2516-READY', 'chat-documents-send')
    sent = [f['data'] for f in browser.delivered_once(
        frame_start, lambda f: isinstance(f.get('data'), dict) and f['data'].get('type') == 'received'
        and 'EE2-2516-READY' in str(f['data'].get('text')))]
    require(set(sent[0].get('file_uuids', [])) == {r['uuid'] for r in rows}, 'Chat message loses its DOCX or PDF')
    messages = ctx.inst.request('GET', '/api/v1/sessions/messages?session_id=' + sent[0]['session_id'],
                                label='chat-document-messages')['messages']
    require(any(m['type'] == 'user' and set(m.get('file_uuids', [])) == {r['uuid'] for r in rows}
                for m in messages), 'Sent chat attachments do not persist')
    corrupt = ctx.inst.root / 'temp' / 'EE2-2516-corrupt.pdf'
    corrupt.write_bytes(b'%PDF-1.4\nNorthwind corrupt PDF without a cross-reference table\n')
    upload_in_chat(ctx, chat, corrupt, failed=True)


def open_kb(ctx, title):
    nav(ctx, 'Knowledge')
    ctx.browser.frame.get_by_role('button', name='Open ' + title, exact=True).click()
    ctx.browser.frame.get_by_role('button', name='Add document', exact=True).wait_for(timeout=30000)


def upload_files(ctx, paths):
    browser = ctx.browser
    chat = start_chat(ctx, ctx.state['agent'])
    before = len(browser.uploads)
    chat.locator('input[type=file]').set_input_files([str(p) for p in paths])
    rows = ctx.inst.wait(lambda: browser.uploads[before:] if len(browser.uploads) == before + len(paths) else None,
                         'All selected files upload', seconds=90, pump=browser.page.wait_for_timeout)
    def complete():
        records = [ctx.inst.request('GET', '/api/v1/uploads/' + r['uuid'], label='upload-' + str(i))['upload'] for i, r in enumerate(rows)]
        require(all(r['status'] not in ('error', 'failed') for r in records), 'Selected upload fails: ' + str(records))
        return records if all(r['status'] == 'completed' for r in records) else None
    ctx.inst.wait(complete, 'All selected files convert', seconds=120, pump=browser.page.wait_for_timeout)
    return rows


def add_existing(ctx, title, filenames):
    open_kb(ctx, title)
    frame = ctx.browser.frame
    frame.get_by_role('button', name='Add document', exact=True).click()
    frame.get_by_role('tab', name='My uploads', exact=True).click()
    for name in filenames:
        frame.locator('.ap-upload').filter(has_text=name).click()
    with ctx.browser.page.expect_response(lambda r: '/ingest-upload' in r.url and r.request.method == 'POST') as response:
        frame.get_by_role('button', name='Add ' + str(len(filenames)) + ' selected', exact=True).click()
    result = response.value.json()
    ctx.inst.evidence.save('batch-ingest', {'request': response.value.request.post_data_json, 'response': result})
    require(result.get('success') and result.get('queued') == len(filenames) and all(r['success'] for r in result['results']),
            'Selected files do not all enter the KB: ' + str(result))


def documents(ctx, kid, count):
    result = ctx.inst.request('GET', '/api/v1/kb10/' + kid + '/browse?node_type=document&limit=100', label='kb-documents')
    require(result.get('success'), 'KB browse fails: ' + str(result))
    return result if result.get('total') == count and len(result.get('nodes', [])) == count else None


def regression_2463_sync(ctx):
    from playwright.sync_api import expect
    browser = ui(ctx)
    title = 'EE2-2463 two files'
    kid = kb(ctx, title)
    paths = [pdf_fixture(ctx.inst, 'EE2-2463-first'), pdf_fixture(ctx.inst, 'EE2-2463-second')]
    uploaded = upload_files(ctx, paths)
    add_existing(ctx, title, [p.name for p in paths])
    result = ctx.inst.wait(lambda: documents(ctx, kid, 2), 'Both files become KB documents', seconds=120, pump=browser.page.wait_for_timeout)
    assert_documents(result, {row['uuid'] for row in uploaded})
    expect(browser.frame.locator('.kd-row')).to_have_count(2, timeout=120000)
    expect(browser.frame.locator('.kc-railhead-title b')).to_have_text('2', timeout=30000)
    nav(ctx, 'Knowledge')
    card = browser.frame.get_by_role('button', name='Open ' + title, exact=True)
    expect(card.locator('[aria-label="2 documents"]')).to_be_visible(timeout=30000)


PERFORMANCE_OBSERVER = """() => {
    window.ee2LongTasks = [];
    window.ee2Observer = new PerformanceObserver(list => {
        for (const task of list.getEntries()) window.ee2LongTasks.push({start:task.startTime,duration:task.duration});
    });
    window.ee2Observer.observe({type:'longtask',buffered:false});
    return performance.now();
}"""


def regression_2463_xlsx(ctx):
    browser = ui(ctx)
    title = 'EE2-2463 spreadsheet'
    kid = kb(ctx, title)
    path = HERE / 'mocks' / 'assets' / 'catalog.xlsx'
    upload_files(ctx, [path])
    add_existing(ctx, title, [path.name])
    ctx.inst.wait(lambda: documents(ctx, kid, 1), 'Catalog becomes a KB document', seconds=120, pump=browser.page.wait_for_timeout)
    open_kb(ctx, title)
    frame = browser.page.frame(name='wippy:page:app.views:main')
    frame.evaluate(PERFORMANCE_OBSERVER)
    started = time.monotonic()
    browser.frame.locator('.kd-row').filter(has_text='catalog').first.click(timeout=5000)
    browser.frame.locator('.dr-rv').get_by_role('table').first.wait_for(state='visible', timeout=5000)
    frame.evaluate('() => { window.ee2RenderFrames = 0; requestAnimationFrame(() => { window.ee2RenderFrames++; requestAnimationFrame(() => window.ee2RenderFrames++); }); }')
    frame.wait_for_function('window.ee2RenderFrames === 2', timeout=5000)
    render_ms = (time.monotonic() - started) * 1000
    browser.page.wait_for_timeout(2000)
    measurement = frame.evaluate('() => { window.ee2Observer.disconnect(); return {tasks:window.ee2LongTasks}; }')
    measurement['render_ms'] = render_ms
    ctx.inst.evidence.save('xlsx-main-thread', measurement)
    require(render_ms <= 5000, 'Catalog render exceeds 5000ms: ' + str(measurement))
    require(all(task['duration'] <= 1000 for task in measurement['tasks']), 'Catalog blocks the main thread over 1000ms: ' + str(measurement))
    browser.frame.get_by_role('button', name='Add document', exact=True).click(timeout=5000)
    browser.frame.get_by_role('tab', name='My uploads', exact=True).wait_for(timeout=5000)
    browser.screenshot('xlsx-responsive')


def regression_2460(ctx):
    from playwright.sync_api import expect
    browser = ui(ctx)
    title = 'EE2-2460 pause state'
    aid = ctx.inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': {
        'title': title, 'target': {'kind': 'agent', 'prompt': 'Reply only when scheduled.', 'agent_id': ctx.state['agent']},
        'schedule': {'type': 'interval', 'expression': '24h'}, 'enabled': True}}, label='active-automation')['id']
    nav(ctx, 'Automations')
    with browser.page.expect_response(lambda r: '/automations/' + aid + '/actions/pause' in r.url) as response:
        browser.frame.get_by_role('button', name='Pause ' + title, exact=True).click()
    result = response.value.json()
    require(result.get('success'), 'Pause API fails: ' + str(result))
    play = browser.frame.get_by_role('button', name='Resume ' + title, exact=True)
    expect(play).to_be_visible(timeout=30000)
    expect(play.locator('svg.iconify--tabler')).to_be_visible(timeout=30000)
    require('M6 4' in play.locator('svg').inner_html(), 'Paused row lacks the declared filled Play path')
    def paused():
        status = ctx.inst.request('GET', '/api/v1/automations/' + aid + '/status', label='paused-drive-status')
        main = next((row for row in status.get('drives', []) if row.get('drive_key') == 'main'), None)
        return status if main and main.get('enabled') is False and main.get('phase') == 'paused' else None
    status = ctx.inst.wait(paused, 'Pause persists on the canonical main drive', seconds=30, pump=browser.page.wait_for_timeout)
    assert_paused_drive(status)
    require(ctx.inst.request('GET', '/api/v1/automations/' + aid + '/state', label='paused-state').get('success'), 'Paused automation state is unreadable')


def regression_2445(ctx):
    from urllib.request import Request, urlopen
    browser = ui(ctx)
    request = Request(ctx.state['jira_bases']['google'] + '/_fixture/oauth',
        data=json.dumps({'initial_expires_in': 3}).encode(), headers={'Content-Type': 'application/json'})
    with urlopen(request, timeout=5) as response:
        require(json.load(response).get('success'), 'Google expiry fixture configuration fails')
    for key, value in (('client_id', 'northwind-client'), ('client_secret', 'fictional-oidc-secret')):
        ctx.inst.request('PUT', '/api/v1/settings', {'namespace': 'kickside.google', 'key': key, 'value': value}, label='google-' + key)
    initialized = ctx.inst.request('POST', '/api/v1/oauth/providers/google/init', {'name': 'EE2-2445 Gmail', 'scopes': []}, label='google-oauth-init')
    require(initialized['authorization_url'].startswith(ctx.state['jira_bases']['google']), 'Google OAuth leaves local fixture')
    browser.page.goto(initialized['authorization_url'], wait_until='domcontentloaded', timeout=30000)
    def connection():
        return next((r for r in ctx.inst.request('GET', '/api/v1/connections', label='google-persisted')['connections'] if r['name'] == 'EE2-2445 Gmail'), None)
    cid = ctx.inst.wait(connection, 'Gmail OAuth completes', seconds=60, pump=browser.page.wait_for_timeout)['component_id']
    browser.page.wait_for_timeout(4000)
    value = probe(ctx, tool='kickside.google.traits:gmail_read_tool', trait='kickside.google.traits:gmail_reader',
                  connection=cid, arguments={'action': 'list_messages', 'max_results': 5}, label='gmail-after-expiry')
    require(value and '731' in json.dumps(value), 'Gmail read fails after expiry: ' + str(value))
    records = ctx.fixtures.requests('google')
    ctx.inst.evidence.save('google-refresh-wire', records)
    refreshed = [r for r in records if r['path'] == '/token' and r['body'].get('grant_type') == 'refresh_token']
    require(refreshed and all(r['status'] == 200 for r in refreshed), 'Gmail never refreshes the expired access token')
    require(sum(r['path'] == '/authorize' for r in records) == 1, 'Gmail requires another authorization')
    metadata = ctx.inst.request('GET', '/api/v1/oauth/connections/' + cid, label='gmail-renewed-metadata')['connection']
    require(metadata['connection_state'] == 'connected' and int(metadata['expires_at']) > time.time(), 'Renewed Gmail expiry does not persist: ' + str(metadata))
    ui(ctx)
    nav(ctx, 'Connections')
    browser.frame.get_by_text('EE2-2445 Gmail', exact=True).first.wait_for(timeout=30000)
    browser.screenshot('gmail-connection-after-refresh')


def regression_2439(ctx, *, before_failure=None):
    browser = ui(ctx)
    cid = ctx.inst.request('POST', '/api/v1/connections', {'impl_id': 'kickside.discord.connection:discord_connection',
        'name': 'EE2-2439 Discord', 'private_context': {'bot_token': 'fictional-discord-token'}, 'validate': True}, label='discord-connection')['component_id']
    ctx.inst.cleanup.add('Discord picker connection', lambda: ctx.inst.request('DELETE', '/api/v1/connections/' + cid), scope='scenario')
    aid = ctx.inst.request('POST', '/api/v1/user-agents', {'title': 'EE2-2439 QA bot', 'model': ctx.state['model'],
        'prompt': 'Respond to a QA mention with a concise acknowledgment.'}, label='discord-agent')['component_id']
    agent_cleanup = ctx.inst.cleanup.add('Discord picker agent', lambda: ctx.inst.request('DELETE', '/api/v1/user-agents/' + aid), scope='scenario')
    nav(ctx, 'Automations')
    browser.frame.get_by_role('button', name='Add automation', exact=True).first.click()
    browser.frame.get_by_role('button').filter(has_text=re.compile('^Channel Responder')).first.click()
    form = browser.frame.locator('kickside-channel-responder-create')
    form.get_by_label('Automation name', exact=True).fill('EE2-2439 responder')
    picker = form.locator('wc-channel-picker')
    picker.get_by_role('button', name='Select a channel…', exact=True).click()
    browser.pick_channel(picker, 'EE2-2439 Discord', ('Northwind',), 'northwind-orders')
    picker = form.locator('wc-agent-picker')
    picker.get_by_role('textbox', name='Pick an agent…', exact=True).fill('EE2-2439 QA bot')
    picker.locator('.ms-row').filter(has_text='EE2-2439 QA bot').click()
    with browser.page.expect_response(lambda r: '/api/v1/automations' in r.url and r.request.method == 'POST') as response:
        browser.frame.get_by_role('button', name='Create', exact=True).click()
    created = response.value.json()
    require(created.get('success'), 'Discord responder Create fails: ' + str(created))
    ctx.inst.cleanup.add('Discord picker responder', lambda: ctx.inst.request('DELETE', '/api/v1/automations/' + created['id']), scope='scenario')
    reply_start = len(ctx.fixtures.requests('discord'))
    event = DiscordIngress.mention(str(uuid.uuid4().int), 'Reply with EE2-2439-READY')
    received = ctx.inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call',
        'params': {'name': 'JiraDiscordIngress', 'arguments': {'connection_id': cid, 'event': event}}},
        auth=ctx.state['provider_probe_token'], label='discord-mention')
    require('error' not in received and not received.get('result', {}).get('isError'), 'Discord ingress fails: ' + str(received))
    ctx.inst.wait(lambda: assert_discord_reply(ctx.fixtures.requests('discord')[reply_start:], 'NW'),
        'Discord mention receives an agent reply', seconds=180, pump=browser.page.wait_for_timeout)
    ctx.inst.evidence.save('discord-replies', ctx.fixtures.requests('discord')[reply_start:])
    activations = ctx.inst.request('GET', '/api/v1/threads/' + created['id'] + '/events',
                                   label='discord-responder-activations')['events']
    activated = [row for row in activations if row['type'].endswith(':session.activated')]
    require(len(activated) == 1, 'Responder has no unique admitted conversation')
    activation = activated[0]['body']
    if isinstance(activation, str): activation = json.loads(activation)
    conversation = activation.get('thread_id') if isinstance(activation, dict) else None
    require(isinstance(conversation, str) and conversation, 'Responder activation has no conversation thread')
    if before_failure is not None:
        before_failure()
    ctx.inst.request('DELETE', '/api/v1/user-agents/' + aid, label='discord-misconfigured-agent')
    ctx.inst.cleanup.remove(agent_cleanup)
    event = DiscordIngress.mention(str(uuid.uuid4().int), 'Reply after the configured agent disappears')
    failed_ingress = ctx.inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call',
        'params': {'name': 'JiraDiscordIngress', 'arguments': {'connection_id': cid, 'event': event}}},
        auth=ctx.state['provider_probe_token'], label='discord-misconfiguration')
    require('error' not in failed_ingress and isinstance(failed_ingress.get('result'), dict),
            'Misconfigured-agent event never enters the responder: ' + str(failed_ingress))
    message = assert_responder_tool_failure(failed_ingress['result'])
    failure = failed_ingress['result']['structuredContent']
    require(failure['reason'] == 'agent_missing', 'Deleted agent produces another failure reason: ' + str(failure))
    transcript = ctx.inst.request('GET', '/api/v1/threads/' + conversation + '/events',
                                  label='discord-misconfigured-inbound')['events']
    witnessed = []
    for row in transcript:
        body = row.get('body', {})
        if isinstance(body, str): body = json.loads(body)
        if row['type'].endswith(':message.inbound') and isinstance(body, dict) and body.get('external_message_id') == event['id']:
            witnessed.append(row)
    require(len(witnessed) == 1, 'Misconfigured-agent event has no unique durable inbound witness')
    state = ctx.inst.request('GET', '/api/v1/automations/' + created['id'] + '/state',
                             label='discord-committed-misconfiguration')['state']
    require(state.get('health_reason') == 'agent_missing' and state.get('health_message') == message,
            'Responder configuration failure does not persist: ' + str(state))
    browser.frame.get_by_role('button', name='Open EE2-2439 responder details', exact=True).click()
    details = browser.frame.get_by_role('dialog', name='EE2-2439 responder', exact=True)
    shown = details.get_by_text(re.compile('^' + re.escape(message) + '$', re.I))
    ctx.inst.wait(lambda: shown.is_visible(),
                  'Discord misconfiguration is visible', seconds=60, pump=browser.page.wait_for_timeout)
    browser.screenshot('discord-visible-misconfiguration')


def regression_responder_state_refresh(ctx):
    dropped = []
    def before_failure():
        browser = ctx.browser
        def intercept(route):
            server = route.connect_to_server()
            def forward(message):
                event = b'component.meta.changed' if isinstance(message, bytes) else 'component.meta.changed'
                if event in message:
                    dropped.append(message)
                else:
                    route.send(message)
            server.on_message(forward)
        browser.context.route_web_socket('**/*', intercept)
        browser.reload()
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        nav(ctx, 'Automations')
        browser.frame.get_by_role('button', name='Open EE2-2439 responder details', exact=True).wait_for(timeout=30000)
        browser.settle()
    regression_2439(ctx, before_failure=before_failure)
    require(dropped, 'The committed-state guard never intercepts a component notification')
    ctx.inst.evidence.save('responder-missed-notification', {'dropped_notifications': len(dropped), 'error_visible': True})


def regression_2515(ctx):
    browser = ui(ctx, {'width': 1216, 'height': 900})
    form = sync_form(ctx)
    destination = form.locator('.kx-stage').filter(has_text='Destination').get_by_role('combobox').first
    destination.scroll_into_view_if_needed()
    destination.click()
    options = form.locator('[role="option"]:has(.kx-ps-opt-title)')
    options.first.wait_for(timeout=30000)
    measurements = options.evaluate_all("""els => els.map(el => {
        const r=el.getBoundingClientRect(); let top=0,bottom=innerHeight;
        for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);
            if(/auto|scroll|hidden|clip/.test(s.overflowY)){const a=p.getBoundingClientRect();top=Math.max(top,a.top);bottom=Math.min(bottom,a.bottom);}}
        return {text:el.textContent,top:r.top,bottom:r.bottom,height:r.height,clipTop:top,clipBottom:bottom,
            whole:r.height>0 && r.top>=top && r.bottom<=bottom && r.left>=0 && r.right<=innerWidth};
    })""")
    ctx.inst.evidence.save('destination-viewport', measurements)
    browser.screenshot('destination-options')
    require(sum(row['whole'] for row in measurements) > 1, 'Destination shows fewer than two whole selectable option rows: ' + str(measurements))
    for index in range(options.count()):
        option = options.nth(index)
        option.scroll_into_view_if_needed(timeout=5000)
        reachable = option.evaluate('el => { const r=el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }')
        require(reachable, 'Destination option remains outside the viewport after scrolling: ' + option.inner_text())
    browser.screenshot('destination-last-option')


def regression_2444(ctx):
    from playwright.sync_api import expect
    browser = ui(ctx)
    form = agent_form(ctx)
    catalog = ctx.inst.request('GET', '/api/v1/agents/tools', label='declared-tools')['tools']
    require(catalog, 'Tool catalog is empty')
    toggle = form.get_by_role('button', name=re.compile('^Tools and combinations'))
    if toggle.get_attribute('aria-expanded') == 'false':
        toggle.click()
    reference = form.get_by_role('region', name='Tool reference', exact=True)
    for tool in catalog:
        reference.get_by_role('searchbox', name='Search tool reference', exact=True).fill(tool['id'])
        row = reference.locator('[data-tool-id="' + tool['id'] + '"]').first
        description = row.locator('.tool-reference__description')
        expect(description).to_have_text(tool.get('llm_description') or 'No description declared.')
        description.scroll_into_view_if_needed(timeout=5000)
        metrics = description.evaluate("""el => {
            const s=getComputedStyle(el); const r=el.getBoundingClientRect();
            return {lineClamp:s.webkitLineClamp,overflow:s.overflowY,height:r.height,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
        }""")
        require(metrics['lineClamp'] in ('none', '0', '') and metrics['scrollHeight'] <= metrics['clientHeight'] + 1,
                'Full description is clipped for ' + tool['id'] + ': ' + str(metrics))
    reference.get_by_role('searchbox', name='Search tool reference', exact=True).fill('')
    traits = ctx.inst.request('GET', '/api/v1/agents/traits', label='declared-tool-combinations')['traits']
    declared = [trait for trait in traits if trait.get('tools')]
    require(declared, 'Installed capabilities declare no tool combinations')
    combinations = reference.get_by_role('region', name='Tool combinations', exact=True)
    expect(combinations.locator('details')).to_have_count(len(declared), timeout=30000)
    for trait in declared:
        combination = combinations.locator('details[data-trait-id="' + trait['id'] + '"]')
        combination.locator('summary').click()
        for guidance in (trait.get('description'), trait.get('prompt')):
            if guidance:
                expect(combination).to_contain_text(guidance)
        action = combination.get_by_role('button')
        expect(action).to_have_count(1)
        expect(action).to_be_visible()
        active = form.get_by_role('button', name='Remove ' + (trait.get('title') or trait['id']) + ' capability', exact=True).count() > 0
        assert_capability_action({'label': action.inner_text().strip(), 'disabled': not action.is_enabled(), 'active': active})
    ctx.inst.evidence.save('full-description-count', {'tools': len(catalog), 'combinations': len(declared)})
    browser.screenshot('agent-tool-reference')


READY = ('jira_regression_setup',)
REGISTRY = [
    Scenario('jira_regression_setup', 'full', jira_setup, ('first_agent',), model=True, issues=('R4-I2', 'SMOKE-FRAME-REDACTION-STALL', 'SMOKE-JIRA-PUBLISHED-PROFILE', 'SMOKE-RESTART-REGISTRY-SOURCE-FILENAMES', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario('regression_EE2_2517', 'full', regression_2517, READY, issues=('EE2-2517',), model=True, features=(
        features('agents', 'http', 'POST /api/v1/user-agents', 'PUT /api/v1/user-agents/{id}', 'GET /api/v1/user-agents/{id}') +
        features('knowledge', 'capability', KB_READER, KB_WRITER) + features('fireflies', 'capability', 'kickside.fireflies.traits:reader'))),
    Scenario('regression_EE2_2465', 'full', regression_2465, READY, issues=('EE2-2465',), model=True, features=features('automation', 'mcp_tool', 'kickside.automation.agent:automations_read')),
    Scenario('regression_EE2_2459', 'full', regression_2459, READY, issues=('EE2-2459',), model=True, features=(
        features('automation', 'http', 'POST /api/v1/automations', 'GET /api/v1/automations/{id}/config', 'GET /api/v1/automations/{id}/status') + features('sync', 'automation', 'kickside.sync:sync') +
        features('fireflies', 'source', 'kickside.fireflies.source:transcripts') + features('knowledge', 'sink', 'kickside.knowledge.sink:kb_embed'))),
    Scenario('regression_EE2_2516', 'full', regression_2516, ('first_agent',), issues=('EE2-2516', 'R4-P02', 'SMOKE-FRAME-REDACTION-STALL'), model=True, features=features('uploads', 'http', 'POST /api/v1/uploads', 'GET /api/v1/uploads/{uuid}')),
    Scenario('regression_EE2_2463_kb_sync', 'full', regression_2463_sync, READY, issues=('EE2-2463',), model=True, features=features('knowledge', 'http',
        'POST /api/v1/knowledge/{id}/ingest-upload', 'GET /api/v1/knowledge/list') + features('kb10', 'http', 'GET /api/v1/kb10/{id}/browse')),
    Scenario('regression_EE2_2463_xlsx', 'full', regression_2463_xlsx, READY, issues=('EE2-2463',), model=True, features=features('knowledge', 'http',
        'POST /api/v1/knowledge/{id}/ingest-upload') + features('kb10', 'http', 'GET /api/v1/kb10/{id}/browse')),
    Scenario('regression_EE2_2460', 'full', regression_2460, READY, issues=('EE2-2460',), features=features('automation', 'http',
        'POST /api/v1/automations', 'POST /api/v1/automations/{id}/actions/{method}', 'GET /api/v1/automations/{id}/state', 'GET /api/v1/automations/{id}/status')),
    Scenario('regression_EE2_2445', 'full', regression_2445, READY, issues=('EE2-2445', 'OAUTH-PUBLIC-CONNECTION-IDENTITY'), features=(features('google', 'connection_provider', 'kickside.google:google') +
        features('google', 'mcp_tool', 'kickside.google.traits:gmail_read_tool'))),
    Scenario('regression_EE2_2439', 'full', regression_2439, READY, issues=('EE2-2439',), model=True, features=(features('channel', 'automation', 'kickside.channel.responder:channel_responder') +
        features('discord', 'connection_provider', 'kickside.discord.connection:discord_connection') + features('automation', 'http', 'POST /api/v1/automations'))),
    Scenario('regression_EE2_2515', 'full', regression_2515, READY, issues=('EE2-2515',), features=features('automation', 'http', 'GET /api/v1/automations/sinks')),
    Scenario('regression_EE2_2444', 'full', regression_2444, READY, issues=('EE2-2444',), features=features('agents', 'http', 'GET /api/v1/agents/tools', 'GET /api/v1/agents/traits')),
]

REGISTRY.append(Scenario('regression_responder_state_refresh', 'full', regression_responder_state_refresh, READY,
    issues=('R5-P01',), model=True, features=features('automation', 'http',
        'GET /api/v1/automations', 'GET /api/v1/automations/{id}/state')))
