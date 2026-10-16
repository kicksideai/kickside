"""Persisted canvas direction through editing, undo, reload and portable source."""
from harness import require


def verify_layout_direction(ctx):
    from scenarios_automation import dispatch_workflow, open_workflow, screen

    inst, browser = ctx.inst, ctx.browser
    title = 'Northwind persisted workflow direction'
    wid, _ = dispatch_workflow(ctx, title)
    base = '/api/v1/workflows/' + wid
    read = lambda: inst.request('GET', base + '/state', label='layout-direction-state')['state']
    require(read()['layout']['direction'] == 'TB', 'Fresh workflow direction differs')
    open_workflow(ctx, title)
    browser.frame.get_by_role('button', name='View controls', exact=True).click()
    browser.frame.get_by_role('menuitem', name='Lay out left to right', exact=True).click()
    state = inst.wait(lambda: value if (value := read())['layout']['direction'] == 'LR' else None,
                      'Canvas direction persists', seconds=35, pump=browser.page.wait_for_timeout)
    require('__layout__' not in state['layout']['positions'], 'Direction row appears as a node position')
    positions = state['layout']['positions']
    denied = inst.request('POST', base + '/apply', {'commands': [
        {'type': 'layout.clear-position', 'body': {'node_id': '__layout__'}}]},
        expect=(400,), label='layout-direction-reserved-row')
    require('reserved layout id refused' in str(denied), 'Reserved layout row accepts node deletion')
    require(read()['layout'] == state['layout'], 'Rejected command changes the saved layout')
    require(positions['start']['x'] < positions['receipt']['x'] < positions['finish']['x'],
            'Direction toggle does not lay out the graph horizontally')
    for mode in ('light', 'dark'):
        screen(ctx, 'workflow-direction-left-right-' + mode, dark=mode == 'dark')
        contrast = browser.frame.locator('.wfn-title, .wfn-kind').evaluate_all("""elements => elements.map(element => {
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
        inst.evidence.save('layout-direction-contrast-' + mode, contrast)
        require(contrast and all(item['ratio'] >= 4.5 for item in contrast), 'Canvas label contrast fails: ' + str(contrast))
    browser.reload()
    open_workflow(ctx, title)
    browser.frame.get_by_role('button', name='View controls', exact=True).click()
    browser.frame.get_by_role('menuitem', name='Lay out top to bottom', exact=True).wait_for(timeout=30000)
    browser.frame.get_by_role('menuitem', name='Fit view', exact=True).click()
    require(read()['layout']['positions'] == positions, 'Reload changes the saved layout')
    browser.frame.get_by_role('button', name='Undo', exact=True).click()
    inst.wait(lambda: read()['layout']['direction'] == 'TB', 'Undo restores canvas direction',
              seconds=35, pump=browser.page.wait_for_timeout)
    require(not read()['layout']['positions'], 'Undo leaves the toggle position batch')
    browser.frame.get_by_role('button', name='Redo', exact=True).click()
    inst.wait(lambda: read()['layout']['direction'] == 'LR', 'Redo restores canvas direction',
              seconds=35, pump=browser.page.wait_for_timeout)
    require(read()['layout']['positions'] == positions, 'Redo loses the position batch')
    inst.request('POST', base + '/publish', {}, label='layout-direction-publish')
    artifact = inst.request('GET', base + '/export', label='layout-direction-export')['flow']
    require(artifact['document']['layout']['direction'] == 'LR', 'Portable export loses direction')
    copied = inst.request('POST', '/api/v1/workflows/import', {'flow': artifact}, label='layout-direction-import')['flow']
    restored = inst.request('GET', '/api/v1/workflows/' + copied['flow_id'] + '/state', label='layout-direction-copy')['state']
    require(restored['layout'] == read()['layout'], 'Portable import loses layout direction or positions')
