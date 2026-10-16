from pathlib import Path
import tempfile
import unittest

import yaml

from fixture_member_permissions import register_member_policy_grants


class FixtureMemberPolicyGrantTests(unittest.TestCase):
    def test_combines_release_baseline_and_persistent_fixture_grants(self):
        root = Path(__file__).resolve().parents[3]
        with tempfile.TemporaryDirectory(dir=root) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            grants = [
                ('jira', 'egress', ['http_client.request'], ['http://jira/*']),
                ('jira', 'loopback', ['http_client.private_ip'], ['127.0.0.1']),
                ('jira', 'inbound', ['channel.receive.inject'], ['*']),
                ('crm', 'egress', ['http_client.request'], ['http://crm/*']),
                ('crm', 'loopback', ['http_client.private_ip'], ['127.0.0.1']),
                ('work', 'egress', ['http_client.request'], ['http://work/*']),
                ('work', 'loopback', ['http_client.private_ip'], ['127.0.0.1']),
                ('work', 'functions', ['access'], ['app.smoke.hot_update_work:upload', 'app.smoke.hot_update_work:transform']),
                ('access', 'egress', ['http_client.request'], ['http://access/*']),
                ('access', 'loopback', ['http_client.private_ip'], ['127.0.0.1']),
                ('access', 'ingress', 'channel.receive.inject', ['kickside.channel:receive', 'kickside.dm:receive']),
                ('access', 'tools', ['registry.get', 'registry.find', 'funcs.call', 'funcs.security'],
                 ['app.smoke.access_connections:ingress', 'app.smoke.access_connections:probe']),
                ('model', 'probe', 'access', 'security.model:visible.endpoint'),
            ]
            remaining = []
            for _, name, actions, resources in grants:
                entries = [{'name': name, 'kind': 'security.policy', 'groups': ['app.security:user'],
                            'policy': {'actions': actions, 'resources': resources, 'effect': 'allow'}}]
                remaining.extend(register_member_policy_grants(app, entries))

            self.assertEqual(remaining, [])
            entries = yaml.safe_load((app / 'src/smoke-member-policy-grants/_index.yaml').read_text())['entries']
            self.assertLessEqual(245 + len(entries), 256)
            decisions = {(action, resource) for entry in entries for action in values(entry['policy']['actions'])
                         for resource in values(entry['policy']['resources'])}
            expected = {(action, resource) for _, _, actions, resources in grants
                        for action in values(actions) for resource in values(resources)}
            self.assertEqual(decisions, expected)
            first = [(entry['name'], entry['policy']) for entry in entries]
            for _, name, actions, resources in reversed(grants):
                register_member_policy_grants(app, [{'name': name, 'kind': 'security.policy',
                    'groups': ['app.security:user'], 'policy': {
                        'actions': actions, 'resources': resources, 'effect': 'allow'}}])
            repeated = yaml.safe_load((app / 'src/smoke-member-policy-grants/_index.yaml').read_text())['entries']
            self.assertEqual([(entry['name'], entry['policy']) for entry in repeated], first)
            rebuilt = app / 'rebuilt'
            (rebuilt / 'src').mkdir(parents=True)
            for _, name, actions, resources in reversed(grants):
                register_member_policy_grants(rebuilt, [{'name': name, 'kind': 'security.policy',
                    'groups': ['app.security:user'], 'policy': {
                        'actions': actions, 'resources': resources, 'effect': 'allow'}}])
            rebuilt_entries = yaml.safe_load((rebuilt / 'src/smoke-member-policy-grants/_index.yaml').read_text())['entries']
            self.assertEqual(sorted(entry['name'] for entry in rebuilt_entries),
                             sorted(entry['name'] for entry in entries))

    def test_keeps_policies_with_different_conditions_separate(self):
        root = Path(__file__).resolve().parents[3]
        with tempfile.TemporaryDirectory(dir=root) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            register_member_policy_grants(app, [{
                'name': 'one', 'kind': 'security.policy', 'groups': ['app.security:user'],
                'policy': {'actions': ['http_client.request'], 'resources': ['https://one.invalid/*'],
                           'conditions': {'connection': 'one'}, 'effect': 'allow'},
            }])
            register_member_policy_grants(app, [{
                'name': 'two', 'kind': 'security.policy', 'groups': ['app.security:user'],
                'policy': {'actions': ['http_client.request'], 'resources': ['https://two.invalid/*'],
                           'conditions': {'connection': 'two'}, 'effect': 'allow'},
            }])
            entries = yaml.safe_load((app / 'src/smoke-member-policy-grants/_index.yaml').read_text())['entries']
            self.assertEqual(len(entries), 2)

    def test_retains_fixture_entries_that_are_not_member_allow_grants(self):
        root = Path(__file__).resolve().parents[3]
        with tempfile.TemporaryDirectory(dir=root) as directory:
            app = Path(directory)
            (app / 'src').mkdir()
            function = {'name': 'probe', 'kind': 'function.lua', 'source': 'file://probe.lua',
                        'method': 'handler', 'modules': ['funcs', 'json'],
                        'imports': {'component': 'kickside.component:component'},
                        'meta': {'type': 'tool', 'title': 'Fixture probe', 'public': True}}
            grouped_policy = {'name': 'shared', 'kind': 'security.policy',
                              'groups': ['app.security:user', 'app.security:members'],
                              'policy': {'actions': ['access'], 'resources': ['fixture:probe'], 'effect': 'allow'}}
            entries = register_member_policy_grants(app, [function, grouped_policy])
            self.assertEqual(entries, [function, grouped_policy])
            self.assertFalse((app / 'src/smoke-member-policy-grants/_index.yaml').exists())


def values(value):
    return [value] if isinstance(value, str) else value

