"""Independent projection and cursor continuations on the thread control plane."""
import uuid
from urllib.parse import quote

from harness import Scenario, require
from scenarios_core import create_thread
from cleanup_evidence import await_cleanup


def core_projection_continuation(ctx):
    inst = ctx.inst
    thread = create_thread(ctx, 'Projection continuation ' + uuid.uuid4().hex[:12])
    base = '/api/v1/threads/' + thread + '/projections'
    projections, cursors = [], []
    for index in range(205):
        for cursor in range(2 if index == 0 else 1):
            row = inst.request('POST', base, {
                'kind': 'page', 'projection_key': 'key-' + str(index).zfill(4),
                'cursor_key': 'cursor-' + str(cursor),
                'worker_ref': 'func://kickside.core.lifecycle:child_lifecycle_projection',
                'events': ['smoke:never_emitted'], 'debounce_idle_ms': 600000, 'debounce_max_ms': 600000,
            }, expect=(201,), label='projection-page-register-' + str(index) + '-' + str(cursor))
            if row['projection_id'] not in projections:
                projections.append(row['projection_id'])
            cursors.append(row['cursor_id'])
    first = inst.request('GET', base + '?limit=7', label='projection-first-page')
    require(first.get('projections_has_more') is True and first.get('cursors_has_more') is True,
            'Projection listing omits truthful per-array continuation')
    tokens = {name: None for name in ('projections', 'cursors')}
    done = {name: False for name in tokens}
    seen = {name: [] for name in tokens}
    for index in range(40):
        query = '&'.join(name + '_cursor=' + quote(token) for name, token in tokens.items() if token)
        page = inst.request('GET', base + '?limit=7' + ('&' + query if query else ''),
                            label='projection-page-' + str(index))
        for name in tokens:
            require(isinstance(page[name + '_has_more'], bool), 'Projection list lacks an exhaustion verdict')
            require(len(page[name]) <= 7, 'Projection list exceeds its page size')
            if not done[name]:
                for row in page[name]:
                    require(row['id'] not in seen[name], 'Projection continuation repeats a row')
                    seen[name].append(row['id'])
                if page[name + '_has_more']:
                    token = page[name + '_cursor']
                    require(token and token != tokens[name], 'Projection continuation makes no progress')
                    tokens[name] = token
                else:
                    require(not page.get(name + '_cursor'), 'Exhausted projection array emits continuation')
                    done[name] = True
        if all(done.values()):
            break
    require(seen['projections'] == projections, 'Projection keyset is incomplete or out of order')
    require(set(seen['cursors']) == set(cursors), 'Cursor keyset is incomplete')
    inst.request('GET', base + '?projections_cursor=invalid%25%25%25', expect=(400,),
                 label='projection-invalid-cursor')
    inst.request('GET', base + '?cursors_cursor=' + quote(first['projections_cursor']), expect=(400,),
                 label='projection-cross-array-cursor')
    other = create_thread(ctx, 'Other projection continuation thread')
    inst.request('GET', '/api/v1/threads/' + other + '/projections?projections_cursor=' +
                 quote(first['projections_cursor']), expect=(400,), label='projection-cross-thread-cursor')
    inst.evidence.save('projection-continuation', {name: len(rows) for name, rows in seen.items()})
    for identifier in projections:
        inst.request('POST', base + '/remove', {'projection_id': identifier}, label='projection-page-remove')
    inst.request('GET', base + '?cursors_cursor=' + quote(first['cursors_cursor']), expect=(400,),
                 label='projection-expired-cursor')
    pending = inst.request('DELETE', '/api/v1/threads/' + thread, expect=(202,),
                           label='projection-page-thread-delete')
    require(pending['success'] and pending['in_progress'] and pending['cleanup_pending']
            and not pending['deleted'] and pending['details']['needs_continue'],
            'Large thread deletion loses its accepted cleanup outcome')
    await_cleanup(inst, thread)
    inst.request('DELETE', '/api/v1/threads/' + other, expect=(200,),
                 label='projection-small-thread-delete')
    await_cleanup(inst, other)


REGISTRY = [Scenario('core_projection_continuation', 'full', core_projection_continuation, ('boot',),
    instance_setup=True, issues=('B05', 'R3-P02'), features=tuple('kickside/core|http|' + route for route in (
        'POST /api/v1/threads', 'POST /api/v1/threads/{id}/projections',
        'GET /api/v1/threads/{id}/projections', 'POST /api/v1/threads/{id}/projections/remove',
        'DELETE /api/v1/threads/{id}')))]


