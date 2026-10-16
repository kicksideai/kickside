import copy
import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure
from mcp_contracts import sync_fixtures
import scenarios_published_mcp as guard


class PublishedMCPConfigurationTests(unittest.TestCase):
    def run_continuity(self, *, changed=False, missing_large=False):
        phase = [False]
        small = {'title': 'Original', 'transform': {'expr': 'fixture-small'}}
        configs = {'original': small}
        reads = []
        inst = Mock()

        def request(method, path, body=None, **kwargs):
            if path == '/api/v1/automations':
                return {'automations': [{'id': 'original', 'type': 'kickside.sync:sync'}]}
            if path == '/api/v1/automations/original/config':
                return {'config': copy.deepcopy(small)}
            if path == '/api/v1/user/me':
                return {'user': {'id': 'fixture-user'}}
            if path == '/api/v1/mcp/credentials':
                self.assertEqual(body['whitelist_component_ids'], ['large', 'original'])
                return {'credential': {'credential_id': 'fixture-credential', 'token': 'fixture-token'}}
            if path.startswith('/api/v1/keeper/registry/entries?'):
                return {'entries': [], 'has_more': False}
            raise AssertionError((method, path))

        inst.request.side_effect = request
        ctx = SimpleNamespace(inst=inst)

        def fixture(parent, titles, **kwargs):
            if 'expression' not in kwargs:
                return [{'id': 'outside'}]
            expression = kwargs['expression']
            configs['large'] = {'title': titles[0], 'transform': {'expr': expression},
                                '_portable_input': {'transform': {'expr': expression}}}
            return [{'id': 'large', 'expression': expression}]

        class Client:
            transports = {'POST'}
            def __init__(self, *args, **kwargs):
                pass
            def initialize(self):
                pass
            def tools(self):
                return {'AutomationsRead'}
            def call(self, name, arguments):
                if name == 'session_info':
                    return {'identity': 'fixture-user', 'actor': 'fixture-user',
                            'whitelist_component_ids': ['large', 'original'], 'scoped': True}
                if arguments['action'] == 'list':
                    return {'success': True, 'count': 2,
                            'automations': [{'id': 'original'}, {'id': 'large'}]}
                identifier = arguments['id']
                reads.append((phase[0], identifier))
                config = copy.deepcopy(configs[identifier])
                if phase[0] and changed:
                    config['title'] = 'Changed'
                result = {'success': True, 'id': identifier, 'config': config}
                if phase[0]:
                    content = json.dumps(config)
                    result.update(content=content, offset=0, total_bytes=len(content.encode()))
                    if missing_large and identifier == 'large':
                        del result['config']
                return result
            def tool_result(self, *args):
                return {'isError': True, 'content': [{'text': 'Permission denied'}]}
            def text(self, result):
                return result['content'][0]['text']

        def update(parent, *, observe, **kwargs):
            observe(parent, 'baseline')
            phase[0] = True
            observe(parent, 'update')

        with patch.object(guard, 'MCPClient', Client), \
             patch.object(guard, 'sync_fixtures', side_effect=fixture), \
             patch.object(guard, 'database_rows', return_value=[{'actor_id': 'fixture-user'}]), \
             patch.object(guard, 'browser_published_human_automation_update', side_effect=update):
            guard.browser_published_mcp_credential_hub_ui_update(ctx)
        self.assertEqual(reads, [(False, 'original'), (False, 'large'), (True, 'original'), (True, 'large')])

    def test_optional_page_metadata_preserves_the_exact_stored_configuration(self):
        self.run_continuity()

    def test_changed_stored_configuration_fails(self):
        with self.assertRaisesRegex(Failure, 'allowed configuration changes'):
            self.run_continuity(changed=True)

    def test_missing_large_configuration_fails(self):
        with self.assertRaisesRegex(Failure, 'published configuration field'):
            self.run_continuity(missing_large=True)

    def test_sync_fixture_preserves_an_explicit_expression(self):
        inst = Mock()
        inst.request.side_effect = [{'webhook': {'webhook_id': 'source', 'secret': 'fixture-secret'}},
                                    {'id': 'configured'}]
        expression = json.dumps({'content': 'x' * 2200})
        rows = sync_fixtures(SimpleNamespace(inst=inst), ['Existing data'], expression=expression)
        self.assertEqual(rows[0]['expression'], expression)
        self.assertEqual(inst.request.call_args_list[-1].args[2]['input']['transform']['expr'], expression)
