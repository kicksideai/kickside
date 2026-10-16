"""UI-issued credentials enforce live component grants in real MCP sessions."""
import hashlib
import json
import re
import uuid
from urllib.parse import urlsplit

from harness import Scenario, require
from mcp_client import MCPClient, KICKSIDE_META_TOOLS, KEEPER_META_TOOLS

READER = 'kickside.automation.traits:reader'
MANAGER = 'kickside.automation.traits:manager'
MCP_FEATURES = (
    'kickside/mcp|http|POST /api/public/mcp',
    'kickside/mcp|http|POST /api/v1/mcp/credentials',
    'kickside/mcp|http|POST /api/v1/mcp/credentials/{id}/revoke',
    'kickside/automation|mcp_tool|kickside.automation.agent:automations_read',
    'kickside/component|http|POST /api/v1/component-access/share/{id}',
    'kickside/users|http|PUT /api/v1/users/{id}/groups',
)


def sync_fixtures(ctx, titles, *, parents=None, expression=None):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    source = inst.request('POST', '/api/v1/webhooks', {'label': 'Northwind MCP source',
        'schema': {'type': 'object'}}, label='mcp-source')['webhook']
    inst.redactor.add(source['secret'])
    inst.cleanup.add('MCP source', lambda: inst.request('DELETE', '/api/v1/webhooks/' + source['webhook_id']))
    payload = 'Northwind MCP result NW-731'
    if expression is None:
        expression = json.dumps({'title': 'Northwind MCP item', 'content': payload})
    rows = []
    for index, title in enumerate(titles):
        spec = {'title': title, 'enabled': False,
            'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received',
                'config': {'thread_id': source['webhook_id']}, 'backfill': 'none'},
            'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
            'transform': {'kind': 'expr', 'expr': expression}}
        body = {'type': 'kickside.sync:sync', 'input': spec}
        if parents:
            body['parent_id'] = parents[index]
        aid = inst.request('POST', '/api/v1/automations', body, label='mcp-sync-install')['id']
        inst.cleanup.add('MCP sync', lambda aid=aid: inst.request('DELETE', '/api/v1/automations/' + aid))
        rows.append({'id': aid, 'title': title, 'expression': expression})
    return rows


def grant(ctx, component, subject, *, group=False, revoke=False):
    body = {'subject_type': 'group' if group else 'user', 'subject_id': subject}
    body.update({'action': 'revoke'} if revoke else {'access_mask': 1})
    ctx.inst.request('POST', '/api/v1/component-access/share/' + component,
        body, label='mcp-component-grant')


def folder_fixture(ctx, title, parent=None):
    body = {'type': 'folder', 'name': title}
    if parent:
        body['parent_id'] = parent['id']
    entry = ctx.inst.request('POST', '/api/v1/workspace/entries', body, label='mcp-folder')['entry']
    ctx.inst.cleanup.add('MCP folder', lambda: ctx.inst.request('DELETE', '/api/v1/workspace/entries/' + entry['id']))
    return {'id': entry['id'], 'title': title}


def ui_credential(ctx, components, *, role='write'):
    from scenarios_access import actor_browser, renew, request
    browser = actor_browser(ctx, role)
    browser.frame.locator('.sidebar').get_by_text('MCP', exact=True).click()
    browser.frame.locator('kickside-mcp').get_by_role('button', name='New credential', exact=True).first.click()
    dialog = browser.frame.get_by_role('dialog', name='New MCP credential', exact=True)
    dialog.get_by_label('Label', exact=True).fill('Northwind MCP ' + uuid.uuid4().hex[:8])
    for component in components:
        dialog.locator('.kx-browse-row').filter(has_text=component['title']).get_by_role('button', name='Add', exact=True).click()
    picker = dialog.locator('wc-agent-trait-picker')
    picker.get_by_role('combobox', name='Search capabilities to add', exact=True).click()
    browser.frame.get_by_role('option').filter(has=browser.frame.get_by_text('Automations Reader', exact=True)).click()
    with browser.page.expect_response(lambda r: '/api/v1/mcp/credentials' in r.url and r.request.method == 'POST') as response:
        dialog.get_by_role('button', name='Create credential', exact=True).click()
    minted = response.value.json()
    require(response.value.status == 200 and minted.get('credential', {}).get('token'), 'UI credential creation fails')
    credential = minted['credential']
    ctx.inst.redactor.add(credential['token'])
    require(credential['token'] in dialog.locator('.kx-token code').all_text_contents(), 'UI does not reveal its issued token')
    body = response.value.request.post_data_json
    require(set(body['whitelist_component_ids']) == {c['id'] for c in components}, 'UI loses the selected component scope')
    require(body.get('allowed_tool_ids', []) == [], 'UI credential adds an unselected tool grant')
    require(body['allowed_trait_ids'] == [READER] and body['default_active_trait_ids'] == [READER], 'UI loses its selected capability')
    def revoke():
        renew(ctx)
        request(ctx, role, 'POST', '/mcp/credentials/' + credential['credential_id'] + '/revoke', {})
    ctx.inst.cleanup.add('UI MCP credential', revoke)
    dialog.get_by_role('button', name='Done', exact=True).click()
    browser.clean(ctx.state['access_browser_error_start'])
    return credential


