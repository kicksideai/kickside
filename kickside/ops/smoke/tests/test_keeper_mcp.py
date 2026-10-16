import importlib
import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from harness import Failure


class KeeperMCPTests(unittest.TestCase):
    def test_native_keeper_scenario_starts_in_a_fresh_browser_context(self):
        import scenarios_hub_ui
        browser = Mock()
        ctx = Mock()
        ctx.browser_check.return_value = browser
        with patch('scenarios_hub_ui.open_keeper_application', return_value='keeper-frame'):
            actual, frame = scenarios_hub_ui.keeper_ui(ctx)
        self.assertIs(actual, browser)
        self.assertEqual(frame, 'keeper-frame')
        browser.reset_context.assert_called_once_with()
        calls = [call[0] for call in browser.method_calls]
        self.assertLess(calls.index('reset_context'), calls.index('login'))

    def test_scoped_ui_follows_the_link_destination_in_the_host_frame(self):
        import mcp_contracts
        browser = Mock(errors=[])
        frame = Mock(url='about:srcdoc')
        frame.name = 'wippy:page:control:main'
        host = Mock(url='http://smoke/c/control:main/', child_frames=[frame])
        host.name = 'wippy:page:host'
        browser.page.parent_frame = None
        host.parent_frame = browser.page
        frame.parent_frame = host
        browser.page.frames = [Mock(url='http://smoke/system'), host, frame]
        browser.frame.get_by_role.return_value.get_attribute.side_effect = \
            lambda name: {'href': '/c/control:main/', 'target': None}[name]
        ctx = Mock(state={'access_browser_error_start': 0})
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        with patch('scenarios_access.actor_browser', return_value=browser), patch('scenarios_core.system'), \
             patch('scenarios_access.request', side_effect=[{'presets': []}, {'tokens': []}]):
            _, mounted = mcp_contracts.keeper_ui(ctx, 'read')
        browser.page.frame_locator.assert_called_once_with('iframe[name="wippy:page:host"]')
        host_locator = browser.page.frame_locator.return_value
        host_locator.frame_locator.assert_called_once_with('iframe[name="wippy:page:control:main"]')
        self.assertIs(mounted, host_locator.frame_locator.return_value)
        mounted.get_by_role.assert_any_call('button', name='Settings', exact=True)

    def test_scoped_ui_requires_array_shaped_presets(self):
        import mcp_contracts
        browser = Mock(errors=[])
        frame = Mock(url='about:srcdoc')
        frame.name = 'wippy:page:control:main'
        host = Mock(url='http://smoke/c/control:main/', child_frames=[frame])
        host.name = 'wippy:page:host'
        browser.page.parent_frame = None
        host.parent_frame = browser.page
        frame.parent_frame = host
        browser.page.frames = [host, frame]
        browser.frame.get_by_role.return_value.get_attribute.side_effect = \
            lambda name: {'href': '/c/control:main/', 'target': None}[name]
        ctx = Mock(state={'access_browser_error_start': 0})
        ctx.inst.wait.side_effect = lambda condition, *args, **kwargs: condition()
        with patch('scenarios_access.actor_browser', return_value=browser), patch('scenarios_core.system'), \
             patch('scenarios_access.request', side_effect=[{'presets': {}}, {'tokens': []}]):
            with self.assertRaisesRegex(Failure, 'Preset collection is not an array'):
                mcp_contracts.keeper_ui(ctx, 'read')

    def setUp(self):
        self.scenario = importlib.import_module('scenarios_keeper_mcp')
        self.inst = SimpleNamespace(request=Mock(), redactor=Mock(), cleanup=Mock())

    def test_initialize_carries_the_session_header_into_tool_calls(self):
        def request(method, path, body=None, **kwargs):
            self.assertEqual(path, '/keeper-mcp/')
            if body['method'] == 'initialize':
                self.assertNotIn('Mcp-Session-Id', kwargs['headers'])
                kwargs['response_headers']['Mcp-Session-Id'] = 'session-123'
                return {'jsonrpc': '2.0', 'id': body['id'], 'result': {
                    'protocolVersion': '2025-03-26', 'capabilities': {}, 'serverInfo': {'name': 'Keeper'}}}
            self.assertEqual(kwargs['headers']['Mcp-Session-Id'], 'session-123')
            if body['method'] == 'notifications/initialized':
                self.assertEqual(kwargs['expect'], (202,))
                self.assertEqual(kwargs['headers']['MCP-Protocol-Version'], '2025-03-26')
                self.assertNotIn('id', body)
                return None
            return {'jsonrpc': '2.0', 'id': body['id'], 'result': {'content': [{'type': 'text', 'text': json.dumps({'success': True, 'id': 'automation-1'})}]}}
        self.inst.request.side_effect = request
        client = self.scenario.MCPClient(self.inst, 'bearer', '/keeper-mcp/')
        client.initialize()
        self.assertEqual(client.call('AutomationsManage', {'action': 'install'})['id'], 'automation-1')

    def test_product_tool_errors_fail_the_regression(self):
        self.inst.request.side_effect = lambda method, path, body, **kwargs: {
            'jsonrpc': '2.0', 'id': body['id'], 'result': {'isError': True, 'content': [
                {'type': 'text', 'text': 'live principal groups are required'}]}}
        client = self.scenario.MCPClient(self.inst, 'bearer', '/keeper-mcp/')
        client.session = 'session-123'
        with self.assertRaisesRegex(Failure, 'live principal groups are required'):
            client.call('AutomationsManage', {'action': 'install'})

    def test_missing_session_id_fails_initialization(self):
        self.inst.request.side_effect = lambda method, path, body, **kwargs: {
            'jsonrpc': '2.0', 'id': body['id'], 'result': {}}
        with self.assertRaisesRegex(Failure, 'session ID'):
            self.scenario.MCPClient(self.inst, 'bearer', '/keeper-mcp/').initialize()

    def test_only_an_access_error_satisfies_the_member_denial(self):
        def response(status, code, success=False):
            payload = json.dumps({'success': success, 'error': {'code': code, 'message': 'declared resource grant required'}})
            return f'PUT /api/v1/automations/id -> {status}\nResponse body ({len(payload)} bytes): {payload}'
        self.scenario.assert_access_denial(response(403, 'access_denied'))
        self.scenario.assert_access_denial(response(404, 'not_found') + '\n\nSTATUS MISMATCH: got 404, expected 403')
        for text in ('PUT -> 403 live principal groups are required',
                     'PUT -> 200 success', 'PUT -> 403 unknown tool', 'PUT -> 503 database unavailable',
                     response(200, 'access_denied'), response(403, 'unavailable'),
                     response(403, 'access_denied', True)):
            with self.subTest(text=text), self.assertRaises(Failure):
                self.scenario.assert_access_denial(text)
