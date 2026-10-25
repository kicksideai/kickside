import json
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import Mock

import yaml

from harness import load_registry, select_scenarios
from scenarios_jira import jira_setup


class JiraSetupTests(unittest.TestCase):
    def test_member_reply_selects_one_jira_setup_from_the_jira_owner(self):
        registry = load_registry(Path(__file__).resolve().parents[1])
        selected = select_scenarios(registry, 'regression', ['regression_EE2_2439_member_reply'])
        names = [scenario.name for scenario in selected]
        setup = next(scenario for scenario in selected if scenario.name == 'jira_regression_setup')
        member = next(scenario for scenario in selected if scenario.name == 'regression_EE2_2439_member_reply')
        self.assertEqual(names.count('jira_regression_setup'), 1)
        self.assertEqual(member.requires, ('jira_regression_setup',))
        self.assertEqual(member.owner, setup.owner)
        self.assertLess(names.index('jira_regression_setup'), names.index('regression_EE2_2439_member_reply'))

    def test_provider_configuration_supports_published_and_source_profiles(self):
        for initial in ({'version': '1.0'}, {'version': '1.0', 'profiles': {
                'quickstart': {'override': {'existing:setting': 'preserved'}}}}):
            with self.subTest(initial=initial), tempfile.TemporaryDirectory() as directory:
                app = Path(directory)
                (app / 'src').mkdir()
                path = app / '.wippy.yaml'
                path.write_text(yaml.safe_dump(initial))
                inst = Mock(app=app)
                inst.request.return_value = {'entry': {'data': {'targets': [
                    {'entry': 'fixture:endpoint', 'path': '.default'}]}}}
                fixtures = Mock()
                fixtures.start.side_effect = lambda name: 'http://127.0.0.1:731/' + name
                restart = Mock(side_effect=RuntimeError('fixture configuration ready'))
                ctx = SimpleNamespace(inst=inst, fixtures=fixtures, browser_check=Mock(), restart=restart)
                with self.assertRaisesRegex(RuntimeError, '^fixture configuration ready$'):
                    jira_setup(ctx)
                config = yaml.safe_load(path.read_text())
                overrides = config['profiles']['quickstart']['override']
                self.assertIs(overrides['kickside.discord.gateway:gateway.service:lifecycle.auto_start'], False)
                for name in ('google', 'discord', 'fireflies'):
                    self.assertIn('http://127.0.0.1:731/' + name, json.dumps(config))
                if initial.get('profiles'):
                    self.assertEqual(overrides['existing:setting'], 'preserved')
