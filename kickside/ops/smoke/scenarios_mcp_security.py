from module_harness import run_focused_module_test
"""MCP authorization and transport security boundaries."""
from harness import Scenario, require
import base64
import hashlib
import secrets
from urllib.parse import urlencode, urlsplit, parse_qs
from scenarios import member_identity
import json
from urllib.request import urlopen


def origin_boundary(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    request = {'jsonrpc': '2.0', 'id': 'origin-check', 'method': 'initialize',
               'params': {'protocolVersion': '2025-06-18', 'capabilities': {},
                          'clientInfo': {'name': 'origin-guard', 'version': '1'}}}
    for origin in ('https://foreign.example', 'null', inst.base + '.foreign.example'):
        denied = inst.request('POST', '/api/public/mcp', request, auth='',
                              headers={'Origin': origin}, expect=(403,), label='mcp-origin-denied')
        require(denied.get('error'), 'Foreign MCP Origin reaches dispatch')
    for headers in ({}, {'Origin': inst.base}):
        admitted = inst.request('POST', '/api/public/mcp', request, auth='',
                                headers=headers, label='mcp-origin-admitted')
        require(admitted.get('result', {}).get('serverInfo'), 'Trusted MCP Origin is refused')


def transport_methods(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    for method in ('GET', 'DELETE'):
        headers = {}
        denied = inst.request(method, '/api/public/mcp', auth='', expect=(405,),
                              response_headers=headers, label='mcp-unsupported-method')
        require(denied.get('error'), 'Unsupported MCP method reaches a different surface')
        require(next((v for k, v in headers.items() if k.lower() == 'allow'), None) == 'POST',
                'Stateless MCP does not advertise its supported method')
    for method in ('POST', 'GET', 'DELETE'):
        denied = inst.request(method, '/api/public/mcp', auth='', headers={'Origin': 'https://foreign.example'},
                              expect=(403,), label='mcp-method-origin-boundary')
        require(denied.get('error'), 'Unsupported-method routing bypasses Origin admission')


def registration_redirects(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    for uri in ('http://remote.example/callback', 'http://localhost.remote.example/callback',
                'https://', 'https://client.example/callback#fragment', 'https://*.example/callback',
                'https://user@client.example/callback', 'javascript://client.example/%0Aalert(1)'):
        denied = inst.request('POST', '/api/public/mcp/oauth/register', {'redirect_uris': [uri]},
                              auth='', expect=(400,), label='mcp-unsafe-redirect')
        require(denied.get('error') == 'invalid_client_metadata', 'Unsafe redirect registers an OAuth client')
    for uri in ('https://client.example/callback', 'http://127.0.0.1:49174/callback',
                'http://[::1]:49174/callback', 'cursor://client/callback'):
        client = inst.request('POST', '/api/public/mcp/oauth/register', {'redirect_uris': [uri]},
                              auth='', expect=(201,), label='mcp-safe-redirect')
        require(client.get('client_id') and client['redirect_uris'] == [uri], 'Valid OAuth redirect is refused')


def resource_binding(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    redirect = 'http://127.0.0.1:49174/callback'
    client = inst.request('POST', '/api/public/mcp/oauth/register', {'redirect_uris': [redirect]},
                          auth='', expect=(201,), label='mcp-resource-client')
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    resource = inst.base + '/api/public/mcp'
    params = {'response_type': 'code', 'client_id': client['client_id'], 'redirect_uri': redirect,
              'code_challenge_method': 'S256', 'code_challenge': challenge, 'resource': resource}
    foreign = 'https://foreign.example/api/public/mcp'
    denied = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': {**params, 'resource': foreign}},
                          auth=member['token'], expect=(400,), label='mcp-resource-consent-denied')
    require('resource' in str(denied.get('error', '')), 'OAuth grants a token for a foreign resource')
    def grant():
        out = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params},
                           auth=member['token'], label='mcp-resource-consent')
        code = parse_qs(urlsplit(out['redirect_to']).query)['code'][0]
        inst.redactor.add(code)
        return code
    exchange = {'grant_type': 'authorization_code', 'client_id': client['client_id'],
                'redirect_uri': redirect, 'code_verifier': verifier}
    denied = inst.request('POST', '/api/public/mcp/oauth/token',
                          raw=urlencode({**exchange, 'code': grant(), 'resource': foreign}).encode(),
                          auth='', headers={'Content-Type': 'application/x-www-form-urlencoded'},
                          expect=(400,), label='mcp-resource-exchange-denied')
    require(denied.get('error') == 'invalid_grant', 'OAuth exchanges a code for a different resource')
    issued = inst.request('POST', '/api/public/mcp/oauth/token',
                          raw=urlencode({**exchange, 'code': grant(), 'resource': resource}).encode(),
                          auth='', headers={'Content-Type': 'application/x-www-form-urlencoded'},
                          label='mcp-resource-exchange')
    inst.redactor.add(issued['access_token'])
    result = inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call',
                          'params': {'name': 'session_info', 'arguments': {}}},
                          auth=issued['access_token'], label='mcp-resource-call')
    require(result.get('result') and not result['result'].get('isError'), 'Resource-bound OAuth token fails')


