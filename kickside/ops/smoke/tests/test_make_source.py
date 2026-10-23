# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Exercise the maintained Make entrypoint without starting product services."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


MAKEFILE = Path(__file__).resolve().parents[1] / 'Makefile'


class SourceMakeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.arguments = self.root / 'arguments.json'
        self.build_log = self.root / 'build.log'
        capture = self.root / 'capture.py'
        capture.write_text(
            'import json, os, pathlib, sys\n'
            'pathlib.Path(os.environ["CAPTURE_ARGS"]).write_text(json.dumps(sys.argv[1:]))\n')
        self.python = f'{sys.executable} {capture}'
        self.environment = dict(os.environ, CAPTURE_ARGS=str(self.arguments),
                                BUILD_LOG=str(self.build_log))
        self.environment.pop('MAKEFLAGS', None)

    def run_make(self, *arguments):
        return subprocess.run(['make', '--no-print-directory', '-f', str(MAKEFILE),
                               *arguments, f'PYTHON={self.python}'],
                              cwd=self.root, env=self.environment, text=True, capture_output=True)

    def fixture(self, directory, label, fail=False):
        directory.mkdir(parents=True)
        recipe = 'exit 1' if fail else f'printf "%s\\n" {label} >> "$$BUILD_LOG"'
        (directory / 'Makefile').write_text(f'build:\n\t@{recipe}\n')

    def test_published_target_keeps_existing_default(self):
        result = self.run_make('quick')
        self.assertEqual(result.returncode, 0, result.stderr)
        arguments = json.loads(self.arguments.read_text())
        self.assertEqual(arguments[1:3], ['--published', 'latest'])
        self.assertEqual(arguments[-2:], ['--workers', '1'])

    def test_source_builds_selected_ui_then_runs_parallel_without_publication(self):
        source = self.root / 'kickside checkout'
        self.fixture(source / 'app', 'app')
        replacement = self.root / 'ui-module'
        self.fixture(replacement, 'ui-module')
        (replacement / 'ui').mkdir()
        (replacement / 'ui/package.json').write_text('{}')
        backend = self.root / 'backend'
        backend.mkdir()
        replacements = f'kickside/ui-module={replacement} kickside/backend={backend}'
        result = self.run_make('source', f'SOURCE={source}', f'REPLACEMENTS={replacements}',
                               'TIER=quick', 'ARGS=--scenario boot')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.build_log.read_text().splitlines(), ['app', 'ui-module'])
        arguments = json.loads(self.arguments.read_text())
        self.assertEqual(arguments[1:3], ['--source', str(source)])
        self.assertNotIn('--published', arguments)
        self.assertEqual(arguments.count('--replace'), 2)
        self.assertEqual(arguments[arguments.index('--engine') + 1], 'both')
        self.assertEqual(arguments[arguments.index('--workers') + 1], '4')
        self.assertEqual(arguments[-2:], ['--scenario', 'boot'])

    def test_source_worker_count_can_be_overridden(self):
        source = self.root / 'source'
        self.fixture(source / 'app', 'app')
        result = self.run_make('source', f'SOURCE={source}', 'WORKERS=2')
        self.assertEqual(result.returncode, 0, result.stderr)
        arguments = json.loads(self.arguments.read_text())
        self.assertEqual(arguments[arguments.index('--workers') + 1], '2')

    def test_cold_source_prepares_shared_widget_dependencies_before_consumer_builds(self):
        source = self.root / 'source'
        self.fixture(source / 'app', 'app')
        widgets = source / 'platform/widgets/ui'
        widgets.mkdir(parents=True)
        (widgets / 'package.json').write_text('{}')
        (source / 'Makefile').write_text(
            'typecheck-shared:\n\t@printf "%s\\n" shared >> "$$BUILD_LOG"\n')
        result = self.run_make('source', f'SOURCE={source}')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.build_log.read_text().splitlines(), ['shared', 'app'])

    def test_failed_build_does_not_run_suite_on_stale_assets(self):
        source = self.root / 'source'
        self.fixture(source / 'app', 'app', fail=True)
        result = self.run_make('source', f'SOURCE={source}')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.arguments.exists())

    def test_source_requires_checkout_and_valid_tier_before_building(self):
        self.assertNotEqual(self.run_make('source').returncode, 0)
        source = self.root / 'source'
        self.fixture(source / 'app', 'app')
        self.assertNotEqual(self.run_make('source', f'SOURCE={source}', 'TIER=invalid').returncode, 0)
        self.assertFalse(self.build_log.exists())
        self.assertFalse(self.arguments.exists())
