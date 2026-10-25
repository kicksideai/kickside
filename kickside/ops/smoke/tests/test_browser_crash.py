import unittest
from contextlib import nullcontext
from unittest.mock import Mock, patch

from browser import Browser, BrowserSession
from harness import Cleanup, Failure, Scenario
import smoke
from scenarios import Context


class Pages:
    """Playwright session double producing one page per context and exposing its event handlers."""
    def __init__(self):
        self.pages = []
        self.session = Mock()
        self.session.start.return_value.new_context.side_effect = self.new_context

    def new_context(self, **options):
        page = Mock(url='about:blank')
        handlers = {}
        page.on.side_effect = lambda event, callback: handlers.update({event: callback})
        page.handlers = handlers
        context = Mock()
        page.context = context
        context.handlers = {}
        context.on.side_effect = lambda event, callback: context.handlers.update({event: callback})
        context.new_page.return_value = page
        self.pages.append(page)
        return context


def instance():
    inst = Mock()
    inst.evidence.paths = []
    inst.redactor.text.side_effect = str
    inst.cleanup = Cleanup()
    return inst


def crash(page):
    page.handlers['crash'](page)


class CrashedPageTests(unittest.TestCase):
    def test_crash_is_recorded_with_evidence_and_never_waits_for_the_crashed_requests(self):
        pages = Pages()
        inst = instance()
        browser = Browser(inst, session=pages.session)
        page = pages.pages[0]
        browser.context.handlers['request'](Mock(url='http://asset/vue.js'))
        crash(page)
        self.assertEqual(browser.crashes[0]['pending'], ['http://asset/vue.js'])
        inst.evidence.save.assert_called_once()
        self.assertEqual(inst.evidence.save.call_args.args[0], 'browser-page-crash')
        with self.assertRaisesRegex(Failure, 'Browser page crashed'):
            browser.settle()
        page.wait_for_timeout.assert_not_called()
        with self.assertRaisesRegex(Failure, 'Page crashed'):
            browser.clean(0)

    def test_release_retains_console_failures_recorded_before_teardown(self):
        pages=Pages()
        ctx=Context(instance(),pages.session)
        browser=ctx.browser_check()
        browser.errors.append('HTTP 500: selected resource')
        browser.settle=Mock()
        with self.assertRaisesRegex(Failure,'HTTP 500'):
            Browser.release(ctx)
        self.assertIsNone(ctx.browser)

    def test_release_closes_a_crashed_browser_and_reports_the_crash(self):
        pages = Pages()
        inst = instance()
        ctx = Context(inst, pages.session)
        browser = ctx.browser_check()
        crash(pages.pages[0])
        with self.assertRaisesRegex(Failure, 'Browser page crashed'):
            Browser.release(ctx)
        self.assertIsNone(ctx.browser)

    def test_pause_discards_a_crashed_browser_and_fails_the_pausing_scenario(self):
        pages = Pages()
        inst = instance()
        ctx = Context(inst, pages.session)
        ctx.browser_check()
        crash(pages.pages[0])
        with self.assertRaisesRegex(Failure, 'Browser page crashed'):
            with Browser.paused(inst, [ctx], lambda context, operation: operation(context)):
                self.fail('pause proceeds with a crashed browser')
        self.assertIsNone(ctx.browser)
        inst.stop.assert_not_called()

    def test_crashed_scenario_fails_and_later_scenarios_receive_a_fresh_context(self):
        pages = Pages()
        inst = instance()
        ctx = Context(inst, pages.session)
        config = {'model': {}}
        crashed = None
        def crashing(ctx):
            nonlocal crashed
            crashed = ctx.browser_check()
            crash(pages.pages[-1])
        first = smoke.execute_scenario(config, 'sqlite', Scenario('crashing', 'full', crashing), ctx, {}, lambda: None)
        self.assertEqual(first.status, 'failed')
        self.assertIn('Browser page crashed', first.error)
        self.assertIsNone(ctx.browser)
        seen = []
        def later(ctx):
            seen.append(ctx.browser_check())
            with ctx.paused():
                pass
        ctx.pause_runtime = lambda context, hard=False: Browser.paused(
            inst, [context], lambda c, operation: operation(c), hard=hard)
        with patch.object(Browser, 'screenshot'):
            results = [smoke.execute_scenario(config, 'sqlite', Scenario('later_' + str(n), 'full', later), ctx, {}, lambda: None)
                       for n in range(3)]
        self.assertEqual([r.status for r in results], ['passed'] * 3, [r.error for r in results])
        self.assertEqual(len({id(browser) for browser in seen}), 3)
        self.assertNotIn(crashed, seen)
        for browser in seen:
            self.assertFalse(browser.crashes)

    def test_crash_close_makes_no_playwright_teardown_rpc(self):
        pages = Pages()
        inst = instance()
        browser = Browser(inst, session=pages.session)
        context, browser_cdp = browser.context, browser.browser_cdp
        crash(pages.pages[0])
        browser.close()
        pages.session.discard_crashed_driver.assert_called_once_with()
        pages.session.close.assert_not_called()
        context.close.assert_not_called()
        browser_cdp.detach.assert_not_called()

    def test_crash_cleanup_failure_is_saved_and_does_not_hide_the_page_crash(self):
        pages = Pages()
        pages.session.discard_crashed_driver.side_effect = Failure('owned Chromium child survives')
        inst = instance()
        browser = Browser(inst, session=pages.session)
        crash(pages.pages[0])
        with self.assertRaisesRegex(Failure, 'owned Chromium child survives'):
            browser.close()
        receipt = inst.evidence.save.call_args_list[-1]
        self.assertEqual(receipt.args[0], 'browser-crash-driver-cleanup')
        self.assertEqual(receipt.args[1]['status'], 'failed')
        self.assertIn('owned Chromium child survives', receipt.args[1]['error'])

    def test_healthy_browser_close_keeps_the_normal_playwright_teardown(self):
        pages = Pages()
        browser = Browser(instance(), session=pages.session)
        context, browser_cdp = browser.context, browser.browser_cdp
        browser.close()
        context.close.assert_called_once_with()
        browser_cdp.detach.assert_called_once_with()
        pages.session.discard_crashed_driver.assert_not_called()