def root_discovery(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    for name, suffix in (('oauth-protected-resource', '/api/public/mcp'),
                         ('oauth-authorization-server', '/api/public/mcp/oauth')):
        root = inst.request('GET', '/.well-known/' + name, auth='', label='mcp-root-discovery')
        specific = inst.request('GET', '/.well-known/' + name + suffix, auth='', label='mcp-path-discovery')
        require(root == specific, 'Root and path-specific discovery documents differ')
    headers = {}
    inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'},
                 auth='', expect=(401,), response_headers=headers, label='mcp-discovery-challenge')
    challenge = next(v for k, v in headers.items() if k.lower() == 'www-authenticate')
    require('resource_metadata="' + inst.base + '/.well-known/oauth-protected-resource/api/public/mcp"' in challenge,
            'MCP 401 loses its protected-resource metadata hint')


def fresh_proxy_oauth(ctx):
    from contextlib import ExitStack
    from mcp_proxy import forwarding_proxy
    from mcp_sdk import run_sdk_protocol
    from runtime_fixtures import isolated_fixture
    with ExitStack() as stack:
        proxy = None
        def prepare(fixture):
            nonlocal proxy
            proxy = stack.enter_context(forwarding_proxy(fixture.inst.base))
            fixture.inst.config['public_api_url'] = proxy[0]
        with isolated_fixture(ctx, config=dict(ctx.inst.config), prepare=prepare) as fixture:
            inst = fixture.inst
            inst.install('kickside/mcp')
            member = member_identity(fixture)
            public, receipts, failures = proxy
            for name, key, expected in (('oauth-protected-resource', 'resource', public + '/api/public/mcp'),
                                        ('oauth-authorization-server', 'issuer', public + '/api/public/mcp/oauth')):
                with urlopen(public + '/.well-known/' + name, timeout=35) as response:
                    metadata = json.load(response)
                inst.evidence.save('proxy-' + name, {'metadata': metadata, 'expected': expected})
                require(metadata[key] == expected, 'Discovery leaks the internal backend URL behind a proxy')
            bearer = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Fresh proxy SDK bearer'},
                                  auth=member['token'], label='proxy-sdk-bearer')['credential']
            inst.redactor.add(bearer['token'])
            redirect = 'http://127.0.0.1:49174/callback'
            client = inst.request('POST', '/api/public/mcp/oauth/register', {'redirect_uris': [redirect]},
                                  auth='', expect=(201,), label='proxy-sdk-client')
            verifier = secrets.token_urlsafe(48)
            challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
            params = {'response_type': 'code', 'client_id': client['client_id'], 'redirect_uri': redirect,
                      'code_challenge_method': 'S256', 'code_challenge': challenge, 'resource': public + '/api/public/mcp'}
            granted = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params},
                                   auth=member['token'], label='proxy-sdk-consent')
            code = parse_qs(urlsplit(granted['redirect_to']).query)['code'][0]
            inst.redactor.add(code)
            issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params,
                                  'grant_type': 'authorization_code', 'code': code, 'code_verifier': verifier}).encode(),
                                  auth='', headers={'Content-Type': 'application/x-www-form-urlencoded'}, label='proxy-sdk-token')
            inst.redactor.add(issued['access_token'])
            run_sdk_protocol(inst, bearer['token'], issued['access_token'], member['token'], endpoint=public + '/api/public/mcp')
            require(not failures, 'MCP forwarding proxy fails: ' + str(failures))
            inst.evidence.save('proxy-oauth-requests', receipts)

def oauth_request(inst, member, response_headers=None):
    redirect = 'http://127.0.0.1:49174/callback'
    client = inst.request('POST', '/api/public/mcp/oauth/register', {'redirect_uris': [redirect],
                          'client_name': 'MCP security regression'}, auth='', expect=(201,), label='security-client',
                          response_headers=response_headers)
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    params = {'response_type': 'code', 'client_id': client['client_id'], 'redirect_uri': redirect,
              'code_challenge_method': 'S256', 'code_challenge': challenge, 'state': 'security-state'}
    return params, verifier


def sealed_grants(ctx):
    from scenarios_hot_update_work import database_rows
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, verifier = oauth_request(inst, member)
    granted = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params},
                           auth=member['token'], label='sealed-consent')
    code = parse_qs(urlsplit(granted['redirect_to']).query)['code'][0]
    inst.redactor.add(code)
    code_hash = hashlib.sha256(code.encode()).hexdigest()
    rows = database_rows(inst, "SELECT grant_json FROM kickside_mcp_oauth_codes WHERE code_hash='" + code_hash + "'")
    require(rows and 'ksmcp_' not in rows[0]['grant_json'], 'OAuth stores a recoverable bearer in the database')
    issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params, 'code': code,
                          'grant_type': 'authorization_code', 'code_verifier': verifier}).encode(), auth='',
                          headers={'Content-Type': 'application/x-www-form-urlencoded'}, label='sealed-exchange')
    inst.redactor.add(issued['access_token'])
    require(issued['access_token'].startswith('ksmcp_'), 'Sealed OAuth grant fails to exchange')

