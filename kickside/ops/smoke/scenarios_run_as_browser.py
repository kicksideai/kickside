"""Real browser guards for the shared ordinary-Users bot identity."""
import uuid

from harness import Scenario, require
from scenarios_hot_update_work import database_rows
from scenarios_token_continuity import token_payloads


def _bot_fixture(inst, email):
    user = inst.request('POST', '/api/v1/users', {
        'email': email, 'password': inst.password, 'full_name': 'Browser account fixture',
        'groups': ['app.security:admin']}, expect=(201,), label='browser-bot-fixture')['user']
    user_id = user['user_id']
    require(str(uuid.UUID(user_id)) == user_id, 'Fixture does not use an ordinary Users UUID')
    def cleanup():
        database_rows(inst, "DELETE FROM app_user_bot_accounts WHERE user_id = '" + user_id
                      + "' RETURNING user_id", write=True)
        inst.request('DELETE', '/api/v1/users/' + user_id, expect=(202,))
    inst.cleanup.add('browser bot fixture ' + user_id, cleanup)
    marked = database_rows(inst, "INSERT INTO app_user_bot_accounts (user_id, created_by, created_at) VALUES ('"
        + user_id + "', 'browser-fixture', '2026-10-09T00:00:00Z') RETURNING user_id", write=True)
    require(marked == [{'user_id': user_id}], 'Bot marker does not commit')
    groups = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id = '" + user_id + "'")
    require(any(row['group_id'] == 'app.security:admin' for row in groups), 'Bot fixture lacks admin membership')
    return user_id


def browser_bot_password_login(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    browser = ctx.browser_check()
    browser.reset_context()
    trace = inst.root / inst.evidence.label / 'bot-password-sentinel-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    records = []
    try:
        for password_kind in ('injected', 'sentinel'):
            email = 'bot-browser-' + uuid.uuid4().hex + '@smoke.example'
            user_id = _bot_fixture(inst, email)
            if password_kind == 'sentinel':
                database_rows(inst, "UPDATE app_users SET password_hash = '!' WHERE user_id = '"
                              + user_id + "' RETURNING user_id", write=True)
            before = token_payloads(inst)
            browser.page.goto(inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
            browser.page.get_by_label('Email').fill(email)
            browser.page.get_by_label('Password').fill(inst.password)
            with browser.rejection('POST', '/api/public/user/token', 401) as response:
                browser.page.get_by_role('button', name='Sign In', exact=True).click()
            payload = response.value.json()
            require(not payload.get('token') and payload.get('success') is not True, 'Bot login returns a credential')
            expect(browser.page.locator('#error')).to_have_text('Invalid email or password')
            expect(browser.page.locator('#error')).to_be_visible()
            require(browser.page.url == inst.base + '/login', 'Bot login leaves the login page')
            require(browser.page.evaluate("localStorage.getItem('@wippy_token_info')") is None,
                    'Bot login stores an authenticated browser token')
            expect(browser.page.locator('iframe[name="wippy:page:app.views:main"]')).to_have_count(0)
            require(token_payloads(inst) == before, 'Bot login changes durable token rows')
            sessions = database_rows(inst, "SELECT COUNT(*) AS count FROM kickside_user_sessions WHERE user_id = '"
                                     + user_id + "'")
            require(int(sessions[0]['count']) == 0, 'Bot login creates a session index')
            browser.screenshot('bot-password-' + password_kind + '-refused')
            browser.clean(0)
            records.append({'user_id': user_id, 'password_kind': password_kind, 'http_status': response.value.status,
                            'session_count': 0, 'unchanged_credential_rows': True, 'shell_absent': True})
            if password_kind == 'injected':
                database_rows(inst, "DELETE FROM app_user_bot_accounts WHERE user_id = '" + user_id
                              + "' RETURNING user_id", write=True)
                browser.login(email, inst.password)
                token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
                inst.redactor.add(token)
                me = inst.request('GET', '/api/v1/user/me', auth=token, label='browser-human-control')
                require(me['user']['id'] == user_id, 'Human control authenticates another account')
                browser.screenshot('preserved-password-human-control')
                injected_trace = trace.with_name('bot-password-injected-trace.zip')
                browser.context.tracing.stop(path=str(injected_trace))
                inst.evidence.paths.append(str(injected_trace))
                browser.reset_context()
                browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        inst.evidence.save('bot-password-browser', {'engine': inst.engine, 'cases': records,
                                                 'human_control': 'same preserved injected password'})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))
    browser.clean(0)


REGISTRY = [Scenario('browser_bot_password_login', 'regression', browser_bot_password_login,
                     ('boot',), instance_setup=True, issues=('RA-B12', 'RA-H26', 'RA-C01'))]


