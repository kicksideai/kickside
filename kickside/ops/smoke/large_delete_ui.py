"""Browser deletion of components with bounded cleanup work."""
import re

from cleanup_evidence import await_cleanup
from harness import require
from scenarios import nav
from scenarios_access import Checks


def crowded_thread(ctx, identifier, append_record):
    base = '/api/v1/threads/' + identifier
    for index in range(205):
        ctx.inst.request('POST', base + '/projections', {
            'kind': 'delete-regression', 'projection_key': 'record-' + str(index).zfill(4),
            'worker_ref': 'func://kickside.core.lifecycle:child_lifecycle_projection',
            'events': ['smoke:never_emitted'], 'debounce_idle_ms': 600000, 'debounce_max_ms': 600000,
        }, expect=(201,), label='large-delete-projection-' + str(index))
        append_record(index)


def delete_in_browser(ctx, identifier, title, *, knowledge, after_accepted=None):
    from playwright.sync_api import expect
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    nav(ctx, 'Knowledge' if knowledge else 'Workspace')
    if knowledge:
        panel = browser.frame.locator('kickside-knowledge')
        row = panel.locator('.kx-card').filter(has_text=title)
        row.get_by_role('button', name='Delete ' + title, exact=True).click()
        confirm = browser.page
        expect(confirm.get_by_text('Delete knowledge base', exact=True)).to_be_visible(timeout=30000)
        path = '/api/v1/knowledge/' + identifier
    else:
        panel = browser.frame.locator('chestor-workspace')
        row = panel.locator('.ws-row, .ws-tile').filter(has_text=title)
        expect(row).to_be_visible(timeout=30000)
        row.focus()
        row.press('Delete')
        confirm = panel.locator('.ws-modal').filter(has_text='Delete entry')
        path = '/api/v1/workspace/entries/' + identifier
    browser.screenshot('large-delete-confirmation')
    with browser.page.expect_response(lambda r: r.request.method == 'DELETE' and r.url.endswith(path)) as response:
        confirm.get_by_role('button', name='Delete', exact=True).click()
    receipt = response.value.json()
    ctx.inst.evidence.save('large-delete-browser-receipt', {'status': response.value.status, 'body': receipt})
    require(response.value.status == 202 and receipt.get('success') and receipt.get('in_progress'),
        'Large browser deletion does not return accepted cleanup progress: ' + str(receipt))
    checks = Checks(ctx, 'large_delete_ui', 'owner')
    checks.check('visible_progress', lambda: expect(browser.frame.get_by_text(
        re.compile('delet.*in progress|deleting|remov.*in progress|cleanup.*pending', re.I))).to_be_visible(timeout=30000))
    if after_accepted:
        after_accepted(browser, panel, row)
    browser.screenshot('large-delete-progress')
    await_cleanup(ctx.inst, identifier, knowledge=knowledge)
    checks.check('visible_completion', lambda: expect(row).to_have_count(0, timeout=30000))
    checks.check('no_error_surface', lambda: expect(panel.locator('.kx-err, .ws-error')).to_have_count(0))
    checks.check('no_error_toast', lambda: expect(browser.page.locator('.p-toast-message-error')).to_have_count(0))
    browser.screenshot('large-delete-complete')
    checks.finish()