def private_policy_catalog(ctx):
    from playwright.sync_api import expect
    from scenarios_core import system
    inst = ctx.inst
    inst.install('kickside/mcp')
    public = 'kickside.mcp.security:module_access'
    policies = inst.request('GET', '/api/v1/security/policies', label='mcp-policy-catalog')['policies']
    own = sorted(p['id'] for p in policies if p['id'].startswith('kickside.mcp.security:'))
    require(own == [public], 'MCP exposes internal execution grants for group assignment: ' + str(own))
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    system(ctx, 'Security')
    panel = browser.frame.locator('kickside-security')
    panel.get_by_role('button', name='New scope', exact=True).first.click()
    search = panel.get_by_placeholder('Search policies…', exact=True)
    search.fill(public)
    expect(panel.locator('.ks-pcard').filter(has_text=public)).to_be_visible()
    search.fill('kickside.mcp.security:')
    expect(panel.locator('.ks-pcard')).to_have_count(1)
    expect(panel.locator('.ks-pcard').filter(has_text=public)).to_be_visible()
    browser.screenshot('mcp-member-policy-palette')

def validated_consent(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, verifier = oauth_request(inst, member)
    browser = ctx.browser_check()
    browser.login(member['email'], inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    application_url = browser.page.url
    with browser.presentation():
        invalid = '/api/public/mcp/oauth/authorize?' + urlencode({**params, 'redirect_uri': 'https://attacker.example/callback'})
        with browser.rejection('GET', invalid, 400):
            browser.page.goto(inst.base + invalid, wait_until='domcontentloaded')
        expect(browser.page.get_by_role('button', name='Deny', exact=True)).to_have_count(0)
        expect(browser.page.get_by_role('button', name='Allow', exact=True)).to_have_count(0)
        browser.screenshot('mcp-invalid-consent-rejected')
        path = '/api/public/mcp/oauth/authorize?' + urlencode(params)
        presets_url = inst.base + '/api/v1/mcp/presets'
        def expired_presets(route):
            route.fulfill(status=401, content_type='application/json',
                          body=json.dumps({'success': False, 'error': 'preset authentication required'}))
        browser.page.route(presets_url, expired_presets)
        try:
            with browser.rejection('GET', '/api/v1/mcp/presets', 401):
                browser.page.goto(inst.base + path, wait_until='domcontentloaded')
            expect(browser.page.locator('#err')).to_have_text('preset authentication required')
            expect(browser.page.get_by_role('button', name='Allow', exact=True)).to_be_disabled()
            browser.screenshot('mcp-consent-initialization-error')
        finally:
            browser.page.unroute(presets_url, expired_presets)
        callback = {}
        def complete(route):
            callback.update(parse_qs(urlsplit(route.request.url).query))
            if callback.get('code'):
                inst.redactor.add(callback['code'][0])
            route.fulfill(status=200, content_type='text/html', body='<p>OAuth callback complete</p>')
        browser.page.route(params['redirect_uri'] + '**', complete)
        try:
            browser.page.goto(inst.base + path, wait_until='domcontentloaded')
            allow = browser.page.get_by_role('button', name='Allow', exact=True)
            expect(allow).to_be_enabled()
            browser.screenshot('mcp-consent-ready')
            allow.click()
            browser.page.get_by_text('OAuth callback complete', exact=True).wait_for(timeout=30000)
            require(callback.get('state') == [params['state']] and callback.get('code'), 'Browser approval loses code/state')
            issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params,
                                  'code': callback['code'][0], 'grant_type': 'authorization_code',
                                  'code_verifier': verifier}).encode(), auth='',
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'}, label='browser-consent-exchange')
            inst.redactor.add(issued['access_token'])
            result = inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call',
                                  'params': {'name': 'session_info', 'arguments': {}}},
                                  auth=issued['access_token'], label='browser-consent-identity')
            content = json.loads(result['result']['content'][0]['text'])
            require(content['actor'] == member['id'], 'Browser consent mints for another user')
        finally:
            browser.page.unroute(params['redirect_uri'] + '**', complete)
    require(browser.page.url == application_url, 'Consent fixture changes the application navigation')


