"""Northwind automation, workflow, inbox, connection, and credential journeys."""
import base64
import hashlib
import json
import re
import uuid
from urllib.parse import quote, urlencode, urlsplit, parse_qs

import jsonschema

from harness import Scenario, require
from scenarios import Context, nav as suite_nav, workflow, workflow_inbox_restart, member_identity
from cleanup_evidence import delete_component
from workflow_failure_contract import verify_failure_cause
from mcp_client import MCPClient


def features(component, category, *keys):
    return tuple('kickside/' + component + '|' + category + '|' + key for key in keys)


def nav(ctx, label):
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)
    suite_nav(ctx, label)
    ctx.browser.settle()


def screen(ctx, label, dark=False):
    browser = ctx.browser_check()
    if not ctx.state.get('automation_evidence_context'):
        browser.settle()
        state = browser.context.storage_state()
        browser.reset_context(storage_state=state, viewport={'width': 1600, 'height': 1000}, device_scale_factor=2, color_scheme='light')
        browser.page.goto(ctx.inst.base + '/', wait_until='domcontentloaded', timeout=30000)
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        ctx.state['automation_evidence_context'] = True
    browser.page.emulate_media(color_scheme='dark' if dark else 'light')
    browser.settle()
    return browser.screenshot(label, full_page=False, mask_color='#20242b' if dark else '#eef0f3')


def prepare_ui(ctx):
    screen(ctx, 'northwind-workspace')


def installable_automation_titles(types):
    require(isinstance(types, list), 'Automation type API does not return a list: ' + str(types))
    titles = []
    for row in types:
        require(isinstance(row, dict), 'Automation type API contains a non-object row: ' + str(row))
        if row.get('installable') is False:
            continue
        title = row.get('title') or row.get('name') or row.get('id')
        require(isinstance(title, str) and title.strip(), 'Installable automation type has no display title: ' + str(row))
        titles.append(title)
    require(len(titles) == len(set(titles)), 'Automation type API contains duplicate installable titles: ' + str(titles))
    return titles


def require_automation_menu_titles(expected, actual):
    require(isinstance(actual, list) and all(isinstance(title, str) and title.strip() for title in actual),
            'Automation menu contains invalid titles: ' + str(actual))
    require(len(actual) == len(set(actual)), 'Automation menu contains duplicate titles: ' + str(actual))
    require(actual == expected, 'Automation menu differs from the live type catalog: expected ' + str(expected) + ', got ' + str(actual))


def assert_mcp_tool_arguments(inst, token, name, arguments):
    descriptors = MCPClient(inst, token, '/api/public/mcp', stateful=False).rpc('tools/list', {}, 'mcp-tool-schema-' + name).get('tools')
    require(isinstance(descriptors, list), 'MCP tools/list returns no descriptor list: ' + str(descriptors))
    matches = [descriptor for descriptor in descriptors if descriptor.get('name') == name]
    require(len(matches) == 1, 'MCP tools/list has no unique descriptor for ' + name + ': ' + str(matches))
    schema = matches[0].get('inputSchema')
    require(isinstance(schema, dict), 'MCP tools/list has no object input schema for ' + name + ': ' + str(schema))
    validator = jsonschema.Draft202012Validator(schema)
    validator.check_schema(schema)
    errors = sorted(validator.iter_errors(arguments), key=lambda error: list(error.absolute_path))
    require(not errors, 'Arguments differ from the declared MCP schema for ' + name + ': ' +
            '; '.join(error.message for error in errors))


def catalog(ctx):
    inst = ctx.inst
    for package in ('workflows', 'webhooks', 'mcp', 'code-execution', 'channel', 'google'):
        inst.install('kickside/' + package)
    cases = [('/automations/types', 'types'), ('/automations/sources', 'sources'),
             ('/automations/sinks', 'sinks'), ('/workflows/blocks', 'blocks'),
             ('/inbox/item-types', 'item_types'), ('/mcp/tools', 'tools'),
             ('/mcp/components', 'components'), ('/mcp/presets', 'presets'),
             ('/connections/providers/discover', 'providers'),
             ('/connections/providers/badges', 'providers'),
             ('/oauth/providers/discover', 'providers')]
    automation_types = None
    for path, key in cases:
        data = inst.request('GET', '/api/v1' + path, label=path.replace('/', '-'))
        require(isinstance(data.get(key), list) and data[key], path + ' has no catalog entries: ' + str(data))
        if path == '/automations/types':
            automation_types = data[key]
    expected_menu_titles = installable_automation_titles(automation_types)
    require(expected_menu_titles, 'Automation type API has no installable types')
    require(isinstance(inst.request('GET', '/api/v1/automations/health', label='automation-health').get('health'), dict),
            'Automation health has no projection')
    ctx.browser.reload()
    nav(ctx, 'Automations')
    ctx.browser.frame.get_by_role('button', name='Add automation', exact=True).first.click()
    dialog = ctx.browser.frame.get_by_role('dialog', name='Add an automation', exact=True)
    dialog.wait_for(timeout=30000)
    names = dialog.locator('.kx-cat-name').all_text_contents()
    require_automation_menu_titles(expected_menu_titles, names)
    ctx.inst.evidence.save('automation-menu', {'api_titles': expected_menu_titles, 'rendered_titles': names})
    screen(ctx, 'automation-create-menu')
    dialog.get_by_role('button', name='Cancel', exact=True).click()


def inbox_notices(ctx, ui=True):
    inst = ctx.inst
    if ui:
        nav(ctx, 'Inbox')
    created = []
    for kind, title, content in [('notice', 'Northwind shipment NW-2048', '48 crates of tea arrive Friday. Warehouse A reserves 12 crates.'),
                                 ('system', 'Northwind stock reconciliation', 'The fictional Northwind inventory reconciles 47 products across three warehouses.')]:
        item = inst.request('POST', '/api/v1/inbox', {'item_type': kind, 'title': title, 'content': content,
                    'priority': 'normal'}, label='create-' + kind)['item']
        require(item['title'] == title and item['item_type'] == kind, 'Inbox creation identity differs')
        item['expected_content'] = content
        created.append(item)
    inst.wait(lambda: all(any(row['id'] == i['id'] and row['content'] == i['expected_content'] and row['status'] == 'pending' for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='inbox-list')['items']) for i in created), 'Inbox persists exact created content', seconds=35)
    projection = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='inbox-component')
    thread = inst.request('GET', '/api/v1/threads/' + projection['component_id'], label='inbox-bound-thread')['thread']
    require(thread['thread_class'] == 'kickside.inbox' and thread['component_id'] == projection['component_id'], 'Inbox items lose their bound singleton component')
    if ui:
        nav(ctx, 'Inbox')
        ctx.browser.frame.get_by_text(created[0]['title'], exact=True).first.wait_for(timeout=30000)
        screen(ctx, 'northwind-inbox-light')
    for item in created:
        result = inst.request('POST', '/api/v1/inbox/' + quote(item['id'], safe='') + '/dismiss', {}, label='dismiss-' + item['item_type'])
        require(result['item']['status'] != 'pending', 'Dismiss leaves inbox pending')
        inst.request('DELETE', '/api/v1/inbox/' + quote(item['id'], safe=''), label='delete-' + item['item_type'])
    inst.wait(lambda: not {i['id'] for i in created} & {i['id'] for i in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='inbox-after-delete')['items']}, 'Deleted inbox notices disappear', seconds=35)


def dispatch_workflow(ctx, title='Northwind smoke flow', *, request=None):
    inst = ctx.inst
    request = request or inst.request
    inst.install('kickside/workflows')
    inst.install('kickside/code-execution')
    wid = request('POST', '/api/v1/workflows', {'title': title}, label='dispatch-flow-create')['flow_id']
    schema = {'type': 'object', 'additionalProperties': True}
    error_schema = {'type': 'object', 'additionalProperties': False,
        'required': ['kind', 'message'],
        'properties': {'kind': {'type': 'string'}, 'message': {'type': 'string'}}}
    commands = [
        {'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'title': 'Northwind dispatch input', 'config': {'input_schema': schema}}},
        {'type': 'node.add', 'body': {'id': 'receipt', 'kind': 'block', 'title': 'Verify dispatch record', 'ref': 'kickside.code_execution:block.run_code', 'config': {'code': 'return __cx_args', 'tool_ids': []}}},
        {'type': 'node.add', 'body': {'id': 'finish', 'kind': 'finish', 'title': 'Northwind dispatch output', 'config': {'output_schema': schema}}},
        {'type': 'node.add', 'body': {'id': 'code-error', 'kind': 'error', 'title': 'Northwind dispatch failure', 'config': {'error_schema': error_schema}}},
        {'type': 'edge.add', 'body': {'id': 'start-receipt', 'source_id': 'start', 'target_id': 'receipt', 'source_port': 'out', 'target_port': 'in'}},
        {'type': 'edge.add', 'body': {'id': 'receipt-finish', 'source_id': 'receipt', 'target_id': 'finish', 'source_port': 'result', 'target_port': 'in', 'transform': 'output.result'}},
        {'type': 'edge.add', 'body': {'id': 'receipt-code-error', 'source_id': 'receipt', 'source_port': 'error', 'target_id': 'code-error', 'target_port': 'in', 'transform': 'output.error'}},
    ]
    request('POST', '/api/v1/workflows/' + wid + '/apply', {'commands': commands}, label='dispatch-definition')
    version = request('POST', '/api/v1/workflows/' + wid + '/publish', {}, label='dispatch-publish')['version']
    return wid, version



def replace_workflow_block(inst, wid, node_id, ref, *, title, config, port_map, transforms):
    selected = inst.request('GET', '/api/v1/workflows/blocks?id=' + quote(ref, safe=''), label='replacement-block-detail')['block']
    require(selected['id'] == ref, 'Replacement block differs from the selected live Block')
    outgoing = {port['id'] for port in selected['ports'] if port['direction'] == 'out'}
    base = '/api/v1/workflows/' + wid
    state = inst.request('GET', base + '/state', label='replacement-block-state')['state']
    nodes = [node for node in state['nodes'] if node['id'] == node_id]
    require(len(nodes) == 1 and nodes[0]['kind'] == 'block', 'Replacement target is not one workflow block')
    commands = [{'type': 'node.update', 'body': {'id': node_id, 'ref': ref, 'title': title, 'config': config}}]
    for edge in state['edges']:
        if edge['source_id'] != node_id:
            continue
        old_port = edge['source_port']
        port = port_map.get(old_port, old_port)
        require(port in outgoing, 'Replacement block does not declare routed source port ' + port)
        body = {'id': edge['id']}
        if port != old_port:
            body['source_port'] = port
        if old_port in transforms:
            body['transform'] = transforms[old_port]
        if len(body) > 1:
            commands.append({'type': 'edge.update', 'body': body})
    inst.request('POST', base + '/apply', {'commands': commands}, label='replacement-block-config')

def flow_detail(inst, wid, rid):
    result = inst.request('GET', f'/api/v1/workflows/{wid}/runs/{rid}', label='run-detail')
    require(result['run']['status'] != 'failed', 'Workflow fails: ' + str(result))
    return result if result['run']['status'] == 'completed' else None


def workflow_lifecycle(ctx):
    inst = ctx.inst
    wid, version = dispatch_workflow(ctx)
    base = '/api/v1/workflows/' + wid
    state = inst.request('GET', base + '/state', label='flow-state')['state']
    require('start' in json.dumps(state) and 'finish' in json.dumps(state), 'Workflow state loses nodes')
    events = inst.request('GET', base + '/events', label='flow-events')
    require('start' in json.dumps(events), 'Workflow node events absent')
    listed = inst.request('GET', '/api/v1/workflows', label='flow-list')
    require(wid in json.dumps(listed), 'Created workflow absent from list')
    published = inst.request('GET', '/api/v1/workflows/published', label='published-flows')
    require(wid in json.dumps(published), 'Published workflow absent from catalog')
    inst.request('POST', base + '/apply', {'commands': [{'type': 'node.update', 'body': {'id': 'finish', 'title': 'Northwind dispatch receipt'}}]}, label='rename-step')
    require('Northwind dispatch receipt' in json.dumps(inst.request('GET', base + '/state')), 'Step rename does not persist')
    inst.request('POST', base + '/undo', {}, label='flow-undo')
    require('Northwind dispatch receipt' not in json.dumps(inst.request('GET', base + '/state')), 'Undo leaves renamed step')
    inst.request('POST', base + '/redo', {}, label='flow-redo')
    require('Northwind dispatch receipt' in json.dumps(inst.request('GET', base + '/state')), 'Redo loses step title')
    second = inst.request('POST', base + '/publish', {}, label='flow-second-version')['version']
    require(second > version, 'Workflow publish does not advance version')
    versions = inst.request('GET', base + '/versions', label='flow-versions')['versions']
    require(len(versions) == 2, 'Workflow version count differs')
    require('Northwind dispatch receipt' in json.dumps(inst.request('GET', base + f'/versions/{second}', label='flow-version')), 'Version loses title')
    diff = inst.request('GET', base + f'/versions/diff?from_version={version}&to_version={second}', label='flow-diff')
    require('Northwind dispatch receipt' in json.dumps(diff), 'Version diff loses changed title')
    payload = {'marker': 'NW-DISPATCH-2048', 'crates': 48}
    rid = inst.request('POST', base + '/run', {'version': second, 'input': payload}, label='flow-run')['run_id']
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Northwind dispatch completion', seconds=60)
    require(done['run']['output'] == {'result': payload}, 'Workflow finish changes dispatch payload: ' + str(done))
    require(rid in json.dumps(inst.request('GET', base + '/runs', label='flow-runs')), 'Run absent from list')
    timeline = inst.request('GET', base + f'/runs/{rid}/events', label='run-events')
    require('completed' in json.dumps(timeline), 'Run timeline lacks completion')
    exported = inst.request('GET', base + f'/runs/{rid}/export', label='run-export')
    require('NW-DISPATCH-2048' in json.dumps(exported), 'Run export loses marker')
    data = inst.request('GET', base + f'/runs/{rid}/nodes/receipt/data', label='finish-data')
    require('NW-DISPATCH-2048' in json.dumps(data), 'Dispatch node data loses marker')
    artifact = inst.request('GET', base + '/export', label='flow-export')['flow']
    imported = inst.request('POST', '/api/v1/workflows/import', {'flow': artifact}, label='flow-import')['flow']
    copy_id = imported['flow_id']
    require(copy_id != wid and 'Northwind dispatch receipt' in json.dumps(inst.request('GET', '/api/v1/workflows/' + copy_id + '/state')), 'Import loses flow definition')
    restored = inst.request('POST', base + f'/versions/{version}/restore', {}, label='flow-restore')['flow']
    require(restored['flow_id'] != wid, 'Restore overwrites source workflow')
    simulated = inst.request('POST', base + '/simulate', {'input': payload}, label='flow-simulate')['run_id']
    require(inst.wait(lambda: flow_detail(inst, wid, simulated), 'Simulation completion', seconds=60)['run']['output'] == {'result': payload}, 'Simulation output differs')
    ctx.state['automation_flow'] = (wid, second)
    for fid in (copy_id, restored['flow_id']):
        inst.request('DELETE', '/api/v1/workflows/' + fid, label='flow-copy-delete')
        require(fid not in json.dumps(inst.request('GET', '/api/v1/workflows')), 'Deleted flow remains listed')
    nav(ctx, 'Workflows')
    ctx.browser.frame.get_by_text('Northwind smoke flow', exact=True).first.wait_for(timeout=30000)
    screen(ctx, 'northwind-workflow-library')


def approvals_restart(ctx):
    workflow_inbox_restart(ctx)
    screen(ctx, 'northwind-approvals-after-restart')


def approvals_api_restart(ctx):
    inst, browser = ctx.inst, ctx.browser
    wid, version = workflow(ctx, review=True)
    cases = []
    for decision in ('approve', 'reject'):
        rid = inst.request('POST', f'/api/v1/workflows/{wid}/run', {'version': version, 'input': {'marker': decision}}, label=decision + '-durable-run')['run_id']
        def waiting():
            detail = inst.request('GET', f'/api/v1/workflows/{wid}/runs/{rid}', label=decision + '-durable-wait')
            require(detail['run']['status'] not in ('completed', 'failed'), 'Review terminates before decision')
            return detail if any(node['status'] == 'waiting' for node in detail['nodes']) else None
        inst.wait(waiting, 'Review waits for Northwind decision', seconds=60)
        def pending_item():
            rows = [item for item in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='durable-inbox')['items'] if item['metadata'].get('run_id') == rid]
            require(len(rows) <= 1, 'Review duplicates correlated inbox items')
            return rows[0] if rows else None
        item = inst.wait(pending_item, 'Correlated pending review', seconds=35)
        require(item['status'] == 'pending' and item['item_type'] == 'flow_decision', 'Review loses pending decision type')
        cases.append((decision, rid, item))
    browser.settle()
    browser.page.goto('about:blank')
    browser = ctx.restart(hard=True)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    for decision, rid, item in cases:
        rows = [row for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='durable-restored-items')['items'] if row['id'] == item['id']]
        require(len(rows) == 1 and rows[0]['status'] == 'pending' and rows[0]['metadata'] == item['metadata'], 'Restart changes review identity or correlation')
        path = '/api/v1/inbox/' + quote(item['id'], safe='') + '/' + decision
        form = {'form': {'reason': 'Northwind warehouse decision after restart: ' + decision}}
        inst.request('POST', path, form, label=decision + '-durable-response')
        done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Durable decision resumes workflow', seconds=60)
        require(decision in json.dumps(done['run']['output']), 'Durable decision does not reach Finish')
        repeated = inst.request('POST', path, form, expect=(409,), label=decision + '-durable-repeat')
        require(repeated['success'] is False and 'resolved' in json.dumps(repeated).lower(), 'Repeated decision lacks resolved conflict')
    browser.settle()
    browser.page.goto('about:blank')
    browser = ctx.restart(hard=True)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    for decision, rid, _ in cases:
        done = inst.request('GET', f'/api/v1/workflows/{wid}/runs/{rid}', label=decision + '-durable-second-restart')
        require(done['run']['status'] == 'completed' and decision in json.dumps(done['run']['output']), 'Second restart loses completed decision')
    screen(ctx, 'northwind-durable-approval-state')


