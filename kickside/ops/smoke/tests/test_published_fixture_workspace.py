import os
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml

from scenarios_published_installation_update import published_installation_update
from scenarios_published_run_as import browser_published_human_automation_update


class PublishedFixtureWorkspaceTests(unittest.TestCase):
    def prepare_fixture(self, scenario, candidates, context_manager):
        class Prepared(Exception):
            pass

        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            app = root / 'runtime'
            app.mkdir()
            (root / 'temp').mkdir()
            inst = Mock(root=root, app=app, config={})
            ctx = SimpleNamespace(inst=SimpleNamespace(config={'replace': candidates}))
            documents = []

            def source(path, *args, **kwargs):
                path.mkdir()
                (path / '.wippy.yaml').write_text('version: "1.0"\n')
                return {}

            def isolated(*args, prepare, **kwargs):
                class Fixture:
                    def __enter__(self):
                        prepare(SimpleNamespace(inst=inst, state={}))
                        documents.append(yaml.safe_load((app / '.wippy.yaml').read_text()))
                        raise Prepared()

                    def __exit__(self, *args):
                        return False
                return Fixture()

            with patch('scenarios_identity_policy_upgrade.published_source', side_effect=source), \
                 patch('scenarios_published_installation_update.published_source', side_effect=source), \
                 patch('scenarios_published_installation_update.prepare_published_deployment', return_value={}), \
                 patch(context_manager, isolated), \
                 patch('scenarios_published_run_as.candidate_dependency_sources', return_value=candidates):
                with self.assertRaises(Prepared):
                    scenario(ctx)
            return documents[0]['workspace'], inst.config['replace']

    def test_archived_human_fixture_keeps_host_dependency_resolution(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'wippy.yaml').write_text('type: application\n')
            workspace, replacements = self.prepare_fixture(
                browser_published_human_automation_update, {'kickside/kickside': str(root)},
                'scenarios_published_run_as.published_fixture')
        self.assertEqual(workspace, {'include_host_dependencies': True, 'replacements': replacements})

    def test_historical_fixture_without_candidates_keeps_the_native_workspace(self):
        workspace, replacements = self.prepare_fixture(
            published_installation_update, {}, 'scenarios_published_installation_update.isolated_fixture')
        self.assertEqual(replacements, {})
        self.assertEqual(workspace, {'include_host_dependencies': True})
