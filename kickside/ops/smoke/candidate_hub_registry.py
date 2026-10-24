"""A loopback Hub catalog overlay for unpublished package integration tests.

The real Hub remains the source of every module except the explicitly supplied
candidate.  The overlay only appends that candidate to ListVersions and serves
its native ``wippy pack`` bytes through GetDownloadURL.  Keeper's planner,
security checks, installer, migrations, and registry apply path are unchanged.
"""
from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib
import sys
import threading
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from ops.compat.wapp import read_pack


HUB_URL = 'https://hub.wippy.ai'
LIST_VERSIONS = '/wippy.api.hub.module.v1.ModuleService/ListVersions'
GET_VERSION = '/wippy.api.hub.module.v1.ModuleService/GetVersion'
MANIFEST = '/wippy.api.hub.manifest.v1.ManifestService/GetManifest'
DOWNLOAD = '/wippy.api.hub.download.v1.DownloadService/GetDownloadURL'


def _varint(value):
    output = bytearray()
    while value > 0x7f:
        output.append((value & 0x7f) | 0x80)
        value >>= 7
    output.append(value)
    return bytes(output)


def _field(number, value):
    return _varint(number << 3 | 2) + _varint(len(value)) + value


def _text(number, value):
    return _field(number, value.encode())


def _number(number, value):
    return _varint(number << 3) + _varint(value)


def _wire_fields(message):
    """Yield protobuf (field number, wire type, value) without a schema."""
    def read_varint(offset):
        value = shift = 0
        while offset < len(message):
            byte = message[offset]
            offset += 1
            value |= (byte & 0x7f) << shift
            if not byte & 0x80:
                return value, offset
            shift += 7
        raise ValueError('truncated protobuf varint')

    offset = 0
    try:
        while offset < len(message):
            key, offset = read_varint(offset)
            number, wire = key >> 3, key & 7
            if wire == 0:
                value, offset = read_varint(offset)
            elif wire == 2:
                length, offset = read_varint(offset)
                value, offset = message[offset:offset + length], offset + length
                if len(value) != length:
                    raise ValueError('truncated protobuf bytes')
            elif wire == 1:
                value, offset = message[offset:offset + 8], offset + 8
            elif wire == 5:
                value, offset = message[offset:offset + 4], offset + 4
            else:
                return
            yield number, wire, value
    except ValueError:
        return


def _read_native_dependencies(artifact):
    """Read dependency declarations from a genuine WIPPYPACK artifact.

    The Hub manifest is catalog metadata, not a second implementation of the
    candidate's dependency graph.  Keep the two coupled by deriving the
    manifest's declared ranges from the exact bytes that the installer later
    downloads and verifies.
    """
    dependencies = []
    try:
        entries = read_pack(artifact).values()
    except (KeyError, OSError, ValueError) as error:
        raise ValueError('candidate package has unreadable native metadata') from error
    for entry in entries:
        if entry['Kind'] != 'ns.dependency':
            continue
        data = entry['Data']
        component = data.get('component') if isinstance(data, dict) else None
        constraint = data.get('version') if isinstance(data, dict) else None
        if not isinstance(component, str) or component.count('/') != 1 or not isinstance(constraint, str):
            raise ValueError('candidate package has malformed ns.dependency metadata')
        org, name = component.split('/', 1)
        if not org or not name:
            raise ValueError('candidate package has malformed dependency component')
        dependencies.append((org, name, constraint))
    return tuple(dependencies)


def _message_field(message, number):
    """Return the unique bytes-valued field, or ``None`` for another shape."""
    values = [value for field, wire, value in _wire_fields(message)
              if field == number and wire == 2]
    return values[0] if len(values) == 1 else None


def _text_field(message, number):
    value = _message_field(message, number)
    if value is None:
        return None
    try:
        return value.decode('utf-8')
    except UnicodeDecodeError:
        return None


def _module_reference(message):
    """Decode module.v1.ModuleRef from a request's field 1."""
    module = _message_field(message, 1)
    if module is None:
        return None
    module_id = _text_field(module, 1)
    name = _message_field(module, 2)
    if module_id is not None and name is None:
        return ('id', module_id)
    if module_id is None and name is not None:
        org, module_name = _text_field(name, 1), _text_field(name, 2)
        if org is not None and module_name is not None:
            return ('name', org, module_name)
    return None


def _version_reference(message):
    """Decode version.v1.VersionRef from a request's field 2."""
    version = _message_field(message, 2)
    if version is None:
        return None
    fields = [(field, value) for field, wire, value in _wire_fields(version) if wire == 2]
    if len(fields) != 1:
        return None
    field, value = fields[0]
    try:
        text = value.decode('utf-8')
    except UnicodeDecodeError:
        return None
    return {1: ('id', text), 2: ('version', text), 3: ('label', text)}.get(field)