def framed_consent(ctx):
    from html import escape
    from playwright.sync_api import expect
    from urllib.error import HTTPError
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, _ = oauth_request(inst, member)
    path = '/api/public/mcp/oauth/authorize?' + urlencode(params)
    for query, status in ((path, 200), ('/api/public/mcp/oauth/authorize', 400)):
        try:
            response = urlopen(inst.base + query, timeout=35)
        except HTTPError as error:
            response = error
        with response:
            require(response.status == status, 'Consent framing request has an unexpected status')
            headers = {key.lower(): value for key, value in response.headers.items()}
            inst.evidence.save('mcp-consent-frame-headers', {'status': response.status, 'headers': headers})
        require(headers.get('content-security-policy') == "frame-ancestors 'none'",
                'Consent response permits embedding')
        require(headers.get('x-frame-options') == 'DENY', 'Consent loses its legacy browser frame protection')
    browser = ctx.browser_check()
    browser.login(member['email'], inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    wrapper = inst.base + '/mcp-framing-proof'
    with browser.embedding_refusal(path) as page:
        page.route(wrapper, lambda route: route.fulfill(status=200, content_type='text/html',
               body='<h1>Embedding proof</h1><iframe id="consent-frame" onload="this.dataset.loaded=\'yes\'" src="'
                    + escape(inst.base + path, quote=True) + '"></iframe>'))
        page.goto(wrapper, wait_until='load', timeout=30000)
        expect(page.locator('#consent-frame')).to_have_attribute('data-loaded', 'yes')
        expect(page.frame_locator('#consent-frame').get_by_role('button', name='Allow', exact=True)).to_have_count(0)
        browser.screenshot('mcp-consent-frame-blocked')

def credential_cache_control(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    def protected(headers):
        lower = {key.lower(): value for key, value in headers.items()}
        require(lower.get('cache-control') == 'no-store', 'Credential or OAuth response permits storage')
        require(lower.get('pragma') == 'no-cache', 'Credential or OAuth response loses Pragma no-cache')
    headers = {}
    params, verifier = oauth_request(inst, member, headers)
    protected(headers)
    headers = {}
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Cache control guard'},
                              auth=member['token'], response_headers=headers, label='mcp-cache-mint')['credential']
    inst.redactor.add(credential['token'])
    protected(headers)
    headers = {}
    granted = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params},
                           auth=member['token'], response_headers=headers, label='mcp-cache-consent')
    protected(headers)
    code = parse_qs(urlsplit(granted['redirect_to']).query)['code'][0]
    inst.redactor.add(code)
    headers = {}
    issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params, 'code': code,
                          'grant_type': 'authorization_code', 'code_verifier': verifier}).encode(), auth='',
                          headers={'Content-Type': 'application/x-www-form-urlencoded'},
                          response_headers=headers, label='mcp-cache-token')
    inst.redactor.add(issued['access_token'])
    protected(headers)
    for path, auth, raw in (('/api/public/mcp/oauth/token', '', b'grant_type=unsupported'),
                            ('/api/public/mcp/oauth/register', '', b'{'),
                            ('/api/v1/mcp/oauth/consent', member['token'], b'{'),
                            ('/api/v1/mcp/credentials', member['token'], b'{')):
        headers = {}
        inst.request('POST', path, raw=raw, auth=auth, expect=(400,), response_headers=headers,
                     label='mcp-cache-rejection')
        protected(headers)
    with urlopen(inst.base + '/api/public/mcp/oauth/authorize?' + urlencode(params), timeout=35) as response:
        require(response.status == 200, 'Valid consent page does not render')
        protected(dict(response.headers.items()))
    headers = {}
    inst.request('GET', '/api/v1/mcp/oauth/context?' + urlencode(params), auth=member['token'],
                 response_headers=headers, label='mcp-cache-context')
    protected(headers)

def consent_destination(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, _ = oauth_request(inst, member)
    query = urlencode(params)
    context = inst.request('GET', '/api/v1/mcp/oauth/context?' + query, auth=member['token'],
                           label='mcp-consent-destination')
    require(context.get('redirect_uri') == params['redirect_uri'], 'Consent loses the validated callback destination')
    browser = ctx.browser_check()
    browser.login(member['email'], inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    application_url = browser.page.url
    with browser.presentation():
        browser.page.goto(inst.base + '/api/public/mcp/oauth/authorize?' + query, wait_until='domcontentloaded')
        expect(browser.page.get_by_role('button', name='Allow', exact=True)).to_be_enabled()
        expect(browser.page.locator('#destination')).to_have_text('Redirect destination: 127.0.0.1')
        expect(browser.page.locator('#destination')).to_be_visible()
        browser.screenshot('mcp-visible-consent-destination')
    require(browser.page.url == application_url, 'Consent fixture changes the application navigation')


def pkce_proofs(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, _ = oauth_request(inst, member)
    for challenge in ('a' * 42, 'a' * 44, 'a' * 42 + '=', '+' * 43, '/' * 43, 'a' * 42 + ' '):
        denied = inst.request('GET', '/api/v1/mcp/oauth/context?' + urlencode({**params, 'code_challenge': challenge}),
                              auth=member['token'], expect=(400,), label='mcp-invalid-pkce-challenge')
        require('code_challenge' in denied.get('error', ''), 'Malformed S256 challenge reaches consent')
    for verifier in ('a' * 42, 'a' * 129, 'a' * 42 + '=', 'a' * 42 + '+', 'a' * 42 + '/',
                     'a' * 42 + ' ', 'a' * 42 + '!', 'AZaz09-._~' + 'a' * 33, 'a' * 128):
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
        requested = {**params, 'code_challenge': challenge}
        granted = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': requested},
                               auth=member['token'], label='mcp-pkce-proof-consent')
        code = parse_qs(urlsplit(granted['redirect_to']).query)['code'][0]
        inst.redactor.add(code)
        valid = 43 <= len(verifier) <= 128 and all(c.isascii() and (c.isalnum() or c in '-._~') for c in verifier)
        exchanged = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params,
                                 'code': code, 'grant_type': 'authorization_code', 'code_verifier': verifier}).encode(),
                                 auth='', headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                 expect=(200,) if valid else (400,), label='mcp-pkce-proof-exchange')
        if valid:
            inst.redactor.add(exchanged['access_token'])
            require(exchanged.get('token_type') == 'bearer', 'Valid RFC 7636 verifier is refused')
        else:
            require(exchanged.get('error') == 'invalid_grant', 'Malformed verifier releases a bearer')

