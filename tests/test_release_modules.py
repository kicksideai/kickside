#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Exercise release failure/recovery with real subprocesses and a fixture registry."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location('release_publisher', SCRIPTS / 'publish-release-modules.py')
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)

FAKE_WIPPY = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
args=sys.argv[1:]; state=pathlib.Path(os.environ['RELEASE_TEST_STATE'])
def option(name): return args[args.index(name)+1]
def record(value):
 with (state/'events').open('a') as f: f.write(json.dumps(value)+'\n')
if 'install' in args:
 if os.environ.get('RELEASE_TEST_INSTALL_ERROR'):
  print('registry authorization failed',file=sys.stderr); sys.exit(1)
 cfg=json.loads(pathlib.Path(option('--config')).read_text())
 lock=json.loads(pathlib.Path(cfg['registry']['dependency_lock_path']).read_text())
 for item in lock['modules']:
  name,version=item['name'],item['version']; stored=state/(name.replace('/','-')+'-'+version)
  if not stored.exists():
   print('failed to download module: '+name+'@'+version+': module not found',file=sys.stderr); sys.exit(1)
  organization,module=name.split('/')
  output=pathlib.Path(cfg['registry']['dependency_vendor_dir'])/organization/(module+'-'+version+'.wapp')
  output.parent.mkdir(parents=True,exist_ok=True); output.write_bytes(stored.read_bytes())
 record({'step':'install'}); sys.exit(0)
if 'pack' in args:
 cfg=json.loads(pathlib.Path(option('--config')).read_text())
 name=option('--module'); directory=pathlib.Path(cfg['workspace']['replacements'][name])
 item=json.loads((directory/'module.json').read_text())
 if item['build'] and not (directory/'built').exists(): raise RuntimeError('frontend was not built')
 lock=json.loads(pathlib.Path(option('--lock-file')).read_text())
 payload=json.dumps({'name':name,'version':lock['modules'][0]['version'],'envelope':'module-pack'}).encode()
 pathlib.Path(args[-1]).write_bytes(payload)
 record({'step':'pack','name':item['name']}); sys.exit(0)
