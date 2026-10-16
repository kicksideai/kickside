"""Inbox content versions preserve the review and deletion visible to the owner."""
import uuid
from urllib.parse import quote

import json

from harness import Scenario, require
from data_contracts import event_window, inbox_items
from scenarios import nav


def inbox_delivery_versions(ctx):
    inst = ctx.inst
    created = inst.request('POST', '/api/v1/inbox', {
        'item_type': 'notice', 'title': 'Inbox version ' + uuid.uuid4().hex[:12],
        'content': 'Original delivery',
    }, label='inbox-version-create')['item']
    identifier = created['id']
    path = '/api/v1/inbox/' + quote(identifier, safe='')

    def current():
        items, result = inbox_items(inst.request, label='inbox-version-read', identifier=identifier)
        row = next((item for item in items if item['id'] == identifier), None)
        return row, result

    def initial():
        row, listing = current()
        return (row, listing) if row else None

    row, listing = inst.wait(initial, 'Inbox genesis reaches the read model', seconds=35)
    thread = listing['component_id']
    resolved = inst.request('POST', path + '/dismiss', {}, label='inbox-version-dismiss')['item']
    require(resolved['status'] == 'dismissed', 'Inbox review does not commit')
    resolution = resolved['resolution_id']
    genesis = resolved['created_event_id']
    inst.wait(lambda: current()[0].get('status') == 'dismissed',
              'Inbox review reaches the read model', seconds=35)
    browser = ctx.browser_check()
    browser.login()
    nav(ctx, 'Inbox')
    browser.frame.get_by_role('tab', name='Resolved', exact=False).click()
    browser.frame.get_by_text(created['title'], exact=True).first.wait_for(timeout=30000)
    event = {
        'type': 'kickside.inbox.events:item.version', 'role': 'user',
        'body': {'id': identifier, 'item_type': 'notice', 'title': 'Updated inbox content',
                 'content': 'Updated delivery after the review', 'metadata': {'revision': 2},
                 'delivery_key': 'version-' + identifier},
        'external': {'external_source': 'kickside.inbox', 'external_id': 'delivery:' + identifier,
                     'external_version': '1'},
    }
    base = '/api/v1/threads/' + thread + '/events'
    appended = inst.request('POST', base, event, expect=(201,), label='inbox-version-append')
    require(appended['inserted'] == 1, 'Inbox version is not durable')

    def updated():
        item, _ = current()
        return item if item and item.get('content') == 'Updated delivery after the review' else None

    item = inst.wait(updated, 'Inbox version changes the content', seconds=35)
    browser.frame.get_by_text('Updated inbox content', exact=True).first.wait_for(timeout=30000)
    require(item['status'] == 'dismissed' and item['action'] == 'dismiss' and
            item['resolved_at'] == resolved['resolved_at'] and item['form'] == resolved['form'] and
            item['metadata'] == {'revision': 2}, 'Inbox version resets review or creation identity')
    history = event_window(inst.request, base, 1, appended['max_seq'], label='inbox-version-history')
    require(any(event['id'] == genesis for event in history), 'Inbox version loses its durable creation identity')
    decisions = [event for event in history if event['type'] == 'kickside.inbox.events:item.resolved'
                 and (json.loads(event['body']) if isinstance(event['body'], str) else event['body']).get('id') == identifier]
    require(len(decisions) == 1, 'Inbox version duplicates the review decision')
    body = decisions[0].get('body', decisions[0].get('body_json'))
    if isinstance(body, str):
        body = json.loads(body)
    require(body['resolution_id'] == resolution, 'Inbox version loses its durable resolution identity')
    replay = inst.request('POST', base, event, expect=(201,), label='inbox-version-replay')
    require(replay['inserted'] == 0 and replay['duplicates'] == 1, 'Inbox version replay appends twice')
    inst.request('POST', '/api/v1/inbox/' + uuid.uuid4().hex + '/dismiss', {}, expect=(404,),
                 label='inbox-resolve-absent')
    inst.request('DELETE', '/api/v1/inbox/' + uuid.uuid4().hex, expect=(404,), label='inbox-delete-absent')
    inst.request('DELETE', path, label='inbox-version-delete')
    inst.request('DELETE', path, label='inbox-version-delete-replay')
    inst.wait(lambda: current()[0] is None, 'Inbox deletion reaches the read model', seconds=35)
    event['body']['content'] = 'Late delivery after deletion'
    event['body']['delivery_key'] += '-late'
    event['external']['external_id'] += '-late'
    late = inst.request('POST', base, event, expect=(201,), label='inbox-version-after-delete')
    require(late['inserted'] == 1, 'Late Inbox version is not durable')
    def applied():
        page = inst.request('GET', '/api/v1/threads/' + thread + '/projections', label='inbox-version-cursor')
        projections = {row['id'] for row in page['projections'] if row['kind'] == 'kickside.inbox:items'}
        return any(row['projection_id'] in projections and row['last_seq'] >= late['max_seq']
                   for row in page['cursors'])

    inst.wait(applied, 'Late Inbox version reaches its projection cursor', seconds=35)
    require(current()[0] is None, 'Late Inbox version restores a deleted item')
    inst.evidence.save('inbox-version-decision', {'item_id': identifier, 'resolution_id': resolution,
                                                'created_event_id': genesis, 'deleted': True})


REGISTRY = [Scenario('inbox_delivery_versions', 'full', inbox_delivery_versions, ('first_agent',),
    instance_setup=True, features=(
        'kickside/inbox|http|POST /api/v1/inbox', 'kickside/inbox|http|GET /api/v1/inbox',
        'kickside/inbox|http|POST /api/v1/inbox/{id}/{action}', 'kickside/inbox|http|DELETE /api/v1/inbox/{id}',
        'kickside/core|http|POST /api/v1/threads/{id}/events',
        'kickside/core|http|GET /api/v1/threads/{id}/events',
        'kickside/core|http|GET /api/v1/threads/{id}/projections',
    ))]
