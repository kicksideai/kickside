"""A live Hub update preserves admitted uploads, automation rounds and workflow runs."""
import json
import re
from pathlib import Path
import shutil
import sqlite3
import uuid
from urllib.parse import quote
import yaml

from fixture_member_permissions import register_member_policy_grants
from harness import Scenario, require
from live_work_gate import work_gate
from module_lifecycle_contract import update_source
from scenarios import workflow, nav
from runtime import psql
from runtime_fixtures import isolated_fixture, complete_splashes
from contextlib import contextmanager

HERE = Path(__file__).resolve().parent
NS = 'app.smoke.hot_update_work'


def install_work_fixture(ctx, url):
    directory = ctx.inst.app / 'src' / 'hot-update-work'
    directory.mkdir(exist_ok=True)
    shutil.copyfile(HERE / 'mocks/hot_update_work/work.lua', directory / 'work.lua')
    entries = [
        {'name': name, 'kind': 'function.lua', 'source': 'file://work.lua', 'method': name,
         'modules': ['http_client', 'json', 'time']} for name in ('upload', 'transform')]
    entries += [
        {'name': 'type', 'kind': 'registry.entry', 'meta': {'type': 'upload.type', 'title': 'Hot update work'},
         'type_key': 'hot_update_work', 'priority': 500, 'extensions': ['hotwork'],
         'mime_types': [], 'pipeline': [{'title': 'Active upload work', 'func': NS + ':upload', 'options': {'url': url}}]},
        {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'actions': ['http_client.request'], 'resources': [url + '/*'], 'effect': 'allow'}},
        {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'actions': ['http_client.private_ip'], 'resources': ['127.0.0.1'], 'effect': 'allow'}},
        {'name': 'functions', 'kind': 'security.policy', 'groups': ['app.security:user'],
         'policy': {'actions': ['access'], 'resources': [NS + ':upload', NS + ':transform'], 'effect': 'allow'}},
    ]
    entries = register_member_policy_grants(ctx.inst.app, entries)
    (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))


def database_rows(inst, sql, *, write=False):
    if inst.engine == 'postgres':
        query = ('WITH smoke_rows AS (' + sql + ') SELECT COALESCE(json_agg(row_to_json(smoke_rows)), \'[]\'::json) FROM smoke_rows'
                 if write else 'SELECT COALESCE(json_agg(row_to_json(r)), \'[]\'::json) FROM (' + sql + ') r')
        result = psql(dict(inst.config['pg'], maintenance=inst.db), inst.env,
                      query)
        return json.loads(result)
    with sqlite3.connect('file:' + str(inst.root / 'data/app.db') + ('?mode=rw' if write else '?mode=ro'), uri=True) as db:
        db.row_factory = sqlite3.Row
        return [dict(row) for row in db.execute(sql)]


def active_automation(ctx, url, title, *, hook=None, enabled=True, deliveries=1):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    if hook is None:
        hook = inst.request('POST', '/api/v1/webhooks', {'label': title,
            'schema': {'type': 'object', 'properties': {'marker': {'type': 'string'}}}}, label='active-hook')['webhook']
    inst.redactor.add(hook['secret'])
    spec = {'title': title, 'enabled': enabled,
        'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received',
                    'config': {'thread_id': hook['thread_id']}, 'backfill': 'none'},
        'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
        'transform': {'kind': 'func', 'function': NS + ':transform', 'resource_id': hook['thread_id'],
                      'required_mask': 1, 'config': {'url': url, 'title': title}}}
    aid = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': spec}, label='active-sync')['id']
    for index in range(deliveries):
        delivery = title + (':' + str(index) if index else '')
        inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], {'marker': delivery}, auth=hook['secret'],
                     expect=(202,), headers={'Idempotency-Key': delivery}, label='active-delivery')
    return aid


def review_item(inst, wid, rid):
    detail = inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + rid, label='active-review-run')
    require(detail['run']['status'] not in ('completed', 'failed'), 'Workflow terminates before Hub update')
    items = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='active-review-items')['items']
    matches = [item for item in items if item.get('metadata', {}).get('run_id') == rid]
    require(len(matches) <= 1, 'Active workflow creates duplicate reviews')
    return matches[0] if matches and any(node.get('status') == 'waiting' for node in detail['nodes']) else None


