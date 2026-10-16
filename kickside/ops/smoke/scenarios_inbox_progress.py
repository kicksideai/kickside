"""Inbox progress survives a stale first page at the recorded round-five latency."""
import time
import uuid
from urllib.parse import quote

from data_contracts import inbox_items
from harness import Scenario, require
from runtime_fixtures import complete_splashes, isolated_fixture
from scenarios_inbox_delivery import inbox_delivery_versions
from scenarios_recurring_fixture import seed_inbox_volume


def inbox_identity_query(ctx):
    from module_harness import run_focused_module_test
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        urgent = inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': 'Urgent query control',
                              'priority': 'urgent'}, label='inbox-query-urgent')['item']['id']
        wanted = inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': 'Exact identity query',
                              'priority': 'low'}, label='inbox-query-target')['item']['id']
        def current():
            rows, result = inbox_items(inst.request, identifier=wanted, label='inbox-query-current')
            return (rows, result) if rows else None
        rows, result = inst.wait(current, 'Inbox identity query reaches its read model', seconds=35)
        require(len(rows) == 1 and rows[0]['id'] == wanted and result['total_count'] == 1,
                'Inbox identity query returns unrelated higher-priority items')
        require(result['item_count'] >= 2, 'Inbox identity query changes the owner summary counts')
        absent, _ = inbox_items(inst.request, identifier=uuid.uuid4().hex, label='inbox-query-absent')
        require(not absent, 'Inbox identity query aliases an absent item')
        for suffix in ('&priority=urgent', '&type=unknown', '&status=resolved'):
            filtered = inst.request('GET', '/api/v1/inbox?id=' + quote(wanted, safe='') + suffix,
                                    label='inbox-query-combined-filter')
            require(filtered['total_count'] == 0 and not filtered['items'],
                    'Inbox identity query bypasses its other filters')
        all_rows, _ = inbox_items(inst.request, label='inbox-query-unfiltered')
        require({urgent, wanted} <= {row['id'] for row in all_rows}, 'Unfiltered Inbox query changes behavior')
        email = 'inbox-query-member-' + uuid.uuid4().hex[:12] + '@smoke.example'
        inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                     'full_name': 'Inbox query member', 'groups': ['app.security:user', 'app.security:members']},
                     expect=(201,), label='inbox-query-member')
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='inbox-query-member-login')['token']
        inst.redactor.add(token)
        other = inst.request('GET', '/api/v1/inbox?status=all&id=' + quote(wanted, safe=''),
                             auth=token, label='inbox-query-other-owner')
        require(other['total_count'] == 0 and not other['items'], 'Inbox identity query leaks another owner item')
        inst.evidence.save('inbox-query-proof', {'wanted': wanted, 'urgent': urgent,
                                               'point_read': result, 'other_owner': other})
    run_focused_module_test(ctx, 'kickside/inbox', 'list_api_test', lint=True)


def inbox_projection_lag(ctx):
    with isolated_fixture(ctx) as fixture:
        complete_splashes(fixture, 'welcome', 'first_agent')
        inst = fixture.inst
        thread, head, count = seed_inbox_volume(fixture)
        base = '/api/v1/threads/' + thread + '/projections'
        def caught_up():
            state = inst.request('GET', base, label='inbox-lag-seeded-cursor')
            projections = {row['id'] for row in state['projections'] if row['kind'] == 'kickside.inbox:items'}
            return next((row for row in state['cursors']
                         if row['projection_id'] in projections and row['last_seq'] >= head), None)
        cursor = inst.wait(caught_up, 'Historical Inbox projection catches up', seconds=35)
        control = {'cursor_id': cursor['id']}
        inst.request('PUT', base + '/pause', control, label='inbox-lag-pause')
        request = inst.request
        pages = []
        created = None
        resumed = False
        def observe(method, path, *args, **kwargs):
            nonlocal created, resumed
            started = time.monotonic()
            result = request(method, path, *args, **kwargs)
            if method == 'POST' and path == '/api/v1/inbox':
                created = result['item']['id']
            if method == 'GET' and path.startswith('/api/v1/inbox?'):
                present = any(row['id'] == created for row in result['items'])
                pages.append({'path': path, 'count': result['total_count'], 'present': present})
                inst.evidence.save('inbox-lag-page-' + str(len(pages)), result)
                if not resumed:
                    require(created and not present, 'Projection lag fixture has no stale creation read')
                    request('PUT', base + '/resume', control, label='inbox-lag-resume')
                    resumed = True
                time.sleep(max(0, 45.714 / 18 - (time.monotonic() - started)))
            return result
        inst.request = observe
        started = time.monotonic()
        try:
            inbox_delivery_versions(fixture)
        finally:
            inst.request = request
            request('PUT', base + '/resume', control, label='inbox-lag-cleanup-resume')
            state = request('GET', base, label='inbox-lag-final-cursor')
            inst.evidence.save('inbox-lag-progress', {'historical_items': count, 'created': created,
                'page_seconds': 45.714 / 18, 'elapsed': time.monotonic() - started,
                'pages': pages, 'cursor': state})


REGISTRY = [Scenario('regression_inbox_projection_lag_progress', 'regression', inbox_projection_lag,
                    ('first_agent',), instance_setup=True, issues=('R5-E07', 'INBOX-ID-QUERY'), features=(
                        'kickside/inbox|http|GET /api/v1/inbox',
                        'kickside/core|http|PUT /api/v1/threads/{id}/projections/pause',
                        'kickside/core|http|PUT /api/v1/threads/{id}/projections/resume'))]
REGISTRY += [Scenario('inbox_identity_query', 'regression', inbox_identity_query, ('boot',),
                     instance_setup=True, issues=('INBOX-ID-QUERY',), features=(
                         'kickside/inbox|http|GET /api/v1/inbox', 'kickside/inbox|http|POST /api/v1/inbox'))]
