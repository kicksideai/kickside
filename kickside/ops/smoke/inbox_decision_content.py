"""Reviewed data distinguishes Inbox cards and renders as Markdown blocks."""
from harness import require


def verify_decision_content(ctx):
    from scenarios import workflow
    from scenarios_automation import nav, screen

    inst, browser = ctx.inst, ctx.browser
    wid, version = workflow(ctx, review=True)
    reviewed = {
        'account': 'Kestrel Labs',
        'digest': '### Executive Summary\n\n| Metric | Value |\n| --- | --- |\n| ARR | $150,000 |',
        'lines': [{'name': 'UX/UI Redesign', 'amount': 52800}, {'name': 'Mobile | App', 'amount': 61000}],
        'tags': ['red', 'at-risk'],
        'owner': {'name': 'Maya Chen', 'team': 'Delivery'},
    }
    run = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': reviewed}, label='structured-review-run')['run_id']
    other = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': {'account': 'Brightline Energy'}}, label='other-review-run')['run_id']

    def pending():
        rows = [row for row in inst.request('GET', '/api/v1/inbox?status=pending&limit=200', label='structured-review-items')['items']
                if row.get('metadata', {}).get('run_id') in (run, other)]
        require(len(rows) <= 2, 'Duplicate review cards')
        return {row['metadata']['run_id']: row for row in rows} if len(rows) == 2 else None
    items = inst.wait(pending, 'Both reviewed inputs reach Inbox', seconds=60)
    content = items[run]['content']
    require(items[run]['title'] == items[other]['title'] == 'Approve fictional Northwind stock.', 'Review prompt does not remain the title')
    require(content.startswith('- account: Kestrel Labs') and items[other]['content'] == '- account: Brightline Energy', 'List preview does not lead with reviewed data')
    require('Approve fictional Northwind stock.' not in content, 'Review content duplicates the prompt')
    require('**digest**\n\n### Executive Summary' in content and '**lines**\n\n| amount | name |' in content, 'Structured review loses Markdown blocks')
    require('**tags**\n\n- red\n- at-risk' in content and '**owner**\n\n```json\n' in content, 'Review lists or nested records lose their blocks')
    require(items[run]['metadata']['input'] == reviewed, 'Content formatting changes reviewed data')
    nav(ctx, 'Inbox')
    card = browser.frame.locator('.kx-item').filter(has_text='Kestrel Labs')
    require(card.count() == 1 and card.locator('.kx-preview').inner_text().startswith('- account: Kestrel Labs'), 'Inbox list hides the reviewed account')
    card.click()
    viewer = browser.frame.locator('.kx-detail-pane wc-render-markdown')
    viewer.locator('h3').filter(has_text='Executive Summary').wait_for(timeout=30000)
    tables = viewer.locator('table')
    require(tables.count() == 2, 'Review digest and record list do not render as two tables')
    require('ARR' in tables.nth(0).inner_text() and '$150,000' in tables.nth(0).inner_text(), 'Digest table loses values')
    require('Mobile | App' in tables.nth(1).inner_text() and '61000' in tables.nth(1).inner_text(), 'Record table loses escaped cell data')
    require(viewer.locator('li').filter(has_text='at-risk').count() == 1, 'Scalar list does not render')
    require('Maya Chen' in viewer.locator('pre').inner_text(), 'Nested owner does not render in a code block')
    for mode in ('light', 'dark'):
        screen(ctx, 'inbox-reviewed-content-' + mode, dark=mode == 'dark')
    inst.evidence.save('structured-review-content', {'content': content, 'other_content': items[other]['content']})