def recurring_lifecycle(ctx):
    inst = ctx.inst
    spec = {'title': 'Northwind daily warehouse brief', 'schedule': {'type': 'interval', 'expression': '2s'}, 'enabled': True,
            'target': {'kind': 'action', 'port': 'kickside.inbox.sink:inbox_item', 'config': {},
                       'input': {'title': 'Northwind daily warehouse brief', 'content': 'Fictional Northwind: 48 tea crates, 12 reserved, three warehouses.'}}}
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': spec}, label='recurring-create')['id']
    from cleanup_evidence import own_automation
    cleanup = own_automation(inst, aid)
    base = '/api/v1/automations/' + aid
    def delivered():
        rows = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='recurring-deliveries')['items']
        rows = [row for row in rows if row['title'] == spec['title']]
        require(all('48 tea crates' in row['content'] for row in rows), 'Recurring delivery content differs')
        return rows if len({row['id'] for row in rows}) >= 2 else None
    inst.wait(delivered, 'Two recurrent Northwind actions', seconds=60)
    config = inst.request('GET', base + '/config', label='recurring-config')['config']
    require(config['target'] == spec['target'], 'Recurring config loses target')
    require(inst.request('GET', base + '/state', label='recurring-state')['state'], 'Recurring public state empty')
    require(inst.request('GET', base + '/status', label='recurring-status')['id'] == aid, 'Recurring status identity differs')
    inst.request('POST', base + '/control', {'control': 'pause', 'request_id': uuid.uuid4().hex}, label='recurring-pause')
    inst.wait(lambda: 'paused' in json.dumps(inst.request('GET', base + '/status', label='paused-status')), 'Recurring pause projection', seconds=35)
    inst.request('PATCH', base, {'title': 'Northwind morning fulfillment brief', 'description': 'Three warehouses reconcile fictional Northwind stock.'}, label='recurring-rename')
    require('Northwind morning fulfillment brief' in json.dumps(inst.request('GET', '/api/v1/automations', label='recurring-list')), 'Automation rename does not persist')
    spec['title'] = 'Northwind morning fulfillment brief'
    spec['enabled'] = False
    spec['schedule']['expression'] = '1h'
    inst.request('PUT', base, {'input': spec}, label='recurring-reconfigure')
    require(inst.request('GET', base + '/config')['config']['schedule']['expression'] == '1h', 'Reconfiguration loses schedule')
    inst.request('POST', base + '/actions/reconfigure', {'declaration': spec}, label='recurring-action')
    artifact = inst.request('GET', base + '/export', label='automation-export')['artifact']
    require('1h' in json.dumps(artifact), 'Automation export loses cadence')
    copied = inst.request('POST', '/api/v1/automations/import', {'artifact': artifact}, label='automation-import')['id']
    cleanup_copy = own_automation(inst, copied)
    require(copied != aid and inst.request('GET', '/api/v1/automations/' + copied + '/config')['config']['target'] == spec['target'], 'Automation import loses target')
    inst.request('PATCH', base, {'title': 'Northwind morning fulfillment brief'}, label='recurring-final-name')
    nav(ctx, 'Automations')
    ctx.browser.frame.get_by_text('Northwind morning fulfillment brief', exact=True).first.wait_for(timeout=30000)
    screen(ctx, 'northwind-automations-light')
    for key, delete in ((copied, cleanup_copy), (aid, cleanup)):
        delete()
        inst.wait(lambda: key not in json.dumps(inst.request('GET', '/api/v1/automations')), 'Automation removal', seconds=60)


REGISTRY = [
    Scenario('automation_workflow_failure_cause', 'full', verify_failure_cause, ('first_agent',),
        features=features('workflows', 'http', 'POST /api/v1/workflows', 'POST /api/v1/workflows/{id}/apply',
            'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run',
            'GET /api/v1/workflows/{id}/runs', 'GET /api/v1/workflows/{id}/runs/{run_id}',
            'GET /api/v1/workflows/{id}/runs/{run_id}/events',
            'DELETE /api/v1/workflows/{id}') + features('code-execution', 'workflow_block',
            'kickside.code_execution:block.run_code') + features('core', 'http',
            'GET /api/v1/threads/{id}/events'), instance_setup=True),
    Scenario('automation_evidence', 'full', prepare_ui, ('first_agent',)),
    Scenario('automation_catalogs', 'full', catalog, ('automation_evidence',), issues=('SMOKE-AUTOMATION-CATALOG-FIXTURE',), features=(
        features('automation', 'http', 'GET /api/v1/automations/types', 'GET /api/v1/automations/sources', 'GET /api/v1/automations/sinks', 'GET /api/v1/automations/health') +
        features('workflows', 'http', 'GET /api/v1/workflows/blocks') + features('inbox', 'http', 'GET /api/v1/inbox/item-types') +
        features('mcp', 'http', 'GET /api/v1/mcp/tools', 'GET /api/v1/mcp/components', 'GET /api/v1/mcp/presets') +
        features('connection', 'http', 'GET /api/v1/connections/providers/discover', 'GET /api/v1/connections/providers/badges') +
        features('oauth', 'http', 'GET /api/v1/oauth/providers/discover')), instance_setup=True),
    Scenario('automation_inbox_notices', 'full', inbox_notices, ('automation_evidence',), features=(
        features('inbox', 'http', 'POST /api/v1/inbox', 'GET /api/v1/inbox', 'POST /api/v1/inbox/{id}/{action}', 'DELETE /api/v1/inbox/{id}') +
        features('inbox', 'inbox_kind', 'kickside.inbox:item_type.notice', 'kickside.inbox:item_type.system') +
        features('inbox', 'navigation', 'kickside.inbox:nav_item') + features('inbox', 'workspace_kind', 'kickside.inbox:inbox_binding'))),
    Scenario('automation_workflow_lifecycle', 'full', workflow_lifecycle, ('automation_evidence',), features=(
        features('workflows', 'http', 'POST /api/v1/workflows', 'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish',
            'GET /api/v1/workflows', 'GET /api/v1/workflows/published', 'GET /api/v1/workflows/{id}/state', 'GET /api/v1/workflows/{id}/events',
            'POST /api/v1/workflows/{id}/undo', 'POST /api/v1/workflows/{id}/redo',
            'GET /api/v1/workflows/{id}/versions', 'GET /api/v1/workflows/{id}/versions/{n}',
            'GET /api/v1/workflows/{id}/versions/diff', 'POST /api/v1/workflows/{id}/run',
            'GET /api/v1/workflows/{id}/runs', 'GET /api/v1/workflows/{id}/runs/{run_id}',
            'GET /api/v1/workflows/{id}/runs/{run_id}/events', 'GET /api/v1/workflows/{id}/runs/{run_id}/export',
            'GET /api/v1/workflows/{id}/runs/{run_id}/nodes/{def_node_id}/data', 'GET /api/v1/workflows/{id}/export',
            'POST /api/v1/workflows/import', 'POST /api/v1/workflows/{id}/versions/{n}/restore',
            'POST /api/v1/workflows/{id}/simulate', 'DELETE /api/v1/workflows/{id}') +
        features('workflows', 'navigation', 'kickside.workflows:nav_item') + features('workflows', 'workspace_kind', 'kickside.workflows:workflow_kind')), instance_setup=True),
    Scenario('automation_approvals_restart', 'full', approvals_restart, ('automation_evidence',), features=(
        features('workflows', 'http', 'POST /api/v1/workflows', 'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs', 'GET /api/v1/workflows/{id}/runs/{run_id}') +
        features('inbox', 'http', 'GET /api/v1/inbox', 'POST /api/v1/inbox/{id}/{action}') +
        features('inbox', 'workflow_block', 'kickside.inbox:block.review') + features('inbox', 'inbox_kind', 'kickside.inbox:item_type.flow_decision') +
        features('inbox', 'navigation', 'kickside.inbox:nav_item')), instance_setup=True),
    Scenario('automation_recurring_lifecycle', 'full', recurring_lifecycle, ('automation_evidence',), features=(
        features('automation', 'http', 'POST /api/v1/automations', 'GET /api/v1/automations', 'GET /api/v1/automations/{id}/config',
            'GET /api/v1/automations/{id}/state', 'GET /api/v1/automations/{id}/status', 'POST /api/v1/automations/{id}/control',
            'PATCH /api/v1/automations/{id}', 'PUT /api/v1/automations/{id}', 'POST /api/v1/automations/{id}/actions/{method}',
            'GET /api/v1/automations/{id}/export', 'POST /api/v1/automations/import', 'DELETE /api/v1/automations/{id}') +
        features('automation', 'automation', 'kickside.automation.recurring:task') + features('automation', 'workspace_kind', 'kickside.automation.recurring:task') +
        features('automation', 'navigation', 'kickside.automation:nav_item') + features('inbox', 'sink', 'kickside.inbox.sink:inbox_item'))),
]


def mint(inst, tools=(), traits=(), scope=(), active=(), trait_contexts=None, auth=None):
    inst.install('kickside/mcp')
    result = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Northwind warehouse client',
        'allowed_tool_ids': list(tools), 'allowed_trait_ids': list(traits),
        'default_active_trait_ids': list(active), 'whitelist_component_ids': list(scope),
        'agent_profile': {'preferred_trait_ids': list(traits), 'trait_contexts': trait_contexts or {}}}, label='credential-mint', auth=auth)['credential']
    inst.redactor.add(result['token'])
    return result


def rpc(inst, token, method, params, label, expect=(200,)):
    return inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': uuid.uuid4().hex, 'method': method, 'params': params},
        auth=token, headers={'Accept': 'application/json, text/event-stream'}, label=label, expect=expect, timeout=120)


def call(inst, token, name, args=None):
    return MCPClient(inst, token, '/api/public/mcp', stateful=False).call(name, args or {})


