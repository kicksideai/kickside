"""Published Workflow uses the shared manual task and retained execution identity."""
import json
import uuid

import yaml

from harness import Failure, Scenario, require
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import KIND, _fixture, _effects, _drive
from scenarios_run_as_browser import _bot_fixture
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def _workflow_fixture(ctx, *, review=False, review_assignee=None, review_token=None,
                      bot_id=None, execution_group=None):
    inst = ctx.inst
    fixture = _fixture(ctx, bot_id=bot_id,
                       effect_groups=['kickside.security.groups:members', execution_group] if execution_group else None,
                       execution_group=execution_group or 'app.security:admin')
    inst.install('kickside/workflows')
    if review:
        inst.install('kickside/inbox')
        inst.request('POST', '/api/v1/inbox', {'item_type': 'notice', 'title': 'Reviewer setup', 'content': 'Recipient Inbox'}, auth=review_token or fixture['token'])
    ns = fixture['port'].split(':')[0]
    with ctx.paused():
        directory = inst.app / ('src/workflow-selected-' + uuid.uuid4().hex[:12])
        directory.mkdir()
        restricted_spawn_guard = '''local await_spawn = security.can("process.spawn", "kickside.blocks:await")
    if not await_spawn then
        error("declared Await process access is required")
    end
    local unrelated_spawn = security.can("process.spawn", "kickside.core.retention.service:sweeper_process")
    if unrelated_spawn then
        error("restricted executor can spawn an unrelated retention process")
    end
    local directory_binding = security.can("contract.open", "kickside.users.directory:directory_binding")
    if directory_binding then
        error("restricted executor can open the principal directory binding")
    end'''
        restricted_spawn_checks = '''        await_spawn = await_spawn,
        unrelated_spawn = unrelated_spawn,
        directory_binding = directory_binding,'''
        restricted_assignment_guard = ''
        restricted_assignment_checks = ''
        if execution_group and review:
            recipient = fixture['member']['user_id']
            restricted_assignment_guard = '''local assigned_recipient = security.can("inbox.assign", "RECIPIENT")
    if not assigned_recipient then
        error("declared Inbox assignment access is required")
    end
    local other_recipient = security.can("inbox.assign", "user:00000000-0000-0000-0000-000000000000")
    if other_recipient then
        error("restricted executor can assign an unrelated Inbox recipient")
    end'''.replace('RECIPIENT', 'user:' + recipient)
            restricted_assignment_checks = '''        assigned_recipient = assigned_recipient,
        other_recipient = other_recipient,'''
        source = '''local security = require("security")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local execution_identity = require("execution_identity")
local M = {}
function M.effect(request)
    if not security.can("manual.effect", "RESOURCE") then
        error("effect authority is required")
    end
    if not security.scope() then error("native execution scope is required") end
    if not security.can("funcs.call", "FUNCTION") then
        error("declared workflow function access is required")
    end
    RESTRICTED_SPAWN_GUARD
    RESTRICTED_ASSIGNMENT_GUARD
    local identity, identity_err = execution_identity.capture()
    if identity_err or not identity then error(identity_err) end
    local carried = (security.actor():meta() or {}).execution_identity
    local valid, validate_err = execution_identity.validate(carried)
    if not valid then error(validate_err) end
    if not execution_identity.same_principal(identity.principal, carried.principal)
        or not execution_identity.same_principal(identity.authorized_by, carried.authorized_by)
        or identity.component_id ~= carried.component_id then error("carrier disagrees with capture") end
    local encoded, encode_err = json.encode(carried)
    if encode_err then error(encode_err) end
    local input_json, input_err = json.encode(request.input)
    if input_err then error(input_err) end
    local scope_checks, checks_err = json.encode({
        registry_write = security.can("registry.apply", "*"),
        users_management = security.can("access", "kickside.users.api:list_users.endpoint"),
RESTRICTED_SPAWN_CHECKS
RESTRICTED_ASSIGNMENT_CHECKS
    })
    if checks_err then error(checks_err) end
    local db, db_err = sql.get("app:db")
    if db_err or not db then error(db_err) end
    local _, write_err = db:execute("INSERT INTO TABLE (root,identity_key,actor_id,identity_json,input_json,scope_checks_json) VALUES ($1,$2,$3,$4,$5,$6)",
        {identity.component_id,uuid.v4(),security.actor():id(),encoded,input_json,scope_checks})
    db:release()
    if write_err then error(write_err) end
    return request.input
end
return M
'''.replace('RESOURCE', ns + ':effect').replace('FUNCTION', ns + ':workflow_effect').replace('RESTRICTED_SPAWN_GUARD', restricted_spawn_guard if execution_group else '').replace('RESTRICTED_ASSIGNMENT_GUARD', restricted_assignment_guard).replace('RESTRICTED_SPAWN_CHECKS', restricted_spawn_checks if execution_group else '').replace('RESTRICTED_ASSIGNMENT_CHECKS', restricted_assignment_checks).replace('TABLE', fixture['table'])
        (directory / 'effect.lua').write_text(source)
        schema = {'type': 'object', 'additionalProperties': True}
        entries = [
            {'name': 'workflow_effect', 'kind': 'function.lua', 'source': 'file://effect.lua', 'method': 'effect',
             'modules': ['security', 'sql', 'json', 'uuid'], 'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'block.effect', 'kind': 'registry.entry', 'meta': {'type': 'kickside.block', 'public': True, 'title': 'Identity effect'},
             'data': {'block': {'api_version': 'kickside.block/v1', 'input': schema, 'output': schema,
                      'config': {'type': 'object', 'additionalProperties': False},
                      'error': {'type': 'object', 'properties': {'code': {'type': 'string'}, 'message': {'type': 'string'}}},
                      'ports': [{'id': 'out', 'direction': 'out'}, {'id': 'failed', 'direction': 'out'}], 'presentation': {'category': 'Utilities', 'icon': 'tabler:check'},
                      'execution': {'kind': 'function', 'function_id': ns + ':workflow_effect'}}}},
        ]
        if execution_group:
            entries.append({'name': 'restricted_workflow_effect_access', 'kind': 'security.policy',
                            'groups': [execution_group],
                            'policy': {'actions': ['manual.effect'],
                                       'resources': [ns + ':effect'], 'effect': 'allow'}})
        if execution_group and review:
            entries.append({'name': 'restricted_inbox_assignment', 'kind': 'security.policy',
                            'groups': [execution_group],
                            'policy': {'actions': ['inbox.assign'],
                                       'resources': ['user:' + fixture['member']['user_id']], 'effect': 'allow'}})
        (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': ns, 'entries': entries}, sort_keys=False))
    title = 'Published identity flow ' + uuid.uuid4().hex[:8]
    token = fixture['token']
    wid = inst.request('POST', '/api/v1/workflows', {'title': title}, auth=token)['flow_id']
    fixture.update(workflow=wid, workflow_title=title)
    inst.request('POST', '/api/v1/component-access/share/' + wid,
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 3}, auth=token)
    if execution_group:
        inst.request('POST', '/api/v1/component-access/share/' + wid,
            {'subject_type': 'group', 'subject_id': execution_group, 'access_mask': 3}, auth=token)
    schema = {'type': 'object', 'properties': {'text': {'type': 'string'}}, 'required': ['text'], 'additionalProperties': True}
    nodes = [{'type': 'node.add', 'body': {'id': 'start', 'kind': 'start', 'config': {'input_schema': schema}}},
             {'type': 'node.add', 'body': {'id': 'effect', 'kind': 'block', 'ref': ns + ':block.effect', 'config': {}}},
             {'type': 'node.add', 'body': {'id': 'finish', 'kind': 'finish', 'config': {'output_schema': {'type': 'object', 'additionalProperties': True}}}}]
    def edge(name, source, target, port):
        return {'type': 'edge.add', 'body': {'id': name, 'source_id': source, 'target_id': target, 'source_port': port, 'target_port': 'in'}}
    if review:
        nodes.append({'type': 'node.add', 'body': {'id': 'review', 'kind': 'block', 'ref': 'kickside.inbox:block.review',
            'config': {'assignee': review_assignee or fixture['member']['user_id'], 'prompt': 'Approve retained identity',
                       'form': {'type': 'object', 'properties': {'reason': {'type': 'string'}}, 'required': ['reason']}}}})
        nodes += [edge('start-review', 'start', 'review', 'out'), edge('review-effect', 'review', 'effect', 'then')]
    else:
        nodes.append(edge('start-effect', 'start', 'effect', 'out'))
    nodes.append(edge('effect-finish', 'effect', 'finish', 'out'))
    inst.request('POST', '/api/v1/workflows/' + wid + '/apply', {'commands': nodes}, auth=token)
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {}, auth=token)['version']
    inst.request('POST', '/api/v1/workflows/' + wid + '/apply', {'commands': [
        {'type': 'node.update', 'body': {'id': 'start', 'config': {'input_schema': {
            'type': 'object', 'properties': {'draft_only': {'type': 'string'}}, 'required': ['draft_only']}}}}]}, auth=token)
    fixture['version'] = version
    fixture['target'] = {'kind': 'workflow', 'flow_ref': {'kind': 'flow', 'id': wid, 'version': version}, 'input': {'text': 'published input'}}
    return fixture


