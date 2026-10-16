"""Area-owned local provider fixture registries."""

import copy
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from urllib.parse import parse_qs, urlsplit

from .services import GitLab, Jira, BadRequest
from .fixture import Fixture, FixtureHandler
from .simplefin import SimpleFIN
from .webscout import Webscout
from .mcp import MCP
from .oidc import OIDC
from .openai_tools import OpenAITools
from .context_model import ContextModel
from .slack_socket import SlackSocket
from .confluence import Confluence
from .discord import Discord
from .origins import Google, GitHub, Slack, HubSpot, Telegram, Fireflies, PhantomBuster, Microsoft


class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, format, *args):
        return

    def handle_request(self):
        service = self.server.service
        url = urlsplit(self.path)
        auth_ok = service.authorized(self.headers)
        body = None
        with service.lock:
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if length < 0 or length > 1024 * 1024:
                    raise BadRequest('request body must be at most 1 MiB')
                if length:
                    raw = self.rfile.read(length)
                    body = json.loads(raw)
                    if not isinstance(body, dict):
                        raise BadRequest('JSON body must be an object')
                if not auth_ok:
                    status, headers, result = 401, {}, {'message': 'fictional credential required'}
                else:
                    status, headers, result = service.dispatch(
                        self.command, url.path, parse_qs(url.query), body or {})
            except (BadRequest, ValueError, UnicodeDecodeError) as error:
                status, headers, result = 400, {}, {'errorMessages': [str(error)]}
            service.records.append({
                'name': service.name, 'method': self.command, 'path': url.path,
                'query': parse_qs(url.query), 'body': body, 'status': status,
                'response': copy.deepcopy(result),
                'auth_ok': auth_ok, 'headers': {
                    key.lower(): '[redacted]' if key.lower() in ('authorization', 'private-token') else value
                    for key, value in self.headers.items()
                },
            })
            payload = b'' if result is None else json.dumps(result, sort_keys=True).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    do_GET = do_POST = do_PUT = do_DELETE = handle_request


class Fixtures:
    def __init__(self):
        self._running = {}
        self._lock = threading.RLock()

    def start(self, name, *, port=0, base_path='', **service_options):
        """Start a fresh loopback fixture; port=0 asks the OS for a free port."""
        with self._lock:
            services = {'context-model': ContextModel, 'slack-socket': SlackSocket, 'openai-tools': OpenAITools, 'jira': Jira, 'gitlab': GitLab, 'simplefin': SimpleFIN, 'webscout': Webscout, 'mcp': MCP, 'oidc': OIDC, 'confluence': Confluence, 'google': Google, 'github': GitHub, 'slack': Slack, 'discord': Discord, 'hubspot': HubSpot, 'telegram': Telegram, 'fireflies': Fireflies, 'phantombuster': PhantomBuster, 'microsoft': Microsoft}
            if name not in services:
                raise ValueError('unknown mock: ' + name)
            if name in self._running:
                raise ValueError('mock already running: ' + name)
            if base_path and (not base_path.startswith('/') or any(c in base_path for c in '?#') or '..' in base_path):
                raise ValueError('base_path must be an absolute URL path')
            server = ThreadingHTTPServer(('127.0.0.1', port), Handler if name in ('jira', 'gitlab') else FixtureHandler)
            base = f'http://127.0.0.1:{server.server_port}' + base_path.rstrip('/')
            server.service = services[name](base, base_path.rstrip('/'), **service_options)
            thread = threading.Thread(target=server.serve_forever, kwargs={'poll_interval': 0.05}, name='smoke-' + name)
            thread.start()
            self._running[name] = (server, thread)
            return base


    def requests(self, name=None):
        """Return detached request records, with credential headers redacted."""
        with self._lock:
            records = []
            for key, (server, _) in self._running.items():
                if name is None or key == name:
                    with server.service.lock:
                        records.extend(copy.deepcopy(server.service.records))
            return records


    def stop(self, name=None):
        """Stop one or all fixtures; repeated stops are harmless."""
        with self._lock:
            for key in list(self._running):
                if name is None or key == name:
                    server, thread = self._running[key]
                    server.shutdown()
                    server.server_close()
                    if isinstance(server.service, Fixture):
                        server.service.close()
                    thread.join(timeout=5)
                    if thread.is_alive():
                        raise RuntimeError('mock shutdown timed out: ' + key)
                    del self._running[key]
