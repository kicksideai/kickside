"""Fresh harness dependency closure and core capability ownership."""
import importlib.util
import os
import re
import subprocess
from pathlib import Path
import tempfile
import unittest
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
SPEC = importlib.util.spec_from_file_location('harness_closure', ROOT / 'scripts/check-harness-closure.py')
CLOSURE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CLOSURE)


class HarnessClosureTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(dir=ROOT / 'tests')
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.modules = {}
        for name, dependencies in [('consumer', ['kickside/middle']), ('middle', ['kickside/leaf']), ('leaf', ['wippy/test'])]:
            module = self.root / 'core' / name
            (module / 'src').mkdir(parents=True)
            (module / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'kickside', 'module': name}))
            (module / 'src/_index.yaml').write_text(yaml.safe_dump({'entries': [
                {'kind': 'ns.dependency', 'component': dependency} for dependency in dependencies]}))
            self.modules['kickside/' + name] = module
        self.harness = self.modules['kickside/consumer'] / 'test'
        self.harness.mkdir()
        (self.harness / 'src').mkdir()
        (self.harness / 'src/_index.yaml').write_text(yaml.safe_dump({'entries': [
            {'kind': 'ns.dependency', 'component': 'kickside/consumer'}]}))

    def configure(self, names, versions=None):
        config = self.harness / '.wippy.yaml'
        config.write_text(yaml.safe_dump({'workspace': {'replacements': {
            name: os.path.relpath(self.modules[name], self.harness) for name in names}}}))
        (self.harness / 'wippy.lock').write_text(yaml.safe_dump({'modules': [
            {'name': name, 'version': (versions or {}).get(name, '0.0.0')} for name in names]}))
        return config

    def test_transitive_local_dependency_is_required(self):
        config = self.configure(['kickside/consumer', 'kickside/middle'])
        errors = CLOSURE.check_harness(self.root, config)
        self.assertTrue(any('kickside/leaf' in error and 'replacement' in error for error in errors), errors)

    def test_local_lock_requires_zero_version_without_hub_hash(self):
        config = self.configure(self.modules, {'kickside/leaf': '1.0.0'})
        errors = CLOSURE.check_harness(self.root, config)
        self.assertTrue(any('kickside/leaf' in error and '0.0.0' in error for error in errors), errors)
        self.configure(self.modules)
        lock = self.harness / 'wippy.lock'
        data = yaml.safe_load(lock.read_text())
        data['modules'][0]['hash'] = 'cached-hub-hash'
        lock.write_text(yaml.safe_dump(data))
        self.assertTrue(any('hash' in error for error in CLOSURE.check_harness(self.root, config)))

    def test_complete_local_closure_keeps_external_dependencies_on_hub(self):
        config = self.configure(self.modules)
        self.assertEqual([], CLOSURE.check_harness(self.root, config))

    def test_wrong_module_replacement_is_rejected(self):
        config = self.configure(self.modules)
        data = yaml.safe_load(config.read_text())
        data['workspace']['replacements']['kickside/leaf'] = '../..'
        config.write_text(yaml.safe_dump(data))
        self.assertTrue(CLOSURE.check_harness(self.root, config))

    def test_core_dependency_on_platform_is_rejected(self):
        self.modules['kickside/leaf'].rename(self.root / 'platform-leaf')
        (self.root / 'platform').mkdir()
        (self.root / 'platform-leaf').rename(self.root / 'platform/leaf')
        self.assertTrue(any('core' in error and 'platform' in error for error in CLOSURE.check_ownership(self.root)))

    def test_harness_manifest_selects_root_registry_sources(self):
        config = self.configure([])
        (self.harness / 'wippy.yaml').write_text(yaml.safe_dump({
            'organization': 'kickside', 'module': 'test', 'directories': {'src': '.'}}))
        (self.harness / '_index.yaml').write_text(yaml.safe_dump({'entries': [
            {'kind': 'ns.dependency', 'component': 'kickside/leaf'}]}))
        self.assertTrue(any('kickside/leaf' in error for error in CLOSURE.check_harness(self.root, config)))

    def test_harness_root_sources_without_manifest_directories(self):
        config = self.configure([])
        (self.harness / 'src/_index.yaml').unlink()
        (self.harness / 'src').rmdir()
        (self.harness / 'wippy.yaml').write_text(yaml.safe_dump({
            'organization': 'kickside', 'module': 'test'}))
        (self.harness / '_index.yaml').write_text(yaml.safe_dump({'entries': [
            {'kind': 'ns.dependency', 'component': 'kickside/leaf'}]}))
        self.assertTrue(any('kickside/leaf' in error for error in CLOSURE.check_harness(self.root, config)))

    def test_skills_converter_replacement_reaches_the_sibling_repository(self):
        config = yaml.safe_load((ROOT / 'platform/skills/test/.wippy.yaml').read_text())
        with tempfile.TemporaryDirectory(dir=ROOT / 'tests') as directory:
            checkout = Path(directory) / 'land/kickside_kickside'
            harness = checkout / 'platform/skills/test'
            harness.mkdir(parents=True)
            sibling = checkout.parent / 'converters/doc2md'
            sibling.mkdir(parents=True)
            (sibling / 'wippy.yaml').write_text(
                'organization: kickside\nmodule: doc2md\ntype: plugin\n')
            target = (harness / config['workspace']['replacements']['kickside/doc2md']).resolve()
            manifest = yaml.safe_load((target / 'wippy.yaml').read_text())
            self.assertEqual(manifest['organization'] + '/' + manifest['module'], 'kickside/doc2md')

    def test_unused_replacements_do_not_require_locked_dependencies(self):
        unused = self.root / 'core/unused'
        (unused / 'src').mkdir(parents=True)
        (unused / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'kickside', 'module': 'unused'}))
        (unused / 'src/_index.yaml').write_text(yaml.safe_dump({'entries': []}))
        self.modules['kickside/unused'] = unused
        config = self.configure(self.modules)
        lock = self.harness / 'wippy.lock'
        data = yaml.safe_load(lock.read_text())
        data['modules'] = [row for row in data['modules'] if row['name'] != 'kickside/unused']
        lock.write_text(yaml.safe_dump(data))
        self.assertEqual([], CLOSURE.check_harness(self.root, config))

    def test_linked_directories_do_not_declare_harness_dependencies(self):
        extra = self.root / 'core/extra'
        (extra / 'src').mkdir(parents=True)
        (extra / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'kickside', 'module': 'extra'}))
        (extra / 'src/_index.yaml').write_text(yaml.safe_dump({'entries': []}))
        linked_source = self.root / 'linked-source'
        linked_source.mkdir()
        (linked_source / '_index.yaml').write_text(yaml.safe_dump({'entries': [
            {'kind': 'ns.dependency', 'component': 'kickside/extra'},
        ]}))
        (self.harness / 'src' / 'linked_source').symlink_to(linked_source.resolve(), target_is_directory=True)
        config = self.configure(self.modules)
        self.assertEqual([], CLOSURE.check_harness(self.root, config))

    def test_nested_packages_own_their_harnesses(self):
        example = self.modules['kickside/consumer'] / 'examples/another'
        (example / 'test').mkdir(parents=True)
        (example / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'example', 'module': 'another'}))
        (example / 'test/.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0'}))
        self.assertNotIn(example / 'test/.wippy.yaml', list(CLOSURE.harness_configs(self.root)))

    def test_application_harness_discovery_does_not_depend_on_directory_name(self):
        harness = self.modules['kickside/consumer'] / 'analysis'
        harness.mkdir()
        (harness / 'wippy.yaml').write_text(yaml.safe_dump({
            'organization': 'kickside', 'module': 'analysis', 'type': 'application'}))
        (harness / '.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0'}))
        self.assertIn(harness / '.wippy.yaml', list(CLOSURE.harness_configs(self.root)))

    def test_lockrefresh_honors_each_harness_source_root(self):
        for module in CLOSURE.module_dirs(ROOT):
            harness = module / 'test'
            makefile = module / 'Makefile'
            if not (harness / '.wippy.yaml').is_file() or not makefile.is_file() or not re.search(r'^lockrefresh:', makefile.read_text(), re.M):
                continue
            manifest = yaml.safe_load((harness / 'wippy.yaml').read_text())
            source = manifest.get('directories', {}).get('src') or ('src' if (harness / 'src').is_dir() else '.')
            with self.subTest(module=str(module.relative_to(ROOT))):
                output = subprocess.check_output(['make', '-n', 'lockrefresh', 'WIPPY_UPDATE_ARGS=--src-dir ' + source],
                    cwd=module, text=True)
                updates = [line for line in output.splitlines() if 'wippy update' in line]
                self.assertTrue(updates, output)
                self.assertIn('--src-dir ' + source, updates[0])

    def test_repository_closure_and_ownership(self):
        self.assertEqual([], CLOSURE.check_repository(ROOT))


if __name__ == '__main__':
    unittest.main()