class CrashedDriverSessionTests(unittest.TestCase):
    def test_only_verified_owned_driver_tree_is_stopped_and_session_is_fresh(self):
        session = BrowserSession()
        old_driver, old_browser = Mock(), Mock()
        record = {'pid': 456, 'identity': 'driver-start-time'}
        old_driver._impl_obj._connection._transport._proc.pid = 456
        session.playwright, session.browser = old_driver, old_browser
        with patch('browser.Path.read_bytes', return_value=b'/opt/playwright/node\0cli.js\0run-driver\0'), \
                patch('browser.owned_process', return_value=record) as owned:
            session.capture_driver_ownership()
        owned.assert_called_once_with(456)
        order = []
        old_driver.stop.side_effect = lambda: order.append('playwright-stop')
        with patch('browser.stop_owned_tree', side_effect=lambda *args, **kwargs: (
                order.append('owned-tree-stop'), {'status': 'forced', 'processes': [record]})[1]) as stop:
            receipt = session.discard_crashed_driver()
        stop.assert_called_once_with(record, grace_seconds=session.crash_grace_seconds)
        self.assertEqual(order, ['owned-tree-stop', 'playwright-stop'])
        old_driver.stop.assert_called_once_with()
        old_browser.close.assert_not_called()
        self.assertEqual(receipt['processes'], [record])
        self.assertIsNone(session.playwright)
        self.assertIsNone(session.browser)
        self.assertIsNone(session.driver_record)
        with patch('playwright.sync_api.sync_playwright') as factory:
            new_driver = factory.return_value.start.return_value
            self.assertIs(session.start(), new_driver.chromium.launch.return_value)
        factory.return_value.start.assert_called_once_with()

    def test_failed_owned_tree_shutdown_keeps_the_terminal_session_explicit(self):
        session = BrowserSession()
        driver, chromium = Mock(), Mock()
        session.playwright, session.browser = driver, chromium
        session.driver_record = {'pid': 456, 'identity': 'driver-start-time'}
        with patch('browser.stop_owned_tree', side_effect=Failure('owned Chromium child survives')):
            with self.assertRaisesRegex(Failure, 'owned Chromium child survives'):
                session.discard_crashed_driver()
        self.assertIs(session.playwright, driver)
        self.assertIs(session.browser, chromium)
        chromium.close.assert_not_called()
        driver.stop.assert_not_called()
        with self.assertRaisesRegex(Failure, 'terminal after crash cleanup failure'):
            session.close()
        chromium.close.assert_not_called()
        driver.stop.assert_not_called()

    def test_healthy_start_and_close_do_not_require_proc(self):
        session = BrowserSession()
        with patch('playwright.sync_api.sync_playwright') as factory, \
                patch('browser.Path.read_bytes', side_effect=OSError('proc unavailable')):
            driver = factory.return_value.start.return_value
            driver._impl_obj._connection._transport._proc.pid = 456
            self.assertIs(session.start(), driver.chromium.launch.return_value)
        self.assertIsNone(session.driver_record)
        self.assertIn('proc unavailable', session.driver_record_error)
        session.close()
        driver.chromium.launch.return_value.close.assert_called_once_with()
        driver.stop.assert_called_once_with()

    def test_real_crashed_page_disposal_starts_a_fresh_driver_on_the_same_thread(self):
        """chrome://crash leaves the page transport unusable; do not touch it again."""
        from playwright.sync_api import Error
        session = BrowserSession()
        try:
            browser = session.start()
            context = browser.new_context()
            page = context.new_page()
            with self.assertRaisesRegex(Error, 'net::ERR_ABORTED'):
                page.goto('chrome://crash', wait_until='commit', timeout=5000)
            receipt = session.discard_crashed_driver()
            self.assertTrue(receipt['processes'])
            fresh = session.start()
            fresh_context = fresh.new_context()
            fresh_page = fresh_context.new_page()
            self.assertEqual(fresh_page.evaluate('6 * 7'), 42)
        finally:
            if session.playwright is not None:
                session.close()
