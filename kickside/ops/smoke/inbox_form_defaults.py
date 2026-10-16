"""A review opens with declared defaults and submits them unchanged."""
from urllib.parse import quote
from harness import require


def verify_form_defaults(ctx):
    from scenarios import workflow
    from scenarios_automation import nav, screen, flow_detail

    inst, browser = ctx.inst, ctx.browser
    form = {'type': 'object', 'required': ['call_slot', 'owner'], 'properties': {
        'call_slot': {'type': 'string', 'title': 'Proposed call slot', 'default': 'Thu 10:00 PT'},
        'owner': {'type': 'string', 'title': 'Deal owner', 'enum': ['Maya Chen', 'Tomas Varga'], 'default': 'Tomas Varga'},
        'seats': {'type': 'integer', 'title': 'Seats', 'default': 3},
        'amount': {'type': 'number', 'title': 'Amount', 'default': 0},
        'notify': {'type': 'boolean', 'title': 'Notify owner', 'default': True},
        'delayed': {'type': 'boolean', 'title': 'Delay notice', 'default': False},
    }}
    expected = {key: field['default'] for key, field in form['properties'].items()}
    wid, _ = workflow(ctx, review=True)
    base = '/api/v1/workflows/' + wid
    inst.request('POST', base + '/apply', {'commands': [{'type': 'node.update', 'body': {
        'id': 'review', 'config': {'prompt': 'Northwind proposed call review', 'form': form},
    }}]}, label='default-form-config')
    version = inst.request('POST', base + '/publish', {}, label='default-form-publish')['version']
    rid = inst.request('POST', base + '/run', {'version': version, 'input': {'marker': 'declared-defaults'}}, label='default-form-run')['run_id']

    def pending():
        rows = [row for row in inst.request('GET', '/api/v1/inbox?status=pending&limit=200', label='default-form-inbox')['items']
                if row.get('metadata', {}).get('run_id') == rid]
        require(len(rows) <= 1, 'Review creates duplicate default forms')
        return rows[0] if rows else None
    item = inst.wait(pending, 'Declared-default review reaches Inbox', seconds=60)
    require(item['metadata']['form'] == form, 'Review loses declared field defaults')
    nav(ctx, 'Inbox')
    browser.frame.locator('.kx-item').filter(has_text='Northwind proposed call review').click()
    browser.frame.get_by_test_id('decision-call_slot').wait_for(timeout=30000)
    require(browser.frame.get_by_test_id('decision-call_slot').input_value() == expected['call_slot'], 'Text default opens blank')
    require(expected['owner'] in browser.frame.get_by_test_id('decision-owner').inner_text(), 'Selected default does not render')
    for key in ('seats', 'amount'):
        require(browser.frame.get_by_test_id('decision-' + key).locator('input').input_value() == str(expected[key]), 'Numeric default differs: ' + key)
    for key in ('notify', 'delayed'):
        require(browser.frame.get_by_test_id('decision-' + key).locator('input').is_checked() == expected[key], 'Checkbox default differs: ' + key)
    approve = browser.frame.get_by_test_id('inbox-action').filter(has_text='Approve').first
    require(approve.is_enabled(), 'Valid required defaults keep approval disabled')
    for mode in ('light', 'dark'):
        screen(ctx, 'inbox-declared-defaults-' + mode, dark=mode == 'dark')
        contrast = browser.frame.locator('.kx-form-label, .kx-checkbox-row label').evaluate_all("""elements => elements.map(element => {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d');
            const luminance = rgb => {
                const c = [...rgb].slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
                return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
            };
            const ancestors = [];
            for (let node = element; node; node = node.parentElement || node.getRootNode().host) ancestors.unshift(node);
            context.fillStyle = '#fff'; context.fillRect(0, 0, 1, 1);
            for (const node of ancestors) { context.fillStyle = getComputedStyle(node).backgroundColor; context.fillRect(0, 0, 1, 1); }
            const bg = luminance(context.getImageData(0, 0, 1, 1).data);
            context.fillStyle = getComputedStyle(element).color; context.fillRect(0, 0, 1, 1);
            const fg = luminance(context.getImageData(0, 0, 1, 1).data);
            return { text: element.textContent, ratio: (Math.max(bg, fg) + .05) / (Math.min(bg, fg) + .05) };
        })""")
        inst.evidence.save('default-form-contrast-' + mode, contrast)
        require(len(contrast) == len(expected) and all(row['ratio'] >= 4.5 for row in contrast), 'Default form label contrast fails: ' + str(contrast))
    path = '/api/v1/inbox/' + quote(item['id'], safe='') + '/approve'
    with browser.page.expect_response(lambda response: response.url.endswith(path) and response.request.method == 'POST') as submitted:
        approve.click()
    require(submitted.value.status == 200, 'Default form approval fails')
    require(submitted.value.request.post_data_json == {'form': expected}, 'Unchanged defaults do not reach the approval request')
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Default form approval completes the workflow', seconds=60)
    require(done['run']['output'] == {'result': {'outcome': 'approve', 'form': expected}}, 'Review output changes submitted defaults')
    inst.evidence.save('default-form-completed', done['run']['output'])
