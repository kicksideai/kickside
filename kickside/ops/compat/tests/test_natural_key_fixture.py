from pathlib import Path
from types import SimpleNamespace
import sys
import tempfile
import unittest
from unittest.mock import patch

import yaml

from ops.compat.integration.thread_natural_key_upgrade import verify


class NaturalKeyFixtureTests(unittest.TestCase):
    def test_baseline_replacement_preserves_published_host_dependencies(self):
        class Configured(Exception):
            pass

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'core'
            source.mkdir()
            (source / 'wippy.yaml').write_text('organization: kickside\nmodule: core\n')
            app = root / 'app'
            app.mkdir()
            path = app / '.wippy.yaml'
            path.write_text(yaml.safe_dump({'workspace': {'include_host_dependencies': True}}))
            ctx = SimpleNamespace(inst=SimpleNamespace(config={'replace': {'kickside/core': str(source)}}))

            def isolated(parent, *, config, prepare):
                fixture = SimpleNamespace(inst=SimpleNamespace(app=app, config=config))
                prepare(fixture)
                actual = yaml.safe_load(path.read_text())
                self.assertTrue(actual['workspace'].get('include_host_dependencies'))
                self.assertEqual(actual['workspace']['replacements'], fixture.inst.config['replace'])
                self.assertIn('kickside/core', actual['workspace']['replacements'])
                raise Configured

            baseline = {'version': '0.2.6', 'sha256': 'a' * 64, 'entries': {}}
            smoke = Path(__file__).resolve().parents[2] / 'smoke'
            with patch.object(sys, 'path', [str(smoke), *sys.path]), \
                 patch('runtime_fixtures.isolated_fixture', isolated), \
                 patch('ops.compat.fetch_baselines.Hub.fetch', return_value=baseline):
                with self.assertRaises(Configured):
                    verify(ctx)
