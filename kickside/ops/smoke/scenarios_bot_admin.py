"""Ordinary User bot administration through the served Users surface."""
import json
import uuid

from harness import Scenario, require
from scenarios_core import system, navigation
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _effects, _drive, _proof
from scenarios_selected_install import _identity


def browser_bot_admin_lifecycle(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixture = _fixture(ctx)
    from runtime_fixtures import complete_splashes
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    system(ctx, 'Users')
    panel = browser.frame.locator('kickside-users')
    panel.get_by_role('tab', name='Bots', exact=True).click()
    trace = inst.root / inst.evidence.label / 'bot-admin-lifecycle-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    name = 'Managed execution bot ' + uuid.uuid4().hex[:8]
    try:
        panel.get_by_role('button', name='Create bot', exact=True).first.click()
        editor = panel.get_by_role('dialog', name='Create bot', exact=True)
        expect(editor.locator('input[type=email], input[type=password]')).to_have_count(0)
        expect(editor.get_by_label('Use default membership', exact=True)).to_have_count(0)
        editor.get_by_label('Full name', exact=True).fill(name)
        editor.locator('input[type=checkbox][value="app.security:admin"]').check()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/users/bots')) as response:
            editor.get_by_role('button', name='Create', exact=True).click()
        body = response.value.json()
        require(response.value.status == 201 and body.get('success'), 'Admin UI bot creation fails: ' + str(body))
        bot = body['user']
        bot_id = bot['user_id']
        require(str(uuid.UUID(bot_id)) == bot_id and bot['email'] == bot_id + '@bots.invalid' and bot['bot_account'] is True,
                'Bot creation does not retain an ordinary User UUID and server-owned internal identity')
        path = '/api/v1/users/' + bot_id
        inst.cleanup.add('managed bot', lambda: inst.request('DELETE', path, expect=(202,)))
        row = panel.locator('.ku-row').filter(has_text=name)
        expect(row.get_by_text('Bot', exact=True)).to_be_visible(timeout=30000)
        memberships = inst.request('GET', path + '/groups')['groups']
        require('app.security:admin' in memberships and 'app.security:members' not in memberships,
                'Explicit bot groups acquire default Members access')
        listed = inst.request('GET', '/api/v1/users/bots')['users']
        require(any(value['user_id'] == bot_id and value['bot_account'] for value in listed), 'Created bot is absent from its inventory')
        denied = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Forbidden creation', 'groups': []}, auth=fixture['token'], expect=(403,))
        require(denied.get('success') is not True, 'Ordinary operator creates a bot without management access')
        slug = 'bot-managers-' + uuid.uuid4().hex[:10]
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Users managers',
            'policies': ['kickside.users.security:module_access'], 'enabled': True})
        operator = fixture['member']['user_id']
        management_group = 'kickside.security.scopes:' + slug
        def release_management_scope():
            memberships = inst.request('GET', '/api/v1/users/' + operator + '/groups')['groups']
            inst.request('PUT', '/api/v1/users/' + operator + '/groups',
                {'groups': [group for group in memberships if group != management_group]})
            inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug)
        inst.cleanup.add('bot management scope', release_management_scope)
        existing_groups = inst.request('GET', '/api/v1/users/' + operator + '/groups')['groups']
        inst.request('PUT', '/api/v1/users/' + operator + '/groups',
            {'groups': existing_groups + ['kickside.security.scopes:' + slug]})
        manager_token = inst.request('POST', '/api/public/user/token',
            {'email': fixture['email'], 'password': inst.password}, auth='')['token']
        inst.redactor.add(manager_token)
        control = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Confined manager bot', 'groups': []}, auth=manager_token, expect=(201,))['user']
        inst.cleanup.add('confined manager bot', lambda: inst.request('DELETE', '/api/v1/users/' + control['user_id'], expect=(202,)))
        require(control['bot_account'] is True, 'Existing Users management bundle cannot create bots without root administration')
        forbidden = inst.request('POST', '/api/v1/security/delegations',
            {'principal': {'kind': 'user', 'id': bot_id}, 'root': '*', 'groups': ['kickside.security.scopes:' + slug], 'operation_id': uuid.uuid4().hex},
            auth=manager_token, expect=(403,))
        require(forbidden.get('success') is not True, 'Users management grants Security delegation administration')
        login = inst.request('POST', '/api/public/user/token', {'email': bot['email'], 'password': inst.password}, auth='', expect=(401,))
        require(login.get('success') is False and not login.get('token'), 'Created admin-group bot authenticates')
        fixture = {**fixture, 'bot': bot_id, 'label': name,
                   'delegation': {**fixture['delegation'], 'principal': {'kind': 'user', 'id': bot_id}}}
        delegation = fixture['delegation']
        inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
        inst.cleanup.add('managed bot delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': delegation['principal'], 'root': delegation['root'], 'operation_id': uuid.uuid4().hex}))
        _grant(inst, fixture)
        _, generation = _identity(inst, fixture['root'])
        selected = inst.request('POST', '/api/v1/automations/' + fixture['root'] + '/identity',
            {'principal': delegation['principal'], 'request_id': uuid.uuid4().hex, 'expected_identity_generation': generation}, auth=fixture['token'])
        require(selected['state'] == 'succeeded', 'Managed bot does not pass the ordinary selected identity path')
        action = '/api/v1/automations/' + fixture['root'] + '/actions/run_now'
        inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
        inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'Managed bot executes its fixed effect', seconds=60, pump=browser.page.wait_for_timeout)
        effects = _effects(inst, fixture)
        identity = _proof(inst, fixture, effects)
        row.get_by_role('button', name='Edit ' + name, exact=True).click()
        editor = panel.get_by_role('dialog', name='Edit bot', exact=True)
        expect(editor.locator('input[type=email], input[type=password]')).to_have_count(0)
        editor.locator('input[type=checkbox][value="app.security:admin"]').uncheck()
        with browser.page.expect_response(lambda r: r.request.method == 'PUT' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success'), 'UI group reduction fails')
        require('app.security:admin' not in inst.request('GET', path + '/groups')['groups'], 'UI group removal does not persist')
        inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
        inst.wait(lambda: _drive(inst, fixture['root'])['phase'] in ('blocked_identity', 'blocked_access'),
                  'Group reduction blocks the next effect', seconds=60, pump=browser.page.wait_for_timeout)
        require(_effects(inst, fixture) == effects, 'Bot group removal leaves prior effect authority alive')
        row.get_by_role('button', name='Edit ' + name, exact=True).click()
        editor = panel.get_by_role('dialog', name='Edit bot', exact=True)
        editor.locator('input[type=checkbox][value="app.security:admin"]').check()
        with browser.page.expect_response(lambda r: r.request.method == 'PUT' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success'), 'UI group assignment fails')
        resumed = inst.request('POST', '/api/v1/automations/' + fixture['root'] + '/control',
            {'control': 'resume', 'request_id': uuid.uuid4().hex}, auth=fixture['token'])
        require(resumed.get('success') is True, 'Corrected group grant does not admit ordinary resume')
        inst.wait(lambda: len(_effects(inst, fixture)) == 2, 'Restored group resumes the parked fixed effect',
                  seconds=60, pump=browser.page.wait_for_timeout)
        effects = _effects(inst, fixture)
        require(all(record['actor_id'] == bot_id and json.loads(record['identity_json']) == identity for record in effects),
                'Restored group substitutes the authorizer or execution identity')
        row.get_by_role('button', name='Disable ' + name, exact=True).click()
        confirmation = browser.page.get_by_role('alertdialog', name='Disable bot', exact=True)
        expect(confirmation).to_contain_text('retains')
        with browser.page.expect_response(lambda r: r.request.method == 'DELETE' and r.url.endswith(path)) as response:
            confirmation.get_by_role('button', name='Disable', exact=True).click()
        require(response.value.status == 202 and response.value.json().get('success'), 'Admin UI disable fails')
        expect(row.get_by_text('inactive', exact=True)).to_be_visible(timeout=30000)
        inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
        inst.wait(lambda: _drive(inst, fixture['root'])['phase'] == 'blocked_identity',
                  'Disabled bot blocks the next execution boundary', seconds=60, pump=browser.page.wait_for_timeout)
        require(_effects(inst, fixture) == effects, 'Disabled managed bot performs another effect')
        accounts = database_rows(inst, "SELECT user_id,status FROM app_users WHERE user_id='" + bot_id + "'")
        markers = database_rows(inst, "SELECT created_by FROM app_user_bot_accounts WHERE user_id='" + bot_id + "'")
        audit = database_rows(inst, "SELECT actor_id,operation,payload FROM app_user_bot_audit WHERE user_id='" + bot_id + "' ORDER BY created_at")
        require(len(accounts) == 1 and accounts[0]['status'] == 'inactive' and len(markers) == 1,
                'Disable deletes or reclassifies the ordinary bot account')
        admin = inst.request('GET', '/api/v1/user/me')['user']['id']
        require(markers[0]['created_by'] == admin and any(record['operation'] == 'create' and record['actor_id'] == admin for record in audit)
                and any(record['operation'] == 'disable' and record['actor_id'] == admin for record in audit),
                'Admin lifecycle does not retain native actor provenance')
        require(all('password' not in record['payload'] and inst.token not in record['payload'] for record in audit), 'Audit exposes credentials')
        require(_identity(inst, fixture['root'])[0] == identity, 'Lifecycle rewrites the installed execution identity')
        browser.clean(0)
        system(ctx, 'Users')
        expect(row.get_by_text('inactive', exact=True)).to_be_visible(timeout=30000)
        browser.screenshot('managed-bot-disabled')
        inst.evidence.save('managed-bot-lifecycle', {'bot': bot_id, 'groups_at_creation': memberships,
            'identity': identity, 'effects': effects, 'accounts': accounts, 'markers': markers, 'audit': audit,
            'drive': _drive(inst, fixture['root'])})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_bot_admin_lifecycle', 'regression', browser_bot_admin_lifecycle, ('boot',), instance_setup=True,
                     issues=('BOT-ACCOUNT-ADMIN-CREATION', 'RA-B01', 'RA-B02', 'RA-S01', 'RA-H02', 'RA-H50', 'RA-H51', 'SECURITY-SCOPE-PROJECTION-LIVENESS'),
                     features=navigation('users', 'kickside.users:tab.users'))]
