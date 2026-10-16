"""The selected step's inspector shows the payload it routes to the next step."""
import json

from harness import require


def verify_routed_output(ctx):
    from scenarios_automation import dispatch_workflow, flow_detail, open_workflow, screen

    inst, browser = ctx.inst, ctx.browser
    title = 'Northwind routed output inspection'
    wid, _ = dispatch_workflow(ctx, title)
    base = '/api/v1/workflows/' + wid
    inst.request('POST', base + '/apply', {'commands': [
        {'type': 'node.update', 'body': {'id': 'receipt', 'config': {
            'code': 'return { product = __cx_args.product, crates = __cx_args.crates * 2 }', 'tool_ids': []}}},
        {'type': 'node.add', 'body': {'id': 'consumer', 'kind': 'block', 'ref': 'kickside.code_execution:block.run_code',
            'title': 'Consume routed stock', 'config': {'code': 'return __cx_args', 'tool_ids': []}}},
        {'type': 'edge.remove', 'body': {'id': 'receipt-finish'}},
        {'type': 'edge.add', 'body': {'id': 'receipt-consumer', 'source_id': 'receipt', 'source_port': 'result',
            'target_id': 'consumer', 'target_port': 'in', 'transform': 'output.result'}},
        {'type': 'edge.add', 'body': {'id': 'consumer-finish', 'source_id': 'consumer', 'source_port': 'result',
            'target_id': 'finish', 'target_port': 'in', 'transform': 'output.result'}},
    ]}, label='routed-output-code')
    version = inst.request('POST', base + '/publish', {}, label='routed-output-publish')['version']
    expected = {'product': 'Northwind Tea', 'crates': 48}
    rid = inst.request('POST', base + '/run', {'version': version,
        'input': {'product': 'Northwind Tea', 'crates': 24}}, label='routed-output-run')['run_id']
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Routed output run completes', seconds=60)
    require(done['run']['output'] == {'result': expected}, 'Finish output differs from the routed value')
    source = inst.request('GET', base + '/runs/' + rid + '/nodes/receipt/data', label='routed-output-source')['data']
    target = inst.request('GET', base + '/runs/' + rid + '/nodes/consumer/data', label='routed-output-target')['data']

    def content(row):
        return json.loads(row['content']) if isinstance(row['content'], str) else row['content']

    result = next(content(row) for row in source if row['type'] == 'node.result' and row.get('discriminator') == 'result.success')
    require(result['output'] == expected and result['data_ids'], 'Source completion loses its routed value or references')
    received = [content(row) for row in target if row['type'] == 'node.input' and row['data_id'] in result['data_ids']]
    require(received == [result['output']], 'Inspector output differs from the value routed to its target')
    open_workflow(ctx, title)
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    browser.frame.locator('.wf-runs-row').filter(has_text=rid[:8]).click()
    browser.frame.locator('.vue-flow__node').filter(has_text='Verify dispatch record').click()
    output = browser.frame.locator('.wf-payload').filter(has=browser.frame.get_by_text('Output', exact=True)).locator('.wf-run-output')
    output.wait_for(timeout=30000)
    require(json.loads(output.inner_text()) == expected, 'Inspector renders completion metadata instead of the routed output')
    for mode in ('light', 'dark'):
        screen(ctx, 'workflow-routed-output-' + mode, dark=mode == 'dark')
    browser.frame.locator('.wf-banner--run').get_by_role('button', name='Back to editing', exact=True).click()
