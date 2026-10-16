"""Discord REST and Gateway contracts on owned loopback listeners."""
import copy
import json
import threading
import secrets
import uuid

from websockets.sync.server import serve
from .fixture import Fixture

STAMP = '2026-10-01T12:00:00Z'


class Gateway:
    def __init__(self, identities):
        self.identities = identities
        self.lock = threading.RLock()
        self.connections = {}
        self.identifies = []
        self.sequence = 1
        self.server = serve(self.handle, '127.0.0.1', 0)
        self.url = 'ws://127.0.0.1:' + str(self.server.socket.getsockname()[1]) + '/?v=10&encoding=json'
        self.thread = threading.Thread(target=self.server.serve_forever, name='smoke-discord-gateway')
        self.thread.start()

    def handle(self, ws):
        ws.send(json.dumps({'op': 10, 'd': {'heartbeat_interval': 30000}}))
        try:
            for raw in ws:
                frame = json.loads(raw)
                if frame['op'] in (2, 6):
                    token = frame['d']['token']
                    if token not in self.identities:
                        ws.close(4004, 'Invalid bot token')
                        return
                    with self.lock:
                        identity = self.identities[token]
                        self.identifies.append({**{k: v for k, v in frame['d'].items() if k != 'token'},
                                                'bot_id': identity})
                        self.connections[ws] = token
                    ws.send(json.dumps({'op': 0, 't': 'READY', 's': 1,
                        'd': {'session_id': 'northwind-gateway-' + identity, 'resume_gateway_url': self.url,
                              'user': {'id': identity, 'bot': True}}}))
                elif frame['op'] == 1:
                    ws.send(json.dumps({'op': 11, 'd': None}))
        finally:
            with self.lock:
                self.connections.pop(ws, None)

    def send(self, event, token):
        with self.lock:
            self.sequence += 1
            payload = json.dumps({'op': 0, 't': 'MESSAGE_CREATE', 's': self.sequence, 'd': event})
            connections = [ws for ws, credential in self.connections.items() if credential == token]
            for ws in connections:
                ws.send(payload)
            return len(connections)

    def audit(self, token):
        with self.lock:
            return {'url': self.url, 'connections': sum(credential == token for credential in self.connections.values()),
                    'identifies': copy.deepcopy([row for row in self.identifies if row['bot_id'] == self.identities[token]])}

    def close(self):
        self.server.shutdown()
        self.thread.join(timeout=5)
        if self.thread.is_alive():
            raise RuntimeError('Discord gateway shutdown times out')


class Discord(Fixture):
    name = 'discord'

    def __init__(self, *args):
        super().__init__(*args)
        self.messages = [{'id': '731', 'content': 'Northwind order packing', 'timestamp': STAMP,
                          'author': {'id': 'NW-human', 'username': 'northwind'}, 'channel_id': 'NW', 'attachments': []}]
        self.configs = {'fictional-discord-token': {'flags': 524288, 'read_status': 200, 'write_status': 200}}
        self.gateway = None
        self.identities = {'fictional-discord-token': 'NW-bot'}

    def dispatch(self, method, path, query, body, headers):
        token = headers.get('Authorization', '').removeprefix('Bot ')
        if token not in self.identities:
            return 401, {}, {'message': 'invalid bot token'}
        if method == 'POST' and path == '/_fixture/identities':
            token, bot_id = secrets.token_urlsafe(24), 'bot-' + uuid.uuid4().hex
            self.identities[token] = bot_id
            self.configs[token] = {'flags': 524288, 'read_status': 200, 'write_status': 200}
            return 200, {}, {'token': token, 'bot_id': bot_id}
        config = self.configs[token]
        if path == '/_fixture/gateway':
            if self.gateway is None:
                self.gateway = Gateway(self.identities)
                self.resources.callback(self.gateway.close)
            return 200, {}, self.gateway.audit(token)
        if method == 'POST' and path == '/_fixture/config':
            for key, value in body.items():
                if key not in ('flags', 'read_status', 'write_status') or not isinstance(value, int):
                    return 400, {}, {'error': 'invalid Discord fixture option'}
                config[key] = value
            return 200, {}, {'success': True}
        if method == 'POST' and path == '/_fixture/message':
            if self.gateway is None:
                return 409, {}, {'error': 'Gateway is not running'}
            self.messages.append(copy.deepcopy(body))
            return 200, {}, {'delivered': self.gateway.send(body, token)}
        path = path.removeprefix('/api/v10')
        if path == '/users/@me':
            return 200, {}, {'id': self.identities[token], 'username': 'Northwind Bot', 'bot': True}
        if path == '/oauth2/applications/@me':
            return 200, {}, {'id': 'NW-app', 'flags': config['flags']}
        if path == '/users/@me/guilds':
            return 200, {}, [{'id': 'NW', 'name': 'Northwind'}]
        if path == '/guilds/NW/channels':
            return 200, {}, [{'id': 'NW', 'name': 'northwind-orders', 'type': 0, 'guild_id': 'NW'}]
        if path == '/channels/NW':
            if config['read_status'] != 200:
                return config['read_status'], {}, {'message': 'Missing Access', 'code': 50001}
            return 200, {}, {'id': 'NW', 'name': 'northwind-orders', 'type': 0, 'guild_id': 'NW'}
        if path == '/channels/NW/messages':
            status = config['write_status'] if method == 'POST' else config['read_status']
            if status != 200:
                return status, {}, {'message': 'Missing Permissions', 'code': 50013}
            if method == 'POST':
                row = dict(self.messages[0], id=str(732 + len(self.messages)), content=body['content'],
                           author={'id': self.identities[token], 'username': 'Northwind Bot', 'bot': True})
                self.messages.append(row)
                return 200, {}, row
            return 200, {}, list(reversed(self.messages))[:int(query.get('limit', [50])[0])]
        if path.startswith('/channels/NW/messages/'):
            row = next((r for r in self.messages if r['id'] == path.split('/')[4]), None)
            if row is None:
                return 404, {}, {'message': 'message missing'}
            if method == 'DELETE':
                self.messages.remove(row)
                return 204, {}, None
            if method == 'PATCH':
                row.update(body)
            return 200, {}, row
        return 404, {}, {'message': 'unknown Discord route'}
