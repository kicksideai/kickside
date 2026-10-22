"""Security administration tab structure regression."""
import re
from harness import Scenario
from scenarios_core import system


def ready(ctx):
    from playwright.sync_api import expect
    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000})
    browser.login()
    personal = browser.frame.locator('kickside-agent-onboarding')
    personal.get_by_role('button', name=re.compile('Skip|Not now|Later', re.I)).click()
    expect(personal).to_have_count(0, timeout=30000)


def security_tabs(ctx):
    from playwright.sync_api import expect
    browser = ctx.browser_check()
    browser.login()
    browser.page.set_viewport_size({'width': 1600, 'height': 1000})
    for mode in ('Light', 'Dark'):
        system(ctx, 'Appearance')
        appearance = browser.frame.locator('kickside-appearance')
        appearance.get_by_role('button', name=mode, exact=True).click()
        expect(appearance.get_by_role('button', name=mode, exact=True)).to_have_attribute('aria-pressed', 'true')
        system(ctx, 'Security')
        expect(browser.frame.get_by_role('heading', name='System', exact=True)).to_be_visible()
        panel = browser.frame.locator('kickside-security')
        tabs = panel.get_by_role('tablist', name='Security administration', exact=True)
        scopes = tabs.get_by_role('tab', name='Scopes', exact=True)
        grants = tabs.get_by_role('tab', name='Act-as grants', exact=True)
        scopes.click()
        expect(scopes).to_have_attribute('aria-selected', 'true')
        expect(grants).to_have_attribute('aria-selected', 'false')
        browser.screenshot('security-tabs-' + mode.lower(), full_page=False)
        scopes.focus()
        scopes.press('ArrowRight')
        expect(grants).to_be_focused()
        grants.press('Enter')
        expect(grants).to_have_attribute('aria-selected', 'true')
        expect(panel.get_by_role('region', name='Act-as grants')).to_be_visible()
        expect(panel.locator('.p-tabs .p-tablist')).to_be_visible()
        browser.screenshot('security-grants-' + mode.lower(), full_page=False)


REGISTRY = [
    Scenario('system_page_structure_ready', 'quick', ready, ('platform_onboarding',)),
    Scenario('system_security_tab_structure', 'quick', security_tabs, ('system_page_structure_ready',),
             issues=('SECURITY-ADMIN-TAB-STRUCTURE',)),
]
