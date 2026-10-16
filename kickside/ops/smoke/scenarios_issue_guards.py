"""Guards for release defects that no product-area scenario asserts directly."""
import json
import sqlite3
import subprocess
import uuid

from harness import Scenario, require
from runtime_fixtures import isolated_fixture


def session_screen(ctx, *, reload=False):
    from playwright.sync_api import expect
    from scenarios import nav
    browser = ctx.browser
    if reload:
        browser.reload()
    expect(browser.frame.locator('.sidebar')).to_be_visible(timeout=30000)
    expect(browser.page.get_by_role('button', name='Sign In', exact=True)).to_have_count(0)
    browser.settle()
    dialog = browser.frame.locator('dialog.sp-dialog[open]')
    if dialog.count():
        dialog.get_by_role('button', name='Close onboarding', exact=True).click()
        expect(dialog).to_have_count(0, timeout=30000)
    nav(ctx, 'Agents')
    expect(browser.frame.locator('kickside-agents')).to_be_visible(timeout=30000)
    browser.screenshot('session-screen')


def registry_versions(inst):
    if inst.engine == 'sqlite':
        with sqlite3.connect('file:' + str(inst.root / 'data' / 'registry.db') + '?mode=ro', uri=True) as db:
            return db.execute('SELECT COUNT(*), MAX(id) FROM versions').fetchone()
    pg = inst.config['pg']
    done = subprocess.run(['psql', '-h', pg['host'], '-p', pg['port'], '-U', pg['user'], '-d', inst.db,
                           '-v', 'ON_ERROR_STOP=1', '-Atqc', 'SELECT COUNT(*), MAX(id) FROM smoke_registry.versions'],
                          env=inst.env, capture_output=True, text=True, timeout=35)
    require(done.returncode == 0, 'Registry history query fails: ' + inst.redactor.text(done.stderr))
    count, latest = done.stdout.strip().split('|')
    return int(count), int(latest)


def member(inst, label):
    email = label + '-' + uuid.uuid4().hex[:12] + '@smoke.example'
    created = inst.request('POST', '/api/v1/users', {
        'email': email, 'password': inst.password, 'full_name': label, 'groups': ['app.security:members'],
    }, expect=(201,), label=label + '-create')['user']
    inst.cleanup.add(label + ' member', lambda: inst.request(
        'DELETE', '/api/v1/users/' + created['user_id'], expect=(202,), label=label + '-delete'))
    return email, created['user_id']


def login(inst, email, label):
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label=label)['token']
    inst.redactor.add(token)
    return token


def restart_keeps_sessions(ctx):
    inst = ctx.inst
    email, _ = member(inst, 'restart-session')
    token = login(inst, email, 'restart-session-login')
    inst.request('GET', '/api/v1/user/me', auth=token, label='restart-session-before')
    ctx.browser_check().login(email, inst.password)
    session_screen(ctx)
    before = registry_versions(inst)
    with ctx.paused():
        pass
    require(registry_versions(inst) == before, 'A restart without source changes writes a registry history version: '
            + str(before) + ' -> ' + str(registry_versions(inst)))
    inst.request('GET', '/api/v1/user/me', auth=token, label='restart-session-after')
    inst.request('GET', '/api/v1/user/me', label='restart-admin-session-after')
    session_screen(ctx, reload=True)
    renewed = login(inst, email, 'restart-session-relogin')
    inst.request('GET', '/api/v1/user/me', auth=renewed, label='restart-session-renewed')


def hub_default_bindings(ctx):
    inst = ctx.inst
    for component in ('kickside/crm', 'chestor/workspace', 'kickside/knowledge'):
        inst.install(component)
        rows = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0',
                            label='default-binding-dependencies')['dependencies']
        require(any(row.get('component') == component for row in rows), 'Fresh Hub install is absent: ' + component)


