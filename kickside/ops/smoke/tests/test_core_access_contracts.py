import unittest
from contextlib import nullcontext
from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit
from unittest.mock import Mock, call
from unittest.mock import patch

import scenarios_access as access
import scenarios_ai as ai
import scenarios_core as core
import scenarios_automation as automation
import scenarios as common
from harness import Failure


class CoreAccessContractsTests(unittest.TestCase):
    def test_mcp_scope_inspects_the_run_through_each_declared_read_action(self):
        ctx = SimpleNamespace(inst=Mock())
        payload = {'marker': 'NW-MCP-RUN', 'crates': 48}
        detail = {'run': {'run_id': 'run-one', 'status': 'completed', 'output': {'result': payload}}}
        def request(method, path, *args, **kwargs):
            if path == '/api/v1/mcp/tools':
                return {'tools': [{'id': 'kickside.workflows.agent:flows_read', 'name': 'reader'}]}
            if path.endswith('/run'): return {'run_id': 'run-one'}
            return detail
        ctx.inst.request.side_effect = request
        ctx.inst.wait.side_effect = lambda probe, *args, **kwargs: probe()
        def tool(inst, token, name, args):
            if args['action'] == 'read': return {'state': {'workflow_id': 'inside'}}
            if args['action'] == 'runs': return {'runs': [{'run_id': 'run-one'}]}
            if args['action'] == 'run_detail': return detail
            if args['action'] == 'events':
                return {'timeline': {'count': 2, 'events': [{'seq': 1, 'type': 'flow.started'}, {'seq': 2, 'type': 'flow.finished'}]}}
            if args['action'] == 'event_detail': return {'event': {'type': 'flow.started', 'raw': {'run_id': 'run-one'}}}
            if args['action'] == 'export_run': return {'export': {'run': {'run_id': 'run-one'}}}
            return {'data': [{'payload': payload}]}
        def rpc(inst, token, method, params, label, **kwargs):
            if label == 'scoped-tools': return {'result': {'tools': [{'name': 'reader'}]}}
            return {'error': {'message': 'access denied'}}
        with patch.object(automation, 'dispatch_workflow', side_effect=[('inside', 1), ('outside', 1)]), \
             patch.object(automation, 'mint', return_value={'token': 'fixture', 'credential_id': 'credential'}), \
             patch.object(automation, 'rpc', side_effect=rpc), patch.object(automation, 'call', side_effect=tool) as call_tool:
            automation.mcp_scope(ctx)
        actions = [entry.args[3]['action'] for entry in call_tool.call_args_list]
        for action in ('runs', 'run_detail', 'node_data', 'events', 'event_detail', 'export_run'):
            self.assertIn(action, actions)
        detail_args = [entry.args[3] for entry in call_tool.call_args_list if entry.args[3]['action'] == 'event_detail']
        self.assertEqual(detail_args, [{'action': 'event_detail', 'id': 'inside', 'run_id': 'run-one', 'event_seq': 1}])
        inspected = [entry.args[3] for entry in call_tool.call_args_list if entry.args[3]['action'] == 'node_data']
        self.assertEqual(inspected, [{'action': 'node_data', 'id': 'inside', 'run_id': 'run-one', 'node_id': 'receipt'}])

    def test_settings_checks_the_aggregate_table_and_search_after_persistence(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.inst.request.side_effect = [
            {'settings': [{'key': 'token_expiration'}]}, {'blocks': [{'title': 'Authentication'}]},
            {'success': True}, {'settings': [{'key': 'token_expiration', 'value': '48h'}]},
        ]
        settings = ctx.browser.frame.locator.return_value
        with patch.object(core, 'system'):
            core.core_settings(ctx)
        settings.get_by_role.assert_any_call('button', name='All settings', exact=True)
        settings.get_by_role.return_value.click.assert_called_once()
        settings.get_by_role.assert_any_call('table')
        settings.get_by_role.return_value.get_by_role.assert_any_call('columnheader', name='Owner', exact=True)
        settings.get_by_role.return_value.get_by_role.assert_any_call('row')
        settings.get_by_role.return_value.get_by_role.return_value.filter.assert_called_with(has_text='token_expiration')
        self.assertEqual(settings.get_by_placeholder.return_value.fill.call_args_list,
                         [call('token_expiration'), call('')])

    def test_delegation_rerun_creates_distinct_agents_and_targets_its_own_specialist(self):
        ctx = SimpleNamespace(state={})
        agents = {}
        def configured(ctx, role, title, **options):
            self.assertNotIn(title, agents, 'Agent titles are unique in the declared create contract')
            agents[title] = ('agent-' + str(len(agents)), options)
            return agents[title][0]
        with patch.object(access, 'configured_agent', side_effect=configured), \
             patch.object(access, 'chat', return_value=[{'data': 'delegated calculation 288'}]) as chat:
            access.regression_delegation(ctx)
            access.regression_delegation(ctx)
        self.assertEqual(len(agents), 4)
        for title, (agent_id, options) in agents.items():
            if 'delegates' not in options:
                continue
            specialist = next(name for name, (identity, _) in agents.items() if identity == options['delegates'][0])
            self.assertIn(specialist, options['prompt'])
            matching = [call for call in chat.call_args_list if call.args[1] == agent_id]
            self.assertEqual(len(matching), 1)
            self.assertIn(specialist, matching[0].args[3])
            self.assertIn('ten numbered points', matching[0].args[3])
            self.assertEqual(matching[0].args[4], 'NW-DELEGATE-144')

    def test_durable_memory_configures_the_session_checkpoint_policy_and_crosses_its_threshold(self):
        ctx = SimpleNamespace(inst=Mock(), state={'model': 'fixture-model'})
        browser = Mock()
        ctx.state['access_last_chat'] = {'browser': browser}
        fixture = access.Fixture(access.kind_named('kb_document'), 'memory-kb', 'Memory')
        policy = {'checkpoint': {'model': 'fixture-model', 'token_threshold': 2000}}
        with patch.object(access, 'renew'), patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'configured_agent', return_value='memory-agent') as agent, \
             patch.object(access, 'chat', side_effect=[[{'type': 'assistant', 'metadata': {'tokens': {'context_tokens': 3000}}}], [{'type': 'assistant',
                 'data': 'SearchMemory: green tea preference, 29 days NW-LONGTERM-144-921 NW-MEMORY-RECALL'}]]) as chat:
            access.regression_durable_memory(ctx)
        self.assertEqual(agent.call_args.kwargs.get('agent_options'), policy)
        self.assertGreater(len(chat.call_args_list[0].args[3].split()), 2000)
        self.assertIn('NW-LONGTERM-144-921', chat.call_args_list[0].args[3])
        self.assertEqual(ctx.inst.wait.call_args.kwargs['seconds'], 120)
        browser.stream.assert_called_once()
        self.assertIn('twenty numbered', browser.stream.call_args.args[0])
        self.assertIn('two full sentences', browser.stream.call_args.args[0])
        self.assertIn('twenty numbered', chat.call_args_list[1].args[3])
        self.assertIn('two full sentences', chat.call_args_list[1].args[3])

    def test_durable_memory_accepts_the_declared_activation_injection_without_a_tool_call(self):
        ctx = SimpleNamespace(inst=Mock(), state={'model': 'fixture-model'})
        ctx.state['access_last_chat'] = {'browser': Mock()}
        fixture = access.Fixture(access.kind_named('kb_document'), 'memory-kb', 'Memory')
        recalled = 'Persisted memory NW-LONGTERM-144-921: green tea, 29 days NW-MEMORY-RECALL'
        with patch.object(access, 'renew'), patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'configured_agent', return_value='memory-agent'), \
             patch.object(access, 'chat', side_effect=[[{'type': 'assistant',
                 'metadata': {'tokens': {'context_tokens': 3000}}}], [{'type': 'assistant', 'data': recalled}]]):
            access.regression_durable_memory(ctx)
        ctx.inst.wait.assert_called_once()

    def test_durable_memory_requires_the_original_source_marker_in_independent_recall(self):
        ctx = SimpleNamespace(inst=Mock(), state={'model': 'fixture-model'})
        ctx.state['access_last_chat'] = {'browser': Mock()}
        fixture = access.Fixture(access.kind_named('kb_document'), 'memory-kb', 'Memory')
        recalled = 'SearchMemory: green tea, 29 days NW-MEMORY-RECALL'
        with patch.object(access, 'renew'), patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'configured_agent', return_value='memory-agent'), \
             patch.object(access, 'chat', side_effect=[[{'type': 'assistant',
                 'metadata': {'tokens': {'context_tokens': 3000}}}], [{'type': 'assistant', 'data': recalled}]]), \
             self.assertRaises(Failure):
            access.regression_durable_memory(ctx)

    def test_durable_memory_rejects_a_chat_that_does_not_trigger_its_checkpoint(self):
        ctx = SimpleNamespace(inst=Mock(), state={'model': 'fixture-model'})
        ctx.state['access_last_chat'] = {'browser': Mock()}
        fixture = access.Fixture(access.kind_named('kb_document'), 'memory-kb', 'Memory')
        with patch.object(access, 'renew'), patch.object(access, 'create', return_value=fixture), \
             patch.object(access, 'configured_agent', return_value='memory-agent'), \
             patch.object(access, 'chat', return_value=[{'type': 'assistant',
                 'metadata': {'tokens': {'context_tokens': 853}}}]), self.assertRaises(Failure):
            access.regression_durable_memory(ctx)
        ctx.inst.wait.assert_not_called()

    def test_configured_agent_persists_the_declared_agent_checkpoint_options(self):
        ctx = SimpleNamespace(state={'model': 'fixture-model'})
        policy = {'checkpoint': {'token_threshold': 2000}}
        response = [{'traits': []}, {'component_id': 'memory-agent'},
                    {'agent': {'title': 'Memory', 'traits': [], 'agent_options': policy}}]
        with patch.object(access, 'request', side_effect=response) as request:
            access.configured_agent(ctx, 'write', 'Memory', agent_options=policy)
        self.assertEqual(request.call_args_list[1].args[4]['agent_options'], policy)

    def test_logout_signs_in_from_the_existing_form_without_reloading_it(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.inst.base = 'http://smoke'
        ctx.inst.email, ctx.inst.password = 'owner@example.invalid', 'fixture-password'
        ctx.browser.errors = []
        ctx.browser.page.url = 'http://smoke/login'
        ctx.browser.login.side_effect = AssertionError('Reload cancels the login page module request')
        ctx.browser.page.expect_response.return_value = nullcontext(SimpleNamespace(value=SimpleNamespace(status=200)))
        ctx.inst.request.side_effect = [{'success': True}, {'error': 'Unauthorized'}]
        with patch.object(core, 'account'), patch.object(core, 'member_token', return_value='member-token'):
            core.core_logout(ctx)
        ctx.browser.login.assert_not_called()
        ctx.browser.page.get_by_label.assert_any_call('Email')
        ctx.browser.page.get_by_label.assert_any_call('Password')
        ctx.browser.page.wait_for_url.assert_called_once_with('http://smoke/', timeout=30000)
        self.assertEqual(ctx.inst.request.call_args.kwargs['expect'], (401,))

    def test_logout_keeps_the_existing_form_sign_in_response_guard(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.inst.base = 'http://smoke'
        ctx.browser.errors = []
        ctx.browser.page.url = 'http://smoke/login'
        ctx.browser.page.expect_response.return_value = nullcontext(SimpleNamespace(value=SimpleNamespace(status=403)))
        with patch.object(core, 'account'), self.assertRaises(Failure):
            core.core_logout(ctx)
        ctx.inst.request.assert_not_called()

    def test_user_delete_reads_the_declared_result_envelope_and_checks_physical_cleanup(self):
        ctx = SimpleNamespace(inst=Mock())
        user = {'user_id': 'user-id'}
        with patch.object(access, 'request', side_effect=[{'user': user},
                {'success': True, 'result': {'user_id': 'user-id', 'deletion_queued': True}}]):
            access.regression_lifecycle_reaper(ctx)
        ctx.inst.wait.assert_called_once()

    def test_system_lifecycle_matrix_exercises_granted_reads_admin_delegation_and_revocation(self):
        ctx = SimpleNamespace(inst=Mock(), state={})
        fixture = access.Fixture(access.kind_named('lifecycle'), 'lifecycle-id', 'Lifecycle',
            {'scope': 'system', 'declaration': {'meta': {'provision': {'grants': [
                {'subject_id': 'app.security:user', 'subject_type': 'group', 'access_mask': 2}]}}}})
        with patch.object(access, 'create', return_value=fixture), patch.object(access, 'default_access'), \
             patch.object(access, 'read') as read, patch.object(access, 'update'), \
             patch.object(access, 'primary'), patch.object(access, 'cascade'), patch.object(access, 'delete'), \
             patch.object(access, 'actor_id', return_value='reader-id'), \
             patch.object(access, 'share') as share, patch.object(access, 'request', return_value={'events': []}):
            access.matrix(ctx, fixture.kind, 'owner')
        share.assert_any_call(ctx, fixture, 'read', 1)
        share.assert_any_call(ctx, fixture, 'write', 9)
        share.assert_any_call(ctx, fixture, 'read', 1, role='write')
        share.assert_any_call(ctx, fixture, 'read', revoke=True)
        share.assert_any_call(ctx, fixture, 'app.security:user', 2, group=True)
        read.assert_any_call(ctx, fixture, 'read')
        read.assert_any_call(ctx, fixture, 'read', hidden=True)

    def test_lifecycle_inputs_reject_public_framework_attestations_even_with_write(self):
        ctx = SimpleNamespace(inst=Mock(), state={})
        fixture = access.Fixture(access.kind_named('lifecycle'), 'lifecycle-id', 'Lifecycle')
        with patch.object(access, 'request', return_value={'events': []}) as request:
            access.primary(ctx, fixture, 'write')
        calls = [c for c in request.call_args_list if c.args[2] == 'POST']
        self.assertEqual(len(calls), 1)
        self.assertEqual(calls[0].kwargs['expect'], (403,))

    def test_dashboard_matrix_checks_the_declared_authenticated_surface_without_inventing_a_kind(self):
        ctx = SimpleNamespace(inst=Mock(), state={})
        value = {'success': True, 'count': 1, 'surfaces': [{'id': 'surface'}]}
        with patch.object(access, 'request', return_value=value) as request:
            access.matrix(ctx, access.kind_named('dashboard'), 'stranger')
        request.assert_called_once_with(ctx, 'stranger', 'GET', '/dashboard/overview')

    def test_mcp_credential_matrix_uses_the_actor_scoped_management_contract(self):
        ctx = SimpleNamespace(inst=Mock(), state={})
        with patch.object(access, 'private_resource_matrix') as matrix:
            access.matrix(ctx, access.kind_named('mcp_credential'), 'read')
        matrix.assert_called_once_with(ctx, access.kind_named('mcp_credential'), 'read')

    def test_actor_scoped_credentials_do_not_claim_component_sharing_coverage(self):
        features = access.matrix_features(access.kind_named('mcp_credential'))
        self.assertTrue(features)
        self.assertTrue(all(f.startswith('kickside/mcp|http|') or f.startswith('kickside/knowledge|http|')
                            for f in features))

    def test_oauth_kind_claims_its_owning_path_and_real_connection_contract_checks(self):
        kind = access.Kind('binding_kickside_oauth_oauth_connection', 'kickside/oauth', 'kickside.oauth:oauth_connection')
        features = access.matrix_features(kind)
        self.assertEqual(set(features), set(access.SHARE_FEATURES + access.http('chestor/workspace',
            'POST /api/v1/workspace/entries', 'GET /api/v1/workspace/entries/{id}',
            'POST /api/v1/workspace/entries/{id}/move', 'DELETE /api/v1/workspace/entries/{id}') +
            access.http('kickside/oauth', 'GET /api/v1/oauth/providers/discover',
            'POST /api/v1/oauth/providers/{provider_name}/init', 'GET /api/v1/oauth/connections/{component_id}',
            'PUT /api/v1/oauth/connections/{component_id}') + access.http('kickside/connection',
            'DELETE /api/v1/connections/{id}') + access.http('kickside/mcp',
            'POST /api/v1/mcp/credentials', 'DELETE /api/v1/mcp/credentials/{id}', 'POST /api/public/mcp') +
            ('kickside/google|mcp_tool|kickside.google.traits:gmail_read_tool',
             'kickside/oauth|workspace_kind|kickside.oauth:oauth_connection')))

    def test_remote_mcp_oauth_kind_declares_the_oauth_and_authenticated_discovery_paths(self):
        kind = access.Kind('binding_kickside_mcp_client_oauth_connection', 'kickside/mcp-client',
                           'kickside.mcp_client.oauth:connection')
        self.assertIn(kind.binding, {candidate.binding for candidate in access.KINDS})
        features = access.matrix_features(kind)
        self.assertIn('kickside/oauth|http|POST /api/v1/oauth/providers/{provider_name}/init', features)
        self.assertIn('kickside/oauth|http|GET /api/v1/oauth/connections/{component_id}', features)
        self.assertIn('kickside/connection|http|POST /api/v1/connections/{id}/discover_resources', features)
        self.assertIn('kickside/mcp-client|workspace_kind|kickside.mcp_client.oauth:connection', features)

    def test_oauth_audit_reads_full_registry_contract_data(self):
        binding = 'kickside.oauth:oauth_connection'
        kind = access.Kind('binding_oauth', 'kickside/oauth', binding)
        ctx = SimpleNamespace(inst=Mock(), state={'access_declarations': {binding: {'meta': {}}}})
        declaration = {'meta': {}, 'data': {'contracts': [{'contract': 'kickside.oauth:oauth_connection_contract'}]}}
        fixture = access.Fixture(kind, 'oauth-fixture', 'Northwind OAuth')
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'create', return_value=fixture) as create, \
             patch.object(access, 'read'), patch.object(access, 'primary'), patch.object(access, 'produce_event'), \
             patch.object(access, 'update'), patch.object(access, 'share') as share, \
             patch.object(access, 'delete'), patch.object(access, 'cascade'), \
             patch.object(access, 'request', side_effect=[{'entry': declaration}, {'providers': []},
                    {'success': False, 'error': 'not found'}, {'success': False, 'error': 'not found'}]) as request:
            access.matrix(ctx, kind, 'owner')
        self.assertIn('/keeper/registry/entry?id=', request.call_args_list[0].args[3])
        create.assert_called_once_with(ctx, kind)
        self.assertEqual(share.call_count, 8)

    def test_hub_model_recommendations_require_model_onboarding(self):
        scenario = next(s for s in core.REGISTRY if s.name == 'core_hub_recommendations')
        self.assertEqual(scenario.requires, ('core_platform',))

    def test_provisioned_user_fixture_logs_in_after_installing_the_kind(self):
        ctx = SimpleNamespace(inst=Mock(), state={'access_declarations': {
            'kickside.inbox:inbox_binding': {'meta': {'class': ['kickside.inbox'], 'provision': {'scope': 'user'}}}}})
        ctx.inst.install.return_value = None
        fixture = access.Fixture(access.kind_named('inbox'), 'own-inbox', 'Inbox')
        calls = []
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'actor_browser', side_effect=lambda *a: calls.append('login')), \
             patch.object(access, 'provisioned', side_effect=lambda *a: calls.append('provision') or fixture), \
             patch.object(access, 'request', side_effect=[{'events': []}, {'item': {'id': 'item'}}, {'events': []}]):
            with self.assertRaises(Failure):
                access.create(ctx, fixture.kind, 'write')
        self.assertEqual(calls, ['login', 'provision'])

    def test_actor_browser_uses_an_isolated_context_before_account_navigation(self):
        ctx = SimpleNamespace(browser=Mock(), browser_check=Mock(), state={}, inst=Mock())
        browser = ctx.browser_check.return_value
        browser.errors = []
        browser.frame.locator.return_value.count.return_value = 0
        with patch.object(access.Browser, 'release') as release:
            access.actor_browser(ctx, 'owner')
        release.assert_called_once_with(ctx)
        ctx.browser_check.assert_called_once_with()
        browser.login.assert_called_once_with()

    def test_skill_fixture_supplies_the_declared_storage_requirement(self):
        ctx = SimpleNamespace(inst=Mock(), state={'access_declarations': {}})
        profile = {'entry': {'data': {'packages': [{'component': 'kickside/skills',
                   'parameters': [{'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}]}]}}}
        with patch.object(access, 'renew'), patch.object(access, 'registry'), \
             patch.object(access, 'request', return_value=profile):
            with self.assertRaises(Failure):
                access.create(ctx, access.kind_named('skill'))
        ctx.inst.install.assert_called_once_with('kickside/skills', parameters=[
            {'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}])

    def test_wiki_keyboard_waits_for_content_after_the_heading_opens(self):
        ctx = SimpleNamespace(inst=Mock(), state={'access_browser_error_start': 0})
        browser = Mock()
        wiki = browser.frame.locator.return_value
        loaded = []
        wiki.get_by_text.return_value.first.wait_for.side_effect = lambda **kw: loaded.append(True)
        wiki.inner_text.return_value = ''
        wiki.get_by_text.return_value.first.is_visible.side_effect = lambda: bool(loaded)
        fixture = access.Fixture(access.kind_named('kb_wiki'), 'wiki', 'Wiki')
        with patch.object(access, 'create', return_value=fixture),              patch.object(access, 'request', return_value={'success': True}),              patch.object(access, 'open_knowledge', return_value=browser):
            access.regression_wiki_keyboard(ctx)
        self.assertEqual(wiki.get_by_text.call_args_list, [
            call('NW-KEYBOARD-731', exact=False), call('NW-KEYBOARD-731', exact=False)])
        wiki.get_by_text.return_value.first.is_visible.assert_called_once_with()
        wiki.get_by_text.return_value.first.wait_for.assert_called_once_with(timeout=30000)

    def test_onboarding_model_selections_settle_each_save_and_verify_class_winners(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        models = Mock()
        selects = [Mock(), Mock()]
        selects[0].get_attribute.return_value = 'Model for Fast'
        selects[1].get_attribute.return_value = 'Model for Embeddings'
        models.get_by_role.return_value.all.return_value = selects
        classes = {'classes': [{'name': 'fast', 'title': 'Fast', 'models': [{'name': 'gemma'}]},
                               {'name': 'embed', 'title': 'Embeddings', 'models': [{'name': 'qwen'}]}]}
        ctx.inst.request.return_value = classes
        actions = []
        ctx.browser.frame.get_by_role.return_value.click.side_effect = lambda: actions.append('select')
        ctx.browser.settle.side_effect = lambda: actions.append('settle')
        common.select_onboarding_models(ctx, models, {'name': 'gemma', 'title': 'Gemma'},
                                        {'name': 'qwen', 'title': 'Qwen'})
        self.assertEqual(actions, ['select', 'settle', 'select', 'settle'])
        ctx.inst.request.return_value = {'classes': [{'title': 'Fast', 'models': [{'name': 'kev'}]},
                                                    classes['classes'][1]]}
        with self.assertRaises(Failure):
            common.select_onboarding_models(ctx, models, {'name': 'gemma', 'title': 'Gemma'},
                                            {'name': 'qwen', 'title': 'Qwen'})

    def test_research_access_checks_grounded_durable_report_in_the_declared_format(self):
        fixture = access.Fixture(access.kind_named('research'), 'research', 'Research')
        ctx = SimpleNamespace(inst=Mock(), state={})
        ctx.inst.wait.side_effect = lambda completed, *a, **kw: completed()
        report = '# Northwind inventory\n47 crates and 12 reserve crates.'
        value = {'run': {'status': 'complete', 'result_md': report},
                 'events': [{'type': 'kickside.research.events:result', 'body': {'markdown': report}}]}
        with patch.object(access, 'read', return_value=value):
            self.assertEqual(access.primary(ctx, fixture, 'owner'), value)
        for broken in (
            {**value, 'events': []},
            {**value, 'run': {'status': 'complete', 'result_md': 'Another result'}},
            {'run': {'status': 'complete', 'result_md': 'Unrelated report'},
             'events': [{'type': 'kickside.research.events:result', 'body': {'markdown': 'Unrelated report'}}]},
        ):
            with self.subTest(value=broken), patch.object(access, 'read', return_value=broken):
                with self.assertRaises(Failure):
                    access.primary(ctx, fixture, 'owner')

    def test_research_event_production_uses_the_declared_progress_event(self):
        fixture = access.Fixture(access.kind_named('research'), 'research-id', 'Research')
        ctx = SimpleNamespace(inst=Mock(), state={})
        with patch.object(access, 'request', side_effect=[{'events': []}, {'success': True},
                {'events': [{'type': 'kickside.research.events:progress', 'body': {'step': 'new'}}]}]) as request, \
             patch.object(access, 'update') as update:
            access.produce_event(ctx, fixture, 'write')
        update.assert_not_called()
        self.assertEqual(request.call_args_list[1].args[3], '/threads/research-id/events')
        self.assertEqual(request.call_args_list[1].args[4]['type'], 'kickside.research.events:progress')
        self.assertEqual(request.call_args_list[1].kwargs['expect'], (201,))

    def test_upload_event_production_accepts_the_thread_creation_receipt(self):
        fixture = access.Fixture(access.kind_named('uploads'), 'container', 'Uploads', {'upload': 'upload'})
        ctx = SimpleNamespace(inst=Mock(), state={})
        with patch.object(access, 'request', side_effect=[{'events': []}, {'success': True},
                {'events': [{'body': {'filename': 'NW-PRODUCER-test'}}]}]) as request, \
             patch.object(access.uuid, 'uuid4', return_value=SimpleNamespace(hex='test')):
            access.produce_event(ctx, fixture, 'write')
        self.assertEqual(request.call_args_list[1].kwargs['expect'], (201,))

    def test_redirect_checks_the_declared_control_config_system_message(self):
        ctx = SimpleNamespace(inst=Mock(), browser=Mock())
        ctx.browser.frames = []
        rows = [{'type': 'system', 'metadata': {'system_action': 'config_change', 'new_agent': 'user_agent:target'}},
                {'type': 'assistant', 'data': 'NW-REDIRECT-731 17'}]
        with patch.object(ai, 'create_agent', side_effect=['target', 'router']), \
             patch.object(ai, 'start_chat', return_value='session'), patch.object(ai, 'messages', return_value=rows), \
             patch.object(ai, 'tool_events'), patch.object(ai, 'hero_shot'):
            ai.redirect_chat(ctx)

    def test_cross_user_review_grants_write_on_the_assignee_inbox_before_simulation(self):
        ctx = SimpleNamespace(inst=Mock(), state={'access_owner_id': 'owner-id'})
        fixture = access.Fixture(access.kind_named('inbox'), 'reviewer-inbox', 'Inbox')
        calls = []
        def request(*args, **kwargs):
            calls.append(args)
            if args[3] == '/workflows': return {'flow_id': 'flow'}
            if args[3].endswith('/simulate'): raise RuntimeError('stop after simulation setup')
            return {'success': True}
        with patch.object(access, 'renew'), patch.object(access, 'actor_id', return_value='reviewer-id'), \
             patch.object(access, 'create', return_value=fixture), patch.object(access, 'request', side_effect=request):
            with self.assertRaises(RuntimeError): access.regression_cross_user_review(ctx)
        grants = [c for c in calls if c[3] == '/component-access/share/reviewer-inbox']
        self.assertEqual(len(grants), 1)
        self.assertEqual(grants[0][1], 'write')
        self.assertEqual(grants[0][4], {'subject_id': 'owner-id', 'subject_type': 'user', 'access_mask': 2})
        self.assertLess(calls.index(grants[0]), next(i for i,c in enumerate(calls) if c[3].endswith('/simulate')))

    def test_shared_inbox_writer_targets_the_shared_thread_and_uses_a_valid_event(self):
        fixture = access.Fixture(access.kind_named('inbox'), 'shared-inbox', 'Inbox')
        ctx = SimpleNamespace(inst=Mock(), state={})
        posted = []
        def request(*args, **kwargs):
            if args[2] == 'POST':
                self.assertEqual(args[3], '/threads/shared-inbox/events')
                self.assertEqual(args[4]['type'], 'kickside.inbox.events:item.created')
                self.assertTrue({'id', 'item_type', 'title'}.issubset(args[4]['body']))
                self.assertEqual(kwargs['expect'], (201,))
                posted.append(args[4]['body'])
                return {'success': True}
            return {'events': [{'seq': i + 1, 'body': row} for i, row in enumerate(posted)]}
        with patch.object(access, 'request', side_effect=request), patch.object(access, 'actor_id', return_value='owner'):
            access.primary(ctx, fixture, 'write')
        self.assertEqual(len(posted), 1)

    def check_denied_inbox_window(self, illegal=False, background_count=1):
        fixture = access.Fixture(access.kind_named('inbox'), 'shared-inbox', 'Inbox')
        ctx = SimpleNamespace(inst=Mock(), state={})
        events = [{'seq': 1, 'body': {'id': 'earlier-notice'}}]
        paths = []
        def request(*args, **kwargs):
            paths.append(args[3])
            if args[2] == 'POST':
                self.assertTrue(kwargs['denied'])
                for _ in range(background_count):
                    events.append({'seq': len(events) + 1, 'body': {'id': 'scheduled-' + str(len(events)),
                                   'title': 'Northwind scheduled notice'}})
                if illegal:
                    events.append({'seq': len(events) + 1, 'body': args[4]['body']})
                return {'success': False, 'error': 'write access denied'}
            query = parse_qs(urlsplit(args[3]).query)
            start, end = int(query.get('from_seq', ['0'])[0]), int(query.get('to_seq', [str(len(events))])[0])
            rows = [e for e in events if start <= e['seq'] <= end]
            if query.get('ascending', ['false'])[0] != 'true': rows.reverse()
            return {'events': rows[:int(query.get('limit', ['200'])[0])]}
        with patch.object(access, 'request', side_effect=request), patch.object(access, 'actor_id', return_value='owner'):
            access.primary(ctx, fixture, 'read', denied=True)
        return paths

    def test_denied_inbox_write_allows_independent_scheduled_notices(self):
        self.check_denied_inbox_window()

    def test_denied_inbox_write_rejects_its_notice_after_other_producers_append(self):
        with self.assertRaises(Failure):
            self.check_denied_inbox_window(illegal=True)

    def test_denied_inbox_write_checks_the_entire_fixed_sequence_interval(self):
        with self.assertRaises(Failure):
            self.check_denied_inbox_window(illegal=True, background_count=250)

    def test_inbox_reader_finds_its_notice_before_the_latest_page(self):
        fixture = access.Fixture(access.kind_named('inbox'), 'shared-inbox', 'Inbox',
                                 {'inbox_item': 'fixture-notice', 'notice_marker': 'fixture-marker', 'inbox_from_seq': 5})
        ctx = SimpleNamespace(inst=Mock(), state={})
        notices = [{'seq': 6, 'body': {'id': 'fixture-notice', 'title': 'fixture-marker'}}]
        notices += [{'seq': i, 'body': {'id': 'scheduled-' + str(i)}} for i in range(7, 260)]
        def request(*args, **kwargs):
            query = parse_qs(urlsplit(args[3]).query)
            start, end = int(query.get('from_seq', ['0'])[0]), int(query.get('to_seq', ['259'])[0])
            rows = [e for e in notices if start <= e['seq'] <= end]
            if query.get('ascending', ['false'])[0] != 'true': rows.reverse()
            return {'events': rows[:int(query.get('limit', ['200'])[0])]}
        with patch.object(access, 'request', side_effect=request):
            access.primary(ctx, fixture, 'read', readonly=True)

    def test_provisioned_kind_coverage_excludes_workspace_creation_and_move(self):
        for name in ('inbox', 'uploads', 'lifecycle'):
            features = access.matrix_features(access.kind_named(name))
            self.assertFalse(any(f.startswith('chestor/workspace|') for f in features), name)

    def test_denied_knowledge_delete_preserves_data_while_materialization_updates_its_timestamp(self):
        fixture = access.Fixture(access.kind_named('kb_wiki'), 'kb', 'Wiki')
        ctx = SimpleNamespace(inst=Mock(), state={})
        before = {'id': 'kb', 'name': 'Wiki', 'config': {'depth': 3}, 'updated_at': 'before'}
        after = {**before, 'updated_at': 'after'}
        with patch.object(access, 'read', side_effect=[before, after]), patch.object(access, 'request', return_value={'thread': {'attrs': {}}, 'events': []}):
            access.delete(ctx, fixture, 'stranger', denied=True)
        changed = {**after, 'config': {'depth': 4}}
        with patch.object(access, 'read', side_effect=[before, changed]), patch.object(access, 'request', return_value={'thread': {'attrs': {}}, 'events': []}):
            with self.assertRaises(Failure): access.delete(ctx, fixture, 'stranger', denied=True)

    def check_denied_knowledge_mutation_during_description_projection(self, mutation):
        fixture = access.Fixture(access.kind_named('kb_document'), 'kb', 'Northwind')
        ctx = SimpleNamespace(inst=Mock(), state={})
        before = {'id': 'kb', 'name': 'Northwind', 'description': 'Stored description',
                  'config': {'depth': 3}, 'document_count': 1, 'updated_at': 'before',
                  'auto_description': '', 'auto_summary': ''}
        after = {**before, 'updated_at': 'after', 'auto_description': 'Generated description',
                 'auto_summary': 'Generated summary', 'document_count': 2}
        with patch.object(access, 'read', side_effect=[before, after]), patch.object(access, 'request', return_value={'thread': {'attrs': {}}, 'events': []}) as request:
            mutation(ctx, fixture, 'stranger', denied=True)
        self.assertTrue(next(call for call in request.call_args_list if call.kwargs.get('denied')).kwargs['denied'])
        for field, value in (('name', 'Unauthorized'), ('description', 'Unauthorized'),
                             ('config', {'depth': 4})):
            with self.subTest(field=field):
                changed = {**after, field: value}
                with patch.object(access, 'read', side_effect=[before, changed]), patch.object(access, 'request', return_value={'thread': {'attrs': {}}, 'events': []}):
                    with self.assertRaises(Failure): mutation(ctx, fixture, 'stranger', denied=True)

    def test_denied_knowledge_write_preserves_data_during_description_projection(self):
        self.check_denied_knowledge_mutation_during_description_projection(access.update)

    def test_denied_knowledge_delete_preserves_data_during_description_projection(self):
        self.check_denied_knowledge_mutation_during_description_projection(access.delete)

    def test_denied_write_preserves_authored_state_while_unthreaded_resources_materialize(self):
        kind = access.Kind('binding', 'module', 'module:binding')
        fixture = access.Fixture(kind, 'resource', 'Northwind', {'declaration': {'meta': {}, 'data': {}}})
        ctx = SimpleNamespace(inst=Mock(), state={})
        before = {'id': 'resource', 'name': 'Northwind', 'description': 'Stored', 'config': {'depth': 3},
                  'parent_id': 'folder', 'document_count': 0, 'status': 'syncing', 'updated_at': 'before'}
        after = {**before, 'document_count': 1, 'status': 'ready', 'updated_at': 'after'}
        for mutation in (access.update, access.delete):
            with self.subTest(mutation=mutation.__name__), patch.object(access, 'read', side_effect=[before, after]), \
                    patch.object(access, 'request', return_value={'success': False, 'error': 'access denied'}):
                mutation(ctx, fixture, 'stranger', denied=True)
            for field, value in (('id', 'other'), ('name', 'Unauthorized'), ('description', 'Unauthorized'),
                                 ('config', {'depth': 4}), ('parent_id', 'other')):
                with self.subTest(mutation=mutation.__name__, field=field), \
                        patch.object(access, 'read', side_effect=[before, {**after, field: value}]), \
                        patch.object(access, 'request', return_value={'success': False, 'error': 'access denied'}):
                    with self.assertRaises(Failure):
                        mutation(ctx, fixture, 'stranger', denied=True)

    def test_binary_upload_without_a_workspace_parent_uses_its_declared_file_part(self):
        ctx = SimpleNamespace(inst=Mock())
        path = SimpleNamespace(name='notice.pdf', read_bytes=lambda: b'%PDF-fixture')
        with patch.object(access, 'request', return_value={'uuid': 'upload'}) as request:
            self.assertEqual(access.upload_path(ctx, 'write', path), 'upload')
        raw = request.call_args.kwargs['raw']
        self.assertIn(b'%PDF-fixture', raw)
        self.assertNotIn(b'name="metadata"', raw)
        self.assertEqual(request.call_args.kwargs['timeout'], 120)

    def test_binary_upload_supplies_the_declared_parent_metadata_when_requested(self):
        ctx = SimpleNamespace(inst=Mock())
        path = SimpleNamespace(name='notice.pdf', read_bytes=lambda: b'%PDF-fixture')
        with patch.object(access, 'request', return_value={'uuid': 'upload'}) as request:
            self.assertEqual(access.upload_path(ctx, 'write', path, target_parent_id='folder'), 'upload')
        raw = request.call_args.kwargs['raw']
        self.assertIn(b'name="metadata"', raw)
        self.assertIn(b'{"target_parent_id": "folder"}', raw)
        self.assertIn(b'%PDF-fixture', raw)

    def test_dxf_fixture_dependency_is_declared_without_a_version_pin(self):
        from pathlib import Path
        requirements = (Path(access.__file__).parent / 'requirements.txt').read_text().splitlines()
        self.assertIn('ezdxf', requirements)

    def test_hidden_component_accepts_declared_denial_statuses_and_rejects_server_errors(self):
        for status in (403, 404, 400, 500):
            with self.subTest(status=status):
                def response(*args, **kwargs):
                    if status not in kwargs['expect']:
                        raise Failure('unexpected status')
                    return {'success': False, 'error': 'access denied'}
                ctx = SimpleNamespace(inst=SimpleNamespace(token='owner', request=Mock(side_effect=response)), state={})
                if status in (403, 404):
                    access.request(ctx, 'owner', 'GET', '/knowledge/id', hidden=True)
                else:
                    with self.assertRaises(Failure):
                        access.request(ctx, 'owner', 'GET', '/knowledge/id', hidden=True)


if __name__ == '__main__':
    unittest.main()
