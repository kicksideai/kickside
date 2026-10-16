"""KB content admission addresses its source projection on a crowded thread."""
import uuid
import json
import re
from urllib.parse import quote

from harness import Scenario, require
from cleanup_evidence import await_cleanup, delete_visible_component


def knowledge_addressed_ingest(ctx):
    inst = ctx.inst
    inst.install('kickside/knowledge')
    inst.install('kickside/kb10')
    suffix = uuid.uuid4().hex[:12]
    model = 'smoke/addressed-embed-' + suffix
    inst.request('PUT', '/api/v1/models/cards', {
        'name': model, 'title': 'Addressed ingestion embedding metadata',
        'provider_id': 'wippy.llm.openai_compat:provider', 'provider_model': 'qwen3-embed',
        'capabilities': ['embed'], 'class': [], 'dimensions': 512,
        'max_tokens': 8192, 'output_tokens': 0,
    }, label='addressed-model')
    email = 'addressed-ingest-' + suffix + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {
        'email': email, 'password': inst.password, 'full_name': 'Addressed ingestion member',
        'groups': ['app.security:members'],
    }, expect=(201,), label='addressed-member')['user']
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='addressed-login')['token']
    inst.redactor.add(token)
    kb = inst.request('POST', '/api/v1/knowledge/create', {
        'name': 'Addressed ingest ' + suffix, 'kb_type': 'document', 'embedding_model': model,
    }, label='addressed-kb')['id']
    inst.request('POST', '/api/v1/component-access/share/' + kb, {
        'subject_type': 'user', 'subject_id': user['user_id'], 'access_mask': 3,
    }, label='addressed-kb-share')
    base = '/api/v1/threads/' + kb
    fillers = []
    for index in range(205):
        filler = inst.request('POST', base + '/projections', {
            'kind': 'a.filler.' + str(index).zfill(4),
            'worker_ref': 'func://kickside.core.lifecycle:child_lifecycle_projection',
            'events': ['smoke:never_emitted'], 'debounce_idle_ms': 600000, 'debounce_max_ms': 600000,
        }, expect=(201,), label='addressed-filler-' + str(index))
        fillers.append(filler['projection_id'])
    admitted = inst.request('POST', '/api/v1/knowledge/' + kb + '/ingest', {
        'content': 'Content admitted through an addressed source projection', 'title': 'Addressed content',
        'external_id': 'addressed-' + suffix, 'external_version': 'v1',
    }, auth=token, label='addressed-content')
    require(admitted['success'] and admitted['projection_id'] and admitted['cursor_id'],
            'A crowded provisioned KB cannot admit content through its source projection')
    events = inst.request('GET', base + '/events?limit=100', auth=token, label='addressed-events')['events']
    require(any(row.get('external_id') == 'addressed-' + suffix for row in events),
            'Knowledge content admission does not append its durable event')
    inst.evidence.save('addressed-ingest', {'filler_projections': 205,
        'projection_id': admitted['projection_id'], 'cursor_id': admitted['cursor_id']})
    for identifier in fillers:
        inst.request('POST', base + '/projections/remove', {'projection_id': identifier},
                     label='addressed-filler-remove')
    pending = inst.request('DELETE', '/api/v1/knowledge/' + kb, expect=(202,), label='addressed-kb-delete')
    require(pending['success'] and pending['in_progress'] and pending['cleanup_pending']
            and not pending['deleted'] and pending['details']['needs_continue'],
            'Large KB deletion loses its accepted cleanup outcome')
    await_cleanup(inst, kb, knowledge=True)
    inst.request('DELETE', '/api/v1/users/' + user['user_id'], expect=(202,), label='addressed-member-delete')
    inst.request('DELETE', '/api/v1/models/cards?name=' + quote(model), label='addressed-model-delete')


