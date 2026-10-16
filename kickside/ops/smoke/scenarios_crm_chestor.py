"""Northwind CRM, research, and root/folder Chestor user journeys."""
import json
import re
import uuid
from urllib.parse import quote

from browser import Browser
from harness import Scenario, require
from scenarios import Context, nav
from scenarios_access import install_package
from mcp_client import MCPClient


def uid():
    return str(uuid.uuid4())


def features(component, category, *keys):
    return tuple(component + '|' + category + '|' + key for key in keys)


def contains(value, marker, label):
    require(marker in json.dumps(value, ensure_ascii=False), label + ' lacks ' + marker + ': ' + str(value))
    return value


def success(value, label):
    require(isinstance(value, dict) and value.get('success') is not False and value.get('ok') is not False,
            label + ' fails: ' + str(value))
    return value


def get(ctx, path, label):
    return success(ctx.inst.request('GET', path, label=label), label)


def post(ctx, path, body, label):
    return success(ctx.inst.request('POST', path, body, label=label), label)


def apply(ctx, base, namespace, events, label):
    return post(ctx, base + '/apply', {'commands': [{'type': namespace + ':' + kind, 'body': body}
                for kind, body in events]}, label)


def projected(ctx, path, marker, label):
    return ctx.inst.wait(lambda: (lambda value: value if marker in json.dumps(value, ensure_ascii=False) else None)(
        get(ctx, path, label)), label, seconds=60)


def projected_graph(ctx, path, receipt, label):
    def converged():
        value = get(ctx, path, label)
        graph = value['graph']
        same = all(sorted(item['id'] for item in graph[kind]) == sorted(item['id'] for item in receipt[kind])
                   for kind in ('nodes', 'edges'))
        return value if same else None
    return ctx.inst.wait(converged, label, seconds=60)


def projected_without(ctx, path, marker, label):
    return ctx.inst.wait(lambda: (lambda value: value if marker not in json.dumps(value, ensure_ascii=False) else None)(
        get(ctx, path, label)), label, seconds=60)


def query(ctx, base, body, label):
    return post(ctx, base + '/query', body, label)


def capture(ctx, label, dark=False):
    browser = ctx.browser
    browser.page.set_viewport_size({'width': 1600, 'height': 1000})
    browser.page.emulate_media(color_scheme='dark' if dark else 'light')
    browser.settle()
    browser.screenshot(label, mask_color='#17191c' if dark else '#f8fafc')


def workspace_open(ctx, entry, parent=None):
    nav(ctx, 'Workspace')
    close_chat = ctx.browser.frame.get_by_role('button', name='Close chat', exact=True)
    if close_chat.count():
        close_chat.click()
    if parent:
        ctx.browser.frame.get_by_role('button', name=re.compile('^' + re.escape(parent))).first.dblclick()
    ctx.browser.frame.get_by_role('button', name=re.compile('^' + re.escape(entry))).first.dblclick()


def create_entry(ctx, kind, name, parent=None):
    body = {'type': kind, 'name': name}
    if parent:
        body['parent_id'] = parent
    result = post(ctx, '/api/v1/workspace/entries', body, 'create-' + kind)
    entry = result['entry']
    require(entry.get('id') and entry['name'] == name, 'Workspace entry name/id differs: ' + str(result))
    return entry


def setup(ctx: Context):
    browser = ctx.browser_check()
    for frame in browser.page.frames:
        frame.evaluate("async () => { await document.fonts.ready; }")
    browser.settle()
    browser.clean(0)
    Browser.release(ctx)
    for component in ('kickside/crm', 'kickside/research', 'chestor/workspace', 'chestor/graph',
                      'chestor/journal', 'chestor/roadmap', 'chestor/db-schema', 'kickside/mcp', 'kickside/sync', 'kickside/workflows'):
        install_package(ctx, component)
    ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2, color_scheme='light')
    page = ctx.browser.page
    page.goto(ctx.inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
    page.get_by_label('Email').fill(ctx.inst.email)
    page.get_by_label('Password').fill(ctx.inst.password)
    page.evaluate("async () => { await document.fonts.ready; }")
    ctx.browser.settle()
    with page.expect_response(lambda r: '/api/public/user/token' in r.url and r.request.method == 'POST') as response:
        page.get_by_role('button', name='Sign In', exact=True).click()
    require(response.value.status == 200, 'Northwind browser login fails: HTTP ' + str(response.value.status))
    page.wait_for_url(ctx.inst.base + '/', timeout=30000)
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)
    ctx.state['nw_folder'] = create_entry(ctx, 'folder', 'Northwind · Delivery studio')['id']
    ctx.inst.manifest()
    capture(ctx, 'northwind-workspace-ready')


def workspace_tree(ctx):
    inst, folder = ctx.inst, ctx.state['nw_folder']
    types = get(ctx, '/api/v1/workspace/entries/types', 'entry-types')
    for kind in ('folder', 'graph', 'journal', 'roadmap', 'database', 'link', 'file'):
        contains(types, kind, 'Workspace kind catalog')
    root = create_entry(ctx, 'folder', 'Northwind · Regional operations')
    child = create_entry(ctx, 'folder', 'Northwind · Stockholm dispatch', root['id'])
    path = '/api/v1/workspace/entries/' + child['id']
    updated = inst.request('PUT', path, {'name': 'Northwind · Nordic dispatch',
                           'icon': 'tabler:truck-delivery'}, label='rename-properties')
    contains(updated, 'Northwind · Nordic dispatch', 'Renamed folder')
    post(ctx, path + '/move', {'parent_id': folder}, 'move-under-folder')
    moved = get(ctx, path, 'moved-folder')
    require(moved['entry']['parent_id'] == folder, 'Move keeps the old parent')
    crumbs = get(ctx, path + '/breadcrumbs', 'moved-breadcrumbs')
    contains(crumbs, folder, 'Moved breadcrumbs')
    contains(get(ctx, '/api/v1/workspace/entries?parent_id=' + folder, 'folder-list'), child['id'], 'Folder listing')
    require(child['id'] not in json.dumps(get(ctx, '/api/v1/workspace/entries?parent_id=' + root['id'], 'former-parent')),
            'Moved child remains under its former parent')
    nav(ctx, 'Workspace')
    ctx.browser.frame.get_by_role('button', name=re.compile('^Northwind · Delivery studio')).first.dblclick()
    ctx.browser.frame.get_by_text('Northwind · Nordic dispatch', exact=True).first.wait_for(timeout=30000)
    capture(ctx, 'workspace-nested-properties')
    success(inst.request('DELETE', path, label='delete-folder'), 'Delete folder')
    require(child['id'] not in json.dumps(get(ctx, '/api/v1/workspace/entries?parent_id=' + folder, 'after-delete')),
            'Deleted folder remains listed')
    nav(ctx, 'Workspace')
    capture(ctx, 'workspace-root-tree')


def workspace_share(ctx):
    inst = ctx.inst
    email = 'reader-' + uuid.uuid4().hex[:8] + '@northwind.example'
    member = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                          'full_name': 'Northwind Reader', 'groups': ['app.security:members']}, expect=(201,), label='reader-create')
    require(member.get('success'), 'Member creation fails: ' + str(member))
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password})['token']
    inst.redactor.add(token)
    path = '/api/v1/workspace/entries/' + ctx.state['nw_folder']
    denied = inst.request('GET', path, auth=token, expect=(403, 404), label='reader-before-share')
    require(denied.get('success') is False or denied.get('error'), 'Private folder denial lacks an error')
    post(ctx, path + '/grant', {'subject_id': member['user']['user_id'], 'subject_type': 'user', 'access_mask': 1}, 'folder-grant-read')
    readable = inst.request('GET', path, auth=token, label='reader-shared-folder')
    contains(readable, 'Northwind · Delivery studio', 'Shared folder reader')
    write = inst.request('PUT', path, {'name': 'Northwind unauthorized rename'}, auth=token,
                         expect=(400, 403), label='reader-write-denied')
    require(write.get('success') is False and write.get('error'), 'Read grant permits write or lacks denial')
    require(get(ctx, path, 'owner-after-denial')['entry']['name'] == 'Northwind · Delivery studio', 'Denied rename changes folder')
    post(ctx, path + '/revoke', {'subject_id': member['user']['user_id'], 'subject_type': 'user'}, 'folder-revoke')
    denied = inst.request('GET', path, auth=token, expect=(403, 404), label='reader-after-revoke')
    require(denied.get('success') is False or denied.get('error'), 'Revocation leaves folder readable')


def rpc(ctx, token, method, params, label):
    client = MCPClient(ctx.inst, token, '/api/public/mcp', stateful=False)
    if method == 'tools/call':
        return success(client.call(params['name'], params['arguments']), label)
    return client.rpc(method, params, label)


def mcp(ctx, tool_ids, components, run, trait_ids=()):
    credential = post(ctx, '/api/v1/mcp/credentials', {'label': 'Northwind scoped component checks',
                  'whitelist_component_ids': components, 'allowed_tool_ids': list(tool_ids),
                  'allowed_trait_ids': list(trait_ids)}, 'mcp-credential')['credential']
    token = credential['token']
    ctx.inst.redactor.add(token)
    try:
        initialized = rpc(ctx, token, 'initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
                          'clientInfo': {'name': 'Northwind Smoke', 'version': '1'}}, 'initialize')
        require(initialized.get('protocolVersion'), 'MCP initialization lacks negotiated protocol')
        def call(name, args):
            return rpc(ctx, token, 'tools/call', {'name': name, 'arguments': args}, name)
        for trait in trait_ids:
            call('use_trait', {'id': trait})
        return run(call)
    finally:
        post(ctx, '/api/v1/mcp/credentials/' + str(credential['credential_id']) + '/revoke', {}, 'mcp-revoke')


def workspace_tools(ctx):
    def run(call):
        contains(call('ListWorkspaceEntryTypes', {}), 'folder', 'MCP workspace types')
        root = call('CreateWorkspaceEntry', {'type': 'folder', 'name': 'Northwind · Agent planning'})['entry']
        child = call('CreateWorkspaceEntry', {'type': 'folder', 'name': 'Northwind · Dispatch reference',
                     'parent_id': root['id']})['entry']
        contains(call('GetWorkspaceEntry', {'id': child['id']}), 'Northwind · Dispatch reference', 'MCP get entry')
        contains(call('ListWorkspaceEntries', {'parent_id': root['id']}), child['id'], 'MCP list entry')
        contains(call('UpdateWorkspaceEntry', {'id': child['id'], 'name': 'Northwind · Delivery handbook'}),
                 'Northwind · Delivery handbook', 'MCP renamed entry')
        call('DeleteWorkspaceEntry', {'id': child['id']})
        require(child['id'] not in json.dumps(call('ListWorkspaceEntries', {'parent_id': root['id']})), 'MCP deletion keeps entry')
        call('DeleteWorkspaceEntry', {'id': root['id']})
    mcp(ctx, [], [], run, ('chestor.workspace.traits:workspace_model',))


def placement_entry(ctx, kind, placement, label):
    parent = ctx.state['nw_folder'] if placement == 'folder' else None
    title = 'Northwind · ' + label + (' · Portfolio' if placement == 'root' else ' · Delivery team')
    entry = create_entry(ctx, kind, title, parent)
    ctx.state['nw_' + kind + '_' + placement] = entry
    read = get(ctx, '/api/v1/workspace/entries/' + entry['id'], kind + '-entry')
    require(read['entry'].get('parent_id') == parent, 'Entry placement differs: ' + str(read))
    if parent:
        contains(get(ctx, '/api/v1/workspace/entries/' + entry['id'] + '/breadcrumbs', kind + '-breadcrumbs'),
                 parent, 'Folder breadcrumbs')
    return entry


