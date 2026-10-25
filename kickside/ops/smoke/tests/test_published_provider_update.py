from contextlib import contextmanager
from copy import deepcopy
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from harness import Failure
from scenarios_published_provider_identity import (
    CODE_EXECUTION_HISTORICAL_CONTRACT,
    code_execution_historical_snapshot,
    owned_candidate_application,
    provider_binding_update,
    provider_historical_closure,
)


class PublishedProviderUpdateTests(unittest.TestCase):
    def exercise(self, *, parameters=None, target=None, includes=None, groups=None, dependencies=None,
                 module='example/provider', baseline=None, archived_constraint='*'):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            candidate = root / 'candidate'
            (candidate / 'src').mkdir(parents=True)
            source = root / 'source'
            (source / 'app' / 'src').mkdir(parents=True)
            (source / 'app' / 'wippy.yaml').write_text(yaml.safe_dump({
                'organization': 'kickside', 'module': 'kickside', 'type': 'application',
                'directories': {'src': 'src'},
            }))
            inst = Mock()
            inst.root, inst.app = root, root / 'app'
            (inst.app / 'src').mkdir(parents=True)
            inst.password = 'fixture password'
            inst.request.return_value = {'policies': [{'id': 'example.provider.security:module_access', 'intent': 'module_access'}]}
            replacements = {module: str(candidate)}
            contract = root / 'contract-candidate'
            if module == 'kickside/code-execution':
                (contract / 'src').mkdir(parents=True)
                replacements['kickside/contract'] = str(contract)
                (candidate / 'wippy.yaml').write_text(yaml.safe_dump({'directories': {'src': 'src'}}))
                (candidate / 'src/_index.yaml').write_text(yaml.safe_dump({'namespace': 'kickside.code_execution',
                    'entries': [{'name': 'contract', 'kind': 'ns.dependency', 'component': 'kickside/contract'}]}))
                (contract / 'wippy.yaml').write_text(yaml.safe_dump({'directories': {'src': 'src'}}))
            inst.config = {'source': str(source), 'replace': replacements}
            prepared_replacements = []
            inst.resolve_dependencies.side_effect = lambda **kwargs: prepared_replacements.append({
                'modules': kwargs['modules'], 'replacements': dict(inst.config['replace']),
            })
            (inst.app / '.wippy.yaml').write_text(yaml.safe_dump({'workspace': {}}))
            ctx = Mock()
            ctx.inst.config = deepcopy(inst.config)
            fixture = Mock(inst=inst)
            group = 'security.identity.provider:bound'
            supplied = [{'name': 'example.provider.security:user_security_scope', 'value': group},
                        {'name': 'example.provider:api_router', 'value': 'app:api'}]
            selected_baseline = baseline or {'version': '1.0.0', 'hash': 'verified digest', 'declared': True}
            before = {'parameters': supplied, 'entries': [{'module': module, 'module_version': selected_baseline['version']}]}
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
            specification = {'module': module, 'namespace': 'example.provider',
                             'endpoint_component': endpoint_id, 'parameters': {'example.provider:api_router': 'app:api'},
                             'probe': probe, 'dependencies': dependencies or []}
            def archive(path, archived_module, archived_baseline, *, application=False):
                path.mkdir()
                (path / 'src').mkdir()
                if application:
                    (path / '.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0', 'workspace': {}}))
                if archived_module == 'kickside/code-execution':
                    (path / 'src/entries.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'kickside.code_execution',
                        'entries': [{'name': 'contract', 'kind': 'ns.dependency', 'component': 'kickside/contract', 'version': archived_constraint}]}))
                return {'version': archived_baseline['version'], 'sha256': archived_baseline.get('hash', 'verified digest')}
            fixture_configs = []
            @contextmanager
            def isolated(context, *, config, prepare):
                fixture_configs.append(config)
                prepare(fixture)
                yield fixture
            def deployment(instance, locked, *, root):
                return {component: {'version': row['version'], 'sha256': row['hash']}
                        for component, row in locked.items()}
            def update(fixture, source, selected, **kwargs):
                if kwargs.get('replacements'):
                    inst.config['replace'] = dict(kwargs['replacements'])
                else:
                    inst.config['replace'][selected] = source
            with patch('scenarios_published_provider_identity.isolated_fixture', isolated), \
                 patch('scenarios_published_provider_identity.published_source', archive), \
                 patch('scenarios_published_provider_identity.prepare_published_deployment', side_effect=deployment), \
                 patch('scenarios_published_provider_identity.dependency', side_effect=[before, after]), \
                 patch('scenarios_published_provider_identity.update_source', side_effect=update) as update, \
                 patch('scenarios_published_provider_identity.registry_entry', side_effect=lambda instance, id, label: entries[id]), \
                 patch('scenarios_published_provider_identity.provider_members', return_value=('member token', 'outside token')):
                provider_binding_update(ctx, specification, selected_baseline)
            self.fixture_configs = fixture_configs
            self.assertTrue(update.call_args_list[0].kwargs['refresh_session'])
            if module == 'kickside/code-execution' and selected_baseline['version'] == '0.1.18':
                self.assertNotIn('live', update.call_args_list[0].kwargs)
            else:
                self.assertTrue(update.call_args_list[0].kwargs['live'])
            self.assertEqual(inst.install.call_args.kwargs['parameters'], supplied)
            probe.assert_called_once_with(fixture, 'member token', 'outside token')
            if dependencies:
                declarations = yaml.safe_load((inst.app / 'src/published-provider-dependency/_index.yaml').read_text())['entries']
                companion = next(row for row in declarations if row['component'] == 'example/companion')
                self.assertEqual(companion['version'], '*')
                self.assertEqual(companion['parameters'], dependencies[0]['parameters'])
            return update, prepared_replacements, str(contract) if module == 'kickside/code-execution' else None

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

    def test_code_execution_boots_a_pinned_historical_application_then_stages_the_current_graph(self):
        baseline = {'version': '0.1.18',
                    'hash': 'b12f9471a0efc06a553a30316d62227de47bf9f7451983a6a47735532b626f16',
                    'declared': True}
        update, prepared, current_contract = self.exercise(module='kickside/code-execution', baseline=baseline)
        self.assertEqual(prepared[0]['modules'], ('kickside/code-execution',))
        self.assertNotEqual(prepared[0]['replacements']['kickside/code-execution'], current_contract)
        self.assertEqual([call.args[2] for call in update.call_args_list],
                         ['kickside/kickside', 'kickside/code-execution'])
        self.assertEqual(update.call_args_list[0].kwargs['refresh_session'], True)
        self.assertNotIn('live', update.call_args_list[0].kwargs)
        staged = update.call_args_list[0].kwargs['replacements']
        self.assertEqual(staged['kickside/kickside'],
                         str(Path(current_contract).parent / 'current-code-execution-application'))
        self.assertEqual(update.call_args_list[0].args[1], staged['kickside/kickside'])
        self.assertEqual(staged['kickside/code-execution'], str(Path(current_contract).parent / 'candidate'))
        self.assertEqual(staged['kickside/contract'], current_contract)
        self.assertEqual(update.call_args_list[1].kwargs, {'live': True, 'refresh_session': True})
        self.assertEqual(update.call_args_list[1].args[1], staged['kickside/code-execution'])
        self.assertEqual(self.fixture_configs[0]['source'], None)
        self.assertEqual(self.fixture_configs[0]['published'], '0.1.146')
        self.assertEqual(self.fixture_configs[0]['replace'], {})

    def test_code_execution_owned_candidate_excludes_a_node_modules_symlink_without_touching_source(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'source/app'
            source.mkdir(parents=True)
            (source / 'wippy.yaml').write_text('type: application\n')
            (source / 'current.txt').write_text('candidate bytes')
            linked = root / 'linked-node-modules'
            linked.mkdir()
            (linked / 'package.json').write_text('{}')
            (source / 'node_modules').symlink_to(linked, target_is_directory=True)
            (source / '.wippy').mkdir()
            (source / '.git').mkdir()
            (source / 'test').mkdir()
            (source / 'test/fixture.txt').write_text('development fixture')
            inst = Mock(root=root / 'fixture')

            owned = owned_candidate_application(inst, source)

            self.assertEqual((owned / 'current.txt').read_text(), 'candidate bytes')
            self.assertFalse((owned / 'node_modules').exists())
            self.assertFalse((owned / '.wippy').exists())
            self.assertFalse((owned / '.git').exists())
            self.assertFalse((owned / 'test').exists())
            self.assertTrue((source / 'node_modules').is_symlink())
            self.assertEqual((linked / 'package.json').read_text(), '{}')

    def test_code_execution_only_pins_contract_for_declared_historical_dependencies(self):
        self.assertEqual(provider_historical_closure('kickside/code-execution', {'version': '0.1.16'}), ())
        self.assertEqual(provider_historical_closure('kickside/code-execution', {'version': '0.1.17'}), ())
        self.assertEqual(provider_historical_closure('kickside/code-execution', {'version': '0.1.18'}),
                         ({**CODE_EXECUTION_HISTORICAL_CONTRACT, 'provider_constraint': '*'},))

    def test_code_execution_018_snapshot_is_explicitly_catalog_derived_and_complete(self):
        snapshot = code_execution_historical_snapshot('kickside/code-execution', {
            'version': '0.1.18', 'hash': 'b12f9471a0efc06a553a30316d62227de47bf9f7451983a6a47735532b626f16'})
        self.assertEqual(snapshot['catalog_cutoff'], '2026-10-16T19:36:08Z')
        self.assertEqual(len(snapshot['modules']), 50)
        self.assertEqual(snapshot['modules']['kickside/contract'], {
            'version': '0.2.4', 'hash': CODE_EXECUTION_HISTORICAL_CONTRACT['hash']})

    def test_code_execution_017_uses_current_contract_after_asserting_its_archived_range(self):
        baseline = {'version': '0.1.17',
                    'hash': 'c937a9dbc51e55039c57ad8d6102ef28da78e165b4f86b4874ae540347707d08',
                    'declared': True}
        update, prepared, current_contract = self.exercise(module='kickside/code-execution', baseline=baseline)
        self.assertEqual(prepared[0]['modules'], ('kickside/code-execution',))
        self.assertEqual(prepared[0]['replacements']['kickside/contract'], current_contract)
        self.assertEqual([call.args[2] for call in update.call_args_list], ['kickside/code-execution'])

    def test_code_execution_rejects_an_archive_with_a_different_contract_constraint(self):
        baseline = {'version': '0.1.18',
                    'hash': 'b12f9471a0efc06a553a30316d62227de47bf9f7451983a6a47735532b626f16',
                    'declared': True}
        with self.assertRaisesRegex(Failure, 'Contract constraint'):
            self.exercise(module='kickside/code-execution', baseline=baseline, archived_constraint='>=0.3.1')