def mcp_traits(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    trait = 'kickside.inbox.traits:inbox_submit'
    credential = mint(inst, traits=(trait,))
    token, cid = credential['token'], credential['credential_id']
    require('result' in rpc(inst, token, 'initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
             'clientInfo': {'name': 'Northwind', 'version': '1'}}, 'initialize'), 'MCP handshake fails')
    info = call(inst, token, 'session_info')
    require(info['active_traits'] == [] and trait in info['allowed_traits'], 'MCP initial trait ceiling differs')
    require([row['id'] for row in call(inst, token, 'list_traits')['traits']] == [trait], 'MCP lists disallowed traits')
    require(trait in json.dumps(call(inst, token, 'find_traits', {'query': 'inbox'})), 'MCP trait search misses inbox')
    require(call(inst, token, 'describe_trait', {'id': trait})['id'] == trait, 'MCP trait descriptor differs')
    activated = call(inst, token, 'use_trait', {'id': trait})
    require(activated['active_traits'] == [trait], 'MCP activation does not persist')
    require(call(inst, token, 'session_info')['active_traits'] == [trait], 'MCP stateless request loses active trait')
    tools = call(inst, token, 'list_tools')
    require('inbox' in json.dumps(tools).lower(), 'Active inbox tool absent')
    require('inbox' in json.dumps(call(inst, token, 'find_tools', {'query': 'inbox'})).lower(), 'MCP tool search misses inbox')
    catalog = inst.request('GET', '/api/v1/mcp/tools')['tools']
    name = next(row['name'] for row in catalog if row['id'] == 'kickside.inbox.traits:inbox_submit_tool')
    args = {'title': 'Northwind MCP replenishment', 'content': 'Replenish 48 fictional Northwind tea crates.', 'item_type': 'notice'}
    submitted = call(inst, token, 'call_tool', {'id': name, 'arguments': args})
    require(submitted['success'] and submitted['id'], 'MCP inbox submission lacks durable identity')
    inst.wait(lambda: any(row['id'] == submitted['id'] and row['title'] == args['title'] and row['content'] == args['content'] for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='mcp-inbox-projection')['items']), 'MCP submitted inbox item appears with exact content', seconds=35)
    require(call(inst, token, 'drop_trait', {'id': trait})['active_traits'] == [], 'Drop leaves active trait')
    require(call(inst, token, 'set_traits', {'ids': [trait]})['active_traits'] == [trait], 'Set loses allowed trait')
    require(call(inst, token, 'reset_traits')['active_traits'] == [], 'Reset loses empty defaults')
    require(call(inst, token, 'use_profile')['active_traits'] == [trait], 'Profile does not activate preferred trait')
    inst.request('PATCH', '/api/v1/mcp/credentials/' + cid, {'label': 'Northwind fulfillment integration'}, label='credential-rename')
    listed = inst.request('GET', '/api/v1/mcp/credentials', label='credential-list')['credentials']
    row = next(row for row in listed if row['credential_id'] == cid)
    require(row['label'] == 'Northwind fulfillment integration' and 'token' not in row, 'Credential list exposes token or loses label')
    nav(ctx, 'MCP')
    screen(ctx, 'northwind-mcp-credentials')
    inst.request('POST', '/api/v1/mcp/credentials/' + cid + '/revoke', {}, label='credential-revoke')
    denied = rpc(inst, token, 'tools/list', {}, 'credential-revoked', expect=(401,403))
    require(denied.get('error'), 'Revoked MCP bearer has no rejection reason')
    inst.request('DELETE', '/api/v1/mcp/credentials/' + cid, label='credential-delete')
    require(cid not in json.dumps(inst.request('GET', '/api/v1/mcp/credentials')), 'Deleted credential remains listed')


def mcp_scope(ctx):
    inst = ctx.inst
    wid, version = dispatch_workflow(ctx)
    other, _ = dispatch_workflow(ctx)
    tool = 'kickside.workflows.agent:flows_read'
    credential = mint(inst, tools=(tool,), scope=(wid,))
    catalog = inst.request('GET', '/api/v1/mcp/tools')['tools']
    name = next(row['name'] for row in catalog if row['id'] == tool)
    visible = rpc(inst, credential['token'], 'tools/list', {}, 'scoped-tools')['result']['tools']
    require(name in {row['name'] for row in visible}, 'Allowed workflow reader absent')
    require(wid in json.dumps(call(inst, credential['token'], name, {'action': 'read', 'id': wid})), 'In-scope workflow state absent')
    payload = {'marker': 'NW-MCP-RUN', 'crates': 48}
    rid = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': payload}, label='scope-flow-run')['run_id']
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Scoped workflow completes', seconds=60)
    runs = call(inst, credential['token'], name, {'action': 'runs', 'id': wid})
    require(any(row['run_id'] == rid for row in runs['runs']), 'MCP run listing loses the scoped run')
    detail = call(inst, credential['token'], name, {'action': 'run_detail', 'id': wid, 'run_id': rid})
    require(detail['run']['output'] == done['run']['output'] == {'result': payload}, 'MCP run detail changes the declared output')
    timeline = call(inst, credential['token'], name, {'action': 'events', 'id': wid, 'run_id': rid})['timeline']
    types = [event['type'] for event in timeline['events']]
    require(timeline['count'] == len(types) and types[0] == 'flow.started' and types[-1] == 'flow.finished',
            'MCP run events lose the run lifecycle: ' + str(types))
    started = call(inst, credential['token'], name, {'action': 'event_detail', 'id': wid, 'run_id': rid, 'event_seq': 1})
    require(started['event']['type'] == 'flow.started' and started['event']['raw']['run_id'] == rid, 'MCP event detail loses its run identity')
    exported = call(inst, credential['token'], name, {'action': 'export_run', 'id': wid, 'run_id': rid})
    require(rid in json.dumps(exported), 'MCP run export loses its identity')
    data = call(inst, credential['token'], name, {'action': 'node_data', 'id': wid, 'run_id': rid, 'node_id': 'receipt'})
    require(payload['marker'] in json.dumps(data), 'MCP node inspection loses the dispatched payload')
    denied = rpc(inst, credential['token'], 'tools/call', {'name': name, 'arguments': {'action': 'read', 'id': other}}, 'outside-workflow')
    require(denied.get('error') or denied.get('result', {}).get('isError') or 'denied' in json.dumps(denied).lower(), 'MCP reads workflow outside scope')
    denied = rpc(inst, credential['token'], 'tools/call', {'name': 'RunCode', 'arguments': {'code': 'return 48'}}, 'outside-tool')
    require(denied.get('error') or denied.get('result', {}).get('isError'), 'MCP invokes ungranted code tool')
    inst.request('POST', '/api/v1/mcp/credentials/' + credential['credential_id'] + '/revoke', {}, label='scope-revoke')
    require(rpc(inst, credential['token'], 'tools/list', {}, 'scope-after-revoke', expect=(401,403)).get('error'), 'Scope revoke lacks denial')


def mcp_oauth(ctx):
    inst = ctx.inst
    inst.install('kickside/mcp')
    member = member_identity(ctx)
    for path in ('/.well-known/oauth-authorization-server/api/public/mcp/oauth', '/api/public/mcp/oauth/.well-known/oauth-authorization-server'):
        metadata = inst.request('GET', path, auth='', label='authorization-server')
        require(metadata['code_challenge_methods_supported'] == ['S256'] and metadata['token_endpoint'].endswith('/api/public/mcp/oauth/token'), 'OAuth server metadata differs')
    for path in ('/.well-known/oauth-protected-resource/api/public/mcp', '/api/public/mcp/.well-known/oauth-protected-resource'):
        metadata = inst.request('GET', path, auth='', label='protected-resource')
        require(metadata['resource'] == inst.base + '/api/public/mcp', 'OAuth protected resource differs')
    redirect = 'http://localhost/northwind/callback'
    client = inst.request('POST', '/api/public/mcp/oauth/register', {'client_name': 'Northwind Warehouse Planner',
        'redirect_uris': [redirect], 'token_endpoint_auth_method': 'none'}, auth='', expect=(201,), label='oauth-register')
    require(client['client_id'] and client['redirect_uris'] == [redirect], 'OAuth registration loses redirect')
    verifier = base64.urlsafe_b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes).decode().rstrip('=')
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    params = {'response_type': 'code', 'client_id': client['client_id'], 'redirect_uri': redirect,
        'code_challenge': challenge, 'code_challenge_method': 'S256', 'state': 'northwind-fulfillment', 'resource': inst.base + '/api/public/mcp'}
    context = inst.request('GET', '/api/v1/mcp/oauth/context?' + urlencode(params), label='oauth-context', auth=member['token'])
    require(context['client_name'] == 'Northwind Warehouse Planner', 'Consent names different client')
    ctx.browser.page.goto(inst.base + '/api/public/mcp/oauth/authorize?' + urlencode(params), wait_until='domcontentloaded')
    ctx.browser.page.get_by_text('Northwind Warehouse Planner wants to use your KickSide tools over MCP.', exact=True).wait_for(timeout=30000)
    screen(ctx, 'northwind-mcp-consent')
    grant = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params, 'mint': {'label': 'Northwind OAuth Warehouse'}}, label='oauth-consent', auth=member['token'])
    denied = inst.request('GET', '/api/v1/mcp/oauth/context?' + urlencode({**params, 'redirect_uri': 'http://localhost/foreign/callback'}), auth=member['token'], expect=(400,), label='oauth-foreign-redirect')
    require(denied.get('error'), 'OAuth accepts an unregistered redirect')
    query = parse_qs(urlsplit(grant['redirect_to']).query)
    require(query['state'] == ['northwind-fulfillment'] and query.get('code'), 'Consent loses state/code')
    payload = {'grant_type': 'authorization_code', 'client_id': client['client_id'], 'redirect_uri': redirect,
               'code': query['code'][0], 'code_verifier': verifier}
    invalid_grant = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params, 'mint': {'label': 'Northwind rejected PKCE'}}, label='oauth-pkce-consent', auth=member['token'])
    invalid_code = parse_qs(urlsplit(invalid_grant['redirect_to']).query)['code'][0]
    inst.redactor.add(invalid_code)
    rejected = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode({**payload, 'code': invalid_code, 'code_verifier': 'wrong-verifier'}).encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'}, auth='', expect=(400,), label='oauth-invalid-pkce')
    require(rejected['error'] == 'invalid_grant', 'OAuth accepts invalid PKCE')
    issued = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode(payload).encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'}, auth='', label='oauth-token')
    inst.redactor.add(issued['access_token'])
    require(issued['token_type'].lower() == 'bearer', 'OAuth token type differs')
    identity = call(inst, issued['access_token'], 'session_info')['actor']
    require(identity == member['id'], 'OAuth credential loses the consenting member actor')
    from mcp_sdk import run_sdk_protocol
    bearer = mint(inst, auth=member['token'])
    try:
        run_sdk_protocol(inst, bearer['token'], issued['access_token'], member['token'])
    finally:
        inst.request('POST', '/api/v1/mcp/credentials/' + str(bearer['credential_id']) + '/revoke', {},
                     label='sdk-bearer-revoke', auth=member['token'])
    repeated = inst.request('POST', '/api/public/mcp/oauth/token', raw=urlencode(payload).encode(),
        headers={'Content-Type': 'application/x-www-form-urlencoded'}, auth='', expect=(400,), label='oauth-code-repeat')
    require(repeated['error'] == 'invalid_grant', 'OAuth authorization code reuses successfully')
    ctx.browser.page.goto(inst.base + '/', wait_until='domcontentloaded')
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)


def transform_case(ctx, kind):
    inst = ctx.inst
    source = {'type': 'object', 'required': ['product', 'crates'], 'properties': {'product': {'type': 'string'}, 'crates': {'type': 'integer'}}}
    sample = {'product': 'Northwind Tea', 'crates': 48}
    configs = {'none': {'kind': 'none'}, 'expr': {'kind': 'expr', 'expr': '{"product": input.product, "crates": input.crates * 2}'},
        'code': {'kind': 'code', 'code': 'return {product = __cx_args.input.product, crates = __cx_args.input.crates * 2}', 'tool_ids': []},
        'llm': {'kind': 'llm', 'model': ctx.state['model'], 'prompt': 'Return only NORTHWIND-TEA-48. No punctuation, explanation, or formatting.'}}
    schema = {'type': 'object', 'required': ['content'], 'properties': {'content': {'type': 'string'}}} if kind == 'llm' else source
    expected = {'content': 'NORTHWIND-TEA-48'} if kind == 'llm' else {'product': 'Northwind Tea', 'crates': 48 if kind == 'none' else 96}
    out = inst.request('POST', '/api/v1/transform/validate', {'transform': configs[kind], 'sink_schema': schema,
        'input_shape': 'content' if kind == 'llm' else 'record', 'samples': [{'payload': sample}]}, label='transform-' + kind, timeout=120)
    require(out['valid'] is True and out['outputs'] == [expected], 'Transform output differs: ' + str(out))
    if kind == 'expr':
        bad = inst.request('POST', '/api/v1/transform/validate', {'transform': {'kind': 'expr', 'expr': 'input.crates'},
            'sink_schema': source, 'input_shape': 'content' if kind == 'llm' else 'record', 'samples': [{'payload': sample}]}, label='transform-schema-denial')
        require(bad['valid'] is False and bad['errors'], 'Transform accepts output outside sink schema')
        snippet = inst.request('POST', '/api/v1/transform/snippet', {'artifact': configs[kind], 'source_schema': source,
            'sink_schema': source, 'strategy': 'expr', 'rationale': 'Double fictional Northwind tea reserves.'}, label='transform-snippet')
        require(snippet['snippet'], 'Transform snippet has no reusable artifact')


def transform_assist(ctx):
    inst = ctx.inst
    source = {'type': 'object', 'properties': {'crates': {'type': 'integer'}}, 'required': ['crates']}
    target = {'type': 'object', 'properties': {'reserved': {'type': 'integer'}}, 'required': ['reserved']}
    out = inst.request('POST', '/api/v1/transform/assist', {'source_schema': source, 'sink_schema': target,
        'input_shape': 'record', 'samples': [{'payload': {'crates': 48}}], 'strategy': 'expr',
        'hint': 'Map reserved to crates multiplied by 2. Fictional Northwind warehouse reserves.'}, label='transform-assist', timeout=120)
    require(out['validated'] and out['transform']['kind'] == 'expr', 'Gemma transform proposal fails validation: ' + str(out))
    verified = inst.request('POST', '/api/v1/transform/validate', {'transform': out['transform'], 'sink_schema': target,
        'input_shape': 'record', 'samples': [{'payload': {'crates': 48}}]}, label='generated-transform-output')
    require(verified['valid'] and verified['outputs'] == [{'reserved': 96}], 'Generated transform does not double crates')