def _oidc_fixture(ctx):
    import yaml
    from scenarios_providers import NS, sso_oidc_setup
    inst = ctx.inst
    ctx.state['provider_bases'] = {'oidc': ctx.fixtures.start('oidc')}
    inst.cleanup.add('browser OIDC provider', ctx.fixtures.stop)
    directory = inst.app / 'src' / 'browser-oidc'
    directory.mkdir()
    (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': [
        {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'actions': ['http_client.request'], 'resources': [ctx.state['provider_bases']['oidc'] + '/*'],
                    'effect': 'allow'}},
        {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'actions': ['http_client.private_ip'], 'resources': ['127.0.0.1'], 'effect': 'allow'}},
    ]}, sort_keys=False))
    ctx.restart()
    sso_oidc_setup(ctx)


def browser_bot_sso_login(ctx):
    from urllib.parse import parse_qs, urlsplit
    from playwright.sync_api import expect
    _oidc_fixture(ctx)
    inst = ctx.inst
    user_id = _bot_fixture(inst, 'operator@northwind.example.invalid')
    browser = ctx.browser_check()
    browser.reset_context()
    trace = inst.root / inst.evidence.label / 'bot-oidc-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    records = []
    try:
        for path in ('email_match', 'existing_subject'):
            if path == 'existing_subject':
                database_rows(inst, "INSERT INTO app_user_identities (id, provider, subject, user_id, email, email_verified) VALUES ('"
                    + str(uuid.uuid4()) + "', 'oidc', 'northwind-operator', '" + user_id
                    + "', 'operator@northwind.example.invalid', TRUE) RETURNING id", write=True)
            before_tokens = token_payloads(inst)
            before_links = database_rows(inst, 'SELECT * FROM app_user_identities ORDER BY id')
            before_users = database_rows(inst, 'SELECT * FROM app_users ORDER BY user_id')
            before_groups = database_rows(inst, 'SELECT * FROM app_user_groups ORDER BY user_id, group_id')
            start = len(ctx.fixtures.requests('oidc'))
            browser.page.goto(inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
            with browser.page.expect_response(lambda r: urlsplit(r.url).path == '/api/public/sso/oidc/callback') as response:
                browser.page.get_by_role('link', name='Continue with Generic OIDC', exact=True).click()
            callback = response.value
            fragment = parse_qs(urlsplit(callback.header_value('location') or '').fragment)
            require(callback.status == 302 and fragment.get('sso_error') and not fragment.get('sso_token'),
                    'OIDC bot callback returns a session or no error')
            browser.page.wait_for_url(inst.base + '/login', timeout=30000)
            expect(browser.page.locator('#error')).to_be_visible()
            expect(browser.page.locator('#error')).not_to_have_text('')
            require(browser.page.evaluate("localStorage.getItem('@wippy_token_info')") is None,
                    'OIDC bot login stores a browser credential')
            expect(browser.page.locator('iframe[name="wippy:page:app.views:main"]')).to_have_count(0)
            require(token_payloads(inst) == before_tokens, 'OIDC bot login changes token rows')
            require(database_rows(inst, 'SELECT * FROM app_user_identities ORDER BY id') == before_links,
                    'OIDC bot login creates or updates an identity link')
            require(database_rows(inst, 'SELECT * FROM app_users ORDER BY user_id') == before_users,
                    'OIDC bot login changes or provisions a user')
            require(database_rows(inst, 'SELECT * FROM app_user_groups ORDER BY user_id, group_id') == before_groups,
                    'OIDC bot login changes group membership')
            sessions = database_rows(inst, "SELECT COUNT(*) AS count FROM kickside_user_sessions WHERE user_id = '"
                                     + user_id + "'")
            require(int(sessions[0]['count']) == 0, 'OIDC bot login creates a session index')
            requests = ctx.fixtures.requests('oidc')[start:]
            for endpoint in ('/authorize', '/token', '/jwks'):
                require(any(row['path'] == endpoint and row['status'] in (200, 302) for row in requests),
                        'OIDC bot refusal does not traverse native provider verification: ' + endpoint)
            browser.screenshot('bot-oidc-' + path + '-refused')
            browser.clean(0)
            records.append({'path': path, 'status': callback.status, 'session_minted': False,
                            'error': fragment['sso_error'][0], 'unchanged_rows': ['accounts', 'identity links', 'groups', 'credentials']})
        database_rows(inst, "DELETE FROM app_user_bot_accounts WHERE user_id = '" + user_id
                      + "' RETURNING user_id", write=True)
        from scenarios_providers import sso_oidc_login
        sso_oidc_login(ctx)
        inst.evidence.save('bot-oidc-browser', {'engine': inst.engine, 'user_id': user_id, 'cases': records,
                                             'human_control': 'same account and provider subject authenticates'})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))
    browser.clean(0)


REGISTRY += [Scenario('browser_bot_sso_login', 'regression', browser_bot_sso_login,
                      ('boot',), instance_setup=True, issues=('RA-B13', 'RA-H28', 'RA-H29', 'RA-C02'))]
