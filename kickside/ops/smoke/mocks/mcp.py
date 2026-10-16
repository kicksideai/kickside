"""Streamable HTTP MCP fixture with a writable Northwind tool."""
import json
from .fixture import Fixture

class MCP(Fixture):
    name = 'mcp'
    def __init__(self, *args):
        super().__init__(*args)
        self.note = 'Northwind ready for packing'
    def dispatch(self, method, path, query, body, headers):
        if path not in ('/mcp', '/mcp/limits'):
            return 404, {}, {'error': 'unknown MCP route'}
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
