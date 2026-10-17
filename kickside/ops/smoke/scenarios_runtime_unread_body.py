"""HTTP endpoints finish closing requests whose bodies they do not consume."""
import http.client
import socket

from harness import Scenario, require


def unread_body_close(ctx):
    inst = ctx.inst
    body = b'x' * (64 * 1024)
    headers = ('GET /api/v1/keeper/registry/entry?id=app:api HTTP/1.1\r\n'
               f'Host: {inst.host}:{inst.port}\r\n'
               f'Authorization: Bearer {inst.token}\r\n'
               'Connection: close\r\n'
               f'Content-Length: {len(body)}\r\n\r\n').encode()
    with socket.create_connection((inst.host, inst.port), timeout=35) as connection:
        connection.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        connection.sendall(headers)
        connection.sendall(body)
        response = http.client.HTTPResponse(connection)
        response.begin()
        content = response.read()
        require(response.status == 200, 'Registry request with an unused body fails')
        require(content, 'Registry response is empty')
        require(connection.recv(1) == b'', 'Closing response does not end cleanly')
    inst.evidence.save('unused-body-close', {'status': response.status, 'response_bytes': len(content)})


REGISTRY = [Scenario('runtime_http_unread_body_close', 'regression', unread_body_close,
                     ('boot',), issues=('RUNTIME-HTTP-UNREAD-BODY-CLOSE',))]
