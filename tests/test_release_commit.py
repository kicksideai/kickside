#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Resolve Release Please tags even when the workflow checkout is older."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


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
        self.release = self.git('commit-tree', 'HEAD^{tree}', '-p', 'HEAD', '-m', 'release')
        self.git('tag', 'component-v1.2.3', self.release)
        self.git('tag', '-a', 'uploads-v2.3.4', self.release, '-m', 'uploads release')
        self.git('tag', 'kickside-v3.4.5', self.release)
        self.outputs = {
            'paths_released': json.dumps(['core/component', 'platform/uploads', 'app']),
            'core/component--tag_name': 'component-v1.2.3',
            'platform/uploads--tag_name': 'uploads-v2.3.4',
            'app--tag_name': 'kickside-v3.4.5',
        }
        self.output = self.root / 'github-output'

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True).strip()

    def resolve(self):
        return subprocess.run([sys.executable, str(ROOT / 'scripts/resolve-release-commit.py'),
                               '--repository', str(self.root)], capture_output=True, text=True,
                              env={**os.environ, 'RELEASE_OUTPUTS_JSON': json.dumps(self.outputs),
                                   'GITHUB_OUTPUT': str(self.output)})

    def test_cohort_outputs_release_commit_instead_of_trigger_commit(self):
        result = self.resolve()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.output.read_text(), 'released_commit=' + self.release + '\n')
        self.assertEqual(self.git('rev-parse', 'HEAD'), self.trigger)
        self.assertNotEqual(self.trigger, self.release)

    def test_app_only_release_outputs_its_tag_commit(self):
        self.outputs['paths_released'] = '["app"]'
        result = self.resolve()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.output.read_text(), 'released_commit=' + self.release + '\n')

    def test_module_only_release_ignores_unreleased_tags(self):
        self.outputs['paths_released'] = '["core/component", "platform/uploads"]'
        self.git('tag', 'old-app', self.trigger)
        self.outputs['app--tag_name'] = 'old-app'
        result = self.resolve()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.output.read_text(), 'released_commit=' + self.release + '\n')

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
                self.assertIn('ref: ${{ needs.release-please.outputs.released_commit }}', checkout[1])
        self.assertIn('released_commit: ${{ steps.release-commit.outputs.released_commit }}', jobs['release-please'])
        self.assertIn('RELEASE_OUTPUTS_JSON: ${{ toJSON(steps.release.outputs) }}', jobs['release-please'])
        self.assertIn('fetch-depth: 0', jobs['release-please'])
        self.assertIn('python3 scripts/resolve-release-commit.py --repository .', jobs['release-please'])


if __name__ == '__main__':
    unittest.main()
