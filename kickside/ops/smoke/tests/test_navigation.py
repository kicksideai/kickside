import unittest
from unittest.mock import Mock
from types import SimpleNamespace

from scenarios import nav
import scenarios_core as core


class NavigationTests(unittest.TestCase):
    def test_navigation_selects_a_surface_with_a_dynamic_badge(self):
        from playwright.sync_api import sync_playwright
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=['--no-sandbox'])
            try:
                page = browser.new_page()
                page.set_default_timeout(1000)
                page.set_content('<nav aria-label="Main navigation">'
                    '<button onclick="document.body.dataset.selected=\'inbox\'">'
                    '<span>Inbox</span><span>13</span></button><button>Inbox settings</button></nav>')
                ctx = SimpleNamespace(browser=SimpleNamespace(frame=page, settle=lambda: None))
                nav(ctx, 'Inbox')
                self.assertEqual(page.locator('body').get_attribute('data-selected'), 'inbox')
            finally:
                browser.close()

    def test_navigation_selects_horizontal_and_vertical_main_navigation(self):
        from playwright.sync_api import sync_playwright
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=['--no-sandbox'])
            try:
                for orientation in ('horizontal', 'vertical'):
                    with self.subTest(orientation=orientation):
                        page = browser.new_page()
                        page.set_default_timeout(1000)
                        sidebar = ' class="sidebar"' if orientation == 'vertical' else ''
                        page.set_content('<nav aria-label="Main navigation"' + sidebar + '>'
                            '<button onclick="document.body.dataset.selected=\'agents\'">Agents</button>'
                            '</nav><section><button>Agents</button></section>')
                        ctx = SimpleNamespace(browser=SimpleNamespace(frame=page, settle=lambda: None))
                        nav(ctx, 'Agents')
                        self.assertEqual(page.locator('body').get_attribute('data-selected'), 'agents')
                        page.close()
            finally:
                browser.close()

    def test_navigation_opens_the_declared_category_before_selecting_its_surface(self):
        from playwright.sync_api import sync_playwright
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=['--no-sandbox'])
            try:
                page = browser.new_page()
                page.set_default_timeout(1000)
                page.set_content('<nav aria-label="Main navigation">'
                    '<button aria-expanded="false" onclick="this.setAttribute(\'aria-expanded\',\'true\');'
                    'document.getElementById(\'category\').hidden=false">Other</button>'
                    '<div id="category" hidden><button onclick="document.body.dataset.selected=\'system\'">'
                    'System</button></div></nav>')
                inst = Mock()
                inst.request.return_value = {'categories': [{'label': 'Other', 'items': [{'label': 'System'}]}]}
                ctx = SimpleNamespace(inst=inst, browser=SimpleNamespace(frame=page, settle=lambda: None))
                nav(ctx, 'System')
                self.assertEqual(page.locator('body').get_attribute('data-selected'), 'system')
                self.assertEqual(page.get_by_role('button', name='Other').get_attribute('aria-expanded'), 'true')
            finally:
                browser.close()

    def test_system_settles_the_system_home_before_selecting_a_tab(self):
        ctx = Mock()
        events = []
        ctx.browser.page.keyboard.press.side_effect = lambda key: events.append(('escape', key))
        ctx.browser.settle.side_effect = lambda: events.append('settle')
        tab = ctx.browser.frame.get_by_role.return_value
        tab.click.side_effect = lambda: events.append('tab')
        with unittest.mock.patch('scenarios_core.nav', side_effect=lambda _, label: events.append(('nav', label))):
            core.system(ctx, 'Appearance')
        self.assertEqual(events, [('escape', 'Escape'), 'settle', ('nav', 'System'), 'settle', 'tab'])

    def test_navigation_opens_the_mobile_drawer_and_uses_the_accessible_name(self):
        for mobile in (False, True):
            with self.subTest(mobile=mobile):
                ctx = Mock()
                toggle = ctx.browser.frame.get_by_role.return_value
                toggle.is_visible.return_value = mobile
                nav(ctx, 'Agents')
                self.assertEqual(ctx.browser.frame.get_by_role.call_args_list, [
                    unittest.mock.call('button', name='Open navigation', exact=True),
                    unittest.mock.call('navigation', name='Main navigation', exact=True)])
                self.assertEqual(toggle.click.call_count, int(mobile))
                self.assertEqual(ctx.browser.frame.get_by_role.return_value.get_by_role.call_args_list, [
                    unittest.mock.call('button', name='Agents', exact=True, include_hidden=True),
                    unittest.mock.call('button', include_hidden=True)])

    def test_jira_ui_waits_for_page_resources_after_sidebar_readiness(self):
        from scenarios_jira import ui
        ctx = Mock()
        ctx.inst.base = 'http://localhost'
        browser = ctx.browser_check.return_value
        events = []
        browser.settle.side_effect = lambda: events.append('settle')
        browser.frame.locator.return_value.wait_for.side_effect = lambda **kwargs: events.append('sidebar')
        self.assertIs(ui(ctx), browser)
        self.assertEqual(events, ['settle', 'sidebar', 'settle'])

    def test_jira_ui_does_not_return_with_unfinished_resources(self):
        from scenarios_jira import ui
        ctx = Mock()
        ctx.inst.base = 'http://localhost'
        ctx.browser_check.return_value.settle.side_effect = [None, RuntimeError('font request does not finish')]
        with self.assertRaisesRegex(RuntimeError, 'font request does not finish'):
            ui(ctx)
