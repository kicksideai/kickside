"""Run history keeps row geometry and displays parked execution in every run view."""
from urllib.parse import quote

from harness import require


def verify_past_runs(ctx):
    from scenarios import workflow
    from scenarios_automation import dispatch_workflow, open_workflow, screen

    inst, browser = ctx.inst, ctx.browser
    wid, version = dispatch_workflow(ctx, "Northwind history runs")
    base = '/api/v1/workflows/' + wid
    for index in range(16):
        inst.request('POST', base + '/run', {'version': version, 'input': {'index': index}}, label='history-run-' + str(index))

    def completed():
        rows = inst.request('GET', base + '/runs?limit=20', label='history-completed')['runs']
        require(all(row['status'] != 'failed' for row in rows), 'History fixture run fails')
        return rows if len(rows) == 16 and all(row['status'] == 'completed' for row in rows) else None

    inst.wait(completed, 'History fixture runs complete', seconds=60)
    open_workflow(ctx, 'Northwind history runs')
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    browser.frame.locator('.wf-runs-row').last.wait_for(timeout=30000)
    geometry = browser.frame.locator('.wf-runs-list').evaluate("""list => ({
        height: list.clientHeight, scroll: list.scrollHeight,
        rows: [...list.querySelectorAll('.wf-runs-row')].map(row => {
            const bounds = row.getBoundingClientRect();
            const meta = row.querySelector('.wf-runs-meta').getBoundingClientRect();
            return { top: bounds.top, bottom: bounds.bottom, metaTop: meta.top, metaBottom: meta.bottom };
        })
    })""")
    inst.evidence.save('history-row-geometry', geometry)
    require(geometry['scroll'] > geometry['height'], 'History list does not scroll')
    require(len(geometry['rows']) == 16, 'History list omits runs')
    require(all(row['metaTop'] >= row['top'] and row['metaBottom'] <= row['bottom'] for row in geometry['rows']),
            'History metadata overflows its row')
    require(all(right['top'] >= left['bottom'] for left, right in zip(geometry['rows'], geometry['rows'][1:])),
            'History rows overlap')
    for mode in ('light', 'dark'):
        browser.frame.locator('.wf-runs-list').evaluate('list => { list.scrollTop = list.scrollHeight }')
        browser.frame.locator('.wf-runs-row').last.scroll_into_view_if_needed()
        screen(ctx, 'workflow-past-runs-' + mode, dark=mode == 'dark')
        contrast = browser.frame.locator('.wf-runs-id, .wf-runs-time, .wf-run-status-tag').evaluate_all("""elements => elements.map(element => {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const context = canvas.getContext('2d');
            const luminance = rgb => {
                const linear = [...rgb].slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
                return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
            };
            const ancestors = [];
            for (let node = element; node; node = node.parentElement || node.getRootNode().host) ancestors.unshift(node);
            context.fillStyle = '#fff'; context.fillRect(0, 0, 1, 1);
            for (const node of ancestors) { context.fillStyle = getComputedStyle(node).backgroundColor; context.fillRect(0, 0, 1, 1); }
            const background = luminance(context.getImageData(0, 0, 1, 1).data);
            context.fillStyle = getComputedStyle(element).color; context.fillRect(0, 0, 1, 1);
            const foreground = luminance(context.getImageData(0, 0, 1, 1).data);
            return { text: element.textContent, ratio: (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05) };
        })""")
        inst.evidence.save('history-contrast-' + mode, contrast)
        require(contrast and all(item['ratio'] >= 4.5 for item in contrast), 'History label contrast fails: ' + str(contrast))
    browser.page.keyboard.press('Escape')
    inst.install('kickside/inbox')
    review, review_version = workflow(ctx, review=True)
    review_base = '/api/v1/workflows/' + review
    rid = inst.request('POST', review_base + '/run', {'version': review_version, 'input': {'marker': 'history-waiting'}}, label='history-review-run')['run_id']

    def waiting():
        rows = inst.request('GET', review_base + '/runs', label='history-review-waiting')['runs']
        require(all(row['status'] not in ('failed', 'completed') for row in rows), 'Review terminates before its decision')
        return rows if rows and rows[0].get('dataflow_status') == 'waiting' else None

    inst.wait(waiting, 'History exposes parked run status', seconds=60)
    open_workflow(ctx, 'Northwind smoke review')
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    row = browser.frame.locator('.wf-runs-row').filter(has_text=rid[:8])
    row.get_by_text('Waiting', exact=True).wait_for(timeout=30000)
    row.click()
    browser.frame.locator('.wf-banner--run').filter(has_text='Waiting').wait_for(timeout=30000)
    browser.frame.locator('.wf-panel-how .wf-run-status-tag').get_by_text('Waiting', exact=True).wait_for(timeout=30000)
    screen(ctx, 'workflow-waiting-selected', dark=True)

    def pending_item():
        items = [item for item in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='history-review-inbox')['items']
                 if item.get('metadata', {}).get('run_id') == rid]
        require(len(items) <= 1, 'Review creates duplicate correlated decisions')
        return items[0] if items else None

    item = inst.wait(pending_item, 'History review decision exists', seconds=35)
    inst.request('POST', '/api/v1/inbox/' + quote(item['id'], safe='') + '/approve',
                 {'form': {'reason': 'History status verification'}}, label='history-review-approve')

    def resolved():
        detail = inst.request('GET', review_base + '/runs/' + rid, label='history-review-terminal')
        require(detail['run']['status'] != 'failed', 'History review fails after approval')
        return detail if detail['run']['status'] == 'completed' else None

    inst.wait(resolved, 'History review completes', seconds=60)
