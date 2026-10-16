import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import yaml

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location('compat_delivery', ROOT / '.github/scripts/delivery.py')
delivery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(delivery)

class WiringTests(unittest.TestCase):
    def test_publication_is_blocked_before_build_or_publish(self):
        module = {'path': 'core/component', 'organization': 'kickside', 'module': 'component', 'embed': [], 'visibility': 'public', 'type': 'plugin'}
        with patch.object(delivery, 'run', side_effect=RuntimeError('compatibility rejects')), patch.object(delivery, 'build') as build:
            with self.assertRaisesRegex(RuntimeError, 'compatibility rejects'):
                delivery.publish(module, '1.0.0', True)
            build.assert_not_called()

    def test_ci_has_database_backed_compatibility_job_and_publish_service(self):
        ci = yaml.safe_load((ROOT.parent / 'kickside-internal/.github/workflows/kickside-tests.yml').read_text())
        self.assertIn('compatibility', ci['jobs'])
        self.assertIn('postgres', ci['jobs']['compatibility']['services'])
        commands = '\n'.join(str(step.get('run', '')) for step in ci['jobs']['compatibility']['steps'])
        self.assertIn('make compat', commands)
        release = yaml.safe_load((ROOT / '.github/workflows/release.yml').read_text())
        self.assertIn('postgres', release['jobs']['publish']['services'])

    def test_shell_release_uses_compatibility_target(self):
        self.assertIn("['make', 'compat']", (ROOT / 'release.sh').read_text())

    def test_make_provisions_a_temp_directory_when_the_environment_omits_one(self):
        import os
        import subprocess
        env = {key: value for key, value in os.environ.items() if key != 'TMPDIR'}
        result = subprocess.run(['make', '-n', 'compat-unit', 'compat-integration'],
                                cwd=ROOT, env=env, capture_output=True, text=True, check=True)
        self.assertIn('mkdir -p ' + str(ROOT / '.compat/tmp'), result.stdout)
        makefile = (ROOT / 'Makefile').read_text()
        self.assertIn('export TMPDIR ?=', makefile)