def webhook_delivery(ctx, duplicate=False):
    inst = ctx.inst
    inst.install('kickside/webhooks')
    schema = {'type': 'object', 'required': ['product'], 'properties': {'product': {'type': 'string'}}}
    hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Northwind warehouse receiving', 'schema': schema}, label='hook-create')['webhook']
    token, wid = hook['secret'], hook['webhook_id']
    inst.redactor.add(token)
    thread_id = hook['thread_id']
    title = 'Northwind tea receiving receipt ' + uuid.uuid4().hex[:6]
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': {'title': title, 'enabled': True,
        'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received', 'config': {'thread_id': thread_id}, 'backfill': 'none'},
        'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
        'transform': {'kind': 'expr', 'expr': json.dumps({'title': title, 'content': 'Northwind Tea: 48 fictional crates received at Warehouse A.'})}}}, label='webhook-sync')['id']
    path = '/api/public/hooks/' + wid
    denied = inst.request('POST', path, {'product': 'Northwind Tea'}, auth='', expect=(401,), label='hook-unauthorized')
    require('secret' in str(denied).lower(), 'Webhook missing bearer denial lacks reason')
    invalid = inst.request('POST', path, {'product': 48}, auth=token, expect=(400,), label='hook-invalid')
    require('product' in str(invalid), 'Webhook schema denial does not identify product')
    payload = {'product': 'Northwind Tea'}
    headers = {'Idempotency-Key': 'northwind-receiving-NW-2048'}
    accepted = inst.request('POST', path, payload, auth=token, expect=(202,), headers=headers, label='hook-accepted')
    require(accepted['accepted'] is True, 'Webhook does not acknowledge accepted payload')
    def receipts():
        return [row for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='hook-receipts')['items'] if row['title'] == title]
    rows = inst.wait(receipts, 'Webhook through Data Sync into inbox', seconds=60)
    require(len(rows) == 1 and '48 fictional crates' in rows[0]['content'], 'Webhook sync receipt differs')
    if duplicate:
        inst.request('POST', path, payload, auth=token, expect=(202,), headers=headers, label='hook-repeat')
        inst.wait(lambda: inst.request('GET', '/api/v1/automations/' + aid + '/status', label='repeat-delivery-status').get('id') == aid,
                  'Repeat delivery status', seconds=35)
        ctx.browser.page.wait_for_timeout(3000)
        require(len(receipts()) == 1, 'Same webhook Idempotency-Key delivers more than one Northwind receipt')
    else:
        patched = inst.request('PATCH', '/api/v1/webhooks/' + wid, {'label': 'Northwind replenishment gateway'}, label='hook-rename')['webhook']
        require(patched['label'] == 'Northwind replenishment gateway', 'Webhook rename does not persist')
        listed = inst.request('GET', '/api/v1/webhooks', label='hooks-list')['webhooks']
        require(any(row['webhook_id'] == wid and row['label'] == patched['label'] and 'secret' not in row for row in listed), 'Webhook list loses label or exposes secret')
        nav(ctx, 'System')
        ctx.browser.frame.get_by_role('tab', name='Webhooks', exact=True).click()
        ctx.browser.frame.get_by_text('Northwind replenishment gateway', exact=True).wait_for(timeout=30000)
        screen(ctx, 'northwind-webhook-gateway')
        inst.request('POST', '/api/v1/webhooks/' + wid + '/revoke', {}, label='hook-revoke')
        revoked = inst.request('POST', path, payload, auth=token, expect=(404,), label='hook-revoked')
        require(revoked.get('error') == 'webhook not found', 'Revoked webhook denial differs')
    inst.request('DELETE', '/api/v1/automations/' + aid, label='sync-delete')
    inst.request('DELETE', '/api/v1/webhooks/' + wid, label='hook-delete')
    require(wid not in json.dumps(inst.request('GET', '/api/v1/webhooks')), 'Deleted webhook remains listed')


REGISTRY += [
    Scenario('automation_mcp_traits', 'full', mcp_traits, ('automation_evidence',), features=(
        features('mcp', 'http', 'POST /api/public/mcp', 'POST /api/v1/mcp/credentials', 'GET /api/v1/mcp/credentials',
            'PATCH /api/v1/mcp/credentials/{id}', 'POST /api/v1/mcp/credentials/{id}/revoke', 'DELETE /api/v1/mcp/credentials/{id}') +
        features('mcp', 'mcp_tool', *('kickside.mcp:consts#META_TOOLS/' + key for key in ('session_info', 'list_traits', 'find_traits',
            'describe_trait', 'use_trait', 'drop_trait', 'set_traits', 'reset_traits', 'use_profile', 'list_tools', 'find_tools', 'call_tool'))) +
        features('mcp', 'navigation', 'kickside.mcp:nav_item') + features('inbox', 'capability', 'kickside.inbox.traits:inbox_submit') +
        features('inbox', 'mcp_tool', 'kickside.inbox.traits:inbox_submit_tool')), instance_setup=True),
    Scenario('automation_mcp_scope', 'full', mcp_scope, ('automation_evidence',),
        issues=('WORKFLOWS-PUBLISHED-OUTPUT-SHAPE',), features=(features('mcp', 'http',
        'POST /api/public/mcp', 'POST /api/v1/mcp/credentials', 'POST /api/v1/mcp/credentials/{id}/revoke') +
        features('workflows', 'mcp_tool', 'kickside.workflows.agent:flows_read')), instance_setup=True),
    Scenario('automation_mcp_oauth', 'full', mcp_oauth, ('automation_evidence',), issues=('MCP-SDK-PROTOCOL',), features=features('mcp', 'http',
        'GET /.well-known/oauth-authorization-server/api/public/mcp/oauth', 'GET /api/public/mcp/oauth/.well-known/oauth-authorization-server',
        'GET /.well-known/oauth-protected-resource/api/public/mcp', 'GET /api/public/mcp/.well-known/oauth-protected-resource',
        'POST /api/public/mcp/oauth/register', 'GET /api/v1/mcp/oauth/context', 'GET /api/public/mcp/oauth/authorize',
        'POST /api/v1/mcp/oauth/consent', 'POST /api/public/mcp/oauth/token')),
    *[Scenario('automation_transform_' + kind, 'full', lambda ctx, kind=kind: transform_case(ctx, kind), ('automation_evidence',),
        model=kind == 'llm', features=features('transform', 'http', 'POST /api/v1/transform/validate',
            *(['POST /api/v1/transform/snippet'] if kind == 'expr' else [])) +
        features('transform', 'transform', 'kickside.transform:strategy_' + kind + '_binding')) for kind in ('none', 'expr', 'code', 'llm')],
    Scenario('automation_transform_assist', 'full', transform_assist, ('automation_evidence',), model=True,
        features=features('transform', 'http', 'POST /api/v1/transform/assist', 'POST /api/v1/transform/validate')),
    Scenario('automation_webhook_sync', 'full', webhook_delivery, ('automation_evidence',), features=(
        features('webhooks', 'http', 'POST /api/v1/webhooks', 'GET /api/v1/webhooks', 'PATCH /api/v1/webhooks/{id}',
            'POST /api/public/hooks/{id}', 'POST /api/v1/webhooks/{id}/revoke', 'DELETE /api/v1/webhooks/{id}') +
        features('webhooks', 'workspace_kind', 'kickside.webhooks:webhook_kind') + features('webhooks', 'trigger', 'kickside.webhooks:webhook_received') +
        features('webhooks', 'navigation', 'kickside.webhooks:tab.webhooks') + features('sync', 'automation', 'kickside.sync:sync') +
        features('sync', 'workspace_kind', 'kickside.sync:sync') + features('inbox', 'sink', 'kickside.inbox.sink:inbox_item') +
        features('transform', 'transform', 'kickside.transform:strategy_expr_binding')), instance_setup=True),
    Scenario('automation_webhook_idempotency', 'full', lambda ctx: webhook_delivery(ctx, duplicate=True), ('automation_evidence',),
        features=features('webhooks', 'http', 'POST /api/public/hooks/{id}'), instance_setup=True),
]

REGISTRY.insert(2, Scenario('automation_inbox_api', 'full', lambda ctx: inbox_notices(ctx, ui=False), ('automation_catalogs',), features=(
    features('inbox', 'http', 'POST /api/v1/inbox', 'GET /api/v1/inbox', 'POST /api/v1/inbox/{id}/{action}', 'DELETE /api/v1/inbox/{id}') +
    features('inbox', 'inbox_kind', 'kickside.inbox:item_type.notice', 'kickside.inbox:item_type.system') + features('inbox', 'workspace_kind', 'kickside.inbox:inbox_binding'))))
REGISTRY.insert(4, Scenario('automation_approvals_api_restart', 'full', approvals_api_restart, ('automation_evidence',), features=(
    features('inbox', 'http', 'GET /api/v1/inbox', 'POST /api/v1/inbox/{id}/{action}') +
    features('inbox', 'workflow_block', 'kickside.inbox:block.review') + features('inbox', 'inbox_kind', 'kickside.inbox:item_type.flow_decision') +
    features('workflows', 'http', 'POST /api/v1/workflows', 'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs/{run_id}')), instance_setup=True,
    issues=('DATAFLOW-EXECUTION-FRAME-POLICY-CAP',)))


def connections(ctx):
    from mocks.services import GITLAB_TOKEN
    inst = ctx.inst
    inst.install('kickside/gitlab')
    url = ctx.fixtures.start('gitlab')
    inst.cleanup.add('Northwind GitLab fixture', lambda: ctx.fixtures.stop('gitlab'))
    inst.redactor.add(url)
    inst.redactor.add(GITLAB_TOKEN)
    ids = []
    for name in ('Northwind fulfillment projects', 'Northwind warehouse planning', 'Northwind supplier coordination'):
        cid = inst.request('POST', '/api/v1/connections', {'impl_id': 'kickside.gitlab.connection:gitlab_connection',
            'name': name, 'description': 'Fictional Northwind operations projects.',
            'private_context': {'base_url': url, 'token': GITLAB_TOKEN}}, label='connection-create')['component_id']
        ids.append(cid)
    listed = inst.request('GET', '/api/v1/connections?provider=gitlab', label='connections-list')['connections']
    require(set(ids) <= {row['component_id'] for row in listed} and all(row['connection_state'] == 'connected' for row in listed if row['component_id'] in ids), 'Saved connections have no connected projection')
    discovered = inst.request('POST', '/api/v1/connections/' + ids[0] + '/discover_resources', {}, label='connection-projects')
    require({row['key'] for row in discovered['resources']} == {'northwind/catalog', 'northwind/orders'}, 'GitLab discovery loses Northwind projects')
    records = ctx.fixtures.requests('gitlab')
    require(any(row['path'].endswith('/user') and row['auth_ok'] for row in records) and any(row['path'].endswith('/projects') and row['auth_ok'] for row in records), 'Connection never validates or discovers through fixture')
    inst.evidence.save('fixture-requests', records)
    renamed = 'Northwind dispatch projects'
    inst.request('PUT', '/api/v1/connections/' + ids[0], {'name': renamed}, label='connection-rename')
    require(any(row['component_id'] == ids[0] and row['name'] == renamed for row in inst.request('GET', '/api/v1/connections')['connections']), 'Connection rename does not persist')
    nav(ctx, 'Connections')
    ctx.browser.frame.get_by_text(renamed, exact=True).wait_for(timeout=30000)
    screen(ctx, 'northwind-connections-light')
    for cid in ids:
        inst.request('DELETE', '/api/v1/connections/' + cid, label='connection-delete')
    require(not set(ids) & {row['component_id'] for row in inst.request('GET', '/api/v1/connections')['connections']}, 'Deleted connections remain listed')
    ctx.fixtures.stop('gitlab')


def oauth_boundaries(ctx):
    inst = ctx.inst
    inst.install('kickside/google')
    catalog = inst.request('GET', '/api/v1/oauth/providers/discover', label='oauth-providers')['providers']
    require(catalog, 'OAuth provider catalog empty')
    provider = catalog[0]['oauth_provider']
    descriptor = inst.request('GET', '/api/v1/oauth/providers/' + quote(provider, safe=''), label='oauth-provider')
    require(descriptor['oauth_provider'] == provider and isinstance(descriptor['available_scopes'], list), 'OAuth descriptor loses provider/scopes')
    invalid = inst.request('POST', '/api/v1/oauth/providers/' + quote(provider, safe='') + '/init', {}, expect=(400,), label='oauth-invalid-init')
    require('name' in str(invalid).lower(), 'OAuth init accepts unnamed connection')
    nonexistent = uuid.uuid4().hex
    denied = inst.request('GET', '/api/v1/oauth/connections/' + nonexistent, expect=(403,), label='oauth-missing-connection')
    require(denied.get('error'), 'OAuth missing connection lacks error')
    denied = inst.request('PUT', '/api/v1/oauth/connections/' + nonexistent, {'connection_name': 'Northwind Warehouse OAuth'}, expect=(403,), label='oauth-missing-update')
    require(denied.get('error'), 'OAuth missing update lacks error')
    missing = inst.request('POST', '/api/public/oauth/callback', {}, auth='', expect=(400,), label='oauth-empty-callback')
    require('state' in str(missing).lower(), 'OAuth callback does not require state')
    stale = inst.request('POST', '/api/public/oauth/callback', {'state': 'northwind-stale-state', 'code': 'northwind-fictional-code'}, auth='', expect=(404,), label='oauth-stale-callback')
    require('session' in str(stale).lower(), 'OAuth stale state does not reject missing session')
    ctx.browser.page.goto(inst.base + '/api/public/oauth/callback?error=access_denied&error_description=Northwind+operator+declines+access', wait_until='domcontentloaded')
    ctx.browser.page.get_by_text('Authorization was denied', exact=True).wait_for(timeout=30000)
    screen(ctx, 'northwind-oauth-declined')
    ctx.browser.page.goto(inst.base + '/', wait_until='domcontentloaded')
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)


def code_execution(ctx):
    inst = ctx.inst
    inst.install('kickside/code-execution')
    member = member_identity(ctx)
    credential = mint(inst, traits=('kickside.code_execution.traits:code_execution',), active=('kickside.code_execution.traits:code_execution',), auth=member['token'])
    token = credential['token']
    reference = inst.request('GET', '/api/v1/code-execution/sdk-reference?ids=kickside.blocks:list', label='sdk-reference', auth=member['token'])
    require(reference['count'] == 1 and reference['tools'][0]['id'] == 'kickside.blocks:list', 'SDK reference does not scope requested block tool')
    code = 'local total = 0; for _, order in ipairs(__cx_args.orders) do total = total + order.crates end; return {product = "Northwind Tea", crates = total}'
    result = call(inst, token, 'RunCode', {'code': code, 'args': {'orders': [{'crates': 36}, {'crates': 12}]}})
    require(result['success'] is True and result['result'] == {'product': 'Northwind Tea', 'crates': 48}, 'Code execution output differs: ' + str(result))
    failure = rpc(inst, token, 'tools/call', {'name': 'RunCode', 'arguments': {'code': 'error("Northwind missing warehouse")'}}, 'sandbox-error')
    require(failure['result']['isError'] is True, 'MCP does not surface sandbox failure')
    failed = json.loads(failure['result']['content'][0]['text'])
    require(failed['success'] is False and 'Northwind missing warehouse' in failed['error'], 'Sandbox swallows code error')


def code_assist(ctx):
    inst = ctx.inst
    inst.install('kickside/code-execution')
    member = member_identity(ctx)
    credential = mint(inst, traits=('kickside.code_execution.traits:code_execution',), active=('kickside.code_execution.traits:code_execution',), auth=member['token'])
    token = credential['token']
    proposed = inst.request('POST', '/api/v1/code-execution/assist', {'intent': 'Sum __cx_args.orders crates and return {crates=total}. Fictional Northwind orders. Do not call tools.',
        # [] means ambient-all for the Code Execution contract, rather than no tools.
        # This pure-Lua case needs one stable bounded catalog entry, not every tool in
        # the installed application.
        'tool_ids': ['kickside.blocks:list'], 'sample': {'orders': [{'crates': 36}, {'crates': 12}]}}, label='code-assist', auth=member['token'], timeout=120)
    require(proposed['validated'] and proposed['code'], 'Gemma code proposal fails validation: ' + str(proposed))
    require('sdk.tools' not in proposed['code'], 'Pure-Lua assist unexpectedly calls the SDK: ' + str(proposed))
    verified = call(inst, token, 'RunCode', {'code': proposed['code'], 'args': {'orders': [{'crates': 36}, {'crates': 12}]}})
    require(verified['success'] and verified['result']['crates'] == 48, 'Generated code changes Northwind total')