def _delegate(inst, fixture):
    delegation = {**fixture['delegation'], 'root': '*'}
    inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
    inst.cleanup.add('published launch delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
        {'principal': delegation['principal'], 'root': delegation['root'], 'operation_id': uuid.uuid4().hex}))
    uid = fixture['member']['user_id']
    groups = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + uid + "'")
    inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': [row['group_id'] for row in groups] + delegation['groups']})


def _runs(inst, fixture):
    return database_rows(inst, "SELECT run_id,status,execution_identity_json FROM workflow_runs WHERE workflow_id='"
                         + fixture['workflow'] + "' AND trigger_id='" + fixture['root'] + "'")


def _review_decision(inst, fixture, run_id, *, reviewer_token=None):
    def waiting():
        detail = inst.request('GET', '/api/v1/workflows/' + fixture['workflow'] + '/runs/' + run_id, auth=fixture['token'])
        require(detail['run']['status'] not in ('failed', 'completed'), 'Selected review terminates before decision: ' + str(detail))
        return detail if any(node.get('status') == 'waiting' for node in detail['nodes']) else None
    inst.wait(waiting, 'Selected Workflow reaches Await', seconds=60)
    require(not _effects(inst, fixture), 'Selected review performs its effect before approval')
    def item():
        items = inst.request('GET', '/api/v1/inbox?status=all&limit=200', auth=reviewer_token or fixture['token'])['items']
        matched = [row for row in items if row.get('metadata', {}).get('run_id') == run_id]
        require(len(matched) <= 1, 'Selected review duplicates decisions')
        return matched[0] if matched else None
    return inst.wait(item, 'Human receives selected Workflow decision', seconds=35)