def hub_install_keeps_sessions(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        email, uid = member(inst, 'install-session')
        token = login(inst, email, 'install-session-login')
        inst.request('GET', '/api/v1/user/me', auth=token, label='install-session-before')
        slug = 'install_expansion_' + uuid.uuid4().hex[:10]
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': []}, label='install-empty-group')
        inst.cleanup.add('install expansion group', lambda: inst.request(
            'DELETE', '/api/v1/security/scopes?slug=' + slug))
        scoped_email, scoped_uid = member(inst, 'install-scoped-session')
        inst.request('PUT', '/api/v1/users/' + scoped_uid + '/groups',
                     {'groups': ['app.security:user', 'kickside.security.scopes:' + slug]}, label='install-scoped-membership')
        scoped_token = login(inst, scoped_email, 'install-scoped-login')
        inst.install('kickside/mcp')
        inst.request('GET', '/api/v1/user/me', auth=token, label='install-session-after')
        inst.request('GET', '/api/v1/mcp/credentials', auth=token, label='install-session-live-access')
        inst.request('GET', '/api/v1/mcp/credentials', auth=login(inst, email, 'install-session-relogin'),
                     label='install-session-new-access')
        inst.request('GET', '/api/v1/user/me', auth=scoped_token, label='install-scoped-session-after')
        inst.request('GET', '/api/v1/mcp/credentials', auth=scoped_token, expect=(403,), label='install-scoped-before-grant')
        policies = inst.request('GET', '/api/v1/security/policies', label='install-module-policy')['policies']
        policy = next(row['id'] for row in policies
                      if row.get('surface') == 'kickside.mcp' and row.get('intent') == 'module_access')
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': [policy]}, label='install-group-expansion')
        inst.request('GET', '/api/v1/user/me', auth=scoped_token, label='install-expansion-keeps-session')
        inst.request('GET', '/api/v1/mcp/credentials', auth=scoped_token, label='install-scoped-live-access')
        inst.request('GET', '/api/v1/mcp/credentials', auth=login(inst, scoped_email, 'install-scoped-expanded-login'),
                     label='install-scoped-new-access')
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': []}, label='install-group-reduction')
        inst.request('GET', '/api/v1/user/me', auth=scoped_token, label='install-reduction-keeps-session')
        inst.request('GET', '/api/v1/mcp/credentials', auth=scoped_token, expect=(403,), label='install-reduction-revokes-access')
        narrowed = login(inst, scoped_email, 'install-scoped-relogin')
        inst.request('GET', '/api/v1/user/me', auth=narrowed, label='install-narrowed-session')
        inst.request('GET', '/api/v1/mcp/credentials', auth=narrowed, expect=(403,), label='install-narrowed-access')
        inst.request('GET', '/api/v1/user/me', auth=token, label='install-unaffected-session')
        inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:user']}, label='install-membership-reduction')
        inst.request('GET', '/api/v1/user/me', auth=token, expect=(401,), label='install-membership-revokes')
        baseline = login(inst, email, 'install-baseline-relogin')
        inst.request('GET', '/api/v1/user/me', auth=baseline, label='install-baseline-session')
        inst.request('GET', '/api/v1/mcp/credentials', auth=baseline, expect=(403,), label='install-baseline-access')


def branding_fresh_boot(ctx):
    from scenarios_core import assert_branding_browser
    entry = ctx.inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.ui%3Alegacy_branding_fs',
                             label='legacy-branding-fs')['entry']
    require(entry['kind'] == 'fs.directory' and entry['data'].get('auto_init') is True,
            'Legacy branding directory is not created when absent: ' + json.dumps(entry['data']))
    ctx.browser_check()
    assert_branding_browser(ctx, '/app/kickside-icon.svg')


def listed_thread_readable(ctx):
    inst = ctx.inst
    email, _ = member(inst, 'thread-gap')
    token = login(inst, email, 'thread-gap-login')
    created = [inst.request('POST', '/api/v1/threads', {
        'thread_class': 'history-pagination', 'attrs': {'title': 'Readable ' + str(index)},
    }, auth=token, expect=(201,), label='thread-gap-create-' + str(index))['thread']['id'] for index in range(10)]
    listed = {row['id'] for row in inst.request('GET', '/api/v1/threads', auth=token, label='thread-gap-list')['threads']}
    require(set(created) <= listed, 'A created thread is absent from its owner listing')
    for thread in sorted(listed):
        inst.request('GET', '/api/v1/threads/' + thread, auth=token, label='thread-gap-read')
        inst.request('GET', '/api/v1/threads/' + thread + '/events?limit=1', auth=token, label='thread-gap-events')
    for thread in created:
        inst.request('DELETE', '/api/v1/threads/' + thread, auth=token, label='thread-gap-delete')


# Modules a member can read once installed, with the endpoint that proves the new access.
INSTALL_ACCESS = (('kickside/mcp', '/api/v1/mcp/credentials'), ('kickside/webhooks', '/api/v1/webhooks'))


