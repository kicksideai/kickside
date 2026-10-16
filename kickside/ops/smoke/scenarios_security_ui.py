"""Browser regressions for composed scopes and group-controlled module access."""
import re
import json
import uuid

from harness import Scenario, require
from scenarios import nav
from scenarios_core import system, http


def compose_scope(ctx, label, policies):
    from playwright.sync_api import expect
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    system(ctx, 'Security')
    panel = browser.frame.locator('kickside-security')
    panel.get_by_role('button', name='New scope', exact=True).first.click()
    slug = 'regression-' + uuid.uuid4().hex[:12]
    panel.get_by_placeholder('reviewer', exact=True).fill(slug)
    panel.get_by_placeholder('Reviewer', exact=True).fill(label)
    for policy in policies:
        panel.get_by_placeholder('Search policies…', exact=True).fill(policy)
        card = panel.locator('.ks-pcard').filter(has_text=policy)
        card.get_by_role('button', name='Add policy', exact=True).click()
        expect(panel.locator('.ks-pane.drop').get_by_text(policy, exact=True)).to_be_visible()
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/security/scopes')) as response:
        panel.get_by_role('button', name='Save scope', exact=True).click()
    saved = response.value.json()
    require(response.value.status == 200 and saved.get('success'), 'Scope composer does not save its policies: ' + str(saved))
    scope = 'kickside.security.scopes:' + saved['scope']['slug']
    ctx.inst.cleanup.add('regression scope', lambda: ctx.inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug))
    expect(panel.get_by_text(re.compile('^Saved “' + re.escape(label)))).to_be_visible()
    ctx.inst.wait(lambda: any(row['id'] == scope for row in ctx.inst.request('GET', '/api/v1/users/assignable-scopes')['scopes']),
        'Composed scope becomes assignable', pump=browser.page.wait_for_timeout)
    browser.screenshot('composed-scope')
    return scope