def _run_proof(inst, fixture, *, review=False, restricted_baseline=False):
    try:
        rows = inst.wait(lambda: value if len(value := _runs(inst, fixture)) == 1 else None,
                         'Selected Workflow creates one run', seconds=60)
    except Failure:
        inst.evidence.save('selected-workflow-run-timeout', {
            'root': fixture['root'], 'drive': _drive(inst, fixture['root']), 'runs': _runs(inst, fixture)})
        raise
    stored, generation = _identity(inst, fixture['root'])
    identity = json.loads(rows[0]['execution_identity_json'])
    require(identity == stored and generation == 1 and identity['principal'] == {'kind': 'user', 'id': fixture['bot']}
            and identity['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']}, 'Workflow replaces admitted identity')
    if review:
        decision = _review_decision(inst, fixture, rows[0]['run_id'])
        inst.request('POST', '/api/v1/inbox/' + decision['id'] + '/approve', {'form': {'reason': 'human decision'}}, auth=fixture['token'])
    def completed():
        detail = inst.request('GET', '/api/v1/workflows/' + fixture['workflow'] + '/runs/' + rows[0]['run_id'], auth=fixture['token'])
        require(detail['run']['status'] != 'failed', 'Selected Workflow fails: ' + str(detail))
        return detail if detail['run']['status'] == 'completed' else None
    done = inst.wait(completed, 'Selected Workflow completes with executor access', seconds=60)
    effects = _effects(inst, fixture)
    require(len(effects) == 1 and effects[0]['actor_id'] == fixture['bot']
            and json.loads(effects[0]['identity_json']) == stored, 'Workflow effect borrows human/reviewer/worker authority')
    expected = 'human decision' if review else 'published input'
    require(expected in json.dumps(done['run']['output']) and expected in effects[0]['input_json'], 'Published input/decision does not reach actual effect')
    require(_runs(inst, fixture)[0]['execution_identity_json'] == rows[0]['execution_identity_json'], 'Await/resume rewrites identity')
    if restricted_baseline:
        require(json.loads(effects[0]['scope_checks_json']) == {
                    'await_spawn': True, 'unrelated_spawn': False,
                    'directory_binding': False, 'assigned_recipient': True, 'other_recipient': False,
                    'registry_write': False, 'users_management': False},
                'Restricted Workflow executor gains principal-directory, unrelated recipient/process, registry, or Users-management authority')
    inst.evidence.save('selected-workflow-proof', {'root': fixture['root'], 'workflow': fixture['workflow'], 'identity': identity, 'run': done, 'effects': effects, 'review': review})
    return done


