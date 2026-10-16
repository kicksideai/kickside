"""Authenticated Slack Socket Mode alongside the shared Web API fixture."""
import copy
import json
import secrets
import threading
import uuid

from websockets.sync.server import serve
from .origins import Slack


class SocketMode:
    def __init__(self):
        self.lock = threading.RLock()
        self.acknowledged = threading.Condition(self.lock)
        self.tickets = set()
        self.connections = set()
        self.sent = set()
        self.acks = []
        self.server = serve(self.handle, '127.0.0.1', 0)
        self.base = 'ws://127.0.0.1:' + str(self.server.socket.getsockname()[1]) + '/socket/'
        self.thread = threading.Thread(target=self.server.serve_forever, name='smoke-slack-socket')
        self.thread.start()

    def open_url(self):
        with self.lock:
            ticket = secrets.token_urlsafe(24)
            self.tickets.add(ticket)
            return self.base + ticket

    def handle(self, ws):
        ticket = ws.request.path.removeprefix('/socket/')
        with self.lock:
            if ticket not in self.tickets:
                ws.close(1008, 'Socket URL is invalid or already used')
                return
            self.tickets.remove(ticket)
            self.connections.add(ws)
        try:
            ws.send(json.dumps({'type': 'hello', 'connection_info': {'app_id': 'NW-app'}}))
            for raw in ws:
                frame = json.loads(raw)
                envelope = frame.get('envelope_id')
                with self.acknowledged:
                    if envelope not in self.sent:
                        ws.close(1008, 'Unknown envelope acknowledgement')
                        return
                    self.acks.append(envelope)
                    self.acknowledged.notify_all()
        finally:
            with self.lock:
                self.connections.remove(ws)

    def send(self, event):
        with self.lock:
            envelope = uuid.uuid4().hex
            self.sent.add(envelope)
            payload = json.dumps({'type': 'events_api', 'envelope_id': envelope,
                                  'payload': {'type': 'event_callback', 'event': copy.deepcopy(event)}})
            for ws in self.connections:
                ws.send(payload)
            return {'delivered': len(self.connections), 'envelope_id': envelope}

    def audit(self, wait_ack=None):
        with self.acknowledged:
            if wait_ack:
                self.acknowledged.wait_for(lambda: wait_ack in self.acks, timeout=5)
            return {'connections': len(self.connections), 'acks': list(self.acks)}

    def close(self):
        self.server.shutdown()
        self.thread.join(timeout=5)
        if self.thread.is_alive():
            raise RuntimeError('Slack Socket Mode shutdown times out')


class SlackSocket(Slack):
    name = 'slack-socket'

    def __init__(self, *args):
        super().__init__(*args)
        self.socket = SocketMode()
        self.resources.callback(self.socket.close)

    def dispatch(self, method, path, query, body, headers):
        authenticated = headers.get('Authorization') == 'Bearer fictional-slack-app'
        if method == 'POST' and path == '/api/apps.connections.open':
            if not authenticated:
                return 200, {}, {'ok': False, 'error': 'invalid_auth'}
            return 200, {}, {'ok': True, 'url': self.socket.open_url()}
        if path.startswith('/_fixture/'):
            if not authenticated:
                return 401, {}, {'error': 'Fixture app token is required'}
            if method == 'GET' and path == '/_fixture/socket':
                return 200, {}, self.socket.audit((query.get('wait_ack') or [None])[0])
            if method == 'POST' and path == '/_fixture/event':
                if not isinstance(body.get('event'), dict):
                    return 400, {}, {'error': 'Event is required'}
                return 200, {}, self.socket.send(body['event'])
            return 404, {}, {'error': 'Unknown Socket Mode fixture route'}
        return super().dispatch(method, path, query, body, headers)