def stored_redirect_safety(ctx):
    from scenarios_hot_update_work import database_rows
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, _ = oauth_request(inst, member)
    client = params['client_id'].replace("'", "''")
    original = json.dumps([params['redirect_uri']]).replace("'", "''")
    try:
        for uri in ('http://remote.example/callback', 'javascript://client.example/callback',
                    'https://client.example/callback#fragment', 'https://user@client.example/callback'):
            metadata = json.dumps([uri])
            updated = database_rows(inst, "UPDATE kickside_mcp_oauth_clients SET redirect_uris_json='"
                                    + metadata.replace("'", "''") + "' WHERE client_id='" + client + "' RETURNING client_id", write=True)
            require(updated == [{'client_id': params['client_id']}], 'Legacy OAuth fixture does not update its own client')
            query = urlencode({**params, 'redirect_uri': uri})
            denied = inst.request('GET', '/api/v1/mcp/oauth/context?' + query,
                                  auth=member['token'], expect=(400,), label='mcp-stored-redirect-context')
            require('redirect_uri' in denied.get('error', ''), 'Stored unsafe callback reaches consent')
            inst.request('GET', '/api/public/mcp/oauth/authorize?' + query, auth='', expect=(400,),
                         label='mcp-stored-redirect-authorize')
            rows = database_rows(inst, "SELECT redirect_uris_json FROM kickside_mcp_oauth_clients WHERE client_id='" + client + "'")
            require(rows == [{'redirect_uris_json': metadata}], 'Unsafe callback admission rewrites existing client data')
    finally:
        restored = database_rows(inst, "UPDATE kickside_mcp_oauth_clients SET redirect_uris_json='"
                                 + original + "' WHERE client_id='" + client + "' RETURNING client_id", write=True)
        require(restored == [{'client_id': params['client_id']}], 'Legacy OAuth fixture does not restore its client')
    admitted = inst.request('GET', '/api/v1/mcp/oauth/context?' + urlencode(params),
                            auth=member['token'], label='mcp-restored-safe-callback')
    require(admitted.get('redirect_uri') == params['redirect_uri'], 'Stored safe callback is refused')

def mint_restrictions(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    before = inst.request('GET', '/api/v1/mcp/credentials', auth=member['token'], label='mcp-mint-before')['credentials']
    for body in ({'whitelist_component_ids': 'scope'}, {'whitelist_component_ids': {'scope': 'restricted'}},
                 {'whitelist_component_ids': [False]}, {'whitelist_component_ids': ['']},
                 {'allowed_tool_ids': 'limited'}, {'allowed_tool_ids': [True]},
                 {'allowed_trait_ids': {'trait': 'limited'}}, {'allowed_trait_ids': ['']},
                 {'default_active_trait_ids': [False]}, {'agent_profile': 'profile'}, {'expires_at': '123'}):
        denied = inst.request('POST', '/api/v1/mcp/credentials', body, auth=member['token'], expect=(400,),
                              label='mcp-invalid-mint-restrictions')
        require(denied.get('success') is False and not denied.get('credential'), 'Malformed restrictions mint a bearer')
    after = inst.request('GET', '/api/v1/mcp/credentials', auth=member['token'], label='mcp-mint-after')['credentials']
    require(len(after) == len(before), 'Refused restriction input persists credentials')
    params, _ = oauth_request(inst, member)
    denied = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params, 'mint': {'policy': {'allowed_trait_ids': [False]}}},
                          auth=member['token'], expect=(400,), label='mcp-invalid-oauth-mint-restrictions')
    require(denied.get('error') and not denied.get('redirect_to'), 'OAuth filters malformed narrowing policy into a grant')
    for body in ({}, {'whitelist_component_ids': [], 'allowed_trait_ids': [], 'allowed_tool_ids': []}):
        admitted = inst.request('POST', '/api/v1/mcp/credentials', body, auth=member['token'], label='mcp-valid-neutral-mint')
        inst.redactor.add(admitted['credential']['token'])
        require(admitted.get('success') is True, 'Absent or valid empty restrictions no longer mint')


def corrupt_policy(ctx):
    from scenarios_hot_update_work import database_rows
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    minted = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Corrupt-policy guard'},
                          auth=member['token'], label='mcp-policy-credential')['credential']
    inst.redactor.add(minted['token'])
    credential = minted['credential_id'].replace("'", "''")
    original = database_rows(inst, "SELECT policy_json FROM kickside_mcp_credentials WHERE credential_id='" + credential + "'")[0]['policy_json']
    try:
        for raw in ('{broken', '42', '[1]', '{"allowed_trait_ids":"restricted"}', '{"allowed_trait_ids":[42]}',
                    '{"allowed_tool_ids":{"tool":true}}', '{"default_active_trait_ids":[false]}', '{"agent_profile":[1]}'):
            updated = database_rows(inst, "UPDATE kickside_mcp_credentials SET policy_json='" + raw.replace("'", "''")
                                    + "' WHERE credential_id='" + credential + "' RETURNING credential_id", write=True)
            require(updated == [{'credential_id': minted['credential_id']}], 'Owned policy fixture does not update')
            rejected = inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'},
                                    auth=minted['token'], expect=(401,), label='mcp-corrupt-policy-bearer')
            require(rejected.get('error'), 'Corrupt stored policy admits a bearer')
            inst.request('GET', '/api/v1/mcp/credentials', auth=member['token'], expect=(500,), label='mcp-corrupt-policy-list')
            inst.request('PATCH', '/api/v1/mcp/credentials/' + minted['credential_id'], {'allowed_tool_ids': []},
                         auth=member['token'], expect=(500,), label='mcp-corrupt-policy-patch')
    finally:
        restored = database_rows(inst, "UPDATE kickside_mcp_credentials SET policy_json='" + original.replace("'", "''")
                                 + "' WHERE credential_id='" + credential + "' RETURNING credential_id", write=True)
        require(restored == [{'credential_id': minted['credential_id']}], 'Owned policy fixture does not restore')
    inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'},
                 auth=minted['token'], label='mcp-restored-policy-bearer')


