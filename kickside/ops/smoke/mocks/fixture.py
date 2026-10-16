"""Loopback transport for text, form and JSON provider contracts."""
from contextlib import ExitStack
import copy
import json
import threading
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlsplit

class Fixture:
    def __init__(self, base, base_path=''):
        if base_path:
            raise ValueError('provider fixture requires its declared root routes')
        self.base = base
        self.lock = threading.RLock()
        self.records = []
        self.resources = ExitStack()

    def close(self):
        self.resources.close()

class FixtureHandler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, format, *args):
        return

    def handle_request(self):
        service = self.server.service
        url = urlsplit(self.path)
        length = int(self.headers.get('Content-Length', '0'))
        if length < 0 or length > 1024 * 1024:
            self.send_error(400, 'body exceeds fixture limit')
            return
        raw = self.rfile.read(length)
        kind = self.headers.get('Content-Type', '')
        try:
            body = json.loads(raw) if raw and 'application/json' in kind else {k: v[0] for k,v in parse_qs(raw.decode()).items()}
            with service.lock:
                status, headers, result = service.dispatch(self.command, url.path, parse_qs(url.query), body, self.headers)
                payload = result if isinstance(result, bytes) else result.encode() if isinstance(result, str) else json.dumps(result).encode() if result is not None else b''
                service.records.append({'name': service.name, 'method': self.command, 'path': url.path, 'query': parse_qs(url.query), 'body': {k: '[redacted]' if k in ('client_secret','code_verifier') else v for k,v in body.items()}, 'status': status, 'response': copy.deepcopy(result) if not isinstance(result, (str, bytes)) or headers.get('Content-Type') == 'text/event-stream' else '[text response]', 'headers': {k.lower(): '[redacted]' if k.lower() in ('authorization','private-token') else v for k,v in self.headers.items()}})
        except (ValueError, UnicodeDecodeError) as error:
            status, headers, payload = 400, {}, json.dumps({'error': str(error)}).encode()
        self.send_response(status)
        self.send_header('Content-Type', headers.pop('Content-Type', 'application/json'))
        self.send_header('Content-Length', str(len(payload)))
        for k,v in headers.items():
            self.send_header(k,v)
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    do_GET = do_POST = do_PUT = do_PATCH = do_DELETE = handle_request
