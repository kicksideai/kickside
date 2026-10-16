"""Recurring fixtures stop producing before later inbox checks."""
import time
import uuid

from harness import Scenario, require
from scenarios import Context, automations


def regression_recurring_fixture_cleanup(ctx):
    from smoke import execute_scenario
    peer = Context(ctx.inst, ctx.browser_session)
    label = ctx.inst.evidence.label
    try:
        result = execute_scenario({'model': {}}, ctx.inst.engine,
            Scenario('recurring-fixture-boundary', 'full', automations), peer, {},
            lambda: peer.browser_check().login())
        require(result.status == 'passed', 'Recurring fixture fails: ' + result.error)
        identifier = peer.state['automation']
        ctx.inst.wait(lambda: all(row['id'] != identifier for row in
            ctx.inst.request('GET', '/api/v1/automations', label='recurring-fixture-after-boundary')['automations']),
            'Recurring fixture leaves no producer', seconds=35)
    finally:
        ctx.inst.evidence.label = label
        peer.close_browser()
    ctx.inst.evidence.save('recurring-fixture-cleanup', {'automation_id': identifier, 'deleted': True})


def seed_inbox_volume(ctx):
    inst = ctx.inst
    inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': 'Inbox load seed',
                                         'content': 'Historical inbox volume'}, label='inbox-load-seed')
    thread = inst.request('GET', '/api/v1/inbox?status=all&limit=1', label='inbox-load-thread')['component_id']
    prefix = uuid.uuid4().hex
    events = []
    for index in range(3500):
        identifier = prefix + '-' + str(index)
        events.append({'type': 'kickside.inbox.events:item.created', 'role': 'user',
            'body': {'id': identifier, 'item_type': 'notice', 'title': 'Historical inbox notice ' + str(index),
                     'content': 'Historical committed notice', 'actor_id': inst.email, 'created_at': int(time.time()) - 3600,
                     'priority': 'normal', 'metadata': {}, 'source_id': identifier},
            'external': {'external_source': 'kickside.smoke.inbox-volume', 'external_id': identifier, 'external_version': '1'}})
    for offset in range(0, len(events), 200):
        receipt = inst.request('POST', '/api/v1/threads/' + thread + '/events/batch',
                               {'events': events[offset:offset + 200]}, expect=(200,),
                               label='inbox-load-batch-' + str(offset // 200))
        require(receipt['inserted'] == len(events[offset:offset + 200]), 'Inbox volume fixture loses committed events')
    return thread, receipt['max_seq'], len(events)


def inbox_volume_fixture(ctx):
    from scenarios_inbox_delivery import inbox_delivery_versions
    inst = ctx.inst
    thread, _, count = seed_inbox_volume(ctx)
    try:
        inbox_delivery_versions(ctx)
    finally:
        inst.request('GET', '/api/v1/threads/' + thread + '/projections', label='inbox-load-progress')
        inst.request('GET', '/api/v1/threads/' + thread + '/events?ascending=false&limit=1', label='inbox-load-tail')
    inst.evidence.save('inbox-accumulated-progress', {'historical_items': count, 'versions_reviews_deletion': True})


def regression_inbox_accumulated_progress(ctx):
    from runtime_fixtures import complete_splashes, isolated_fixture
    with isolated_fixture(ctx) as fixture:
        complete_splashes(fixture, 'welcome', 'first_agent')
        inbox_volume_fixture(fixture)


REGISTRY = [
    Scenario('regression_recurring_fixture_cleanup', 'full', regression_recurring_fixture_cleanup,
             ('first_agent',), issues=('R5-E07',), features=(
                 'kickside/automation|http|POST /api/v1/automations',
                 'kickside/automation|http|GET /api/v1/automations',
                 'kickside/automation|http|DELETE /api/v1/automations/{id}')),
    Scenario('regression_inbox_accumulated_progress', 'full', regression_inbox_accumulated_progress,
             ('first_agent',), issues=('R5-E07',), features=(
                 'kickside/inbox|http|POST /api/v1/inbox', 'kickside/inbox|http|GET /api/v1/inbox',
                 'kickside/core|http|POST /api/v1/threads/{id}/events/batch',
                 'kickside/core|http|GET /api/v1/threads/{id}/projections')),
]
