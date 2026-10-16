import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from runtime import Instance


class RestartRootsTests(unittest.TestCase):
    def test_published_runtime_includes_installed_host_dependencies_in_its_locked_graph(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            replacements = {'example/provider': '/local/provider'}
            inst = Instance({'host': '127.0.0.1', 'email': 'member', 'password': 'secret', 'model': {},
                             'source': '', 'published': '0.2.10', 'replace': replacements},
                            'sqlite', Path(directory) / 'instance')
            inst.prepare()
            config = yaml.safe_load((inst.app / '.wippy.yaml').read_text())
            self.assertTrue(config['workspace']['include_host_dependencies'])
            self.assertEqual(config['workspace']['replacements'], replacements)

    def test_restart_does_not_redeclare_dependencies_embedded_in_locked_root_packs(self):
        from runtime import write_dependency_roots
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            app = Path(directory)
            (app / 'wippy.lock').write_text(yaml.safe_dump({'modules': [
                {'name': 'example/app', 'version': '1.0.0', 'root': True},
                {'name': 'example/provider', 'version': '1.0.0'}]}))
            baseline = {'component': 'example/baseline', 'namespace': 'app.deps', 'name': 'baseline',
                        'is_root': True, 'parameters': []}
            optional = {'component': 'example/provider', 'namespace': 'installed', 'name': 'provider',
                        'is_root': True, 'parameters': []}
            pack = app / '.wippy/vendor/example/app-1.0.0.wapp'
            pack.parent.mkdir(parents=True)
            pack.write_bytes(b'root-pack')
            with patch('ops.compat.fetch_baselines.read_pack', return_value={
                    'app.deps:baseline': {'Kind': 'ns.dependency', 'Data': {'component': 'example/baseline'}}}) as read:
                self.assertTrue(write_dependency_roots(app, [baseline, optional]))
                read.assert_called_once_with(pack)
            entries = [entry for path in app.rglob('_index.yaml')
                       for entry in yaml.safe_load(path.read_text())['entries']]
            self.assertEqual([entry['component'] for entry in entries], ['example/provider'])

    def test_each_deployment_preserves_installed_roots_and_parameters_once(self):
        for published in ('', '0.2.10'):
            with self.subTest(published=published), tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                inst = Mock(app=Path(directory), config={'published': published})
                dependencies = [
                    {'namespace': 'installed', 'name': 'provider', 'component': 'example/provider',
                     'is_root': True, 'parameters': [{'name': 'scope', 'value': 'app:members'}]},
                    {'namespace': 'nested', 'name': 'parser', 'component': 'example/parser',
                     'is_root': False, 'parameters': []}]
                inst.request.return_value = {'dependencies': dependencies}
                Instance.preserve_dependencies(inst)
                declarations = [yaml.safe_load(path.read_text()) for path in inst.app.rglob('_index.yaml')]
                self.assertEqual(declarations, [{'version': '1.0', 'namespace': 'installed', 'entries': [
                    {'name': 'provider', 'kind': 'ns.dependency', 'component': 'example/provider',
                     'version': '*', 'parameters': dependencies[0]['parameters']}]}])
                inst.resolve_dependencies.assert_called_once_with()
                inst.resolve_dependencies.reset_mock()
                Instance.preserve_dependencies(inst)
                inst.resolve_dependencies.assert_not_called()