REGISTRY = [Scenario('knowledge_addressed_ingest', 'full', knowledge_addressed_ingest, ('boot',),
    instance_setup=True, issues=('B04', 'SMOKE-ONBOARDING-EXPLICIT-MODEL-LIMITS'), features=(
        'kickside/kb10|workspace_kind|kickside.kb10:embeddable',
        'kickside/knowledge|http|POST /api/v1/knowledge/create',
        'kickside/knowledge|http|POST /api/v1/knowledge/{id}/ingest',
        'kickside/knowledge|http|DELETE /api/v1/knowledge/{id}',
        'kickside/component|http|POST /api/v1/component-access/share/{id}',
        'kickside/core|http|POST /api/v1/threads/{id}/projections',
        'kickside/core|http|GET /api/v1/threads/{id}/events',
        'kickside/core|http|POST /api/v1/threads/{id}/projections/remove',
    ))]


def crowded_kb(ctx, title_prefix):
    from large_delete_ui import crowded_thread
    from scenarios_ai import kb_create
    title = title_prefix + uuid.uuid4().hex[:8]
    identifier = kb_create(ctx, 'document', title)
    ctx.inst.cleanup.add('large delete KB', lambda: delete_visible_component(
        ctx, identifier, '/api/v1/knowledge/' + identifier, knowledge=True), scope='scenario')
    def append_record(index):
        ctx.inst.request('POST', '/api/v1/knowledge/' + identifier + '/ingest', {
            'title': 'Northwind dispatch ' + str(index), 'content': 'Northwind dispatch ledger record ' + str(index),
            'external_id': 'dispatch-' + str(index), 'external_version': '1', 'embed': False,
        }, label='large-kb-record-' + str(index))
    crowded_thread(ctx, identifier, append_record)
    return identifier, title


def regression_large_kb_delete(ctx):
    from large_delete_ui import delete_in_browser
    identifier, title = crowded_kb(ctx, 'Northwind large dispatch library ')
    delete_in_browser(ctx, identifier, title, knowledge=True)


REGISTRY.append(Scenario('regression_large_kb_delete', 'full', regression_large_kb_delete, ('first_agent',),
    issues=('B04', 'KNOWLEDGE-CLEANUP-PROGRESS'), features=('kickside/knowledge|http|DELETE /api/v1/knowledge/{id}',)))


def regression_large_kb_delete_status_error(ctx):
    from large_delete_ui import delete_in_browser
    from playwright.sync_api import expect

    identifier, title = crowded_kb(ctx, 'Northwind cleanup status library ')
    browser = ctx.browser_check()
    list_path = '**/api/v1/knowledge/list'
    armed = False
    intercepted = 0
    pending_reads = []

    def fail_one_status_read(route):
        nonlocal intercepted
        if not armed:
            route.continue_()
            return
        intercepted += 1
        if intercepted == 1:
            route.fulfill(status=200, content_type='application/json', body=json.dumps({
                'success': False, 'error': 'cleanup status unavailable',
            }))
        else:
            pending_reads.append(route)

    def arm_status_failure(request):
        nonlocal armed
        if request.method == 'DELETE' and request.url.endswith('/api/v1/knowledge/' + identifier):
            armed = True

    def assert_pending_status_error(_, panel, row):
        try:
            expect(panel.get_by_text('cleanup status unavailable', exact=True)).to_be_visible(timeout=30000)
            expect(panel.get_by_text(re.compile('delet.*in progress|deleting|cleanup.*pending', re.I))).to_be_visible(timeout=30000)
            browser.page.wait_for_timeout(1100)
            expect(row).to_be_visible(timeout=30000)
            require(intercepted >= 1, 'Status error fixture does not intercept the accepted cleanup refresh')
        finally:
            for route in pending_reads:
                route.continue_()
            browser.page.unroute(list_path, fail_one_status_read)
            browser.page.remove_listener('request', arm_status_failure)

    browser.page.route(list_path, fail_one_status_read)
    browser.page.on('request', arm_status_failure)
    delete_in_browser(ctx, identifier, title, knowledge=True, after_accepted=assert_pending_status_error)


REGISTRY.append(Scenario('regression_large_kb_delete_status_error', 'full', regression_large_kb_delete_status_error, ('first_agent',),
    issues=('KNOWLEDGE-CLEANUP-STATUS-ERROR',), features=('kickside/knowledge|http|DELETE /api/v1/knowledge/{id}',
        'kickside/knowledge|http|GET /api/v1/knowledge/list')))
