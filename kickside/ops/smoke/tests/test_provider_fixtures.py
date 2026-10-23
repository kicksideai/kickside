import base64
import hashlib
import json
import unittest
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen
from urllib.error import HTTPError
import mocks

class ProviderFixtures(unittest.TestCase):
    def setUp(self):
        self.fixtures = mocks.Fixtures()

    def tearDown(self):
        self.fixtures.stop()

    def call(self, base, path, body=None, headers=None, method=None):
        req = Request(base + path, data=body, headers=headers or {}, method=method)
        try:
            response = urlopen(req, timeout=5)
        except HTTPError as error:
            response = error
        with response:
            return response.status, dict(response.headers), response.read()

    def test_simplefin_claim_auth_and_snapshot(self):
        base = self.fixtures.start('simplefin')
        status, headers, access = self.call(base, '/simplefin/claim/northwind', b'')
        self.assertEqual(status, 200)
        self.assertEqual(access.decode(), base.replace('://', '://northwind:fictional-bank@') + '/simplefin')
        self.assertEqual(self.call(base, '/simplefin/accounts')[0], 401)
        auth = {'Authorization': 'Basic ' + base64.b64encode(b'northwind:fictional-bank').decode()}
        rows = json.loads(self.call(base, '/simplefin/accounts', headers=auth)[2])
        self.assertEqual(rows['accounts'][0]['balance'], '18425.50')
        self.assertEqual(rows['accounts'][0]['transactions'][0]['amount'], '-48.69')
        self.assertNotIn('fictional-bank', json.dumps(self.fixtures.requests()))

    def test_web_page_links_and_strict_unknown_routes(self):
        base = self.fixtures.start('webscout')
        status, headers, page = self.call(base, '/northwind')
        self.assertEqual(status, 200)
        self.assertIn('text/html', headers['Content-Type'])
        self.assertIn(b'NORTHWIND-PAGE-731', page)
        self.assertIn(b'href="/orders"', page)
        self.assertEqual(self.call(base, '/absent')[0], 404)

    def test_mcp_negotiation_and_stateful_tool(self):
        base = self.fixtures.start('mcp')
        def rpc(method, params):
            raw = json.dumps({'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params}).encode()
            return self.call(base, '/mcp', raw, {'Content-Type': 'application/json'})
        status, headers, raw = rpc('initialize', {'protocolVersion': '2025-11-25'})
        self.assertEqual(json.loads(raw)['result']['protocolVersion'], '2025-11-25')
        self.assertIn('Mcp-Session-Id', headers)
        self.assertEqual(json.loads(rpc('tools/list', {})[2])['result']['tools'][0]['name'], 'northwind_order')
        result = json.loads(rpc('tools/call', {'name': 'northwind_order', 'arguments': {'note': 'Northwind packed'}})[2])
        self.assertIn('Northwind packed', result['result']['content'][0]['text'])
        self.assertIn('error', json.loads(rpc('invented/method', {})[2]))

    def test_mcp_rejects_array_arguments(self):
        from mocks.mcp import MCP
        fixture = MCP('http://127.0.0.1:731')
        _, _, response = fixture.dispatch('POST', '/mcp', {}, {'id': 1, 'method': 'tools/call', 'params': {'name': 'northwind_order', 'arguments': []}}, {})
        self.assertEqual(response['error']['code'], -32602)

    def test_mcp_oauth_discovery_authorization_code_and_protected_tools(self):
        base = self.fixtures.start('mcp')
        def call(path, body=None, headers=None, method=None):
            return self.call(base, path, body, headers, method)

        status, headers, _ = call('/mcp/oauth', json.dumps({
            'jsonrpc': '2.0', 'id': 1, 'method': 'initialize', 'params': {'protocolVersion': '2025-11-25'},
        }).encode(), {'Content-Type': 'application/json'})
        self.assertEqual(status, 401)
        resource_metadata = next(value for key, value in headers.items() if key.lower() == 'www-authenticate')
        resource_metadata = resource_metadata.split('resource_metadata="', 1)[1].removesuffix('"')
        metadata_path = urlsplit(resource_metadata).path
        status, _, raw = call(metadata_path)
        self.assertEqual(status, 200)
        protected = json.loads(raw)
        self.assertEqual(protected['resource'], base + '/mcp/oauth')
        authorization_server = protected['authorization_servers'][0]
        status, _, raw = call(urlsplit(authorization_server).path + '/.well-known/oauth-authorization-server')
        self.assertEqual(status, 200)
        server = json.loads(raw)
        self.assertEqual(server['token_endpoint_auth_methods_supported'], ['none'])

        registration = json.dumps({'redirect_uris': ['http://127.0.0.1:731/callback']}).encode()
        status, _, raw = call('/register', registration, {'Content-Type': 'application/json'})
        self.assertEqual(status, 201)
        client_id = json.loads(raw)['client_id']
        verifier = 'northwind-mcp-verifier-' * 4
        challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
        query = urlencode({'client_id': client_id, 'redirect_uri': 'http://127.0.0.1:731/callback',
                           'state': 'northwind-state', 'code_challenge_method': 'S256', 'code_challenge': challenge})
        class NoRedirect(HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None
        try:
            response = build_opener(NoRedirect).open(Request(base + '/authorize?' + query), timeout=5)
        except HTTPError as error:
            response = error
        with response:
            status, headers = response.status, dict(response.headers)
        self.assertEqual(status, 302)
        callback = parse_qs(urlsplit(headers['Location']).query)
        self.assertEqual(callback['state'], ['northwind-state'])
        token_body = urlencode({'grant_type': 'authorization_code', 'client_id': client_id,
                                'redirect_uri': 'http://127.0.0.1:731/callback', 'code': callback['code'][0],
                                'code_verifier': verifier}).encode()
        status, _, raw = call('/token', token_body, {'Content-Type': 'application/x-www-form-urlencoded'})
        self.assertEqual(status, 200)
        token = json.loads(raw)['access_token']
        self.assertEqual(call('/token', token_body, {'Content-Type': 'application/x-www-form-urlencoded'})[0], 400)

        status, _, raw = call('/mcp/oauth', json.dumps({
            'jsonrpc': '2.0', 'id': 2, 'method': 'tools/list', 'params': {},
        }).encode(), {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token})
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)['result']['tools'][0]['name'], 'northwind_order')

    def test_mcp_limits_fixture_covers_catalog_sse_and_oversized_results(self):
        from mocks.mcp import MCP
        fixture = MCP('http://127.0.0.1:731')
        def rpc(method, params):
            return fixture.dispatch('POST', '/mcp/limits', {}, {'id': 1, 'method': method, 'params': params}, {})
        self.assertEqual(len(rpc('tools/list', {})[2]['result']['tools']), 80)
        _, headers, body = rpc('tools/call', {'name': 'sse_dump', 'arguments': {}})
        self.assertEqual(headers['Content-Type'], 'text/event-stream')
        payload = json.loads(body.split('data: ', 1)[1].strip())
        self.assertEqual(len(payload['result']['content'][0]['text']), 140000)
        self.assertGreater(len(json.dumps(rpc('tools/call', {'name': 'text_dump', 'arguments': {}})[2]).encode()), 1024 * 1024)
        self.assertGreater(len(rpc('tools/call', {'name': 'binary_dump', 'arguments': {}})[2]['result']['content'][0]['data']), 1024 * 1024)
        self.assertTrue(rpc('tools/call', {'name': 'remote_error', 'arguments': {}})[2]['result']['isError'])

    def test_hubspot_engagement_routes_and_association_continuations(self):
        from mocks.origins import HubSpot
        fixture = HubSpot('http://127.0.0.1:731')
        auth = {'Authorization': 'Bearer fictional-hubspot-token'}
        for object_type in ('meetings', 'notes', 'emails', 'calls'):
            _, _, page = fixture.dispatch('POST', '/crm/v3/objects/' + object_type + '/search', {}, {}, auth)
            self.assertIn('NORTHWIND-ENGAGEMENT-731', json.dumps(page))
            path = '/crm/v4/associations/' + object_type + '/contacts/batch/read'
            status, _, first = fixture.dispatch('POST', path, {}, {'inputs': [{'id': '731'}]}, auth)
            self.assertEqual(status, 200)
            after = first['results'][0]['paging']['next']['after']
            _, _, second = fixture.dispatch('POST', path, {}, {'inputs': [{'id': '731', 'after': after}]}, auth)
            self.assertEqual(second['results'][0]['to'][0]['toObjectId'], 'contact-732')
            self.assertNotIn('paging', second['results'][0])

    def test_oidc_discovery_pkce_and_signed_tokens(self):
        base = self.fixtures.start('oidc')
        discovery = json.loads(self.call(base, '/.well-known/openid-configuration')[2])
        self.assertEqual(discovery['issuer'], base)
        keys = json.loads(self.call(base, '/jwks')[2])['keys']
        self.assertEqual(keys[0]['kty'], 'RSA')
        self.assertEqual(self.call(base, '/token', b'code=invalid', {'Content-Type': 'application/x-www-form-urlencoded'})[0], 400)

    def test_confluence_read_write_version(self):
        base = self.fixtures.start('confluence')
        auth = {'Authorization': 'Basic ' + base64.b64encode(b'northwind@example.invalid:fictional-jira-token').decode(), 'Content-Type': 'application/json'}
        page = json.loads(self.call(base, '/wiki/rest/api/content/731?expand=body.storage,version', headers=auth)[2])
        self.assertIn('NORTHWIND-CONFLUENCE-731', page['body']['storage']['value'])
        body = {'id': '731', 'type': 'page', 'title': 'Northwind shipment', 'version': {'number': 2}, 'body': {'storage': {'value': '<p>Northwind packed</p>', 'representation': 'storage'}}}
        self.assertEqual(self.call(base, '/wiki/rest/api/content/731', json.dumps(body).encode(), auth, 'PUT')[0], 200)
        reread = json.loads(self.call(base, '/wiki/rest/api/content/731', headers=auth)[2])
        self.assertEqual(reread['version']['number'], 2)
        self.assertIn('Northwind packed', reread['body']['storage']['value'])

    def test_oidc_code_exchange_verifies_pkce_and_signature(self):
        import hashlib
        from urllib.parse import parse_qs, urlsplit
        from mocks.oidc import OIDC, b64
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import padding
        fixture = OIDC('http://127.0.0.1:731')
        verifier = 'northwind-verifier-'*4
        query = {k:[v] for k,v in {'client_id':'northwind-client','redirect_uri':'http://127.0.0.1:732/callback','state':'northwind-state','nonce':'northwind-nonce','code_challenge_method':'S256','code_challenge':b64(hashlib.sha256(verifier.encode()).digest())}.items()}
        status, headers, _ = fixture.dispatch('GET','/authorize',query,{}, {})
        self.assertEqual(status,302)
        params = parse_qs(urlsplit(headers['Location']).query)
        self.assertEqual(params['state'],['northwind-state'])
        body = {'code':params['code'][0],'code_verifier':verifier,'client_id':'northwind-client','client_secret':'fictional-oidc-secret','redirect_uri':query['redirect_uri'][0]}
        status, _, tokens = fixture.dispatch('POST','/token',{},body,{})
        self.assertEqual(status,200)
        parts = tokens['id_token'].split('.')
        decode = lambda value: base64.urlsafe_b64decode(value+'='*(-len(value)%4))
        fixture.key.public_key().verify(decode(parts[2]),'.'.join(parts[:2]).encode(),padding.PKCS1v15(),hashes.SHA256())
        self.assertEqual(json.loads(decode(parts[1]))['nonce'],'northwind-nonce')
        self.assertEqual(fixture.dispatch('POST','/token',{},body,{})[0],400)

    def test_confluence_cql_filters_exact_title(self):
        base = self.fixtures.start('confluence')
        auth = {'Authorization': 'Basic '+base64.b64encode(b'northwind@example.invalid:fictional-jira-token').decode()}
        from urllib.parse import quote
        query = quote('space = "NW" AND type = page AND title = "Northwind new page"')
        rows = json.loads(self.call(base,'/wiki/rest/api/content/search?cql='+query,headers=auth)[2])
        self.assertEqual(rows['results'],[])

    def test_jira_search_accepts_the_reporter_current_user_query(self):
        from mocks.services import Jira
        fixture = Jira('http://127.0.0.1:731', '')
        status, _, result = fixture.dispatch('POST', '/rest/api/3/search/jql', {}, {
            'jql': 'project = EE2 AND creator = currentUser() ORDER BY created DESC',
            'maxResults': 50})
        self.assertEqual(status, 200)
        self.assertEqual(len(result['issues']), 50)
        self.assertEqual((result['issues'][0]['key'], result['issues'][0]['fields']['summary']),
                         ('EE2-90', 'Northwind reporter ticket 90: confirm the fictional dispatch and returns record'))


    def test_jira_comment_detail_returns_the_selected_stored_comment(self):
        from mocks.services import Jira
        fixture = Jira('http://127.0.0.1:731', '')
        body = {'type': 'doc', 'version': 1, 'content': [
            {'type': 'paragraph', 'content': [{'type': 'text', 'text': 'First comment'}]}]}
        _, _, first = fixture.dispatch('POST', '/rest/api/3/issue/NW-1/comment', {}, {'body': body})
        _, _, second = fixture.dispatch('POST', '/rest/api/3/issue/NW-1/comment', {}, {'body': body})
        for comment in (first, second):
            status, _, detail = fixture.dispatch('GET', '/rest/api/3/issue/NW-1/comment/' + comment['id'], {}, None)
            self.assertEqual(status, 200)
            self.assertEqual(detail, comment)
        status, _, _ = fixture.dispatch('GET', '/rest/api/3/issue/NW-1/comment/missing', {}, None)
        self.assertEqual(status, 404)


class OpenAIToolsStreamingTests(unittest.TestCase):
    def test_stream_delivers_tools_text_and_usage(self):
        from mocks.openai_tools import OpenAITools
        fixture = OpenAITools('http://127.0.0.1:731', tool_names=['Evidence'], token='fixture')
        messages = [{'role': 'user', 'content': 'Read evidence'}]
        body = {'model': 'test', 'stream': True, 'messages': messages,
                'tools': [{'type': 'function', 'function': {'name': 'Evidence'}}], 'max_tokens': 256}
        for tool_turn in (True, False):
            with self.subTest(tool_turn=tool_turn):
                status, headers, stream = fixture.dispatch('POST', '/v1/chat/completions', {}, body,
                    {'Authorization': 'Bearer fixture'})
                self.assertEqual(status, 200)
                self.assertEqual(headers.get('Content-Type'), 'text/event-stream')
                chunks = [json.loads(line[6:]) for line in stream.splitlines() if line.startswith('data: {')]
                delta = chunks[0]['choices'][0]['delta']
                if tool_turn:
                    call = delta['tool_calls'][0]
                    self.assertEqual(call['index'], 0)
                    self.assertEqual(call['function']['name'], 'Evidence')
                    self.assertEqual(json.loads(call['function']['arguments']), {})
                    self.assertEqual(chunks[-2]['choices'][0]['finish_reason'], 'tool_calls')
                else:
                    self.assertEqual(delta['content'], 'Completed tool turn')
                    self.assertEqual(chunks[-2]['choices'][0]['finish_reason'], 'stop')
                self.assertGreater(chunks[-1]['usage']['prompt_tokens'], 0)
                self.assertEqual(chunks[-1]['choices'], [])
                self.assertTrue(stream.endswith('data: [DONE]\n\n'))
            messages.extend([{'role': 'assistant', 'content': None}, {'role': 'tool', 'content': 'evidence'}])

    def test_http_stream_ledger_keeps_provider_usage(self):
        from mocks.chat_completion import completion_usage
        fixtures = mocks.Fixtures()
        try:
            base = fixtures.start('openai-tools', tool_names=[], token='fixture')
            request = Request(base + '/v1/chat/completions', data=json.dumps({
                'messages': [{'role': 'user', 'content': 'Confirm'}], 'stream': True}).encode(),
                headers={'Content-Type': 'application/json', 'Authorization': 'Bearer fixture'})
            with urlopen(request, timeout=5) as response:
                self.assertEqual(response.headers['Content-Type'], 'text/event-stream')
                usage = completion_usage(response.read().decode())
            self.assertEqual(completion_usage(fixtures.requests('openai-tools')[0]['response']), usage)
        finally:
            fixtures.stop()
