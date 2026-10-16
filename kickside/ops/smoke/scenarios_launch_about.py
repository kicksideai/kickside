"""Settings exposes application and runtime identity with shipped licence notices."""
from pathlib import Path

from harness import Scenario, require
from runtime_fixtures import complete_splashes
from scenarios_core import system


def launch_about(ctx):
    from playwright.sync_api import expect

    info = ctx.inst.request('GET', '/api/v1/settings/about', label='application-about')
    require(info.get('runtime_version') == ctx.inst.config['runtime_version'],
            'About does not identify the running runtime')
    require(info.get('notices'), 'About omits the shipped third-party notices')
    if ctx.inst.config.get('published'):
        require(isinstance(info.get('version'), str) and info['version'],
                'About omits the installed application package version')
    if ctx.inst.config.get('source'):
        source = Path(ctx.inst.config['source']) / 'platform/settings/src/THIRD_PARTY_NOTICES.md'
        require(info['notices'] == source.read_text(), 'About changes the canonical notices content')
    blocks = ctx.inst.request('GET', '/api/v1/settings/blocks', label='about-settings-block')
    require(any(row.get('key') == 'about' and row.get('component_tag') == 'kickside-settings-about'
                for row in blocks['blocks']), 'About is absent from the existing Settings catalog')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000}, color_scheme='light')
    browser.login()
    system(ctx, 'Settings')
    settings = browser.frame.locator('kickside-settings')
    settings.get_by_role('button', name='About', exact=True).click()
    about = settings.locator('kickside-settings-about')
    expect(about.get_by_role('heading', name='About KickSide', exact=True)).to_be_visible(timeout=30000)
    expect(about.get_by_role('link', name='KickSide Community License', exact=True)).to_have_attribute(
        'href', 'https://wippy.ai/license')
    expect(about.locator('.ks-about-runtime')).to_contain_text('Runs on the Wippy runtime (MPL-2.0)')
    expect(about.locator('.ks-about-runtime')).to_contain_text(info['runtime_version'])
    expect(about.locator('dd').first).to_have_text(info.get('version') or 'Development build')
    expect(about.locator('pre')).to_have_text(info['notices'])
    for scheme in ('light', 'dark'):
        browser.page.emulate_media(color_scheme=scheme)
        browser.screenshot('settings-about-' + scheme, full_page=False)


REGISTRY = [Scenario('launch_about', 'regression', launch_about,
                     features=('kickside/settings|http|GET /api/v1/settings/about',
                               'kickside/settings|navigation|kickside.settings:block.about'),
                     issues=('LAUNCH-SETTINGS-ABOUT',))]
