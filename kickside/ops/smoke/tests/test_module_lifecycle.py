import unittest
import tempfile
from pathlib import Path
from contextlib import nullcontext
from unittest.mock import Mock, patch
import yaml
from harness import Failure

from runtime import Instance
import module_lifecycle_contract as lifecycle


class ModuleLifecycleTests(unittest.TestCase):
    def test_sync_fixture_keeps_installer_authority_and_uses_the_requested_caller(self):
        for caller in (None, 'ordinary-member'):
            with self.subTest(caller=caller):
                ctx = Mock()
                inst = ctx.inst
                inst.token = 'fixture-administrator'
                inst.request.side_effect = [
                    {'automations': []}, {'webhook': {'secret': 'fixture-secret', 'thread_id': 'hook-thread'}},
                    {'id': 'fixture-sync'}, {'config': {}},
                ]
                inst.install.side_effect = lambda module: self.assertEqual(inst.token, 'fixture-administrator')
                lifecycle.sync_fixture(ctx, auth=caller)
                self.assertEqual(inst.token, 'fixture-administrator')
                self.assertEqual([call.kwargs['auth'] for call in inst.request.call_args_list], [caller] * 4)

    def test_published_update_resolves_its_locked_root_without_scanning_local_sources(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            (app / 'src' / '_index.yaml').write_text(yaml.safe_dump({
                'namespace': 'unrelated', 'entries': [{'name': 'library', 'kind': 'ns.dependency',
                    'component': 'example/unrelated', 'version': '*'}]}))
            (app / 'wippy.lock').write_text(yaml.safe_dump({'modules': [
                {'name': 'kickside/kickside', 'version': '1.0.0', 'root': True}]}))
            inst = Mock(app=app, env={}, config={'binary': 'wippy', 'source': None,
                                               'published': 'latest', 'replace': {}})
            with patch('runtime.subprocess.run', return_value=Mock(returncode=0, stdout='', stderr='')) as run:
                Instance.resolve_dependencies(inst, modules=('kickside/ui',))
            self.assertEqual([call.args[0] for call in run.call_args_list], [
                ['wippy', '--config', '.wippy.yaml', 'update', 'kickside/ui'],
                ['wippy', '--config', '.wippy.yaml', 'install']])

    def test_sync_fixture_installs_its_capabilities_and_requires_an_empty_baseline(self):
        ctx = Mock()
        inst = ctx.inst
        inst.request.side_effect = [
            {'automations': []}, {'webhook': {'secret': 'fixture-secret', 'thread_id': 'hook-thread'}},
            {'id': 'fixture-sync'}, {'config': {}},
        ]
        lifecycle.sync_fixture(ctx)
        self.assertEqual([call.args[0] for call in inst.install.call_args_list],
                         ['kickside/automation', 'kickside/inbox', 'kickside/webhooks', 'chestor/workspace'])
        inst.request.side_effect = [{'automations': [{'type': lifecycle.TYPE}]}]
        with self.assertRaisesRegex(Failure, 'starts with live Sync data'):
            lifecycle.sync_fixture(ctx)

    def test_module_update_refreshes_the_selected_module_and_retains_other_locked_dependencies(self):
        ctx = Mock()
        inst = ctx.inst
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, app = root / 'module', root / 'app'
            source.mkdir()
            app.mkdir()
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            (app / 'wippy.lock').write_text(yaml.safe_dump({'modules': [
                {'name': 'kickside/ui', 'version': '2.0.0'},
                {'name': 'chestor/workspace', 'version': '1.0.0'},
            ]}))
            inst.app, inst.env = app, {}
            inst.config = {'binary': 'wippy', 'replace': {}}
            inst.resolve_dependencies.side_effect = lambda *args, **kwargs: Instance.resolve_dependencies(inst, *args, **kwargs)
            dep = {'entries': [{'module': 'kickside/ui', 'module_version': '2.0.0'}]}
            with patch('browser.Browser.paused', return_value=nullcontext()), \
                    patch('subprocess.run', return_value=Mock(returncode=0, stdout='', stderr='')) as run, \
                    patch('module_lifecycle_contract.install_latest', return_value=dep):
                lifecycle.update_source(ctx, str(source), module='kickside/ui')
            self.assertEqual(run.call_args_list[0].args[0],
                             ['wippy', '--config', '.wippy.yaml', 'update', '--src-dir', '.', 'kickside/ui'])
            self.assertEqual(run.call_args_list[1].args[0],
                             ['wippy', '--config', '.wippy.yaml', 'install'])

    def test_source_update_resolves_fresh_before_restarting_the_installed_app(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, app = root / 'module', root / 'app'
            source.mkdir()
            app.mkdir()
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            lock_path = app / 'wippy.lock'
            lock_path.write_text(yaml.safe_dump({'modules': [{'name': 'kickside/ui', 'version': '1.0.0'}], 'replacements': []}))
            ctx = Mock()
            inst = ctx.inst
            inst.app, inst.env = app, {}
            inst.config = {'binary': 'wippy', 'replace': {}}
            inst.resolve_dependencies.side_effect = lambda **kwargs: Instance.resolve_dependencies(inst, **kwargs)
            def resolve(command, **kwargs):
                self.assertEqual(kwargs['cwd'], app)
                config = yaml.safe_load((app / '.wippy.yaml').read_text())
                self.assertEqual(config['workspace']['replacements'], {'kickside/ui': str(source)})
                lock_path.write_text(yaml.safe_dump({'modules': [{'name': 'kickside/ui', 'version': '2.0.0'}]}))
                return Mock(returncode=0, stdout='', stderr='')
            dep = {'entries': [{'module': 'kickside/ui', 'module_version': '2.0.0'}]}
            with patch('browser.Browser.paused', return_value=nullcontext()), \
                    patch('subprocess.run', side_effect=resolve) as run, \
                    patch('module_lifecycle_contract.install_latest', return_value=dep):
                lifecycle.update_source(ctx, str(source), module='kickside/ui')
            self.assertEqual([call.args[0] for call in run.call_args_list], [
                ['wippy', '--config', '.wippy.yaml', 'update', '--src-dir', '.', 'kickside/ui'],
                ['wippy', '--config', '.wippy.yaml', 'install']])

    def test_latest_install_keeps_a_wildcard_declaration(self):
        inst = Mock()
        dep = {'version': '*', 'entries': [{'module': lifecycle.MODULE, 'module_version': '0.1.74'}]}
        inst.request.side_effect = [
            {'dependencies': []},
            {'install_payload': {'component': lifecycle.MODULE, 'version': '*'}, 'requirements': []},
            {'execution': []}, {'dependencies': [dict(dep, component=lifecycle.MODULE)]},
        ]
        self.assertEqual(lifecycle.install_latest(inst, '0.1.74'), dep | {'component': lifecycle.MODULE})
        calls = inst.request.call_args_list
        self.assertEqual(calls[0].args[:2], ('GET', lifecycle.HUB + '?entries=1&migrations=1'))
        self.assertEqual(calls[1].args[2]['version'], '*')
        self.assertEqual(calls[2].args[2]['version'], '*')

    def test_latest_baseline_does_not_require_an_older_release(self):
        inst = Mock()
        inst.request.return_value = {'items': [{'version': '0.1.74'}]}
        self.assertEqual(lifecycle.latest_version(inst), '0.1.74')
