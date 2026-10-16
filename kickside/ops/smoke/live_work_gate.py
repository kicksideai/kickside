"""Owned loopback barriers record admitted calls and externally visible effects."""
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import threading


class WorkGate:
    def __init__(self):
        self.lock = threading.Lock()
        self.calls = {}
        self.released = False

    def dispatch(self, operation, key):
        with self.lock:
            counts = self.calls.setdefault(key, {'entered': 0, 'effects': 0})
            if operation == 'enter':
                counts['entered'] += 1
            elif operation == 'effect':
                if not self.released:
                    raise ValueError('effect precedes barrier release')
                counts['effects'] += 1
            elif operation != 'state':
                raise ValueError('unknown work barrier operation')
            return {'released': self.released, 'completed': counts['effects'] > 0}

    def snapshot(self):
        with self.lock:
            return {key: dict(value) for key, value in self.calls.items()}

    def release(self):
        with self.lock:
            self.released = True


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        return

    def do_GET(self):
        parts = self.path.strip('/').split('/')
        if len(parts) != 2 or parts[0] not in ('enter', 'state', 'effect'):
            self.send_error(404)
            return
        try:
            result = self.server.gate.dispatch(*parts)
        except ValueError as error:
            self.send_error(409, str(error))
            return
        payload = json.dumps(result).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


@contextmanager
def work_gate():
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    server.gate = gate = WorkGate()
    thread = threading.Thread(target=server.serve_forever, name='hot-update-work-gate')
    thread.start()
    try:
        yield gate, 'http://127.0.0.1:' + str(server.server_port)
    finally:
        gate.release()
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        if thread.is_alive():
            raise RuntimeError('Work barrier server shutdown times out')
