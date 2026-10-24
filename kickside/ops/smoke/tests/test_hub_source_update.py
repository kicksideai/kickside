import os
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import yaml

from module_lifecycle_contract import update_source


class HubSourceUpdateTests(unittest.TestCase):
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
