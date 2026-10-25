import http.client
import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import yaml

from module_lifecycle_contract import update_source


class HubSourceUpdateTests(unittest.TestCase):
    @staticmethod
    def _module_request(org, name, *, version=None, version_id=None):
        from candidate_hub_registry import _field, _text
        module = _field(2, _text(1, org) + _text(2, name))
        request = _field(1, module)
        if version_id is not None:
            request += _field(2, _text(1, version_id))
        elif version is not None:
            request += _field(2, _text(2, version))
        return request

    @staticmethod
    def _native_package(path, dependencies):
        """Build the smallest genuine WIPPYPACK layout needed by this test."""
        import hashlib
        import msgpack
        import struct
        import zstandard

        entries = [{'ID': {'ns': 'fixture', 'name': 'dependency-' + str(index)},
                    'Kind': 'ns.dependency',
                    'Data': {'component': component, 'version': constraint}}
                   for index, (component, constraint) in enumerate(dependencies)]
        entries_raw = msgpack.packb(entries, use_bin_type=True)
        compressor = zstandard.ZstdCompressor()
        entries_frame = compressor.compress(entries_raw)
        offset = 268
        toc = {'Entries': {'Offset': offset, 'Size': len(entries_frame),
                           'UncompressedSize': len(entries_raw)}}
        toc_frame = compressor.compress(msgpack.packb(toc, use_bin_type=True))
        header = bytearray(268)
        header[:9] = b'WIPPYPACK'
        header[9] = 1
        struct.pack_into('<QQ', header, 12, offset, len(entries_frame))
        header[28:60] = hashlib.sha256(entries_frame).digest()
        path.write_bytes(bytes(header) + entries_frame + toc_frame +
                         struct.pack('<QQ', offset + len(entries_frame), len(toc_frame)))

    def test_candidate_registry_serves_packed_bytes_and_overlays_only_candidate_versions(self):
        from candidate_hub_registry import CandidateHubRegistry, GET_VERSION, LIST_VERSIONS, _field, _text
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            artifact = root / 'candidate.wapp'
            artifact.write_bytes(b'real-packed-bytes')
            with CandidateHubRegistry(artifact, 'kickside/atlassian', '0.1.28') as registry:
                published = _field(1, _text(2, 'published-atlassian-module-id'))
                with patch.object(registry, '_forward', return_value=(200, published, {})):
                    parsed = registry.url.removeprefix('http://').split(':')
                    client = http.client.HTTPConnection(parsed[0], int(parsed[1]))
                    client.request('GET', '/candidate/' + registry.digest + '.wapp')
                    artifact_response = client.getresponse()
                    self.assertEqual(artifact_response.status, 200)
                    self.assertEqual(artifact_response.read(), b'real-packed-bytes')
                    client.request('POST', LIST_VERSIONS, self._module_request('kickside', 'atlassian'),
                                   {'Content-Type': 'application/proto'})
                    catalog_response = client.getresponse()
                    self.assertEqual(catalog_response.status, 200)
                    payload = catalog_response.read()
                    self.assertTrue(payload.startswith(published))
                    self.assertIn(b'0.1.28', payload)
                    self.assertIn(b'candidate-kickside-atlassian', payload)
                    self.assertIn(b'published-atlassian-module-id', payload)
                    client.request('POST', GET_VERSION,
                                   self._module_request('kickside', 'atlassian',
                                                        version_id='candidate-kickside-atlassian'),
                                   {'Content-Type': 'application/proto'})
                    version_response = client.getresponse()
                    self.assertEqual(version_response.status, 200)
                    self.assertIn(b'0.1.28', version_response.read())
                    client.request('POST', GET_VERSION,
                                   self._module_request('kickside', 'atlassian', version='0.1.27'),
                                   {'Content-Type': 'application/proto'})
                    historical_response = client.getresponse()
                    self.assertEqual(historical_response.status, 200)
                    self.assertEqual(historical_response.read(), published)
                    client.request('POST', LIST_VERSIONS,
                                   self._module_request('evil-kickside', 'atlassian-shadow'),
                                   {'Content-Type': 'application/proto'})
                    other_module_response = client.getresponse()
                    self.assertEqual(other_module_response.status, 200)
                    self.assertEqual(other_module_response.read(), published)
                    self.assertEqual([request['kind'] for request in registry.requests],
                                     ['artifact', 'candidate-version', 'candidate-get-version', 'upstream',
                                      'upstream'])

    def test_candidate_manifest_uses_dependency_ranges_from_native_package(self):
        from candidate_hub_registry import CandidateHubRegistry, MANIFEST, _wire_fields
        with tempfile.TemporaryDirectory() as directory:
            artifact = Path(directory) / 'candidate.wapp'
            self._native_package(artifact, [
                ('kickside/component', '*'),
                ('kickside/connection', '>=0.3.0'),
            ])
            with CandidateHubRegistry(artifact, 'kickside/atlassian', '0.1.28') as registry:
                parsed = registry.url.removeprefix('http://').split(':')
                client = http.client.HTTPConnection(parsed[0], int(parsed[1]))
                client.request('POST', MANIFEST,
                               self._module_request('kickside', 'atlassian', version='0.1.28'),
                               {'Content-Type': 'application/proto'})
                response = client.getresponse()
                self.assertEqual(response.status, 200)
                top = dict((number, value) for number, wire, value in _wire_fields(response.read())
                           if wire == 2)
                manifest = list(_wire_fields(top[1]))
                fields = {number: value for number, wire, value in manifest if wire == 2}
                self.assertEqual({field: fields[field] for field in (2, 3)},
                                 {2: b'kickside', 3: b'atlassian'})
                self.assertEqual(fields[5], b'0.1.28')
                dependencies = []
                for number, wire, value in manifest:
                    if number == 9 and wire == 2:
                        dependency = {field: item for field, item_wire, item in _wire_fields(value)
                                      if item_wire == 2}
                        dependencies.append((dependency[1], dependency[2], dependency[9]))
                self.assertEqual(dependencies, [
                    (b'kickside', b'component', b'*'),
                    (b'kickside', b'connection', b'>=0.3.0'),
                ])
                self.assertEqual([request['kind'] for request in registry.requests], ['candidate-manifest'])

    def test_published_bot_accounts_capability_retains_the_current_endpoint_and_empty_candidate_set(self):
        from scenarios_published_run_as import published_bot_accounts_capability

        endpoint = {
            'data': {'func': 'bot_accounts_list', 'method': 'GET', 'path': '/users/bots'},
            'id': 'kickside.users.api:bot_accounts_list.endpoint',
            'kind': 'http.endpoint',
            'meta': {'router': 'app:api'},
        }
        inst = Mock()
        inst.request.side_effect = [
            {'success': True, 'entry': endpoint, 'version': {'id': 7, 'previous': 6, 'string': 'v7'}},
            {'success': True, 'users': [], 'count': 0, 'limit': 100, 'offset': 0},
        ]

        self.assertEqual(published_bot_accounts_capability(inst, 'published-token', 'baseline'), {
            'entry': endpoint, 'listing': {'success': True, 'users': [], 'count': 0, 'limit': 100, 'offset': 0}})
        self.assertEqual(inst.request.call_args_list, [
            unittest.mock.call('GET', '/api/v1/keeper/registry/entry?id=kickside.users.api%3Abot_accounts_list.endpoint',
                               label='baseline-bot-api-entry'),
            unittest.mock.call('GET', '/api/v1/users/bots', auth='published-token',
                               label='baseline-bot-api-list'),
        ])

    def test_published_bot_capability_rejects_incoherent_paging(self):
        from harness import Failure
        from scenarios_published_run_as import BOT_ACCOUNTS_ENDPOINT, published_bot_accounts_capability
        listing = {'success': True, 'users': [], 'count': 0, 'limit': 100, 'offset': 0}
        for field, value in [('count', 1), ('limit', 0), ('offset', 1)]:
            with self.subTest(field=field):
                inst = Mock()
                inst.request.side_effect = [{'entry': BOT_ACCOUNTS_ENDPOINT}, {**listing, field: value}]
                with self.assertRaisesRegex(Failure, 'paging'):
                    published_bot_accounts_capability(inst, 'published-token', 'baseline')

    def test_published_preparation_accepts_a_module_without_an_application_type(self):
        from scenarios_published_run_as import browser_published_human_automation_update

        class Prepared(RuntimeError):
            pass

        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'temp').mkdir()
            app = root / 'runtime'
            app.mkdir()
            candidates = {}
            for module, manifest in {'kickside/kickside': {'type': 'application'}, 'example/library': {}}.items():
                candidate = root / module.replace('/', '_')
                candidate.mkdir()
                (candidate / 'wippy.yaml').write_text(yaml.safe_dump(manifest))
                candidates[module] = str(candidate)
            fixture = SimpleNamespace(inst=SimpleNamespace(root=root, app=app, config={}, evidence=Mock()), state={})

            def materialize(directory, module, baseline, *, application):
                directory.mkdir()
                if application:
                    (directory / '.wippy.yaml').write_text('version: "1.0"\n')
                return {'version': 'published', 'sha256': 'verified'}

            def prepared_fixture(ctx, **arguments):
                arguments['prepare'](fixture)
                raise Prepared('baseline preparation completes')

            with patch('scenarios_published_run_as.candidate_dependency_sources', return_value=candidates), \
                 patch('scenarios_identity_policy_upgrade.published_source', side_effect=materialize) as source, \
                 patch('scenarios_published_run_as.published_fixture', side_effect=prepared_fixture):
                with self.assertRaisesRegex(Prepared, 'baseline preparation completes'):
                    browser_published_human_automation_update(
                        SimpleNamespace(inst=SimpleNamespace(config={'replace': candidates})))
            self.assertEqual({call.args[1]: call.kwargs['application'] for call in source.call_args_list},
                             {'kickside/kickside': True, 'example/library': False})
            configuration = yaml.safe_load((app / '.wippy.yaml').read_text())
            self.assertEqual(configuration['workspace']['replacements'], fixture.state['published_sources'])
            self.assertEqual(set(configuration['workspace']['replacements']), set(candidates))

    def test_selected_controller_is_preloaded_from_an_owned_copy_with_its_published_receipt(self):
        from scenarios_published_run_as import browser_published_human_automation_update

        class Prepared(RuntimeError):
            pass

        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'temp').mkdir()
            app = root / 'runtime'
            app.mkdir()
            candidates = {}
            for module, manifest in {
                    'kickside/kickside': {'type': 'application'},
                    'keeper/keeper': {'type': 'plugin'}}.items():
                candidate = root / module.replace('/', '_')
                candidate.mkdir()
                (candidate / 'wippy.yaml').write_text(yaml.safe_dump(manifest))
                candidates[module] = str(candidate)
            canonical = Path(candidates['keeper/keeper']) / 'src/keeper/gov/service'
            canonical.mkdir(parents=True)
            central = canonical / 'central.lua'
            central.write_text('return { run = function() return "fixed" end }\n')
            fixture = SimpleNamespace(inst=SimpleNamespace(root=root, app=app, config={}, evidence=Mock()), state={})

            def materialize(directory, module, baseline, *, application):
                directory.mkdir()
                if application:
                    (directory / '.wippy.yaml').write_text('version: "1.0"\n')
                return {'version': 'published', 'sha256': module + '-receipt'}

            def prepared_fixture(ctx, **arguments):
                arguments['prepare'](fixture)
                raise Prepared('baseline preparation completes')

            with patch('scenarios_published_run_as.candidate_dependency_sources', return_value=candidates), \
                 patch('scenarios_identity_policy_upgrade.published_source', side_effect=materialize) as source, \
                 patch('scenarios_published_run_as.published_fixture', side_effect=prepared_fixture):
                with self.assertRaisesRegex(Prepared, 'baseline preparation completes'):
                    browser_published_human_automation_update(
                        SimpleNamespace(inst=SimpleNamespace(config={'replace': candidates})),
                        controller_source='keeper/keeper')

            controller = fixture.state['controller_source']
            active = Path(controller['active_source'])
            self.assertNotEqual(active, Path(candidates['keeper/keeper']))
            self.assertEqual((active / 'src/keeper/gov/service/central.lua').read_text(), central.read_text())
            self.assertEqual(controller['published_receipt'], {'version': 'published', 'sha256': 'keeper/keeper-receipt'})
            self.assertEqual(Path(controller['published_receipt_path']).parent.name, 'published-controller-receipts')
            self.assertEqual(yaml.safe_load((app / '.wippy.yaml').read_text())['workspace']['replacements']['keeper/keeper'],
                             str(active))
            self.assertEqual(central.read_text(), 'return { run = function() return "fixed" end }\n')
            self.assertEqual([call.args[1] for call in source.call_args_list], ['kickside/kickside', 'keeper/keeper'])

    def test_active_controller_proof_requires_the_selected_source_bytes(self):
        from scenarios_published_run_as import _active_controller_source
        source = 'return { run = function() return "fixed" end }\n'
        import hashlib
        inst = Mock()
        inst.request.return_value = {'entry': {'id': 'keeper.gov.service:central', 'data': {'source': source}}}
        proof = _active_controller_source(inst, {'central_sha256': hashlib.sha256(source.encode()).hexdigest()})
        self.assertEqual(proof['active_source_sha256'], proof['central_sha256'])
        self.assertEqual(proof['registry_entry'], 'keeper.gov.service:central')

    def test_live_update_uses_keeper_planning_without_cli_resolution(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            candidate = root / 'candidate'
            candidate.mkdir()
            config = root / '.wippy.yaml'
            config.write_text(yaml.safe_dump({'workspace': {'replacements': {'vendor/retained': '/retained'}}}))
            inst = Mock(app=root, config={'replace': {'vendor/retained': '/retained'}})
            inst.process.poll.return_value = None
            ctx = Mock(inst=inst)
            replacement = {'example/foundation': '/foundation', 'example/app': str(candidate)}
            def install(instance, **kwargs):
                self.assertIs(instance, inst)
                expected = {'vendor/retained': '/retained', **replacement}
                self.assertEqual(inst.config['replace'], expected)
                self.assertEqual(yaml.safe_load(config.read_text())['workspace']['replacements'], expected)
                inst.resolve_dependencies.assert_not_called()
                return {'entries': [{'module': 'example/app', 'module_version': 'local'}]}
            with patch('module_lifecycle_contract.install_latest', side_effect=install):
                update_source(ctx, str(candidate), 'example/app', live=True, replacements=replacement)
            inst.stop.assert_not_called()
            inst.start.assert_not_called()
            inst.login.assert_not_called()

    def test_root_source_overrides_the_optional_closure_mapping(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            candidate = root / 'candidate'
            candidate.mkdir()
            (root / '.wippy.yaml').write_text('version: "1.0"\n')
            inst = Mock(app=root, config={'replace': {}})
            inst.process.poll.return_value = None
            ctx = Mock(inst=inst)
            with patch('module_lifecycle_contract.install_latest', return_value={
                    'entries': [{'module': 'example/app', 'module_version': 'local'}]}):
                update_source(ctx, str(candidate), 'example/app', live=True,
                              replacements={'example/app': '/different', 'example/library': '/library'})
            self.assertEqual(inst.config['replace']['example/app'], str(candidate))
            self.assertEqual(inst.config['replace']['example/library'], '/library')

    def test_caller_install_transport_uses_the_staged_sources_and_keeps_the_same_runtime(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            candidate = root / 'candidate'
            candidate.mkdir()
            (root / '.wippy.yaml').write_text('version: "1.0"\n')
            inst = Mock(app=root, config={'replace': {}})
            inst.process.poll.return_value = None
            ctx = Mock(inst=inst)
            def install(instance, **kwargs):
                self.assertIs(instance, inst)
                self.assertEqual(kwargs, {'module': 'example/app', 'replacement': True, 'refresh_session': False})
                self.assertEqual(inst.config['replace'], {'example/app': str(candidate)})
                inst.resolve_dependencies.assert_not_called()
                return {'entries': [{'module': 'example/app', 'module_version': 'local'}]}
            with patch('module_lifecycle_contract.install_latest') as native:
                update_source(ctx, str(candidate), 'example/app', live=True, installer=install)
            native.assert_not_called()
            inst.stop.assert_not_called()
            inst.start.assert_not_called()
            inst.login.assert_not_called()