def install_keeps_sessions(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        installed = {row.get('component') for row in inst.request(
            'GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0', label='install-session-dependencies')['dependencies']}
        candidates = [(component, path) for component, path in INSTALL_ACCESS if component not in installed]
        require(candidates, 'The guard needs one of ' + ', '.join(c for c, _ in INSTALL_ACCESS) + ' to be uninstalled')
        component, path = candidates[0]
        email, _ = member(inst, 'install-session')
        token = login(inst, email, 'install-session-login')
        inst.request('GET', '/api/v1/user/me', auth=token, label='install-session-before')
        fixture.browser_check().login(email, inst.password)
        session_screen(fixture)
        inst.install(component)
        inst.request('GET', '/api/v1/user/me', auth=token, label='install-session-after')
        inst.request('GET', path, auth=token, label='install-session-live-access')
        session_screen(fixture, reload=True)
        inst.request('GET', path, auth=login(inst, email, 'install-session-relogin'), label='install-session-new-access')

def scope_delete_with_member_deletion(ctx):
    inst = ctx.inst
    for _ in range(5):
        slug = 'deletion_race_' + uuid.uuid4().hex[:10]
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': ['kickside.users.security:directory_access']},
                     label='deletion-race-scope')
        remove_scope = lambda slug=slug: inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug)
        inst.cleanup.add('deletion race scope', remove_scope)
        email = 'deletion-race-' + uuid.uuid4().hex[:12] + '@smoke.example'
        uid = inst.request('POST', '/api/v1/users', {
            'email': email, 'password': inst.password, 'full_name': 'deletion race',
            'groups': ['app.security:user', 'kickside.security.scopes:' + slug],
        }, expect=(201,), label='deletion-race-create')['user']['user_id']
        login(inst, email, 'deletion-race-login')
        inst.request('DELETE', '/api/v1/users/' + uid, expect=(202,), label='deletion-race-user-delete')
        inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug, label='deletion-race-scope-delete')
        inst.cleanup.remove(remove_scope)


def burst_install_keeps_login(ctx):
    from runtime import Instance
    inst = Instance(ctx.inst.config, ctx.inst.engine,
                    ctx.inst.evidence.root / ctx.inst.evidence.label / ('burst-install-' + uuid.uuid4().hex[:10]))
    try:
        inst.boot()
        slug = 'burst_login_' + uuid.uuid4().hex[:10]
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': []}, label='burst-group')
        inst.cleanup.add('burst login group', lambda: inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug))
        email, uid = member(inst, 'burst-login')
        inst.request('PUT', '/api/v1/users/' + uid + '/groups',
                     {'groups': ['app.security:user', 'kickside.security.scopes:' + slug]}, label='burst-membership')
        token = login(inst, email, 'burst-login-before')
        # Each install commits the registry several times; the login right after
        # it resolves its group set while the projector absorbs those commits.
        for component in ('kickside/mcp', 'kickside/webhooks', 'kickside/dashboard'):
            inst.install(component)
            label = 'burst-login-after-' + component.replace('/', '-')
            renewed = login(inst, email, label)
            inst.request('GET', '/api/v1/user/me', auth=renewed, label=label + '-me')
        inst.request('GET', '/api/v1/user/me', auth=token, label='burst-session-kept')
        final = login(inst, email, 'burst-login-final')
        inst.request('GET', '/api/v1/user/me', auth=final, label='burst-login-final-me')
        inst.request('GET', '/api/v1/user/me', label='burst-admin-session')
    finally:
        failures = inst.cleanup.run()
        require(not failures, 'Burst install fixture cleanup fails: ' + '; '.join(failures))