def _restricted_baseline_bot(ctx):
    inst = ctx.inst
    inst.install('kickside/automation')
    inst.install('kickside/workflows')
    inst.install('kickside/blocks')
    inst.install('kickside/inbox')
    catalog = inst.request('GET', '/api/v1/security/policies', label='restricted-workflow-module-policies')['policies']
    module_policies = []
    for surface in ('kickside.automation', 'kickside.workflows', 'kickside.blocks', 'kickside.inbox'):
        matches = [row['id'] for row in catalog
                   if row.get('intent') == 'module_access' and row.get('surface') == surface]
        require(len(matches) == 1, 'Restricted Workflow executor lacks one canonical module-access policy: ' + surface)
        module_policies.append(matches[0])
    slug = 'workflow-executor-' + uuid.uuid4().hex[:12]
    execution_group = 'kickside.security.scopes:' + slug
    inst.request('POST', '/api/v1/security/scopes', {
        'slug': slug, 'label': 'Restricted Workflow executor', 'policies': module_policies, 'enabled': True})
    inst.cleanup.add('restricted Workflow executor scope', lambda: inst.request(
        'DELETE', '/api/v1/security/scopes?slug=' + slug))
    groups = ['app.security:user', execution_group]
    bot = _bot_fixture(inst, 'workflow-restricted-bot-' + uuid.uuid4().hex[:12] + '@smoke.example', groups=groups)
    actual_groups = {row['group_id'] for row in database_rows(
        inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + bot + "'")}
    require(actual_groups == set(groups) and not any('admin' in group or 'members' in group for group in actual_groups),
            'Restricted Workflow executor has Admin, Members, or an undeclared baseline group')
    return bot, execution_group, module_policies


