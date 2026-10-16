"""Agent background launches use the shared selected manual task and real tools."""
import json
import uuid
import yaml

from harness import Scenario, require
from runtime import psql
from scenarios import nav
from scenarios_core import navigation
from scenarios_hot_update_work import database_rows
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity, _owned_root
from scenarios_manual_task import _drive


def model_tool_fixture(ctx, *, allow_groups=(), deny_groups=(), effect_groups=(), before_tool_response=None):
    inst = ctx.inst
    inst.install('kickside/automation')
    suffix = uuid.uuid4().hex[:12]
    namespace = 'smoke.agent_effect_' + suffix
    table = 'smoke_agent_effect_' + suffix
    token = uuid.uuid4().hex
    inst.redactor.add(token)
    base = ctx.fixtures.start('openai-tools', tool_names=['RecordExecutionEffect', 'RecordHumanEffect'], token=token,
                              before_tool_response=before_tool_response)
    inst.cleanup.add('agent model fixture', ctx.fixtures.stop)
    with ctx.paused():
        directory = inst.app / ('src/agent-effect-' + suffix)
        directory.mkdir()
        (directory / 'effect.lua').write_text('''local security = require("security")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local execution_identity = require("execution_identity")
local M = {}
local function record(action)
    if not security.can(action, "RESOURCE") then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = action .. " access is required"})
    end
    local actor = security.actor()
    local carried = (actor:meta() or {}).execution_identity
    local valid, validation_err = execution_identity.validate(carried)
    if not valid then return nil, validation_err end
    local captured, capture_err = execution_identity.capture({component_id = carried.component_id})
    if capture_err or not captured then return nil, capture_err end
    if not execution_identity.same_principal(carried.principal, captured.principal)
        or not execution_identity.same_principal(carried.authorized_by, captured.authorized_by)
        or carried.component_id ~= captured.component_id then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "agent tool carrier differs from native capture"})
    end
    local encoded, encode_err = json.encode(carried)
    if encode_err then return nil, encode_err end
    local scope_checks, checks_err = json.encode({
        registry_write = security.can("registry.apply", "*"),
        users_management = security.can("access", "kickside.users.api:list_users.endpoint"),
    })
    if checks_err then return nil, checks_err end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local _, write_err = db:execute("INSERT INTO TABLE (effect_id,root,actor_id,identity_json,action,scope_checks_json) VALUES($1,$2,$3,$4,$5,$6)",
        {tostring(uuid.v4()),carried.component_id,actor:id(),encoded,action,scope_checks})
    db:release()
    if write_err then return nil, write_err end
    return {success = true, actor_id = actor:id()}
end
function M.write() return record("agent.effect") end
function M.human_write() return record("agent.human_effect") end
return M
'''.replace('RESOURCE', namespace + ':resource').replace('TABLE', table))
        entries = [
            {'name': 'effect', 'kind': 'function.lua', 'source': 'file://effect.lua', 'method': 'write',
             'modules': ['security', 'sql', 'json', 'uuid'], 'imports': {'execution_identity': 'kickside.execution:execution_identity'},
             'meta': {'type': 'tool', 'public': True, 'llm_alias': 'RecordExecutionEffect', 'title': 'Record execution effect',
                      'llm_description': 'Record one real effect under the admitted execution identity.',
                      'input_schema': {'type': 'object', 'properties': {}, 'additionalProperties': False}}},
            {'name': 'tool_access', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['access', 'registry.get', 'funcs.call'], 'resources': [namespace + ':*'], 'effect': 'allow'}},
            {'name': 'model_egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['http_client.request'], 'resources': [base + '/*'], 'effect': 'allow'}},
            {'name': 'model_loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['http_client.private_ip'], 'resources': ['127.0.0.1'], 'effect': 'allow'}},
        ]
        entries += [
            {**entries[0], 'name': 'human_effect', 'method': 'human_write',
             'meta': {**entries[0]['meta'], 'llm_alias': 'RecordHumanEffect', 'title': 'Record human effect'}},
            {'name': 'human_effect_allow', 'kind': 'security.policy', 'groups': list(allow_groups),
             'policy': {'actions': ['agent.human_effect'], 'resources': [namespace + ':resource'], 'effect': 'allow'}},
            {'name': 'human_effect_deny', 'kind': 'security.policy', 'groups': list(deny_groups),
             'policy': {'actions': ['agent.human_effect'], 'resources': [namespace + ':resource'], 'effect': 'deny'}},
            {'name': 'effect_allow', 'kind': 'security.policy', 'groups': list(effect_groups),
             'policy': {'actions': ['agent.effect'], 'resources': [namespace + ':resource'], 'effect': 'allow'}},
        ]
        (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
    ddl = 'CREATE TABLE ' + table + ' (effect_id TEXT PRIMARY KEY,root TEXT NOT NULL,actor_id TEXT NOT NULL,identity_json TEXT NOT NULL,action TEXT NOT NULL,scope_checks_json TEXT NOT NULL)'
    if inst.engine == 'postgres':
        psql(dict(inst.config['pg'], maintenance=inst.db), inst.env, ddl)
    else:
        database_rows(inst, ddl, write=True)
    profile = inst.request('POST', '/api/v1/models/provider-profiles', {'name': 'Agent tool fixture ' + suffix,
        'provider_id': 'kickside.models:openai_compat_plain.provider', 'config': {'base_url': base + '/v1', 'timeout': 60},
        'api_key': token}, expect=(201,))['profile']
    require(profile.get('has_api_key') is True, 'Fixture model profile does not retain its encrypted API key')
    profile = profile['id']
    inst.cleanup.add('agent model profile', lambda: inst.request('DELETE', '/api/v1/models/provider-profiles/' + profile))
    model = 'agent-tool-fixture-' + suffix
    inst.request('PUT', '/api/v1/models/cards', {'name': model, 'title': 'Agent tool fixture', 'provider_id': 'kickside.models:openai_compat_plain.provider',
        'provider_profile_id': profile, 'provider_model': 'tool-fixture', 'capabilities': ['generate', 'tool_use'],
        'max_tokens': 8192, 'output_tokens': 1024, 'enabled': True})
    inst.cleanup.add('agent model card', lambda: inst.request('DELETE', '/api/v1/models/cards?name=' + model))
    return {'suffix': suffix, 'namespace': namespace, 'table': table, 'model': model, 'profile': profile}


def _fixture(ctx, *, before_tool_response=None, executor_policies=None):
    from runtime_fixtures import complete_splashes
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    slug = 'agent-operators-' + suffix
    group = 'kickside.security.scopes:' + slug
    deny_slug = 'agent-executor-' + suffix
    deny_group = 'kickside.security.scopes:' + deny_slug
    tools = model_tool_fixture(ctx, allow_groups=[group], deny_groups=[deny_group], effect_groups=[deny_group],
                               before_tool_response=before_tool_response)
    namespace, table, model = tools['namespace'], tools['table'], tools['model']
    member = inst.request('POST', '/api/v1/users', {'email': 'agent-operator-' + suffix + '@smoke.example',
        'password': inst.password, 'full_name': 'Agent operator'}, expect=(201,))['user']
    inst.cleanup.add('agent operator', lambda: inst.request('DELETE', '/api/v1/users/' + member['user_id'], expect=(202,)))
    bearer = inst.request('POST', '/api/public/user/token', {'email': member['email'], 'password': inst.password}, auth='')['token']
    inst.redactor.add(bearer)
    inst.request('POST', '/api/v1/security/scopes', {'slug': deny_slug, 'label': 'Agent executor',
        'policies': [] if executor_policies is None else list(executor_policies), 'enabled': True})
    def cleanup_deny_scope():
        memberships = inst.request('GET', '/api/v1/users/' + bot['user_id'] + '/groups')['groups']
        inst.request('PUT', '/api/v1/users/' + bot['user_id'] + '/groups',
            {'groups': [value for value in memberships if value != deny_group]})
        inst.request('DELETE', '/api/v1/security/scopes?slug=' + deny_slug)
    bot = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Agent execution account ' + suffix,
        'groups': ['app.security:admin', deny_group] if executor_policies is None else [deny_group]}, expect=(201,))['user']
    inst.cleanup.add('agent bot', lambda: inst.request('DELETE', '/api/v1/users/' + bot['user_id'], expect=(202,)))
    inst.cleanup.add('agent executor scope', cleanup_deny_scope)
    agent = inst.request('POST', '/api/v1/user-agents', {'title': 'Background analyst ' + suffix, 'description': 'Deterministic agent tool execution',
        'prompt': 'Use each configured recording tool exactly once and report both results.', 'model': model, 'tools': [namespace + ':effect', namespace + ':human_effect'],
        'traits': []}, auth=bearer)['component_id']
    def cleanup_agent():
        fresh = inst.request('POST', '/api/public/user/token',
            {'email': member['email'], 'password': inst.password}, auth='')['token']
        inst.redactor.add(fresh)
        inst.request('DELETE', '/api/v1/user-agents/' + agent, auth=fresh)
    inst.cleanup.add('background agent', cleanup_agent)
    inst.request('POST', '/api/v1/component-access/share/' + agent,
        {'subject_type': 'group', 'subject_id': 'app.security:admin' if executor_policies is None else deny_group,
         'access_mask': 3}, auth=bearer)
    inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Agent operators', 'policies': [], 'enabled': True})
    def cleanup_scope():
        current = inst.request('GET', '/api/v1/users/' + member['user_id'] + '/groups')['groups']
        inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
            {'groups': [value for value in current if value != group]})
        inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug)
    inst.cleanup.add('agent operator scope', cleanup_scope)
    groups = inst.request('GET', '/api/v1/users/' + member['user_id'] + '/groups')['groups']
    inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups', {'groups': groups + [group]})
    grant = {'principal': {'kind': 'user', 'id': bot['user_id']}, 'root': '*', 'groups': [group]}
    complete_splashes(ctx, 'welcome', 'first_agent')
    return {'agent': agent, 'title': 'Background analyst ' + suffix, 'member': member, 'token': bearer,
            'bot': bot['user_id'], 'label': bot['full_name'], 'grant': grant, 'table': table,
            'executor_group': deny_group}


def _effects(inst, fixture):
    return database_rows(inst, 'SELECT root,actor_id,identity_json,scope_checks_json FROM ' + fixture['table'] + " WHERE action='agent.effect' ORDER BY effect_id")


def _browser_agent_background_run(ctx, *, executor_policies=None):
    from playwright.sync_api import expect
    fixture = _fixture(ctx, executor_policies=executor_policies)
    inst = ctx.inst
    browser = ctx.browser_check()
    login_member(ctx, fixture['member'])
    trace = inst.root / inst.evidence.label / 'agent-background-run-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Agents')
        agents = browser.frame.locator('kickside-agents')
        agents.get_by_role('button', name='Run ' + fixture['title'] + ' in background', exact=True).click()
        panel = agents.get_by_role('region', name='Background agent run', exact=True)
        panel.get_by_label('Task prompt', exact=True).fill('Record one execution effect')
        panel.get_by_role('button', name='Prepare background run', exact=True).click()
        launcher = panel.locator('wc-manual-task-launcher')
        picker = launcher.locator('wc-run-as-picker')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_have_count(0)
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        denied_root = _owned_root(inst)
        denied = {'type': 'kickside.automation.manual:task', 'parent_id': fixture['agent'],
                  'component_id': denied_root, 'request_id': uuid.uuid4().hex,
                  'principal': fixture['grant']['principal'],
                  'input': {'title': 'Ungrant agent run', 'target': {'kind': 'agent',
                            'agent_id': fixture['agent'], 'prompt': 'Record one execution effect'}}}
        inst.request('POST', '/api/v1/automations/selected', denied, auth=fixture['token'], expect=(403,))
        for table, column in [('kickside_components', 'component_id'), ('kickside_automation_op', 'automation_id'),
                              ('kickside_automation_drive', 'automation_id')]:
            require(not database_rows(inst, 'SELECT ' + column + ' FROM ' + table + " WHERE " + column + "='" + denied_root + "'"),
                    'Ungrant agent selection allocates durable state in ' + table)
        require(not _effects(inst, fixture), 'Ungrant agent selection performs an effect')
        browser.clean(0)
        inst.request('POST', '/api/v1/security/delegations', {**fixture['grant'], 'operation_id': uuid.uuid4().hex})
        inst.cleanup.add('agent all-roots delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': fixture['grant']['principal'], 'root': '*', 'operation_id': uuid.uuid4().hex}))
        picker.get_by_role('combobox', name='Run as', exact=True).press('Escape')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': fixture['grant']['principal'], 'root': '*', 'operation_id': uuid.uuid4().hex})
        with browser.rejection('POST', '/api/v1/automations/selected', 403) as refused:
            launcher.get_by_role('button', name='Queue run', exact=True).click()
        expect(launcher.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(launcher.get_by_role('status')).to_have_count(0)
        refused_body = refused.value.request.post_data_json
        require(not database_rows(inst, "SELECT component_id FROM kickside_components WHERE component_id='" + refused_body['component_id'] + "'"),
                'Stale Agent selection creates a protected task root')
        inst.request('POST', '/api/v1/security/delegations', {**fixture['grant'], 'operation_id': uuid.uuid4().hex})
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/automations/selected')) as response:
            launcher.get_by_role('button', name='Retry run', exact=True).click()
        require(response.value.request.post_data_json == refused_body, 'Agent launcher retry changes its fixed declaration or identity')
        receipt = response.value.json()
        require(response.value.status == 200 and receipt.get('success'), 'Agent UI does not install its selected fixed task: ' + str(receipt))
        root = receipt['id']
        inst.cleanup.add('agent manual task', lambda: inst.request('DELETE', '/api/v1/automations/' + root, auth=fixture['token']))
        expect(launcher.get_by_role('status')).to_contain_text('Run queued', timeout=30000)
        expect(panel.get_by_role('alert')).to_have_count(0)
        browser.clean(0)
        browser.screenshot('agent-selected-task-queued')
        try:
            inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'Real agent tool executes as the selected bot', seconds=60,
                      pump=browser.page.wait_for_timeout)
        finally:
            inst.evidence.save('agent-effect-progress', {'effects': _effects(inst, fixture), 'drive': _drive(inst, root),
                'model_requests': ctx.fixtures.requests('openai-tools'), 'identity': _identity(inst, root)})
        effects = _effects(inst, fixture)
        identity = json.loads(effects[0]['identity_json'])
        require(effects[0]['actor_id'] == fixture['bot'] and effects[0]['root'] == root
                and identity['principal'] == fixture['grant']['principal']
                and identity['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']}
                and identity['component_id'] == root and _identity(inst, root) == (identity, 1),
                'Native agent/tool dispatch substitutes its executor, human authorizer or execution root')
        audits = database_rows(inst, "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='"
                               + root + "' ORDER BY identity_generation")
        require(len(audits) == 2 and [int(row['identity_generation']) for row in audits] == [0, 1],
                'Agent retry duplicates or loses an identity audit')
        admitted_audit = json.loads(audits[1]['record_json'])
        require(admitted_audit['new_principal'] == 'user:' + fixture['bot']
                and admitted_audit['old_principal'] == admitted_audit['authorizer'] == 'user:' + fixture['member']['user_id']
                and admitted_audit['outcome'] == 'set', 'Agent identity audit replaces its bot or original authorizer')
        require(fixture['token'] not in json.dumps(audits), 'Agent identity audit contains a bearer')
        requests = ctx.fixtures.requests('openai-tools')
        calls = [row for row in requests if row['path'] == '/v1/chat/completions']
        require(len(calls) >= 2 and calls[0]['response']['choices'][0]['finish_reason'] == 'tool_calls'
                and any(value.get('role') == 'tool' for row in calls[1:] for value in row['body']['messages']),
                'Fixture bypasses the actual model/tool turn')
        require(any('agent.human_effect access is required' in str(value.get('content'))
                for row in calls[1:] for value in row['body']['messages'] if value.get('role') == 'tool'),
                'Selected bot borrows configuring-human-only tool access')
        require(not database_rows(inst, 'SELECT actor_id FROM ' + fixture['table'] + " WHERE action='agent.human_effect'"),
                'Selected bot records a configuring-human-only effect')
        browser.clean(0)
        browser.screenshot('agent-real-bot-tool-effect')
        agents.get_by_role('button', name='Close background run', exact=True).click()
        agents.get_by_role('button', name='Run ' + fixture['title'] + ' in background', exact=True).click()
        panel.get_by_label('Task prompt', exact=True).fill('Human access control')
        panel.get_by_role('button', name='Prepare background run', exact=True).click()
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name='Me', exact=True).click()
        before = len(requests)
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/automations/selected')) as response:
            launcher.get_by_role('button', name='Queue run', exact=True).click()
        human_receipt = response.value.json()
        require(response.value.status == 200 and human_receipt.get('success'), 'Ordinary human agent task is not admitted')
        human_root = human_receipt['id']
        inst.cleanup.add('human agent task', lambda: inst.request('DELETE', '/api/v1/automations/' + human_root, auth=fixture['token']))
        expect(launcher.get_by_role('status')).to_contain_text('Run queued', timeout=30000)
        def denied_tool():
            calls = ctx.fixtures.requests('openai-tools')[before:]
            return calls if any('agent.effect access is required' in str(value.get('content'))
                for row in calls for value in (row.get('body') or {}).get('messages', []) if value.get('role') == 'tool') else None
        human_calls = inst.wait(denied_tool, 'Real human tool turn reports its refused effect authority', seconds=60,
                               pump=browser.page.wait_for_timeout)
        human_identity, generation = _identity(inst, human_root)
        require(human_identity['principal'] == human_identity['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']}
                and human_identity['component_id'] == human_root and generation == 1,
                'Me selection borrows bot identity or authorizer')
        require(_effects(inst, fixture) == effects, 'Human agent tool borrows bot-only effect access')
        human_effects = database_rows(inst, 'SELECT root,actor_id,identity_json FROM ' + fixture['table'] + " WHERE action='agent.human_effect'")
        require(len(human_effects) == 1 and human_effects[0]['actor_id'] == fixture['member']['user_id']
                and human_effects[0]['root'] == human_root and json.loads(human_effects[0]['identity_json']) == human_identity,
                'Human-only tool does not retain the original human identity and root')
        browser.clean(0)
        browser.screenshot('agent-human-tool-refusal')
        proof = {'identity': identity, 'effects': effects, 'model_requests': requests,
                 'denied_root': denied_root, 'audits': audits, 'human_identity': human_identity, 'human_model_requests': human_calls,
                 'bot_groups': inst.request('GET', '/api/v1/users/' + fixture['bot'] + '/groups')['groups'],
                 'executor_group': fixture['executor_group']}
        inst.evidence.save('agent-background-run-proof', proof)
        return proof
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


def browser_agent_background_run(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_agent_background_run(fixture)


def browser_agent_scoped_bot_run(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        proof = _browser_agent_background_run(fixture, executor_policies=[
            'kickside.automation.security:module_access',
            'kickside.models.security:module_access',
        ])
        require(set(proof['bot_groups']) == {'app.security:user', proof['executor_group']},
                'Scoped executor acquires Administrator, Members or an unrelated group')
        for effect in proof['effects']:
            require(json.loads(effect['scope_checks_json']) == {'registry_write': False, 'users_management': False},
                    'Scoped executor acquires unrelated registry or Users-management authority')
        fixture.inst.evidence.save('agent-scoped-executor-proof', proof)


REGISTRY = [Scenario('browser_agent_background_run', 'regression', browser_agent_background_run, ('boot',), instance_setup=True,
                     issues=('USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-AGENT-BACKGROUND-RUN', 'BOT-AGENT-LAUNCH-ERROR-RECOVERY', 'RA-B05', 'RA-B09', 'RA-H50', 'RA-H51', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY'),
                     features=navigation('agents', 'kickside.agents:nav_item'))]

REGISTRY += [Scenario('browser_agent_scoped_bot_run', 'regression', browser_agent_scoped_bot_run, ('boot',), instance_setup=True,
                     issues=('EXECUTION-BASELINE-IDENTITY-RESOLUTION', 'SMOKE-SCOPED-EXECUTOR-FIXTURE', 'RA-H54', 'RA-B05', 'RA-B09', 'RA-H50', 'RA-H51'),
                     features=navigation('agents', 'kickside.agents:nav_item'))]


def agent_background_identity_boundaries(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__run_as_security_test')
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__authorization_test')
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__invoke_test')


REGISTRY += [Scenario('agent_background_identity_boundaries', 'regression', agent_background_identity_boundaries,
                      issues=('BOT-AGENT-BACKGROUND-RUN', 'RA-B05', 'RA-H50', 'RA-H51'))]