def member(ctx, label):
    email = 'regression-' + uuid.uuid4().hex[:12] + '@smoke.example'
    user = ctx.inst.request('POST', '/api/v1/users', {'email': email, 'password': ctx.inst.password,
        'full_name': label}, expect=(201,), label='regression-member')['user']
    ctx.inst.cleanup.add('regression member', lambda: ctx.inst.request('DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
    path = '/api/v1/users/' + user['user_id']
    defaults = ctx.inst.request('GET', path + '/groups', label='member-default-groups')['groups']
    require('app.security:members' in defaults, 'New member does not join the declared default group')
    ctx.inst.request('PUT', path, {'groups': []}, label='remove-default-membership')
    restricted = ctx.inst.request('GET', path + '/groups', label='member-restricted-groups')['groups']
    require('app.security:members' not in restricted, 'Default membership remains assigned')
    require(restricted == ['app.security:user'], 'Restricted member does not retain exactly the declared baseline group')
    return user


def assign_scope(ctx, user, scope):
    assign_scopes(ctx, user, [scope])


def assign_scopes(ctx, user, scopes):
    from playwright.sync_api import expect
    browser = ctx.browser
    system(ctx, 'Users')
    row = browser.frame.locator('kickside-users .ku-row').filter(
        has=browser.frame.get_by_text(user['email'], exact=True))
    row.get_by_role('button', name='Edit ' + (user['full_name'] or user['email']), exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name='Edit user', exact=True)
    for checkbox in dialog.locator('input[type=checkbox]').all():
        if checkbox.is_enabled():
            checkbox.set_checked(checkbox.get_attribute('value') in scopes)
    for scope in scopes:
        expect(dialog.locator('input[type=checkbox][value="' + scope + '"]')).to_be_checked()
    layout = dialog.evaluate('''editor => {
        const rows = [...editor.closest('.ku').querySelectorAll('.ku-row')];
        return {row_count: rows.length,
                row_bottom: Math.max(...rows.map(row => row.getBoundingClientRect().bottom)),
                editor_top: editor.getBoundingClientRect().top};
    }''')
    ctx.inst.evidence.save('account-editor-content-flow', layout)
    require(layout['row_count'] > 0 and layout['row_bottom'] <= layout['editor_top'],
            'Account list overlaps account editor: ' + json.dumps(layout))
    with browser.page.expect_response(lambda r: r.request.method == 'PUT' and r.url.endswith('/users/' + user['user_id'])) as response:
        dialog.get_by_role('button', name='Save', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success'), 'UI scope assignment fails')
    groups = ctx.inst.request('GET', '/api/v1/users/' + user['user_id'] + '/groups')['groups']
    require(set(groups) == {*scopes, 'app.security:user'}, 'Assigned scopes do not persist: ' + str(groups))


def users_editor_content_flow(ctx):
    from playwright.sync_api import expect
    scope = compose_scope(ctx, 'Account editor reviewers', ['kickside.users.security:module_access'])
    users = [member(ctx, 'Account editor member ' + str(index)) for index in range(20)]
    assign_scope(ctx, users[-1], scope)
    expect(ctx.browser.frame.get_by_role('dialog', name='Edit user', exact=True)).to_have_count(0)
    ctx.browser.screenshot('users-editor-content-flow')


def login_member(ctx, user):
    from playwright.sync_api import expect
    browser = ctx.browser
    browser.reset_context()
    browser.login(user['email'], ctx.inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    dialog = browser.frame.locator('dialog.sp-dialog[open]')
    if dialog.count():
        dialog.get_by_role('button', name='Close onboarding', exact=True).click()
        expect(dialog).to_have_count(0, timeout=30000)
    browser.reload()
    expect(browser.frame.locator('.sidebar')).to_be_visible(timeout=30000)
    return browser


def regression_scope_composer(ctx):
    from playwright.sync_api import expect
    user = member(ctx, 'Northwind scope member')
    browser = ctx.browser_check()
    login_member(ctx, user)
    expect(browser.frame.locator('.sidebar').get_by_text('CRM', exact=True)).to_have_count(0)
    scope = compose_scope(ctx, 'Northwind CRM reviewers', ['kickside.crm.security:module_access'])
    assign_scope(ctx, user, scope)
    login_member(ctx, user)
    nav(ctx, 'CRM')
    expect(browser.frame.locator('kickside-crm-surface')).to_be_visible(timeout=30000)
    expect(browser.frame.locator('kickside-crm-surface').get_by_text('No CRM workspace is available', exact=True)).to_be_visible()
    browser.screenshot('member-composed-scope')
    browser.reset_context()
    browser.login()


def regression_group_modules(ctx):
    from playwright.sync_api import expect
    scope = compose_scope(ctx, 'Sales', ['kickside.crm.security:module_access', 'kickside.users.security:module_access'])
    allowed, denied = member(ctx, 'Northwind Sales A'), member(ctx, 'Northwind Workspace B')
    assign_scope(ctx, allowed, scope)
    ctx.inst.request('POST', '/api/v1/component-access/share/' + ctx.state['nw_crm'], {
        'subject_type': 'user', 'subject_id': allowed['user_id'], 'access_mask': 3}, label='sales-crm-grant')
    browser = login_member(ctx, allowed)
    nav(ctx, 'CRM')
    crm = browser.frame.locator('kickside-crm-surface')
    expect(crm).to_contain_text('Northwind · Customer operations', timeout=30000)
    crm.get_by_role('button', name=re.compile('^People')).click()
    expect(crm).to_contain_text('Avery Northwind', timeout=30000)
    crm.get_by_role('button', name='New Person', exact=True).click()
    browser.frame.get_by_label('Name', exact=True).fill('Northwind Sales contact')
    browser.frame.get_by_label('Email', exact=True).fill('sales-contact@northwind.example')
    path = '/api/v1/workspace/crm/' + ctx.state['nw_crm'] + '/apply'
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
        browser.frame.get_by_role('button', name='Save', exact=True).click()
    receipt = response.value.json()
    ctx.inst.evidence.save('sales-crm-create-receipt', {'status': response.value.status, 'body': receipt})
    require(response.value.status == 200 and receipt.get('success'), 'Sales CRM creation fails: ' + str(receipt))
    expect(crm).to_contain_text('Northwind Sales contact', timeout=30000)
    browser.screenshot('sales-crm-visible')
    system(ctx, 'Users')
    expect(browser.frame.locator('kickside-users')).to_be_visible(timeout=30000)
    expect(browser.frame.get_by_role('tab', name='Appearance', exact=True)).to_have_count(0)
    browser.screenshot('sales-users-visible')
    token = ctx.inst.request('POST', '/api/public/user/token',
        {'email': allowed['email'], 'password': ctx.inst.password}, auth='', label='sales-management-login')['token']
    ctx.inst.redactor.add(token)
    tabs = ctx.inst.request('GET', '/api/v1/settings/tabs', auth=token, label='sales-system-tabs')['tabs']
    require([tab['key'] for tab in tabs] == ['users'], 'Users management shows System tabs beyond Users: ' + str(tabs))
    ctx.inst.request('GET', '/api/v1/users', auth=token, label='sales-users-list')
    users = browser.frame.locator('kickside-users')
    users.get_by_role('button', name='Create user', exact=True).first.click()
    dialog = users.get_by_role('dialog', name='Create user', exact=True)
    dialog.get_by_placeholder('user@example.com').fill('sales-managed-' + uuid.uuid4().hex[:12] + '@smoke.example')
    dialog.get_by_placeholder('Jane Doe').fill('Sales managed user')
    dialog.get_by_placeholder('Minimum 8 characters').fill(ctx.inst.password)
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/users')) as response:
        dialog.get_by_role('button', name='Create', exact=True).click()
    require(response.value.status == 201, 'Users manager cannot create an account in the UI')
    managed = response.value.json()['user']
    expect(users.get_by_text('Sales managed user', exact=True)).to_be_visible(timeout=30000)
    require('app.security:members' in managed['security_groups'],
            'An account created by Users management misses the declared default membership: ' + str(managed))
    ctx.inst.cleanup.add('sales managed user', lambda: ctx.inst.request(
        'DELETE', '/api/v1/users/' + managed['user_id'], expect=(202,)))
    ctx.inst.request('PUT', '/api/v1/users/' + managed['user_id'],
        {'full_name': 'Sales updated user'}, auth=token, label='sales-users-update')
    browser.reload()
    system(ctx, 'Users')
    expect(users.get_by_text('Sales updated user', exact=True)).to_be_visible(timeout=30000)
    for label, groups in (('default', None), ('stranger', [])):
        payload = {'email': label + '-management-' + uuid.uuid4().hex[:12] + '@smoke.example',
            'password': ctx.inst.password, 'full_name': label + ' management boundary'}
        if groups is not None:
            payload['groups'] = groups
        account = ctx.inst.request('POST', '/api/v1/users', payload, expect=(201,))['user']
        ctx.inst.cleanup.add(label + ' management boundary', lambda user_id=account['user_id']:
            ctx.inst.request('DELETE', '/api/v1/users/' + user_id, expect=(202,)))
        bearer = ctx.inst.request('POST', '/api/public/user/token',
            {'email': account['email'], 'password': ctx.inst.password}, auth='')['token']
        ctx.inst.redactor.add(bearer)
        for method, path, body in (('GET', '/api/v1/users', None),
            ('POST', '/api/v1/users', payload),
            ('PUT', '/api/v1/users/' + managed['user_id'], {'full_name': 'Unauthorized'})):
            ctx.inst.request(method, path, body, auth=bearer, expect=(403,), label=label + '-users-denied')
    workspace_only = 'workspace-only-' + uuid.uuid4().hex[:10]
    ctx.inst.request('POST', '/api/v1/security/scopes',
        {'slug': workspace_only, 'policies': ['chestor.workspace.security:module_access']}, label='workspace-only-scope')
    ctx.inst.cleanup.add('workspace only scope', lambda: ctx.inst.request(
        'DELETE', '/api/v1/security/scopes?slug=' + workspace_only))
    ctx.inst.request('PUT', '/api/v1/users/' + denied['user_id'] + '/groups',
        {'groups': ['app.security:user', 'kickside.security.scopes:' + workspace_only]}, label='workspace-only-membership')
    browser = login_member(ctx, denied)
    expect(browser.frame.locator('.sidebar').get_by_text('CRM', exact=True)).to_have_count(0)
    expect(browser.frame.locator('.sidebar').get_by_role('button', name='System', exact=True)).to_have_count(0)
    nav(ctx, 'Workspace')
    workspace = browser.frame.locator('chestor-workspace')
    workspace.get_by_role('button', name='New', exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name='New entry', exact=False)
    expect(dialog.get_by_role('button', name='CRM', exact=True)).to_have_count(0)
    expect(dialog.get_by_role('button', name='Users', exact=True)).to_have_count(0)
    dialog.get_by_role('button', name='Close new entry', exact=True).click()
    for route, surface in (('/crm', 'kickside-crm-surface'), ('/system/users', 'kickside-users')):
        browser.goto_route(route)
        browser.settle()
        expect(browser.frame.locator(surface)).to_have_count(0)
        expect(browser.frame.get_by_text(re.compile('not accessible|access denied|not found|not available', re.I)).filter(visible=True)).to_be_visible(timeout=30000)
        browser.screenshot('denied-' + surface)
    browser.reset_context()
    browser.login()


def default_member_ui(ctx):
    from playwright.sync_api import expect
    user = ctx.inst.request('POST', '/api/v1/users', {
        'email': 'default-ui-' + uuid.uuid4().hex[:12] + '@smoke.example',
        'password': ctx.inst.password, 'full_name': 'Northwind default member',
    }, expect=(201,), label='default-ui-member')['user']
    ctx.inst.cleanup.add('default UI member', lambda: ctx.inst.request(
        'DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
    browser = ctx.browser_check()
    login_member(ctx, user)
    for label, surface in (('Agents', 'kickside-agents'), ('Knowledge', 'kickside-knowledge'),
                           ('Automations', 'kickside-automation-manager')):
        nav(ctx, label)
        expect(browser.frame.locator(surface)).to_be_visible(timeout=30000)
    expect(browser.frame.locator('.sidebar').get_by_role('button', name='System', exact=True)).to_have_count(0)
    browser.reload()
    expect(browser.frame.locator('kickside-automation-manager')).to_be_visible(timeout=30000)
    browser.screenshot('default-member-modules')
    browser.reset_context()
    browser.login()


FEATURES = http('security', 'POST /api/v1/security/scopes', 'GET /api/v1/security/scopes', 'DELETE /api/v1/security/scopes') + \
    http('users', 'PUT /api/v1/users/{id}', 'GET /api/v1/users/assignable-scopes', 'GET /api/v1/users/{id}/groups')
def security_ui_setup(ctx):
    from scenarios_crm_chestor import crm_setup
    from scenarios_access import install_package
    for module in ('kickside/crm', 'chestor/workspace'):
        install_package(ctx, module)
    crm_setup(ctx)


REGISTRY = [
    Scenario('regression_users_editor_content_flow', 'regression', users_editor_content_flow, ('platform_onboarding',),
        instance_setup=True, features=FEATURES, issues=('USERS-EDITOR-CONTENT-OVERLAP',)),
    Scenario('security_ui_setup', 'full', security_ui_setup, ('first_agent',), instance_setup=True),
    Scenario('regression_scope_composer', 'full', regression_scope_composer, ('security_ui_setup',),
        features=FEATURES, issues=('SECURITY-SCOPE-COMPOSER',)),
    Scenario('regression_group_modules', 'full', regression_group_modules, ('security_ui_setup',),
        features=FEATURES, issues=('SECURITY-GROUP-MODULES', 'SEC-USERS-MANAGEMENT-NAV',
            'SEC-USERS-MANAGEMENT-CREATE', 'SEC-DELEGATED-DEFAULT-MEMBERSHIP', 'SEC-USERS-MANAGEMENT-POLICY',
            'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario('security_default_member_ui', 'full', default_member_ui, ('first_agent',),
        issues=('SECURITY-DEFAULT-MEMBERS',)),
]