class CandidateHubRegistry:
    """Proxy public Hub protocol traffic while adding one immutable candidate."""

    def __init__(self, artifact, component, version, *, upstream=HUB_URL):
        self.artifact = Path(artifact)
        self.component = component
        self.version = version
        self.upstream = upstream.rstrip('/')
        self.bytes = self.artifact.read_bytes()
        self.digest = hashlib.sha256(self.bytes).hexdigest()
        self.module_id = 'candidate-module-' + component.replace('/', '-')
        self._dependencies = None
        self.requests = []
        self._lock = threading.Lock()
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), self._handler())
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)

    @property
    def url(self):
        host, port = self.server.server_address
        return f'http://{host}:{port}'

    @property
    def artifact_url(self):
        return self.url + '/candidate/' + self.digest + '.wapp'

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *_):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)

    def _candidate_request(self, body, *, needs_version):
        """Match the typed module/version references, never payload substrings."""
        org, module = self.component.split('/', 1)
        module_ref = _module_reference(body)
        module_matches = module_ref in (('id', self.module_id), ('name', org, module))
        if not module_matches:
            return False
        if not needs_version:
            return True
        version_ref = _version_reference(body)
        return version_ref in (('id', 'candidate-' + self.component.replace('/', '-')),
                               ('version', self.version))

    def _version(self):
        # wippy.api.hub.version.v1.Version: id, module_id, version, digest,
        # size_bytes.  The planner gets dependency declarations by opening the
        # package bytes below, never from a fabricated planner response.
        return b''.join((
            _text(1, 'candidate-' + self.component.replace('/', '-')),
            _text(2, self.module_id),
            _text(3, self.version),
            _text(4, self.digest),
            _number(5, len(self.bytes)),
        ))

    def _remember_module_id(self, response):
        """Copy the Hub-assigned module id from the real ListVersions page.

        A Version's module_id is a foreign key, so fabricating it produces a
        superficially valid catalog row that the native planner correctly
        refuses.  The proxy learns it from the same published response it
        otherwise forwards unchanged.
        """
        for number, wire, version in _wire_fields(response):
            if number != 1 or wire != 2:
                continue
            for field, version_wire, value in _wire_fields(version):
                if field == 2 and version_wire == 2:
                    try:
                        self.module_id = value.decode('utf-8')
                    except UnicodeDecodeError:
                        pass
                    return

    def _download(self):
        # common.v1.DownloadInfo followed by download.v1.GetDownloadURLResponse.
        info = self._download_info()
        return _field(1, info) + _text(2, self.version)

    def _download_info(self):
        return b''.join((_text(1, self.artifact_url), _text(3, self.digest), _number(4, len(self.bytes))))

    def _get_version(self):
        # GetVersionResponse.version.  The native client follows a ListVersions
        # item by its immutable id before asking for its download URL.
        return _field(1, self._version())

    def _manifest(self):
        # manifest.v1.ModuleManifest fields: module_id, org, name, version_id,
        # version, digest, size_bytes, dependencies, download.  Dependency
        # constraints deliberately come from the packed native artifact, while
        # the remaining identity and download fields bind it to this overlay.
        if self._dependencies is None:
            self._dependencies = _read_native_dependencies(self.artifact)
        org, name = self.component.split('/', 1)
        dependencies = b''.join(
            _field(9, b''.join((_text(1, dependency_org), _text(2, dependency_name),
                                _text(9, constraint))))
            for dependency_org, dependency_name, constraint in self._dependencies)
        manifest = b''.join((
            _text(1, self.module_id),
            _text(2, org),
            _text(3, name),
            _text(4, 'candidate-' + self.component.replace('/', '-')),
            _text(5, self.version),
            _text(6, self.digest),
            _number(7, len(self.bytes)),
            dependencies,
            _field(10, self._download_info()),
        ))
        return _field(1, manifest)

    def _forward(self, path, body, headers):
        # Keep the protocol headers but deliberately request identity encoding:
        # appending a protobuf field is only valid on the uncompressed payload.
        forwarded = {'Content-Type': headers.get('Content-Type', 'application/proto'),
                     'Connect-Protocol-Version': headers.get('Connect-Protocol-Version', '1'),
                     'Accept-Encoding': 'identity'}
        for name in ('Authorization', 'Connect-Timeout-Ms', 'User-Agent'):
            if headers.get(name):
                forwarded[name] = headers[name]
        request = Request(self.upstream + path, data=body, headers=forwarded, method='POST')
        try:
            with urlopen(request, timeout=120) as response:
                return response.status, response.read(), response.headers
        except HTTPError as error:
            return error.code, error.read(), error.headers

    def _handler(self):
        overlay = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass

            def _respond(self, status, body, content_type='application/proto'):
                self.send_response(status)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self):
                if self.path == '/candidate/' + overlay.digest + '.wapp':
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'artifact'})
                    self._respond(200, overlay.bytes, 'application/octet-stream')
                    return
                self._respond(404, b'')

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get('Content-Length', '0')))
                if self.path == MANIFEST and overlay._candidate_request(body, needs_version=True):
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'candidate-manifest'})
                    try:
                        self._respond(200, overlay._manifest())
                    except (OSError, ValueError, RuntimeError):
                        # A malformed candidate must fail as a candidate
                        # catalog error, never silently fall through to Hub.
                        self._respond(500, b'candidate native manifest unavailable', 'text/plain')
                    return
                if self.path == GET_VERSION and overlay._candidate_request(body, needs_version=True):
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'candidate-get-version'})
                    self._respond(200, overlay._get_version())
                    return
                if self.path == DOWNLOAD and overlay._candidate_request(body, needs_version=True):
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'candidate-download'})
                    self._respond(200, overlay._download())
                    return
                status, response, headers = overlay._forward(self.path, body, self.headers)
                if self.path == LIST_VERSIONS and status == 200 and overlay._candidate_request(body, needs_version=False):
                    # ListVersionsResponse.versions is repeated field 1; a
                    # field may legally appear after pagination fields.
                    overlay._remember_module_id(response)
                    response += _field(1, overlay._version())
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'candidate-version'})
                else:
                    with overlay._lock:
                        overlay.requests.append({'path': self.path, 'kind': 'upstream'})
                self._respond(status, response, headers.get('Content-Type', 'application/proto'))

        return Handler