def json_admission(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_authorization_test')
    run_focused_module_test(ctx, 'kickside/mcp', 'oauth_http_test')
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    for body in ({'allowed_trait_ids': [None]}, {'allowed_tool_ids': [None]},
                 {'default_active_trait_ids': [None]}, {'whitelist_component_ids': [None]}):
        denied = inst.request('POST', '/api/v1/mcp/credentials', body, auth=member['token'], expect=(400,),
                              label='mcp-raw-json-admission')
        require('invalid' in denied.get('error', ''), 'Raw null elements collapse into unrestricted credential input')
    params, _ = oauth_request(inst, member)
    denied = inst.request('POST', '/api/v1/mcp/oauth/consent',
                          {'params': params, 'mint': {'policy': {'allowed_trait_ids': [None]}}},
                          auth=member['token'], expect=(400,), label='mcp-raw-oauth-json-admission')
    require('invalid' in denied.get('error', ''), 'Raw OAuth narrowing loses null elements before admission')


def preset_catalog_errors(ctx):
    from playwright.sync_api import expect
    run_focused_module_test(ctx, 'kickside/mcp', 'catalog_errors_test')
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, _ = oauth_request(inst, member)
    browser = ctx.browser_check()
    browser.login(member['email'], inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    application_url = browser.page.url
    with browser.presentation():
        message = 'preset discovery failed: catalog unavailable'
        with browser.failure_response('GET', '/api/v1/mcp/presets', 500, {'success': False, 'error': message}):
            browser.page.goto(inst.base + '/api/public/mcp/oauth/authorize?' + urlencode(params),
                              wait_until='domcontentloaded')
            expect(browser.page.locator('#err')).to_have_text(message)
            expect(browser.page.get_by_role('button', name='Allow', exact=True)).to_be_disabled()
            expect(browser.page.get_by_role('button', name='Deny', exact=True)).to_be_disabled()
            browser.screenshot('mcp-preset-catalog-error')
    require(browser.page.url == application_url, 'Consent fixture changes the application navigation')


def consent_preset_scope(ctx):
    from playwright.sync_api import expect
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_mint_test')
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    params, verifier = oauth_request(inst, member)
    browser = ctx.browser_check()
    browser.login(member['email'], inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.settle()
    application_url = browser.page.url
    with browser.presentation():
        callback = {}
        def complete(route):
            callback.update(parse_qs(urlsplit(route.request.url).query))
            if callback.get('code'):
                inst.redactor.add(callback['code'][0])
            route.fulfill(status=200, content_type='text/html', body='<p>Preset authorization completes</p>')
        browser.page.route(params['redirect_uri'] + '**', complete)
        try:
            browser.page.goto(inst.base + '/api/public/mcp/oauth/authorize?' + urlencode(params),
                              wait_until='domcontentloaded')
            allow = browser.page.get_by_role('button', name='Allow', exact=True)
            expect(allow).to_be_enabled()
            browser.page.locator('#preset').select_option('kickside.mcp:preset.reader')
            browser.screenshot('mcp-reader-preset-consent')
            allow.click()
            browser.page.get_by_text('Preset authorization completes', exact=True).wait_for(timeout=30000)
            require(callback.get('code') and callback.get('state') == [params['state']], 'Preset consent loses code or state')
            issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**params,
                                  'code': callback['code'][0], 'grant_type': 'authorization_code',
                                  'code_verifier': verifier}).encode(), auth='',
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'}, label='mcp-preset-oauth-exchange')
            token = issued['access_token']
            inst.redactor.add(token)
            def call(name, arguments):
                result = inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/call',
                                      'params': {'name': name, 'arguments': arguments}}, auth=token,
                                      label='mcp-preset-' + name)['result']
                require(result.get('isError') is False, 'Valid preset meta call fails')
                return json.loads(result['content'][0]['text'])
            require(call('list_traits', {}).get('traits') == [], 'Reader consent keeps unrestricted trait activation')
            granted = call('list_tools', {'available': True}).get('tools')
            require(granted == [], 'Empty Reader preset exposes tools outside its bundle')
            listed = inst.request('GET', '/api/v1/mcp/credentials', auth=member['token'], label='mcp-preset-managed-list')['credentials']
            credential = next(row for row in listed if row['credential_id'] == issued['credential_id'])
            inst.request('PATCH', '/api/v1/mcp/credentials/' + credential['credential_id'], {'label': 'Reader consent guard'},
                         auth=member['token'], label='mcp-preset-label-patch')
            require(call('list_traits', {}).get('traits') == [], 'A label patch loses the finite preset ceiling')
        finally:
            browser.page.unroute(params['redirect_uri'] + '**', complete)
    require(browser.page.url == application_url, 'Consent fixture changes the application navigation')


