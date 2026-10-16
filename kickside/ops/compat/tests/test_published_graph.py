from contextlib import nullcontext
from pathlib import Path
from types import SimpleNamespace
import os
import tempfile
import unittest
from unittest.mock import patch

import yaml
from ops.compat.integration import credential_updates, test_run_as_upgrade


class PublishedGraphTests(unittest.TestCase):
    def test_credential_baseline_does_not_replace_published_dependencies_with_current_sources(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            runtime = Path(directory) / 'runtime'
            source = runtime / 'src'
            source.mkdir(parents=True)
            (source / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'app', 'entries': [
                {'name': 'dependency', 'component': 'kickside/mcp', 'parameters': []}]}))
            current = {'kickside/mcp': {'directory': Path(directory) / 'current-mcp'},
                       'kickside/contract': {'directory': Path(directory) / 'current-contract'}}
            published = {'kickside/mcp': str(Path(directory) / 'published-mcp')}
            class BaselineCaptured(Exception):
                pass
            def command(*args):
                config = yaml.safe_load((runtime / '.wippy.yaml').read_text())
                self.assertEqual(config['workspace']['replacements'], published)
                raise BaselineCaptured
            case = SimpleNamespace(subTest=lambda **kwargs: nullcontext())
            with patch.object(credential_updates, 'materialize_published_modules', return_value=published), \
                 patch.object(credential_updates, 'make_runtime', return_value=(runtime, source, {'vars': {}, 'override': {}})), \
                 patch.object(credential_updates, 'discover', return_value=current), \
                 patch.object(credential_updates, 'command', side_effect=command):
                with self.assertRaises(BaselineCaptured):
                    credential_updates.verify_credential_update(case, 'kickside/mcp', Path('harness'),
                        'proof.lua', {}, [], ('sqlite',), Path(directory), {})

    def test_installation_baseline_does_not_mix_unreleased_dependency_sources(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            runtime = Path(directory) / 'runtime'
            source = runtime / 'src'
            source.mkdir(parents=True)
            (source / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'app', 'entries': []}))
            published = {'kickside/users': str(Path(directory) / 'published-users')}
            current = {'kickside/users': {'directory': Path(directory) / 'current-users'},
                       'kickside/contract': {'directory': Path(directory) / 'current-contract'}}
            class BaselineCaptured(Exception):
                pass
            def command(*args):
                config = yaml.safe_load((runtime / '.wippy.yaml').read_text())
                self.assertEqual(config['workspace']['replacements'], published)
                raise BaselineCaptured
            with patch.object(test_run_as_upgrade, 'materialize_published_modules', return_value=published), \
                 patch.object(test_run_as_upgrade, 'make_runtime', return_value=(runtime, source, {'vars': {}, 'override': {}})), \
                 patch.object(test_run_as_upgrade, 'discover', return_value=current), \
                 patch.object(test_run_as_upgrade, 'command', side_effect=command):
                with self.assertRaises(BaselineCaptured):
                    test_run_as_upgrade.RunAsUpgradeTests().test_published_human_sessions_and_automations_survive_update_restart_on_both_engines()
