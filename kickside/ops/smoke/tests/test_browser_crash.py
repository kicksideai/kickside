import unittest
from contextlib import nullcontext
from unittest.mock import Mock, patch

from browser import Browser
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
        page.context = Mock()
        context = Mock()
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
