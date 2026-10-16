import unittest
from contextlib import nullcontext
from unittest.mock import Mock, patch

from harness import Cleanup, Evidence, Redactor, Scenario
from browser import Browser
import smoke
from scenarios import Context


class ResourceLifecycleTests(unittest.TestCase):
    def test_restore_settles_the_landing_document_before_switching_to_the_saved_route(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock(base='http://fixture')
        browser.page = Mock()
        browser.reset_context = Mock()
        pending = False
        def landed(*args, **kwargs):
            nonlocal pending
            pending = True
        def settled():
            nonlocal pending
            pending = False
        def route(url):
            self.assertFalse(pending, 'Route restoration cancels the landing page requests')
        browser.page.goto.side_effect = landed
        browser.settle = Mock(side_effect=settled)
        browser.goto_route = Mock(side_effect=route)
        browser.restore({'url': 'http://fixture/system/appearance', 'storage_state': {}})
        browser.goto_route.assert_called_once_with('http://fixture/system/appearance')

    def test_scenario_cleanup_closes_transports_before_instance_resources(self):
        cleanup = Cleanup()
        calls = []
        cleanup.add('database', lambda: calls.append('database'))
        cleanup.add('transport', lambda: calls.append('transport'), scope='scenario')
        self.assertEqual(cleanup.run(scope='scenario'), [])
        self.assertEqual(calls, ['transport'])
        self.assertEqual(cleanup.run(), [])
        self.assertEqual(calls, ['transport', 'database'])

    def test_completed_resource_is_removed_without_replaying_delete(self):
        cleanup = Cleanup()
        callback = Mock()
        cleanup.add('resource', callback)
        cleanup.remove(callback)
        self.assertEqual(cleanup.run(), [])
        callback.assert_not_called()

    def test_scenario_failure_still_reports_all_transport_cleanup_errors(self):
        inst = Mock()
        inst.evidence.paths = []
        inst.redactor.text.side_effect = str
        inst.cleanup = Cleanup()
        ctx = Context(inst)
        def scenario(ctx):
            ctx.inst.cleanup.add('transport', Mock(side_effect=RuntimeError('delete refused')), scope='scenario')
            raise RuntimeError('action refused')
        result = smoke.execute_scenario({'model': {}}, 'postgres', Scenario('test', 'full', scenario), ctx, {}, lambda: None)
        self.assertEqual(result.status, 'failed')
        self.assertIn('action refused', result.error)
        self.assertIn('delete refused', result.error)
        self.assertEqual(inst.cleanup.run(), [])

    def test_restart_releases_every_browser_before_stop_and_restores_navigation(self):
        runner = smoke.EngineRunner.__new__(smoke.EngineRunner)
        calls = []
        inst = Mock()
        inst.cleanup = Cleanup()
        inst.stop.side_effect = lambda **kw: calls.append('stop')
        inst.start.side_effect = lambda: calls.append('start')
        contexts = [Context(inst), Context(inst)]
        for ctx in contexts:
            ctx.browser = Mock()
            ctx.browser.navigation.return_value = {'url': '/sessions/current'}
            ctx.browser_check = Mock(return_value=Mock())
        runner.contexts = dict(enumerate(contexts))
        runner.executors = {1: Mock()}
        runner.executors[1].submit.side_effect = lambda fn, *args: Mock(result=lambda: fn(*args))
        def release(ctx):
            calls.append('release')
            ctx.browser = None
        with patch.object(Browser, 'release', side_effect=release):
            runner.restart_instance(contexts[0])
        self.assertEqual(calls, ['release', 'release', 'stop', 'start'])
        for ctx in contexts:
            ctx.browser_check.return_value.restore.assert_called_once_with({'url': '/sessions/current'})

    def test_owner_close_is_not_repeated_by_instance_cleanup(self):
        inst = Mock()
        inst.cleanup = Cleanup()
        ctx = Context(inst)
        with patch('scenarios.Browser') as factory:
            browser = ctx.browser_check()
        ctx.close_browser()
        browser.close.assert_called_once_with()
        self.assertIsNone(ctx.browser)
        self.assertEqual(inst.cleanup.run(), [])
        browser.close.assert_called_once_with()

    def test_owner_close_failure_is_reported_once_and_released(self):
        inst = Mock()
        inst.cleanup = Cleanup()
        ctx = Context(inst)
        with patch('scenarios.Browser'):
            browser = ctx.browser_check()
        browser.close.side_effect = RuntimeError('context refused close')
        with self.assertRaisesRegex(RuntimeError, 'context refused close'):
            ctx.close_browser()
        self.assertIsNone(ctx.browser)
        self.assertEqual(inst.cleanup.run(), [])
        browser.close.assert_called_once_with()

    def test_chat_navigation_opens_declared_session_or_agent(self):
        ctx = Context(Mock())
        ctx.browser = Mock()
        ctx.state = {'agent': 'agent-id'}
        ctx.navigate(('chat', 'agent', 'session'))
        ctx.browser.open_chat.assert_called_once_with('agent-id', None)
        ctx.browser.reset_mock()
        ctx.state['session'] = 'session-id'
        ctx.navigate(('chat', 'agent', 'session'))
        ctx.browser.open_chat.assert_called_once_with('agent-id', 'session-id')

    def test_eager_chat_session_is_captured_before_later_navigation(self):
        inst = Mock(cleanup=Cleanup())
        inst.evidence.paths = []
        inst.redactor.text.side_effect = str
        ctx = Context(inst)
        ctx.browser = Mock(errors=[], crashes=())
        browser = ctx.browser
        browser.current_session.return_value = 'starter-session'
        scenario = Scenario('create', 'full', lambda ctx: ctx.state.update(agent='agent-id'),
                            capture_navigation=('session',))
        result = smoke.execute_scenario({'model': {}}, 'postgres', scenario, ctx, {}, lambda: None)
        self.assertEqual(result.status, 'passed')
        self.assertEqual(ctx.state['session'], 'starter-session')
        browser.open_chat.assert_not_called()

    def test_unused_browser_restores_blank_without_entering_authenticated_shell(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock(base='http://127.0.0.1:1234')
        browser.page = Mock()
        browser.reset_context = Mock()
        browser.settle = Mock()
        browser.restore({'url': 'about:blank', 'storage_state': {'cookies': [], 'origins': []}})
        browser.page.goto.assert_not_called()
        browser.page.evaluate.assert_not_called()

    def test_parked_browser_captures_its_last_main_page_route_and_storage(self):
        handlers = {}
        page = Mock(url='about:blank')
        page.on.side_effect = lambda event, callback: handlers.update({event: callback})
        context = Mock()
        context.new_page.return_value = page
        context.storage_state.return_value = {'cookies': [], 'origins': [{'origin': 'http://instance'}]}
        session = Mock()
        session.start.return_value.new_context.return_value = context
        browser = Browser(Mock(), session=session)
        self.assertEqual(browser.navigation()['url'], 'about:blank')
        page.url = page.main_frame.url = 'http://instance/inbox'
        if 'framenavigated' in handlers:
            handlers['framenavigated'](page.main_frame)
            handlers['framenavigated'](Mock(url='http://instance/iframe'))
        page.url = page.main_frame.url = 'about:blank'
        if 'framenavigated' in handlers:
            handlers['framenavigated'](page.main_frame)
        self.assertEqual(browser.navigation(), {'url': 'http://instance/inbox',
            'storage_state': context.storage_state.return_value})

    def test_session_navigation_uses_durable_id_in_declared_route(self):
        browser = Browser.__new__(Browser)
        browser.inst = Mock(base='http://127.0.0.1:1234')
        browser.page = Mock()
        browser.open_chat('agent', 'durable-session')
        browser.page.evaluate.assert_called_once()
        self.assertEqual(browser.page.evaluate.call_args.args[1], '/sessions/durable-session')
        browser.inst.request.assert_not_called()

    def test_onboarding_declares_eager_session_capture(self):
        import scenarios
        scenario = next(s for s in scenarios.REGISTRY if s.name == 'first_agent')
        self.assertEqual(scenario.capture_navigation, ('session',))

    def test_channel_picker_uses_exact_accessible_names_for_each_declared_node_kind(self):
        picker = Mock()
        Browser.pick_channel(picker, 'Connection', ('Container',), 'Channel')
        self.assertEqual([c.args[0] for c in picker.locator.call_args_list],
                         ['.cp-connection', '.cp-container', '.cp-channel'])
        for name in ('Connection', 'Container', 'Channel'):
            picker.get_by_role.assert_any_call('button', name=name, exact=True)
        self.assertEqual(picker.get_by_role.return_value.and_.return_value.wait_for.call_count, 3)

    def test_session_capture_waits_for_eager_creation_within_the_browser_deadline(self):
        browser = Browser.__new__(Browser)
        browser.page = Mock()
        chat = browser.frame.locator.return_value
        chat.get_attribute.return_value = None
        assertion = Mock()
        assertion.to_have_attribute.side_effect = lambda *args, **kw: setattr(chat.get_attribute, 'return_value', 'created-session')
        with patch('playwright.sync_api.expect', return_value=assertion):
            self.assertEqual(browser.current_session(), 'created-session')
        self.assertEqual(assertion.to_have_attribute.call_args.args[0], 'session-id')
        self.assertEqual(assertion.to_have_attribute.call_args.kwargs['timeout'], 30000)