def workflow_selected_identity(ctx):
    inst = ctx.inst
    for review in (False, True):
        fixture = _workflow_fixture(ctx, review=review)
        if not review:
            human = inst.request('POST', '/api/v1/workflows/' + fixture['workflow'] + '/run',
                {'version': fixture['version'], 'input': {'text': 'human control'}}, auth=fixture['token'])
            def human_failed():
                detail = inst.request('GET', '/api/v1/workflows/' + fixture['workflow'] + '/runs/' + human['run_id'], auth=fixture['token'])
                require(detail['run']['status'] != 'completed', 'Human run borrows bot effect access')
                return detail if detail['run']['status'] == 'failed' else None
            inst.wait(human_failed, 'Unchanged human run retains its denied effect authority', seconds=60)
            rows = database_rows(inst, "SELECT execution_identity_json FROM workflow_runs WHERE run_id='" + human['run_id'] + "'")
            human_identity = json.loads(rows[0]['execution_identity_json'])
            require(human_identity['principal'] == {'kind': 'user', 'id': fixture['member']['user_id']}
                    and human_identity['authorized_by'] == human_identity['principal'], 'Existing human Workflow path changes its identity')
            require(not _effects(inst, fixture), 'Human run performs a bot-only effect')
        _delegate(inst, fixture)
        root = str(uuid.uuid4())
        fixture['root'] = root
        body = {'type': KIND, 'component_id': root, 'request_id': uuid.uuid4().hex, 'parent_id': fixture['workflow'],
                'principal': {'kind': 'user', 'id': fixture['bot']}, 'input': {'title': 'Published Workflow run', 'target': fixture['target']}}
        inst.request('POST', '/api/v1/automations/selected', body, auth=fixture['token'])
        inst.cleanup.add('selected workflow root', lambda root=root, token=fixture['token']: inst.request('DELETE', '/api/v1/automations/' + root, auth=token))
        require(not _runs(inst, fixture) and _drive(inst, root)['event_seq'] == 0, 'Published Workflow starts during installation')
        request = {'request_id': uuid.uuid4().hex, 'principal': {'kind': 'user', 'id': fixture['member']['user_id']}, 'input': {'text': 'forged'}}
        path = '/api/v1/automations/' + root + '/actions/run_now'
        admitted = inst.request('POST', path, request, auth=fixture['token'])
        require(admitted['result']['state'] == 'succeeded', 'Selected Workflow command is not admitted')
        _run_proof(inst, fixture, review=review)
        inst.request('POST', path, request, auth=fixture['token'])
        require(len(_runs(inst, fixture)) == 1 and _drive(inst, root)['event_seq'] == 1, 'Workflow command replay duplicates work')