def regression_large_thread_delete(ctx):
    from large_delete_ui import crowded_thread, delete_in_browser
    from scenarios_crm_chestor import create_entry
    from scenarios_access import install_package
    from cleanup_evidence import delete_visible_component
    install_package(ctx, 'chestor/workspace')
    install_package(ctx, 'chestor/journal')
    title = 'Northwind large dispatch journal ' + uuid.uuid4().hex[:8]
    identifier = create_entry(ctx, 'journal', title)['id']
    ctx.inst.cleanup.add('large delete journal', lambda: delete_visible_component(
        ctx, identifier, '/api/v1/threads/' + identifier), scope='scenario')
    def append_record(index):
        ctx.inst.request('POST', '/api/v1/workspace/journals/' + identifier + '/events', {
            'event_type': 'finding', 'title': 'Northwind dispatch ' + str(index),
            'body': 'Northwind dispatch ledger record ' + str(index),
        }, label='large-journal-record-' + str(index))
    crowded_thread(ctx, identifier, append_record)
    delete_in_browser(ctx, identifier, title, knowledge=False)


REGISTRY.append(Scenario('regression_large_thread_delete', 'full', regression_large_thread_delete, ('first_agent',),
    issues=('B05',), features=('chestor/workspace|http|DELETE /api/v1/workspace/entries/{id}',)))


def core_projection_catchup_selection(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    from scenarios import nav
    inst = ctx.inst
    inst.install('kickside/skills', parameters=[{'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}])
    title = 'Catch-up addressed selection ' + uuid.uuid4().hex[:12]
    created = inst.request('POST', '/api/v1/skills', {
        'name': title,
        'description': 'Projection continuation fixture', 'body': 'Original instructions',
    }, label='catchup-skill-create')
    skill = created['skill_id']
    base = '/api/v1/threads/' + skill + '/projections'
    fillers = []
    for index in range(1001):
        registered = inst.request('POST', base, {
            'kind': 'a.filler', 'projection_key': 'key-' + str(index).zfill(4),
            'cursor_key': 'filler', 'worker_ref': 'func://kickside.core.lifecycle:child_lifecycle_projection',
            'events': ['smoke:never_emitted'], 'debounce_idle_ms': 600000, 'debounce_max_ms': 600000,
        }, expect=(201,), label='catchup-register-' + str(index))
        fillers.append(registered['projection_id'])
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    nav(ctx, 'Skills')
    skills = browser.frame.locator('kickside-skills')
    def failed_skill_request(request):
        if '/api/v1/skills/' + skill not in request.url:
            return
        response = request.response()
        if response and response.status >= 400:
            inst.evidence.save('catchup-browser-failed-response', {
                'method': request.method, 'status': response.status, 'body': response.text(),
            })
    browser.page.on('requestfinished', failed_skill_request)
    skills.get_by_role('button', name='Edit ' + title, exact=True).click()
    dialog = skills.get_by_role('dialog', name='Edit skill', exact=True)
    instructions = dialog.get_by_label('Skill instructions', exact=True)
    expect(instructions).to_have_value('Original instructions', timeout=30000)
    updated_body = 'Updated instructions behind one thousand unrelated projection cursors'
    instructions.fill(updated_body)
    with browser.page.expect_response(lambda response: '/api/v1/skills/' + skill in response.url
                                     and response.request.method == 'PATCH') as response:
        dialog.get_by_role('button', name='Save new version', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success') is True,
            'Browser skill update cannot address its projection cursor')
    expect(dialog).not_to_be_visible(timeout=30000)
    skills.get_by_role('button', name='Edit ' + title, exact=True).click()
    expect(instructions).to_have_value(updated_body, timeout=30000)
    browser.screenshot('catchup-addressed-skill-instructions')
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    current = inst.request('GET', '/api/v1/skills/' + skill, label='catchup-skill-current')['skill']
    require(current['body'] == 'Updated instructions behind one thousand unrelated projection cursors',
            'Skill update does not reach its committed read model')
    versions = inst.request('GET', '/api/v1/skills/' + skill + '/versions', label='catchup-skill-versions')['versions']
    require(len(versions) == 2, 'Addressed catch-up loses skill version history')
    for identifier in fillers:
        inst.request('POST', base + '/remove', {'projection_id': identifier}, label='catchup-filler-remove')
    inst.request('DELETE', '/api/v1/skills/' + skill, label='catchup-skill-delete')
    inst.evidence.save('catchup-addressed-selection', {'unrelated_cursors': 1001,
        'versions': len(versions), 'browser_saved_and_reopened': True})


REGISTRY.append(Scenario('core_projection_catchup_selection', 'full', core_projection_catchup_selection,
    ('boot',), instance_setup=True, issues=('CORE-PROJECTION-ADDRESSED-DISPATCH-SCALE', 'NE-113', 'NE-114'), features=(
        'kickside/core|http|POST /api/v1/threads/{id}/projections',
        'kickside/core|http|POST /api/v1/threads/{id}/projections/remove',
        'kickside/skills|http|POST /api/v1/skills', 'kickside/skills|http|PATCH /api/v1/skills/{id}',
        'kickside/skills|http|GET /api/v1/skills/{id}', 'kickside/skills|http|GET /api/v1/skills/{id}/versions',
        'kickside/skills|http|DELETE /api/v1/skills/{id}',
    )))
