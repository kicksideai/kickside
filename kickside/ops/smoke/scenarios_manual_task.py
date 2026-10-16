"""Manual Automation uses its stored identity through the real slot worker."""
import json
import uuid
import yaml

from harness import Scenario, require
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_run_as_picker import _candidate_fixture
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity
from runtime import psql

KIND = 'kickside.automation.manual:task'


def _fixture(ctx, *, install_auth=None, cleanup_auth=None, bot_id=None, title='Picker root'):
    inst = ctx.inst
    inst.install('kickside/automation')
    suffix = uuid.uuid4().hex[:12]
    ns = 'smoke.manual_' + suffix
    table = 'smoke_manual_effect_' + suffix
    port = ns + ':action'
    with ctx.paused():
        directory = inst.app / ('src/manual-task-' + suffix)
        directory.mkdir()
        source = '''local sql = require("sql")
local security = require("security")
local execution_identity = require("execution_identity")
local json = require("json")
local M = {}
function M.write(request)
    if not security.can("manual.effect", "RESOURCE") then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "effect authority is required for actor " .. security.actor():id() .. " delivery " .. request.identity_key,
            details = {error_kind = "access"}})
    end
    local identity, identity_err = execution_identity.capture({component_id = request.automation_ref.id})
    if identity_err or not identity then return nil, identity_err end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local carried = (security.actor():meta() or {}).execution_identity
    local valid, validation_err = execution_identity.validate(carried)
    if not valid then db:release(); return nil, validation_err end
    if not execution_identity.same_principal(carried.principal, identity.principal)
        or not execution_identity.same_principal(carried.authorized_by, identity.authorized_by)
        or carried.component_id ~= identity.component_id then
        db:release()
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "carrier does not match capture"})
    end
    local encoded, encode_err = json.encode(carried)
    if encode_err then db:release(); return nil, encode_err end
    local input_json, input_err = json.encode(request.input)
    if input_err then db:release(); return nil, input_err end
    local _, write_err = db:execute("INSERT INTO TABLE (root,identity_key,actor_id,identity_json,input_json) VALUES ($1,$2,$3,$4,$5) ON CONFLICT(identity_key) DO NOTHING",
        {request.automation_ref.id,request.identity_key,security.actor():id(),encoded,input_json})
    db:release()
    if write_err then return nil, write_err end
    return {success = true, result = "created", dest_ref = {key = request.identity_key}}, nil
end
return M
'''.replace('RESOURCE', ns + ':effect').replace('TABLE', table)
        (directory / 'write.lua').write_text(source)
        entries = [
            {'name': 'write', 'kind': 'function.lua', 'source': 'file://write.lua', 'method': 'write',
             'modules': ['sql', 'security', 'json'], 'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'sink', 'kind': 'contract.binding', 'meta': {'delivery': 'exactly_once', 'input_shape': 'record'},
             'contracts': [{'contract': 'kickside.data:writable', 'methods': {'write': ns + ':write'}}]},
            {'name': 'action', 'kind': 'registry.entry', 'meta': {'type': 'kickside.automation.port', 'title': 'Manual effect'},
             'binding': ns + ':sink', 'input_schema': '{"type":"object","properties":{"text":{"type":"string"}},"required":["text"],"additionalProperties":false}',
             'operations': {'upsert': {}}},
            {'name': 'fixture_access', 'kind': 'security.policy', 'groups': ['kickside.security.groups:members', 'app.security:user'],
             'policy': {'actions': ['access', 'registry.get', 'funcs.call', 'contract.open', 'contract.call'],
                        'resources': [ns + ':*', 'write'], 'effect': 'allow'}},
        ]
        (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': ns, 'entries': entries}, sort_keys=False))
    ddl = 'CREATE TABLE ' + table + ' (root TEXT NOT NULL,identity_key TEXT PRIMARY KEY,actor_id TEXT NOT NULL,identity_json TEXT NOT NULL,input_json TEXT NOT NULL)'
    if inst.engine == 'postgres':
        psql(dict(inst.config['pg'], maintenance=inst.db), inst.env, ddl)
    else:
        database_rows(inst, ddl, write=True)
    fixture = _candidate_fixture(ctx, automation_type=KIND, install_auth=install_auth, cleanup_auth=cleanup_auth, bot_id=bot_id, install_input={
        'title': title, 'target': {'kind': 'action', 'port': port, 'input': {'text': 'fixed declaration'}}})
    fixture.update(table=table, port=port)
    _execution_access(inst, fixture)
    return fixture


def _execution_access(inst, fixture):
    inst.request('POST', '/api/v1/component-access/share/' + fixture['root'],
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 3}, auth=fixture['token'])


