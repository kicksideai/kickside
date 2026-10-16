"""Recurring run times appear once in the manager row."""
from harness import require


def verify_row_schedule(ctx):
    from scenarios_automation import nav, screen

    inst, browser = ctx.inst, ctx.browser
    title = 'Northwind scheduled receipt'
    spec = {'title': title, 'enabled': True, 'schedule': {'type': 'interval', 'expression': '2s'},
            'target': {'kind': 'action', 'port': 'kickside.inbox.sink:inbox_item', 'config': {},
                       'input': {'title': title, 'content': 'Northwind scheduling verification.'}}}
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': spec}, label='row-schedule-create')['id']
    from cleanup_evidence import own_automation
    cleanup = own_automation(inst, aid)
    base = '/api/v1/automations/' + aid
    read = lambda: inst.request('GET', base + '/status', label='row-schedule-status')['drives']
    inst.wait(lambda: any(d.get('last_run_at') for d in read()), 'Recurring task completes an occurrence', seconds=60)
    spec['schedule']['expression'] = '97h'
    inst.request('PUT', base, {'input': spec}, label='row-schedule-reconfigure')
    from datetime import datetime, timezone, timedelta
    threshold = datetime.now(timezone.utc) + timedelta(days=4)
    inst.wait(lambda: any(d.get('last_run_at') and d.get('next_run_at') and
              datetime.fromisoformat(d['next_run_at'].replace('Z', '+00:00')) > threshold for d in read()),
              'Recurring task projects both run times', seconds=60)
    nav(ctx, 'Automations')
    row = browser.frame.locator('.kx-row').filter(has=browser.frame.get_by_text(title, exact=True))
    row.wait_for(timeout=30000)
    text = row.inner_text()
    require('last ran' in text and text.count('next in 4d') == 1, 'Row run times differ: ' + text)
    require('Next Run At' not in text, 'Next run appears as a metric chip: ' + text)
    for mode in ('light', 'dark'):
        screen(ctx, 'automation-row-schedule-' + mode, dark=mode == 'dark')
        geometry = row.locator('.kx-tag-sm').evaluate_all("elements => elements.map(el => { const s = getComputedStyle(el); return {font: s.fontSize, padding: s.padding}; })")
        inst.evidence.save('row-tag-geometry-' + mode, geometry)
        require(geometry and all(item == {'font': '10.5px', 'padding': '1px 7px'} for item in geometry), 'Shared tag geometry differs: ' + str(geometry))
        contrast = row.locator('.kx-name, .kx-sub, .kx-badge').evaluate_all("""elements => elements.map(element => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
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
        inst.evidence.save('row-schedule-contrast-' + mode, contrast)
        require(contrast and all(item['ratio'] >= 4.5 for item in contrast), 'Automation label contrast fails: ' + str(contrast))
    cleanup()
