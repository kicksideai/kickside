"""Notice content uses the shared Markdown rendering and sanitization contract."""
import uuid

from harness import Scenario, require
from scenarios import nav


def inbox_notice_markdown(ctx):
    inst, browser = ctx.inst, ctx.browser_check()
    title = 'Markdown notice ' + uuid.uuid4().hex[:12]
    content = ('## What changed\n\n**Discount update**\n\n- Review the terms.\n- Confirm the date.\n\n'
               '<img src=x onerror="alert(1)"><script>alert(1)</script>\n\n'
               '[unsafe](javascript:alert(1))')
    fields = [{'label': 'Terms <img src=x>', 'value': 'Annual & <script>alert(2)</script>'}]
    item = inst.request('POST', '/api/v1/inbox', {
        'item_type': 'notice', 'title': title, 'content': content, 'metadata': {'fields': fields},
    }, label='notice-markdown-create')['item']
    inst.cleanup.add('Markdown notice', lambda: inst.request('DELETE', '/api/v1/inbox/' + item['id']), scope='scenario')
    browser.login()
    nav(ctx, 'Inbox')
    browser.frame.locator('.kx-item').filter(has_text=title).click()
    notice = browser.frame.locator('.kx-detail-pane kickside-inbox-notice')
    viewer = notice.locator('wc-render-markdown')
    viewer.locator('h2').filter(has_text='What changed').wait_for(timeout=30000)
    require(viewer.get_attribute('source') == content, 'Notice changes the Markdown source')
    require(viewer.locator('strong').inner_text() == 'Discount update', 'Notice loses bold structure')
    require(viewer.locator('ul > li').all_text_contents() == ['Review the terms.', 'Confirm the date.'],
            'Notice loses list structure')
    require(viewer.locator('img, script, [onerror], a[href^="javascript:"]').count() == 0,
            'Notice renders executable HTML')
    require(notice.locator('.label').inner_text() == fields[0]['label'] and
            notice.locator('.value').inner_text() == fields[0]['value'], 'Notice loses metadata fields')
    require(notice.locator('.fields img, .fields script').count() == 0, 'Notice injects metadata HTML')
    browser.screenshot('inbox-notice-markdown')
    inst.evidence.save('notice-markdown', {'content': content, 'fields': fields})


REGISTRY = [Scenario('inbox_notice_markdown', 'regression', inbox_notice_markdown, ('first_agent',),
    issues=('INBOX-NOTICE-MARKDOWN',), features=(
        'kickside/inbox|inbox_kind|kickside.inbox:item_type.notice',
        'kickside/inbox|http|POST /api/v1/inbox',
        'kickside/inbox|navigation|kickside.inbox:nav_item',
    ))]