def code_recommend(ctx):
    inst = ctx.inst
    inst.install('kickside/code-execution')
    member = member_identity(ctx)
    credential = mint(inst, traits=('kickside.code_execution.traits:code_execution',), active=('kickside.code_execution.traits:code_execution',), auth=member['token'])
    token = credential['token']
    catalog_ids = {'kickside.blocks:list', 'kickside.workflows.agent:flows_read'}
    def assert_catalog(result):
        tools = result['tools']
        require(any(tool['id'] in catalog_ids for tool in tools), 'Tool recommender misses a declared block catalog')
        require(all(tool.get('input_schema') and tool.get('output_schema') for tool in tools),
                'Tool recommendation omits its declared input or output schema')
    request = {'need': 'List available executable workflow blocks.', 'fields': ['input_schema', 'output_schema']}
    recommended = inst.request('POST', '/api/v1/code-execution/recommend-tools', request, label='recommend-tools', auth=member['token'], timeout=120)
    assert_catalog(recommended)
    recommended = call(inst, token, 'RecommendTools', request)
    assert_catalog(recommended)
    compact = call(inst, token, 'RecommendTools', {'need': request['need']})
    require(compact['tools'] and all(tool['id'] and set(tool) <= {'id', 'label'} for tool in compact['tools']),
            'Default tool recommendation is not compact id/label rows: ' + str(compact['tools']))


def code_recommend_scoped(ctx):
    inst = ctx.inst
    inst.install('kickside/code-execution')
    request = {'need': 'List available executable workflow blocks.', 'fields': ['input_schema', 'output_schema'],
        'tool_ids': ['kickside.blocks:list', 'kickside.code_execution.traits:run_code_tool']}
    credential = mint(inst, traits=('kickside.code_execution.traits:code_execution',), active=('kickside.code_execution.traits:code_execution',),
        trait_contexts={'kickside.code_execution.traits:code_execution': {'tool_ids': request['tool_ids']}})
    api = inst.request('POST', '/api/v1/code-execution/recommend-tools', request, label='scoped-recommend-tools', timeout=120)
    mcp_request = {'need': request['need'], 'fields': request['fields']}
    token = credential['token']
    assert_mcp_tool_arguments(inst, token, 'RecommendTools', mcp_request)
    mcp = call(inst, token, 'RecommendTools', mcp_request)
    for result in (api, mcp):
        tools = result['tools']
        require(any(tool['id'] == 'kickside.blocks:list' and tool['input_schema']['type'] == 'object' and tool['output_schema']['type'] == 'object' for tool in tools), 'Scoped recommender loses typed block catalog')
        require({tool['id'] for tool in tools} <= set(request['tool_ids']), 'Scoped recommender widens candidate tool access')


def sdk_blocks(ctx):
    ctx.inst.install('kickside/code-execution')
    credential = mint(ctx.inst, traits=('kickside.code_execution.traits:code_execution',), active=('kickside.code_execution.traits:code_execution',))
    code = 'local r, e = sdk.tools["kickside.blocks:list"](__cx_args); if e then error(e) end; return r'
    blocks, cursor = [], None
    while True:
        args = {'limit': 25}
        if cursor is not None:
            args['cursor'] = cursor
        result = call(ctx.inst, credential['token'], 'RunCode', {'code': code, 'args': args})
        require(result.get('success') is True, 'Sandbox block catalog call fails: ' + str(result))
        page = result['result']
        require(isinstance(page, dict) and isinstance(page.get('blocks'), list) and page['blocks'],
                'Sandbox block catalog returns no page: ' + str(page)[:500])
        incomplete = [block.get('id') if isinstance(block, dict) else block for block in page['blocks']
                      if not (isinstance(block, dict) and block.get('id') and block.get('title')
                              and block.get('source_kind') in ('block', 'tool') and isinstance(block.get('tool'), bool))]
        require(not incomplete, 'Sandbox block catalog returns incomplete summaries: ' + str(incomplete))
        require(all(not any(field in row for field in ('description', 'input', 'config', 'output', 'ports', 'execution'))
                    for row in page['blocks']), 'Sandbox block list includes full descriptors')
        blocks.extend(page['blocks'])
        following = page.get('next_cursor')
        if following is None:
            break
        require(isinstance(following, str) and following != cursor, 'Sandbox block catalog continuation does not advance: ' + str(page))
        cursor = following
    identifiers = [block['id'] for block in blocks]
    require(len(identifiers) == len(set(identifiers)), 'Sandbox block catalog repeats a block across pages')
    require('kickside.code_execution:block.run_code' in identifiers, 'Sandbox block catalog lacks executable code block')


def bounded_results(ctx):
    ctx.inst.install('kickside/code-execution')
    credential = mint(ctx.inst,
        traits=('kickside.code_execution.traits:code_execution',),
        active=('kickside.code_execution.traits:code_execution',))
    client = MCPClient(ctx.inst, credential['token'], '/api/public/mcp', stateful=False)
    payload = 'Northwind 😀\n' * 12000
    response = client.tool_result('RunCode', {
        'code': 'return __cx_args.payload', 'args': {'payload': payload}})
    require(response.get('isError') is not True, 'Large RunCode result returns a tool error')
    result = client.decode_text(client.text(response))
    require(result.get('success') is True and result.get('result') == payload,
            'RunCode does not return its complete result')


def block_catalog_tool(ctx):
    ctx.inst.install('kickside/code-execution')
    credential = mint(ctx.inst, tools=('kickside.blocks:list', 'kickside.blocks:get'))
    result = call(ctx.inst, credential['token'], 'list_blocks', {})
    require('kickside.code_execution:block.run_code' in json.dumps(result), 'MCP block catalog lacks Run Code')
    require(all(not any(field in row for field in ('description', 'input', 'config', 'output', 'ports', 'execution'))
                for row in result['blocks']), 'MCP block list includes full descriptors')
    detail = call(ctx.inst, credential['token'], 'get_block', {'block_id': 'kickside.code_execution:block.run_code'})
    require(detail.get('input') and detail.get('config') and detail.get('output') and detail.get('execution'),
            'MCP block detail omits the complete descriptor')


def fit_canvas(ctx):
    frame = ctx.browser.frame
    frame.get_by_role('button', name='View controls', exact=True).click()
    frame.get_by_role('menuitem', name='Auto layout', exact=True).click()
    frame.get_by_role('button', name='View controls', exact=True).click()
    frame.get_by_role('menuitem', name='Fit view', exact=True).click()


def run_trace(ctx, label, node_title, output_marker):
    frame = ctx.browser.frame
    frame.get_by_role('button', name='Past runs', exact=True).click()
    dialog = frame.get_by_role('dialog', name='Runs', exact=True)
    dialog.get_by_text('Completed', exact=True).first.wait_for(timeout=30000)
    dialog.locator('.wf-runs-row').first.click()
    frame.locator('.wf-banner--run').get_by_role('button', name='Back to editing', exact=True).wait_for(timeout=30000)
    frame.locator('.vue-flow__node').filter(has_text=node_title).first.click()
    try:
        screen(ctx, label + '-inspection')
        frame.get_by_text(output_marker, exact=False).first.wait_for(timeout=30000)
        screen(ctx, label)
    finally:
        frame.locator('.wf-banner--run').get_by_role('button', name='Back to editing', exact=True).click()


def canvas(ctx):
    inst, browser = ctx.inst, ctx.browser
    inst.install('kickside/workflows')
    inst.install('kickside/code-execution')
    nav(ctx, 'Workflows')
    browser.frame.get_by_test_id('create-workflow').click()
    dialog = browser.frame.get_by_role('dialog', name='New Workflow', exact=True)
    dialog.get_by_role('textbox', name='Workflow name', exact=True).fill('Northwind fulfillment canvas')
    with browser.page.expect_response(lambda r: '/api/v1/workflows' in r.url and r.request.method == 'POST' and r.url.endswith('/workflows')) as response:
        dialog.get_by_role('button', name='Create', exact=True).click()
    wid = response.value.json()['flow_id']
    browser.frame.get_by_role('textbox', name='Search steps', exact=True).wait_for(timeout=30000)
    browser.frame.get_by_role('textbox', name='Search steps', exact=True).fill('Run Code')
    browser.frame.locator('.wf-palette-item').filter(has_text='Run Code').click()
    browser.frame.get_by_role('textbox', name='Lua code to run', exact=True).fill('return {product="Northwind Tea", crates=48, warehouse="Warehouse A"}')
    browser.frame.get_by_role('textbox', name='Lua code to run', exact=True).press('Tab')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).fill('Reconcile Northwind stock')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).press('Enter')
    browser.frame.get_by_role('button', name='Close inspector', exact=True).click()
    def edge(source, target):
        browser.frame.get_by_role('button', name='Edit connections', exact=True).click()
        dialog = browser.frame.get_by_role('dialog', name='Edit connections', exact=True)
        dialog.get_by_role('combobox').nth(0).click()
        browser.frame.get_by_role('option', name=re.compile(source)).click()
        dialog.get_by_role('combobox').nth(1).click()
        browser.frame.get_by_role('option', name=target, exact=True).click()
        dialog.get_by_role('button', name='Create connection', exact=True).click()
    edge('^Start', 'Reconcile Northwind stock')
    edge('^Reconcile Northwind stock.*Result', 'Finish')
    saved = inst.wait(lambda: (lambda s: s if len(s['edges']) == 2 and any(n.get('config', {}).get('code') for n in s['nodes']) else None)(
        inst.request('GET', '/api/v1/workflows/' + wid + '/state')['state']), 'Canvas definition persists', seconds=35, pump=browser.page.wait_for_timeout)
    require(len(saved['nodes']) == 3, 'Canvas node count differs')
    browser.frame.get_by_role('button', name='Close inspector', exact=True).click()
    fit_canvas(ctx)
    screen(ctx, 'northwind-canvas-light')
    screen(ctx, 'northwind-canvas-hero-dark', dark=True)
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {}, label='canvas-publish')['version']
    rid = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': {}}, label='canvas-run')['run_id']
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Canvas workflow completion', seconds=60)
    require('Northwind Tea' in json.dumps(done['run']['output']) and '48' in json.dumps(done['run']['output']), 'Canvas execution loses stock result')


def canvas_trace(ctx):
    open_workflow(ctx, 'Northwind fulfillment canvas')
    run_trace(ctx, 'northwind-canvas-run-trace', 'Reconcile Northwind stock', 'Northwind Tea')


REGISTRY += [
    Scenario('automation_connections', 'full', connections, ('automation_evidence',), features=(
        features('connection', 'http', 'POST /api/v1/connections', 'GET /api/v1/connections', 'PUT /api/v1/connections/{id}',
            'POST /api/v1/connections/{id}/discover_resources', 'DELETE /api/v1/connections/{id}') + features('connection', 'navigation', 'kickside.connection:nav_item')), instance_setup=True),
    Scenario('automation_oauth_boundaries', 'full', oauth_boundaries, ('automation_evidence',), features=(
        features('oauth', 'http', 'GET /api/v1/oauth/providers/discover', 'GET /api/v1/oauth/providers/{provider_name}',
            'POST /api/v1/oauth/providers/{provider_name}/init', 'GET /api/v1/oauth/connections/{component_id}',
            'PUT /api/v1/oauth/connections/{component_id}', 'POST /api/public/oauth/callback', 'GET /api/public/oauth/callback') +
        features('oauth', 'navigation', 'kickside.oauth.views:oauth_callback')), instance_setup=True),
    Scenario('automation_code_execution', 'full', code_execution, ('automation_evidence',), features=(
        features('code-execution', 'http', 'GET /api/v1/code-execution/sdk-reference') +
        features('code-execution', 'mcp_tool', 'kickside.code_execution.traits:run_code_tool') +
        features('code-execution', 'capability', 'kickside.code_execution.traits:code_execution')), instance_setup=True),
    Scenario('automation_code_assist', 'full', code_assist, ('automation_evidence',), model=True, features=(
        features('code-execution', 'http', 'POST /api/v1/code-execution/assist') + features('code-execution', 'mcp_tool', 'kickside.code_execution.traits:run_code_tool')), instance_setup=True),
    Scenario('automation_code_recommend', 'full', code_recommend, ('automation_evidence',), model=True, features=(
        features('code-execution', 'http', 'POST /api/v1/code-execution/recommend-tools') + features('code-execution', 'mcp_tool', 'kickside.code_execution.traits:recommend_tools_tool')), instance_setup=True),
    Scenario('automation_code_recommend_scoped', 'full', code_recommend_scoped, ('automation_evidence',), model=True, issues=('SMOKE-TOOL-ARGUMENT-FIXTURE',), features=(
        features('code-execution', 'http', 'POST /api/v1/code-execution/recommend-tools') + features('code-execution', 'mcp_tool', 'kickside.code_execution.traits:recommend_tools_tool')), instance_setup=True),
    Scenario('regression_bounded_tool_consumers', 'regression', bounded_results, ('boot',),
        issues=('R5-T07',), instance_setup=True),
    Scenario('automation_sdk_blocks', 'full', sdk_blocks, ('automation_evidence',), issues=('R5-T07',), features=(
        features('code-execution', 'mcp_tool', 'kickside.code_execution.traits:run_code_tool') + features('blocks', 'mcp_tool', 'kickside.blocks:list')), instance_setup=True),
    Scenario('automation_blocks_tool', 'full', block_catalog_tool, ('automation_evidence',), features=features('blocks', 'mcp_tool', 'kickside.blocks:list'), instance_setup=True),
    Scenario('automation_canvas', 'full', canvas, ('automation_evidence',), issues=('SMOKE-WORKFLOW-CODE-EDITOR-LOCATOR',), features=(
        features('workflows', 'http', 'POST /api/v1/workflows', 'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish',
            'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs', 'GET /api/v1/workflows/{id}/runs/{run_id}', 'GET /api/v1/workflows/{id}/state') +
        features('workflows', 'navigation', 'kickside.workflows:nav_item') + features('workflows', 'workspace_kind', 'kickside.workflows:workflow_kind') +
        features('code-execution', 'workflow_block', 'kickside.code_execution:block.run_code')), instance_setup=True),
    Scenario('automation_canvas_trace', 'full', canvas_trace, ('automation_canvas',), features=features('workflows', 'http',
        'GET /api/v1/workflows/{id}/runs/{run_id}/nodes/{def_node_id}/data')),
]


