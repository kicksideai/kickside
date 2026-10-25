import json
from types import SimpleNamespace
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from scenarios_published_installation_update import (
    materialize_application_update_sources,
    prepare_published_deployment,
    published_installation_update,
)


class PublishedDeploymentTests(unittest.TestCase):
    def test_application_update_leaves_optional_candidate_bytes_published(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            app = root / 'source/app'
            app_source = app / 'src'
            app_source.mkdir(parents=True)
            (app / 'wippy.yaml').write_text(yaml.safe_dump({
                'organization': 'kickside', 'module': 'kickside', 'type': 'application',
                'directories': {'src': 'src'},
            }))
            (app_source / '_index.yaml').write_text(yaml.safe_dump({
                'namespace': 'app', 'entries': [
                    {'name': 'core', 'kind': 'ns.dependency', 'component': 'kickside/core'},
                ],
            }))
            candidates = {}
            for module, dependencies in {
                'kickside/core': (),
                'kickside/mcp': (),
            }.items():
                module_root = root / module.replace('/', '_')
                module_source = module_root / 'src'
                module_source.mkdir(parents=True)
                (module_root / 'wippy.yaml').write_text(yaml.safe_dump({'directories': {'src': 'src'}}))
                (module_source / '_index.yaml').write_text(yaml.safe_dump({
                    'namespace': module.replace('/', '.'),
                    'entries': [
                        {'name': 'dependency-' + str(index), 'kind': 'ns.dependency', 'component': dependency}
                        for index, dependency in enumerate(dependencies)
                    ],
                }))
                (module_source / 'marker.txt').write_text('candidate-' + module)
                candidates[module] = str(module_root)

            published = {}
            for module in candidates:
                published_root = root / 'published' / module.replace('/', '_')
                published_source = published_root / 'src'
                published_source.mkdir(parents=True)
                (published_root / 'wippy.yaml').write_text(yaml.safe_dump({
                    'organization': 'kickside', 'module': module.split('/')[1],
                    'version': '0.1.54' if module == 'kickside/mcp' else '0.1.0',
                }, sort_keys=False))
                (published_source / 'marker.txt').write_text('published-' + module)
                published[module] = str(published_root)

            selected = materialize_application_update_sources(published, candidates, root / 'source')

            self.assertEqual(selected, {
                'kickside/kickside': str(app),
                'kickside/core': candidates['kickside/core'],
            })
            self.assertEqual((Path(published['kickside/core']) / 'src/marker.txt').read_text(),
                             'candidate-kickside/core')
            self.assertEqual((Path(published['kickside/mcp']) / 'src/marker.txt').read_text(),
                             'published-kickside/mcp')
            self.assertEqual(yaml.safe_load((Path(published['kickside/mcp']) / 'wippy.yaml').read_text())['version'],
                             '0.1.54')

    def test_published_boot_keeps_the_normal_installation_selector_and_overrides(self):
        from runtime import Instance
        inst = Instance.__new__(Instance)
        inst.config = {'binary': '/runtime/wippy', 'published': '1.0.0'}
        inst.engine, inst.root = 'sqlite', Path('/lane/instance')
        inst.port, inst.base, inst.email, inst.password = 18085, 'http://127.0.0.1:18085', 'member', 'secret'
        command = inst.command()
        self.assertEqual(command[4], 'kickside/kickside@1.0.0')
        self.assertNotIn('--strict-linking', command)
        self.assertIn('vars.local_sqlite_file=/lane/instance/data/app.db', command)
        self.assertIn('quickstart', command)
        self.assertIn('sqlite', command)

    def test_loads_verified_packs_with_the_installed_graph_and_root_ownership(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock()
            inst.app = Path(directory)
            inst.config = {'source': None, 'published': '1.0.0', 'replace': {}}
            baseline = {'acme/app': {'version': '1.0.0', 'hash': 'root-digest'},
                        'acme/member': {'version': '2.0.0', 'hash': 'member-digest'},
                        'acme/optional': {'version': '3.0.0', 'hash': 'optional-digest'}}
            packs = {
                'acme/app': {'version': '1.0.0', 'sha256': 'root-digest', 'entries': {
                    'app:member': {'Kind': 'ns.dependency', 'Data': {'component': 'acme/member'}},
                    'app:deployment': {'Kind': 'ns.requirement', 'Data': {}}}},
                'acme/member': {'version': '2.0.0', 'sha256': 'member-digest', 'entries': {
                    'member:policy': {'Kind': 'security.policy', 'Data': {}}}},
                'acme/optional': {'version': '3.0.0', 'sha256': 'optional-digest', 'entries': {}},
            }
            def fetch(module, work, locked=None):
                self.assertEqual(locked, baseline[module])
                (work / 'baseline.wapp').write_bytes(module.encode())
                return packs[module]
            with patch('ops.compat.fetch_baselines.Hub') as hub:
                hub.return_value.fetch.side_effect = fetch
                receipts = prepare_published_deployment(inst, baseline, root='acme/app')
            self.assertEqual(set(receipts), set(baseline))
            lock = yaml.safe_load((inst.app / 'wippy.lock').read_text())
            self.assertEqual([row['name'] for row in lock['modules'] if row.get('root')], ['acme/app'])
            self.assertNotIn('replacements', lock)
            self.assertFalse((inst.app / 'src').exists())
            for module, receipt in receipts.items():
                self.assertEqual(receipt['version'], baseline[module]['version'])
                path = inst.app / '.wippy/vendor' / (module + '-' + receipt['version'] + '.wapp')
                self.assertEqual(path.read_bytes(), module.encode())

    def test_historical_fixture_preserves_published_host_dependency_ownership(self):
        class Prepared(Exception):
            pass
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            app = root / 'runtime'
            app.mkdir()
            inst = Mock(root=root, app=app, config={})
            ctx = SimpleNamespace(inst=SimpleNamespace(config={'replace': {'kickside/core': '/candidate/core'}}))
            documents = []
            def source(path, *args, **kwargs):
                path.mkdir()
                (path / '.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0', 'workspace': {'replacements': {}}}))
                return {}
            def deployment(*args, **kwargs):
                documents.append(yaml.safe_load((app / '.wippy.yaml').read_text()))
                return {}
            def isolated(*args, prepare, **kwargs):
                class Fixture:
                    def __enter__(self):
                        prepare(SimpleNamespace(inst=inst))
                        documents.append(yaml.safe_load((app / '.wippy.yaml').read_text()))
                        raise Prepared()
                    def __exit__(self, *args):
                        return False
                return Fixture()
            with patch('scenarios_published_installation_update.published_source', side_effect=source), \
                 patch('scenarios_published_installation_update.prepare_published_deployment', side_effect=deployment), \
                 patch('scenarios_published_installation_update.isolated_fixture', isolated):
                with self.assertRaises(Prepared):
                    published_installation_update(ctx)
            self.assertTrue((app / 'src').is_dir())
            self.assertEqual(len(documents), 2)
            for document in documents:
                self.assertIs(document.get('workspace', {}).get('include_host_dependencies'), True)
            self.assertEqual(documents[1]['workspace']['replacements'], inst.config['replace'])

    def test_archive_verification_failure_prevents_writing_a_deployment_lock(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory))
            with patch('ops.compat.fetch_baselines.Hub') as hub:
                hub.return_value.fetch.side_effect = ValueError('Hub artifact digest mismatch')
                with self.assertRaisesRegex(ValueError, 'digest mismatch'):
                    prepare_published_deployment(inst, {'acme/app': {'version': '1.0.0'}}, root='acme/app')
            self.assertFalse((inst.app / 'wippy.lock').exists())
