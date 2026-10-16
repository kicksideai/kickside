from scenarios import Context
from runtime import RuntimePool
from pathlib import Path
from harness import Cleanup
import unittest
from unittest.mock import MagicMock, Mock
from browser import Browser
import scenarios_providers

class ProviderDiscoveryReadiness(unittest.TestCase):
    def instance(self):
        inst = Mock()
        inst.wait.side_effect = lambda condition, label: condition() or condition()
        return inst

    def test_waits_for_exact_provider_under_configuring_authority(self):
        inst = self.instance()
        selected = {'impl_id': 'provider.connection:selected', 'provider': 'selected'}
        inst.request.side_effect = [
            {'success': True, 'providers': [{'impl_id': 'provider.connection:other'}]},
            {'success': True, 'providers': [selected]},
        ]
        actual = scenarios_providers.wait_for_provider(inst, selected['impl_id'], auth='operator')
        self.assertEqual(actual, selected)
        self.assertEqual(inst.request.call_count, 2)
        for call in inst.request.call_args_list:
            self.assertEqual(call.args, ('GET', '/api/v1/connections/providers/discover'))
            self.assertEqual(call.kwargs['auth'], 'operator')
        self.assertEqual(len(inst.wait.call_args.args), 2)
        self.assertEqual(inst.wait.call_args.kwargs, {})

    def test_discovery_failure_propagates_without_an_authority_fallback(self):
        inst = self.instance()
        refused = RuntimeError('native provider discovery refuses the operator')
        inst.request.side_effect = refused
        with self.assertRaises(RuntimeError) as caught:
            scenarios_providers.wait_for_provider(inst, 'provider.connection:selected', auth='operator')
        self.assertIs(caught.exception, refused)
        self.assertEqual(inst.request.call_count, 1)
        self.assertEqual(inst.request.call_args.kwargs['auth'], 'operator')

    def test_unsuccessful_payload_does_not_admit_an_available_provider(self):
        from harness import Failure
        inst = self.instance()
        inst.request.return_value = {'success': False, 'providers': [{'impl_id': 'provider.connection:selected'}]}
        with self.assertRaises(Failure):
            scenarios_providers.wait_for_provider(inst, 'provider.connection:selected', auth='operator')

