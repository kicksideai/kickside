#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Resolve Release Please tags even when the workflow checkout is older."""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_TRAILER = 'Hub-Artifact-Manifest-SHA256'
MANIFEST_DIGEST = 'a' * 64


class ReleaseCommit(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.git('init', '-q')
        self.git('config', 'user.name', 'Test')
        self.git('config', 'user.email', 'test@example.test')
        self.git('commit', '--allow-empty', '-qm', 'trigger')
        self.trigger = self.git('rev-parse', 'HEAD')
        self.tag_release()
        self.outputs = {
            'paths_released': json.dumps(['core/component', 'platform/uploads', 'app']),
            'core/component--tag_name': 'component-v1.2.3',
            'platform/uploads--tag_name': 'uploads-v2.3.4',
            'app--tag_name': 'kickside-v3.4.5',
        }
        self.output = self.root / 'github-output'

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True).strip()

    def tag_release(self, *trailers):
        message = 'release'
        if trailers:
            message += '\n\n' + '\n'.join(trailers)
        self.release = self.git('commit-tree', 'HEAD^{tree}', '-p', 'HEAD', '-m', message)
        self.git('tag', '-f', 'component-v1.2.3', self.release)
        self.git('tag', '-fa', 'uploads-v2.3.4', self.release, '-m', 'uploads release')
        self.git('tag', '-f', 'kickside-v3.4.5', self.release)

    def resolve(self):
        return subprocess.run([sys.executable, str(ROOT / 'scripts/resolve-release-commit.py'),
                               '--repository', str(self.root)], capture_output=True, text=True,
                              env={**os.environ, 'RELEASE_OUTPUTS_JSON': json.dumps(self.outputs),
                                   'GITHUB_OUTPUT': str(self.output)})

    def assert_resolution(self, publication):
        result = self.resolve()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.output.read_text(), f'released_commit={self.release}\npublication={publication}\n')

    def test_cohort_outputs_release_commit_instead_of_trigger_commit(self):
        self.assert_resolution('hosted')
        self.assertEqual(self.git('rev-parse', 'HEAD'), self.trigger)
        self.assertNotEqual(self.trigger, self.release)

    def test_exact_tagged_commit_can_opt_the_cohort_into_qualified_publication(self):
        self.tag_release(f'{MANIFEST_TRAILER}: {MANIFEST_DIGEST}')
        self.assert_resolution('qualified')
        self.assertEqual(self.git('rev-parse', 'HEAD'), self.trigger)

    def test_trailer_on_workflow_checkout_does_not_opt_in_the_tagged_commit(self):
        self.git('commit', '--allow-empty', '-qm', f'trigger\n\n{MANIFEST_TRAILER}: {MANIFEST_DIGEST}')
        self.assert_resolution('hosted')

    def test_malformed_manifest_digest_refuses_resolution(self):
        for value in ('not-a-digest', 'g' * 64, 'a' * 63):
            with self.subTest(value=value):
                self.tag_release(f'{MANIFEST_TRAILER}: {value}')
                result = self.resolve()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(MANIFEST_TRAILER, result.stderr)
                self.assertFalse(self.output.exists())

    def test_duplicate_manifest_trailer_refuses_resolution(self):
        trailer = f'{MANIFEST_TRAILER}: {MANIFEST_DIGEST}'
        self.tag_release(trailer, trailer)
        result = self.resolve()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(MANIFEST_TRAILER, result.stderr)
        self.assertFalse(self.output.exists())

    def test_manual_app_publish_requires_hosted_mode(self):
        app = self.root / 'app'
        app.mkdir()
        shutil.copy(ROOT / 'app/Makefile', app)
        (app / 'version.txt').write_text('3.4.5\n')
        scripts = self.root / 'scripts'
        scripts.mkdir()
        for script in ('resolve-release-commit.py', 'release_artifacts.py'):
            shutil.copy(ROOT / 'scripts' / script, scripts)
        wippy = self.root / 'fixture-wippy'
        called = self.root / 'wippy-called'
        wippy.write_text(f'#!{sys.executable}\nfrom pathlib import Path\n'
                         'Path(__file__).with_name("wippy-called").touch()\n')
        wippy.chmod(0o755)
        self.git('add', 'app', 'scripts')
        for qualified in (False, True):
            with self.subTest(qualified=qualified):
                message = 'application release'
                if qualified:
                    message += f'\n\n{MANIFEST_TRAILER}: {MANIFEST_DIGEST}'
                self.git('commit', '--allow-empty', '-qm', message)
                self.git('tag', '-f', 'kickside-v3.4.5')
                result = subprocess.run(['make', '-o', 'release-build', '-C', str(app), 'release-publish',
                                         f'WIPPY={wippy}'], capture_output=True, text=True)
                if qualified:
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('requires qualified publication with --evidence', result.stderr)
                    self.assertFalse(called.exists())
                else:
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertTrue(called.exists())
                    called.unlink()

    def test_app_only_release_outputs_its_tag_commit(self):
        self.outputs['paths_released'] = '["app"]'
        self.assert_resolution('hosted')

    def test_module_only_release_ignores_unreleased_tags(self):
        self.outputs['paths_released'] = '["core/component", "platform/uploads"]'
        self.git('tag', 'old-app', self.trigger)
        self.outputs['app--tag_name'] = 'old-app'
        self.assert_resolution('hosted')

    def test_different_tag_commits_refuse_entire_cohort(self):
        for path, tag in (('platform/uploads', 'old-uploads'), ('app', 'old-app')):
            with self.subTest(path=path):
                self.git('tag', tag, self.trigger)
                original = self.outputs[path + '--tag_name']
                self.outputs[path + '--tag_name'] = tag
                result = self.resolve()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Released tags must point to one commit', result.stderr)
                self.assertFalse(self.output.exists())
                self.outputs[path + '--tag_name'] = original

    def test_missing_tag_output_refuses_resolution(self):
        del self.outputs['platform/uploads--tag_name']
        result = self.resolve()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('platform/uploads--tag_name', result.stderr)
        self.assertFalse(self.output.exists())

    def test_missing_git_tag_refuses_resolution(self):
        self.outputs['platform/uploads--tag_name'] = 'missing-v1.0.0'
        result = self.resolve()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('refs/tags/missing-v1.0.0', result.stderr)
        self.assertFalse(self.output.exists())

    def test_invalid_paths_refuse_resolution(self):
        for paths in ([], None, 'core/component', [42]):
            with self.subTest(paths=paths):
                self.outputs['paths_released'] = json.dumps(paths)
                result = self.resolve()
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Release Please must supply the released paths', result.stderr)
                self.assertFalse(self.output.exists())


