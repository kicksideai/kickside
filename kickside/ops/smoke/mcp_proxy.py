"""A real HTTP forwarding hop for configured public-URL verification."""
from contextlib import contextmanager
from http.client import HTTPConnection
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from urllib.parse import urlsplit


@contextmanager
def forwarding_proxy(upstream):
    target = urlsplit(upstream)
    hops = {'connection', 'transfer-encoding', 'keep-alive', 'proxy-authenticate',
            'proxy-authorization', 'te', 'trailer', 'upgrade', 'content-length'}
    receipts, failures = [], []

    class Handler(BaseHTTPRequestHandler):
        def forward(self):
            connection = HTTPConnection(target.hostname, target.port, timeout=35)
            try:
                body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
                headers = {k: v for k, v in self.headers.items() if k.lower() not in hops | {'host'}}
                headers['Host'] = target.netloc
                headers['X-Forwarded-Proto'] = 'http'
                connection.request(self.command, self.path, body or None, headers)
                response = connection.getresponse()
                payload = response.read()
                self.send_response(response.status)
                for name, value in response.getheaders():
                    if name.lower() not in hops:
                        self.send_header(name, value)
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                receipts.append({'method': self.command, 'path': urlsplit(self.path).path, 'status': response.status})
            except Exception as error:
                failures.append(str(error))
                self.send_error(502, 'Upstream request fails')
            finally:
                connection.close()

        do_GET = forward
        do_POST = forward
        do_DELETE = forward

        def log_message(self, *_args):
            return

    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port), receipts, failures
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=35)
        if thread.is_alive():
            raise RuntimeError('MCP proxy server does not stop')
