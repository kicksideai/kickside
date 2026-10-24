"""Agent invocation identity fixtures and Agents page entry points."""
import uuid
import yaml

from harness import Scenario, require
from runtime import psql
from scenarios import nav
from scenarios_core import navigation
from scenarios_hot_update_work import database_rows


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


def agent_background_identity_boundaries(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__run_as_security_test')
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__authorization_test')
    run_focused_module_test(ctx, 'kickside/agents', 'kickside_agents_invoke__invoke_test')


REGISTRY = [Scenario('agent_background_identity_boundaries', 'regression', agent_background_identity_boundaries,
                      issues=('RA-B05', 'RA-H50', 'RA-H51'))]


def browser_agents_entry_points(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    inst = ctx.inst
    inst.install('kickside/agents')
    inst.install('kickside/automation')
    title = 'Entry point agent ' + uuid.uuid4().hex[:12]
    agent = inst.request('POST', '/api/v1/user-agents', {'title': title, 'prompt': 'Answer questions.', 'traits': []})['component_id']
    inst.cleanup.add('entry point agent', lambda: inst.request('DELETE', '/api/v1/user-agents/' + agent))
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    nav(ctx, 'Agents')
    agents = browser.frame.locator('kickside-agents')
    expect(agents.get_by_role('button', name='Edit ' + title, exact=True)).to_be_visible(timeout=30000)
    expect(agents.locator('button[title="Run in background"]')).to_have_count(0)
    expect(agents.locator('.kx-background-run, wc-manual-task-launcher')).to_have_count(0)
    expect(agents.locator('.kx-card-chat').first).to_be_enabled()
    browser.clean(0)
    browser.screenshot('agents-entry-points')


REGISTRY += [Scenario('browser_agents_entry_points', 'regression', browser_agents_entry_points, ('boot',),
                      issues=('AGENTS-ENTRYPOINT-STORED-TASK-COMPATIBILITY',),
                      features=navigation('agents', 'kickside.agents:nav_item'))]
