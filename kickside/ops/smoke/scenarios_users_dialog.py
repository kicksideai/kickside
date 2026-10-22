"""Account creation and editing stay in viewport-contained modal dialogs."""
import uuid

from harness import Scenario, require
from runtime_fixtures import complete_splashes
from scenarios_core import http, navigation, system


def account_editor(ctx, kind):
    from playwright.sync_api import expect

    inst = ctx.inst
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=1, color_scheme='light')
    browser.page.set_viewport_size({'width': 1600, 'height': 1000})
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    system(ctx, 'Users')
    panel = browser.frame.locator('kickside-users')
    if kind == 'bot':
        panel.get_by_role('tab', name='Bots', exact=True).click()
    name = 'Account editor ' + uuid.uuid4().hex[:8]
    panel.get_by_role('button', name='Create ' + kind, exact=True).first.click()
    dialog = panel.get_by_role('dialog', name='Create ' + kind, exact=True)
    expect(dialog).to_be_visible(timeout=30000)
    for scheme in ('light', 'dark'):
        browser.page.emulate_media(color_scheme=scheme)
        browser.screenshot(kind + '-create-' + scheme, full_page=False)
    expect(dialog).to_have_attribute('aria-modal', 'true')
    expect(dialog).to_be_in_viewport(ratio=1)
    expect(panel.get_by_role('heading', name='Users', exact=True)).to_be_visible()
    expect(panel.get_by_role('tab', name='Bots' if kind == 'bot' else 'All users', exact=True)).to_have_attribute('aria-selected', 'true')
    layout = panel.evaluate('''element => {
        const root = element.shadowRoot;
        const header = root.querySelector('.kx-head').getBoundingClientRect();
        const action = root.querySelector('.kx-head-actions').getBoundingClientRect();
        const tabs = [...root.querySelectorAll('[role=tab]')].map(tab => tab.getBoundingClientRect());
        return {rightGap: header.right - action.right, tabGap: tabs[1].left - tabs[0].right};
    }''')
    require(abs(layout['rightGap'] - 24) <= 1 and 0 <= layout['tabGap'] <= 16,
            'Account toolbar or adjacent tabs drift from the shared page layout: ' + str(layout))
    dialog.get_by_label('Full name', exact=True).fill(name)
    if kind == 'user':
        dialog.get_by_placeholder('user@example.com').fill('editor.' + uuid.uuid4().hex[:8] + '@example.test')
        dialog.get_by_placeholder('Minimum 8 characters').fill(inst.password)
    else:
        expect(dialog.locator('input[type=email], input[type=password]')).to_have_count(0)
        expect(dialog.get_by_label('Use default membership', exact=True)).to_have_count(0)
    endpoint = '/api/v1/users' + ('/bots' if kind == 'bot' else '')
    with browser.page.expect_response(lambda response: response.request.method == 'POST' and response.url.endswith(endpoint)) as created:
        dialog.get_by_role('button', name='Create', exact=True).click()
    body = created.value.json()
    require(created.value.status == 201 and body.get('success'), 'Account creation fails: ' + str(body))
    path = '/api/v1/users/' + body['user']['user_id']
    inst.cleanup.add('modal editor account', lambda: inst.request('DELETE', path, expect=(202,)))
    expect(dialog).to_have_count(0)
    row = panel.locator('.ku-row').filter(has_text=name)
    expect(row).to_be_visible(timeout=30000)
    row.get_by_role('button', name='Edit ' + name, exact=True).click()
    editor = panel.get_by_role('dialog', name='Edit ' + kind, exact=True)
    expect(editor).to_have_attribute('aria-modal', 'true')
    expect(editor).to_be_in_viewport(ratio=1)
    expect(editor.get_by_label('Full name', exact=True)).to_have_value(name)
    if kind == 'bot':
        expect(editor.locator('input[type=email], input[type=password]')).to_have_count(0)
    updated_name = name + ' updated'
    editor.get_by_label('Full name', exact=True).fill(updated_name)
    for scheme in ('light', 'dark'):
        browser.page.emulate_media(color_scheme=scheme)
        browser.screenshot(kind + '-edit-' + scheme, full_page=False)
    with browser.page.expect_response(lambda response: response.request.method == 'PUT' and response.url.endswith(path)) as saved:
        editor.get_by_role('button', name='Save', exact=True).click()
    require(saved.value.status == 200 and saved.value.json().get('success'), 'Account save fails')
    expect(editor).to_have_count(0)
    expect(panel.locator('.ku-row').filter(has_text=updated_name)).to_be_visible(timeout=30000)
    expect(panel.get_by_role('table', name='Bots' if kind == 'bot' else 'All users', exact=True)).to_be_visible()
    panel.get_by_role('button', name='Edit ' + updated_name, exact=True).click()
    expect(editor).to_be_visible()
    browser.page.keyboard.press('Escape')
    expect(editor).to_have_count(0)
    for scheme in ('light', 'dark'):
        browser.page.emulate_media(color_scheme=scheme)
        browser.screenshot(kind + '-table-' + scheme, full_page=False)
    browser.clean(0)


def users_modal_editor(ctx):
    account_editor(ctx, 'user')


def bots_modal_editor(ctx):
    account_editor(ctx, 'bot')


REGISTRY = [
    Scenario('users_modal_editor', 'regression', users_modal_editor,
             issues=('USERS-ACCOUNT-EDITOR-MODAL', 'USERS-ACCOUNT-PAGE-LAYOUT'),
             features=navigation('users', 'kickside.users:tab.users') + http('users', 'POST /api/v1/users', 'PUT /api/v1/users/{id}')),
    Scenario('bots_modal_editor', 'regression', bots_modal_editor,
             issues=('USERS-ACCOUNT-EDITOR-MODAL', 'USERS-ACCOUNT-PAGE-LAYOUT'),
             features=navigation('users', 'kickside.users:tab.users') + http('users', 'PUT /api/v1/users/{id}')),
]