def workflow_labels(ctx):
    inst = ctx.inst
    wid, _ = dispatch_workflow(ctx, 'Northwind labeled fulfillment')
    inst.request('POST', '/api/v1/workflows/' + wid + '/labels', {'labels': ['Northwind', 'Fulfillment']}, label='flow-labels')
    rows = inst.request('GET', '/api/v1/workflows?fields=labels&limit=100', label='labeled-list')['workflows']
    require(next((row['labels'] for row in rows if row['id'] == wid), None) == ['Northwind', 'Fulfillment'], 'Workflow labels do not persist')


REGISTRY.append(Scenario('automation_workflow_labels', 'full', workflow_labels, ('automation_evidence',),
    features=features('workflows', 'http', 'POST /api/v1/workflows/{id}/labels'), instance_setup=True))


def tool_name(inst, entry):
    return next(row['name'] for row in inst.request('GET', '/api/v1/mcp/tools')['tools'] if row['id'] == entry)


def management_tools(ctx):
    inst = ctx.inst
    wid, version = dispatch_workflow(ctx, 'Northwind MCP dispatch')
    traits = ('kickside.workflows.traits:reader', 'kickside.workflows.traits:manager',
              'kickside.workflows:flow_access_trait', 'kickside.automation.traits:reader', 'kickside.automation.traits:manager')
    direct = ('kickside.workflows.agent:flow_run_tool',)
    credential = mint(inst, tools=direct, traits=traits, active=traits)
    token = credential['token']
    names = {key: tool_name(inst, 'kickside.' + component + '.agent:' + key) for component, key in
        [('workflows', 'flows_read'), ('workflows', 'flows_manage'), ('workflows', 'flow_run_tool'),
         ('automation', 'automations_read'), ('automation', 'automations_manage'), ('automation', 'recurring_tasks')]}
    require(wid in json.dumps(call(inst, token, names['flows_read'], {'action': 'list'})), 'Workflow reader loses Northwind workflow')
    exported = call(inst, token, names['flows_read'], {'action': 'export', 'id': wid})
    require(isinstance(exported, dict) and isinstance(exported.get('flow'), dict),
            'Workflow reader export has no portable flow artifact: ' + str(exported))
    import_request = {'action': 'import', 'flow': exported['flow']}
    assert_mcp_tool_arguments(inst, token, names['flows_manage'], import_request)
    imported = call(inst, token, names['flows_manage'], import_request)['flow']
    require(imported['flow_id'] != wid and 'Verify dispatch record' in json.dumps(call(inst, token, names['flows_read'], {'action': 'read', 'id': imported['flow_id']})), 'MCP workflow import loses definition')
    run = call(inst, token, names['flow_run_tool'], {'flow_ref': {'kind': 'flow', 'id': wid, 'version': version}, 'input': {'marker': 'NW-MCP-DISPATCH'}})
    require('NW-MCP-DISPATCH' in json.dumps(run), 'MCP workflow run loses dispatch marker')
    spec = {'title': 'Northwind MCP recurring dispatch', 'schedule': {'type': 'interval', 'expression': '1h'}, 'enabled': False,
            'target': {'kind': 'workflow', 'flow_ref': {'kind': 'flow', 'id': wid, 'version': version}, 'input': {'marker': 'NW-MCP-SCHEDULE'}}}
    created = call(inst, token, names['recurring_tasks'], {'action': 'create', **spec})
    aid = created['id']
    require(aid in json.dumps(call(inst, token, names['recurring_tasks'], {'action': 'list'})), 'RecurringTasks list loses created task')
    require('NW-MCP-SCHEDULE' in json.dumps(call(inst, token, names['automations_read'], {'action': 'read_config', 'id': aid})), 'Automation reader loses workflow target')
    call(inst, token, names['automations_manage'], {'action': 'reconfigure', 'id': aid, 'input': {**spec, 'title': 'Northwind MCP morning dispatch'}})
    require('Northwind MCP morning dispatch' in json.dumps(call(inst, token, names['automations_read'], {'action': 'list'})), 'Automation manager rename does not persist')
    identity = call(inst, token, 'session_info')['actor']
    changed = inst.request('POST', '/api/v1/automations/' + aid + '/identity', {'principal': {'kind': 'user', 'id': identity},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': 0}, label='automation-identity')
    require(changed.get('identity_generation') is not None and changed['state'] != 'failed', 'Automation identity command fails')
    call(inst, token, names['recurring_tasks'], {'action': 'delete', 'id': aid})
    inst.wait(lambda: aid not in json.dumps(call(inst, token, names['automations_read'], {'action': 'list'})), 'MCP task delete disappears from projection', seconds=35)
    call(inst, token, names['flows_manage'], {'action': 'delete', 'id': imported['flow_id']})
    inst.wait(lambda: imported['flow_id'] not in json.dumps(call(inst, token, names['flows_read'], {'action': 'list'})), 'MCP workflow delete disappears from projection', seconds=35)


def workflow_launch(ctx, event=False):
    inst = ctx.inst
    wid, version = dispatch_workflow(ctx, 'Northwind event dispatch' if event else 'Northwind scheduled dispatch')
    marker = 'NW-EVENT-DISPATCH' if event else 'NW-SCHEDULE-DISPATCH'
    if event:
        inst.install('kickside/webhooks')
        hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Northwind dispatch events'}, label='dispatch-hook')['webhook']
        inst.redactor.add(hook['secret'])
        aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': {
            'title': 'Northwind dispatch event trigger', 'enabled': True,
            'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received', 'config': {'thread_id': hook['thread_id']}, 'backfill': 'none'},
            'sink_port': 'kickside.workflows:run_sink', 'sink_config': {'flow_ref': {'kind': 'flow', 'id': wid, 'version': version}},
            'transform': {'kind': 'none'}}}, label='dispatch-event-automation')['id']
    else:
        aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': {
            'title': 'Northwind dispatch schedule', 'enabled': True, 'schedule': {'type': 'interval', 'expression': '2s'},
            'target': {'kind': 'workflow', 'flow_ref': {'kind': 'flow', 'id': wid, 'version': version}, 'input': {'marker': marker, 'crates': 48}}}}, label='dispatch-schedule')['id']
    from cleanup_evidence import own_visible_automation
    cleanup = own_visible_automation(ctx, aid)
    if event:
        inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], {'marker': marker, 'crates': 48}, auth=hook['secret'], expect=(202,), label='dispatch-trigger')
    def completed():
        rows = inst.request('GET', '/api/v1/workflows/' + wid + '/runs', label='launched-runs')['runs']
        require(all(row['status'] != 'failed' for row in rows), 'Automation launches failed workflow: ' + str(rows))
        done = [row for row in rows if row['status'] == 'completed']
        return done if done else None
    done = inst.wait(completed, 'Automation launches and completes workflow', seconds=60)
    detail = inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + done[0]['run_id'], label='launched-output')
    require(detail['run']['output'] == {'result': {'marker': marker, 'crates': 48}}, 'Launched workflow output differs')
    nav(ctx, 'Automations')
    screen(ctx, 'northwind-workflow-trigger' if event else 'northwind-workflow-schedule')
    cleanup()


def workflow_assist(ctx):
    inst = ctx.inst
    wid, _ = dispatch_workflow(ctx, 'Northwind assisted dispatch')
    shape = {'type': 'object', 'required': ['crates'], 'properties': {'crates': {'type': 'integer'}}}
    generated = inst.request('POST', '/api/v1/workflows/assist/schema', {'intent': 'An object with required integer crates. Fictional Northwind stock.', 'current_schema': shape}, label='schema-assist', timeout=120)
    require(generated.get('schema', {}).get('type') == 'object' and 'crates' in json.dumps(generated['schema']), 'Gemma schema loses crates')
    base = '/api/v1/workflows/' + wid
    binding = inst.request('POST', base + '/assist/binding', {'source_context_schema': shape, 'target_start_schema': shape,
        'source_context_sample': {'crates': 48}, 'intent': 'Pass crates through unchanged.'}, label='binding-assist', timeout=120)
    require('crates' in json.dumps(binding), 'Gemma binding loses crates')
    edge = inst.request('POST', base + '/assist/edge', {'edge': {}, 'upstream_schema': shape, 'downstream_schema': shape,
        'upstream_sample': {'crates': 48}, 'downstream_sample': {'crates': 48}}, label='edge-assist', timeout=120)
    require(edge.get('transform') or edge.get('compatible') is True or edge.get('noop') is True, 'Gemma edge assist has no validated mapping: ' + str(edge))
    inst.request('POST', base + '/apply', {'commands': [{'type': 'node.add', 'body': {'id': 'condition', 'kind': 'branch', 'config': {'predicate': 'output.crates >= 48'}}}]}, label='assist-condition-node')
    config = inst.request('POST', base + '/assist/config', {'node_id': 'condition', 'intent': 'Continue when output.crates is at least 48. Set predicate output.crates >= 48.', 'upstream_schema': shape}, label='config-assist', timeout=120)
    require(config.get('config', {}).get('predicate') and 'crates' in config['config']['predicate'], 'Gemma condition configuration loses crates')


def transform_function_denial(ctx):
    inst = ctx.inst
    result = inst.request('POST', '/api/v1/transform/validate', {'transform': {'kind': 'func', 'function_id': 'kickside.blocks:list'},
        'sink_schema': {'type': 'object'}, 'input_shape': 'record', 'samples': [{'payload': {'product': 'Northwind Tea'}}]}, label='function-resource-denial')
    require(result['valid'] is False and 'resource' in json.dumps(result['errors']).lower() and not result['outputs'], 'Function transform runs without a declared authorized resource')


REGISTRY += [
    Scenario('automation_management_tools', 'full', management_tools, ('automation_evidence',), issues=('SMOKE-TOOL-ARGUMENT-FIXTURE', 'WORKFLOW-PORTABLE-EMPTY-OBJECT-SHAPE', 'WORKFLOWS-PUBLISHED-OUTPUT-SHAPE'), features=(
        features('workflows', 'capability', 'kickside.workflows.traits:reader', 'kickside.workflows.traits:manager', 'kickside.workflows:flow_access_trait') +
        features('workflows', 'mcp_tool', 'kickside.workflows.agent:flows_read', 'kickside.workflows.agent:flows_manage', 'kickside.workflows.agent:flow_run_tool') +
        features('automation', 'capability', 'kickside.automation.traits:reader', 'kickside.automation.traits:manager') +
        features('automation', 'mcp_tool', 'kickside.automation.agent:automations_read', 'kickside.automation.agent:automations_manage', 'kickside.automation.agent:recurring_tasks') +
        features('automation', 'http', 'POST /api/v1/automations/{id}/identity')), instance_setup=True),
    Scenario('automation_workflow_schedule', 'full', workflow_launch, ('automation_evidence',), features=(
        features('automation', 'automation', 'kickside.automation.recurring:task') + features('workflows', 'sink', 'kickside.workflows:run_sink')), instance_setup=True),
    Scenario('automation_workflow_trigger', 'full', lambda ctx: workflow_launch(ctx, event=True), ('automation_evidence',), features=(
        features('sync', 'automation', 'kickside.sync:sync') + features('sync', 'workspace_kind', 'kickside.sync:sync') +
        features('workflows', 'sink', 'kickside.workflows:run_sink') + features('webhooks', 'trigger', 'kickside.webhooks:webhook_received') +
        features('transform', 'transform', 'kickside.transform:strategy_none_binding')), instance_setup=True),
    Scenario('automation_workflow_assist', 'full', workflow_assist, ('automation_evidence',), model=True, features=features('workflows', 'http',
        'POST /api/v1/workflows/assist/schema', 'POST /api/v1/workflows/{id}/assist/binding', 'POST /api/v1/workflows/{id}/assist/edge', 'POST /api/v1/workflows/{id}/assist/config'), instance_setup=True),
    Scenario('automation_transform_func', 'full', transform_function_denial, ('automation_evidence',), features=(
        features('transform', 'http', 'POST /api/v1/transform/validate') + features('transform', 'transform', 'kickside.transform:strategy_func_binding'))),
]


def open_workflow(ctx, title):
    nav(ctx, 'Automations')
    nav(ctx, 'Workflows')
    back = ctx.browser.frame.get_by_role('button', name='Back to Workflows', exact=True)
    if back.count():
        back.click()
    ctx.browser.frame.get_by_text(title, exact=True).first.click()
    ctx.browser.frame.get_by_role('textbox', name='Search steps', exact=True).wait_for(timeout=30000)


def canvas_logic(ctx):
    inst, browser = ctx.inst, ctx.browser
    title = 'Northwind warehouse routing and batches'
    wid, _ = dispatch_workflow(ctx, title)
    open_workflow(ctx, title)
    palette = browser.frame.locator('.wf-palette-item')
    browser.frame.get_by_role('textbox', name='Search steps', exact=True).fill('Condition')
    palette.filter(has_text='Condition').first.click()
    browser.frame.get_by_role('button', name='Advanced expression', exact=True).click()
    browser.frame.get_by_role('textbox', name='Condition expression', exact=True).fill('output.result.ready == true')
    browser.frame.get_by_role('textbox', name='Condition expression', exact=True).press('Tab')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).fill('Ready for Northwind dispatch?')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).press('Enter')
    browser.frame.get_by_role('button', name='Close inspector', exact=True).click()
    browser.frame.get_by_role('textbox', name='Search steps', exact=True).fill('For each')
    palette.filter(has_text='For each').first.click()
    browser.frame.get_by_role('textbox', name='Source array key', exact=True).fill('orders')
    browser.frame.get_by_role('textbox', name='Source array key', exact=True).press('Tab')
    browser.frame.get_by_role('spinbutton', name='Batch size', exact=True).fill('2')
    browser.frame.get_by_role('spinbutton', name='Batch size', exact=True).press('Tab')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).fill('Dispatch every Northwind order')
    browser.frame.get_by_role('textbox', name='Step title', exact=True).press('Enter')
    browser.frame.get_by_role('button', name='Close inspector', exact=True).click()
    def authored():
        state = inst.request('GET', '/api/v1/workflows/' + wid + '/state', label='canvas-logic-state')['state']
        branches = [n for n in state['nodes'] if n['kind'] == 'branch']
        loops = [n for n in state['nodes'] if n['kind'] == 'for_each']
        return state if branches and loops and branches[0]['config'].get('predicate') == 'output.result.ready == true' and loops[0]['config'].get('batch_size') == 2 else None
    saved = inst.wait(authored, 'Canvas branch and foreach configuration persists', seconds=35, pump=browser.page.wait_for_timeout)
    branch = next(n['id'] for n in saved['nodes'] if n['kind'] == 'branch')
    loop = next(n['id'] for n in saved['nodes'] if n['kind'] == 'for_each')
    require(next(n for n in saved['nodes'] if n['id'] == loop)['config']['source_array_key'] == 'orders', 'Canvas foreach loses source array')
    def edge(key, source, target, port, transform=None):
        body = {'id': key, 'source_id': source, 'target_id': target, 'source_port': port, 'target_port': 'in'}
        if transform: body['transform'] = transform
        return {'type': 'edge.add', 'body': body}
    commands = [
        {'type': 'edge.remove', 'body': {'id': 'receipt-finish'}},
        {'type': 'node.add', 'body': {'id': 'pack', 'kind': 'block', 'title': 'Pack one Northwind order', 'ref': 'kickside.code_execution:block.run_code', 'config': {'code': 'return __cx_args', 'tool_ids': []}}},
        {'type': 'node.add', 'body': {'id': 'hold', 'kind': 'block', 'title': 'Hold unready Northwind shipment', 'ref': 'kickside.code_execution:block.run_code', 'config': {'code': 'return {held=true, warehouse="Warehouse A"}', 'tool_ids': []}}},
        edge('receipt-branch', 'receipt', branch, 'result'), edge('ready-batch', branch, loop, 'true', 'output.result'),
        edge('batch-pack', loop, 'pack', 'body'), edge('batch-finish', loop, 'finish', 'done'),
        edge('unready-hold', branch, 'hold', 'false'), edge('hold-finish', 'hold', 'finish', 'result', 'output.result'),
    ]
    inst.request('POST', '/api/v1/workflows/' + wid + '/apply', {'commands': commands}, label='canvas-routing-wiring')
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {}, label='canvas-routing-publish')['version']
    for ready in (True, False):
        data = {'ready': ready, 'orders': [{'product': 'Northwind Tea', 'crates': 36}, {'product': 'Northwind Coffee', 'crates': 12}, {'product': 'Northwind Cocoa', 'crates': 8}]}
        rid = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': data}, label='canvas-branch-run')['run_id']
        done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Canvas branch/foreach completion', seconds=60)
        output = done['run']['output']
        expected = {'result': [{'ok': True, 'result': order} for order in data['orders']]} if ready else {'result': {'held': True, 'warehouse': 'Warehouse A'}}
        require(output == expected, 'Branch/foreach result differs: ' + str(output))
    open_workflow(ctx, title)
    fit_canvas(ctx)
    screen(ctx, 'northwind-branch-foreach-canvas-light')
    screen(ctx, 'northwind-branch-foreach-canvas-dark', dark=True)