def open_review_controls(ctx, item, form):
    browser = ctx.browser_check()
    nav(ctx, 'Inbox')
    inbox = browser.frame.locator('kickside-inbox')
    title = browser.frame.locator('.kx-item-title.pending').filter(
        has_text=re.compile('^' + re.escape(item['title']) + '$'))
    inbox.locator('button.kx-item').filter(has=title).click()
    detail = inbox.locator('.kx-detail')
    for name, value in form.items():
        require(isinstance(name, str) and isinstance(value, str), 'Review text form requires string names and values')
        detail.locator('[id=' + json.dumps('kx-df-' + name, ensure_ascii=False) + ']').fill(value)
    return detail


def completed_upload(inst, uid):
    row = inst.request('GET', '/api/v1/uploads/' + uid, label='updated-upload')['upload']
    require(row['status'] not in ('failed', 'error'), 'Updated upload fails: ' + str(row))
    return row if row['status'] == 'completed' else None


def completed_workflow(inst, wid, rid):
    detail = inst.request('GET', '/api/v1/workflows/' + wid + '/runs/' + rid, label='updated-workflow')
    require(detail['run']['status'] != 'failed', 'Updated workflow fails: ' + str(detail))
    return detail if detail['run']['status'] == 'completed' else None


def revision(directory, value):
    changed = []
    sources = set()
    prefix = 'do require("logger"):named("smoke.hot_update_work"):info('
    marker = prefix + json.dumps('hot-update-executable-' + value) + ') end\n'
    for index in (directory / 'src').rglob('_index.yaml'):
        document = yaml.safe_load(index.read_text())
        dirty = False
        for entry in document.get('entries', []):
            if entry.get('kind') in ('process.lua', 'function.lua', 'library.lua') and entry.get('meta', {}).get('type') != 'migration':
                entry.setdefault('meta', {})['hot_update_revision'] = value
                modules = entry.setdefault('modules', [])
                if 'logger' not in modules:
                    modules.append('logger')
                source = (index.parent / entry['source'].removeprefix('file://')).resolve()
                require(source.is_relative_to(directory.resolve()), 'Executable update source leaves its module tree')
                if source not in sources:
                    code = source.read_text()
                    if code.startswith(prefix):
                        code = code.split('\n', 1)[1]
                    source.write_text(marker + code)
                    sources.add(source)
                changed.append(document['namespace'] + ':' + entry['name'])
                dirty = True
        if dirty:
            index.write_text(yaml.safe_dump(document, sort_keys=False))
    require(changed, 'Module update has no executable entries')
    return changed


@contextmanager
def module_update_fixture(ctx, module, url):
    source = ctx.inst.config['replace'].get(module) or str(Path(ctx.inst.config['source']) / 'platform' / module.split('/')[1])
    directory = ctx.inst.root / ('module-update-source-' + uuid.uuid4().hex[:10])
    shutil.copytree(source, directory, ignore=shutil.ignore_patterns('.git', '.wippy', 'node_modules', '__pycache__'))
    changed = revision(directory, 'before')
    config = dict(ctx.inst.config, replace=dict(ctx.inst.config['replace'], **{module: str(directory)}))
    try:
        with isolated_fixture(ctx, config=config) as fixture:
            fixture.inst.stop()
            install_work_fixture(fixture, url)
            fixture.inst.start()
            complete_splashes(fixture, 'welcome', 'first_agent')
            fixture.browser_check().login()
            yield fixture, directory, changed
    finally:
        shutil.rmtree(directory)