class ReleaseWorkflow(unittest.TestCase):
    def test_publishers_check_out_the_resolved_release_commit(self):
        workflow = (ROOT / '.github/workflows/release.yml').read_text()
        jobs = dict(re.findall(r'(?ms)^  ([\w-]+):\n(.*?)(?=^  [\w-]+:|\Z)', workflow))
        for name in ('publish-modules', 'publish-app'):
            with self.subTest(job=name):
                checkout = re.search(r'uses: actions/checkout@[^\n]+\n(.*?)(?=\n    -|\Z)', jobs[name], re.DOTALL)
                self.assertIsNotNone(checkout)
                self.assertIn('fetch-depth: 0', checkout[1])
                self.assertIn('ref: ${{ needs.release-please.outputs.released_commit }}', checkout[1])
        self.assertIn('released_commit: ${{ steps.release-commit.outputs.released_commit }}', jobs['release-please'])
        self.assertIn('RELEASE_OUTPUTS_JSON: ${{ toJSON(steps.release.outputs) }}', jobs['release-please'])
        self.assertIn('fetch-depth: 0', jobs['release-please'])
        self.assertIn('python3 scripts/resolve-release-commit.py --repository .', jobs['release-please'])

    def test_release_please_publishes_metadata_while_hub_jobs_require_hosted_mode(self):
        workflow = (ROOT / '.github/workflows/release.yml').read_text()
        jobs = dict(re.findall(r'(?ms)^  ([\w-]+):\n(.*?)(?=^  [\w-]+:|\Z)', workflow.split('jobs:\n', 1)[1]))
        self.assertIn('googleapis/release-please-action@', jobs['release-please'])
        self.assertIn('publication: ${{ steps.release-commit.outputs.publication }}', jobs['release-please'])
        for name in ('publish-modules', 'publish-app'):
            with self.subTest(job=name):
                condition = re.search(r'(?m)^    if:[^\n]*(?:\n      [^\n]+)*', jobs[name])
                self.assertIsNotNone(condition)
                self.assertIn("needs.release-please.outputs.publication == 'hosted'", condition[0])
                self.assertIn('WIPPY_HUB_TOKEN', jobs[name])
        self.assertIn('released_paths', jobs['publish-modules'])
        self.assertIn('app_created', jobs['publish-app'])
        self.assertIn('publish-modules', jobs['publish-app'])


if __name__ == '__main__':
    unittest.main()
