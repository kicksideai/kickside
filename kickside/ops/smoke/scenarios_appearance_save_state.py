"""Appearance saves commit editor state and refresh every open shell."""
from urllib.parse import quote

from harness import Scenario, require
from scenarios_core import http, navigation, system


def preserve_navigation_config(inst):
    original = inst.request('GET', '/api/v1/nav/list?manage=1', label='appearance-original-nav-config')['config']

    def restore():
        restored = inst.request('PUT', '/api/v1/nav/config', original, label='appearance-restore-nav-config')
        require(restored.get('success') is True, 'Appearance fixture does not restore the original navigation configuration')

    inst.cleanup.add('appearance navigation configuration', restore, scope='scenario')
    return original


def appearance_save_state(ctx):
    from playwright.sync_api import expect

    inst = ctx.inst
    seen = set()
    while True:
        splash = inst.request('GET', '/api/v1/nav/list').get('splash')
        if not splash:
            break
        require(splash['id'] not in seen, 'Dismissed setup remains pending')
        seen.add(splash['id'])
        inst.request('POST', '/api/v1/ui/splash/' + quote(splash['id'], safe='') + '/seen', {})

    preserve_navigation_config(inst)
    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000})
    browser.login()
    system(ctx, 'Appearance')
    editor = browser.frame.locator('kickside-appearance')
    expect(editor.locator('.ap-loading')).to_have_count(0)
    rows = editor.locator('.ap-row')
    expect(rows.nth(1)).to_be_visible()
    labels = [rows.nth(i).get_by_label('Surface label', exact=True).input_value() for i in range(2)]
    editor.get_by_role('button', name='Horizontal', exact=False).click()
    editor.get_by_role('button', name='Add category', exact=True).click()
    group = editor.locator('.ap-group').last
    group.get_by_label('Category name', exact=True).fill('Workspace tools')
    nav = browser.frame.locator('header[aria-label="App navigation"]')
    save = editor.get_by_role('button', name='Save', exact=True)
    discard = editor.get_by_role('button', name='Discard', exact=True)
    saved_states = []
    for index, label in enumerate(labels, 1):
        row = next(
            item for item in editor.locator('.ap-row').all()
            if item.get_by_label('Surface label', exact=True).input_value() == label)
        row.locator('[draggable]').dispatch_event('dragstart')
        group.dispatch_event('drop')
        expect(group.get_by_label('Surface label', exact=True)).to_have_count(index)
        expect(save).to_be_enabled()
        with browser.successful_response('PUT', '/api/v1/nav/config', 'appearance-save-' + str(index)):
            save.click()
        browser.screenshot('appearance-saved-' + str(index), full_page=False)
        saved_states.append((editor.locator('.ap-dirty').count(), save.is_disabled(), discard.is_disabled()))
        menu = nav.get_by_role('button', name='Workspace tools', exact=False)
        menu.click()
        for saved_label in labels[:index]:
            expect(nav.get_by_role('button', name=saved_label, exact=True)).to_be_visible()
        menu.click()
        persisted = inst.request('GET', '/api/v1/nav/list?manage=1', label='appearance-persisted-' + str(index))
        category = next(c for c in persisted['categories'] if c['label'] == 'Workspace tools')
        require({i['label'] for i in category['items']} == set(labels[:index]), 'Saved category membership differs')

    require(saved_states == [(0, True, True), (0, True, True)],
            'Successful saves leave editor dirty: ' + str(saved_states))


REGISTRY = [Scenario('appearance_save_state', 'regression', appearance_save_state, ('boot',),
                     features=http('ui', 'PUT /api/v1/nav/config', 'GET /api/v1/nav/list')
                     + navigation('ui', 'kickside.ui:tab.appearance'),
                     issues=('APPEARANCE-SAVE-DIRTY-STATE', 'APPEARANCE-CONSECUTIVE-NAV-UPDATES'))]
