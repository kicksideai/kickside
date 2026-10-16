"""Content equality must ignore release envelopes and retain deployable changes."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import shlex
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import struct
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request

import msgpack
import zstandard

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('release_content', ROOT / '.github/scripts/release_content.py')
assert SPEC and SPEC.loader
CONTENT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CONTENT)


def write_pack(path, *, source='return 1', timestamp='2026-01-01T00:00:00Z',
               version='0.1.0', description='Example', resource=b'asset', mode=420, resource_count=None):
    """Small valid v1 archive, including a real embedded file and frame hashes."""
    compressor = zstandard.ZstdCompressor()
    data = bytearray(b'WIPPYPACK' + struct.pack('<BH', 1, 0) + bytes(256))
    def frame(value):
        raw = msgpack.packb(value, use_bin_type=True)
        compressed = compressor.compress(raw)
        desc = dict(Offset=len(data), Size=len(compressed), UncompressedSize=len(raw),
                    Hash=hashlib.sha256(compressed).hexdigest())
        data.extend(compressed)
        return desc
    meta = dict(name='example', namespace='kickside.example', version=version,
                          description=description, packed_at=timestamp, wippy_version='test',
                          registry={'entries': {'owner': version}})
    if resource_count is not None:
        meta['resource_count'] = resource_count
    metadata = frame(meta)
    entries = frame([dict(ID={'ns': 'kickside.example', 'name': 'run'},
                          Kind='function.lua', Data={'source': source}, Meta={})])
    tree = frame(dict(ID={'ns': 'kickside.example', 'name': 'assets'}, Meta={},
                      Dirs={'': ['file.txt']}, Files={'file.txt': dict(
                          Hash=hashlib.sha256(resource).hexdigest(), Size=len(resource),
                          Mode=mode, ModTime=timestamp, Meta=None,
                          Compressed=False, CompressedSize=len(resource),
                          Location={'FrameIndex': 3, 'Offset': 0, 'Chunks': None})}))
    blobs = dict(Offset=len(data), Size=len(resource), UncompressedSize=len(resource),
                 Hash=hashlib.sha256(resource).hexdigest())
    data.extend(resource)
    index_offset = len(data)
    index = compressor.compress(msgpack.packb(dict(Metadata=metadata, Entries=entries,
        Resources=[dict(ID={'ns': 'kickside.example', 'name': 'assets'}, Type='tree',
                        Meta={}, FileCount=1, TotalSize=len(resource), Frame=tree)],
        DataFrames=[blobs]), use_bin_type=True))
    data.extend(index)
    data.extend(struct.pack('<QQ', index_offset, len(index)))
    path.write_bytes(data)


def setUpModule():
    (ROOT / '.local').mkdir(exist_ok=True)


class ContentDigestTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory(dir=os.environ['TMPDIR'])
        self.addCleanup(directory.cleanup)
        self.directory = Path(directory.name)
        self.first = self.directory / 'first.wapp'
        self.second = self.directory / 'second.wapp'
        write_pack(self.first)

    def test_timestamp_version_and_registry_envelope_do_not_republish(self):
        write_pack(self.second, timestamp='2026-10-03T12:00:00Z', version='0.1.1')
        self.assertNotEqual(self.first.read_bytes(), self.second.read_bytes())
        self.assertEqual(CONTENT.content_digest(self.first), CONTENT.content_digest(self.second))

    def test_source_metadata_embedded_bytes_and_permissions_each_trigger_release(self):
        for change in [dict(source='return 2'), dict(description='Changed'),
                       dict(resource=b'changed asset'), dict(mode=493)]:
            with self.subTest(change=change):
                write_pack(self.second, **change)
                self.assertNotEqual(CONTENT.content_digest(self.first), CONTENT.content_digest(self.second))

    def test_pack_only_resource_count_does_not_trigger_publish(self):
        write_pack(self.second, resource_count=1)
        self.assertEqual(CONTENT.content_digest(self.first), CONTENT.content_digest(self.second))

    def test_real_embedded_pack_digest_survives_new_release_and_build_file_times(self):
        module = self.directory / 'transform'
        shutil.copytree(ROOT / 'platform/transform', module,
                        ignore=shutil.ignore_patterns('ui', 'test', '.wippy', '.local'))
        CONTENT.build_pack(module, self.directory / 'one', '0.1.38', ['ui_fs'])
        for path in (module / 'static').rglob('*'):
            if path.is_file():
                os.utime(path, (1000000000, 1000000000))
        CONTENT.build_pack(module, self.directory / 'two', '0.1.39', ['ui_fs'])
        first = self.directory / 'one/module.wapp'
        second = self.directory / 'two/module.wapp'
        self.assertNotEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual(CONTENT.content_digest(first), CONTENT.content_digest(second))

    def test_corrupt_frame_fails_instead_of_skipping(self):
        data = bytearray(self.first.read_bytes()); data[280] ^= 1
        self.second.write_bytes(data)
        with self.assertRaisesRegex(ValueError, 'hash|frame'):
            CONTENT.content_digest(self.second)

    def test_unsupported_pack_format_fails_closed(self):
        data = bytearray(self.first.read_bytes()); data[9] = 2
        self.second.write_bytes(data)
        with self.assertRaisesRegex(ValueError, 'version|format'):
            CONTENT.content_digest(self.second)

    def test_malformed_credentials_do_not_expose_file_contents(self):
        config = self.directory / 'config'
        (config / 'wippy').mkdir(parents=True)
        (config / 'wippy/credentials.yaml').write_text('credentials: [secret-test-token')
        with patch.dict(os.environ, {'XDG_CONFIG_HOME': str(config)}):
            with self.assertRaisesRegex(ValueError, 'credentials') as error:
                CONTENT.credentials()
        self.assertNotIn('secret-test-token', str(error.exception))

    def test_signed_download_redirect_does_not_forward_hub_credentials(self):
        request = Request('https://hub.example/download', headers={'Authorization': 'Bearer test-secret'})
        redirected = CONTENT.HubRedirectHandler().redirect_request(
            request, None, 302, 'Found', {}, 'https://storage.example/signed')
        self.assertFalse(redirected.has_header('Authorization'))
        same_origin = CONTENT.HubRedirectHandler().redirect_request(
            request, None, 302, 'Found', {}, 'https://hub.example/artifact')
        self.assertEqual(same_origin.get_header('Authorization'), 'Bearer test-secret')

    def test_hub_download_must_match_published_digest(self):
        with patch.object(CONTENT, 'request', return_value=self.first.read_bytes()):
            with self.assertRaisesRegex(ValueError, 'digest'):
                CONTENT.download_pack('https://example.invalid', 'kickside/example', '0.1.0',
                                      '0' * 64, None, self.second)

    def test_only_module_not_found_allows_first_publish(self):
        for status in [401, 403, 500]:
            with self.subTest(status=status):
                with patch.object(CONTENT, 'request', side_effect=HTTPError('url', status, 'error', {}, None)):
                    with self.assertRaises(HTTPError):
                        CONTENT.latest_module('https://example.invalid', 'kickside/example', None)
        with patch.object(CONTENT, 'request', side_effect=HTTPError('url', 404, 'missing', {}, None)):
            self.assertIsNone(CONTENT.latest_module('https://example.invalid', 'kickside/example', None))

    def test_same_commit_real_packs_have_identical_bytes_and_content_digests(self):
        CONTENT.build_pack(ROOT / 'core/contract', self.directory / 'one', '0.1.43', [])
        # Cross a whole-second boundary so a raw packed_at timestamp cannot
        # accidentally make a broken reproducibility check pass.
        time.sleep(1.1)
        CONTENT.build_pack(ROOT / 'core/contract', self.directory / 'two', '0.1.43', [])
        first = self.directory / 'one/module.wapp'
        second = self.directory / 'two/module.wapp'
        self.assertEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual(CONTENT.content_digest(first), CONTENT.content_digest(second))


class ReleaseScriptTests(unittest.TestCase):
    def run_release(self, mode, *, gate_failure=None):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            executable = work / 'bin/make'
            executable.parent.mkdir()
            executable.write_text(f'#!{sys.executable}\n' +
                (ROOT / '.github/scripts/fixtures/make_compat.py').read_text())
            executable.chmod(0o755)
            report = {'baselines': {}, 'findings': [], 'migrations': {}, 'errors': []}
            if gate_failure == 'breaking':
                report['findings'].append({'module': 'kickside/contract', 'baseline': '0.1.43',
                    'id': 'kickside.contract:published_method', 'code': 'removed_entry',
                    'path': '', 'status': 'breaking'})
            elif gate_failure == 'error':
                report['errors'].append('compatibility fixture fails')
            (executable.parent / 'compat-result.json').write_text(json.dumps(report))
            output = work / 'compat/evidence'
            pack = CONTENT.build_pack(ROOT / 'core/contract', work / 'fixture', '0.1.43', [])
            if mode == 'changed':
                write_pack(pack, source='return 999')
            archive = pack.read_bytes()
            paths = []
            class Handler(BaseHTTPRequestHandler):
                def log_message(self, *args):
                    pass
                def do_GET(self):
                    paths.append(self.path)
                    if mode == 'failed':
                        self.send_error(500, 'unchanged')
                        return
                    if self.path.endswith('/download'):
                        body = archive
                    elif self.path.endswith('/versions/0.1.43'):
                        digest = '0' * 64 if mode == 'corrupt' else hashlib.sha256(archive).hexdigest()
                        body = json.dumps({'digest': digest, 'yanked': mode == 'yanked'}).encode()
                    elif self.path == '/api/v1/modules/kickside/contract':
                        if mode == 'new':
                            self.send_error(404)
                            return
                        body = json.dumps({'latest_version': '0.1.43',
                            'module_type': 'plugin' if mode == 'type' else 'library',
                            'visibility': 'private' if mode == 'visibility' else 'public'}).encode()
                    else:
                        self.send_error(404)
                        return
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(body)
            server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
            thread = threading.Thread(target=server.serve_forever)
            thread.start()
            try:
                env = {**os.environ, 'WIPPY_REGISTRY': f'http://127.0.0.1:{server.server_port}',
                       'TMPDIR': str(work), 'PATH': str(executable.parent) + os.pathsep + os.environ['PATH'],
                       'COMPAT_ARGS': shlex.join(['--output', str(output)])}
                result = subprocess.run(['python3', '.github/scripts/delivery.py', 'publish', '--module', 'core/contract', '--version', '0.1.43', '--dry-run'], cwd=ROOT,
                                        env=env, capture_output=True, text=True, timeout=120)
                self.assertNotIn('direct wippy publish', result.stdout)
                self.assertEqual(json.loads((executable.parent / 'invocation.json').read_text()),
                                 {'args': ['compat'], 'cwd': str(ROOT)})
                report['verdict'] = 'FAIL' if gate_failure else 'PASS'
                self.assertEqual(json.loads((output / 'compat.json').read_text()), report)
                self.assertIn('Verdict: ' + report['verdict'], (output / 'compat.md').read_text())
                self.assertIn(f"{report['verdict']}: {len(report['findings'])} breaking findings; "
                              f"{len(report['errors'])} errors", result.stdout)
                if gate_failure:
                    self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertIn('exit status 2', result.stderr)
                    self.assertEqual(paths, [])
                    self.assertNotIn('packed entries', result.stdout)
                    self.assertNotIn('unchanged (content matches verified Hub artifact)', result.stdout)
                    self.assertNotIn('+ wippy publish', result.stdout)
                    return
                if mode in ('failed', 'corrupt'):
                    self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertNotIn('unchanged (content matches verified Hub artifact)', result.stdout)
                    self.assertNotIn('+ wippy publish', result.stdout)
                    self.assertEqual(len(paths), 1 if mode == 'failed' else 3)
                    if mode == 'corrupt':
                        self.assertIn('Hub artifact digest mismatch', result.stderr)
                else:
                    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                    self.assertEqual(len(paths), 1 if mode == 'new' else 3)
                    if mode == 'same':
                        self.assertIn('unchanged (content matches verified Hub artifact)', result.stdout)
                        self.assertNotIn('+ wippy publish', result.stdout)
                    else:
                        self.assertIn(('new module' if mode == 'new' else 'changed') +
                                      ' (packed; publish required)', result.stdout)
                        self.assertIn('--dry-run', result.stdout)
                        self.assertNotIn('unchanged (content matches verified Hub artifact)', result.stdout)
            finally:
                server.shutdown()
                thread.join()
                server.server_close()

    def test_dry_run_skips_matching_hub_content_without_publish(self):
        for gate_failure in (None, 'breaking', 'error'):
            with self.subTest(gate_failure=gate_failure):
                self.run_release('same', gate_failure=gate_failure)

    def test_dry_run_packs_changed_content_without_publish(self):
        self.run_release('changed')

    def test_hub_failure_with_unchanged_wording_is_a_release_failure(self):
        self.run_release('failed')

    def test_matching_bytes_keep_type_visibility_and_yank_state_release_changes(self):
        for mode in ('type', 'visibility', 'yanked'):
            with self.subTest(mode=mode):
                self.run_release(mode)

    def test_invalid_hub_digest_stops_the_release_cli(self):
        self.run_release('corrupt')

    def test_new_module_packs_without_an_existing_hub_artifact(self):
        self.run_release('new')


if __name__ == '__main__':
    (ROOT / '.local').mkdir(exist_ok=True)
    unittest.main()