def _effects(inst, fixture):
    return database_rows(inst, 'SELECT identity_key,actor_id,identity_json,input_json FROM ' + fixture['table']
                         + " WHERE root='" + fixture['root'] + "' ORDER BY identity_key")


def _drive(inst, root):
    rows = database_rows(inst, "SELECT phase,event_seq,last_committed_occurrence_seq,last_error_json FROM kickside_automation_drive WHERE automation_id='"
                         + root + "' AND drive_key='main'")
    require(len(rows) == 1, 'Manual task does not retain exactly one main drive')
    return rows[0]


def _grant(inst, fixture):
    uid = fixture['member']['user_id']
    groups = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + uid + "'")
    inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': [row['group_id'] for row in groups] + fixture['delegation']['groups']})


def _proof(inst, fixture, rows):
    require(len(rows) == 1 and rows[0]['actor_id'] == fixture['bot'], 'Manual effect borrows the configuring human or worker identity')
    identity = json.loads(rows[0]['identity_json'])
    require(identity['principal'] == {'kind': 'user', 'id': fixture['bot']}
            and identity['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']}
            and identity['component_id'] == fixture['root'], 'Manual effect replaces its executor, original authorizer or protected root')
    require(json.loads(rows[0]['input_json']) == {'text': 'fixed declaration'}, 'Manual run replaces its fixed declared input')
    return identity


def _progress(inst, fixture):
    root = fixture['root']
    inst.evidence.save('manual-effect-progress', {'drive': _drive(inst, root), 'effects': _effects(inst, fixture),
        'bot': fixture['bot'], 'member': fixture['member']['user_id'], 'stored': _identity(inst, root),
        'deliveries': database_rows(inst, "SELECT item_key,state,execution_identity_json,identity_parked FROM kickside_trigger_item_ledger WHERE owner_id='" + root + "'")})


def manual_task_native_api(ctx):
    inst = ctx.inst
    fixture = _fixture(ctx)
    root, token = fixture['root'], fixture['token']
    original, generation = _identity(inst, root)
    require(not _effects(inst, fixture) and _drive(inst, root)['event_seq'] == 0, 'Manual install executes before an explicit run')
    action = '/api/v1/automations/' + root + '/actions/run_now'
    inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=token)
    inst.wait(lambda: _drive(inst, root)['phase'] == 'blocked_access', 'Human target lacks the native effect capability')
    require(not _effects(inst, fixture), 'Human task borrows the bot effect grant')
    _grant(inst, fixture)
    identity_path = '/api/v1/automations/' + root + '/identity'
    selected = inst.request('POST', identity_path, {'principal': {'kind': 'user', 'id': fixture['bot']},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': generation}, auth=token)
    require(selected['state'] == 'succeeded', 'Manual task does not admit its selected identity')
    retained = database_rows(inst, "SELECT item_key,state,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id='" + root + "'")
    require(len(retained) == 1 and retained[0]['state'] == 'parked'
            and json.loads(retained[0]['execution_identity_json'])['identity']['principal'] == original['principal'],
            'Selecting an executor retags an already admitted human delivery')
    require(not _effects(inst, fixture), 'Retained human work borrows newly selected bot access')
    human_root = root
    root = str(uuid.uuid4())
    delegation = {**fixture['delegation'], 'root': '*'}
    inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
    inst.cleanup.add('manual selected delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
        {'principal': delegation['principal'], 'root': delegation['root'], 'operation_id': uuid.uuid4().hex}))
    body = {'type': KIND, 'component_id': root, 'request_id': uuid.uuid4().hex,
            'principal': {'kind': 'user', 'id': fixture['bot']},
            'input': {'title': 'Selected manual task', 'target': {'kind': 'action', 'port': fixture['port'],
                'input': {'text': 'fixed declaration'}}}}
    installed = inst.request('POST', '/api/v1/automations/selected', body, auth=token)
    require(installed.get('success') is True and installed.get('id') == root, 'Manual staged installation does not retain its reserved root')
    inst.cleanup.add('manual selected root', lambda: inst.request('DELETE', '/api/v1/automations/' + root, auth=token))
    fixture = {**fixture, 'root': root}
    _execution_access(inst, fixture)
    staged, staged_generation = _identity(inst, root)
    require(staged['principal'] == body['principal'] and staged['authorized_by'] == original['authorized_by']
            and staged_generation == 1 and _drive(inst, root)['event_seq'] == 0 and not _effects(inst, fixture),
            'Staged manual installation executes early or loses its human authorization')
    require(inst.request('POST', '/api/v1/automations/selected', body, auth=token) == installed,
            'Staged manual replay changes its receipt')
    action = '/api/v1/automations/' + root + '/actions/run_now'
    request = uuid.uuid4().hex
    result = inst.request('POST', action, {'request_id': request, 'principal': original['principal'],
        'target': {'kind': 'action', 'port': 'absent:port', 'input': {'text': 'forged'}},
        'authorized_by': {'kind': 'user', 'id': fixture['bot']}}, auth=token)
    require(result['result']['state'] == 'succeeded', 'Fixed manual command does not succeed')
    try:
        inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'Stored bot identity executes its declared effect')
    finally:
        _progress(inst, fixture)
    rows = _effects(inst, fixture)
    identity = _proof(inst, fixture, rows)
    replay = inst.request('POST', action, {'request_id': request}, auth=token)
    require(replay['result']['generation'] == result['result']['generation'], 'Manual replay allocates another command')
    require(_effects(inst, fixture) == rows and _drive(inst, root)['event_seq'] == 1, 'Manual replay repeats or queues another effect')
    inst.request('PUT', '/api/v1/users/' + fixture['bot'], {'status': 'inactive'})
    inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=token)
    inst.wait(lambda: _drive(inst, root)['phase'] == 'blocked_identity', 'Disabled bot blocks the live manual boundary')
    require(_effects(inst, fixture) == rows, 'Disabled bot executes another effect')
    inst.evidence.save('manual-task-native-proof', {'root': root, 'identity': identity, 'effects': rows,
        'source': _drive(inst, root), 'command_replay': replay, 'disabled_effect_absent': True, 'retained_human_root': human_root, 'retained_human_delivery': retained})