def denied(client, name, arguments):
    result = client.tool_result(name, arguments)
    require(result.get('isError') is True, 'Denied MCP call returns a successful result')
    text = client.text(result)
    require(re.search(r'permission|denied|not accessible|not found|not available|not allowed|unavailable|unknown tool|insufficient MCP scope', text, re.I),
            'Denied MCP call has no readable typed reason: ' + text[:1000])
    return text


def listed_ids(client):
    rows = client.call('AutomationsRead', {'action': 'list'})
    require(rows.get('success') is True and rows['count'] == len(rows['automations']), 'MCP automation list is malformed')
    return {row['id'] for row in rows['automations']}


def read_config(client, row):
    value = client.call('AutomationsRead', {'action': 'read_config', 'id': row['id']})
    require(value.get('success') is True and value['id'] == row['id'], 'Granted MCP read has no resource identity')
    require(isinstance(value.get('config'), dict), 'MCP read loses the published configuration field')
    require(value['config']['transform']['expr'] == row['expression'], 'MCP truncates or changes the stored configuration')
    return value


def mcp_kickside_credential_lifecycle(ctx):
    from scenarios_access import renew, request
    uid = ctx.state['access_users']['write']['id']
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups',
        {'groups': ['app.security:members', 'app.security:admin']}, label='mcp-group-add')
    renew(ctx)
    suffix = uuid.uuid4().hex[:8]
    rows = sync_fixtures(ctx, ['Northwind MCP ' + name + ' ' + suffix for name in ('direct', 'group', 'outside', 'stranger')])
    for row in (rows[0], rows[2]):
        grant(ctx, row['id'], uid)
    grant(ctx, rows[1]['id'], 'app.security:admin', group=True)
    credential = ui_credential(ctx, rows[:2])
    client = MCPClient(ctx.inst, credential['token'], '/api/public/mcp', stateful=False)
    client.initialize()
    require(client.tools() == KICKSIDE_META_TOOLS | {'AutomationsRead'}, 'Credential tool surface leaks or omits a tool')
    require(listed_ids(client) == {row['id'] for row in rows[:2]}, 'Credential list leaks or omits a granted in-scope automation')
    for row in rows[:2]:
        value = read_config(client, row)
    for row in rows[2:]:
        denied(client, 'AutomationsRead', {'action': 'read_config', 'id': row['id']})
    denied(client, 'AutomationsManage', {'action': 'pause', 'id': rows[0]['id']})
    long_name = 'unavailable_' + 'x' * 100000
    error = denied(client, long_name, {})
    require(long_name in error, 'MCP truncates its large error result')
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:members']}, label='mcp-group-remove')
    revoked = client.request('tools/call', {'name': 'AutomationsRead',
        'arguments': {'action': 'read_config', 'id': rows[0]['id']}},
        'mcp-membership-reduction-next-call', expect=(401,))
    require(revoked.get('error', {}).get('code') == -32001 and
            revoked['error'].get('message') == 'delegated authority is revoked',
            'Group removal does not revoke the existing delegated credential')
    renew(ctx)
    request(ctx, 'write', 'GET', '/automations/' + rows[1]['id'] + '/config', hidden=True)
    direct = request(ctx, 'write', 'GET', '/automations/' + rows[0]['id'] + '/config')
    require(direct['config']['transform']['expr'] == rows[0]['expression'],
            'Group reduction loses the unchanged direct resource grant')
    credential = ui_credential(ctx, rows[:1])
    client = MCPClient(ctx.inst, credential['token'], '/api/public/mcp', stateful=False)
    client.initialize()
    denied(client, 'AutomationsRead', {'action': 'read_config', 'id': rows[1]['id']})
    read_config(client, rows[0])
    require(listed_ids(client) == {rows[0]['id']}, 'Group removal does not affect the next MCP list')
    require(client.tools() == KICKSIDE_META_TOOLS | {'AutomationsRead'}, 'Group removal loses the still-granted reader surface')
    renew(ctx)
    request(ctx, 'write', 'POST', '/mcp/credentials/' + credential['credential_id'] + '/revoke', {})
    revoked = client.request('tools/call', {'name': 'AutomationsRead', 'arguments': {'action': 'list'}}, 'mcp-revoked-next-call', expect=(401,))
    require(revoked.get('error', {}).get('code') == -32001 and revoked['error'].get('message'), 'Revocation returns no typed authentication error')
    ctx.inst.evidence.save('mcp-credential-contract', {'scope': [r['id'] for r in rows[:2]],
        'tools': sorted(KICKSIDE_META_TOOLS | {'AutomationsRead'}), 'transports': sorted(client.transports),
        'large_error_bytes': len(error), 'revoked': True})


