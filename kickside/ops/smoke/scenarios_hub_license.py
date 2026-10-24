"""Custom Hub license references remain readable and retain their SPDX value."""
import re
from urllib.parse import urlencode

from harness import Scenario, require
from scenarios_core import navigation, system
from scenarios_hub_ai_review import hub_surface


def available_custom_license_fixture(candidates):
    """Use a rendered catalog card, never a package publication assumption."""
    return candidates[0] if candidates else None


def license_labels(ctx):
    from playwright.sync_api import expect

    browser, hub = hub_surface(ctx)
    observations = []
    metadata = {}
    for page in range(1, 51):
        response = ctx.inst.request('GET', '/api/v1/keeper/hub/browse?' + urlencode(
            {'page': page, 'page_size': 100}), label='hub-license-catalog-page-' + str(page))
        items = response.get('items', [])
        for row in items:
            component = (row.get('full_name') or row.get('component') or
                         (row.get('org') or row.get('namespace') or '') + '/' + row.get('name', ''))
            metadata[component] = row
        if len(items) < 100 or page * 100 >= response.get('total', 0):
            break
    else:
        require(False, 'Hub license metadata exceeds the catalog pagination limit')

    def inspect(element, raw, surface, theme, *, footer=False):
        element.wait_for(timeout=30000)
        label = re.sub(r'(?<![^\s()])LicenseRef-([^\s()]+)', lambda match: match[1].replace('-', ' '), raw)
        observation = {'surface': surface, 'theme': theme, 'raw': raw, 'expected': label,
                       'text': element.inner_text().strip(), 'title': element.get_attribute('title')}
        if footer:
            observation['lines'] = element.evaluate('''element => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return new Set(Array.from(range.getClientRects(), rect => Math.round(rect.top))).size;
            }''')
        observations.append(observation)

    for theme in ('light', 'dark'):
        system(ctx, 'Appearance')
        appearance = browser.frame.locator('kickside-appearance')
        appearance.get_by_role('button', name=theme.title(), exact=True).click()
        expect(appearance.get_by_role('button', name=theme.title(), exact=True)).to_have_attribute('aria-pressed', 'true')
        system(ctx, 'Modules')
        expect(hub.locator('.mod-card').first).to_be_visible(timeout=30000)
        browser.screenshot('hub-license-catalog-' + theme, full_page=False)

        candidates = []
        for card in hub.locator('.mod-card, .feat-card').all():
            component = card.locator('.mod-org, .feat-org').inner_text().strip()
            if component not in metadata:
                items = ctx.inst.request('GET', '/api/v1/keeper/hub/browse?' + urlencode(
                    {'q': component.rsplit('/', 1)[-1], 'page_size': 100}),
                    label='hub-license-metadata-' + component.replace('/', '-')).get('items', [])
                item = next((row for row in items if (row.get('full_name') or row.get('component') or
                             (row.get('org') or row.get('namespace') or '') + '/' + row.get('name', '')) == component), None)
                require(item, 'Visible Hub card has no catalog metadata: ' + component)
                metadata[component] = item
            raw = metadata[component].get('license', '')
            if not raw:
                continue
            if 'mod-card' in card.get_attribute('class').split():
                inspect(card.locator('.mod-foot > .foot-stat.km-dim').first, raw, 'footer', theme, footer=True)
                if raw.startswith('LicenseRef-'):
                    candidates.append((component, raw))
            else:
                inspect(card.locator('.meta-pill').last, raw, 'featured', theme)

        require(candidates, 'Hub catalog has no custom license reference to exercise')
        installed = hub.locator('.km-collapse-head')
        if installed.get_attribute('aria-expanded') != 'true':
            installed.click()
        expect(hub.locator('.inst-row').first).to_be_visible(timeout=30000)
        hub.locator('.inst-row').first.scroll_into_view_if_needed()
        browser.screenshot('hub-license-installed-' + theme, full_page=False)

        fixture = available_custom_license_fixture(candidates)
        require(fixture, 'Hub catalog has no custom license reference to inspect')
        component, raw = fixture
        card = hub.locator('.mod-card').filter(has=browser.page.locator('.mod-org').filter(
            has_text=re.compile('^' + re.escape(component) + '$')))
        card.click()
        detail = hub.locator('.d-row').filter(has=browser.page.get_by_text('License', exact=True)).locator('.d-row-v')
        inspect(detail, raw, 'detail', theme)
        browser.screenshot('hub-license-detail-' + theme, full_page=False)
        hub.locator('.d-hero-actions').get_by_role('button', name='Install', exact=True).click()
        dialog = hub.get_by_role('dialog', name='Install module', exact=True)
        inspect(dialog.locator('.km-meta-row').filter(has=browser.page.get_by_text('License', exact=True)).locator('b'),
                raw, 'install', theme)
        browser.screenshot('hub-license-install-' + theme, full_page=False)
        dialog.get_by_role('button', name='Close dialog', exact=True).click()
        hub.get_by_role('button', name='Back to modules', exact=True).click()

    ctx.inst.evidence.save('hub-license-labels', observations)
    for theme in ('light', 'dark'):
        require({row['surface'] for row in observations if row['theme'] == theme} ==
                {'footer', 'featured', 'detail', 'install'},
                'Hub license labels do not cover every surface in ' + theme)
    failures = [row for row in observations if row['text'] != row['expected'] or row['title'] != row['raw']
                or row.get('lines', 1) != 1]
    require(not failures, 'Hub license labels lose readability, raw tooltips, or single-line footers: ' + str(failures))


REGISTRY = [Scenario('hub_license_labels', 'regression', license_labels, ('boot',),
    features=navigation('hub', 'kickside.hub:tab.modules'), issues=('HUB-READABLE-LICENSE-LABELS',))]