class ProviderSetup(unittest.TestCase):
    def test_probe_waits_for_credential_tool_projection_before_use(self):
        import os
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory))
            (inst.app / 'src').mkdir()
            inst.request.return_value = {'credential': {'token': 'fictional', 'credential_id': 'credential'}}
            inst.wait.side_effect = lambda condition, label: condition() or condition()
            client = Mock()
            client.tools.side_effect = [set(), {'NorthwindProviderProbe'}]
            ctx = Context(inst)
            with patch.object(scenarios_providers, 'load_fixture'), \
                 patch.object(scenarios_providers, 'MCPClient', return_value=client):
                scenarios_providers.install_probe(ctx)
            self.assertEqual(client.tools.call_count, 2)
            self.assertIs(ctx.state['provider_probe_client'], client)

    def test_probe_tool_projection_error_propagates(self):
        import os
        import tempfile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory))
            (inst.app / 'src').mkdir()
            inst.request.return_value = {'credential': {'token': 'fictional', 'credential_id': 'credential'}}
            inst.wait.side_effect = lambda condition, label: condition()
            client = Mock()
            failure = RuntimeError('credential projection fails')
            client.tools.side_effect = failure
            with patch.object(scenarios_providers, 'load_fixture'), \
                 patch.object(scenarios_providers, 'MCPClient', return_value=client):
                with self.assertRaises(RuntimeError) as caught:
                    scenarios_providers.install_probe(Context(inst))
            self.assertIs(caught.exception, failure)

    def test_probe_refreshes_shared_instance_fixture_with_current_grants(self):
        import os
        import tempfile
        import yaml
        from unittest.mock import patch
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory))
            (inst.app / 'src').mkdir()
            inst.request.return_value = {'credential': {'token': 'fictional', 'credential_id': 'credential'}}
            ctx = Context(inst)
            with patch.object(scenarios_providers, 'load_fixture'):
                scenarios_providers.install_probe(ctx)
                ctx.state['probe_http_resources'] = ['https://example.com/*']
                scenarios_providers.install_probe(ctx)
            entries = yaml.safe_load((inst.app / 'src/provider-smoke/_index.yaml').read_text())['entries']
            self.assertEqual(entries[0]['policy']['resources'], ['https://example.com/*'])
            self.assertEqual(len([e for e in entries if e['name'] == 'probe']), 1)

    def test_local_declarations_load_without_filesystem_upload(self):
        instance = Mock()
        instance.cleanup = Cleanup()
        ctx = Context(instance)
        pool = RuntimePool({}, 'sqlite', Path('.'))
        pool.contexts = {'fixture': ctx}
        ctx.restart_runtime = pool.restart
        scenarios_providers.load_fixture(ctx)
        self.assertEqual([call[0] for call in instance.mock_calls], ['preserve_dependencies','stop','start','manifest','install'])
        instance.install.assert_called_once_with("kickside/mcp")
        instance.request.assert_not_called()

    def test_jira_page_follows_pullable_next_cursor(self):
        from unittest.mock import patch
        ctx = Mock()
        ctx.state = {'jira_connection':'northwind-connection'}
        pages = [
            {'items':[{'item_key':'NW-1'}],'has_more':True,'next_cursor':{'nextPageToken':'northwind-page-1'}},
            {'items':[{'item_key':'NW-2'},{'item_key':'NW-3'}],'has_more':False},
        ]
        with patch.object(scenarios_providers,'probe',side_effect=pages) as call:
            scenarios_providers.jira_source_pagination(ctx)
        self.assertEqual(call.call_args_list[1].kwargs['arguments']['cursor'],{'nextPageToken':'northwind-page-1'})

    def test_sink_requests_supply_identity_and_operation(self):
        from unittest.mock import patch
        ctx = Mock()
        ctx.state = {'jira_connection':'northwind-connection'}
        pages = [{'success':True,'dest_ref':{'issue_key':'NW-4'}},{'issue':{'summary':'Northwind sink delivery'}},{'items':[{'payload':{'content':'NORTHWIND-SINK-731'}}]}]
        with patch.object(scenarios_providers,'probe',side_effect=pages) as call:
            scenarios_providers.atlassian_sink(ctx,'jira')
        request = call.call_args_list[0].kwargs['arguments']
        self.assertEqual(request['sink_op'],'create')
        self.assertTrue(request['identity_key'])
        self.assertTrue(request['idempotency_key'])

    def test_confluence_reads_request_content_action(self):
        from unittest.mock import patch
        ctx = Mock()
        ctx.state = {'confluence_connection':'northwind-connection'}
        def call(**args):
            operation = args['arguments']['action']
            if operation == 'create_page':
                return {'page_id':'732'}
            if operation == 'update_page':
                return {'success':True}
            if operation == 'read_page':
                return {'page':{'content':'NORTHWIND-CONFLUENCE-731 NORTHWIND-WRITE-731','title':'Northwind packed checklist'}}
            return {'page':{'title':'Northwind shipping handbook'}}
        with patch.object(scenarios_providers,'probe',side_effect=lambda ctx,**args:call(**args)):
            scenarios_providers.confluence_tools(ctx)

    def test_connections_view_asserts_rotated_display_name(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        connection_icon = Mock()
        provider_icon = Mock()
        connection_card = Mock()
        connection_card.count.return_value = 1
        connection_card.locator.return_value = connection_icon
        provider_card = Mock()
        provider_card.count.return_value = 1
        provider_card.locator.return_value = provider_icon
        live_cards = Mock()
        live_cards.filter.return_value = connection_card
        provider_cards = Mock()
        provider_cards.filter.return_value = provider_card
        page = Mock()
        page.locator.side_effect = lambda selector: live_cards if selector == '.live-card' else provider_cards
        browser.frame.locator.return_value = page
        ctx.inst.request.side_effect = [
            {'connections': [{'name': 'Northwind jira', 'provider': 'jira', 'icon': 'tabler:brand-jira'}]},
            {'providers': [{'provider': 'jira', 'title': 'Jira', 'icon': 'tabler:brand-jira'}]},
            {'providers': []},
        ]
        def by_text(text,exact):
            if text not in ('Northwind jira','Northwind confluence','Northwind simplefin renewed'):
                raise AssertionError('name is stale: '+text)
            return Mock()
        page.get_by_text.side_effect = by_text
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(scenarios_providers,'nav'),patch.object(scenarios_providers,'assert_connection_icon_parity') as parity:
            scenarios_providers.provider_connections_ui(ctx)
        parity.assert_called_once_with(connection_icon, provider_icon, 'Northwind jira')

    def test_connection_icon_parity_rejects_different_rendered_icons(self):
        connection_icon = Mock()
        connection_icon.get_attribute.side_effect = ['iconify iconify--tabler', '0 0 24 24']
        connection_icon.inner_html.return_value = '<path d="connection"/>'
        provider_icon = Mock()
        provider_icon.get_attribute.side_effect = ['iconify iconify--tabler', '0 0 24 24']
        provider_icon.inner_html.return_value = '<path d="provider"/>'
        from harness import Failure
        with self.assertRaisesRegex(Failure, 'Connection card icon differs from its available-service icon'):
            scenarios_providers.assert_connection_icon_parity(connection_icon, provider_icon, 'Northwind provider')

    def test_connection_icon_parity_accepts_the_same_rendered_icon(self):
        connection_icon = Mock()
        connection_icon.get_attribute.side_effect = ['iconify iconify--tabler', '0 0 24 24']
        connection_icon.inner_html.return_value = '<path d="provider"/>'
        provider_icon = Mock()
        provider_icon.get_attribute.side_effect = ['iconify iconify--tabler', '0 0 24 24']
        provider_icon.inner_html.return_value = '<path d="provider"/>'
        scenarios_providers.assert_connection_icon_parity(connection_icon, provider_icon, 'Northwind provider')

    def test_settings_open_through_system_tab(self):
        from unittest.mock import patch
        ctx = Mock()
        with patch.object(scenarios_providers,'nav') as nav:
            scenarios_providers.open_settings(ctx)
        nav.assert_called_once_with(ctx,'System')
        ctx.browser.frame.get_by_role.assert_called_once_with('tab',name='Settings',exact=True)

    def test_oidc_egress_is_a_disposable_runtime_override(self):
        from pathlib import Path
        import os
        import tempfile
        import yaml
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = Mock()
            ctx.browser = None
            ctx.inst.app = Path(directory)
            (ctx.inst.app/'.wippy.yaml').write_text('version: "1.0"\n')
            original = ['kickside.sso.api:public_reader_policy','kickside.sso.api:flow_store_policy','kickside.sso.api:provider_http_egress_policy']
            ctx.inst.request.return_value = {'entry':{'data':{'security':{'policies':list(original)}}}}
            ctx.inst.cleanup = Cleanup()
            ctx.browser = None
            pool = RuntimePool({}, 'sqlite', Path(directory))
            pool.contexts = {'fixture': ctx}
            ctx.restart.side_effect = lambda: pool.restart(ctx)
            scenarios_providers.configure_oidc_security(ctx)
            values = yaml.safe_load((ctx.inst.app/'.wippy.yaml').read_text())['override']
            for fid in ('kickside.sso.api:start','kickside.sso.api:callback'):
                self.assertEqual(values[fid+':data.security.policies'],original+[scenarios_providers.NS+':egress',scenarios_providers.NS+':loopback'])
            self.assertTrue(all(call.args[0]=='GET' for call in ctx.inst.request.call_args_list))
            ctx.inst.stop.assert_called_once_with(hard=False)
            ctx.inst.start.assert_called_once()
            ctx.inst.manifest.assert_called_once()

    def test_sso_card_accepts_rendered_uppercase_client_label(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        card = browser.frame.locator.return_value
        card.inner_text.return_value = 'GOOGLE OAUTH CLIENT ID. GOOGLE OAUTH CLIENT SECRET.'
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(scenarios_providers,'open_settings'):
            scenarios_providers.sso_settings(ctx,'google','Google')

    def test_sso_settings_selects_single_sign_on_with_duplicate_provider_titles(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        browser.frame.get_by_text.return_value.first.click.side_effect = AssertionError(
            'GitHub and Google also declare an Integrations settings block')
        with patch.object(scenarios_providers, 'provider_browser', return_value=browser), \
             patch.object(scenarios_providers, 'open_settings'):
            scenarios_providers.sso_settings(ctx, 'github', 'GitHub')
        section = browser.frame.locator.return_value.locator.return_value
        section.filter.assert_called_once_with(has_text='Single sign-on')
        section.filter.return_value.get_by_role.assert_called_once_with('button', name='GitHub', exact=True)
        section.filter.return_value.get_by_role.return_value.click.assert_called_once_with()

    def test_oidc_login_uses_authorization_link(self):
        from unittest.mock import patch
        ctx = Mock()
        ctx.inst.base = 'http://127.0.0.1:731'
        ctx.inst.request.return_value = {'user': {
            'email': 'operator@northwind.example.invalid', 'metadata': {'auth_method': 'sso'}}}
        browser = Mock()
        callback = Mock(status=302)
        callback.header_value.return_value = '/login#sso_token=oidc-session'
        response = MagicMock()
        response.__enter__.return_value.value = callback
        browser.page.expect_response.return_value = response
        pending = [True]
        browser.settle.side_effect = lambda: pending.__setitem__(0, False)
        def navigate(*args, **kwargs):
            self.assertFalse(pending[0], 'OIDC navigation aborts unfinished shell requests')
        browser.page.goto.side_effect = navigate
        def selector(role,**kwargs):
            if role != 'link' or kwargs.get('name') != 'Continue with Generic OIDC':
                raise AssertionError('login offers an authorization link')
            return Mock()
        browser.page.get_by_role.side_effect = selector
        records = [{'path':'/token','status':200},{'path':'/jwks','status':200}]
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(ctx.fixtures,'requests',return_value=records):
            scenarios_providers.sso_oidc_login(ctx)
        ctx.inst.request.assert_called_once_with('GET', '/api/v1/user/me', auth='oidc-session', label='oidc-session-profile')
        ctx.inst.redactor.add.assert_called_once_with('oidc-session')
        ctx.inst.evidence.save.assert_called_once_with('oidc-callback', {'status': 302, 'session_minted': True, 'error': ''})

    def test_oidc_login_retains_authenticated_provider_session(self):
        from unittest.mock import patch
        ctx = Mock()
        ctx.inst.base = 'http://127.0.0.1:731'
        profile = {'id': 'original-human', 'email': 'operator@northwind.example.invalid',
                   'metadata': {'auth_method': 'sso'}}
        ctx.inst.request.return_value = {'user': profile}
        browser = Mock()
        callback = Mock(status=302)
        callback.header_value.return_value = '/login#sso_token=original-session'
        response = MagicMock()
        response.__enter__.return_value.value = callback
        browser.page.expect_response.return_value = response
        records = [{'path': '/token', 'status': 200}, {'path': '/jwks', 'status': 200}]
        with patch.object(scenarios_providers, 'provider_browser', return_value=browser), \
             patch.object(ctx.fixtures, 'requests', return_value=records):
            session = scenarios_providers.sso_oidc_login(ctx, restore_login=False)
        self.assertEqual(session, {'token': 'original-session', 'user': profile})
        browser.login.assert_not_called()
        browser.page.get_by_role.assert_called_once_with('link', name='Continue with Generic OIDC', exact=True)
        ctx.inst.request.assert_called_once_with('GET', '/api/v1/user/me', auth='original-session', label='oidc-session-profile')

    def test_login_completes_font_load_before_redirect(self):
        browser = Mock()
        browser.inst.base = 'http://127.0.0.1:731'
        browser.inst.email = 'operator@northwind.example.invalid'
        browser.inst.password = 'fictional-password'
        pending = [True]
        browser.page.evaluate.side_effect = lambda expression: pending.__setitem__(0,False)
        def click():
            if pending[0]:
                raise AssertionError('navigation aborts pending font request')
        browser.page.get_by_role.return_value.click.side_effect = click
        response = Mock()
        response.value.status = 200
        manager = Mock()
        manager.__enter__ = Mock(return_value=response)
        manager.__exit__ = Mock(return_value=False)
        browser.page.expect_response.return_value = manager
        Browser.login(browser)
        browser.page.evaluate.assert_called_once_with('document.fonts.ready')

    def test_sso_settings_assert_shadow_credential_controls(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        card = browser.frame.locator.return_value
        card.inner_text.return_value = ''
        card.locator.return_value.count.return_value = 2
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(scenarios_providers,'open_settings'):
            scenarios_providers.sso_settings(ctx,'google','Google')
        card.locator.assert_any_call('input[type="text"]')
        card.locator.assert_any_call('input[type="password"]')

    def test_integration_settings_selects_integrations_group(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        settings = browser.frame.locator.return_value
        settings.get_by_role.return_value.click.side_effect = AssertionError('provider title repeats in Single sign-on')
        settings.locator.return_value.locator.return_value.count.return_value = 2
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(scenarios_providers,'open_settings'):
            scenarios_providers.integration_settings(ctx,'google','Google')
        self.assertTrue(settings.locator.return_value.filter.called)

    def test_screenshot_masks_client_fields_by_rendered_label(self):
        browser = Mock()
        browser.inst.redactor.secrets = []
        browser.inst.root = __import__('pathlib').Path(__import__('os').environ['TMPDIR'])
        browser.inst.evidence.label = 'screenshot-mask-test'
        frame = Mock()
        field = Mock()
        field.evaluate_all.return_value = [{'value': 'northwind-client', 'identity': 'OAuth client ID'}]
        frame.locator.return_value.all.return_value = [field]
        browser.page.frames = [frame]
        Browser.screenshot(browser,'northwind')
        self.assertIn(field,browser.page.screenshot.call_args.kwargs['mask'])

    def test_screenshot_waits_for_browser_to_settle(self):
        browser = Mock()
        browser.inst.root = __import__('pathlib').Path(__import__('os').environ['TMPDIR'])
        browser.inst.evidence.label = 'screenshot-settle-test'
        browser.inst.redactor.secrets = []
        browser.page.frames = []
        Browser.screenshot(browser,'northwind')
        browser.settle.assert_called_once_with()

    def test_integration_group_filter_is_relative_to_each_section(self):
        from unittest.mock import patch
        ctx = Mock()
        browser = Mock()
        settings = browser.frame.locator.return_value
        settings.locator.return_value.locator.return_value.count.return_value = 2
        with patch.object(scenarios_providers,'provider_browser',return_value=browser),patch.object(scenarios_providers,'open_settings'):
            scenarios_providers.integration_settings(ctx,'google','Google')
        settings.locator.return_value.filter.assert_called_once_with(has_text='Integrations')

    def test_provider_setup_owns_an_isolated_boot(self):
        boot = next(s for s in scenarios_providers.REGISTRY if s.name=='providers_boot')
        self.assertEqual(boot.requires,())
        from runtime import RuntimePool
        self.assertIn('scenarios_providers', RuntimePool.isolated)

    def test_release_browser_removes_only_completed_cleanup(self):
        ctx = Context(Mock(cleanup=Cleanup()))
        browser = ctx.browser = Mock(errors=[])
        other = Mock()
        ctx.inst.cleanup.add('browser', browser.close)
        ctx.inst.cleanup.add('other', other)
        Browser.release(ctx)
        browser.settle.assert_called_once_with()
        browser.close.assert_called_once_with()
        self.assertIsNone(ctx.browser)
        self.assertEqual(ctx.inst.cleanup.callbacks,[('other',other)])

    def test_provider_setup_does_not_prepare_the_running_instance_again(self):
        from pathlib import Path
        from unittest.mock import patch
        import os,tempfile
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            ctx = Mock()
            ctx.browser = None
            ctx.state = {}
            ctx.inst.app = Path(directory)
            (ctx.inst.app/'src').mkdir()
            ctx.inst.prepare.side_effect = AssertionError('the shared boot owns prepare')
            ctx.inst.request.return_value = {'credential':{'token':'fictional-probe','credential_id':'northwind-probe'}}
            with patch.object(scenarios_providers,'load_fixture'),patch.object(ctx.fixtures,'start',return_value='http://127.0.0.1:731'):
                scenarios_providers.providers_boot(ctx)
            ctx.inst.prepare.assert_not_called()
            ctx.inst.start.assert_not_called()

    def test_screenshot_excludes_hidden_sensitive_fields(self):
        browser = Mock()
        browser.inst.redactor.secrets = []
        browser.inst.root = __import__('pathlib').Path(__import__('os').environ['TMPDIR'])
        browser.inst.evidence.label = 'screenshot-hidden-test'
        frame = Mock()
        field = Mock()
        field.is_visible.return_value = False
        field.input_value.return_value = 'fictional-password'
        field.get_attribute.return_value = 'password'
        field.evaluate.return_value = 'Password'
        frame.locator.return_value.all.return_value = [field]
        browser.page.frames = [frame]
        Browser.screenshot(browser,'northwind')
        self.assertNotIn(field,browser.page.screenshot.call_args.kwargs['mask'])

    def test_connections_view_selects_rotation_and_remote_reconnect(self):
        from harness import select_scenarios
        selected = select_scenarios(__import__('scenarios').REGISTRY+scenarios_providers.REGISTRY,'full',['providers_connections_ui'])
        names = {s.name for s in selected}
        self.assertIn('providers_simplefin_rotate',names)
        self.assertIn('providers_mcp_reconnect',names)

    def test_scenario_owned_connection_closes_its_worker_at_the_scenario_boundary(self):
        ctx = Mock(state={})
        ctx.inst.cleanup = Cleanup()
        ctx.inst.request.side_effect = [{'component_id': 'owned'},
            {'connections': [{'component_id': 'owned', 'name': 'Northwind bot'}]}, {'success': True}]
        self.assertEqual(scenarios_providers.connect(ctx, 'bot', 'fixture:connection', {'token': 'fixture'},
                                                   scope='scenario'), 'owned')
        self.assertEqual(ctx.inst.cleanup.run(scope='scenario'), [])
        ctx.inst.request.assert_called_with('DELETE', '/api/v1/connections/owned')
        self.assertEqual(ctx.inst.cleanup.run(), [])