def agent_workflow(ctx):
    inst = ctx.inst
    wid, _ = dispatch_workflow(ctx, 'Northwind Gemma warehouse analyst')
    base = '/api/v1/workflows/' + wid
    schema = {'type': 'object', 'required': ['marker', 'crates'], 'properties': {'marker': {'type': 'string'}, 'crates': {'type': 'integer'}}, 'additionalProperties': False}
    config = {'instructions': 'You analyze fictional Northwind stock. Return marker NORTHWIND-GEMMA and crates 48. Return only the output object requested by the output schema.',
              'model': ctx.state['model'], 'name': 'Northwind warehouse analyst', 'tool_calling': 'auto', 'exit_schema': schema}
    replace_workflow_block(inst, wid, 'receipt', 'kickside.agents:block.agent',
        title='Gemma verifies fictional Northwind stock', config=config,
        port_map={'error': 'failed'}, transforms={'result': ''})
    version = inst.request('POST', base + '/publish', {}, label='agent-workflow-publish')['version']
    rid = inst.request('POST', base + '/run', {'version': version, 'input': {'product': 'Northwind Tea', 'crates': 48}}, label='agent-workflow-run')['run_id']
    done = inst.wait(lambda: flow_detail(inst, wid, rid), 'Gemma agent block completion', seconds=180)
    require(done['run']['output'] == {'result': {'marker': 'NORTHWIND-GEMMA', 'crates': 48}}, 'Gemma workflow output differs: ' + str(done))
    open_workflow(ctx, 'Northwind Gemma warehouse analyst')
    fit_canvas(ctx)
    screen(ctx, 'northwind-gemma-agent-canvas')


def agent_trace(ctx):
    open_workflow(ctx, 'Northwind Gemma warehouse analyst')
    run_trace(ctx, 'northwind-gemma-run-trace', 'Gemma verifies fictional Northwind stock', 'NORTHWIND-GEMMA')


def channel_responder(ctx):
    inst = ctx.inst
    inst.install('kickside/slack')
    inst.install('kickside/channel')
    from scenarios_access import setup_access_connection_fixtures, ACCESS_PROVIDER_CREDENTIALS
    setup_access_connection_fixtures(ctx)
    connection = inst.request('POST', '/api/v1/connections', {'impl_id': 'kickside.slack.connection:slack_connection',
        'name': 'Northwind internal dispatch channel', 'validate': True,
        'private_context': ACCESS_PROVIDER_CREDENTIALS['kickside.slack.connection:slack_connection']},
        label='responder-connection')['component_id']
    connection_cleanup = inst.cleanup.add('responder connection',
        lambda: inst.request('DELETE', '/api/v1/connections/' + connection, label='responder-connection-delete'))
    input = {'title': 'Northwind dispatch responder', 'connection_id': connection, 'channel_id': 'NW',
        'channel_name': 'northwind-orders', 'target': 'channel', 'agent_id': ctx.state['agent'], 'agent_name': 'Northwind smoke assistant',
        'system_prompt': 'Answer fictional Northwind warehouse questions from the supplied stock records.',
        'response_policy': {'mode': 'lazy', 'wait_seconds': 12, 'assessor_model': ctx.state['model']},
        'session_policy': {'rotate_after_idle': True, 'idle_seconds': 3600, 'runtime_idle_seconds': 600},
        'context': 'Northwind Warehouse A: 48 tea crates, 12 reserved.'}
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.channel.responder:channel_responder', 'input': input}, label='responder-create')['id']
    base = '/api/v1/automations/' + aid
    responder_cleanup = inst.cleanup.add('channel responder', lambda: inst.request('DELETE', base, label='responder-delete'))
    read = inst.request('POST', base + '/actions/read_config', {}, label='responder-read')['result']
    require(read['state']['response_policy']['wait_seconds'] == 12 and read['state']['system_prompt'] == input['system_prompt'], 'Responder configuration loses behavior')
    updated = inst.request('POST', base + '/actions/configure', {'input': {**input, 'context': 'Northwind Warehouse B: 72 coffee crates.',
        'response_policy': {'mode': 'immediate'}}}, label='responder-configure')['result']
    require(updated['state']['context'] == 'Northwind Warehouse B: 72 coffee crates.' and updated['state']['response_policy']['mode'] == 'immediate', 'Responder update loses context/policy')
    nav(ctx, 'Automations')
    ctx.browser.frame.get_by_role('button', name='Open Northwind dispatch responder details', exact=True).click()
    screen(ctx, 'northwind-channel-responder-configuration')
    ctx.browser.frame.get_by_role('button', name='Close details', exact=True).click()
    responder_cleanup()
    inst.cleanup.remove(responder_cleanup)
    connection_cleanup()
    inst.cleanup.remove(connection_cleanup)
    require(aid not in json.dumps(inst.request('GET', '/api/v1/automations')), 'Deleted responder remains listed')


def canvas_review_agent(ctx):
    inst, browser = ctx.inst, ctx.browser
    title = 'Northwind dispatch analyst and warehouse approval'
    wid, _ = dispatch_workflow(ctx, title)
    open_workflow(ctx, title)
    for label, name in [('Agent', 'Gemma verifies Northwind dispatch'), ('Inbox review', 'Warehouse manager approves 48 tea crates')]:
        browser.frame.get_by_role('textbox', name='Search steps', exact=True).fill(label)
        browser.frame.locator('.wf-palette-item').filter(has_text=re.compile('^' + re.escape(label))).first.click()
        browser.frame.get_by_role('textbox', name='Step title', exact=True).fill(name)
        browser.frame.get_by_role('textbox', name='Step title', exact=True).press('Enter')
        browser.frame.get_by_role('button', name='Close inspector', exact=True).click()
    def authored():
        state = inst.request('GET', '/api/v1/workflows/' + wid + '/state', label='canvas-review-agent-state')['state']
        refs = {node.get('ref'): node for node in state['nodes']}
        return refs if refs.get('kickside.agents:block.agent', {}).get('title') == 'Gemma verifies Northwind dispatch' and refs.get('kickside.inbox:block.review', {}).get('title') == 'Warehouse manager approves 48 tea crates' else None
    refs = inst.wait(authored, 'Canvas saves Agent and Inbox review nodes', seconds=35, pump=browser.page.wait_for_timeout)
    agent, review = refs['kickside.agents:block.agent']['id'], refs['kickside.inbox:block.review']['id']
    def edge(key, source, target, port):
        return {'type': 'edge.add', 'body': {'id': key, 'source_id': source, 'target_id': target, 'source_port': port, 'target_port': 'in'}}
    commands = [
        {'type': 'node.remove', 'body': {'id': 'receipt'}},
        {'type': 'node.update', 'body': {'id': agent, 'config': {'model': ctx.state['model'], 'tool_calling': 'auto',
            'instructions': 'Return product Northwind Tea and crates 48 for this fictional shipment.',
            'exit_schema': {'type': 'object', 'required': ['product', 'crates'], 'properties': {'product': {'type': 'string'}, 'crates': {'type': 'integer'}}}}}},
        {'type': 'node.update', 'body': {'id': review, 'config': {'prompt': 'Approve Northwind shipment NW-2048: 48 tea crates at Warehouse A, 12 reserved.', 'priority': 'high'}}},
        edge('start-analyst', 'start', agent, 'out'), edge('analyst-review', agent, review, 'result'),
        edge('approval-finish', review, 'finish', 'then'), edge('rejection-finish', review, 'finish', 'else'),
    ]
    inst.request('POST', '/api/v1/workflows/' + wid + '/apply', {'commands': commands}, label='canvas-review-agent-wiring')
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {}, label='canvas-review-agent-publish')['version']
    rid = inst.request('POST', '/api/v1/workflows/' + wid + '/run', {'version': version, 'input': {'shipment': 'NW-2048'}}, label='canvas-review-agent-run')['run_id']
    def waiting():
        detail = inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + rid, label='canvas-review-agent-waiting')
        require(detail['run']['status'] not in ('failed', 'completed'), 'Canvas review terminates before warehouse approval')
        return detail if any(node['status'] == 'waiting' for node in detail['nodes']) else None
    inst.wait(waiting, 'Canvas Agent completes and review waits', seconds=180)
    open_workflow(ctx, title)
    fit_canvas(ctx)
    screen(ctx, 'northwind-agent-approval-canvas-light')
    screen(ctx, 'northwind-agent-approval-canvas-dark', dark=True)
    nav(ctx, 'Inbox')
    browser.frame.get_by_text('Approve Northwind shipment NW-2048: 48 tea crates at Warehouse A, 12 reserved.', exact=True).first.click()
    browser.frame.get_by_role('button', name='Approve', exact=True).wait_for(timeout=30000)
    screen(ctx, 'northwind-warehouse-approval-detail')
    browser.frame.get_by_role('button', name='Approve', exact=True).click()
    complete = inst.wait(lambda: flow_detail(inst, wid, rid), 'UI approval resumes canvas workflow', seconds=60)
    require('approve' in json.dumps(complete['run']['output']), 'Canvas UI approval does not reach Finish')


REGISTRY += [
    Scenario('automation_canvas_logic', 'full', canvas_logic, ('automation_evidence',), features=features('workflows', 'http',
        'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs/{run_id}'), instance_setup=True),
    Scenario('automation_agent_workflow', 'full', agent_workflow, ('automation_evidence',), model=True, issues=('R5-T08', 'DATAFLOW-EXECUTION-FRAME-POLICY-CAP'), features=features('agents', 'workflow_block', 'kickside.agents:block.agent') + features('workflows', 'http',
        'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs/{run_id}'), instance_setup=True),
    Scenario('automation_agent_trace', 'full', agent_trace, ('automation_agent_workflow',), model=True, features=features('workflows', 'http',
        'GET /api/v1/workflows/{id}/runs/{run_id}/nodes/{def_node_id}/data')),
    Scenario('automation_channel_responder', 'full', channel_responder, ('automation_evidence',), features=features('automation', 'http',
        'POST /api/v1/automations', 'POST /api/v1/automations/{id}/actions/{method}', 'DELETE /api/v1/automations/{id}'), instance_setup=True),
    Scenario('automation_canvas_review_agent', 'full', canvas_review_agent, ('automation_evidence',), model=True, features=(
        features('workflows', 'http', 'POST /api/v1/workflows/{id}/apply', 'POST /api/v1/workflows/{id}/publish', 'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs/{run_id}', 'GET /api/v1/workflows/{id}/state') +
        features('inbox', 'workflow_block', 'kickside.inbox:block.review') + features('inbox', 'http', 'GET /api/v1/inbox', 'POST /api/v1/inbox/{id}/{action}') + features('inbox', 'navigation', 'kickside.inbox:nav_item')), instance_setup=True),
]

late = {'automation_inbox_notices', 'automation_approvals_restart', 'automation_canvas_review_agent'}
REGISTRY = [scenario for scenario in REGISTRY if scenario.name not in late] + [scenario for scenario in REGISTRY if scenario.name in late]


def workflow_layout_direction(ctx):
    from workflow_layout_direction import verify_layout_direction
    verify_layout_direction(ctx)


REGISTRY += [Scenario('automation_workflow_layout_direction', 'full', workflow_layout_direction,
    ('automation_evidence',), features=features('workflows', 'http',
        'POST /api/v1/workflows/{id}/apply', 'GET /api/v1/workflows/{id}/state',
        'POST /api/v1/workflows/{id}/undo', 'POST /api/v1/workflows/{id}/redo',
        'GET /api/v1/workflows/{id}/export', 'POST /api/v1/workflows/import'))]


def automation_row_schedule(ctx):
    from automation_row_schedule import verify_row_schedule
    verify_row_schedule(ctx)


REGISTRY += [Scenario('automation_row_schedule', 'full', automation_row_schedule,
    ('automation_evidence',), issues=('AUTOMATION-SCHEDULED-DRIVE-STATUS',), features=features('automation', 'http',
        'POST /api/v1/automations', 'PUT /api/v1/automations/{id}',
        'GET /api/v1/automations/{id}/status', 'GET /api/v1/automations', 'DELETE /api/v1/automations/{id}'))]


def source_schema_mapping(ctx):
    from source_schema_mapping import verify_source_schema_mapping
    verify_source_schema_mapping(ctx)


REGISTRY += [Scenario('automation_source_schema_mapping', 'full', source_schema_mapping,
    ('automation_evidence',), features=(features('automation', 'http',
        'POST /api/v1/automations', 'PUT /api/v1/automations/{id}', 'DELETE /api/v1/automations/{id}') +
        features('webhooks', 'http', 'POST /api/v1/webhooks', 'POST /api/public/hooks/{id}', 'DELETE /api/v1/webhooks/{id}')))]


