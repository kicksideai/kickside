"""Product branding defaults and configured installation titles."""
from harness import Scenario, require
from module_harness import run_focused_module_test


def branding_storage(ctx):
    run_focused_module_test(ctx, 'kickside/ui', 'branding_storage_test', lint=True)


def branding_logo_types(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import isolated_fixture, complete_splashes
    from scenarios_core import system
    with isolated_fixture(ctx) as fixture:
        browser, inst = fixture.browser_check(), fixture.inst
        complete_splashes(fixture, 'welcome', 'first_agent')
        browser.login()
        system(fixture, 'Appearance')
        appearance = browser.frame.locator('kickside-appearance')
        hint = appearance.locator('.ap-logo + .ap-hint')
        expect(hint).not_to_contain_text('SVG')
        contract = inst.request('GET', '/api/v1/nav/list?manage=1')['logo_upload']
        accepted = [value for fmt in contract['formats']
                    for value in [fmt['mime'], *('.' + ext for ext in fmt['extensions'])]]
        expect(appearance.locator('input[type=file]')).to_have_attribute('accept', ','.join(accepted))
        for fmt in contract['formats']:
            expect(hint).to_contain_text(fmt['label'])
        expect(hint).to_contain_text(f"up to {contract['max_bytes'] // 1048576} MB")
        browser.screenshot('appearance-logo-types', full_page=False)
        inst.evidence.save('logo-upload-contract', contract)


def branding_shell(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import isolated_fixture, complete_splashes
    with isolated_fixture(ctx) as fixture:
        browser, inst = fixture.browser_check(), fixture.inst
        branding = inst.request('GET', '/api/public/branding', auth='', label='default-branding')
        require(branding['title'] == 'KickSide', 'Default product title has inconsistent casing')
        browser.page.goto(inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
        expect(browser.page).to_have_title('KickSide - Sign In')
        expect(browser.page.locator('#brand-logo')).to_have_attribute('alt', 'KickSide')
        browser.screenshot('branding-login')
        complete_splashes(fixture, 'welcome', 'first_agent')
        browser.login()
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        expect(browser.frame.locator('.sp-screen, dialog.sp-dialog')).to_have_count(0)
        expect(browser.frame.locator('.sidebar').get_by_text('KickSide', exact=True)).to_be_visible()
        expect(browser.page).to_have_title('KickSide')
        expect(browser.frame.locator('.sidebar')).to_contain_text('KickSide')
        expect(browser.frame.get_by_role('heading', name='Welcome to KickSide', exact=True)).to_be_visible()
        browser.screenshot('branding-shell')
        inst.evidence.save('branding-titles', {
            'browser': browser.page.title(),
            'shell': browser.frame.locator('title').text_content(),
            'sidebar': browser.frame.locator('.sidebar').inner_text(),
        })


REGISTRY = [
    Scenario('branding_storage', 'regression', branding_storage,
             issues=('PRODUCT-BRAND-CASING', 'APPEARANCE-LOGO-TYPES'),
             features=('kickside/ui|http|GET /api/public/branding',
                       'kickside/ui|http|POST /api/v1/nav/logo',
                       'kickside/ui|http|PUT /api/v1/nav/config')),
    Scenario('branding_logo_types', 'regression', branding_logo_types,
             issues=('APPEARANCE-LOGO-TYPES',),
             features=('kickside/ui|http|GET /api/v1/nav/list',
                       'kickside/ui|navigation|kickside.ui:tab.appearance')),
    Scenario('branding_shell', 'regression', branding_shell,
             issues=('PRODUCT-BRAND-CASING',),
             features=('kickside/kickside|http|GET /login',
                       'kickside/ui|http|GET /api/public/branding')),
]