def mcp_kickside_subtree(ctx):
    from scenarios_access import renew
    renew(ctx)
    suffix = uuid.uuid4().hex[:8]
    parent = folder_fixture(ctx, 'Northwind MCP subtree ' + suffix)
    nested = folder_fixture(ctx, 'Northwind MCP nested ' + suffix, parent)
    rows = sync_fixtures(ctx, ['Northwind MCP ' + name + ' ' + suffix for name in ('child', 'grandchild', 'outside')],
        parents=[parent['id'], nested['id'], None])
    uid = ctx.state['access_users']['write']['id']
    grant(ctx, parent['id'], uid)
    grant(ctx, rows[2]['id'], uid)
    credential = ui_credential(ctx, [parent])
    client = MCPClient(ctx.inst, credential['token'], '/api/public/mcp', stateful=False)
    client.initialize()
    require(client.tools() == KICKSIDE_META_TOOLS | {'AutomationsRead'}, 'Subtree credential tool surface differs')
    require(listed_ids(client) == {row['id'] for row in rows[:2]}, 'Subtree list omits a descendant or leaks an outside grant')
    for row in rows[:2]:
        read_config(client, row)
    denied(client, 'AutomationsRead', {'action': 'read_config', 'id': rows[2]['id']})


def mcp_keeper_ui_transport(ctx):
    client = MCPClient(ctx.inst, ctx.state['keeper_ui_token'], '/keeper-mcp/')
    initialized = client.initialize()
    client.open_events()
    client.call('reset_traits', {})
    client.notification('notifications/tools/list_changed')
    require(client.tools() == KEEPER_META_TOOLS, 'Keeper root token default surface differs from its declared meta-tools')
    client.call('use_trait', {'ids': [READER]})
    client.notification('notifications/tools/list_changed')
    require(client.tools() == KEEPER_META_TOOLS | {'AutomationsRead'}, 'Keeper reader activation leaks or omits a tool')
    rows = sync_fixtures(ctx, ['Northwind Keeper direct ' + uuid.uuid4().hex[:8]])
    read_config(client, rows[0])
    denied(client, 'AutomationsManage', {'action': 'pause', 'id': rows[0]['id']})
    require('text/event-stream' in client.transports, 'Keeper does not exercise its declared SSE response transport')
    ctx.inst.evidence.save('mcp-keeper-ui-contract', {'server': initialized['serverInfo'],
        'tools': sorted(client.tools()), 'transports': sorted(client.transports)})


