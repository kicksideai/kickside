"""Opt-in HTTP regression against an isolated KickSide instance with MCP installed.

MCP_TEST_BASE_URL and MCP_TEST_SESSION_TOKEN must identify a disposable instance
and its authenticated user. Creates test OAuth clients and credentials there.
Optional MCP_TEST_TOKEN_FILE exports test tokens privately for SDK validation.
"""
import base64
import hashlib
import json
import os
import secrets
import urllib.error
import urllib.parse
import urllib.request


def main():
    base = os.environ['MCP_TEST_BASE_URL'].rstrip('/')
    session = os.environ['MCP_TEST_SESSION_TOKEN']
    endpoint = base + '/api/public/mcp'

    def request(method, path, data=None, token=None, form=False, expected=200):
        url = path if path.startswith('http') else base + path
        headers = {'Accept': 'application/json, text/event-stream'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        body = None
        if data is not None:
            headers['Content-Type'] = 'application/x-www-form-urlencoded' if form else 'application/json'
            body = (urllib.parse.urlencode(data) if form else json.dumps(data)).encode()
        req = urllib.request.Request(url, method=method, data=body, headers=headers)
        try:
            response = urllib.request.urlopen(req, timeout=30)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            raw = response.read()
            assert response.status == expected, f'{method} {path}: HTTP {response.status}, expected {expected}'
            parsed = json.loads(raw) if raw else None
            return parsed, response.headers

    def rpc(method, token=None, params=None, expected=200):
        return request('POST', endpoint, {'jsonrpc': '2.0', 'id': 1, 'method': method,
                       'params': params or {}}, token, expected=expected)

    def check_protocol(token):
        init, _ = rpc('initialize', token, {'protocolVersion': '2025-06-18',
            'capabilities': {}, 'clientInfo': {'name': 'protocol-regression', 'version': '1'}})
        for name in ('tools', 'resources', 'prompts'):
            assert isinstance(init['result']['capabilities'][name], dict), f'{name} capability must be an object'
        pong, _ = rpc('ping', token)
        assert pong['result'] == {}, 'ping result must be an object'
        tools, _ = rpc('tools/list', token)
        assert isinstance(tools['result']['tools'], list)
        assert tools['result']['tools'], 'expected built-in MCP meta-tools'
        for tool in tools['result']['tools']:
            schema = tool['inputSchema']
            assert isinstance(schema, dict) and schema['type'] == 'object'
            if 'properties' in schema:
                assert isinstance(schema['properties'], dict), f'{tool["name"]}: properties must be an object'
        resources, _ = rpc('resources/list', token)
        assert isinstance(resources['result']['resources'], list)
        assert any(r['uri'] == 'mcp://scope' for r in resources['result']['resources'])
        scope, _ = rpc('resources/read', token, {'uri': 'mcp://scope'})
        assert isinstance(scope['result']['contents'], list)
        prompts, _ = rpc('prompts/list', token)
        assert isinstance(prompts['result']['prompts'], list)
        called, _ = rpc('tools/call', token, {'name': 'session_info', 'arguments': {}})
        assert not called['result'].get('isError'), 'session_info failed'
        assert isinstance(called['result']['content'], list)

    _, headers = rpc('tools/list', expected=401)
    challenge = headers.get('WWW-Authenticate', '')
    assert 'resource_metadata="' in challenge
    metadata_url = challenge.split('resource_metadata="', 1)[1].split('"', 1)[0]
    assert metadata_url == base + '/.well-known/oauth-protected-resource/api/public/mcp'
    resource, _ = request('GET', metadata_url)
    assert resource['resource'] == endpoint
    issuer = resource['authorization_servers'][0]
    auth_server, _ = request('GET', base + '/.well-known/oauth-authorization-server/api/public/mcp/oauth')
    legacy, _ = request('GET', issuer + '/.well-known/oauth-authorization-server')
    assert legacy == auth_server, 'legacy discovery must stay compatible'
    assert auth_server['issuer'] == issuer
    assert 'S256' in auth_server['code_challenge_methods_supported']
    print('OAuth protected-resource and authorization-server discovery: PASS')

    redirect = 'http://127.0.0.1:49173/callback'
    client, _ = request('POST', auth_server['registration_endpoint'], {
        'client_name': 'MCP protocol regression', 'redirect_uris': [redirect],
        'token_endpoint_auth_method': 'none', 'grant_types': ['authorization_code'],
        'response_types': ['code']}, expected=201)
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    params = {'client_id': client['client_id'], 'redirect_uri': redirect,
              'response_type': 'code', 'code_challenge': challenge,
              'code_challenge_method': 'S256', 'state': secrets.token_urlsafe(16), 'resource': endpoint}

    def grant(overrides=None, expected=200):
        result, _ = request('POST', '/api/v1/mcp/oauth/consent',
                            {'params': {**params, **(overrides or {})}, 'mint': {}}, session, expected=expected)
        if expected != 200:
            return None
        assert result['success']
        redirect_to = urllib.parse.urlsplit(result['redirect_to'])
        assert urllib.parse.urlunsplit(redirect_to._replace(query='', fragment='')) == redirect
        query = urllib.parse.parse_qs(redirect_to.query)
        assert query['state'] == [params['state']]
        return query['code'][0]

    def exchange(code, overrides=None, expected=200):
        result, _ = request('POST', auth_server['token_endpoint'], {
            'grant_type': 'authorization_code', 'code': code, 'client_id': client['client_id'],
            'redirect_uri': redirect, 'code_verifier': verifier, 'resource': endpoint,
            **(overrides or {})}, form=True, expected=expected)
        if expected != 200:
            assert result['error'] == 'invalid_grant'
        return result

    request('POST', '/api/v1/mcp/oauth/consent', {'params': params, 'mint': {}}, expected=401)
    grant({'redirect_uri': 'https://unregistered.invalid/callback'}, expected=400)
    code = grant()
    oauth = exchange(code)
    assert oauth['token_type'].lower() == 'bearer'
    exchange(code, expected=400)
    exchange(grant(), {'code_verifier': 'incorrect-verifier'}, expected=400)
    exchange(grant(), {'client_id': 'incorrect-client'}, expected=400)
    exchange(grant(), {'redirect_uri': 'https://unregistered.invalid/callback'}, expected=400)
    print('OAuth consent, PKCE, state, replay and client/redirect rejection: PASS')
    check_protocol(oauth['access_token'])
    print('OAuth token: initialize, ping, tools, resources, prompts and tool call: PASS')

    minted, _ = request('POST', '/api/v1/mcp/credentials', {'label': 'protocol regression'}, session)
    assert minted['success']
    bearer = minted['credential']['token']
    check_protocol(bearer)
    print('Direct bearer: initialize, ping, tools, resources, prompts and tool call: PASS')
    output = os.environ.get('MCP_TEST_TOKEN_FILE')
    if output:
        fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, 'w') as stream:
            json.dump({'url': endpoint, 'oauth': oauth['access_token'], 'bearer': bearer}, stream)


if __name__ == '__main__':
    main()
