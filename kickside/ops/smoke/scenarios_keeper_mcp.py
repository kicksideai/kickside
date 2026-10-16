"""Declared automation principals use live Users authority through Keeper MCP."""
import hashlib
import json
import re
import uuid

from harness import Scenario, require
from mcp_client import MCPClient



def mint(inst, label, auth=None, scoped=False):
    body = {'label': label, 'scopes': ['tests.run'] if scoped else ['mcp.root']}
    if scoped:
        body.update(access_mode='tools_only', tool_filter={'include_ids': ['keeper.agents.tools:test_endpoint']})
    created = inst.request('POST', '/api/v1/keeper/mcp/tokens', body, auth=auth, label='keeper-mint')['token']
    inst.redactor.add(created['token'])
    inst.cleanup.add('Keeper bearer', lambda: inst.request('POST', '/api/v1/keeper/mcp/tokens/revoke',
        {'token': hashlib.sha256(created['token'].encode()).hexdigest()}, label='keeper-token-revoke'))
    return MCPClient(inst, created['token'], '/keeper-mcp/')


def endpoint_payload(text):
    body = re.search(r'Response body \(\d+ bytes\): (.*?)(?:\n\nSTATUS MISMATCH:|\Z)', text, re.S)
    require(body is not None, 'Keeper endpoint response has no JSON body: ' + text)
    return json.loads(body.group(1))


def assert_access_denial(text):
    require('live principal groups are required' not in text, 'Member MCP actor lacks live groups: ' + text)
    payload = endpoint_payload(text)
    require(re.search(r'-> (403|404)\b', text) and payload.get('success') is False
            and payload.get('error', {}).get('code') in ('access_denied', 'not_found'),
            'Member denial is not the target access error: ' + text)


def check_keeper_automation_access(ctx, owner):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    inst.login()
    source = inst.request('POST', '/api/v1/webhooks', {'label': 'EE2-2562 source', 'schema': {'type': 'object'}},
                          label='keeper-source')['webhook']
    inst.redactor.add(source['secret'])
    inst.cleanup.add('Keeper webhook', lambda: inst.request('DELETE', '/api/v1/webhooks/' + source['webhook_id']))
    spec = {'title': 'EE2-2562 Keeper sync', 'enabled': False,
            'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received',
                        'config': {'thread_id': source['webhook_id']}, 'backfill': 'none'},
            'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
            'transform': {'kind': 'expr', 'expr': '{"title":"EE2-2562","content":"Keeper host groups"}'}}
    owner.initialize()
    owner.call('use_trait', {'ids': ['kickside.automation.traits:manager', 'keeper.agents.traits.inspect:test_runner']})
    installed = owner.call('AutomationsManage', {'action': 'install', 'type': 'kickside.sync:sync', 'input': spec})
    require(installed.get('success') is True and installed.get('id'), 'Keeper sync install fails')
    aid = installed['id']
    def track(automation_id, client):
        def remove():
            result = client.call('test_endpoint', {'method': 'DELETE', 'path': '/api/v1/automations/' + automation_id,
                'expected_status': 200})
            require('-> 200' in result and 'STATUS MISMATCH' not in result
                    and endpoint_payload(result).get('success') is True, 'Keeper automation cleanup fails: ' + result)
        inst.cleanup.add('Keeper sync', remove, scope='scenario')
    track(aid, owner)
    artifact = inst.request('GET', '/api/v1/automations/' + aid + '/export', label='keeper-export')['artifact']
    imported = owner.call('AutomationsManage', {'action': 'import', 'artifact': artifact})
    require(imported.get('success') is True and imported.get('id') != aid, 'Keeper sync import fails')
    track(imported['id'], owner)
    portable = inst.request('GET', '/api/v1/automations/' + aid + '/config', label='keeper-config')['config']['_portable_input']
    portable['title'] = 'EE2-2562 reconfigured'
    changed = owner.call('AutomationsManage', {'action': 'reconfigure', 'id': aid, 'input': portable})
    require(changed.get('success') is True, 'Keeper sync reconfigure fails')
    for method, path, body in [('POST', '/api/v1/automations/import', {'artifact': artifact}),
                              ('PUT', '/api/v1/automations/' + aid, {'input': portable})]:
        result = owner.call('test_endpoint', {'method': method, 'path': path, 'body': body, 'expected_status': 200})
        require('-> 200' in result and 'STATUS MISMATCH' not in result and 'live principal groups are required' not in result,
                'Keeper endpoint mutation fails: ' + result)
        if method == 'POST':
            payload = endpoint_payload(result)
            require(payload.get('success') is True and payload.get('id'), 'Keeper HTTP import returns no automation')
            track(payload['id'], owner)
    email = 'keeper-member-' + uuid.uuid4().hex[:8] + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Keeper member', 'groups': ['app.security:members', 'app.security:admin']},
        expect=(201,), label='keeper-member-create')['user']
    login = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='keeper-member-login')['token']
    inst.redactor.add(login)
    member = mint(inst, 'EE2-2562 member', auth=login, scoped=True)
    inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': ['app.security:members']},
                 label='keeper-member-groups')
    inst.request('POST', '/api/v1/component-access/share/' + aid,
        {'subject_type': 'user', 'subject_id': user['user_id'], 'access_mask': 1}, label='keeper-member-read-grant')
    member.initialize()
    denied = member.call('test_endpoint', {'method': 'PUT', 'path': '/api/v1/automations/' + aid,
        'body': {'input': portable}, 'expected_status': 403})
    assert_access_denial(denied)
    denied_install = member.call('test_endpoint', {'method': 'POST', 'path': '/api/v1/automations',
        'body': {'type': 'kickside.sync:sync', 'input': spec}, 'expected_status': 403})
    assert_access_denial(denied_install)
    source_share = '/api/v1/component-access/share/' + source['webhook_id']
    group = {'subject_type': 'group', 'subject_id': 'app.security:members'}
    inst.request('POST', source_share, {**group, 'access_mask': 1}, label='keeper-source-group-read')
    granted = member.call('test_endpoint', {'method': 'POST', 'path': '/api/v1/automations',
        'body': {'type': 'kickside.sync:sync', 'input': spec}, 'expected_status': 200})
    require('-> 200' in granted and 'STATUS MISMATCH' not in granted, 'Group-authorized Keeper install fails: ' + granted)
    payload = endpoint_payload(granted)
    require(payload.get('success') is True and payload.get('id'), 'Group-authorized Keeper install returns no automation')
    member_aid = payload['id']
    track(member_aid, member)
    inst.request('POST', source_share, {**group, 'action': 'revoke'}, label='keeper-source-group-revoke')
    revoked = member.call('test_endpoint', {'method': 'PUT', 'path': '/api/v1/automations/' + member_aid,
        'body': {'input': spec}, 'expected_status': 403})
    assert_access_denial(revoked)
    inst.evidence.save('EE2-2562', {'installed': aid, 'imported': imported['id'], 'member_denial': denied,
        'source_denial': denied_install, 'group_installed': member_aid, 'revoked_source_denial': revoked})
    return portable