def authority_lifecycle(ctx):
    import uuid
    from scenarios_issue_guards import login
    for module, entry in (
        ('kickside/users', 'delegation_authority_test'),
        ('kickside/execution', 'tsplit_execution_identity_test_execution_live_authority'),
        ('kickside/mcp', 'repo_authorization_test'),
        ('kickside/mcp', 'repo_mint_test'),
    ):
        run_focused_module_test(ctx, module, entry)
    inst = ctx.inst
    inst.install('kickside/mcp')
    inst.install('kickside/knowledge')
    policies = inst.request('GET', '/api/v1/security/policies', label='mcp-authority-policies')['policies']
    knowledge = next(row['id'] for row in policies if row.get('surface') == 'kickside.knowledge'
                     and row.get('intent') == 'module_access')
    suffix = uuid.uuid4().hex[:10]
    base_slug, added_slug = 'mcp_base_' + suffix, 'mcp_added_' + suffix
    baseline = sorted(row['id'] for row in policies if row.get('intent') == 'module_access' and row['id'] != knowledge)
    for slug, members in ((base_slug, baseline), (added_slug, [knowledge])):
        inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'policies': members}, label=slug)
        inst.cleanup.add(slug, lambda slug=slug: inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug))
    groups = ['app.security:user', 'kickside.security.scopes:' + base_slug]
    expanded = groups + ['kickside.security.scopes:' + added_slug]
    email = 'mcp-authority-' + suffix + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                        'full_name': 'MCP authority member', 'groups': groups}, expect=(201,), label='mcp-authority-user')['user']
    inst.cleanup.add('MCP authority member', lambda: inst.request('DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
    token = login(inst, email, 'mcp-authority-initial-login')
    def mint(session):
        issued = inst.request('POST', '/api/v1/mcp/credentials',
            {'label': 'Delegated authority guard', 'allowed_tool_ids': ['kickside.knowledge.traits:kb_find_tool']},
            auth=session, label='mcp-authority-mint')['credential']
        inst.redactor.add(issued['token'])
        return issued['token']
    def tools(bearer, expected=200):
        result = inst.request('POST', '/api/public/mcp',
            {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list', 'params': {}}, auth=bearer,
            expect=(expected,), label='mcp-authority-tools')
        if expected == 401:
            require(result.get('error'), 'Revoked delegated authority has no refusal')
            return set()
        require(result.get('result'), 'Valid delegated authority is refused')
        return {tool['name'] for tool in result['result']['tools']}
    original = mint(token)
    require('FindKnowledgeBases' not in tools(original), 'Initial credential gains an unassigned module')
    inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': expanded}, label='mcp-authority-expansion')
    expanded_tools = tools(original)
    require('FindKnowledgeBases' in expanded_tools, 'Existing credential misses live group authority')
    require(not expanded_tools.intersection({'QueryKB', 'RetrieveKB', 'AskKB', 'SearchKB', 'Knowledge'}),
            'Live group expansion exceeds the explicit credential tool ceiling')
    refreshed = login(inst, email, 'mcp-authority-refreshed-login')
    issued = mint(refreshed)
    require('FindKnowledgeBases' in tools(issued), 'Reissued credential misses expanded module authority')
    inst.request('POST', '/api/v1/user/logout', {'all': True}, auth=refreshed, label='mcp-authority-logout-all')
    require('FindKnowledgeBases' in tools(issued), 'Logout-all changes durable MCP semantics')
    inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': groups}, label='mcp-authority-reduction')
    for bearer in (original, issued):
        tools(bearer, 401)
    inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': expanded}, label='mcp-authority-restoration')
    for bearer in (original, issued):
        tools(bearer, 401)
    final = mint(login(inst, email, 'mcp-authority-restored-login'))
    require('FindKnowledgeBases' in tools(final), 'Fresh credential remains revoked after restoration')
    inst.request('POST', '/api/v1/security/scopes', {'slug': added_slug, 'policies': []}, label='mcp-authority-policy-reduction')
    tools(final, 401)
    inst.request('POST', '/api/v1/security/scopes', {'slug': added_slug, 'policies': [knowledge]}, label='mcp-authority-policy-restoration')
    tools(final, 401)
    restored = mint(login(inst, email, 'mcp-authority-policy-restored-login'))
    require('FindKnowledgeBases' in tools(restored), 'New credential misses restored policy authority')


def continuation_authority(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_authorization_test')


def mcp_oauth_admission_harness_lint(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'oauth_admission_test', lint=True)


def dcr_admission(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'oauth_admission_test')
    run_focused_module_test(ctx, 'kickside/mcp', 'oauth_http_test')
    inst = ctx.inst
    inst.install('kickside/mcp')
    redirect = 'https://client.example/callback'
    malformed = [
        {'client_name': 'n' * 257, 'redirect_uris': [redirect]},
        {'redirect_uris': [redirect + '?n=' + str(i) for i in range(17)]},
        {'redirect_uris': [redirect + '?q=' + 'x' * 2048]},
        {'redirect_uris': [redirect, None]},
        {'client_name': 'x' * 65536, 'redirect_uris': [redirect]},
    ]
    for metadata in malformed:
        refused = inst.request('POST', '/api/public/mcp/oauth/register', metadata, auth='',
                               expect=(400,), label='mcp-dcr-admission-refused')
        require(refused.get('error') == 'invalid_client_metadata', 'Malformed DCR metadata reaches storage')
    client = inst.request('POST', '/api/public/mcp/oauth/register',
                          {'client_name': 'Admission guard', 'redirect_uris': [redirect]}, auth='',
                          expect=(201,), label='mcp-dcr-valid-registration')
    require(client.get('client_id') and client.get('token_endpoint_auth_method') == 'none',
            'Valid public DCR registration is refused')


def tool_argument_validation(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_capability_grants_test')
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_authorization_test')


def native_tool_errors(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_capability_grants_test')
    run_focused_module_test(ctx, 'kickside/mcp', 'repo_authorization_test')


REGISTRY = [
    Scenario('mcp_oauth_admission_harness_lint', 'regression', mcp_oauth_admission_harness_lint,
             issues=('MCP-OAUTH-ADMISSION-HARNESS-TYPED-LIFETIME',)),
    Scenario('mcp_security_authority_lifecycle', 'regression', authority_lifecycle, ('platform_onboarding',),
             issues=('MCP-SECURITY-AUTHORITY-LIFECYCLE',)),
    Scenario('mcp_security_continuation_authority', 'regression', continuation_authority, ('platform_onboarding',),
             issues=('MCP-SECURITY-CONTINUATION-AUTHORITY',)),
    Scenario('mcp_security_dcr_admission', 'regression', dcr_admission, ('platform_onboarding',),
             issues=('MCP-SECURITY-DCR-ADMISSION',)),
    Scenario('mcp_security_tool_arguments', 'regression', tool_argument_validation, ('platform_onboarding',),
             issues=('MCP-SECURITY-TOOL-ARGUMENTS', 'NE-80')),
    Scenario('mcp_security_consent_preset', 'regression', consent_preset_scope, ('platform_onboarding',),
             issues=('SMOKE-MCP-CONSENT-PAGE-OWNERSHIP', 'MCP-SECURITY-CONSENT-PRESET',)),
    Scenario('mcp_security_preset_catalog', 'regression', preset_catalog_errors, ('platform_onboarding',),
             issues=('SMOKE-MCP-CONSENT-PAGE-OWNERSHIP', 'MCP-SECURITY-PRESET-CATALOG',)),
    Scenario('mcp_security_json_admission', 'regression', json_admission, ('platform_onboarding',),
             issues=('MCP-SECURITY-JSON-ADMISSION',)),
    Scenario('mcp_security_mint_restrictions', 'regression', mint_restrictions, ('platform_onboarding',),
             issues=('MCP-SECURITY-MINT-RESTRICTIONS',)),
    Scenario('mcp_security_corrupt_policy', 'regression', corrupt_policy, ('platform_onboarding',),
             issues=('MCP-SECURITY-CORRUPT-POLICY',)),
    Scenario('regression_mcp_native_tool_errors', 'regression', native_tool_errors, issues=('NE-14',)),
    Scenario('mcp_security_transport_methods', 'regression', transport_methods, ('platform_onboarding',),
             issues=('MCP-SECURITY-TRANSPORT-METHODS',)),
    Scenario('mcp_security_stored_redirects', 'regression', stored_redirect_safety, ('platform_onboarding',),
             issues=('MCP-SECURITY-STORED-REDIRECT',)),
    Scenario('mcp_security_pkce', 'regression', pkce_proofs, ('platform_onboarding',),
             issues=('MCP-SECURITY-PKCE',)),
    Scenario('mcp_security_consent_destination', 'regression', consent_destination, ('platform_onboarding',),
             issues=('SMOKE-MCP-CONSENT-PAGE-OWNERSHIP', 'MCP-SECURITY-CONSENT-DESTINATION',)),
    Scenario('mcp_security_credential_cache', 'regression', credential_cache_control, ('platform_onboarding',),
             issues=('MCP-SECURITY-CREDENTIAL-CACHE',)),
    Scenario('mcp_security_consent_framing', 'regression', framed_consent, ('platform_onboarding',),
             issues=('MCP-SECURITY-CONSENT-FRAMING',)),
    Scenario('mcp_security_validated_consent', 'regression', validated_consent, ('platform_onboarding',),
             issues=('SMOKE-MCP-CONSENT-PAGE-OWNERSHIP', 'MCP-SECURITY-CONSENT-REQUEST',)),
    Scenario('mcp_security_private_policies', 'regression', private_policy_catalog, ('platform_onboarding',),
             issues=('MCP-SECURITY-INTERNAL-POLICIES',)),
    Scenario('mcp_security_sealed_grants', 'regression', sealed_grants, ('platform_onboarding',),
             issues=('MCP-SECURITY-PARKED-BEARER',)),
    Scenario('mcp_security_origin', 'regression', origin_boundary, ('platform_onboarding',),
             issues=('MCP-SECURITY-ORIGIN',)),
    Scenario('mcp_security_redirects', 'regression', registration_redirects, ('platform_onboarding',),
             issues=('MCP-SECURITY-REDIRECT-URI',)),
    Scenario('mcp_security_resource', 'regression', resource_binding, ('platform_onboarding',),
             issues=('MCP-SECURITY-RESOURCE-BINDING',)),
    Scenario('mcp_oauth_fresh_proxy', 'regression', fresh_proxy_oauth, ('platform_onboarding',),
             issues=('MCP-OAUTH-PUBLIC-URL',)),
    Scenario('mcp_oauth_root_discovery', 'regression', root_discovery, ('platform_onboarding',),
             issues=('MCP-OAUTH-ROOT-DISCOVERY',)),
]