def open_keeper_application(ctx, browser):
    from scenarios_core import system
    system(ctx, 'Modules')
    browser.settle()
    link = browser.frame.get_by_role('link', name='Keeper', exact=False)
    destination = urlsplit(link.get_attribute('href')).path.rstrip('/')
    if link.get_attribute('target') == '_blank':
        with browser.page.expect_popup() as popup:
            link.click()
        browser.page = popup.value
        browser.watch(browser.page)
    else:
        link.click()
    def mounted():
        matches = [frame for frame in browser.page.frames if urlsplit(frame.url).path.rstrip('/') == destination]
        require(len(matches) <= 1, 'Host mounts multiple Keeper applications')
        if not matches:
            return None
        children = [frame for frame in matches[0].child_frames
                    if frame.name == 'wippy:page:' + destination.rsplit('/', 1)[-1]]
        require(len(children) <= 1, 'Host mounts multiple Keeper application frames')
        if not children:
            return None
        path, current = [], children[0]
        while current.parent_frame:
            require(current.name, 'Host mounts an unnamed Keeper application ancestor')
            path.insert(0, current.name)
            current = current.parent_frame
        return path
    path = ctx.inst.wait(mounted, 'Keeper application mount', seconds=30, pump=browser.page.wait_for_timeout)
    frame = browser.page
    for name in path:
        frame = frame.frame_locator('iframe[name=' + json.dumps(name) + ']')
    frame.get_by_role('button', name='Settings', exact=True).wait_for(timeout=30000)
    ctx.inst.evidence.save('keeper-ui-frames', [{'name': f.name, 'url': f.url} for f in browser.page.frames])
    return frame


def keeper_ui(ctx, role):
    from scenarios_access import actor_browser
    browser = actor_browser(ctx, role)
    frame = open_keeper_application(ctx, browser)
    from scenarios_access import request
    scopes = request(ctx, role, 'GET', '/keeper/mcp/scopes')
    tokens = request(ctx, role, 'GET', '/keeper/mcp/tokens')
    require(isinstance(scopes['presets'], list), 'Preset collection is not an array')
    for preset in scopes['presets']:
        require(isinstance(preset['scopes'], list) and isinstance(preset['default_active'], list),
                'Preset fields are not arrays')
    require(isinstance(tokens['tokens'], list), 'Token collection is not an array')
    for token in tokens['tokens']:
        require(isinstance(token['scopes'], list) and isinstance(token['default_active'], list),
                'Token fields are not arrays')
    ctx.inst.evidence.save('keeper-token-array-shapes', {'presets': scopes['presets'],
        'credential_rows': [{k: token.get(k) for k in ('token_id', 'scopes', 'default_active', 'revoked')}
                   for token in tokens['tokens']]})
    frame.get_by_role('button', name='Settings', exact=True).click()
    frame.get_by_role('button', name='MCP', exact=True).click()
    browser.settle()
    ctx.inst.evidence.save('keeper-mcp-navigation', {'url': browser.page.url,
        'errors': browser.errors[ctx.state['access_browser_error_start']:]})
    browser.clean(ctx.state['access_browser_error_start'])
    frame.get_by_role('button', name='New Token', exact=True).wait_for(timeout=30000)
    return browser, frame


def issue_keeper_ui(ctx, uid, label):
    browser, frame = keeper_ui(ctx, 'read')
    frame.get_by_role('button', name='New Token', exact=True).click()
    dialog = frame.locator('.dialog-box')
    dialog.get_by_placeholder('e.g. Claude Code Dev', exact=True).fill(label)
    dialog.get_by_role('button', name='Automations Reader', exact=True).click()
    with browser.page.expect_response(lambda r: '/api/v1/keeper/mcp/tokens' in r.url and r.request.method == 'POST') as response:
        dialog.get_by_role('button', name='Create', exact=True).click()
    minted = response.value.json()
    require(response.value.status == 200 and minted.get('token', {}).get('token'), 'Keeper UI reader issuance fails')
    token = minted['token']['token']
    ctx.inst.redactor.add(token)
    require(dialog.locator('.token-val').inner_text() == token, 'Keeper UI does not reveal the issued reader token')
    body = response.value.request.post_data_json
    require(body['identity'] == uid and body['scopes'] == ['state.read'] and
        body['trait_filter'] == {'include_ids': [READER]} and body['default_active'] == [READER],
        'Keeper UI loses the subject, capability allowlist or scopes')
    dialog.get_by_role('button', name='Done', exact=True).click()
    browser.settle()
    browser.clean(ctx.state['access_browser_error_start'])
    return token