def workflow_past_runs(ctx):
    from workflow_past_runs import verify_past_runs
    verify_past_runs(ctx)


REGISTRY += [Scenario('automation_workflow_past_runs', 'full', workflow_past_runs,
    ('automation_evidence',), features=(features('workflows', 'http',
        'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs',
        'GET /api/v1/workflows/{id}/runs/{run_id}') +
        features('inbox', 'workflow_block', 'kickside.inbox:block.review') +
        features('inbox', 'http', 'POST /api/v1/inbox/{id}/{action}')))]


def workflow_routed_output(ctx):
    from workflow_routed_output import verify_routed_output
    verify_routed_output(ctx)


REGISTRY += [Scenario('automation_workflow_routed_output', 'full', workflow_routed_output,
    ('automation_evidence',), features=features('workflows', 'http',
        'POST /api/v1/workflows/{id}/run', 'GET /api/v1/workflows/{id}/runs/{run_id}',
        'GET /api/v1/workflows/{id}/runs/{run_id}/nodes/{def_node_id}/data'))]


def inbox_form_defaults(ctx):
    from inbox_form_defaults import verify_form_defaults
    verify_form_defaults(ctx)


REGISTRY += [Scenario('automation_inbox_form_defaults', 'full', inbox_form_defaults,
    ('automation_evidence',), features=(features('inbox', 'workflow_block', 'kickside.inbox:block.review') +
        features('inbox', 'http', 'POST /api/v1/inbox/{id}/{action}')))]


def inbox_decision_content(ctx):
    from inbox_decision_content import verify_decision_content
    verify_decision_content(ctx)


REGISTRY += [Scenario('automation_inbox_decision_content', 'full', inbox_decision_content,
    ('automation_evidence',), features=(features('inbox', 'workflow_block', 'kickside.inbox:block.review') +
        features('inbox', 'http', 'GET /api/v1/inbox') + features('inbox', 'navigation', 'kickside.inbox:nav_item')))]


def event_contract_setup(ctx):
    for name in ('kickside/sync', 'kickside/crm', 'kickside/workflows', 'kickside/code-execution', 'kickside/inbox'):
        ctx.inst.install(name)


def inbox_event_delivery(ctx, resolved=False):
    from scenarios_crm_chestor import crm_destination, sync_trigger, delivered
    inst = ctx.inst
    seed = inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': 'Northwind event primer ' + uuid.uuid4().hex[:8], 'content': 'Primer'})['item']
    ctx.inst.cleanup.add('Inbox event primer', lambda: inst.request('DELETE', '/api/v1/inbox/' + seed['id']), scope='scenario')
    marker = ('inbox-resolved-' if resolved else 'inbox-created-') + uuid.uuid4().hex[:8]
    cid, destination = crm_destination(ctx, marker)
    ctx.inst.cleanup.add('Inbox event destination', lambda: delete_component(
        inst, cid, '/api/v1/threads/' + cid), scope='scenario')
    sync_trigger(ctx, 'kickside.inbox:' + ('item_resolved' if resolved else 'item_created'), None, cid, marker, scope='scenario')
    item = inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': marker, 'content': '48 fictional crates'})['item']
    ctx.inst.cleanup.add('Inbox event item', lambda: inst.request('DELETE', '/api/v1/inbox/' + item['id']), scope='scenario')
    if resolved:
        inst.wait(lambda: any(row['id'] == item['id'] for row in inst.request('GET', '/api/v1/inbox?status=pending&limit=200')['items']),
            'Inbox event item projects before resolution', seconds=35)
        inst.request('POST', '/api/v1/inbox/' + item['id'] + '/dismiss', {}, label='inbox-event-resolve')
    delivered(ctx, destination, marker)


def subscribe_workflow_ui(ctx, source, workflow_title, marker):
    from playwright.sync_api import expect
    from scenarios_issue_guards import session_screen
    browser = ctx.browser_check()
    browser.login()
    session_screen(ctx)
    nav(ctx, 'Automations')
    browser.frame.get_by_role('button', name='Add automation', exact=True).first.click()
    browser.frame.get_by_role('button').filter(has_text=re.compile('^Data Sync')).first.click()
    form = browser.frame.locator('kickside-sync-create')
    form.locator('[data-test=pl-title]').fill(marker)
    sources = ctx.inst.request('GET', '/api/v1/automations/sources', label='workflow-ui-sources')['sources']
    source_title = next(row['title'] for row in sources if row['id'] == source)
    form.get_by_role('combobox', name='When this runs', exact=True).click()
    form.get_by_role('option').filter(has_text=source_title).click()
    picker = form.locator('[data-test=tc-instance] wc-component-picker')
    picker.get_by_role('button').first.click()
    picker.locator('.cp-row').filter(has_text=workflow_title).locator('.cp-row-main').click()
    form.locator('[data-test=tc-history-kind]').click()
    form.get_by_role('option', name='Only new', exact=True).click()
    destination = form.locator('.kx-stage').filter(has_text='Destination')
    destination.get_by_role('combobox').first.click()
    sinks = ctx.inst.request('GET', '/api/v1/automations/sinks', label='workflow-ui-sinks')['sinks']
    sink_title = next(row['title'] for row in sinks if row['id'] == 'kickside.inbox.sink:inbox_item')
    form.get_by_role('option').filter(has_text=sink_title).click()
    transform = form.locator('kickside-transform-assist')
    transform.get_by_role('combobox', name='Transform strategy', exact=True).click()
    transform.get_by_role('option', name='Expression', exact=True).click()
    transform.locator('[data-test=expr-editor]').fill(json.dumps({
        'title': marker, 'content': 'Northwind first workflow event reaches the subscribed inbox', 'item_type': 'notice'}))
    transform.locator('[data-test=expr-editor]').press('Tab')
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/automations')) as response:
        browser.frame.get_by_role('button', name='Create', exact=True).click()
    receipt = response.value.json()
    require(response.value.status == 200 and receipt.get('success') and receipt.get('id'),
            'Never-run workflow subscription fails in the UI: ' + str(receipt))
    ctx.inst.cleanup.add('Workflow UI subscription', lambda: ctx.inst.request(
        'DELETE', '/api/v1/automations/' + receipt['id']), scope='scenario')
    expect(browser.frame.get_by_role('button', name='Open ' + marker + ' details', exact=True)).to_be_visible(timeout=30000)
    browser.screenshot('never-run-workflow-subscribed')


def workflow_event_source(ctx, failed):
    from cleanup_evidence import delete_workflow
    from workflow_failure_contract import failure_workflow
    inst = ctx.inst
    if failed:
        wid, version, title = failure_workflow(ctx, scope='scenario')
        payload = {'code': 'NORTHWIND_STOCK_MISSING', 'message': title, 'fail': True}
    else:
        title = 'Northwind workflow event source ' + uuid.uuid4().hex[:8]
        wid, version = dispatch_workflow(ctx, title)
        inst.cleanup.add('Workflow event source', lambda: delete_workflow(ctx, wid), scope='scenario')
        payload = {'marker': 'NW-EVENT-RUN'}
    require(not inst.request('GET', '/api/v1/workflows/' + wid + '/runs', label='workflow-never-run')['runs'],
            'Workflow subscription fixture already has a run')
    return wid, version, title, payload


def workflow_event_delivery(ctx, failed=False):
    from playwright.sync_api import expect
    from scenarios_crm_chestor import crm_destination, sync_trigger, delivered
    inst = ctx.inst
    api_source = workflow_event_source(ctx, failed)
    expected = ('flow_run_failed',) if failed else ('flow_run_started', 'flow_run_finished')
    destinations = []
    for source in expected:
        marker = source + '-' + uuid.uuid4().hex[:8]
        cid, destination = crm_destination(ctx, marker)
        inst.cleanup.add('Workflow event destination', lambda cid=cid: inst.request('DELETE', '/api/v1/threads/' + cid), scope='scenario')
        sync_trigger(ctx, 'kickside.workflows:' + source, api_source[0], cid, marker, scope='scenario')
        destinations.append((destination, marker))
    ui_source = workflow_event_source(ctx, failed)
    marker_ui = 'Northwind first workflow receipt ' + uuid.uuid4().hex[:8]
    subscribe_workflow_ui(ctx, 'kickside.workflows:' + expected[0], ui_source[2], marker_ui)
    for wid, version, title, payload in (api_source, ui_source):
        base = '/api/v1/workflows/' + wid
        run = inst.request('POST', base + '/run', {'version': version, 'input': payload}, label='workflow-event-run')['run_id']
        def terminal():
            row = inst.request('GET', base + '/runs/' + run, label='workflow-event-status')['run']
            return row if row['status'] in ('failed', 'completed') else None
        row = inst.wait(terminal, 'Workflow event producer terminates', seconds=60)
        require(row['status'] == ('failed' if failed else 'completed'), 'Workflow event source has the wrong outcome: ' + str(row))
        if failed:
            require(title in row['error'], 'Workflow event source loses its failure cause')
    for destination, marker in destinations:
        delivered(ctx, destination, marker)
    nav(ctx, 'Inbox')
    expect(ctx.browser.frame.locator('kickside-inbox .kx-item-title').filter(has_text=marker_ui)).to_be_visible(timeout=60000)
    ctx.browser.screenshot('first-workflow-event-inbox')


REGISTRY += [
    Scenario('automation_event_contract_setup', 'full', event_contract_setup, ('platform_onboarding',), instance_setup=True),
    Scenario('automation_inbox_created_delivery', 'full', inbox_event_delivery, ('automation_event_contract_setup',), parallel=('records:automation_inbox_created_delivery',), issues=('SMOKE-PARALLEL-SCENARIO-CLEANUP',),
        features=features('inbox', 'trigger', 'kickside.inbox:item_created')),
    Scenario('automation_inbox_resolved_delivery', 'full', lambda ctx: inbox_event_delivery(ctx, True), ('automation_event_contract_setup',), parallel=('records:automation_inbox_resolved_delivery',), issues=('SMOKE-PARALLEL-SCENARIO-CLEANUP',),
        features=features('inbox', 'trigger', 'kickside.inbox:item_resolved')),
    Scenario('automation_workflow_success_delivery', 'full', workflow_event_delivery, ('automation_event_contract_setup',), parallel=('records:automation_workflow_success_delivery',),
        features=features('workflows', 'trigger', 'kickside.workflows:flow_run_started', 'kickside.workflows:flow_run_finished'),
        issues=('SMOKE-PARALLEL-SCENARIO-CLEANUP', 'P07', 'WORKFLOW-TERMINAL-PUBLICATION-DRAIN', 'DATAFLOW-EXECUTION-FRAME-POLICY-CAP')),
    Scenario('automation_workflow_failure_delivery', 'full', lambda ctx: workflow_event_delivery(ctx, True), ('automation_event_contract_setup',), parallel=('records:automation_workflow_failure_delivery',),
        features=features('workflows', 'trigger', 'kickside.workflows:flow_run_failed'),
        issues=('SMOKE-PARALLEL-SCENARIO-CLEANUP', 'P07', 'R3-T07', 'WORKFLOW-TERMINAL-PUBLICATION-DRAIN', 'DATAFLOW-EXECUTION-FRAME-POLICY-CAP')),
]


def regression_workflow_failure_ui(ctx):
    from playwright.sync_api import expect
    from workflow_failure_contract import failure_workflow
    from scenarios_access import Checks
    wid, _, marker = failure_workflow(ctx)
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    open_workflow(ctx, marker)
    browser.frame.get_by_role('button', name='Run', exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name='Run with input', exact=True)
    dialog.get_by_role('textbox', name='JSON value', exact=True).fill(json.dumps(
        {'code': 'NORTHWIND_STOCK_MISSING', 'message': marker, 'fail': True}))
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/workflows/' + wid + '/simulate')) as response:
        dialog.get_by_role('button', name='Run', exact=True).click()
    ctx.inst.evidence.save('workflow-ui-simulate-response', {
        'status': response.value.status, 'body': response.value.text()})
    require(response.value.status == 200 and response.value.json().get('run_id'), 'UI workflow launch does not return a run')
    rid = response.value.json()['run_id']
    ctx.inst.wait(lambda: ctx.inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + rid)['run']['status'] == 'failed',
        'UI workflow records failure', seconds=60, pump=browser.page.wait_for_timeout)
    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    runs = browser.frame.get_by_role('dialog', name='Runs', exact=True)
    row = runs.locator('.wf-runs-row').filter(has_text=rid[:8])
    expect(row).to_contain_text('Failed', timeout=30000)
    checks = Checks(ctx, 'workflow_failure_ui', 'owner')
    checks.check('list_cause', lambda: expect(row).to_contain_text(marker))
    browser.screenshot('failed-workflow-list')
    row.click()
    browser.frame.locator('.vue-flow__node').filter(has_text='Northwind stock refusal').click()
    inspector = browser.frame.locator('.wf-panel--run')
    checks.check('detail_cause', lambda: expect(inspector.locator('.wf-run-fail')).to_contain_text(marker, timeout=30000))
    browser.screenshot('failed-workflow-detail')
    inspector.get_by_role('tab', name='Timeline', exact=True).click()
    timeline = inspector.get_by_role('region', name='Run timeline', exact=True)
    event = timeline.locator('.wf-timeline-event').filter(has_text='flow.failed')
    event.get_by_text('Event details', exact=True).click()
    checks.check('timeline_cause', lambda: expect(event).to_contain_text(marker, timeout=30000))
    browser.screenshot('failed-workflow-timeline')
    checks.finish()


def regression_mcp_unavailable_guidance(ctx):
    credential = mint(ctx.inst, tools=('kickside.automation.agent:automations_read',))
    value = rpc(ctx.inst, credential['token'], 'tools/call', {'name': 'UnavailableNorthwindTool', 'arguments': {}}, 'unavailable-tool-guidance')
    result = value.get('result', {})
    require(result.get('isError') is True, 'Unavailable tool does not return a tool error')
    text = json.dumps(result)
    require(all(name in text for name in ('UnavailableNorthwindTool', 'session_info', 'find_traits')),
        'Unavailable-tool message loses its name or discovery guidance: ' + text)


REGISTRY += [
    Scenario('regression_workflow_failure_ui', 'full', regression_workflow_failure_ui, ('first_agent',),
        issues=('WORKFLOW-FAILURE-CAUSE',), features=features('workflows', 'http',
            'POST /api/v1/workflows/{id}/simulate', 'GET /api/v1/workflows/{id}/runs',
            'GET /api/v1/workflows/{id}/runs/{run_id}', 'GET /api/v1/workflows/{id}/runs/{run_id}/events')),
    Scenario('regression_mcp_unavailable_guidance', 'full', regression_mcp_unavailable_guidance, ('first_agent',),
        issues=('MCP-UNAVAILABLE-TOOLS',), features=features('mcp', 'http', 'POST /api/public/mcp')),
]
