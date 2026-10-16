import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from runtime import Instance


class SourceResolutionTests(unittest.TestCase):
    def test_disposable_source_resolves_without_the_repository_lock(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'source'
            app = source / 'app'
            (app / 'src').mkdir(parents=True)
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            lock = app / 'wippy.lock'
            lock.write_text('modules:\n  - name: vendor/control\n    version: 9.0.0\n')
            inst = Mock()
            inst.app = root / 'runtime'
            inst.config = {'source': str(source), 'replace': {'vendor/control': '/local/control'}}

            def resolve():
                self.assertFalse((inst.app / 'wippy.lock').exists())
                config = yaml.safe_load((inst.app / '.wippy.yaml').read_text())
                self.assertEqual(config['workspace']['replacements'], inst.config['replace'])

            inst.resolve_dependencies.side_effect = resolve
            Instance.prepare_source(inst)
            inst.resolve_dependencies.assert_called_once_with()
            self.assertIn('version: 9.0.0', lock.read_text())


class ExistingLockSourceResolutionTests(unittest.TestCase):
    def test_source_transition_rebuilds_a_prior_published_root_lock(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'source'
            app = source / 'app'
            (app / 'src').mkdir(parents=True)
            (app / '.wippy.yaml').write_text('version: "1.0"\n')
            inst = Mock()
            inst.app = root / 'runtime'
            inst.app.mkdir()
            (inst.app / 'wippy.lock').write_text('modules:\n  - name: sample/application\n    root: true\n')
            inst.config = {'source': str(source), 'replace': {}}
            inst.resolve_dependencies.side_effect = lambda: self.assertFalse((inst.app / 'wippy.lock').exists())
            Instance.prepare_source(inst)
            inst.resolve_dependencies.assert_called_once_with()

    def test_manifest_source_supersedes_the_published_fixture_lock_root(self):
        import subprocess
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'src').mkdir()
            (root / 'wippy.yaml').write_text('directories:\n  src: ./src\n')
            (root / 'wippy.lock').write_text('directories:\n  src: .\n')
            inst = Mock()
            inst.app = root
            inst.config = {'binary': '/runtime/wippy'}
            inst.env = {}
            completed = subprocess.CompletedProcess([], 0, '', '')
            with patch('runtime.subprocess.run', return_value=completed) as run:
                Instance.resolve_dependencies(inst, modules=('vendor/optional',))
            update = run.call_args_list[0].args[0]
            self.assertEqual(update, ['/runtime/wippy', '--config', '.wippy.yaml', 'update',
                                      '--src-dir', './src', 'vendor/optional'])
            self.assertEqual(run.call_args_list[1].args[0],
                             ['/runtime/wippy', '--config', '.wippy.yaml', 'install'])
            self.assertEqual((root / 'wippy.lock').read_text(), 'directories:\n  src: .\n')


class RunResolutionReuseTests(unittest.TestCase):
    def test_same_inputs_share_a_lock_across_engines_and_changed_replacements_resolve_again(self):
        import subprocess
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            replacement = root / 'replacement'
            (replacement / 'src').mkdir(parents=True)
            declaration = replacement / 'src/_index.yaml'
            declaration.write_text('namespace: fixture\nentries: []\n')
            config = {'source': '', 'replace': {'fixture/module': str(replacement)},
                      'binary': '/runtime/wippy', 'resolution_cache': str(root / 'resolution'),
                      'host': '127.0.0.1', 'email': 'fixture', 'password': 'fixture', 'model': {}}
            instances = []
            for engine in ('sqlite', 'postgres'):
                inst = Instance(config, engine, root / engine)
                inst.app.mkdir(parents=True)
                (inst.app / 'wippy.yaml').write_text('directories: {src: src}\n')
                (inst.app / '.wippy.yaml').write_text('version: "1.0"\n')
                (inst.app / 'src').mkdir()
                def resolve(inst=inst):
                    (inst.app / 'wippy.lock').write_text('modules: []\n')
                inst.resolve_dependencies = Mock(side_effect=resolve)
                instances.append(inst)
            with patch('runtime.subprocess.run', return_value=subprocess.CompletedProcess([], 0, '', '')) as run:
                for inst in instances:
                    Instance._resolve_source_dependencies(inst)
                instances[0].resolve_dependencies.assert_called_once_with()
                instances[1].resolve_dependencies.assert_not_called()
                self.assertEqual((instances[1].app / 'wippy.lock').read_text(), 'modules: []\n')
                self.assertEqual(run.call_args.args[0], ['/runtime/wippy', '--config', '.wippy.yaml', 'install'])
                declaration.write_text('namespace: fixture\nentries: [{name: dependency, kind: ns.dependency}]\n')
                Instance._resolve_source_dependencies(instances[1])
                instances[1].resolve_dependencies.assert_called_once_with()