def revoke_keeper_ui(ctx, label, token_id, role='read'):
    browser, frame = keeper_ui(ctx, role)
    frame.locator('.t-row').filter(has_text=label).get_by_role('button', name='Revoke', exact=True).click()
    with browser.page.expect_response(lambda r: '/api/v1/keeper/mcp/tokens/revoke' in r.url and r.request.method == 'POST') as response:
        frame.locator('.dialog-box').get_by_role('button', name='Revoke', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success'), 'Keeper UI revocation fails')
    browser.settle()
    browser.clean(ctx.state['access_browser_error_start'])


def issue_keeper_api(ctx, uid, label):
    from scenarios_access import request
    scopes = request(ctx, 'read', 'GET', '/keeper/mcp/scopes')
    presets = [p for p in scopes['presets'] if p['registry_id'] == 'kickside.automation.mcp:reader']
    require(len(presets) == 1, 'Keeper does not discover the declared Automations Reader preset')
    preset = presets[0]
    body = {'identity': uid, 'label': label, 'preset': preset['id']}
    for field in ('scopes', 'access_mode', 'trait_filter', 'default_active'):
        body[field] = preset[field]
    created = request(ctx, 'read', 'POST', '/keeper/mcp/tokens', body)
    require(created.get('success') and created.get('token', {}).get('token'), 'Keeper reader issuance fails')
    return created['token']['token']


def revoke_keeper_api(ctx, label, token_id):
    from scenarios_access import request
    result = request(ctx, 'read', 'POST', '/keeper/mcp/tokens/revoke', {'token': token_id})
    require(result.get('success'), 'Keeper reader revocation fails')


def keeper_reader_lifecycle(ctx, issue, revoke):
    from scenarios_access import renew, request
    uid = ctx.state['access_users']['read']['id']
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups',
        {'groups': ['app.security:members', 'app.security:admin']}, label='keeper-group-add')
    renew(ctx)
    suffix = uuid.uuid4().hex[:8]
    parent = folder_fixture(ctx, 'Northwind Keeper subtree ' + suffix)
    nested = folder_fixture(ctx, 'Northwind Keeper nested ' + suffix, parent)
    rows = sync_fixtures(ctx, ['Northwind Keeper ' + name + ' ' + suffix for name in ('direct', 'child', 'grandchild', 'stranger')],
        parents=[None, parent['id'], nested['id'], None])
    grant(ctx, rows[0]['id'], uid)
    grant(ctx, parent['id'], 'app.security:admin', group=True)
    label = 'Northwind Keeper reader ' + suffix
    token = issue(ctx, uid, label)
    ctx.inst.redactor.add(token)
    token_id = hashlib.sha256(token.encode()).hexdigest()
    ctx.inst.cleanup.add('Keeper reader', lambda: ctx.inst.request('POST', '/api/v1/keeper/mcp/tokens/revoke', {'token': token_id}))
    client = MCPClient(ctx.inst, token, '/keeper-mcp/')
    client.initialize()
    client.open_events()
    expected_tools = (KEEPER_META_TOOLS - {'call_tool'}) | {'AutomationsRead'}
    require(client.tools() == expected_tools, 'Keeper reader scope leaks or omits a granted tool')
    client.call('drop_trait', {'ids': [READER]})
    client.notification('notifications/tools/list_changed')
    require(client.tools() == KEEPER_META_TOOLS - {'call_tool'}, 'Keeper does not remove its deactivated reader tool')
    client.call('use_trait', {'ids': [READER]})
    client.notification('notifications/tools/list_changed')
    require(client.tools() == expected_tools, 'Keeper omits its reactivated granted reader tool')
    native = request(ctx, 'read', 'GET', '/automations')['automations']
    require(listed_ids(client) == {row['id'] for row in native}, 'Keeper list differs from the live principal grants')
    for row in rows[:3]:
        read_config(client, row)
    denied(client, 'AutomationsRead', {'action': 'read_config', 'id': rows[3]['id']})
    denied(client, 'AutomationsManage', {'action': 'pause', 'id': rows[0]['id']})
    denied(client, 'use_trait', {'ids': [MANAGER]})
    require(client.tools() == expected_tools, 'Keeper trait activation escapes the token allowlist')
    name = 'unavailable_' + 'x' * 100000
    require(name in denied(client, name, {}), 'Keeper truncates its large error result')
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:members']}, label='keeper-group-remove')
    for row in rows[1:3]:
        denied(client, 'AutomationsRead', {'action': 'read_config', 'id': row['id']})
    read_config(client, rows[0])
    require(listed_ids(client) == {rows[0]['id']}, 'Keeper retains removed group subtree grants')
    require(client.tools() == expected_tools, 'Keeper loses the still-granted reader tool after group removal')
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups',
        {'groups': ['app.security:members', 'app.security:admin']}, label='keeper-revoke-admin')
    renew(ctx)
    revoke(ctx, label, token_id)
    revoked = client.request('tools/call', {'name': 'AutomationsRead', 'arguments': {'action': 'list'}},
        'keeper-revoked-next-call', expect=(401,))
    require(revoked.get('error', {}).get('code') == -32000 and revoked['error'].get('message'), 'Keeper revocation returns no typed authentication reason')
    client.revoked = True
    ctx.inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:members']}, label='keeper-group-reset')
    renew(ctx)
    require('text/event-stream' in client.transports, 'Keeper reader does not exercise SSE')
    ctx.inst.evidence.save('mcp-keeper-reader-contract', {'tools': sorted(expected_tools),
        'transports': sorted(client.transports), 'direct': rows[0]['id'], 'subtree': parent['id'], 'revoked': True})
    grant(ctx, rows[0]['id'], uid, revoke=True)
    grant(ctx, parent['id'], 'app.security:admin', group=True, revoke=True)


