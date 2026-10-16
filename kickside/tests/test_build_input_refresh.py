import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.github/scripts'))
from release_content import credentials, latest_module


class BuildInputRefreshTests(unittest.TestCase):
    def test_materialization_refreshes_a_previous_release_lock(self):
        registry, token = credentials()
        expected = latest_module(registry, 'kickside/ui-kit', token)['latest_version']
        with tempfile.TemporaryDirectory(dir=ROOT / 'tests') as directory:
            work = Path(directory)
            shutil.copy(ROOT / 'Makefile', work / 'Makefile')
            (work / 'scripts').mkdir()
            shutil.copy(ROOT / 'scripts/wire-ui-kit.mjs', work / 'scripts/wire-ui-kit.mjs')
            shutil.copytree(ROOT / 'build-inputs/src', work / 'build-inputs/src')
            shutil.copy(ROOT / 'build-inputs/.wippy.yaml', work / 'build-inputs/.wippy.yaml')
            shutil.copy(ROOT / 'tests/fixtures/previous-build-inputs.lock', work / 'build-inputs/wippy.lock')
            package = work / 'platform/probe/ui'
            package.mkdir(parents=True)
            (package / 'package.json').write_text(json.dumps({'name': 'build-input-probe',
                'version': '0.0.0', 'private': True,
                'workspaces': ['./.wippy/npm/@*/*'],
                'dependencies': {'@kickside/ui-kit': '*'}}))
            environment = dict(os.environ)
            environment.pop('UI_KIT_WAPP', None)
            if token:
                environment['WIPPY_TOKEN'] = token
            install = subprocess.run(['wippy', 'install'], cwd=work / 'build-inputs',
                                     env=environment, capture_output=True, text=True, timeout=120)
            self.assertEqual(install.returncode, 0, install.stdout + install.stderr)
            result = subprocess.run(['make', 'ui-kit', 'MOD=probe'], cwd=work, env=environment,
                                    capture_output=True, text=True, timeout=120)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            materialized = json.loads((package / '.wippy/npm/@kickside/ui-kit/package.json').read_text())
            self.assertEqual(materialized['version'], expected)