def browser_automation_bot_run(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixture = _fixture(ctx)
    _grant(inst, fixture)
    root, bot = fixture['root'], fixture['bot']
    original, generation = _identity(inst, root)
    browser = ctx.browser_check()
    login_member(ctx, {**fixture['member'], 'email': fixture['email']})
    trace = inst.root / inst.evidence.label / 'automation-bot-run-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        manager.get_by_role('tab', name='Config', exact=True).click()
        editor = manager.locator('wc-execution-identity-editor')
        picker = editor.locator('wc-run-as-picker')
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text('Me', timeout=30000)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        path = '/api/v1/automations/' + root + '/identity'
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200 and response.value.json()['state'] == 'succeeded', 'Browser does not admit its selected bot')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        require(not _effects(inst, fixture), 'Picker save executes a manual task')
        drawer = manager.locator('aside')
        drawer.get_by_role('button', name='More actions for Picker root', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/actions/run_now')) as response:
            drawer.get_by_role('menuitem', name='Run Picker root now', exact=True).click()
        require(response.value.status == 200 and response.value.json()['result']['state'] == 'succeeded', 'Browser run does not admit its manual command')
        try:
            inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'Browser run executes with bot access', pump=browser.page.wait_for_timeout)
        finally:
            _progress(inst, fixture)
        rows = _effects(inst, fixture)
        identity = _proof(inst, fixture, rows)
        stored, stored_generation = _identity(inst, root)
        require(stored == identity and stored_generation == generation + 1 and stored['authorized_by'] == original['authorized_by'],
                'Browser execution changes the stored authorization')
        browser.screenshot('automation-bot-effect')
        browser.clean(0)
        inst.evidence.save('browser-automation-bot-effect-proof', {'root': root, 'bot': bot, 'identity': identity, 'effects': rows})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('manual_task_native_api', 'regression', manual_task_native_api,
                     issues=('BOT-MANUAL-EXECUTION-TASK', 'AUTOMATION-MANUAL-TASK-ACCESS', 'AUTOMATION-MANUAL-SOURCE', 'RA-H14', 'RA-H15', 'RA-H46', 'RA-H32', 'RA-S01')),
            Scenario('browser_automation_bot_run', 'regression', browser_automation_bot_run, ('boot',), instance_setup=True,
                     issues=('BOT-MANUAL-EXECUTION-TASK', 'AUTOMATION-MANUAL-TASK-ACCESS', 'AUTOMATION-MANUAL-SOURCE', 'AUTOMATION-DRAWER-ACTION-MENU-PLACEMENT', 'RA-B04', 'RA-S01'))]