if '--wapp' not in args: raise RuntimeError('publication must use the prepared artifact')
payload=pathlib.Path(option('--wapp')).read_bytes()
item=json.loads(payload)
if item['version'] != option('--version'): raise RuntimeError('wrong version')
stored=state/(item['name'].replace('/','-')+'-'+item['version'])
if stored.exists(): raise RuntimeError('immutable version already exists')
if os.environ.get('RELEASE_TEST_CORRUPT_UPLOAD'): payload += b'changed in transit'
stored.write_bytes(payload); record({'step':'publish','name':item['name']})
'''


class ReleasePublication(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.state = self.root / 'registry'
        self.state.mkdir()
        self.wippy = self.root / 'fixture-wippy'
        self.wippy.write_text(FAKE_WIPPY)
        self.wippy.chmod(0o755)
        self.env = patch.dict(os.environ, {'RELEASE_TEST_STATE': str(self.state)})
        self.env.start()
        self.addCleanup(self.env.stop)
        (self.root / '.gitignore').write_text('registry/\nfixture-wippy\n')
        self.modules = {
            'platform/first': {'path': 'platform/first', 'organization': 'fixture', 'module': 'first',
                               'type': 'library', 'visibility': 'public', 'embed': [], 'targets': []},
            'platform/page': {'path': 'platform/page', 'organization': 'fixture', 'module': 'page',
                              'type': 'plugin', 'visibility': 'public', 'embed': ['fixture.page:ui_fs'], 'targets': ['build']},
        }
        (self.root / '.github').mkdir()
        (self.root / '.github/modules.json').write_text(json.dumps({'modules': self.modules}))
        (self.root / '.release-please-manifest.json').write_text(json.dumps({path: '1.2.3' for path in self.modules}))
        (self.root / 'release-please-config.json').write_text(json.dumps({'packages': {
            path: {'component': module['module']} for path, module in self.modules.items()}}))
        for path, module in self.modules.items():
            directory = self.root / path
            directory.mkdir(parents=True)
            (directory / 'module.json').write_text(json.dumps({'name': 'fixture/' + module['module'],
                                                               'build': 'build' in module['targets']}))
            if 'build' in module['targets']:
                (directory / '.gitignore').write_text('built\n')
                (directory / 'Makefile').write_text('build:\n\t@test "$$RELEASE_TEST_BUILD_ERROR" != 1\n\t@echo built > built\n')
        self.git('init', '-q')
        self.git('add', '.gitignore', '.github', '.release-please-manifest.json', 'release-please-config.json', 'platform')
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-qm', 'release fixture')
        for module in self.modules.values():
            self.git('tag', module['module'] + '-v1.2.3')

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True)

    def run_publication(self, paths=None):
        publisher.publish(self.root, paths if paths is not None else list(self.modules), str(self.wippy))

    def events(self):
        path = self.state / 'events'
        return [json.loads(line) for line in path.read_text().splitlines()] if path.exists() else []

    def test_build_publish_verify_and_resume_without_overwriting(self):
        self.run_publication(['app', 'platform/page', 'platform/first'])
        first = self.events()
        self.assertEqual([event['name'] for event in first if event['step'] == 'publish'], ['fixture/first', 'fixture/page'])
        self.assertTrue((self.root / 'platform/page/built').is_file())
        self.run_publication()
        self.assertEqual(sum(event['step'] == 'publish' for event in self.events()), 2)

    def test_partial_publication_resumes_at_missing_artifact(self):
        self.run_publication(['platform/first'])
        self.run_publication()
        self.assertEqual([event['name'] for event in self.events() if event['step'] == 'publish'], ['fixture/first', 'fixture/page'])

    def test_different_existing_artifact_is_not_overwritten(self):
        occupied = self.state / 'fixture-first-1.2.3'
        occupied.write_bytes(b'previously published bytes')
        with self.assertRaisesRegex(ValueError, 'differs from the prepared release'):
            self.run_publication()
        self.assertEqual(occupied.read_bytes(), b'previously published bytes')
        self.assertFalse(any(event['step'] == 'publish' for event in self.events()))

    def test_build_failure_prevents_that_publication(self):
        with patch.dict(os.environ, {'RELEASE_TEST_BUILD_ERROR': '1'}):
            with self.assertRaises(subprocess.CalledProcessError):
                self.run_publication(['platform/page'])
        self.assertEqual(self.events(), [])

    def test_changed_uploaded_bytes_fail_verification(self):
        with patch.dict(os.environ, {'RELEASE_TEST_CORRUPT_UPLOAD': '1'}):
            with self.assertRaisesRegex(ValueError, 'Published artifact digest differs'):
                self.run_publication(['platform/first'])

    def test_source_changes_prevent_entire_cohort(self):
        (self.root / 'platform/page/module.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'clean checkout'):
            self.run_publication()
        self.assertEqual(self.events(), [])

    def test_untracked_source_prevents_entire_cohort(self):
        (self.root / 'platform/page/unreviewed.lua').write_text('return {}')
        with self.assertRaisesRegex(ValueError, 'clean checkout'):
            self.run_publication()
        self.assertEqual(self.events(), [])

    def test_registry_failure_does_not_become_missing_artifact(self):
        with patch.dict(os.environ, {'RELEASE_TEST_INSTALL_ERROR': 'true'}):
            with self.assertRaises(subprocess.CalledProcessError):
                self.run_publication()
        self.assertFalse(any(event['step'] == 'publish' for event in self.events()))

    def test_mismatched_release_tag_prevents_entire_cohort(self):
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '--allow-empty', '-qm', 'new head')
        with self.assertRaisesRegex(ValueError, 'exact release tag'):
            self.run_publication()
        self.assertEqual(self.events(), [])

    def test_app_only_release_is_left_to_its_own_publisher(self):
        self.run_publication(['app'])
        self.assertEqual(self.events(), [])

    def test_invalid_release_paths_do_not_publish(self):
        for paths in ([], None, 'platform/first', [42]):
            with self.assertRaises(ValueError):
                publisher.publish(self.root, paths, str(self.wippy))
        with self.assertRaises(KeyError):
            self.run_publication(['../unknown'])
        self.assertEqual(self.events(), [])


if __name__ == '__main__':
    unittest.main()