def _browser_workflow_selected(ctx, fixture, *, restricted_baseline=False):
    from playwright.sync_api import expect
    inst = ctx.inst
    browser = ctx.browser_check()
    login_member(ctx, {**fixture['member'], 'email': fixture['email']})
    trace_name = 'workflow-selected-restricted-trace.zip' if restricted_baseline else 'workflow-selected-trace.zip'
    trace = inst.root / inst.evidence.label / trace_name
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    trace_active = True
    try:
        def panel():
            nav(ctx, 'Workflows')
            builder = browser.frame.locator('kickside-workflow-builder')
            builder.get_by_text(fixture['workflow_title'], exact=True).click()
            builder.get_by_role('button', name='Run published', exact=True).click()
            return builder.get_by_role('region', name='Run published Workflow', exact=True)
        surface = panel()
        launcher = surface.locator('wc-manual-task-launcher')
        picker = launcher.locator('wc-run-as-picker')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_have_count(0)
        picker.get_by_role('option', name='Me', exact=True).click()
        denied_root = str(uuid.uuid4())
        inst.request('POST', '/api/v1/automations/selected', {'type': KIND, 'component_id': denied_root,
            'request_id': uuid.uuid4().hex, 'parent_id': fixture['workflow'], 'principal': {'kind': 'user', 'id': fixture['bot']},
            'input': {'title': 'Denied published run', 'target': fixture['target']}}, auth=fixture['token'], expect=(403,))
        require(not database_rows(inst, "SELECT component_id FROM kickside_components WHERE component_id='" + denied_root + "'"),
                'Ungrant selected request creates a protected root')
        browser.clean(0)
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))
        trace_active = False
        _delegate(inst, fixture)
        login_member(ctx, {**fixture['member'], 'email': fixture['email']})
        trace = trace.with_name('workflow-selected-granted-trace.zip')
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        trace_active = True
        surface = panel()
        surface.locator('textarea').fill('{"text":"published input"}')
        launcher = surface.locator('wc-manual-task-launcher')
        picker = launcher.locator('wc-run-as-picker')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        delegation = fixture['delegation']
        inst.request('DELETE', '/api/v1/security/delegations', {'principal': delegation['principal'], 'root': '*', 'operation_id': uuid.uuid4().hex})
        with browser.rejection('POST', '/api/v1/automations/selected', 403) as refused:
            launcher.get_by_role('button', name='Queue run', exact=True).click()
        expect(launcher.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(launcher.get_by_role('status')).to_have_count(0)
        denied = refused.value.request.post_data_json
        require(not database_rows(inst, "SELECT component_id FROM kickside_components WHERE component_id='" + denied['component_id'] + "'"),
                'Revoked selection creates a protected root')
        inst.request('POST', '/api/v1/security/delegations', {**delegation, 'root': '*', 'operation_id': uuid.uuid4().hex})
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/automations/selected')) as response:
            launcher.get_by_role('button', name='Retry run', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success') is True, 'Browser selected installation fails')
        require(response.value.request.post_data_json == denied, 'Browser retry changes its staged command')
        fixture['root'] = response.value.json()['id']
        inst.cleanup.add('browser selected workflow root', lambda: inst.request('DELETE', '/api/v1/automations/' + fixture['root'], auth=fixture['token']))
        expect(launcher.get_by_role('status')).to_contain_text('Run queued', timeout=30000)
        _run_proof(inst, fixture, review=True, restricted_baseline=restricted_baseline)
        browser.screenshot('published-workflow-bot-effect')
        browser.clean(0)
    finally:
        if trace_active:
            browser.context.tracing.stop(path=str(trace))
            inst.evidence.paths.append(str(trace))


def browser_workflow_selected(ctx):
    _browser_workflow_selected(ctx, _workflow_fixture(ctx, review=True))


def browser_workflow_selected_restricted_baseline(ctx):
    bot, execution_group, module_policies = _restricted_baseline_bot(ctx)
    fixture = _workflow_fixture(ctx, review=True, bot_id=bot, execution_group=execution_group)
    fixture['restricted_baseline'] = {'groups': ['app.security:user', execution_group],
                                      'module_policies': module_policies,
                                      'fixture_effect_policy': {
                                          'id': fixture['port'].split(':')[0] + ':restricted_workflow_effect_access',
                                          'actions': ['manual.effect'],
                                          'resources': [fixture['port'].split(':')[0] + ':effect']},
                                      'fixed_recipient_policy': {
                                          'id': fixture['port'].split(':')[0] + ':restricted_inbox_assignment',
                                          'actions': ['inbox.assign'],
                                          'resources': ['user:' + fixture['member']['user_id']]}}
    ctx.inst.evidence.save('selected-workflow-restricted-baseline', {
        'bot': bot, **fixture['restricted_baseline']})
    _browser_workflow_selected(ctx, fixture, restricted_baseline=True)


REGISTRY = [Scenario('workflow_selected_identity', 'regression', workflow_selected_identity,
                     issues=('BOT-WORKFLOW-PUBLISHED-LAUNCH', 'BOT-MANUAL-TASK-LAUNCHER', 'RA-H39', 'WORKFLOW-SELECTED-READ-INTERMITTENT', 'DATAFLOW-EXECUTION-FRAME-POLICY-CAP')),
            Scenario('browser_workflow_selected', 'regression', browser_workflow_selected, ('boot',), instance_setup=True,
                     issues=('USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-WORKFLOW-PUBLISHED-LAUNCH', 'BOT-MANUAL-TASK-LAUNCHER', 'RA-B08', 'RA-B09', 'RA-B10', 'RA-H39', 'AUTOMATION-SELECTED-INSTALL-PREFLIGHT', 'WORKFLOW-SELECTED-READ-INTERMITTENT', 'WORKFLOW-UNADMITTED-RUN-READ-PROJECTION')),
            Scenario('browser_workflow_selected_restricted_baseline', 'regression', browser_workflow_selected_restricted_baseline, ('boot',), instance_setup=True,
                     issues=('EXECUTION-BASELINE-IDENTITY-RESOLUTION', 'RA-B05', 'BOT-WORKFLOW-PUBLISHED-LAUNCH', 'BOT-MANUAL-TASK-LAUNCHER'))]
