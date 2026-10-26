from pathlib import Path
from contextlib import nullcontext
import os
import tempfile
import unittest
from unittest.mock import Mock, patch

from module_lifecycle_contract import published_fixture


class UpgradeFixtureTests(unittest.TestCase):
    def test_restart_discovers_roots_in_every_registry_source_filename(self):
        from runtime import write_dependency_roots
        import yaml
        dependency = {'namespace': 'app.deps', 'name': 'ui', 'component': 'kickside/ui',
                      'is_root': True, 'parameters': [{'name': 'api_router', 'value': 'app:api'}]}
        for filename in ('_index.yaml', 'published.yaml'):
            with self.subTest(filename=filename), tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                app = Path(directory)
                (app / 'src').mkdir()
                source = app / 'src' / filename
                source.write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'app.deps', 'entries': [
                    {'name': 'ui', 'kind': 'ns.dependency', 'component': 'kickside/ui',
                     'version': '*', 'parameters': dependency['parameters']}]}))
                original = source.read_bytes()
                self.assertFalse(write_dependency_roots(app, [dependency]))
                self.assertEqual(source.read_bytes(), original)
                self.assertFalse((app / 'src/runtime-dependencies').exists())

    def test_published_restart_retains_root_ownership_and_resolves_source_declarations(self):
        from runtime import Instance
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory), config={'source': None, 'published': 'latest'})
            locked = inst.app / 'wippy.lock'
            locked.write_bytes(b'modules: []\n')
            dependencies = [
                {'namespace': 'app.deps', 'name': 'ui', 'component': 'kickside/ui',
                 'is_root': True, 'parameters': [{'name': 'api_router', 'value': 'app:api'}]},
                {'namespace': 'optional', 'name': 'provider', 'component': 'example/provider',
                 'is_root': True, 'parameters': [{'name': 'scope', 'value': 'app:members'}]}]
            inst.request.return_value = {'dependencies': dependencies}
            Instance.preserve_dependencies(inst)
            declarations = [yaml.safe_load(path.read_text()) for path in inst.app.rglob('_index.yaml')]
            self.assertEqual({row['namespace'] for row in declarations}, {'app.deps', 'optional'})
            roots = {entry['component']: entry for row in declarations for entry in row['entries']}
            self.assertEqual(set(roots), {'kickside/ui', 'example/provider'})
            for dependency in dependencies:
                self.assertEqual(roots[dependency['component']]['parameters'], dependency['parameters'])
                self.assertEqual(roots[dependency['component']]['version'], '*')
            self.assertEqual(locked.read_bytes(), b'modules: []\n')
            inst.resolve_dependencies.assert_not_called()
            self.assertTrue(inst.dependencies_pending)
            inst.evidence.save.assert_called_once_with('restart-dependency-roots', dependencies)

    def test_published_fixture_forwards_baseline_preparation_before_boot(self):
        ctx = Mock()
        ctx.inst.config = {'source': '/candidate', 'published': '', 'replace': {}}
        ctx.inst.evidence.root = Path('/lane/evidence')
        ctx.inst.evidence.label = 'upgrade'
        prepare = Mock()
        with patch('module_lifecycle_contract.isolated_fixture') as isolated:
            with published_fixture(ctx, published_app=True, prepare=prepare):
                pass
        self.assertIs(isolated.call_args.kwargs['prepare'], prepare)
        self.assertIsNone(isolated.call_args.kwargs['config']['source'])
        self.assertEqual(isolated.call_args.kwargs['config']['replace'], {})
        self.assertEqual(isolated.call_args.kwargs['config']['published'], 'latest')

    def test_published_root_manifest_verifies_only_the_declared_module_replacements(self):
        from runtime import Instance
        from harness import Failure
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock()
            inst.app = Path(directory)
            inst.engine = 'sqlite'
            inst.config = {'published': 'latest', 'replace': {'kickside/ui': '/candidate/ui'}}
            (inst.app / 'wippy.lock').write_text(yaml.safe_dump({'modules': [
                {'name': 'kickside/kickside', 'version': '1.0.0', 'root': True}]}))
            config = inst.app / '.wippy.yaml'
            config.write_text(yaml.safe_dump({'workspace': {'include_host_dependencies': True,
                                                           'replacements': inst.config['replace']}}))
            Instance.manifest(inst)
            inst.evidence.save.assert_called_once()
            for workspace in ({'include_host_dependencies': True, 'replacements': {'kickside/users': '/unexpected'}},
                              {'include_host_dependencies': False, 'replacements': inst.config['replace']}):
                config.write_text(yaml.safe_dump({'workspace': workspace}))
                with self.assertRaises(Failure):
                    Instance.manifest(inst)

    def test_candidate_upgrade_keeps_the_database_and_instance_secrets(self):
        from upgrade_regressions import upgrade_application
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            app = root / 'runtime'
            app.mkdir()
            (app / '.wippy').mkdir()
            (app / '.wippy' / 'published-evidence').write_bytes(b'published dependency artifact')
            data = root / 'data'
            data.mkdir()
            (data / 'app.db').write_bytes(b'persisted fixture data')
            ctx = Mock()
            inst = ctx.inst
            inst.app, inst.root = app, root
            inst.config = {'source': None, 'published': 'latest', 'replace': {}}
            inst.db, inst.env = 'same-db', {'ENCRYPTION_KEY': 'same-key'}
            inst.request.return_value = {'dependencies': [{'component': 'kickside/skills', 'id': 'app.deps:skills'}]}
            with patch('upgrade_regressions.Browser.paused', return_value=nullcontext()):
                upgrade_application(ctx, '/candidate', {'kickside/ui': '/candidate/ui'})
            inst.prepare_source.assert_called_once_with(dependencies=inst.request.return_value['dependencies'])
            self.assertEqual(inst.config, {'source': '/candidate', 'published': None,
                                          'replace': {'kickside/ui': '/candidate/ui'}})
            self.assertEqual(inst.db, 'same-db')
            self.assertEqual(inst.env['ENCRYPTION_KEY'], 'same-key')
            self.assertEqual((data / 'app.db').read_bytes(), b'persisted fixture data')
            self.assertEqual((app / '.wippy' / 'published-evidence').read_bytes(), b'published dependency artifact')

    def test_upgrade_baseline_resolves_the_complete_published_app(self):
        ctx = Mock()
        ctx.inst.config = {'source': '/local/app', 'published': '',
                           'replace': {'kickside/ui': '/local/ui', 'kickside/users': '/local/users'}}
        ctx.inst.evidence.root = Path('/lane/evidence')
        ctx.inst.evidence.label = 'upgrade'
        inst = Mock()
        inst.request.return_value = {'automations': []}
        inst.cleanup.run.return_value = []
        with patch('runtime.Instance', return_value=inst) as instance, \
             patch('runtime_fixtures.Context'):
            with published_fixture(ctx, 'kickside/ui', published_app=True):
                pass
        config = instance.call_args.args[0]
        self.assertIsNone(config['source'])
        self.assertEqual(config['published'], 'latest')
        self.assertEqual(config['replace'], {})
        inst.install.assert_not_called()

    def test_restart_preserves_live_root_ids_bindings_and_fixture_sources(self):
        from runtime import Instance
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock()
            inst.app = Path(directory)
            inst.config = {'source': '/candidate', 'published': ''}
            (inst.app / 'src').mkdir()
            fixture = inst.app / 'src' / '_index.yaml'
            fixture.write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'probe', 'kind': 'registry.entry', 'data': {'marker': 'retained'}}]}))
            inst.request.return_value = {'dependencies': [
                {'namespace': 'app.deps', 'name': 'provider', 'component': 'kickside/provider',
                 'is_root': True, 'parameters': [{'name': 'api_router', 'value': 'app:api'}]},
                {'namespace': 'nested', 'name': 'parser', 'component': 'vendor/parser',
                 'is_root': False, 'parameters': []}]}
            Instance.preserve_dependencies(inst)
            declarations = [yaml.safe_load(path.read_text()) for path in (inst.app / 'src').rglob('_index.yaml')]
            exported = [row for row in declarations if row['namespace'] == 'app.deps']
            self.assertEqual(exported, [{'version': '1.0', 'namespace': 'app.deps', 'entries': [
                {'name': 'provider', 'kind': 'ns.dependency', 'component': 'kickside/provider',
                 'version': '*', 'parameters': [{'name': 'api_router', 'value': 'app:api'}]}]}])
            self.assertEqual(yaml.safe_load(fixture.read_text())['entries'][0]['data']['marker'], 'retained')
            inst.resolve_dependencies.assert_not_called()
            self.assertTrue(inst.dependencies_pending)
            inst.resolve_dependencies.reset_mock()
            Instance.preserve_dependencies(inst)
            inst.resolve_dependencies.assert_not_called()
            inst.request.return_value = {'dependencies': []}
            Instance.preserve_dependencies(inst)
            self.assertEqual(list((inst.app / 'src').rglob('_index.yaml')), [fixture])
            inst.resolve_dependencies.assert_not_called()
            self.assertTrue(inst.dependencies_pending)

    def test_start_resolves_preserved_roots_before_launch_and_keeps_failed_resolution_pending(self):
        from runtime import Instance
        from types import SimpleNamespace
        from io import BytesIO
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Instance({'host': '127.0.0.1', 'email': 'member', 'password': 'secret',
                             'model': {}}, 'sqlite', Path(directory))
            inst.app.mkdir()
            inst.dependencies_pending = True
            inst.command = Mock(return_value=['wippy', 'run'])
            inst.login = Mock()
            events = []
            child = Mock(stdout=BytesIO(), pid=123)
            child.poll.return_value = None
            def launch(*args, **kwargs):
                self.assertFalse(inst.dependencies_pending)
                events.append('run')
                return child
            with patch('runtime._dependency_action', side_effect=lambda *args: events.append(args[1])), \
                 patch('runtime.subprocess.Popen', side_effect=launch):
                inst.start()
                inst.log_thread.join(timeout=5)
            self.assertEqual(events, ['update', 'install', 'run'])
            inst.dependencies_pending = True
            with patch('runtime._dependency_action', side_effect=RuntimeError('resolution fails')), \
                 patch('runtime.subprocess.Popen') as popen:
                with self.assertRaisesRegex(RuntimeError, 'resolution fails'):
                    inst.start()
                popen.assert_not_called()
            self.assertTrue(inst.dependencies_pending)

    def test_pause_exports_live_roots_before_stopping_and_keeps_export_failures_visible(self):
        from browser import Browser
        events = []
        inst = Mock()
        inst.cleanup.run.return_value = []
        inst.preserve_dependencies.side_effect = lambda: events.append('preserve')
        inst.stop.side_effect = lambda **kwargs: events.append('stop')
        inst.start.side_effect = lambda: events.append('start')
        inst.await_keeper.side_effect = lambda: events.append('keeper')
        inst.await_current_security_projection.side_effect = lambda label: events.append(label)
        with Browser.paused(inst, [], lambda context, action: action(context)):
            events.append('body')
        self.assertEqual(events, ['preserve', 'stop', 'body', 'start', 'keeper',
                                  'Runtime restart security projection'])
        inst.stop.reset_mock()
        inst.preserve_dependencies.side_effect = RuntimeError('dependency read fails')
        with self.assertRaisesRegex(RuntimeError, 'dependency read fails'):
            with Browser.paused(inst, [], lambda context, action: action(context)):
                self.fail('failed preservation enters the paused body')
        inst.stop.assert_not_called()

    def test_candidate_source_preserves_optional_dependency_ids_and_bindings(self):
        from runtime import Instance
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'candidate'
            app = source / 'app'
            (app / 'src').mkdir(parents=True)
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            (app / 'src' / '_index.yaml').write_text(yaml.safe_dump({
                'namespace': 'app.deps', 'entries': [{'name': 'ui', 'kind': 'ns.dependency',
                    'component': 'kickside/ui', 'version': '*'}]}))
            inst = Mock()
            inst.config = {'source': str(source), 'replace': {}, 'binary': 'wippy'}
            inst.app, inst.env = root / 'runtime', {}
            inst.resolve_dependencies.side_effect = lambda: Instance.resolve_dependencies(inst)
            (inst.app / '.wippy').mkdir(parents=True)
            (inst.app / '.wippy' / 'published-evidence').write_bytes(b'dependency artifact')
            roots = [
                {'id': 'app.deps:ui', 'namespace': 'app.deps', 'name': 'ui',
                 'component': 'kickside/ui', 'is_root': True, 'version': '*', 'parameters': []},
                {'id': 'app.deps:skills', 'namespace': 'app.deps', 'name': 'skills',
                 'component': 'kickside/skills', 'is_root': True, 'version': '*',
                 'parameters': [{'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}]},
                {'id': 'nested:parser', 'namespace': 'nested', 'name': 'parser',
                 'component': 'vendor/parser', 'is_root': False, 'version': '*', 'parameters': []},
            ]
            def resolve(*args, **kwargs):
                declarations = []
                for path in (inst.app / 'src').rglob('_index.yaml'):
                    document = yaml.safe_load(path.read_text())
                    declarations.extend((document['namespace'], e) for e in document['entries'])
                self.assertEqual(len(declarations), 2)
                skill = next(e for ns, e in declarations if e['component'] == 'kickside/skills')
                self.assertEqual(skill, {'name': 'skills', 'kind': 'ns.dependency',
                    'component': 'kickside/skills', 'version': '*', 'parameters': roots[1]['parameters']})
                return Mock(returncode=0, stdout='', stderr='')
            with patch('runtime.subprocess.run', side_effect=resolve):
                Instance.prepare_source(inst, dependencies=roots)