def group_principal_automation(ctx):
    from playwright.sync_api import expect
    from scenarios import nav
    inst = ctx.inst
    email, uid = member(inst, 'group-principal')
    token = login(inst, email, 'group-principal-login')
    browser = ctx.browser_check()
    browser.reset_context()
    browser.login(email, inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    dialog = browser.frame.locator('dialog.sp-dialog[open]')
    if dialog.count():
        dialog.get_by_role('button', name='Close onboarding', exact=True).click()
    title = 'Northwind group shift notice'
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': {
        'title': title, 'schedule': {'type': 'interval', 'expression': '2s'}, 'enabled': True,
        'target': {'kind': 'action', 'port': 'kickside.inbox.sink:inbox_item', 'config': {},
                   'input': {'content': 'Fictional Northwind group shift notice', 'title': title}}}},
        auth=token, label='group-principal-automation')['id']
    inst.cleanup.add('group principal automation', lambda: inst.request(
        'DELETE', '/api/v1/automations/' + aid, auth=token, label='group-principal-automation-delete'))
    base = '/api/v1/automations/' + aid
    drive = lambda: inst.request('GET', base + '/status', auth=token, label='group-principal-status')['drives'][0]
    inst.wait(lambda: drive().get('last_run_at'), 'Recurring task completes under its human owner', seconds=60)
    initial_run = drive()['last_run_at']

    def rejected(kind, principal_id):
        result = inst.request('POST', base + '/identity', {'principal': {'kind': kind, 'id': principal_id},
            'request_id': uuid.uuid4().hex, 'expected_identity_generation': 0}, auth=token,
            expect=(200, 400, 403), label='group-principal-' + kind + '-rejected')
        require(result.get('success') is False or result.get('state') == 'failed',
                kind + ' principal selection succeeds: ' + json.dumps(result))

    rejected('group', 'automation-group')
    rejected('service', 'automation-service')
    changed = inst.request('POST', base + '/identity', {'principal': {'kind': 'user', 'id': uid},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': 0}, auth=token, label='group-principal-self-identity')
    require(changed.get('identity_generation') == 1 and changed['state'] != 'failed',
            'Human self-selection does not retain generation zero after rejected principals: ' + json.dumps(changed))

    start = len(browser.frames)
    runs = []
    def delivered():
        current = drive()
        require(current.get('last_error') is None, 'Human principal occurrence fails: ' + json.dumps(current))
        if current.get('last_run_at') and current['last_run_at'] > (runs[-1] if runs else initial_run):
            runs.append(current['last_run_at'])
        return runs if len(runs) >= 2 else None
    inst.wait(delivered, 'Recurring task delivers occurrences under the human principal', seconds=60,
              pump=browser.page.wait_for_timeout)
    updates = lambda: [frame for frame in browser.frames[start:] if isinstance(frame.get('data'), dict)
                       and frame['data'].get('event') == 'component.meta.changed' and frame['data'].get('component_id') == aid]
    inst.wait(updates, 'Owner browser receives the human-run automation update', seconds=35, pump=browser.page.wait_for_timeout)
    inst.evidence.save('group-principal-websocket', updates())
    nav(ctx, 'Inbox')
    expect(browser.frame.locator('kickside-inbox').get_by_text(title, exact=True).first).to_be_visible(timeout=30000)
    nav(ctx, 'Automations')
    browser.frame.get_by_role('button', name='Open ' + title + ' details', exact=True).click()
    details = browser.frame.get_by_role('dialog', name=title, exact=True)
    details.get_by_role('tab', name='Activity', exact=True).click()
    expect(details).not_to_contain_text('Never', timeout=30000)
    expect(details.get_by_text('Failed delivery', exact=True)).to_have_count(0)
    browser.screenshot('group-principal-delivery')
    browser.reset_context()
    browser.login()


REGISTRY = [
    Scenario('restart_keeps_sessions', 'full', restart_keeps_sessions, ('boot',), instance_setup=True,
             issues=('SEC-RESTART-SESSION', 'SEC-LOGIN-GENERATION', 'R4-I2')),
    Scenario('install_keeps_member_session', 'full', install_keeps_sessions, ('boot',), instance_setup=True,
             issues=('SEC-INSTALL-NO-LOGOUT', 'T17', 'SECURITY-LIVE-GROUP-HUB-POLICY-UPDATE')),
    Scenario('scope_delete_with_member_deletion', 'full', scope_delete_with_member_deletion, ('boot',),
             instance_setup=True, issues=('SEC-SCOPE-INVALIDATION-SERIALIZATION', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario('hub_default_bindings', 'full', hub_default_bindings, ('boot',), instance_setup=True,
             issues=('HUB-REQ-DEFAULT-BINDING',)),
    Scenario('hub_install_keeps_sessions', 'full', hub_install_keeps_sessions, ('boot',), instance_setup=True,
             issues=('SEC-INSTALL-NO-LOGOUT', 'SECURITY-LIVE-GROUP-HUB-POLICY-UPDATE')),
    Scenario('burst_install_keeps_login', 'full', burst_install_keeps_login, ('boot',), instance_setup=True,
             issues=('SECURITY-SCOPE-PROJECTOR-SURVIVAL',)),
    Scenario('ui_branding_fresh_boot', 'full', branding_fresh_boot, ('boot',), issues=('UI-BRANDING-FRESH-BOOT',)),
    Scenario('core_listed_thread_readable', 'full', listed_thread_readable, ('boot',), issues=('THREAD-CREATE-GAP',)),
    Scenario('automation_group_principal', 'full', group_principal_automation, ('boot',), instance_setup=True,
             issues=('GROUP-PRINCIPAL-SELECTION', 'GROUP-PRINCIPAL-SERVICE-SENDS', 'RA-H13', 'RA-H55', 'DESIGN-COMPONENT-NOTIFICATION-FANOUT', 'AUTOMATION-AUTHORITY-SCOPE-RECOVERY', 'EXECUTION-AUTHORIZER-PRINCIPAL-SELECTION')),
]