def graph(ctx, placement):
    entry = placement_entry(ctx, 'graph', placement, 'Fulfillment architecture')
    base = '/api/v1/workspace/graphs/' + entry['id']
    events = [('node-type.registered', {'id': 'service', 'title': 'Service'}),
              ('edge-type.registered', {'id': 'requires', 'title': 'Requires'})]
    names = ['Order intake', 'Inventory ledger', 'Warehouse picking', 'Dispatch planning', 'Customer updates', 'Delivery analytics']
    for i, name in enumerate(names):
        events.extend([('node.added', {'id': 'service-' + str(i), 'type': 'service', 'name': name,
                        'description': 'Fictional Northwind fulfillment service', 'tags': ['Northwind'], 'sort_order': i}),
                       ('layout.position-set', {'node_id': 'service-' + str(i), 'x': 80 + i % 3 * 330, 'y': 100 + i // 3 * 250})])
        if i:
            events.append(('edge.added', {'id': 'edge-' + str(i), 'type': 'requires',
                           'source_id': 'service-' + str(i - 1), 'target_id': 'service-' + str(i), 'label': 'coordinates'}))
    receipt = apply(ctx, base, 'chestor.graph.events', events, 'graph-seed')['graph']
    snapshot = projected_graph(ctx, base, receipt, 'graph-projection')
    require(len(snapshot['graph']['nodes']) == 6 and len(snapshot['graph']['edges']) == 5, 'Graph counts differ')
    for suffix, marker in [('nodes', 'Order intake'), ('edges', 'coordinates'), ('schema', 'Service')]:
        contains(get(ctx, base + '/' + suffix, 'graph-' + suffix), marker, 'Graph ' + suffix)
    materials = get(ctx, base + '/materials', 'graph-materials')
    require(isinstance(materials['materials'].get('materials'), list), 'Graph materials response lacks list')
    apply(ctx, base, 'chestor.graph.events', [('node.updated', {'id': 'service-0', 'name': 'Order intake · reviewed'})], 'graph-update')
    projected(ctx, base, 'Order intake · reviewed', 'graph-updated')
    post(ctx, base + '/undo', {}, 'graph-undo')
    projected_without(ctx, base, 'Order intake · reviewed', 'Graph undo removes update')
    post(ctx, base + '/redo', {}, 'graph-redo')
    projected(ctx, base, 'Order intake · reviewed', 'graph-redone')


def graph_ui(ctx, placement):
    entry = ctx.state['nw_graph_' + placement]
    base = '/api/v1/workspace/graphs/' + entry['id']
    workspace_open(ctx, entry['name'], 'Northwind · Delivery studio' if placement == 'folder' else None)
    surface = ctx.browser.frame.locator('chestor-graph[entry-id="' + entry['id'] + '"][mode="full"]')
    surface.get_by_text('Order intake · reviewed', exact=True).first.wait_for(timeout=30000)
    capture(ctx, 'graph-' + placement + '-architecture')
    capture(ctx, 'graph-' + placement + '-hero', dark=True)
    ctx.browser.page.emulate_media(color_scheme='light')


def graph_tools(ctx, placement):
    entry = ctx.state['nw_graph_' + placement]
    def run(call):
        contains(call('GetGraph', {'entry_id': entry['id']}), 'Order intake', 'Agent graph read')
        contains(call('ApplyGraph', {'entry_id': entry['id'], 'commands': [
            {'type': 'chestor.graph.events:node.added', 'body': {'id': 'agent-note', 'type': 'note', 'name': 'Northwind agent handoff'}},
            {'type': 'chestor.graph.events:layout.position-set', 'body': {'node_id': 'agent-note', 'x': 800, 'y': 650}}]}),
                 'Northwind agent handoff', 'Agent graph mutation')
        projected(ctx, '/api/v1/workspace/graphs/' + entry['id'], 'Northwind agent handoff', 'Persisted agent graph')
    mcp(ctx, [], [entry['id']], run, ('chestor.graph.traits:graph_model',))


def roadmap(ctx, placement):
    entry = placement_entry(ctx, 'roadmap', placement, 'Delivery roadmap')
    base = '/api/v1/workspace/roadmaps/' + entry['id']
    events = [('roadmap.settings-updated', {'settings': {'period_kind': 'quarter', 'origin': '2026-Q4', 'columns': 5, 'default_lens': 'timeline'}})]
    for i, title in enumerate(['Operations', 'Customer experience', 'Platform']):
        events.append(('layer.added', {'id': 'lane-' + str(i), 'title': title, 'sort_order': i}))
    events.append(('outcome.added', {'id': 'delivery', 'title': 'Reliable Northwind deliveries'}))
    titles = ['Regional stock audit', 'Dispatch cockpit', 'Customer tracking', 'Returns portal', 'Inventory signals', 'Delivery insights']
    for i, title in enumerate(titles):
        events.append(('initiative.added', {'id': 'item-' + str(i), 'title': title, 'layer_id': 'lane-' + str(i % 3),
                      'outcome_id': 'delivery', 'start_period': ['2026-Q4', '2027-Q1', '2027-Q2'][i // 2], 'span': 1,
                      'status': 'active' if i < 2 else 'planned', 'progress': .45 if i < 2 else 0,
                      'confidence': 'high', 'size': 'M', 'owner': 'Northwind Delivery Team', 'sort_order': i}))
    events.extend([('dependency.added', {'id': 'stock-dispatch', 'from_id': 'item-0', 'to_id': 'item-1', 'kind': 'requires'}),
                   ('milestone.added', {'id': 'pilot', 'title': 'Northwind pilot ready', 'period': '2027-Q1',
                    'layer_id': 'lane-0', 'initiative_ids': ['item-0', 'item-1']})])
    apply(ctx, base, 'chestor.roadmap.events', events, 'roadmap-seed')
    snapshot = projected(ctx, base, 'Delivery insights', 'roadmap-projected')
    require(len(snapshot['roadmap']['initiatives']) == 6, 'Roadmap initiative count differs')
    for suffix, marker in [('initiatives', 'Dispatch cockpit'), ('dependencies', 'stock-dispatch'), ('critical', 'item-0'), ('schema', 'quarter')]:
        contains(get(ctx, base + '/' + suffix, 'roadmap-' + suffix), marker, 'Roadmap ' + suffix)
    apply(ctx, base, 'chestor.roadmap.events', [('initiative.updated', {'id': 'item-0', 'title': 'Regional stock audit · reviewed'})], 'roadmap-update')
    projected(ctx, base, 'Regional stock audit · reviewed', 'roadmap-updated')
    post(ctx, base + '/undo', {}, 'roadmap-undo')
    projected_without(ctx, base, 'Regional stock audit · reviewed', 'Roadmap undo removes change')
    post(ctx, base + '/redo', {}, 'roadmap-redo')
    projected(ctx, base, 'Regional stock audit · reviewed', 'roadmap-redone')


def roadmap_ui(ctx, placement):
    entry = ctx.state['nw_roadmap_' + placement]
    base = '/api/v1/workspace/roadmaps/' + entry['id']
    workspace_open(ctx, entry['name'], 'Northwind · Delivery studio' if placement == 'folder' else None)
    surface = ctx.browser.frame.locator('chestor-roadmap[entry-id="' + entry['id'] + '"][mode="full"]')
    surface.get_by_role('button', name='Timeline lens', exact=True).click()
    bar = surface.locator('[data-initiative-id="item-0"]')
    bar.wait_for(timeout=30000)
    old = next(item['start_period'] for item in get(ctx, base, 'before-drag')['roadmap']['initiatives'] if item['id'] == 'item-0')
    rect = bar.bounding_box()
    require(rect, 'Roadmap bar has no visible bounds')
    page = ctx.browser.page
    page.mouse.move(rect['x'] + rect['width'] / 2, rect['y'] + rect['height'] / 2)
    page.mouse.down()
    page.mouse.move(rect['x'] + rect['width'] / 2 + 180, rect['y'] + rect['height'] / 2, steps=20)
    page.mouse.up()
    ctx.inst.wait(lambda: next(item['start_period'] for item in get(ctx, base, 'after-drag')['roadmap']['initiatives']
                  if item['id'] == 'item-0') != old, 'Roadmap drag persists period', seconds=35, pump=page.wait_for_timeout)
    capture(ctx, 'roadmap-' + placement + '-timeline')
    capture(ctx, 'roadmap-' + placement + '-hero', dark=True)
    page.emulate_media(color_scheme='light')


def roadmap_tools(ctx, placement):
    entry = ctx.state['nw_roadmap_' + placement]
    def run(call):
        contains(call('GetRoadmap', {'entry_id': entry['id'], 'lens': 'timeline'}), 'Dispatch cockpit', 'MCP roadmap')
        contains(call('QueryRoadmap', {'entry_id': entry['id'], 'question': 'needs', 'id': 'item-1'}), 'item-0', 'MCP roadmap dependency')
        contains(call('ApplyRoadmap', {'entry_id': entry['id'], 'commands': [{'type': 'chestor.roadmap.events:initiative.updated',
                    'body': {'id': 'item-1', 'title': 'Northwind agent dispatch plan'}}]}), 'Northwind agent dispatch plan', 'MCP roadmap edit')
    mcp(ctx, [], [entry['id']], run, ('chestor.roadmap.traits:roadmap_model',))


def database(ctx, placement):
    entry = placement_entry(ctx, 'database', placement, 'Fulfillment data model')
    base = '/api/v1/workspace/db-schema/' + entry['id']
    events = []
    for i, title in enumerate(['customers', 'orders', 'order_lines', 'products', 'warehouses', 'shipments']):
        events.append(('table.added', {'id': title, 'name': title, 'description': 'Northwind ' + title.replace('_', ' ')}))
        for j, (column, dtype) in enumerate([('id', 'uuid'), ('name', 'text'), ('status', 'text'), ('created_at', 'timestamp')]):
            events.append(('column.added', {'id': title + '-' + column, 'table_id': title, 'name': column,
                           'col_type': dtype, 'primary_key': j == 0, 'nullable': j != 0}))
        events.append(('layout.position-set', {'table_id': title, 'x': 80 + i % 3 * 340, 'y': 60 + i // 3 * 320}))
    events.extend([('column.added', {'id': 'orders-customer', 'table_id': 'orders', 'name': 'customer_id', 'col_type': 'uuid'}),
                   ('relation.added', {'id': 'orders-customers', 'from_table_id': 'orders', 'from_column_id': 'orders-customer',
                    'to_table_id': 'customers', 'to_column_id': 'customers-id', 'relation_type': 'many_to_one', 'on_delete': 'restrict'}),
                   ('index.added', {'id': 'customer-index', 'table_id': 'orders', 'name': 'orders_customer_idx', 'columns': ['orders-customer']})])
    apply(ctx, base, 'chestor.db_schema.events', events, 'database-seed')
    snapshot = projected(ctx, base, 'orders_customer_idx', 'database-projected')
    require(len(snapshot['schema']['tables']) == 6, 'Database table count differs')
    for suffix, marker in [('tables', 'customer_id'), ('relations', 'orders-customers'), ('indexes', 'orders_customer_idx')]:
        contains(get(ctx, base + '/' + suffix, 'database-' + suffix), marker, 'Database ' + suffix)


def database_ui(ctx, placement):
    entry = ctx.state['nw_database_' + placement]
    base = '/api/v1/workspace/db-schema/' + entry['id']
    workspace_open(ctx, entry['name'], 'Northwind · Delivery studio' if placement == 'folder' else None)
    surface = ctx.browser.frame.locator('chestor-db-schema[entry-id="' + entry['id'] + '"][mode="full"]')
    surface.get_by_text('customers', exact=True).first.wait_for(timeout=30000)
    surface.get_by_role('button', name='Arrange', exact=True).click()
    ctx.browser.settle()
    laid_out = get(ctx, base, 'database-arranged')
    require(all(table.get('layout') for table in laid_out['schema']['tables']), 'Arrange leaves tables without layout')
    capture(ctx, 'database-' + placement + '-relations')
    surface.get_by_role('button', name='Export', exact=True).click()
    with ctx.browser.page.expect_download(timeout=30000) as downloaded:
        surface.get_by_text('SQL (.sql)', exact=True).click()
    path = ctx.inst.root / ctx.inst.evidence.label / 'northwind-schema.sql'
    downloaded.value.save_as(path)
    text = path.read_text()
    require('CREATE TABLE' in text and 'customers' in text and 'customer_id' in text and 'REFERENCES' in text,
            'SQL export omits tables, columns, or relations: ' + text)
    ctx.inst.evidence.paths.append(str(path))
    capture(ctx, 'database-' + placement + '-hero', dark=True)
    ctx.browser.page.emulate_media(color_scheme='light')


def database_tools(ctx, placement):
    entry = ctx.state['nw_database_' + placement]
    def run(call):
        contains(call('GetDatabaseSchema', {'entry_id': entry['id']}), 'customers', 'MCP schema read')
        result = call('EditDatabaseSchema', {'entry_id': entry['id'], 'commands': [{'type': 'chestor.db_schema.events:table.updated',
                      'body': {'id': 'shipments', 'name': 'northwind_shipments'}}]})
        contains(result, 'northwind_shipments', 'MCP schema edit')
        projected(ctx, '/api/v1/workspace/db-schema/' + entry['id'], 'northwind_shipments', 'Persisted schema edit')
    mcp(ctx, [], [entry['id']], run, ('chestor.db_schema.traits:schema_model',))


def journal(ctx, placement):
    entry = placement_entry(ctx, 'journal', placement, 'Delivery journal')
    base = '/api/v1/workspace/journals/' + entry['id']
    facts = [('decision', 'Pilot region approved', 'Northwind selects Stockholm for the fictional delivery pilot.'),
             ('finding', 'Stock reconciliation complete', 'Northwind counts 47 crates with 12 reserve crates.'),
             ('risk', 'Carrier capacity review', 'Northwind schedules a fictional carrier capacity review.'),
             ('observation', 'Dispatch rehearsal complete', 'Northwind rehearses the dispatch plan with 59 crates.'),
             ('milestone', 'Pilot briefing ready', 'Northwind prepares the pilot briefing and warehouse checklist.')]
    for kind, title, body in facts:
        result = post(ctx, base + '/events', {'event_type': kind, 'title': title, 'body': body,
                     'tags': ['northwind', 'delivery'], 'working_on': 'Northwind delivery pilot'}, 'journal-' + kind)
        require(result.get('max_seq') or result.get('receipt'), 'Journal append lacks durable receipt: ' + str(result))
    post(ctx, base + '/apply', {'events': [{'type': 'chestor.journal.events:entry.appended', 'body': {
         'event_type': 'evidence', 'title': 'Northwind crate ledger', 'body': 'Ledger confirms 59 fictional Northwind crates.'}}]}, 'journal-batch')
    post(ctx, base + '/tasks', {'id': 'northwind-pilot', 'title': 'Northwind pilot briefing', 'status': 'open'}, 'journal-task')
    post(ctx, base + '/tasks', {'id': 'northwind-labels', 'title': 'Northwind crate labels',
                             'parent_task_id': 'northwind-pilot', 'status': 'open'}, 'journal-subtask')
    projected(ctx, base + '/events', 'Pilot region approved', 'journal-event-projection')
    state = projected(ctx, base, 'Northwind crate labels', 'journal-state')
    contains(state, 'Northwind pilot briefing', 'Journal records/task state')
    listed = get(ctx, base + '/events', 'journal-events')
    event = next(item for item in listed['page']['events'] if item.get('title') == 'Pilot region approved')
    ctx.state['nw_journal_event_' + placement] = event['id']
    contains(get(ctx, base + '/events/' + event['id'], 'journal-event-detail'), 'Pilot region approved', 'Journal event detail')
    for suffix, marker in [('tree', 'Northwind crate labels'), ('branch?task_id=northwind-pilot', 'Northwind pilot briefing'),
                          ('frontier', 'northwind-pilot'), ('context_pack', 'Northwind'), ('updates?after_seq=0', 'Pilot region approved'),
                          ('changes?since_seq=0', 'northwind-pilot')]:
        contains(get(ctx, base + '/' + suffix, 'journal-' + suffix.split('?')[0]), marker, 'Journal ' + suffix)
    spans = get(ctx, base + '/spans', 'journal-spans')
    require(isinstance(spans['spans'].get('items'), list) and spans['spans']['items'], 'Journal facts create no work span')
    activity = get(ctx, base + '/activity', 'journal-activity')
    require(activity['activity']['buckets'] and sum(bucket['events'] for bucket in activity['activity']['buckets']) >= len(facts),
            'Journal activity lacks populated data: ' + str(activity))
    cursors = get(ctx, base + '/cursors', 'journal-cursors')
    require(isinstance(cursors['cursors'].get('items'), list), 'Journal cursor view lacks a list')
    health = get(ctx, base + '/health', 'journal-health')
    require(health.get('health') or health.get('status'), 'Journal health lacks observable status: ' + str(health))
    text = post(ctx, base + '/search_text', {'query': 'Northwind', 'limit': 20}, 'journal-text-search')
    contains(text, 'Pilot region approved', 'Journal text search')
    checkpoint = post(ctx, base + '/checkpoints', {'body': 'Northwind pilot briefing completes; crate labels remain open.',
                       'task_id': 'northwind-pilot'}, 'journal-checkpoint')
    require(checkpoint.get('max_seq') or checkpoint.get('receipt'), 'Checkpoint lacks receipt')
    success(ctx.inst.request('PUT', base + '/digest', {'digest': 'Northwind approves Stockholm delivery pilot: 47 crates and 12 reserve crates.'},
                            label='journal-digest'), 'Journal digest')
    contains(get(ctx, base, 'journal-digest-read'), '47 crates', 'Persisted digest')
    artifact = post(ctx, base + '/artifacts', {'uri': 'https://northwind.example/delivery-brief',
                    'title': 'Northwind delivery brief', 'artifact_type': 'document', 'task_id': 'northwind-pilot'}, 'journal-artifact')
    require(artifact.get('max_seq') or artifact.get('receipt'), 'Artifact lacks receipt')
    post(ctx, base + '/focus', {'task_id': 'northwind-pilot'}, 'journal-focus')
    graph_id = 'northwind-delivery-map'
    success(ctx.inst.request('PUT', base + '/graphs/' + graph_id + '/config', {'title': 'Northwind delivery map',
            'kind': 'workspace', 'request_id': uid(), 'maintainer': {'mode': 'deterministic'}, 'assembly': {'refine': False}}, label='journal-map-config'), 'Map config')
    operations = []
    for i, title in enumerate(['Pilot scope', 'Stock ledger', 'Carrier capacity', 'Crate labels', 'Dispatch rehearsal', 'Customer briefing']):
        operations.append({'op': 'node.add', 'id': 'map-' + str(i), 'label': title,
                           'kind': 'decision' if i == 0 else 'evidence', 'summary': 'Fictional Northwind delivery context', 'pinned': True})
        operations.append({'op': 'layout.position-set', 'id': 'map-' + str(i), 'x': i % 3 * 320, 'y': i // 3 * 220})
        if i:
            operations.append({'op': 'edge.add', 'id': 'map-link-' + str(i), 'from': 'map-0', 'to': 'map-' + str(i), 'kind': 'informs'})
    post(ctx, base + '/graphs/' + graph_id + '/ops', {'request_id': uid(), 'origin': 'human',
         'source_event_ids': [event['id']], 'operations': operations}, 'journal-map-ops')
    projected(ctx, base + '/graphs', graph_id, 'journal-graph-catalog')
    projected(ctx, base + '/graphs/' + graph_id, 'Pilot scope', 'journal-map-projected')
    contains(get(ctx, base + '/events/' + event['id'] + '/graphs', 'journal-event-graphs'), graph_id, 'Event graph provenance')
    assembled = post(ctx, base + '/graphs/' + graph_id + '/assemble', {'request_id': uid(), 'refine': False}, 'journal-map-assemble')
    require(assembled.get('success'), 'Map assembly request fails')
    assembly = get(ctx, base + '/graphs/' + graph_id + '/assemble', 'journal-assembly-status')
    require(assembly.get('assembly') or assembly.get('status'), 'Map assembly status lacks state: ' + str(assembly))


def journal_ui(ctx, placement):
    from playwright.sync_api import expect
    entry = ctx.state['nw_journal_' + placement]
    base = '/api/v1/workspace/journals/' + entry['id']
    workspace_open(ctx, entry['name'], 'Northwind · Delivery studio' if placement == 'folder' else None)
    surface = ctx.browser.frame.locator('chestor-journal[entry-id="' + entry['id'] + '"][mode="full"]')
    expect(surface).to_contain_text('Northwind pilot briefing', timeout=30000)
    capture(ctx, 'journal-' + placement + '-records')
    surface.locator('.jr-catalog-row').filter(has_text='Northwind delivery map').click()
    surface.get_by_role('button', name='Close the navigator', exact=True).click()
    surface.get_by_role('button', name='Outline lens', exact=True).click()
    expect(surface.locator('.jr-view')).to_contain_text('Pilot scope', timeout=30000)
    expect(surface.locator('.jr-view')).to_contain_text('Stock ledger', timeout=30000)
    capture(ctx, 'journal-' + placement + '-outline')
    surface.get_by_role('button', name='Graph lens', exact=True).click()
    canvas = surface.get_by_role('application', name='Bounded knowledge graph', exact=True)
    canvas.wait_for(timeout=30000)
    def painted():
        return canvas.evaluate("""canvas => {
            if (!canvas.width || !canvas.height) return false;
            const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            const colors = new Set();
            for (let y = 0; y < canvas.height; y += Math.max(1, Math.floor(canvas.height / 60))) {
                for (let x = 0; x < canvas.width; x += Math.max(1, Math.floor(canvas.width / 80))) {
                    const i = (y * canvas.width + x) * 4;
                    colors.add(pixels.slice(i, i + 4).join(','));
                }
            }
            return colors.size > 12;
        }""")
    ctx.inst.wait(painted, 'Journal map paints populated records and relations', seconds=30, pump=ctx.browser.page.wait_for_timeout)
    require(int(surface.locator('.jr-canvas-stat b').first.inner_text()) >= 6, 'Journal map renders fewer than six records')
    capture(ctx, 'journal-' + placement + '-delivery-map')
    capture(ctx, 'journal-' + placement + '-hero', dark=True)
    ctx.browser.page.emulate_media(color_scheme='light')


def journal_embeddings(ctx, placement):
    entry = ctx.state['nw_journal_' + placement]
    base = '/api/v1/workspace/journals/' + entry['id']
    def embedded():
        result = post(ctx, base + '/search', {'query': 'Northwind reserve crates stock total', 'limit': 10}, 'journal-semantic-search')
        return result if result.get('semantic_available') and 'Stock reconciliation complete' in json.dumps(result) else None
    value = ctx.inst.wait(embedded, 'Journal embeddings and semantic retrieval', seconds=120)
    require(value['semantic_available'], 'Journal search has no embeddings')


def journal_tools(ctx, placement):
    entry = ctx.state['nw_journal_' + placement]
    jid, base = entry['id'], '/api/v1/workspace/journals/' + entry['id']
    def run(call):
        context = call('JournalContext', {'journal_id': jid, 'op': 'open', 'agent_id': 'northwind-delivery-agent',
                       'address': {'graph_id': 'northwind-delivery-map', 'node_id': 'map-0'}})
        require(context.get('handle'), 'JournalContext returns no cursor handle: ' + str(context))
        handle = context['handle']
        projected(ctx, base + '/cursors', handle, 'journal-agent-cursor-projected')
        call('JournalFact', {'handle': handle, 'kind': 'finding', 'title': 'Northwind agent handoff',
             'body': 'Northwind confirms 59 crates and the fictional Stockholm pilot.'})
        projected(ctx, base + '/events', 'Northwind agent handoff', 'journal-agent-fact-projected')
        contains(call('JournalQuery', {'handle': handle, 'mode': 'events', 'since_seq': 0}),
                 'Northwind agent handoff', 'JournalQuery recorded fact')
        result = call('JournalGraph', {'handle': handle, 'action': 'apply', 'graph_id': 'northwind-delivery-map',
                      'operation': {'op': 'node.add', 'id': 'agent-handoff', 'label': 'Northwind agent handoff', 'kind': 'finding'}})
        require(result['status'] == 'queued' and result.get('request_id') and result.get('max_seq'),
                'JournalGraph lacks durable queued mutation: ' + str(result))
        projected(ctx, base + '/graphs/northwind-delivery-map', 'Northwind agent handoff', 'journal-agent-map-projected')
        contains(call('ReadJournal', {'journal_id': jid, 'view': 'tail'}), 'Northwind agent handoff', 'ReadJournal tail')
        lease = call('ActOnJournal', {'journal_id': jid, 'verb': 'open_branch', 'data': {'task_id': 'northwind-labels'}})['lease']
        transition = post(ctx, base + '/tasks/northwind-labels/transition', {'action': 'start',
                          'lease_id': lease['lease_id'], 'fencing_token': lease['fencing_token']}, 'journal-task-start')
        require(transition.get('applied') == 1 and transition.get('failed') == 0, 'Journal transition does not apply: ' + str(transition))
        projected(ctx, base + '/branch?task_id=northwind-labels', 'in_progress', 'Started task state')
        post(ctx, base + '/tasks', {'id': 'northwind-cancel', 'title': 'Northwind optional packing review', 'status': 'open'}, 'journal-cancel-task')
        projected(ctx, base + '/branch?task_id=northwind-cancel', 'Northwind optional packing review', 'journal-cancel-task-projected')
        cancel_lease = call('ActOnJournal', {'journal_id': jid, 'verb': 'open_branch', 'data': {'task_id': 'northwind-cancel'}})['lease']
        call('ActOnJournal', {'journal_id': jid, 'verb': 'cancel', 'data': {'task_id': 'northwind-cancel',
             'lease_id': cancel_lease['lease_id'], 'fencing_token': cancel_lease['fencing_token'],
             'reason': 'Northwind removes the optional review before work starts'}})
        projected(ctx, base + '/branch?task_id=northwind-cancel', 'canceled', 'Canceled task state')
        resumed = call('JournalContext', {'handle': handle, 'op': 'resume'})
        call('JournalContext', {'handle': handle, 'op': 'close', 'expected_revision': resumed['cursor']['revision']})
        ctx.inst.wait(lambda: any(row['cursor_id'] == handle and row['state'] == 'closed' for row in
                      get(ctx, base + '/cursors', 'journal-agent-cursor-closed')['cursors']['items']),
                      'Journal agent cursor closes durably', seconds=60, pump=ctx.browser.page.wait_for_timeout)
    mcp(ctx, [], [jid], run, ('chestor.journal.traits:journal_trait', 'chestor.journal.traits:journal_work_trait'))


def crm_setup(ctx):
    created = ctx.inst.request('POST', '/api/v1/workspace/crm', {'title': 'Northwind · Customer operations',
                               'idempotency_key': uid()}, expect=(201,), label='crm-create')
    cid = created['component_id']
    ctx.state['nw_crm'] = cid
    base = '/api/v1/workspace/crm/' + cid
    current = get(ctx, base + '/schema', 'crm-initial-schema')
    declaration = {'version': 'northwind-coverage', 'objects': [{'type': 'person', 'label': 'People'},
                   {'type': 'company', 'label': 'Companies'}, {'type': 'deal', 'label': 'Deals'}],
                   'attributes': [], 'pipelines': [{'collection_id': 'northwind-sales', 'object_type': 'deal', 'label': 'Northwind sales',
                   'stages': [{'stage_id': 'discovery', 'label': 'Discovery'}, {'stage_id': 'proposal', 'label': 'Proposal'},
                              {'stage_id': 'won', 'label': 'Won', 'won': True, 'terminal': True}]}],
                   'views': [{'view_id': 'nw-people', 'object_type': 'person', 'label': 'Customer contacts', 'layout': 'table'},
                   {'view_id': 'nw-board', 'object_type': 'deal', 'label': 'Delivery pipeline', 'layout': 'board', 'collection_id': 'northwind-sales'},
                   {'view_id': 'nw-timeline', 'object_type': 'person', 'label': 'Customer activity', 'layout': 'timeline'}], 'merge_config': {'objects': {}}}
    for obj in ('person', 'company', 'deal'):
        declaration['attributes'].append({'object_type': obj, 'attr': 'name', 'label': 'Name', 'data_type': 'text',
                                          'config': {'ui': {'role': 'title'}}})
    declaration['attributes'].extend([{'object_type': 'person', 'attr': 'email', 'label': 'Email', 'data_type': 'text', 'config': {'alias': 'email'}},
           {'object_type': 'person', 'attr': 'company', 'label': 'Company', 'data_type': 'relation',
            'config': {'target': {'kind': 'record', 'object_type': 'company'}}},
           {'object_type': 'deal', 'attr': 'amount', 'label': 'Amount', 'data_type': 'number'}])
    post(ctx, base + '/schema', {'declaration': declaration, 'expected_revision': current['revision']}, 'crm-declaration')
    schema = get(ctx, base + '/schema', 'crm-schema-persisted')
    for marker in ('People', 'Companies', 'Deals', 'Email', 'Company', 'northwind-sales', 'Customer activity'):
        contains(schema, marker, 'CRM schema objects/fields/relations/views')
    events = [('record.created', {'record_id': 'nw-company', 'object_type': 'company', 'values': {'name': 'Northwind Trading'}})]
    people = ['Avery Northwind', 'Morgan Northwind', 'Rowan Northwind', 'Taylor Northwind', 'Casey Northwind', 'Jordan Northwind']
    for i, name in enumerate(people):
        events.append(('record.created', {'record_id': 'nw-person-' + str(i), 'object_type': 'person',
                      'values': {'name': name, 'email': 'contact' + str(i) + '@northwind.example'}}))
        events.append(('activity.logged', {'activity_id': 'nw-activity-' + str(i), 'record_id': 'nw-person-' + str(i),
                       'activity_type': ['note', 'meeting', 'call'][i % 3], 'occurred_at': '2026-10-04T14:00:00Z',
                       'payload': {'title': ['Discuss regional delivery pilot', 'Confirm crate allocation', 'Review dispatch proposal'][i % 3],
                                   'text': ['Discuss regional delivery pilot', 'Confirm crate allocation', 'Review dispatch proposal'][i % 3]}}))
    for i, title in enumerate(['Nordic delivery pilot', 'Stockholm warehouse brief', 'Regional returns portal', 'Dispatch insights', 'Crate labeling review', 'Customer tracking rollout']):
        events.extend([('record.created', {'record_id': 'nw-deal-' + str(i), 'object_type': 'deal', 'values': {'name': title, 'amount': 12000 + i * 6500}}),
                       ('membership.set', {'record_id': 'nw-deal-' + str(i), 'object_type': 'deal', 'collection_id': 'northwind-sales',
                        'stage_id': ['discovery', 'proposal', 'won'][i % 3]})])
    apply(ctx, base, 'kickside.crm.events', events, 'crm-fixtures')
    ctx.inst.wait(lambda: (lambda value: value if len(value.get('data', {}).get('rows', [])) == 6 else None)(
            query(ctx, base, {'kind': 'records', 'object_type': 'person'}, 'crm-seeded-people')), 'CRM six contact projection', seconds=60)
    contains(get(ctx, '/api/v1/workspace/crm?crm_id=' + cid, 'crm-bootstrap-selected'), cid, 'Selected CRM bootstrap')
    contains(get(ctx, base, 'crm-component'), 'Northwind · Customer operations', 'CRM component read')
    panels = get(ctx, base + '/panels/person', 'crm-panels')
    require(panels.get('panels') is not None, 'CRM panel response lacks panels: ' + str(panels))
    browser = ctx.browser
    if browser is not None:
        require(not browser.pending, 'Previous scenario leaves pending browser requests: ' + str(browser.pending))
        error_offset = len(browser.errors)
        ctx.close_browser()
        browser.clean(error_offset)
    ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2, color_scheme='light').login()
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)


def crm_ui_open(ctx):
    from playwright.sync_api import expect
    Browser.release(ctx)
    ctx.inst.install('chestor/workspace')
    ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2, color_scheme='light').login()
    expect(ctx.browser.frame.locator('.sidebar').get_by_text('CRM', exact=True)).to_be_visible(timeout=30000)
    workspace_open(ctx, 'Northwind · Customer operations')
    surface = ctx.browser.frame.locator('kickside-crm-surface')
    surface.wait_for(timeout=30000)
    expect(surface).to_contain_text('Northwind · Customer operations', timeout=30000)
    return surface


def crm_ui(ctx):
    from playwright.sync_api import expect
    base = '/api/v1/workspace/crm/' + ctx.state['nw_crm']
    crm = crm_ui_open(ctx)
    crm.get_by_role('button', name=re.compile('^People')).click()
    expect(crm).to_contain_text('Avery Northwind', timeout=30000)
    capture(ctx, 'crm-populated-table')
    crm.get_by_role('button', name='New Person', exact=True).click()
    ctx.browser.frame.get_by_label('Name', exact=True).fill('Northwind UI Contact')
    ctx.browser.frame.get_by_label('Email', exact=True).fill('ui@northwind.example')
    ctx.browser.frame.get_by_role('button', name='Save', exact=True).click()
    expect(crm).to_contain_text('Northwind UI Contact', timeout=30000)
    rows = query(ctx, base, {'kind': 'records', 'object_type': 'person'}, 'ui-created-record')['data']['rows']
    rid = next(row['record_id'] for row in rows if 'Northwind UI Contact' in json.dumps(row))
    crm.get_by_role('button', name=re.compile('^People')).click()
    crm.get_by_role('button', name='Open Northwind UI Contact', exact=True).click()
    crm.get_by_role('button', name='Edit', exact=True).click()
    ctx.browser.frame.get_by_label('Name', exact=True).fill('Northwind UI Contact Updated')
    ctx.browser.frame.get_by_role('button', name='Save', exact=True).click()
    expect(crm).to_contain_text('Northwind UI Contact Updated', timeout=30000)
    contains(query(ctx, base, {'kind': 'record', 'record_id': rid}, 'ui-updated-record'), 'Northwind UI Contact Updated', 'CRM UI update')
    capture(ctx, 'crm-record-detail')
    crm.get_by_role('button', name='Delete', exact=True).click()
    ctx.browser.page.get_by_role('button', name='Delete', exact=True).click()
    expect(crm.get_by_text('Northwind UI Contact Updated', exact=True)).to_have_count(0, timeout=30000)
    require(query(ctx, base, {'kind': 'record', 'record_id': rid}, 'ui-deleted-record').get('data') is None, 'CRM UI deletion leaves record')


def crm_views(ctx):
    from playwright.sync_api import expect
    crm = crm_ui_open(ctx)
    crm.get_by_role('button', name=re.compile('^People')).click()
    crm.get_by_role('searchbox', name='Search and scope').fill('Avery Northwind')
    expect(crm).to_contain_text('Avery Northwind', timeout=30000)
    crm.get_by_role('button', name='Save view', exact=True).click()
    crm.get_by_label('View name', exact=True).fill('Northwind · Pilot contacts')
    with ctx.browser.page.expect_response(lambda response: response.url.endswith('/api/v1/profile')
                                         and response.request.method == 'PUT') as saved:
        crm.get_by_role('button', name='Save', exact=True).click()
    require(saved.value.status == 200, 'Saved view profile write fails: HTTP ' + str(saved.value.status))
    expect(crm).to_contain_text('Northwind · Pilot contacts', timeout=30000)
    ctx.browser.reload()
    crm = crm_ui_open(ctx)
    crm.get_by_role('button', name=re.compile('^People')).click()
    expect(crm).to_contain_text('Northwind · Pilot contacts', timeout=30000)
    ctx.browser.settle()
    crm.get_by_role('button', name=re.compile('^Deals')).click()
    crm.get_by_role('button', name='Board view', exact=True).click()
    for title in ('Discovery', 'Proposal', 'Nordic delivery pilot'):
        expect(crm).to_contain_text(title, timeout=30000)
    capture(ctx, 'crm-sales-board')
    capture(ctx, 'crm-sales-hero', dark=True)
    ctx.browser.page.emulate_media(color_scheme='light')
    crm.get_by_role('button', name=re.compile('^People')).click()
    crm.get_by_role('button', name='Timeline view', exact=True).click()
    expect(crm).to_contain_text('Discuss regional delivery pilot', timeout=30000)
    capture(ctx, 'crm-activity-timeline')


def crm_identity(ctx):
    base = '/api/v1/workspace/crm/' + ctx.state['nw_crm']
    body = {'object_type': 'person', 'match': {'alias_type': 'email', 'alias_value': 'identity@northwind.example'},
            'values': {'name': 'Northwind Identity Contact', 'email': 'identity@northwind.example'}}
    first = post(ctx, base + '/resolve', body, 'identity-create')
    second = post(ctx, base + '/resolve', body, 'identity-reuse')
    require(first['data']['record'].get('record_id') and first['data']['record']['record_id'] == second['data']['record'].get('record_id'), 'Identity resolution creates distinct records: ' + str([first, second]))
    contains(query(ctx, base, {'kind': 'record', 'record_id': first['data']['record']['record_id']}, 'identity-record'), 'Northwind Identity Contact', 'Resolved record')
    reference = {'kind': 'record', 'type': 'company', 'id': 'nw-company'}
    relation = {'record_id': 'nw-person-0', 'object_type': 'person', 'attr': 'company', 'reference': reference}
    apply(ctx, base, 'kickside.crm.events', [('relation.linked', relation)], 'relation-link')
    contains(query(ctx, base, {'kind': 'related', 'record_id': 'nw-person-0'}, 'relation-read'), 'nw-company', 'CRM relation target')
    apply(ctx, base, 'kickside.crm.events', [('relation.unlinked', relation)], 'relation-unlink')
    require('nw-company' not in json.dumps(query(ctx, base, {'kind': 'related', 'record_id': 'nw-person-0'}, 'unlinked-relations')),
            'Unlinked relation remains visible')


def crm_references(ctx):
    base = '/api/v1/workspace/crm/' + ctx.state['nw_crm']
    edge = {'from_ref': 'crm:person:nw-person-0', 'edge_type': 'company_context', 'to_ref': 'crm:company:nw-company'}
    apply(ctx, base, 'kickside.crm.events', [('reference.linked', edge)], 'reference-link')
    contains(query(ctx, base, {'kind': 'references', 'from_ref': edge['from_ref'], 'include_inactive': False}, 'reference-read'),
             'crm:company:nw-company', 'Generalized CRM reference')
    apply(ctx, base, 'kickside.crm.events', [('reference.unlinked', edge)], 'reference-unlink')
    require('crm:company:nw-company' not in json.dumps(query(ctx, base, {'kind': 'references', 'from_ref': edge['from_ref'],
            'include_inactive': False}, 'reference-unlinked-read')),
            'Unlinked generalized reference remains active')


def crm_merge(ctx):
    base = '/api/v1/workspace/crm/' + ctx.state['nw_crm']
    apply(ctx, base, 'kickside.crm.events', [('record.created', {'record_id': 'nw-duplicate', 'object_type': 'person',
          'values': {'name': 'Avery Northwind duplicate'}}), ('merge.suggested', {'left_id': 'nw-person-0',
          'right_id': 'nw-duplicate', 'object_type': 'person', 'confidence': 1, 'reason': 'Fictional duplicate for Northwind review'})], 'merge-suggestion')
    contains(query(ctx, base, {'kind': 'merge_reviews', 'status': 'all'}, 'merge-review-pending'), 'nw-duplicate', 'Pending merge review')
    crm = crm_ui_open(ctx)
    crm.get_by_role('button', name=re.compile(r'^Needs review(?:\s*\d+)?$')).click()
    crm.get_by_text('Avery Northwind duplicate', exact=False).first.wait_for(timeout=30000)
    capture(ctx, 'crm-merge-review')
    apply(ctx, base, 'kickside.crm.events', [('merge.decided', {'left_id': 'nw-person-0', 'right_id': 'nw-duplicate',
          'object_type': 'person', 'decision': 'merged', 'resolution_id': 'nw-merge-decision',
          'winner_id': 'nw-person-0', 'loser_id': 'nw-duplicate'})], 'merge-decision')
    rows = query(ctx, base, {'kind': 'records', 'object_type': 'person'}, 'merge-records')['data']['rows']
    require(any(row['record_id'] == 'nw-person-0' for row in rows) and not any(row['record_id'] == 'nw-duplicate' for row in rows),
            'Merge does not preserve winner and remove loser')
    contains(query(ctx, base, {'kind': 'merge_reviews', 'status': 'all'}, 'merge-review-decided'), 'nw-merge-decision', 'Persisted merge decision')


def crm_config(ctx):
    base = '/api/v1/workspace/crm/' + ctx.state['nw_crm']
    exported = get(ctx, base + '/config/export', 'crm-export')['config']
    require(exported['kind'] == 'CRMConfig' and exported['metadata'].get('sourceHash'), 'Export lacks portable artifact/hash')
    contains(exported, 'Email', 'Portable CRM schema')
    result = post(ctx, base + '/config/import', {'artifact': exported, 'expected_revision': get(ctx, base + '/schema', 'crm-import-revision')['revision']}, 'crm-import')
    require(result.get('success'), 'CRM config import fails')
    after = get(ctx, base + '/config/export', 'crm-export-after-import')['config']
    require(after['metadata']['sourceHash'] == exported['metadata']['sourceHash'], 'Unchanged import alters source hash')


def crm_settings(ctx):
    from playwright.sync_api import expect
    email = 'crm-admin-' + uuid.uuid4().hex[:8] + '@northwind.example'
    member = ctx.inst.request('POST', '/api/v1/users', {'email': email, 'password': ctx.inst.password,
                              'full_name': 'Northwind CRM administrator',
                              'groups': ['app.security:members', 'app.security:admin']},
                              expect=(201,), label='crm-settings-admin')['user']
    path = '/api/v1/component-access/share/' + ctx.state['nw_crm']
    subject = {'subject_id': member['user_id'], 'subject_type': 'user'}
    post(ctx, path, {**subject, 'access_mask': 3}, 'crm-settings-grant')
    try:
        token = ctx.inst.request('POST', '/api/public/user/token', {'email': email, 'password': ctx.inst.password})['token']
        ctx.inst.redactor.add(token)
        selected = ctx.inst.request('GET', '/api/v1/workspace/crm', auth=token, label='crm-settings-bootstrap')
        require(selected.get('crm_id') == ctx.state['nw_crm'], 'Settings actor does not resolve the granted CRM: ' + str(selected))
        success(ctx.inst.request('POST', '/api/v1/ui/splash/welcome/seen', {}, auth=token,
                                 label='crm-settings-welcome'), 'Settings actor welcome completion')
        agent = ctx.inst.request('POST', '/api/v1/user-agents',
                                {'title': 'Northwind CRM settings assistant', 'model': ctx.state['model']},
                                auth=token, label='crm-settings-agent')
        require(agent.get('component_id'), 'Settings actor agent provisioning fails: ' + str(agent))
        with ctx.browser.presentation():
            ctx.browser.login(email, ctx.inst.password)
            nav(ctx, 'System')
            ctx.browser.frame.get_by_role('tab', name='CRM', exact=True).click()
            settings = ctx.browser.frame.locator('kickside-crm-settings')
            expect(settings).to_contain_text('Data model', timeout=30000)
            settings.locator('.crm-settings-objects').get_by_role('button', name=re.compile('People')).click()
            for marker in ('Email', 'Company', 'relation', 'text'):
                expect(settings).to_contain_text(marker, timeout=30000)
            capture(ctx, 'crm-schema-objects-fields-relations')
    finally:
        post(ctx, path, {**subject, 'action': 'revoke'}, 'crm-settings-revoke')


def crm_tools(ctx):
    ctx.inst.install('kickside/mcp')
    cid = ctx.state['nw_crm']
    base = '/api/v1/workspace/crm/' + cid
    names = ['create_record', 'update_record', 'list_records', 'get_record', 'get_board', 'get_timeline', 'resolve_record',
             'set_membership', 'log_activity', 'delete_activity', 'link_reference', 'unlink_reference']
    def run(call):
        def crm_call(name, body):
            return call(name, {'crm_id': cid, **body})
        crm_call('CRMCreateRecord', {'object_type': 'person', 'record_id': 'nw-mcp-person', 'values': {'name': 'Northwind MCP Contact'}})
        crm_call('CRMUpdateRecord', {'object_type': 'person', 'record_id': 'nw-mcp-person', 'set': {'email': 'agent@northwind.example'}})
        contains(crm_call('CRMGetRecord', {'record_id': 'nw-mcp-person'}), 'agent@northwind.example', 'MCP updated record')
        contains(crm_call('CRMListRecords', {'object_type': 'person'}), 'Northwind MCP Contact', 'MCP list records')
        reference = {'kind': 'record', 'type': 'company', 'id': 'nw-company'}
        linked = {'object_type': 'person', 'record_id': 'nw-mcp-person', 'attr': 'company', 'reference': reference}
        crm_call('CRMLinkReference', linked)
        contains(query(ctx, base, {'kind': 'related', 'record_id': 'nw-mcp-person'}, 'mcp-linked-read'), 'nw-company', 'MCP linked reference')
        crm_call('CRMUnlinkReference', linked)
        require('nw-company' not in json.dumps(query(ctx, base, {'kind': 'related', 'record_id': 'nw-mcp-person'}, 'mcp-unlinked-read')), 'MCP unlink leaves relation')
        crm_call('CRMSetMembership', {'collection_id': 'northwind-sales', 'record_id': 'nw-deal-0', 'stage_id': 'proposal', 'from_stage_id': 'discovery'})
        board = crm_call('CRMGetBoard', {'collection_id': 'northwind-sales'})
        require(any(row['record_id'] == 'nw-deal-0' for row in board['board']['proposal']['records']),
                'MCP board omits the moved Northwind deal from Proposal: ' + str(board))
        crm_call('CRMLogActivity', {'activity': {'activity_id': 'nw-mcp-note', 'record_id': 'nw-mcp-person',
                 'activity_type': 'note', 'payload': {'text': 'Northwind agent follow-up'}}})
        contains(crm_call('CRMGetTimeline', {'record_id': 'nw-mcp-person', 'fields': ['payload']}), 'Northwind agent follow-up', 'MCP activity')
        crm_call('CRMDeleteActivity', {'activity_id': 'nw-mcp-note'})
        require('Northwind agent follow-up' not in json.dumps(crm_call('CRMGetTimeline', {'record_id': 'nw-mcp-person', 'fields': ['payload']})), 'MCP activity deletion leaves note')
        resolved = crm_call('CRMResolveRecord', {'object_type': 'person', 'match': {'alias_type': 'email', 'alias_value': 'mcp-identity@northwind.example'},
                            'values': {'name': 'Northwind MCP Identity'}})
        contains(resolved, 'record_id', 'MCP identity result')
    mcp(ctx, ['kickside.crm.traits:' + name for name in names], [cid], run)


def crm_schema_tools(ctx):
    ctx.inst.install('kickside/mcp')
    cid = ctx.state['nw_crm']
    def run(call):
        artifact = call('CRMSchemaGet', {'crm_id': cid})['schema']
        contains(artifact, 'Customer contacts', 'MCP exported schema')
        call('CRMSchemaApply', {'crm_id': cid, 'artifact': artifact})
        contains(get(ctx, '/api/v1/workspace/crm/' + cid + '/schema', 'mcp-schema-applied'),
                 'Customer contacts', 'MCP schema persisted')
    mcp(ctx, ['kickside.crm.traits:schema.get', 'kickside.crm.traits:schema.apply'], [cid], run)


def crm_destination(ctx, label):
    created = ctx.inst.request('POST', '/api/v1/workspace/crm', {'title': 'Northwind · ' + label, 'idempotency_key': uid()},
                               expect=(201,), label='sink-crm-create')
    base = '/api/v1/workspace/crm/' + created['component_id']
    current = get(ctx, base + '/schema', 'sink-schema')
    post(ctx, base + '/schema', {'expected_revision': current['revision'], 'declaration': {'version': 'northwind-sync',
         'objects': [{'type': 'person', 'label': 'People'}], 'attributes': [{'object_type': 'person', 'attr': 'name', 'label': 'Name', 'data_type': 'text'}],
         'pipelines': [], 'views': [], 'merge_config': {'objects': {}}}}, 'sink-schema-apply')
    return created['component_id'], base


def sync_trigger(ctx, source, thread_id, destination, marker, scope='instance'):
    result = post(ctx, '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': {'title': 'Northwind · ' + marker,
             'enabled': True, 'trigger': {'v': 2, 'source': source, 'backfill': 'none', 'config': {'thread_id': thread_id}},
             'sink_port': 'kickside.crm.sink:crm_records', 'sink_config': {'crm_id': destination},
             'transform': {'kind': 'expr', 'expr': json.dumps({'kind': 'record', 'object_type': 'person',
                            'record_id': 'receipt-' + marker, 'values': {'name': 'Northwind ' + marker}})}}}, 'trigger-install-' + marker)
    require(result.get('id'), 'Sync trigger returns no automation id: ' + str(result))
    aid = result['id']
    ctx.inst.cleanup.add('Northwind sync ' + marker, lambda: ctx.inst.request('DELETE', '/api/v1/automations/' + aid, label='sync-cleanup-' + marker), scope=scope)
    return aid


def delivered(ctx, base, marker):
    return ctx.inst.wait(lambda: (lambda result: result if ('Northwind ' + marker) in json.dumps(result) else None)(
           query(ctx, base, {'kind': 'records', 'object_type': 'person'}, 'sink-delivery-' + marker)),
           'Trigger ' + marker + ' reaches CRM sink', seconds=60)


def crm_sync(ctx):
    ctx.inst.install('kickside/sync')
    cid, destination = crm_destination(ctx, 'Event delivery receipts')
    source = ctx.state['nw_crm']
    aid = sync_trigger(ctx, 'kickside.crm.ports:record_created', source, cid, 'record-created')
    apply(ctx, '/api/v1/workspace/crm/' + source, 'kickside.crm.events', [('record.created', {
          'record_id': 'nw-sync-source', 'object_type': 'person', 'values': {'name': 'Northwind Sync Source'}})], 'sync-source-record')
    delivered(ctx, destination, 'record-created')
    status = get(ctx, '/api/v1/automations/' + aid + '/status', 'sync-status')
    require(status.get('success'), 'Sync status reports failed delivery')


def research_run(ctx):
    from playwright.sync_api import expect
    nav(ctx, 'Research')
    prompt = ('Analyze only fictional Northwind facts: 47 shipping crates and 12 reserve crates. '
              'First call ReportProgress with step="Northwind crate analysis". Then produce a report with '
              'the total 59, a delivery checklist, and missing information. Do not search the web. Include the exact fictional tracking marker NORTHWIND-RESEARCH-COVERAGE as a key point in the final structured report.')
    ctx.browser.frame.get_by_placeholder(re.compile('What should the agent research')).fill(prompt)
    with ctx.browser.page.expect_response(lambda response: '/api/v1/research' in response.url and response.request.method == 'POST') as response:
        ctx.browser.frame.locator('research-app').get_by_role('button', name='Research', exact=True).click()
    created = response.value.json()
    require(created.get('research_id'), 'Research UI creates no durable research run: ' + str(created))
    rid = created['research_id']
    def completed():
        result = get(ctx, '/api/v1/research/' + rid + '/events', 'research-progress-events')
        require(result['run'].get('status') != 'failed', 'Gemma research fails: ' + str(result))
        return result if result['run'].get('status') == 'complete' else None
    detail = ctx.inst.wait(completed, 'Gemma research completes', seconds=180, pump=ctx.browser.page.wait_for_timeout)
    results = [event for event in detail['events'] if event['type'] == 'kickside.research.events:result']
    require(results and 'NORTHWIND-RESEARCH-COVERAGE' in json.dumps(results) and '59' in json.dumps(results),
            'Research terminal report lacks marker or arithmetic: ' + str(detail))
    require(any(event['type'] == 'kickside.research.events:progress' and 'Northwind crate analysis' in json.dumps(event)
                for event in detail['events']), 'Research has no persisted ReportProgress tool update: ' + str(detail))
    contains(get(ctx, '/api/v1/research/list', 'research-list'), rid, 'Research run listing')
    expect(ctx.browser.frame.locator('research-app')).to_contain_text('Complete', timeout=30000)
    capture(ctx, 'research-gemma-complete')
    capture(ctx, 'research-gemma-hero', dark=True)
    ctx.browser.page.emulate_media(color_scheme='light')


def research_tool(ctx):
    def run(call):
        result = call('DeepResearch', {'prompt': 'Use only fictional Northwind facts: 47 crates and 12 reserve crates. '
                     'Call ReportProgress first with step Northwind research MCP. Give total 59 and include exact marker NORTHWIND-MCP-RESEARCH as a key point in the final structured report.',
                     'agent_id': 'kickside.research.agents:researcher'})
        require(result.get('success') and result.get('status') == 'complete', 'DeepResearch does not complete: ' + str(result))
        contains(result, 'NORTHWIND-MCP-RESEARCH', 'MCP research report')
        contains(get(ctx, '/api/v1/research/' + result['research_id'] + '/events', 'mcp-research-events'), 'NORTHWIND-MCP-RESEARCH', 'Persisted MCP research')
    mcp(ctx, ['kickside.research.traits:deep_research'], [], run)


def research_agent(ctx):
    trait = 'kickside.research.traits:deep_researcher'
    created = post(ctx, '/api/v1/user-agents', {'title': 'Northwind Research assistant', 'model': ctx.state['model'],
                   'prompt': 'Use DeepResearch exactly once. The user supplies a JSON tool argument object. '
                             'Pass its prompt string verbatim, including the tracking marker and reporting instructions. '
                             'Summarize the actual returned report; retain its total and tracking marker.',
                   'traits': [trait]}, 'research-agent-create')
    agent = get(ctx, '/api/v1/user-agents/' + created['component_id'], 'research-agent-read')['agent']
    require(trait in agent['traits'], 'Research agent lacks the persisted Deep Researcher capability')
    before = {row['session_id'] for row in get(ctx, '/api/v1/sessions?limit=100', 'before-research-agent')['sessions']}
    nav(ctx, 'New chat')
    ctx.browser.frame.get_by_role('button', name='Select Agent', exact=True).click()
    ctx.browser.frame.get_by_role('menuitem', name='Northwind Research assistant', exact=True).click()
    arguments = {'prompt': 'Analyze only fictional Northwind 47 shipping crates plus 12 reserve crates. '
                 'Do not search externally. First call ReportProgress with step Northwind agent analysis. '
                 'Include total 59 and exact marker NORTHWIND-RESEARCH-AGENT in a key point of the final structured report.'}
    ctx.browser.frame.get_by_label('Message', exact=True).fill(
        'Call DeepResearch exactly once using this complete JSON argument object verbatim:\n' +
        json.dumps(arguments) + '\nThen summarize the returned report and include its marker.')
    ctx.browser.frame.get_by_role('button', name='Start Chat', exact=True).click()
    def replied():
        sessions = get(ctx, '/api/v1/sessions?limit=100', 'research-agent-sessions')['sessions']
        fresh = [row for row in sessions if row['session_id'] not in before]
        require(len(fresh) <= 1, 'Research agent starts multiple sessions')
        if not fresh:
            return None
        messages = get(ctx, '/api/v1/sessions/messages?session_id=' + fresh[0]['session_id'], 'research-agent-messages')['messages']
        return messages if any(row['type'] == 'assistant' and 'NORTHWIND-RESEARCH-AGENT' in json.dumps(row.get('data'))
                               for row in messages) else None
    messages = ctx.inst.wait(replied, 'Gemma Deep Researcher agent response', seconds=180, pump=ctx.browser.page.wait_for_timeout)
    receipts = [row['metadata'] for row in messages if row['type'] == 'function'
                and row['metadata'].get('function_name') == 'DeepResearch' and row['metadata'].get('status') == 'success']
    require(len(receipts) == 1, 'Research agent lacks exactly one successful DeepResearch receipt')
    contains(receipts[0]['result'], 'NORTHWIND-RESEARCH-AGENT', 'Research agent tool report')
    contains(get(ctx, '/api/v1/research/' + receipts[0]['result']['research_id'] + '/events', 'research-agent-run'),
             'NORTHWIND-RESEARCH-AGENT', 'Research agent durable research report')
    contains([row['data'] for row in messages if row['type'] == 'assistant'], '59', 'Research agent grounded crate total')
    capture(ctx, 'research-gemma-agent')


def research_workflow(ctx):
    ctx.inst.install('kickside/workflows')
    wid = post(ctx, '/api/v1/workflows', {'title': 'Northwind · Research delivery workflow'}, 'research-flow')['flow_id']
    base = '/api/v1/workflows/' + wid
    schema = {'type': 'object', 'additionalProperties': True}
    commands = [{'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'config': {'input_schema': schema}}},
                {'type': 'node.add', 'body': {'id': 'research', 'kind': 'block', 'ref': 'kickside.research:block.research', 'config': {
                    'agent_id': 'kickside.research.agents:researcher', 'prompt': 'Analyze fictional Northwind 47 crates plus 12 reserve crates. '
                    'Do not search externally. Call ReportProgress first. Total is 59. Include exact marker NORTHWIND-WORKFLOW-RESEARCH as a key point in the final structured report.'}}},
                {'type': 'node.add', 'body': {'id': 'finish', 'kind': 'finish', 'config': {'output_schema': schema}}},
                {'type': 'edge.add', 'body': {'id': 'start-research', 'source_id': 'start', 'target_id': 'research', 'source_port': 'out', 'target_port': 'in'}},
                {'type': 'edge.add', 'body': {'id': 'research-finish', 'source_id': 'research', 'target_id': 'finish', 'source_port': 'result', 'target_port': 'in'}}]
    post(ctx, base + '/apply', {'commands': commands}, 'research-flow-graph')
    version = post(ctx, base + '/publish', {}, 'research-flow-version')['version']
    run = post(ctx, base + '/run', {'version': version, 'input': {}}, 'research-flow-run')
    def completed():
        value = get(ctx, base + '/runs/' + run['run_id'], 'research-flow-status')
        require(value['run']['status'] != 'failed', 'Research workflow fails: ' + str(value))
        return value if value['run']['status'] == 'completed' else None
    detail = ctx.inst.wait(completed, 'Research Block delivers result to Finish', seconds=180)
    output = detail['run']['output']['result']
    require(output.get('outcome') == 'result' and output.get('research_id') and output.get('result_ref'),
            'Research Block output lacks durable result reference: ' + str(detail))
    contains(get(ctx, '/api/v1/research/' + output['research_id'] + '/events', 'research-flow-result'),
             'NORTHWIND-WORKFLOW-RESEARCH', 'Workflow research terminal report')


def roadmap_trigger(ctx, port, event, body):
    entry = ctx.state['nw_roadmap_root']
    cid, destination = crm_destination(ctx, 'Roadmap ' + port + ' receipts')
    sync_trigger(ctx, 'chestor.roadmap.ports:' + port, entry['id'], cid, port)
    apply(ctx, '/api/v1/workspace/roadmaps/' + entry['id'], 'chestor.roadmap.events', [(event, body)], 'roadmap-trigger-' + port)
    delivered(ctx, destination, port)


W = 'chestor/workspace'
G = 'chestor/graph'
J = 'chestor/journal'
R = 'chestor/roadmap'
D = 'chestor/db-schema'
C = 'kickside/crm'
Q = 'kickside/research'
BASE = ('northwind_setup',)
REGISTRY = [Scenario('northwind_setup', 'full', setup, ('first_agent',), issues=('SMOKE-WORKSPACE-MEMBER-LOGIN-ERROR',), instance_setup=True),
    Scenario('northwind_workspace_tree', 'full', workspace_tree, BASE, features=
        features(W, 'http', 'GET /api/v1/workspace/entries/types', 'GET /api/v1/workspace/entries',
                 'GET /api/v1/workspace/entries/{id}', 'GET /api/v1/workspace/entries/{id}/breadcrumbs',
                 'POST /api/v1/workspace/entries', 'PUT /api/v1/workspace/entries/{id}',
                 'POST /api/v1/workspace/entries/{id}/move', 'DELETE /api/v1/workspace/entries/{id}') +
        features(W, 'navigation', 'chestor.workspace:nav_item') + features(W, 'workspace_kind', 'chestor.workspace:folder')),
    Scenario('northwind_workspace_share', 'full', workspace_share, BASE, features=
        features(W, 'http', 'POST /api/v1/workspace/entries/{id}/grant', 'POST /api/v1/workspace/entries/{id}/revoke',
                 'GET /api/v1/workspace/entries/{id}', 'PUT /api/v1/workspace/entries/{id}')),
    Scenario('northwind_workspace_tools', 'full', workspace_tools, BASE, features=
        features(W, 'mcp_tool', *['chestor.workspace.traits:' + name for name in ('create_entry_tool', 'get_entry_tool',
                'list_entries_tool', 'list_entry_types_tool', 'update_entry_tool', 'delete_entry_tool')]) +
        features(W, 'workspace_kind', 'chestor.workspace:folder') + features(W, 'capability', 'chestor.workspace.traits:workspace_model'))]

for placement in ('root', 'folder'):
    REGISTRY.extend([
        Scenario('northwind_graph_' + placement, 'full', lambda ctx, p=placement: graph(ctx, p), BASE, issues=('R3-T08',), features=
            features(G, 'http', *['GET /api/v1/workspace/graphs/{id}' + suffix for suffix in ('', '/nodes', '/edges', '/materials', '/schema')],
                     'POST /api/v1/workspace/graphs/{id}/apply', 'POST /api/v1/workspace/graphs/{id}/undo', 'POST /api/v1/workspace/graphs/{id}/redo') +
            features(G, 'workspace_kind', 'chestor.graph:graph_kind')),
        Scenario('northwind_graph_tools_' + placement, 'full', lambda ctx, p=placement: graph_tools(ctx, p), ('northwind_graph_' + placement,), issues=('CHESTOR-PUBLISHED-MUTATION-RESULT-SHAPE',), features=
            features(G, 'mcp_tool', 'chestor.graph.traits:get_graph_tool', 'chestor.graph.traits:apply_graph_tool') + features(G, 'capability', 'chestor.graph.traits:graph_model')),
        Scenario('northwind_roadmap_' + placement, 'full', lambda ctx, p=placement: roadmap(ctx, p), BASE, features=
            features(R, 'http', *['GET /api/v1/workspace/roadmaps/{id}' + suffix for suffix in ('', '/initiatives', '/dependencies', '/critical', '/schema')],
                     'POST /api/v1/workspace/roadmaps/{id}/apply', 'POST /api/v1/workspace/roadmaps/{id}/undo', 'POST /api/v1/workspace/roadmaps/{id}/redo') +
            features(R, 'workspace_kind', 'chestor.roadmap:roadmap_kind')),
        Scenario('northwind_roadmap_tools_' + placement, 'full', lambda ctx, p=placement: roadmap_tools(ctx, p), ('northwind_roadmap_' + placement,), issues=('CHESTOR-PUBLISHED-MUTATION-RESULT-SHAPE',), features=
            features(R, 'mcp_tool', *['chestor.roadmap.traits:' + name for name in ('get_roadmap_tool', 'query_roadmap_tool', 'apply_roadmap_tool')]) + features(R, 'capability', 'chestor.roadmap.traits:roadmap_model')),
        Scenario('northwind_database_' + placement, 'full', lambda ctx, p=placement: database(ctx, p), BASE, features=
            features(D, 'http', *['GET /api/v1/workspace/db-schema/{id}' + suffix for suffix in ('', '/tables', '/relations', '/indexes')],
                     'POST /api/v1/workspace/db-schema/{id}/apply') + features(D, 'workspace_kind', 'chestor.db_schema:database')),
        Scenario('northwind_database_tools_' + placement, 'full', lambda ctx, p=placement: database_tools(ctx, p), ('northwind_database_' + placement,), issues=('CHESTOR-PUBLISHED-MUTATION-RESULT-SHAPE',), features=
            features(D, 'mcp_tool', 'chestor.db_schema.traits:get_schema_tool', 'chestor.db_schema.traits:edit_schema_tool') + features(D, 'capability', 'chestor.db_schema.traits:schema_model')),
        Scenario('northwind_journal_' + placement, 'full', lambda ctx, p=placement: journal(ctx, p), BASE, features=
            features(J, 'http', *['GET /api/v1/workspace/journals/{id}' + suffix for suffix in ('', '/events', '/events/{event_id}', '/tree',
                     '/branch', '/frontier', '/context_pack', '/updates', '/changes', '/spans', '/activity', '/cursors', '/health', '/graphs',
                     '/graphs/{graph_id}', '/events/{event_id}/graphs', '/graphs/{graph_id}/assemble')],
                     *['POST /api/v1/workspace/journals/{id}' + suffix for suffix in ('/apply', '/events', '/tasks', '/search_text',
                       '/checkpoints', '/artifacts', '/focus', '/graphs/{graph_id}/ops', '/graphs/{graph_id}/assemble')],
                     'PUT /api/v1/workspace/journals/{id}/digest', 'PUT /api/v1/workspace/journals/{id}/graphs/{graph_id}/config') +
            features(J, 'workspace_kind', 'chestor.journal:journal_kind')),
        Scenario('northwind_journal_embeddings_' + placement, 'full', lambda ctx, p=placement: journal_embeddings(ctx, p),
                 ('northwind_journal_' + placement,), model=True, features=features(J, 'http', 'POST /api/v1/workspace/journals/{id}/search')),
        Scenario('northwind_journal_tools_' + placement, 'full', lambda ctx, p=placement: journal_tools(ctx, p), ('northwind_journal_' + placement,), features=
            features(J, 'mcp_tool', *['chestor.journal.traits:' + name for name in ('journal_context', 'journal_query', 'journal_fact',
                     'journal_graph', 'read_journal', 'act_journal')]) + features(J, 'http', 'POST /api/v1/workspace/journals/{id}/tasks/{task_id}/transition') + features(J, 'capability', 'chestor.journal.traits:journal_trait', 'chestor.journal.traits:journal_work_trait'))])

REGISTRY.extend([
    Scenario('northwind_crm_setup', 'full', crm_setup, ('crm_record',), features=features(C, 'http', 'POST /api/v1/workspace/crm',
             'GET /api/v1/workspace/crm', 'GET /api/v1/workspace/crm/{id}', 'GET /api/v1/workspace/crm/{id}/schema',
             'POST /api/v1/workspace/crm/{id}/schema', 'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query',
             'GET /api/v1/workspace/crm/{id}/panels/{object_type}') + features(C, 'workspace_kind', 'kickside.crm.binding:crm')),
    Scenario('northwind_crm_ui', 'full', crm_ui, ('northwind_crm_setup',), features=features(C, 'http',
             'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query') + features(C, 'navigation', 'kickside.crm.surface:nav_item')),
    Scenario('northwind_crm_views', 'full', crm_views, ('northwind_crm_setup',), features=features(C, 'http',
             'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query') + features(C, 'navigation', 'kickside.crm.surface:nav_item')),
    Scenario('northwind_crm_identity', 'full', crm_identity, ('northwind_crm_setup',), features=features(C, 'http',
             'POST /api/v1/workspace/crm/{id}/resolve', 'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query')),
    Scenario('northwind_crm_references', 'full', crm_references, ('northwind_crm_setup',), features=features(C, 'http',
             'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query')),
    Scenario('northwind_crm_merge', 'full', crm_merge, ('northwind_crm_setup',), features=features(C, 'http',
             'POST /api/v1/workspace/crm/{id}/apply', 'POST /api/v1/workspace/crm/{id}/query')),
    Scenario('northwind_crm_config', 'full', crm_config, ('northwind_crm_setup',), features=features(C, 'http',
             'GET /api/v1/workspace/crm/{id}/config/export', 'POST /api/v1/workspace/crm/{id}/config/import')),
    Scenario('northwind_crm_settings', 'full', crm_settings, ('northwind_crm_setup',),
             features=features(C, 'navigation', 'kickside.crm.surface:settings_tab')),
    Scenario('northwind_crm_tools', 'full', crm_tools, ('northwind_crm_setup',), issues=('CRM-PUBLISHED-TOOL-RESULT-SHAPE',), features=features(C, 'mcp_tool', *['kickside.crm.traits:' + name
             for name in ('create_record', 'update_record', 'list_records', 'get_record', 'get_board', 'get_timeline', 'resolve_record',
                          'set_membership', 'log_activity', 'delete_activity', 'link_reference', 'unlink_reference')])),
    Scenario('northwind_crm_schema_tools', 'full', crm_schema_tools, ('northwind_crm_setup',),
             issues=('CRM-PUBLISHED-TOOL-RESULT-SHAPE',), features=features(C, 'mcp_tool', 'kickside.crm.traits:schema.get', 'kickside.crm.traits:schema.apply')),
    Scenario('northwind_crm_sync', 'full', crm_sync, ('northwind_crm_setup',), features=features(C, 'sink', 'kickside.crm.sink:crm_records') +
             features(C, 'workspace_kind', 'kickside.crm.sink:crm_sink') + features(C, 'trigger', 'kickside.crm.ports:record_created')),
    Scenario('northwind_research_ui', 'full', research_run, BASE, model=True, features=features(Q, 'http', 'POST /api/v1/research',
             'GET /api/v1/research/{id}/events', 'GET /api/v1/research/list') + features(Q, 'mcp_tool', 'kickside.research:report_progress') +
             features(Q, 'navigation', 'kickside.research:nav_item') + features(Q, 'workspace_kind', 'kickside.research:research_kind')),
    Scenario('northwind_research_tool', 'full', research_tool, BASE, model=True, features=features(Q, 'mcp_tool', 'kickside.research.traits:deep_research')),
    Scenario('northwind_research_agent', 'full', research_agent, BASE, model=True,
             features=features(Q, 'capability', 'kickside.research.traits:deep_researcher')),
    Scenario('northwind_research_workflow', 'full', research_workflow, BASE, model=True, features=features(Q, 'workflow_block', 'kickside.research:block.research'), instance_setup=True)])

for port, event, body in [
    ('initiative_added', 'initiative.added', {'id': 'trigger-item', 'title': 'Northwind event initiative', 'layer_id': 'lane-0', 'status': 'planned'}),
    ('initiative_updated', 'initiative.updated', {'id': 'item-2', 'title': 'Northwind event customer tracking'}),
    ('dependency_added', 'dependency.added', {'id': 'trigger-dependency', 'from_id': 'item-2', 'to_id': 'item-3', 'kind': 'informs'}),
    ('milestone_added', 'milestone.added', {'id': 'trigger-milestone', 'title': 'Northwind event milestone', 'period': '2027-Q2', 'layer_id': 'lane-1'}),
    ('initiative_removed', 'initiative.removed', {'id': 'item-5'})]:
    REGISTRY.append(Scenario('northwind_roadmap_trigger_' + port, 'full', lambda ctx, p=port, e=event, b=body: roadmap_trigger(ctx, p, e, b),
                    ('northwind_roadmap_root',), features=features(R, 'trigger', 'chestor.roadmap.ports:' + port)))


def crm_trigger(ctx, port, event):
    ctx.inst.install('kickside/sync')
    source = ctx.state['nw_crm']
    base = '/api/v1/workspace/crm/' + source
    rid = 'northwind-trigger-' + port
    company = rid + '-company'
    loser = rid + '-duplicate'
    seeds = [('record.created', {'record_id': rid, 'object_type': 'person', 'values': {'name': 'Northwind trigger contact ' + port}}),
             ('record.created', {'record_id': company, 'object_type': 'company', 'values': {'name': 'Northwind trigger company'}})]
    reference = {'kind': 'record', 'type': 'company', 'id': company}
    body = {'record_id': rid, 'object_type': 'person'}
    if port == 'record_updated':
        body['set'] = {'name': 'Northwind trigger updated'}
    elif port.startswith('relation_'):
        body.update(attr='company', reference=reference)
        if port.endswith('unlinked'):
            seeds.append((event.replace('unlinked', 'linked'), body.copy()))
    elif port.startswith('reference_'):
        body = {'from_ref': 'crm:person:' + rid, 'edge_type': 'company_context', 'to_ref': 'crm:company:' + company}
        if port.endswith('unlinked'):
            seeds.append(('reference.linked', body.copy()))
    elif port.startswith('membership_'):
        seeds.append(('record.created', {'record_id': rid + '-deal', 'object_type': 'deal', 'values': {'name': 'Northwind trigger deal'}}))
        body.update(record_id=rid + '-deal', object_type='deal', collection_id='northwind-sales')
        if port == 'membership_set':
            body['stage_id'] = 'proposal'
        else:
            seeds.append(('membership.set', {**body, 'stage_id': 'discovery'}))
    elif port == 'activity_logged':
        body = {'activity_id': rid + '-activity', 'record_id': rid, 'activity_type': 'note',
                'payload': {'text': 'Northwind trigger activity'}}
    elif port.startswith('merge_'):
        seeds.append(('record.created', {'record_id': loser, 'object_type': 'person', 'values': {'name': 'Northwind trigger duplicate'}}))
        body = {'left_id': rid, 'right_id': loser, 'object_type': 'person', 'confidence': 1, 'reason': 'Northwind fictional review'}
        if port == 'merge_decided':
            seeds.append(('merge.suggested', body.copy()))
            body.update(decision='do_not_merge', resolution_id=rid + '-decision')
    apply(ctx, base, 'kickside.crm.events', seeds, 'trigger-source-fixtures')
    cid, destination = crm_destination(ctx, 'CRM ' + port + ' receipts')
    sync_trigger(ctx, 'kickside.crm.ports:' + port, source, cid, port)
    apply(ctx, base, 'kickside.crm.events', [(event, body)], 'crm-trigger-' + port)
    delivered(ctx, destination, port)


for port, event in [('record_updated', 'record.updated'), ('record_deleted', 'record.deleted'),
                    ('activity_logged', 'activity.logged'), ('membership_set', 'membership.set'),
                    ('membership_removed', 'membership.removed'), ('merge_suggested', 'merge.suggested'),
                    ('merge_decided', 'merge.decided'), ('relation_linked', 'relation.linked'),
                    ('relation_unlinked', 'relation.unlinked'), ('reference_linked', 'reference.linked'),
                    ('reference_unlinked', 'reference.unlinked')]:
    REGISTRY.append(Scenario('northwind_crm_trigger_' + port, 'full', lambda ctx, p=port, e=event: crm_trigger(ctx, p, e),
                    ('northwind_crm_setup',), features=features(C, 'trigger', 'kickside.crm.ports:' + port)))


def crm_blocks(ctx, review=False):
    ctx.inst.install('kickside/workflows')
    cid = ctx.state['nw_crm']
    base = '/api/v1/workspace/crm/' + cid
    if review:
        apply(ctx, base, 'kickside.crm.events', [('record.created', {'record_id': 'nw-block-left', 'object_type': 'person',
              'values': {'name': 'Northwind review left'}}), ('record.created', {'record_id': 'nw-block-right', 'object_type': 'person',
              'values': {'name': 'Northwind review right'}})], 'block-review-records')
    def create_flow(name, ref, config, port):
        wid = post(ctx, '/api/v1/workflows', {'title': 'Northwind · ' + name}, name + '-create')['flow_id']
        path = '/api/v1/workflows/' + wid
        schema = {'type': 'object', 'additionalProperties': True}
        commands = [{'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'config': {'input_schema': schema}}},
                    {'type': 'node.add', 'body': {'id': 'crm', 'kind': 'block', 'ref': ref, 'config': config}},
                    {'type': 'node.add', 'body': {'id': 'finish', 'kind': 'finish', 'config': {'output_schema': schema}}},
                    {'type': 'edge.add', 'body': {'id': 'input', 'source_id': 'start', 'target_id': 'crm', 'source_port': 'out', 'target_port': 'in'}},
                    {'type': 'edge.add', 'body': {'id': 'output', 'source_id': 'crm', 'target_id': 'finish', 'source_port': port, 'target_port': 'in'}}]
        post(ctx, path + '/apply', {'commands': commands}, name + '-graph')
        return path, post(ctx, path + '/publish', {}, name + '-version')['version']
    def completed(path, run_id):
        value = get(ctx, path + '/runs/' + run_id, 'crm-block-status')
        require(value['run']['status'] != 'failed', 'CRM Block workflow fails: ' + str(value))
        return value if value['run']['status'] == 'completed' else None
    if not review:
        path, version = create_flow('CRM identity workflow', 'kickside.crm.blocks:resolve', {'crm_id': cid}, 'result')
        run = post(ctx, path + '/run', {'version': version, 'input': {'object_type': 'person',
                   'match': {'alias_type': 'email', 'alias_value': 'workflow@northwind.example'}, 'values': {'name': 'Northwind workflow identity'}}}, 'resolve-block-run')
        detail = ctx.inst.wait(lambda: completed(path, run['run_id']), 'Resolve Block completes', seconds=60)
        output = detail['run']['output']['result']
        contains(output, 'Northwind workflow identity', 'Resolve Block record output')
        require(output.get('checkpoint', {}).get('projected_seq') is not None, 'Resolve Block lacks projection checkpoint')
        return
    review_reason = 'Fictional Northwind review ' + uuid.uuid4().hex
    path, version = create_flow('CRM merge review workflow', 'kickside.crm.blocks:merge_review', {'priority': 'normal'}, 'do_not_merge')
    run = post(ctx, path + '/run', {'version': version, 'input': {'crm_id': cid, 'object_type': 'person',
               'left_id': 'nw-block-left', 'right_id': 'nw-block-right', 'confidence': .8, 'reason': review_reason}}, 'merge-block-run')
    def pending():
        items = get(ctx, '/api/v1/inbox?status=all&limit=200', 'merge-block-inbox')['items']
        matches = [item for item in items if item.get('metadata', {}).get('run_id') == run['run_id']]
        require(len(matches) <= 1, 'Merge Block creates duplicate inbox items')
        return matches[0] if matches else None
    item = ctx.inst.wait(pending, 'CRM inbox merge review', seconds=60)
    require(item['item_type'] == 'crm_merge_review' and item['status'] == 'pending', 'Merge inbox item kind/status differs: ' + str(item))
    contains(item['metadata'], 'Northwind review left', 'Inbox review snapshot')
    nav(ctx, 'Inbox')
    ctx.browser.frame.get_by_role('button').filter(has_text=review_reason).click(timeout=30000)
    capture(ctx, 'crm-inbox-merge-review')
    review_surface = ctx.browser.frame.locator('kickside-crm-merge-review[item-id="' + item['id'] + '"]')
    review_surface.get_by_placeholder('Add context for this decision').fill('Northwind confirms two distinct fictional contacts')
    review_surface.get_by_role('button', name='Keep separate', exact=True).click()
    review_surface.get_by_role('button', name='Confirm — keep separate', exact=True).click()
    done = ctx.inst.wait(lambda: completed(path, run['run_id']), 'Merge review resumes workflow', seconds=60)
    require(done['run']['output']['result']['decision'] == 'do_not_merge', 'Merge review does not reach Finish decision')
    records = query(ctx, base, {'kind': 'records', 'object_type': 'person'}, 'review-surviving-records')
    contains(records, 'Northwind review left', 'Review left survives')
    contains(records, 'Northwind review right', 'Review right survives')


def crm_agent(ctx):
    cid = ctx.state['nw_crm']
    created = post(ctx, '/api/v1/user-agents', {'title': 'Northwind CRM assistant', 'model': ctx.state['model'],
                   'prompt': 'Use CRMGetRecord to retrieve the requested fictional Northwind contact. Never invent record data.',
                   'traits': ['kickside.crm.traits:crm_trait']}, 'crm-agent-create')
    aid = created['component_id']
    agent = get(ctx, '/api/v1/user-agents/' + aid, 'crm-agent-read')['agent']
    contains(agent, 'kickside.crm.traits:crm_trait', 'CRM agent capability')
    nav(ctx, 'New chat')
    ctx.browser.frame.get_by_role('button', name=re.compile('Select Agent|Northwind .*assistant')).last.click()
    ctx.browser.frame.get_by_role('menuitem', name='Northwind CRM assistant', exact=True).click()
    ctx.browser.frame.get_by_label('Message', exact=True).fill('Call CRMGetRecord with crm_id ' + cid +
         ' and record_id nw-person-1. Report the actual name and email, then five numbered follow-up actions. End NORTHWIND-CRM-AGENT.')
    ctx.browser.frame.get_by_role('button', name='Start Chat', exact=True).click()
    def replied():
        sessions = get(ctx, '/api/v1/sessions?limit=100', 'crm-agent-sessions')['sessions']
        for session in sessions:
            if session['current_agent'] == 'user_agent:' + aid:
                messages = get(ctx, '/api/v1/sessions/messages?session_id=' + session['session_id'], 'crm-agent-messages')['messages']
                if any(message['type'] == 'assistant' and 'NORTHWIND-CRM-AGENT' in json.dumps(message.get('data')) for message in messages):
                    return messages
        return None
    messages = ctx.inst.wait(replied, 'Gemma CRM agent response', seconds=180, pump=ctx.browser.page.wait_for_timeout)
    receipts = [row['metadata'] for row in messages if row['type'] == 'function'
                and row['metadata'].get('function_name') == 'CRMGetRecord' and row['metadata'].get('status') == 'success']
    require(receipts, 'CRM agent lacks a successful CRMGetRecord receipt')
    contains(receipts, 'nw-person-1', 'CRM agent retrieved record identity')
    assistant = [row['data'] for row in messages if row['type'] == 'assistant']
    contains(assistant, 'Morgan Northwind', 'CRM agent grounded name')
    contains(assistant, 'contact1@northwind.example', 'CRM agent grounded email')
    capture(ctx, 'crm-gemma-agent')


REGISTRY.extend([
    Scenario('northwind_crm_resolve_block', 'full', crm_blocks, ('northwind_crm_setup',),
             features=features(C, 'workflow_block', 'kickside.crm.blocks:resolve'), instance_setup=True),
    Scenario('northwind_crm_blocks', 'full', lambda ctx: crm_blocks(ctx, review=True), ('northwind_crm_setup',), features=
             features(C, 'workflow_block', 'kickside.crm.blocks:merge_review') +
             features(C, 'inbox_kind', 'kickside.crm.surface:item_type.crm_merge_review'), instance_setup=True),
    Scenario('northwind_crm_agent', 'full', crm_agent, ('northwind_crm_setup',), model=True,
             features=features(C, 'capability', 'kickside.crm.traits:crm_trait'))])

for placement in ('root', 'folder'):
    for kind, run in [('graph', graph_ui), ('roadmap', roadmap_ui), ('database', database_ui), ('journal', journal_ui)]:
        REGISTRY.append(Scenario('northwind_' + kind + '_ui_' + placement, 'full',
                        lambda ctx, p=placement, fn=run: fn(ctx, p), ('northwind_' + kind + '_' + placement,)))


def journal_recall_ready(ctx, base, marker):
    projected(ctx, base + '/graphs', '"id": "map"', 'journal-recall-graph-catalog')
    projected(ctx, base + '/graphs/map?mode=search&query=' + quote(marker, safe=''),
        marker, 'journal-recall-search-ready')


def regression_journal_projection_ui(ctx):
    from playwright.sync_api import expect
    from cleanup_evidence import delete_visible_component
    entry = create_entry(ctx, 'journal', 'Northwind projected journal ' + uuid.uuid4().hex[:8])
    ctx.inst.cleanup.add('projected journal', lambda: delete_visible_component(ctx,
        entry['id'], '/api/v1/threads/' + entry['id']), scope='scenario')
    base = '/api/v1/workspace/journals/' + entry['id']
    marker = 'NW-JOURNAL-PROJECTION-' + uuid.uuid4().hex[:8]
    events = [{'type': 'chestor.journal.events:entry.appended', 'body': {
        'event_type': 'finding', 'title': marker + ' dispatch ' + str(index),
        'body': 'Northwind projected dispatch ledger record ' + str(index),
    }} for index in range(205)]
    for start in range(0, len(events), 100):
        post(ctx, base + '/apply', {'events': events[start:start + 100]}, 'journal-ui-dense-batch')
    projected(ctx, base, marker + ' dispatch 204', 'journal-ui-dense-projection')
    journal_recall_ready(ctx, base, marker + ' dispatch 204')
    workspace_open(ctx, entry['name'])
    surface = ctx.browser.frame.locator('chestor-journal[entry-id="' + entry['id'] + '"][mode="full"]')
    surface.get_by_role('button', name='Recall lens', exact=True).click()
    query = surface.get_by_role('textbox', name='Search this journal graph', exact=True)
    query.fill(marker)
    query.press('Enter')
    expect(surface.locator('.jr-view')).to_contain_text(marker, timeout=30000)
    expect(surface.locator('.jr-error')).to_have_count(0)
    capture(ctx, 'journal-projection-browser')


REGISTRY.append(Scenario('regression_journal_projection_ui', 'full', regression_journal_projection_ui,
    ('northwind_setup',), model=True, issues=('B01',), features=features(J, 'http',
        'POST /api/v1/workspace/journals/{id}/apply',
        'GET /api/v1/workspace/journals/{id}/graphs',
        'GET /api/v1/workspace/journals/{id}/graphs/{graph_id}')))


def workspace_preview(ctx, placement):
    from playwright.sync_api import expect
    entry = ctx.state['nw_graph_' + placement]
    ctx.browser_check().login()
    nav(ctx, 'Workspace')
    if placement == 'folder':
        ctx.browser.frame.get_by_role('button', name=re.compile('^Northwind · Delivery studio')).first.dblclick()
    ctx.browser.frame.get_by_role('button', name=re.compile('^' + re.escape(entry['name']))).first.click()
    preview = ctx.browser.frame.locator('.ws-preview')
    expect(preview).to_contain_text(entry['name'], timeout=30000)
    expect(preview).to_contain_text('Order intake', timeout=30000)
    capture(ctx, 'workspace-' + placement + '-graph-preview')
    preview.get_by_role('button', name='Properties', exact=True).click()
    dialog = ctx.browser.frame.locator('.ws-dialog').filter(has_text='Properties')
    name = entry['name'] + ' · reviewed'
    dialog.locator('input').first.fill(name)
    dialog.get_by_role('button', name='Save', exact=True).click()
    ctx.browser.settle()
    updated = projected(ctx, '/api/v1/workspace/entries/' + entry['id'], name, 'ui-properties-persisted')
    require(updated['entry']['name'] == name, 'Workspace UI properties name differs')
    preview.get_by_role('button', name='Properties', exact=True).click()
    dialog.locator('input').first.fill(entry['name'])
    dialog.get_by_role('button', name='Save', exact=True).click()
    ctx.browser.settle()
    restored = projected_without(ctx, '/api/v1/workspace/entries/' + entry['id'], name, 'ui-properties-restored')
    require(restored['entry']['name'] == entry['name'],
            'Workspace UI name restoration differs')
    capture(ctx, 'workspace-' + placement + '-preview-properties')
    preview.get_by_role('button', name='Close', exact=True).click()


for placement in ('root', 'folder'):
    REGISTRY.append(Scenario('northwind_workspace_preview_' + placement, 'full', lambda ctx, p=placement: workspace_preview(ctx, p),
                    ('northwind_graph_' + placement,), issues=('T16', 'R3-T08'), features=features(W, 'http', 'GET /api/v1/workspace/entries/{id}', 'PUT /api/v1/workspace/entries/{id}')))


def roadmap_planning_setup(ctx):
    from scenarios_providers import install_probe
    install_probe(ctx)


def roadmap_planning_trait(ctx):
    from scenarios_ai import create_agent
    from scenarios_providers import probe
    aid = create_agent(ctx, 'Northwind roadmap semantics', ('chestor.roadmap.traits:roadmap_planning',),
        prompt='Use the injected Roadmap planning semantics. Return only JSON answering the task, without Markdown.')
    ctx.inst.cleanup.add('Roadmap planning agent', lambda: ctx.inst.request('DELETE', '/api/v1/user-agents/' + aid), scope='scenario')
    result = probe(ctx, port='kickside.agents:invoke_sink', write=True, arguments={
        'origin': 'app.smoke.providers:probe', 'identity_key': 'northwind-planning-sink', 'idempotency_key': uid(), 'sink_op': 'upsert', 'config': {'agent_id': aid},
        'input': {'content': 'Answer with keys hard_edge (the only dependency kind that blocks), soft_edge (the kind that gives context without schedule pressure), and unscheduled_horizon (the horizon for an idea without a schedule). Use the injected semantics.'}}, label='roadmap-planning-agent')
    output = result['output']
    require(isinstance(output, dict), 'Roadmap planning agent output is not structured: ' + str(output))
    require(all(output.get(field) == value
        for field, value in {'hard_edge': 'requires', 'soft_edge': 'informs', 'unscheduled_horizon': 'later'}.items()),
        'Roadmap planning trait does not guide its declared semantics: ' + str(output))


REGISTRY += [
    Scenario('northwind_roadmap_planning_setup', 'full', roadmap_planning_setup,
        ('northwind_setup',), instance_setup=True),
    Scenario('northwind_roadmap_planning_trait', 'full', roadmap_planning_trait,
        ('northwind_roadmap_planning_setup',), model=True,
        issues=('RC2-ROADMAP-PLANNING-STRUCTURED-OUTPUT',),
        features=features(R, 'capability', 'chestor.roadmap.traits:roadmap_planning')),
]
