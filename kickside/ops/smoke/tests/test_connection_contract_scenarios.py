import json
import os
from contextlib import nullcontext
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

import yaml
import scenarios_access as access
import scenarios_providers as providers
import scenarios_core as core
import scenarios_automation as automation
from harness import Failure


class ConnectionContractScenarios(unittest.TestCase):
    def test_access_catalog_supplies_declared_skill_storage(self):
        ctx = Mock()
        ctx.state = {'access_declarations': {}}
        with patch.object(access, 'renew'), patch.object(access, 'registry', return_value=[]), \
             patch.object(access, 'request', return_value={'entry': {'data': {'packages': [
                 {'component': 'kickside/skills', 'parameters': [
                     {'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}]}]}}}):
            access.access_catalog(ctx)
        ctx.inst.install.assert_any_call('kickside/skills', parameters=[
            {'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}])

    def test_telegram_configured_discovery_contains_its_declared_chat(self):
        kind = next(kind for kind in access.KINDS if kind.binding == 'kickside.telegram.connection:telegram_connection')
        fixture = access.Fixture(kind, 'telegram', 'Telegram', {'connection': True, 'default_chat_id': 'NW'})
        with patch.object(access, 'request', return_value={'success': True, 'resources': [{'id': 'NW'}], 'items': [{'id': 'NW'}]}):
            self.assertTrue(access.primary(Mock(), fixture, 'read', readonly=True)['success'])
        with patch.object(access, 'request', return_value={'success': True, 'resources': [], 'items': []}):
            with self.assertRaises(access.Failure):
                access.primary(Mock(), fixture, 'read', readonly=True)

    def test_recommender_accepts_the_declared_workflow_block_catalog(self):
        ctx = Mock()
        tool = {'id': 'kickside.workflows.agent:flows_read', 'input_schema': {'type': 'object'},
                'output_schema': {'type': 'object'}}
        ctx.inst.request.return_value = {'success': True, 'tools': [tool]}
        compact = {'tools': [{'id': tool['id'], 'label': 'WorkflowsRead'}]}
        with patch.object(automation, 'member_identity', return_value={'token': 'member-token'}), \
             patch.object(automation, 'mint', return_value={'token': 'probe-token'}), \
             patch.object(automation, 'call', side_effect=[{'tools': [tool]}, compact]) as recommend:
            automation.code_recommend(ctx)
        need = 'List available executable workflow blocks.'
        self.assertEqual(ctx.inst.request.call_args.args[2], {'need': need, 'fields': ['input_schema', 'output_schema']})
        self.assertEqual([entry.args[3] for entry in recommend.call_args_list],
                         [{'need': need, 'fields': ['input_schema', 'output_schema']}, {'need': need}])

    def test_default_recommendation_rejects_rows_beyond_id_and_label(self):
        ctx = Mock()
        tool = {'id': 'kickside.blocks:list', 'input_schema': {'type': 'object'}, 'output_schema': {'type': 'object'}}
        ctx.inst.request.return_value = {'success': True, 'tools': [tool]}
        with patch.object(automation, 'member_identity', return_value={'token': 'member-token'}), \
             patch.object(automation, 'mint', return_value={'token': 'probe-token'}), \
             patch.object(automation, 'call', return_value={'tools': [tool]}):
            with self.assertRaisesRegex(Failure, 'compact id/label'):
                automation.code_recommend(ctx)
    def test_oauth_hidden_read_accepts_declared_forbidden_response(self):
        ctx = Mock()
        fixture = access.Fixture(access.Kind('binding_kickside_oauth_oauth_connection',
            'kickside/oauth', 'kickside.oauth:oauth_connection'), 'northwind-oauth', 'Northwind', {'oauth': True})
        with patch.object(access, 'request', return_value={'success': False, 'error': 'access denied'}) as request:
            access.read(ctx, fixture, 'stranger', hidden=True)
        request.assert_called_once_with(ctx, 'stranger', 'GET', '/oauth/connections/northwind-oauth', denied=True)

    def test_oauth_access_uses_its_owning_flow(self):
        ctx = Mock()
        kind = access.Kind('binding_kickside_oauth_oauth_connection', 'kickside/oauth', 'kickside.oauth:oauth_connection')
        declaration = {'meta': {'class': ['connection', 'oauth_connection']},
                       'data': {'contracts': [{'contract': 'kickside.contract:component'}]}}
        ctx.state = {'access_declarations': {kind.binding: declaration}}
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'create_oauth_access_fixture', create=True, return_value='northwind-oauth') as flow:
            fixture = access.create(ctx, kind)
        flow.assert_called_once()
        self.assertEqual(fixture.id, 'northwind-oauth')
        self.assertTrue(fixture.data['oauth'])

    def test_remote_mcp_oauth_access_uses_its_owning_flow_and_authenticated_discovery(self):
        ctx = Mock()
        kind = access.Kind('binding_kickside_mcp_client_oauth_connection', 'kickside/mcp-client',
                           'kickside.mcp_client.oauth:connection')
        declaration = {'meta': {'class': ['connection', 'oauth_connection', 'mcp']},
                       'data': {'contracts': [{'contract': 'kickside.contract:component'}]}}
        ctx.state = {'access_declarations': {kind.binding: declaration}}
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'create_remote_mcp_oauth_access_fixture', return_value='northwind-mcp-oauth') as flow:
            fixture = access.create(ctx, kind)
        flow.assert_called_once()
        self.assertEqual(fixture.id, 'northwind-mcp-oauth')
        self.assertTrue(fixture.data['oauth'])
        with patch.object(access, 'request', return_value={'success': True, 'items': [], 'resources': [
                {'id': 'northwind_order', 'name': 'northwind_order'}]}) as request:
            access.primary(ctx, fixture, 'write')
        request.assert_called_once_with(ctx, 'write', 'POST', '/connections/northwind-mcp-oauth/discover_resources', {})

    def test_remote_mcp_oauth_fixture_initializes_the_protected_endpoint_and_preserves_the_app_page(self):
        page, browser = Mock(), Mock()
        page.wait_for_timeout = Mock()
        callback = Mock()
        callback.status = 200
        page.expect_response.return_value = nullcontext(Mock(value=callback))
        browser.page.url = 'http://app.example/'
        browser.open_page.return_value = page
        browser.frame.locator.return_value.wait_for = Mock()
        ctx = Mock()
        ctx.state = {'access_connection_bases': {'mcp': 'http://127.0.0.1:731'}}
        kind = access.Kind('binding_kickside_mcp_client_oauth_connection', 'kickside/mcp-client',
                           'kickside.mcp_client.oauth:connection')
        ctx.inst.wait.side_effect = lambda predicate, *_args, **_kwargs: predicate()
        with patch.object(access, 'setup_access_connection_fixtures'), \
             patch.object(access, 'component_rows', side_effect=[[], [{'component_id': 'northwind-mcp-oauth'}]]), \
             patch.object(access, 'request', return_value={'authorization_url': 'http://127.0.0.1:731/authorize'}) as request, \
             patch.object(access, 'actor_browser', return_value=browser):
            connection_id = access.create_remote_mcp_oauth_access_fixture(ctx, kind, 'Northwind MCP', 'owner')
        self.assertEqual(connection_id, 'northwind-mcp-oauth')
        request.assert_called_once_with(ctx, 'owner', 'POST', '/oauth/providers/mcp_remote/init', {
            'name': 'Northwind MCP', 'scopes': [],
            'provider_options': {'endpoint_url': 'http://127.0.0.1:731/mcp/oauth'},
        })
        page.goto.assert_called_once_with('http://127.0.0.1:731/authorize', wait_until='load')
        page.close.assert_called_once()

    def test_connection_mutation_checks_its_persisted_metadata(self):
        ctx = Mock()
        fixture = access.Fixture(access.Kind('connection', 'kickside/github', 'github'),
                                 'northwind-connection', 'Northwind connection', {'connection': True})
        with patch.object(access, 'read', side_effect=[{'name': 'Northwind connection'},
             {'name': 'Northwind connection edited by write'}]), patch.object(access, 'update') as update, \
             patch.object(access, 'request', side_effect=AssertionError('Metadata mutation does not declare a thread event')):
            access.produce_event(ctx, fixture, 'write')
        update.assert_called_once_with(ctx, fixture, 'write')

    def test_responder_pause_checks_engine_drive_status(self):
        ctx = Mock()
        phase = ['active']
        def request(method, route, body=None, **kwargs):
            if route.endswith('/actions/pause'):
                phase[0] = 'paused'
                return {'success': True}
            if route.endswith('/actions/resume'):
                phase[0] = 'active'
                return {'success': True}
            if route.endswith('/actions/status'):
                return {'success': True, 'result': {'drives': [{'drive_key': 'reconcile', 'phase': phase[0],
                                                              'enabled': phase[0] == 'active'}]}}
            if method == 'DELETE' or route == '/api/v1/automations':
                return {'automations': []}
            raise AssertionError('Control state uses the engine status contract: ' + route)
        ctx.inst.request.side_effect = request
        ctx.inst.wait.side_effect = lambda predicate, *args, **kwargs: self.assertTrue(predicate())
        with patch.object(core, 'install_channel_responder', return_value='northwind-responder'):
            core.core_channel_responder(ctx)

    def test_keyboard_navigation_creates_its_declared_concept(self):
        ctx = Mock()
        ctx.state = {'access_browser_error_start': 0}
        fixture = Mock(id='northwind-wiki')
        calls = []
        def request(ctx, role, method, route, body=None, **kwargs):
            calls.append(route)
            if route.endswith('/concepts'):
                self.assertEqual(body['label'], 'Northwind Tea')
                self.assertIn('NW-KEYBOARD-731', body['description'])
                return {'success': True, 'node_id': 'northwind-tea'}
            if route.endswith('/graph'):
                return {'nodes': [{'id': 'northwind-tea', 'label': 'Northwind Tea'}]}
            if route.endswith('/ingest'):
                return {'success': True}
            if route.endswith('/search'):
                self.assertEqual(body['query'], 'NW-KEYBOARD-731')
                return {'results': [{'content': 'NW-KEYBOARD-731'}]}
            raise AssertionError('Navigation fixture uses the declared concept API: ' + route)
        ctx.inst.wait.side_effect = lambda predicate, *args, **kwargs: self.assertTrue(predicate())
        browser = Mock()
        browser.frame.get_by_role.return_value.evaluate.return_value = True
        browser.frame.locator.return_value.inner_text.return_value = 'NW-KEYBOARD-731'
        with patch.object(access, 'create', return_value=fixture), patch.object(access, 'request', side_effect=request), \
             patch.object(access, 'open_knowledge', return_value=browser):
            access.regression_wiki_keyboard(ctx)
        self.assertLess(calls.index('/knowledge/northwind-wiki/search'),
                        calls.index('/kb10/northwind-wiki/concepts'))
        self.assertIn('/kb10/northwind-wiki/concepts', calls)

    def test_github_access_uses_fixture_credentials_and_validates_them(self):
        ctx = Mock()
        kind = access.Kind('binding_kickside_github_connection_github_connection',
                           'kickside/github', 'kickside.github.connection:github_connection')
        ctx.state = {'access_declarations': {kind.binding: {'meta': {
            'class': ['connection'], 'credential_schema': {'fields': [
                {'key': 'token', 'type': 'secret', 'required': True}]}},
            'data': {'contracts': [{'contract': 'kickside.contract:component'}]}}}}
        def request(ctx, role, method, route, body=None, **kwargs):
            self.assertEqual(body['private_context'], {'token': 'fictional-github-token'})
            self.assertIs(body['validate'], True)
            return {'component_id': 'fixture-connection'}
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'setup_access_connection_fixtures', create=True), \
             patch.object(access, 'request', side_effect=request):
            access.create(ctx, kind)

    def test_access_probe_has_registry_and_execution_grants_for_credential_owners(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = Mock()
            ctx.inst.app = Path(directory)
            (ctx.inst.app / 'src').mkdir()
            ctx.inst.fixture_state = {}
            ctx.state = {}
            fixtures = Mock()
            fixtures.start.side_effect = lambda name: 'http://127.0.0.1:731/' + name
            with patch('mocks.Fixtures', return_value=fixtures), \
                    patch.object(access, 'install_package'), \
                    patch.object(providers, 'configure_provider_endpoints'), \
                    patch.object(access, 'DiscordGatewayFixture') as gateway:
                gateway.return_value.request.return_value = {'url': 'ws://127.0.0.1:731/gateway'}
                access.setup_access_connection_fixtures(ctx)
            entries = [entry for path in (ctx.inst.app / 'src').rglob('_index.yaml')
                       for entry in yaml.safe_load(path.read_text())['entries']]
            grants = {action for entry in entries if entry['kind'] == 'security.policy'
                      and 'app.security:user' in entry.get('groups', [])
                      and entry['policy']['effect'] == 'allow'
                      and 'app.smoke.access_connections:probe' in entry['policy']['resources']
                      for action in entry['policy']['actions']}
            self.assertTrue({'registry.get', 'registry.find', 'funcs.call', 'funcs.security'} <= grants, grants)

    def test_endpoint_configuration_updates_declared_descriptor_targets(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = Mock()
            ctx.inst.app = Path(directory)
            (ctx.inst.app / '.wippy.yaml').write_text('version: "1.0"\n')
            ctx.inst.request.return_value = {'entry': {'data': {'targets': [
                {'entry': 'kickside.github:endpoints', 'path': '.endpoints.api'},
                {'entry': 'kickside.github:github', 'path': '.connector_contract.context_values.api_base_url'},
            ]}}}
            providers.configure_provider_endpoints(ctx, {'kickside.github:endpoint_api': 'http://127.0.0.1:731'})
            config = yaml.safe_load((ctx.inst.app / '.wippy.yaml').read_text())
            overrides = config['profiles']['quickstart']['override']
            for target in ('kickside.github:endpoints:endpoints.api',
                           'kickside.github:github:connector_contract.context_values.api_base_url'):
                self.assertEqual(overrides[target], '${provider_kickside_github_endpoint_api}')

    def test_member_authoring_uses_declared_need(self):
        ctx = Mock()
        def request(ctx, role, method, route, body=None, **kwargs):
            if route.endswith('sdk-reference'):
                return {'sdk': {}}
            self.assertEqual(body, {'need': 'Calculate fictional Northwind total 24*12'})
            return {'success': True, 'tools': []}
        with patch.object(access, 'renew'), patch.object(access, 'request', side_effect=request):
            access.regression_member_code_authoring(ctx)

    def test_member_code_assist_bounds_its_catalog_without_allowing_sdk_calls(self):
        ctx = Mock()
        ctx.state = {'model': 'fixture-model'}
        response = {'ok': True, 'validated': True,
                    'code': 'return {company = "Northwind", total = 42}'}
        with patch.object(access, 'install_package'), patch.object(access, 'renew'), \
             patch.object(access, 'request', return_value=response) as request:
            access.regression_member_code_assist(ctx)
        body = request.call_args.args[4]
        self.assertEqual(body['tool_ids'], ['kickside.blocks:list'])
        self.assertEqual(body['model'], 'fixture-model')

    def test_member_code_assist_rejects_sdk_calls_in_a_pure_lua_fixture(self):
        ctx = Mock()
        ctx.state = {'model': 'fixture-model'}
        response = {'ok': True, 'validated': True,
                    'code': 'return {company = "Northwind", action = sdk.tools["kickside.blocks:list"]({})}'}
        with patch.object(access, 'install_package'), patch.object(access, 'renew'), \
             patch.object(access, 'request', return_value=response):
            with self.assertRaisesRegex(Failure, 'unexpectedly calls the SDK'):
                access.regression_member_code_assist(ctx)

    def test_mcp_profile_explicit_search_has_a_tool_grant(self):
        ctx = Mock()
        ctx.inst.redactor = Mock()
        fixture = Mock(id='northwind-kb')
        def request(ctx, role, method, route, body=None, **kwargs):
            self.assertIn('kickside.knowledge.traits:kb_search_tool', body['allowed_tool_ids'])
            return {'credential': {'token': 'fixture-token'}}
        with patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'request', side_effect=request), \
             patch.object(access, 'rpc', return_value={'text': '17 NW-ACCESS-731'}):
            access.regression_mcp_profile_context(ctx)

    def test_crm_sdk_checks_declared_rows_and_seeded_content(self):
        ctx = Mock()
        fixture = Mock(id='northwind-crm', data={'record': 'northwind-record'})
        envelope = {'ok': True, 'data': {'rows': [{'record_id': 'northwind-record'}], 'total': 1, 'limit': 50, 'offset': 0}}
        calls = [envelope, {'ok': True, 'result': json.dumps(envelope)}]
        with patch.object(access, 'renew'), patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'request', return_value={'credential': {'token': 'fixture-token'}}), \
             patch.object(access, 'rpc', side_effect=calls):
            access.regression_crm_sdk_schema(ctx)