def active_work_update(ctx, module):
    with work_gate() as (gate, url), module_update_fixture(ctx, module, url) as (fixture, source, changed):
        inst = fixture.inst
        for dependency in ('kickside/uploads', 'kickside/automation', 'kickside/workflows', 'kickside/inbox'):
            inst.install(dependency)
        browser = fixture.browser
        logins = []
        browser.page.on('request', lambda request: logins.append(request.url)
                        if '/api/public/user/token' in request.url and request.method == 'POST' else None)
        title = 'Hot update work ' + uuid.uuid4().hex[:12]
        wid, version = workflow(fixture, review=True)
        rid = inst.request('POST', '/api/v1/workflows/' + wid + '/run',
            {'version': version, 'input': {'marker': title}}, label='active-workflow-run')['run_id']
        item = inst.wait(lambda: review_item(inst, wid, rid), 'Workflow waits across Hub update', seconds=60)
        path = inst.root / (title.replace(' ', '-') + '.hotwork')
        path.write_text(title)
        uid = inst.upload(path, 'active-upload')['uuid']
        aid = active_automation(fixture, url, title)
        try:
            inst.wait(lambda: all(gate.snapshot().get(key, {}).get('entered') == 1
                                 for key in ('upload', 'automation')), 'Upload and automation execute before update', seconds=60)
            require(all(row['effects'] == 0 for row in gate.snapshot().values()), 'Work completes before Hub update')
            admitted = database_rows(inst, "SELECT id, job_type, status, slot, execution_seq, attempts FROM kickside_job WHERE status = 'running' AND (id IN (SELECT job_id FROM kickside_automation_drive WHERE automation_id = '" + aid + "') OR CAST(payload AS TEXT) LIKE '%" + uid + "%')")
            require(len(admitted) >= 2, 'Upload and automation have no admitted running jobs: ' + str(admitted))
            pid = inst.process.pid
            inst.evidence.save('active-work-before-update', {'module': module, 'pid': pid,
                'upload_id': uid, 'automation_id': aid, 'workflow_id': wid, 'run_id': rid,
                'jobs': admitted, 'barriers': gate.snapshot()})
            revision(source, 'after')
            update_source(fixture, str(source), module, live=True)
            for entry in changed:
                applied = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(entry, safe=''), label='applied-module-revision')['entry']
                require(applied.get('meta', {}).get('hot_update_revision') == 'after', 'Hub does not apply candidate code entry ' + entry)
            require(inst.process.pid == pid, 'Live update changes the runtime PID')
            require(gate.snapshot() == {'upload': {'entered': 1, 'effects': 0},
                                       'automation': {'entered': 1, 'effects': 0}}, 'Hub update duplicates or completes held work')
            review_item(inst, wid, rid)
            require(completed_upload(inst, uid) is None, 'Upload completes while its processor is held')
            gate.release()
            upload = inst.wait(lambda: completed_upload(inst, uid), 'Upload completes after Hub update', seconds=120)
            require(upload.get('meta', {}).get('hot_update_receipt') == uid, 'Upload loses its processor effect')
            def receipt():
                rows = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='updated-round-receipts')['items']
                matches = [row for row in rows if row['title'] == title]
                require(len(matches) <= 1, 'Updated automation duplicates its sink effect')
                return matches[0] if matches else None
            delivered = inst.wait(receipt, 'Automation round delivers after Hub update', seconds=60)
            review_path = '/api/v1/inbox/' + quote(item['id'], safe='') + '/approve'
            inst.request('POST', review_path, {'form': {'reason': title}}, label='updated-review-approve')
            done = inst.wait(lambda: completed_workflow(inst, wid, rid), 'Workflow completes after Hub update', seconds=60)
            require('approve' in json.dumps(done['run']['output']), 'Workflow loses its review result')
            runs = inst.request('GET', '/api/v1/workflows/' + wid + '/runs', label='updated-runs')['runs']
            require(len(runs) == 1 and runs[0]['run_id'] == rid, 'Hub update duplicates the workflow run')
            def completion_event():
                events = inst.request('GET', '/api/v1/threads/' + wid + '/events', label='updated-workflow-effects')['events']
                terminal = [row for row in events if row['type'] == 'kickside.workflows.runs.events:finished']
                require(len(terminal) <= 1, 'Workflow duplicates its terminal completion event')
                publication = database_rows(inst, "SELECT status, terminal_event_pending, terminal_event_check_at FROM workflow_runs WHERE run_id = '" + rid + "'")
                return terminal if terminal and len(publication) == 1 and not publication[0]['terminal_event_pending'] else None
            try:
                terminal = inst.wait(completion_event, 'Workflow has one acknowledged terminal completion event', seconds=35)
            finally:
                inst.evidence.save('workflow-terminal-publication-state', database_rows(inst,
                    "SELECT status, terminal_event_pending, terminal_event_check_at, terminal_event_token FROM workflow_runs WHERE run_id = '" + rid + "'"))
            ids = ','.join("'" + row['id'] + "'" for row in admitted)
            def jobs_finished():
                rows = database_rows(inst, 'SELECT id, status, execution_seq, attempts FROM kickside_job WHERE id IN (' + ids + ')')
                require(all(row['status'] not in ('dead', 'cancelled') for row in rows), 'Hub update fails an admitted job: ' + str(rows))
                before = {row['id']: row for row in admitted}
                return rows if len(rows) == len(admitted) and all(
                    row['status'] == ('pending' if before[row['id']]['slot'] else 'done') for row in rows) else None
            jobs = inst.wait(jobs_finished, 'No admitted job remains stuck after Hub update', seconds=60)
            executions = database_rows(inst, 'SELECT job_id, execution_seq, status, finished_at FROM kickside_job_run WHERE job_id IN (' + ids + ')')
            for job in admitted:
                execution = [row for row in executions if row['job_id'] == job['id'] and row['execution_seq'] == job['execution_seq']]
                require(len(execution) == 1 and execution[0]['status'] in ('success', 'completed') and execution[0]['finished_at'], 'An admitted execution has no single durable successful terminal record')
            require(all(row['slot'] or next(value for value in jobs if value['id'] == row['id'])['execution_seq'] == row['execution_seq'] for row in admitted), 'Hub update re-executes a finite job')
            require(gate.snapshot() == {'upload': {'entered': 1, 'effects': 1},
                                       'automation': {'entered': 1, 'effects': 1}}, 'Live update loses or duplicates an external effect')
            browser.reload()
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            nav(fixture, 'Inbox')
            require(not logins and '/login' not in browser.page.url, 'Live Hub update logs the browser out')
            inst.wait(lambda: 'hot-update-executable-after' in (inst.root / 'runtime.log').read_text(),
                      'Updated executable source runs after Hub install', seconds=35)
            browser.screenshot('live-update-session-and-receipt')
            inst.evidence.save('active-work-after-update', {'module': module, 'pid': inst.process.pid,
                'upload': upload, 'receipt': delivered, 'run': done['run'], 'completion_events': terminal,
                'jobs': jobs, 'executions': executions, 'barriers': gate.snapshot(),
                'browser_session_continues': True, 'executable_revision_observed': True})
        finally:
            gate.release()


def upload_update(ctx):
    active_work_update(ctx, 'kickside/uploads')


def automation_update(ctx):
    active_work_update(ctx, 'kickside/automation')


def workflow_update(ctx):
    active_work_update(ctx, 'kickside/workflows')


REGISTRY = [
    Scenario('hot_update_active_upload', 'regression', upload_update, ('boot',),
             issues=('HOT-UPDATE-INFLIGHT-EXACTLY-ONCE', 'HOT-UPDATE-WORKFLOW-PUBLICATION-DEADLINE', 'R5-T09'), instance_setup=True),
    Scenario('hot_update_active_automation', 'regression', automation_update, ('boot',),
             issues=('HOT-UPDATE-INFLIGHT-EXACTLY-ONCE', 'HOT-UPDATE-WORKFLOW-PUBLICATION-DEADLINE', 'R5-T09'), instance_setup=True),
    Scenario('hot_update_active_workflow', 'regression', workflow_update, ('boot',),
             issues=('HOT-UPDATE-INFLIGHT-EXACTLY-ONCE', 'HOT-UPDATE-WORKFLOW-PUBLICATION-DEADLINE'), instance_setup=True),
]
