"""Published passwordless accounts retain SSO sessions through actual Hub updates."""
import hashlib

from harness import Scenario, require
from scenarios import Context
from scenarios_hot_update_work import database_rows
from scenarios_providers import sso_oidc_login
from scenarios_published_run_as import REGISTRY as PUBLISHED, browser_published_human_automation_update, install_source_through_hub_ui
from scenarios_run_as_browser import _oidc_fixture


def browser_published_sso_session_hub_ui_update(ctx):
    state = {}

    def setup(fixture):
        _oidc_fixture(fixture)
        fixture.browser_check().login()

    def stored(inst):
        return {
            'accounts': database_rows(inst, "SELECT * FROM app_users WHERE email='operator@northwind.example.invalid'"),
            'links': database_rows(inst, "SELECT id,provider,subject,user_id,email,email_verified,created_at FROM app_user_identities WHERE provider='oidc' ORDER BY id"),
            'groups': database_rows(inst, "SELECT user_id,group_id,source,created_at FROM app_user_groups WHERE user_id='" + state['user'] + "' ORDER BY group_id"),
        }

    def login(fixture, peer, phase):
        browser = peer.browser_check()
        trace = fixture.inst.root / fixture.inst.evidence.label / ('published-sso-login-' + phase + '-trace.zip')
        trace.parent.mkdir(parents=True, exist_ok=True)
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        start = len(fixture.fixtures.requests('oidc'))
        try:
            session = sso_oidc_login(peer, restore_login=False)
            require(browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token") == session['token'],
                    'OIDC browser stores a different session than its real callback')
            requests = fixture.fixtures.requests('oidc')[start:]
            for endpoint in ('/authorize', '/token', '/jwks'):
                require(any(row['path'] == endpoint and row['status'] in (200, 302) for row in requests),
                        'Published SSO login omits native provider verification: ' + endpoint)
            browser.settle()
            browser.clean(0)
            browser.screenshot('published-sso-login-' + phase)
            return session
        finally:
            browser.context.tracing.stop(path=str(trace))
            fixture.inst.evidence.paths.append(str(trace))

    def observe(fixture, phase):
        inst = fixture.inst
        if phase == 'baseline':
            peer = Context(inst, browser_session=fixture.browser.session)
            peer.fixtures = fixture.fixtures
            session = login(fixture, peer, phase)
            state.update(peer=peer, user=session['user']['id'], token=session['token'],
                         context=peer.browser.context)
            state['stored'] = stored(inst)
            state['full_links'] = database_rows(inst, "SELECT * FROM app_user_identities WHERE provider='oidc' ORDER BY id")
            require(len(state['stored']['accounts']) == 1
                    and state['stored']['accounts'][0]['password_hash'] == '!sso:no-password',
                    'Published SSO fixture does not have a passwordless ordinary human account')
            require(len(state['stored']['links']) == 1
                    and state['stored']['links'][0]['subject'] == 'northwind-operator'
                    and state['stored']['links'][0]['user_id'] == state['user'],
                    'Published SSO fixture has no unique original provider subject')
            peer.browser.context.add_cookies([{'name': 'x-auth-token', 'value': state['token'], 'url': inst.base}])
        if phase == 'before_restart':
            state['peer'].suspend_browser()
            return
        if phase == 'restart':
            state['peer'].resume_browser()
        browser = state['peer'].browser_check()
        require(stored(inst) == state['stored'], 'Hub update changes the original passwordless account, subject or membership')
        require(database_rows(inst, "SELECT * FROM app_user_identities WHERE provider='oidc' ORDER BY id") == state['full_links'],
                'Hub update rewrites the original full provider identity row')
        require(browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token") == state['token'],
                'Hub update replaces the original SSO browser bearer')
        require(next((cookie['value'] for cookie in browser.context.cookies(inst.base)
                      if cookie['name'] == 'x-auth-token'), None) == state['token'],
                'Hub update replaces the original SSO browser cookie')
        require(phase == 'restart' or browser.context is state['context'],
                'Live Hub update replaces the original SSO browser context')
        profile = inst.request('GET', '/api/v1/user/me', auth=state['token'], label='original-sso-bearer-' + phase)['user']
        require(profile['id'] == state['user'] and profile['metadata']['auth_method'] == 'sso',
                'Original SSO bearer loses its passwordless human identity')
        response = browser.context.request.get(inst.base + '/api/v1/user/me')
        require(response.status == 200 and response.json()['user']['id'] == state['user'],
                'Original SSO cookie loses its human identity')
        inst.request('GET', '/api/v1/keeper/hub/dependencies', auth=state['token'], expect=(403,),
                     label='sso-admin-boundary-' + phase)
        browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        browser.settle()
        browser.clean(0)
        browser.screenshot('published-sso-retained-' + phase)
        if phase != 'baseline':
            peer = Context(inst, browser_session=fixture.browser.session)
            peer.fixtures = fixture.fixtures
            try:
                session = login(fixture, peer, phase)
                require(session['user']['id'] == state['user'],
                        'New OIDC login provisions a different account after update')
                require(stored(inst) == state['stored'],
                        'New OIDC login changes the original account, subject or memberships')
                require(inst.request('GET', '/api/v1/user/me', auth=state['token'],
                                     label='original-sso-after-new-login-' + phase)['user']['id'] == state['user'],
                        'New OIDC login invalidates the original SSO bearer')
                state['full_links'] = database_rows(inst, "SELECT * FROM app_user_identities WHERE provider='oidc' ORDER BY id")
            finally:
                peer.close_browser()
        inst.evidence.save('published-passwordless-sso-' + phase, {
            'user_id': state['user'], 'stored': state['stored'], 'full_links': state['full_links'],
            'original_token_digest': hashlib.sha256(state['token'].encode()).hexdigest(),
            'original_bearer_valid': True, 'original_cookie_valid': True,
            'same_live_browser_context': phase != 'restart', 'admin_boundary': 403,
            'fresh_same_subject_login': phase != 'baseline',
        })

    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui,
        setup=setup, observe=observe, modules=('kickside/sso', 'kickside/sso-oidc'))


REGISTRY = [Scenario('browser_published_sso_session_hub_ui_update', 'regression',
    browser_published_sso_session_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-C02', 'RA-B16', 'RA-B17'))]