def mcp_keeper_credential_lifecycle(ctx):
    keeper_reader_lifecycle(ctx, issue_keeper_ui, revoke_keeper_ui)


def mcp_keeper_scoped_transport(ctx):
    keeper_reader_lifecycle(ctx, issue_keeper_api, revoke_keeper_api)


ACCESS_SCENARIOS = [
    Scenario('mcp_kickside_credential_lifecycle', 'full', mcp_kickside_credential_lifecycle,
        ('access_users',), features=MCP_FEATURES, issues=('R4-I8', 'SMOKE-MCP-REDUCTION-FENCE-LIFECYCLE'), instance_setup=True),
    Scenario('mcp_kickside_subtree', 'full', mcp_kickside_subtree,
        ('mcp_kickside_credential_lifecycle',), features=MCP_FEATURES, issues=('R4-I8',), instance_setup=True),
    Scenario('mcp_keeper_scoped_transport', 'full', mcp_keeper_scoped_transport,
        ('mcp_kickside_subtree',), features=(
            'kickside/automation|mcp_tool|kickside.automation.agent:automations_read',
            'kickside/component|http|POST /api/v1/component-access/share/{id}',
            'kickside/users|http|PUT /api/v1/users/{id}/groups',
            'chestor/workspace|http|POST /api/v1/workspace/entries'), instance_setup=True),
    Scenario('mcp_keeper_credential_lifecycle', 'full', mcp_keeper_credential_lifecycle,
        ('mcp_kickside_subtree',), features=(
            'kickside/hub|navigation|kickside.hub:tab.keeper',
            'kickside/automation|mcp_tool|kickside.automation.agent:automations_read',
            'kickside/component|http|POST /api/v1/component-access/share/{id}',
            'kickside/users|http|PUT /api/v1/users/{id}/groups',
            'chestor/workspace|http|POST /api/v1/workspace/entries'), instance_setup=True),
]

KEEPER_SCENARIOS = [
    Scenario('mcp_keeper_ui_transport', 'full', mcp_keeper_ui_transport,
        ('platform_onboarding',), issues=('KEEPER-MCP-COLLECTION-ARRAYS',), features=(
            'kickside/automation|mcp_tool|kickside.automation.agent:automations_read',
            'kickside/sync|automation|kickside.sync:sync'), instance_setup=True),
]
