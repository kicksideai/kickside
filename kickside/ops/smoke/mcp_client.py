"""MCP sessions over the endpoint's declared Streamable HTTP transport."""
import json
import time
import uuid
from urllib import request as urlrequest

from harness import require


KICKSIDE_META_TOOLS = frozenset(('session_info', 'list_traits', 'find_traits', 'describe_trait',
    'use_trait', 'drop_trait', 'set_traits', 'reset_traits', 'use_profile',
    'list_tools', 'find_tools', 'describe_tool', 'call_tool'))


KEEPER_META_TOOLS = frozenset(('session_info', 'list_traits', 'describe_trait',
    'use_trait', 'drop_trait', 'activate_traits', 'deactivate_traits',
    'set_traits', 'reset_traits', 'list_tools', 'call_tool'))


class MCPClient:
    def __init__(self, inst, token, endpoint, *, stateful=True):
        self.inst, self.token, self.endpoint = inst, token, endpoint
        self.stateful, self.session, self.version = stateful, '', ''
        self.revoked = False
        self.events = None
        self.transports = set()

    def request(self, method, params, label, *, expect=(200,), notification=False):
        headers = {'Accept': 'application/json, text/event-stream'}
        if self.session:
            headers['Mcp-Session-Id'] = self.session
        if self.version:
            headers['MCP-Protocol-Version'] = self.version
        body = {'jsonrpc': '2.0', 'method': method, 'params': params}
        if not notification:
            body['id'] = uuid.uuid4().hex
        received = {}
        response = self.inst.request('POST', self.endpoint, body,
            auth=self.token, headers=headers, response_headers=received,
            expect=expect, label=label, timeout=120)
        content_type = next((v for k, v in received.items() if k.lower() == 'content-type'), '')
        if content_type:
            self.transports.add(content_type.split(';', 1)[0].strip())
        if notification:
            require(not response, 'MCP notification returns a response body')
            return response
        require(response.get('jsonrpc') == '2.0' and response.get('id') == body['id'],
                'MCP returns an invalid RPC envelope: ' + str(response))
        if method == 'initialize':
            self.session = next((v for k, v in received.items() if k.lower() == 'mcp-session-id'), '')
            if self.stateful:
                require(self.session, 'MCP initialize returns no required session ID')
                self.inst.cleanup.add('MCP session', self.close, scope='scenario')
        elif not self.stateful and not self.session:
            self.session = next((v for k, v in received.items() if k.lower() == 'mcp-session-id'), '')
        return response

    def close(self):
        if not self.session:
            return
        if self.events is not None:
            self.events.close()
        response = self.inst.request('DELETE', self.endpoint, auth=self.token,
            headers={'Mcp-Session-Id': self.session}, expect=(401,) if self.revoked else (204,),
            label='mcp-session-delete')
        if self.revoked:
            require(response.get('error', {}).get('message'), 'Revoked MCP session cleanup has no authentication reason')
        self.session = ''
        self.events = None
        self.inst.cleanup.remove(self.close)

    def open_events(self):
        require(self.stateful and self.session and self.events is None, 'MCP event stream needs one initialized stateful session')
        request = urlrequest.Request(self.inst.base + self.endpoint, headers={
            'Accept': 'text/event-stream', 'Authorization': 'Bearer ' + self.token,
            'Mcp-Session-Id': self.session, 'MCP-Protocol-Version': self.version})
        self.events = urlrequest.urlopen(request, timeout=30)
        require(self.events.status == 200 and self.events.headers.get_content_type() == 'text/event-stream',
            'MCP GET does not open the declared SSE transport')
        self.transports.add('text/event-stream')
        self.inst.evidence.save('mcp-event-stream', {'method': 'GET', 'path': self.endpoint,
            'status': self.events.status, 'content_type': self.events.headers.get_content_type()})

    def notification(self, method):
        require(self.events is not None, 'MCP notification needs an open SSE stream')
        deadline = time.monotonic() + 30
        data, event = [], ''
        while time.monotonic() < deadline:
            raw = self.events.readline()
            require(raw and time.monotonic() <= deadline, 'MCP SSE notification misses its deadline or stream ends')
            line = raw.decode('utf-8').rstrip('\r\n')
            if not line and data:
                message = json.loads('\n'.join(data))
                require(event in ('', 'message') and message.get('jsonrpc') == '2.0' and
                    message.get('method') == method and 'id' not in message, 'MCP SSE notification is malformed')
                self.inst.evidence.save('mcp-notification', message)
                return message
            if line.startswith('data:'):
                data.append(line[5:].lstrip(' '))
            elif line.startswith('event:'):
                event = line[6:].lstrip(' ')
        require(False, 'MCP SSE notification does not arrive within 30 seconds')

    def rpc(self, method, params, label):
        response = self.request(method, params, label)
        require('error' not in response and 'result' in response, 'MCP RPC fails: ' + str(response))
        return response['result']

    def initialize(self):
        initialized = self.rpc('initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
            'clientInfo': {'name': 'KickSide smoke client', 'version': '1'}}, 'mcp-initialize')
        require(isinstance(initialized.get('capabilities'), dict) and initialized.get('serverInfo', {}).get('name'),
                'MCP initialize returns no capabilities object or server identity')
        self.version = initialized['protocolVersion']
        self.request('notifications/initialized', {}, 'mcp-initialized', expect=(202,), notification=True)
        return initialized

    def tools(self):
        descriptors = self.rpc('tools/list', {}, 'mcp-tools-list')['tools']
        names = [d['name'] for d in descriptors]
        require(len(names) == len(set(names)) and all(isinstance(d.get('inputSchema'), dict) for d in descriptors),
                'MCP tool names duplicate or a schema is malformed')
        return set(names)

    @staticmethod
    def text(result):
        blocks = result.get('content')
        require(isinstance(blocks, list) and blocks, 'MCP tool returns no content blocks')
        texts = [block['text'] for block in blocks if block.get('type') == 'text']
        require(texts and all(isinstance(value, str) and value for value in texts), 'MCP tool returns empty or malformed text')
        return '\n'.join(texts)

    def tool_result(self, name, arguments):
        result = self.rpc('tools/call', {'name': name, 'arguments': arguments}, 'mcp-tool-call')
        self.text(result)
        return result

    def call(self, name, arguments):
        result = self.tool_result(name, arguments)
        require(not result.get('isError'), 'MCP ' + name + ' fails: ' + str(result))
        return self.decode_text(self.text(result))

    @staticmethod
    def decode_text(value):
        return json.loads(value) if value.lstrip().startswith(('{', '[')) else value
