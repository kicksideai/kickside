"""Job and run continuation through the current Core and Jobs owners."""
import json
from pathlib import Path
from urllib.parse import quote
import uuid

import yaml

from harness import Scenario, require
from scenarios_core import mcp_call


JOB_FIXTURE = Path('test/src/job_fixture.lua')


def job_fixture_source(ctx):
    jobs = ctx.inst.config.get('replace', {}).get('kickside/jobs')
    require(jobs, 'Job history guard requires the selected kickside/jobs source')
    fixture = Path(jobs) / JOB_FIXTURE
    require(fixture.is_file(), 'Selected jobs fixture is absent: ' + str(fixture))
    return fixture.read_text()


def core_job_history_pagination(ctx):
    inst = ctx.inst
    # Installing a module changes group policy composition and revokes member sessions.
    inst.install('kickside/mcp')
    suffix = uuid.uuid4().hex[:12]
    members = []
    for role in ('owner', 'stranger'):
        email = 'history-' + suffix + '-' + role + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {
            'email': email, 'password': inst.password, 'full_name': role, 'groups': ['app.security:members'],
        }, expect=(201,), label='history-member-' + role)['user']
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='history-login-' + role)['token']
        inst.redactor.add(token)
        members.append((user['user_id'], token))
    owner, stranger = members[0][1], members[1][1]
    threads = []
    for index in range(106):
        threads.append(inst.request('POST', '/api/v1/threads', {
            'thread_class': 'history-pagination', 'attrs': {'title': 'History ' + str(index)},
        }, auth=owner, expect=(201,), label='history-thread-' + str(index))['thread']['id'])
    foreign = inst.request('POST', '/api/v1/threads', {
        'thread_class': 'history-pagination', 'attrs': {'title': 'Foreign History'},
    }, auth=stranger, expect=(201,), label='history-foreign-thread')['thread']['id']
    # The source is shared with the native Jobs lease fixtures in this isolated app.
    fixture = inst.app / 'src' / 'job-history-smoke'
    with ctx.paused():
        fixture.mkdir()
        source = Path(__file__).resolve().parent / 'fixtures' / 'job_history.lua'
        (fixture / 'seed.lua').write_text(source.read_text())
        (fixture / 'job_fixture.lua').write_text(job_fixture_source(ctx))
        (fixture / '_index.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'namespace': 'app.smoke.job_history', 'entries': [
                {'name': 'seed', 'kind': 'function.lua', 'source': 'file://seed.lua', 'method': 'handler',
                 'modules': ['sql', 'time'], 'imports': {'clock': 'kickside.core.jobs:clock', 'jobs': 'kickside.core.jobs:jobs',
                     'lifecycle': 'kickside.core.jobs.persist:lifecycle', 'job_fixture': 'app.smoke.job_history:job_fixture'},
                 'meta': {'type': 'tool', 'public': True, 'llm_alias': 'SeedJobHistory',
                     'title': 'Local job history fixture', 'input_schema': {'type': 'object',
                         'properties': {'thread_ids': {'type': 'array', 'items': {'type': 'string'}}},
                         'required': ['thread_ids']}}},
                {'name': 'job_fixture', 'kind': 'library.lua', 'source': 'file://job_fixture.lua',
                 'modules': ['sql', 'process', 'uuid'], 'imports': {
                     'lifecycle': 'kickside.core.jobs.persist:lifecycle', 'config': 'kickside.core.jobs:config',
                     'wake': 'kickside.core.jobs.persist:wake'}},
            ],
        }, sort_keys=False))
    seeded = mcp_call(ctx, ['app.smoke.job_history:seed'], [('SeedJobHistory', {
        'thread_ids': [threads[0], threads[-1], foreign],
    })])[0]
    content = seeded
    expected = [row for row in content['rows'] if row['thread_id'] != foreign]
    saved = {}
    for collection, key, id_key in (('jobs', 'jobs', 'id'), ('job-runs', 'runs', 'run_id')):
        base = '/api/v1/' + collection + '?limit=2'
        cursor, seen, cursors = None, [], set()
        first_cursor = None
        while True:
            page = inst.request('GET', base + ('&cursor=' + quote(cursor) if cursor else ''),
                                auth=owner, label='history-' + collection + '-page-' + str(len(cursors)))
            require(page['count'] == len(page[key]) <= 2, 'History count exceeds the requested page')
            require(isinstance(page.get('has_more'), bool), 'History omits the page verdict')
            for row in page[key]:
                require(row['id'] not in seen and row['thread_id'] != foreign, 'History repeats or discloses a foreign row')
                seen.append(row['id'])
            if not page['has_more']:
                require(not page.get('cursor'), 'Complete history issues a cursor')
                break
            cursor = page['cursor']
            require(cursor and cursor not in cursors, 'History cursor does not advance')
            cursors.add(cursor)
            first_cursor = first_cursor or cursor
        require(seen == [row[id_key] for row in sorted(expected, key=lambda row: (row['rank'], row[id_key]), reverse=True)],
                'History loses rows across thread scope pages or timestamp ties')
        inst.request('GET', base + '&cursor=invalid', auth=owner, expect=(400,), label='history-invalid-' + collection)
        inst.request('GET', base + '&cursor=' + quote(first_cursor), auth=stranger, expect=(400,),
                     label='history-foreign-cursor-' + collection)
        saved[collection] = first_cursor
    inst.request('GET', '/api/v1/job-runs?cursor=' + quote(saved['jobs']), auth=owner, expect=(400,),
                 label='history-cross-collection')
    for thread in threads:
        inst.request('DELETE', '/api/v1/threads/' + thread, auth=owner, label='history-thread-delete')
    for collection in ('jobs', 'job-runs'):
        inst.request('GET', '/api/v1/' + collection + '?cursor=' + quote(saved[collection]),
                     auth=owner, expect=(400,), label='history-spent-' + collection)
        listing = inst.request('GET', '/api/v1/' + collection, auth=owner, label='history-empty-' + collection)
        require(listing['count'] == 0 and listing['has_more'] is False, 'Deleted owners retain history rows')
    inst.request('DELETE', '/api/v1/threads/' + foreign, auth=stranger, label='history-foreign-delete')
    for identifier, _ in members:
        inst.request('DELETE', '/api/v1/users/' + identifier, expect=(202,), label='history-member-delete')
    inst.evidence.save('job-history-pagination', {'jobs': len(expected), 'runs': len(expected),
        'scope_threads': len(threads), 'foreign_hidden': True, 'spent_refused': True})


REGISTRY = [Scenario('core_job_history_pagination', 'full', core_job_history_pagination, ('boot',),
    instance_setup=True, features=('kickside/core|http|GET /api/v1/jobs', 'kickside/core|http|GET /api/v1/job-runs'))]
