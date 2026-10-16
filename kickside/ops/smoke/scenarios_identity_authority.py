"""Execution authority stays server-derived; group expansion retains session credentials."""
import uuid

from harness import Scenario, require
from scenarios import nav
from scenarios_issue_guards import login


def session_metadata_authority(ctx):
    inst = ctx.inst
    email = 'authority-' + uuid.uuid4().hex[:10] + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Authority member'}, expect=(201,), label='authority-member')['user']
    inst.cleanup.add('authority member', lambda: inst.request('DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
    injected = {'principal': {'kind': 'user', 'id': 'forged'},
        'authorized_by': {'kind': 'user', 'id': 'forged'}, 'component_id': 'forged',
        'execution_root': 'forged', 'credential_id': 'forged', 'link_id': 'forged',
        'execution_identity': {'version': 2}, '_execution_identity': {'version': 2},
        'inherited_identity': {'version': 2}, 'scope_used': 'app.security:admin', 'client_trace': 'retained'}
    token = inst.request('POST', '/api/public/user/token', {'email': email,
        'password': inst.password, 'metadata': injected}, auth='', label='authority-login')['token']
    inst.redactor.add(token)
    me = inst.request('GET', '/api/v1/user/me', auth=token, label='authority-token-identity')
    require(me['user']['id'] == user['user_id'], 'Metadata changes the authenticated session user')
    metadata = me['user']['metadata']
    require(metadata.get('client_trace') == 'retained', 'Session drops ordinary caller metadata')
    for field in injected.keys() - {'client_trace'}:
        require(field not in metadata, 'Session admits caller execution authority: ' + field)
    inst.request('GET', '/api/v1/users', auth=token, expect=(403,), label='authority-member-admin-denied')


def membership_expansion_session(ctx):
    from playwright.sync_api import expect
    from model_fixture import live_profile
    _, cards = live_profile(ctx, 'Membership authority', scope='instance')
    inst = ctx.inst
    inst.request('PUT', '/api/v1/models/cards', {**cards[0], 'class': ['fast']},
                 label='membership-default-model')
    inst.install('kickside/knowledge')
    policies = inst.request('GET', '/api/v1/security/policies', label='membership-policies')['policies']
    module = next(p['id'] for p in policies if p.get('surface') == 'kickside.knowledge'
        and p.get('intent') == 'module_access')
    suffix = uuid.uuid4().hex[:10]
    base_slug, added_slug = 'identity_base_' + suffix, 'identity_added_' + suffix
    baseline = sorted(p['id'] for p in policies if p.get('intent') == 'module_access' and p['id'] != module)
    for slug, members in ((base_slug, baseline), (added_slug, [module])):
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': members}, label=slug)
        inst.cleanup.add(slug, lambda slug=slug: inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug))
    groups = ['app.security:user', 'kickside.security.scopes:' + base_slug]
    email = 'membership-' + suffix + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Membership member', 'groups': groups}, expect=(201,), label='membership-member')['user']
    inst.cleanup.add('membership member', lambda: inst.request('DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
    token = login(inst, email, 'membership-initial-login')
    inst.request('GET', '/api/v1/knowledge/list', auth=token, expect=(403,), label='membership-initial-access')
    browser = ctx.browser_check()
    try:
        browser.login(email, inst.password)
        browser_token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
        inst.redactor.add(browser_token)
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        splash = browser.frame.locator('kickside-agent-onboarding')
        if splash.count() and splash.is_visible():
            splash.get_by_label('Agent name', exact=True).fill('Membership assistant')
            splash.get_by_role('button', name='Create agent', exact=True).click()
            browser.frame.locator('wippy-chat').wait_for(timeout=30000)
        expect(browser.frame.locator('.sidebar').get_by_text('Knowledge', exact=True)).to_have_count(0)
        expanded = groups + ['kickside.security.scopes:' + added_slug]
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': expanded}, label='membership-expansion')
        inst.request('GET', '/api/v1/user/me', auth=token, label='membership-keeps-exact-token')
        inst.request('GET', '/api/v1/knowledge/list', auth=token, label='membership-expanded-access')
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': list(reversed(expanded))}, label='membership-noop')
        inst.request('GET', '/api/v1/user/me', auth=token, label='membership-noop-keeps-token')
        browser.reload()
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        expect(browser.page.get_by_role('button', name='Sign In', exact=True)).to_have_count(0)
        retained_token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
        require(retained_token == browser_token, 'Allow-only addition replaces the browser session')
        retained = inst.request('GET', '/api/v1/user/me', auth=browser_token, label='membership-browser-keeps-token')
        require(retained['user']['id'] == user['user_id'], 'Browser session changes the member identity')
        expect(browser.frame.locator('.sidebar').get_by_text('Knowledge', exact=True)).to_be_visible(timeout=30000)
        nav(ctx, 'Knowledge')
        expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
        browser.screenshot('membership-expansion-keeps-login')
        browser.login(email, inst.password)
        expect(browser.frame.locator('.sidebar').get_by_text('Knowledge', exact=True)).to_be_visible(timeout=30000)
        nav(ctx, 'Knowledge')
        expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
        browser.screenshot('membership-refreshed-access')
        refreshed = login(inst, email, 'membership-refresh')
        inst.request('GET', '/api/v1/knowledge/list', auth=refreshed, label='membership-fresh-access')
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': groups}, label='membership-reduction')
        for name, existing in (('initial', token), ('refreshed', refreshed)):
            inst.request('GET', '/api/v1/user/me', auth=existing, expect=(401,), label='membership-revokes-' + name)
    finally:
        browser.settle()
        browser.login()
    browser.clean(0)


REGISTRY = [
    Scenario('identity_session_metadata_authority', 'full', session_metadata_authority,
        ('boot',), instance_setup=True, issues=('RA-H31',)),
    Scenario('identity_membership_expansion_session', 'full', membership_expansion_session,
        ('boot',), model=True, instance_setup=True, issues=('RA-H23', 'RA-H24', 'RA-H25', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
]
