"""Streamable HTTP MCP fixture with a writable Northwind tool."""
import base64
import hashlib
import json
import secrets
from urllib.parse import urlencode
from .fixture import Fixture

class MCP(Fixture):
    name = 'mcp'
    def __init__(self, *args):
        super().__init__(*args)
        self.note = 'Northwind ready for packing'
        self.oauth_codes = {}
        self.oauth_clients = set()
        self.oauth_tokens = set()

    @staticmethod
    def _pkce_challenge(verifier):
        return base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')

    def _oauth_resource_metadata(self):
        resource = self.base + '/mcp/oauth'
        return {'resource': resource, 'authorization_servers': [self.base]}

    def _oauth_server_metadata(self):
        return {
            'issuer': self.base,
            'authorization_endpoint': self.base + '/authorize',
            'token_endpoint': self.base + '/token',
            'registration_endpoint': self.base + '/register',
            'code_challenge_methods_supported': ['S256'],
            'token_endpoint_auth_methods_supported': ['none'],
        }

    def _oauth_dispatch(self, method, path, query, body, headers):
        if method == 'GET' and path == '/.well-known/oauth-protected-resource/mcp/oauth':
            return 200, {}, self._oauth_resource_metadata()
        if method == 'GET' and path == '/.well-known/oauth-authorization-server':
            return 200, {}, self._oauth_server_metadata()
        if method == 'POST' and path == '/register':
            client_id = 'northwind-mcp-client-' + secrets.token_urlsafe(9)
            self.oauth_clients.add(client_id)
            return 201, {}, {'client_id': client_id, 'token_endpoint_auth_method': 'none'}
        if method == 'GET' and path == '/authorize':
            fields = {key: value[0] for key, value in query.items()}
            required = ('client_id', 'redirect_uri', 'state', 'code_challenge')
            if (not all(fields.get(key) for key in required) or fields.get('client_id') not in self.oauth_clients
                    or fields.get('code_challenge_method') != 'S256'):
                return 400, {}, {'error': 'invalid_request'}
            code = secrets.token_urlsafe(24)
            self.oauth_codes[code] = fields
            return 302, {'Location': fields['redirect_uri'] + '?' + urlencode({'code': code, 'state': fields['state']})}, None
        if method == 'POST' and path == '/token':
            fields = self.oauth_codes.pop(body.get('code'), None)
            if (not fields or body.get('grant_type') != 'authorization_code'
                    or body.get('client_id') != fields['client_id'] or body.get('redirect_uri') != fields['redirect_uri']
                    or self._pkce_challenge(body.get('code_verifier', '')) != fields['code_challenge']):
                return 400, {}, {'error': 'invalid_grant'}
            token = 'northwind-mcp-access-' + secrets.token_urlsafe(24)
            self.oauth_tokens.add(token)
            return 200, {}, {'access_token': token, 'token_type': 'Bearer', 'expires_in': 3600,
                             'refresh_token': 'northwind-mcp-refresh-' + secrets.token_urlsafe(24)}
        return None

    def dispatch(self, method, path, query, body, headers):
        oauth = self._oauth_dispatch(method, path, query, body, headers)
        if oauth is not None:
            return oauth
        if path not in ('/mcp', '/mcp/oauth', '/mcp/limits'):
            return 404, {}, {'error': 'unknown MCP route'}
        if path == '/mcp/oauth':
            token = headers.get('Authorization', '').removeprefix('Bearer ')
            if token not in self.oauth_tokens:
                resource = self.base + '/.well-known/oauth-protected-resource/mcp/oauth'
                return 401, {'WWW-Authenticate': 'Bearer resource_metadata="' + resource + '"'}, {
                    'error': 'fictional OAuth bearer token required'}
        if method == 'DELETE':
            return 204, {}, None
        method_name = body.get('method')
        response_headers = {'Mcp-Session-Id': 'northwind-mcp-session'}
        if method_name == 'notifications/initialized':
            return 202, response_headers, None
        if method_name == 'tools/call' and not isinstance(body.get('params', {}).get('arguments'), dict):
            return 200, response_headers, {'jsonrpc': '2.0', 'id': body.get('id'), 'error': {'code': -32602, 'message': 'tool arguments must be an object'}}
        result = None
        if method_name == 'initialize':
            result = {'protocolVersion': body['params']['protocolVersion'], 'capabilities': {'tools': {}}, 'serverInfo': {'name': 'Northwind order desk', 'version': '1'}}
        elif method_name == 'tools/list':
            result = {'tools': [{'name': 'northwind_order', 'description': 'Read or update fictional Northwind order packing note', 'inputSchema': {'type': 'object', 'properties': {'note': {'type': 'string'}}}}]}
            if path == '/mcp/limits':
                result['tools'] = [{'name': name, 'inputSchema': {'type': 'object'}} for name in ('sse_dump', 'text_dump', 'binary_dump', 'remote_error')]
                result['tools'] += [{'name': 'tool_' + str(i), 'inputSchema': {'type': 'object'}} for i in range(76)]
        elif method_name == 'tools/call' and path == '/mcp/limits':
            name = body['params'].get('name')
            if name == 'sse_dump':
                result = {'content': [{'type': 'text', 'text': 'NORTHWIND-SSE-731' + 'x' * (140000 - len('NORTHWIND-SSE-731'))}]}
            elif name == 'text_dump':
                result = {'content': [{'type': 'text', 'text': '☃\\n"\\' * 240000}]}
            elif name == 'binary_dump':
                result = {'content': [{'type': 'image', 'data': 'z' * 1200000, 'mimeType': 'image/png'}]}
            elif name == 'remote_error':
                result = {'isError': True, 'content': [{'type': 'text', 'text': 'Northwind packing station is unavailable'}]}
        elif method_name == 'tools/call' and body.get('params',{}).get('name') == 'northwind_order':
            args = body['params'].get('arguments',{})
            if 'note' in args:
                self.note = args['note']
            result = {'content': [{'type': 'text', 'text': self.note}], 'isError': False}
        envelope = {'jsonrpc': '2.0', 'id': body.get('id')}
        if result is None:
            envelope['error'] = {'code': -32601, 'message': 'unknown fixture method or tool'}
        else:
            envelope['result'] = result
        if path == '/mcp/limits' and method_name == 'tools/call' and body['params'].get('name') == 'sse_dump':
            response_headers['Content-Type'] = 'text/event-stream'
            return 200, response_headers, 'event: message\n' + 'data: ' + json.dumps(envelope) + '\n\n'
        return 200, response_headers, envelope
