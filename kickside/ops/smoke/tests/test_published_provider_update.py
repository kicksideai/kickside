from contextlib import contextmanager
from copy import deepcopy
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from harness import Failure
from scenarios_published_provider_identity import provider_binding_update


class PublishedProviderUpdateTests(unittest.TestCase):
    def exercise(self, *, parameters=None, target=None, includes=None, groups=None, dependencies=None):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            candidate = root / 'candidate'
            (candidate / 'src').mkdir(parents=True)
            inst = Mock()
            inst.root, inst.app = root, root / 'app'
            (inst.app / 'src').mkdir(parents=True)
            inst.password = 'fixture password'
            inst.request.return_value = {'policies': [{'id': 'example.provider.security:module_access', 'intent': 'module_access'}]}
            inst.config = {'replace': {'example/provider': str(candidate)}}
            (inst.app / '.wippy.yaml').write_text(yaml.safe_dump({'workspace': {}}))
            ctx = Mock()
            ctx.inst.config = deepcopy(inst.config)
            fixture = Mock(inst=inst)
            group = 'security.identity.provider:bound'
            supplied = [{'name': 'example.provider.security:user_security_scope', 'value': group},
                        {'name': 'example.provider:api_router', 'value': 'app:api'}]
            before = {'parameters': supplied, 'entries': [{'module': 'example/provider', 'module_version': '1.0.0'}]}
            after = deepcopy(before)
            if parameters is not None:
                after['parameters'] = parameters
            endpoint_id = 'example.provider.security:endpoint_access'
            endpoint = {'id': endpoint_id, 'data': {'groups': [group] if groups is None else groups}, 'meta': {}}
            bundle = {'id': 'example.provider.security:module_access', 'meta': {
                'includes': [endpoint_id] if includes is None else includes}, 'data': {}}
            requirement = {'data': {'targets': [{'entry': endpoint_id if target is None else target,
                                               'path': '.groups +='}]}}
            entries = {endpoint_id: endpoint, bundle['id']: bundle,
                       supplied[0]['name']: requirement, supplied[1]['name']: {'data': {}}}
            probe = Mock(return_value={'member': 200, 'outside': 403})
            specification = {'module': 'example/provider', 'namespace': 'example.provider',
                             'endpoint_component': endpoint_id, 'parameters': {'example.provider:api_router': 'app:api'},
                             'probe': probe, 'dependencies': dependencies or []}
            def archive(path, module, baseline):
                path.mkdir()
                (path / 'src').mkdir()
                return {'version': baseline['version'], 'sha256': 'verified digest'}
            @contextmanager
            def isolated(context, *, config, prepare):
                prepare(fixture)
                yield fixture
            with patch('scenarios_published_provider_identity.isolated_fixture', isolated), \
                 patch('scenarios_published_provider_identity.published_source', archive), \
                 patch('scenarios_published_provider_identity.dependency', side_effect=[before, after]), \
                 patch('scenarios_published_provider_identity.update_source') as update, \
                 patch('scenarios_published_provider_identity.registry_entry', side_effect=lambda instance, id, label: entries[id]), \
                 patch('scenarios_published_provider_identity.provider_members', return_value=('member token', 'outside token')):
                provider_binding_update(ctx, specification, {'version': '1.0.0', 'hash': 'verified digest', 'declared': True})
            self.assertTrue(update.call_args.kwargs['live'])
            self.assertTrue(update.call_args.kwargs['refresh_session'])
            self.assertEqual(inst.install.call_args.kwargs['parameters'], supplied)
            probe.assert_called_once_with(fixture, 'member token', 'outside token')
            if dependencies:
                declarations = yaml.safe_load((inst.app / 'src/published-provider-dependency/_index.yaml').read_text())['entries']
                companion = next(row for row in declarations if row['component'] == 'example/companion')
                self.assertEqual(companion['version'], '*')
                self.assertEqual(companion['parameters'], dependencies[0]['parameters'])

    def test_updates_an_arbitrary_provider_with_its_existing_binding(self):
        self.exercise()

    def test_rejects_a_lost_existing_parameter(self):
        with self.assertRaisesRegex(Failure, 'drops or rewrites'):
            self.exercise(parameters=[])

    def test_rejects_a_requirement_retargeted_to_the_public_bundle(self):
        with self.assertRaisesRegex(Failure, 'target'):
            self.exercise(target='example.provider.security:module_access')

    def test_rejects_a_bundle_that_omits_the_historical_component(self):
        with self.assertRaisesRegex(Failure, 'compose'):
            self.exercise(includes=[])

    def test_rejects_an_endpoint_component_that_loses_the_bound_group(self):
        with self.assertRaisesRegex(Failure, 'attaches'):
            self.exercise(groups=[])

    def test_declares_existing_support_bindings_for_the_archived_graph(self):
        self.exercise(dependencies=[{'component': 'example/companion', 'parameters': [
            {'name': 'example.companion:ui_server', 'value': 'app:gateway'}]}])