def regression_EE2_2562_mcp_authority(ctx):
    check_keeper_automation_access(ctx, mint(ctx.inst, 'EE2-2562 owner'))


def regression_EE2_2562(ctx):
    from playwright.sync_api import expect
    from scenarios import nav
    portable = check_keeper_automation_access(ctx, MCPClient(ctx.inst, ctx.state['keeper_ui_token'], '/keeper-mcp/'))
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    nav(ctx, 'Automations')
    title = portable['title']
    row = browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
    expect(row).to_be_visible(timeout=30000)
    row.get_by_role('button', name='More actions for ' + title, exact=True).click()
    row.get_by_role('menuitem', name='Edit ' + title, exact=True).click()
    manage = browser.frame.locator('kickside-sync-manage')
    expect(manage.locator('[data-test="pl-title"]')).to_have_value(title, timeout=30000)
    expect(manage.locator('[data-test="sync-manage"]')).to_be_visible(timeout=30000)
    browser.screenshot('keeper-managed-sync-in-ui')
    manage.get_by_role('button', name='Cancel', exact=True).click()


REGISTRY = [Scenario('regression_EE2_2562', 'full', regression_EE2_2562, ('first_agent',),
    instance_setup=True, issues=('EE2-2562',), features=(
        'kickside/automation|mcp_tool|kickside.automation.agent:automations_manage',
        'kickside/automation|http|POST /api/v1/automations/import',
        'kickside/automation|http|POST /api/v1/automations',
        'kickside/automation|http|PUT /api/v1/automations/{id}',
        'kickside/sync|automation|kickside.sync:sync',
        'kickside/users|http|POST /api/public/user/token',
        'kickside/component|http|POST /api/v1/component-access/share/{id}',
    ))]


REGISTRY.append(Scenario('regression_EE2_2562_mcp_authority', 'full', regression_EE2_2562_mcp_authority, ('boot',),
    instance_setup=True, issues=('EE2-2562',), features=REGISTRY[0].features))


from mcp_contracts import KEEPER_SCENARIOS
REGISTRY.extend(KEEPER_SCENARIOS)


def regression_keeper_no_traits(ctx):
    from playwright.sync_api import expect
    from mcp_contracts import keeper_ui, revoke_keeper_ui
    browser, frame = keeper_ui(ctx, 'owner')
    frame.get_by_role('button', name='New Token', exact=True).click()
    dialog = frame.locator('.dialog-box')
    label = 'Northwind scoped token without traits ' + uuid.uuid4().hex[:8]
    dialog.get_by_placeholder('e.g. Claude Code Dev', exact=True).fill(label)
    scopes = ctx.inst.request('GET', '/api/v1/keeper/mcp/scopes', label='keeper-declared-scopes')['scopes']
    scope = next(s for s in scopes if s['id'] == 'state.read')
    dialog.locator('.scope-item').filter(has_text=scope['label']).get_by_role('checkbox').check()
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/keeper/mcp/tokens')) as response:
        dialog.get_by_role('button', name='Create', exact=True).click()
    minted = response.value.json()
    require(response.value.status == 200 and minted.get('token', {}).get('token'), 'Keeper cannot create a scoped token without traits')
    token = minted['token']
    ctx.inst.redactor.add(token['token'])
    require(token['scopes'] == ['state.read'] and not token.get('default_active'), 'Keeper token acquires unselected scopes or active traits')
    expect(dialog.locator('.token-val')).to_have_text(token['token'])
    dialog.get_by_role('button', name='Done', exact=True).click()
    row = frame.locator('.t-row').filter(has_text=label)
    expect(row).to_be_visible(timeout=30000)
    browser.screenshot('keeper-token-no-traits')
    revoke_keeper_ui(ctx, label, token.get('token_id'), role='owner')
    tokens = ctx.inst.request('GET', '/api/v1/keeper/mcp/tokens', label='keeper-revoked-tokens')['tokens']
    require(not [t for t in tokens if t['label'] == label and not t.get('revoked')], 'Keeper UI revocation leaves an active token')
    ctx.browser.screenshot('keeper-token-revoked')


REGISTRY.append(Scenario('regression_keeper_no_traits', 'full', regression_keeper_no_traits, ('first_agent',),
    issues=('KEEPER-U02', 'U02'), features=('kickside/hub|navigation|kickside.hub:tab.keeper',)))
