"""Group composition across browser, endpoint, discovery, and MCP surfaces."""
import json
import re
import uuid
from pathlib import Path
import shutil
import yaml

from browser import Browser
from fixture_member_permissions import register_member_policy_grants
from harness import Scenario, require
from module_harness import run_focused_module_test
from mcp_client import MCPClient
from mcp_contracts import denied
from scenarios import nav

HERE = Path(__file__).resolve().parent


def install_probe(ctx):
    if ctx.state.get('security_model_probe'):
        return
    with ctx.paused():
        fixture = ctx.inst.app / 'src/security-model-probe'
        fixture.mkdir(exist_ok=True)
        shutil.copyfile(HERE / 'mocks/security_model/probe.lua', fixture / 'probe.lua')
        shutil.copyfile(HERE / 'mocks/security_model/requirement_choice.lua', fixture / 'requirement_choice.lua')
        shutil.copyfile(HERE.parent / 'compat/integration/security_update_contract.lua', fixture / 'security_update_contract.lua')
        entries = yaml.safe_load((HERE / 'mocks/security_model/before_policies.yaml').read_text())
        historical = [row['id'] for row in json.loads((HERE / 'mocks/security_model/published_registry.json').read_text())]
        entries += [
            {'name': 'historical', 'kind': 'registry.entry', 'ids': historical},
            {'name': 'security_update_contract', 'kind': 'library.lua', 'source': 'file://security_update_contract.lua'},
            {'name': 'security_update', 'kind': 'function.lua', 'source': 'file://requirement_choice.lua',
             'method': 'security_update', 'modules': ['http', 'registry'],
             'imports': {'planner': 'keeper.hub:planner', 'guard': 'security.model:security_update_contract'}},
            {'name': 'security_update.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/users-update', 'func': 'security.model:security_update'},
            {'name': 'requirement_choices', 'kind': 'function.lua', 'source': 'file://requirement_choice.lua',
             'method': 'choices', 'modules': ['http', 'json', 'registry'], 'imports': {'planner': 'keeper.hub:planner'}},
            {'name': 'requirement_choices.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/requirement-choices', 'func': 'security.model:requirement_choices'},
            {'name': 'deny_crm', 'kind': 'security.policy',
             'meta': {'title': 'Deny CRM', 'surface': 'kickside.crm', 'intent': 'module_deny'},
             'policy': {'resources': ['kickside.crm:*', 'kickside.crm.*'], 'actions': '*', 'effect': 'deny'}},
            {'name': 'bindings', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'bindings',
             'modules': ['http', 'registry', 'security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'bindings.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/bindings', 'func': 'security.model:bindings'},
            {'name': 'inspect', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'inspect',
             'modules': ['http', 'registry', 'security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'visible', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'visible',
             'modules': ['http', 'registry', 'security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'published_member', 'kind': 'function.lua', 'source': 'file://probe.lua',
             'method': 'published_member', 'modules': ['http', 'registry', 'security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'published_member.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/published-member', 'func': 'security.model:published_member'},
            {'name': 'inspect.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/inspect', 'func': 'security.model:inspect'},
            {'name': 'visible.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'GET', 'path': '/security-model/visible', 'func': 'security.model:visible'},
            {'name': 'probe_access', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'resources': 'security.model:visible.endpoint', 'actions': 'access', 'effect': 'allow'}},
        ]
        entries = register_member_policy_grants(ctx.inst.app, entries)
        (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'security.model',
            'entries': entries}, sort_keys=False))
    ctx.state['security_model_probe'] = True


def scope_without(ctx, excluded, split_groups=False, deny_module=False):
    from playwright.sync_api import expect
    from scenarios_security_ui import compose_scope, assign_scopes
    inst = ctx.inst
    for component in ('kickside/crm', 'chestor/workspace', 'kickside/knowledge'):
        inst.install(component)
    inst.install('kickside/mcp')
    install_probe(ctx)
    catalog = inst.request('GET', '/api/v1/security/policies', label='module-policy-catalog')['policies']
    modules = [p for p in catalog if p.get('intent') == 'module_access']
    require(any(p.get('surface') == excluded for p in modules), 'Excluded module has no selectable policy')
    selected = sorted(p['id'] for p in modules if deny_module or p.get('surface') != excluded)
    require(len(selected) >= 10, 'Composed group omits the installed module catalog')
    suffix = uuid.uuid4().hex[:10]
    label = 'Northwind access without ' + excluded.rsplit('.', 1)[-1]
    policy_sets = [selected[::2], selected[1::2]] if split_groups else [selected]
    if deny_module:
        policy_sets.append(['security.model:deny_crm'])
    assigned_groups = []
    for index, policies in enumerate(policy_sets):
        assigned_groups.append(compose_scope(ctx, label + ' ' + str(index), policies))
    email = 'module-member-' + suffix + '@smoke.example'
    member = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Northwind module member'}, expect=(201,), label='create-default-member')['user']
    uid = member['user_id']
    inst.cleanup.add('module member', lambda: inst.request('DELETE', '/api/v1/users/' + uid, expect=(202,)))
    initial = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                           auth='', label='default-member-login')['token']
    inst.redactor.add(initial)
    own = inst.request('GET', '/api/v1/user/me', auth=initial, label='default-member-groups')
    require('app.security:members' in own['security']['groups'], 'New member misses the default group')
    tools = ['kickside.crm.traits:list_records', 'kickside.knowledge.traits:kb_find_tool']
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Northwind module scope credential',
        'allowed_tool_ids': tools}, auth=initial, label='default-member-mcp-credential')['credential']
    inst.redactor.add(credential['token'])
    assign_scopes(ctx, member, assigned_groups)
    inst.request('GET', '/api/v1/user/me', auth=initial, expect=(401,), label='old-member-session-revoked')
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='narrow-member-login')['token']
    inst.redactor.add(token)
    own = inst.request('GET', '/api/v1/user/me', auth=token, label='narrow-member-groups')
    require(set(own['security']['groups']) == {*assigned_groups, 'app.security:user'}, 'Member retains a removed group')
    group = own['user']['metadata']['scope_id']
    require(re.fullmatch(r'kickside\.security\.scopes:set_[0-9a-f]{64}', group), 'Session does not carry one named group set')
    for path in ('/api/v1/user/me', '/api/v1/profile', '/api/v1/knowledge/list', '/api/v1/nav/list'):
        inst.request('GET', path, auth=token, label='allowed-member-' + path.rsplit('/', 1)[-1])
    inventory = inst.request('GET', '/api/v1/security-model/inspect?group=' + group + '&namespace=' + excluded,
        label='excluded-module-inventory')
    require(inventory['excluded_routes'], 'Excluded module endpoint inventory is empty')
    for route in inventory['excluded_routes']:
        path = re.sub(r'\{[^}]+\}', '00000000-0000-4000-8000-000000000731', route['path'])
        inst.request(route['method'], path, {} if route['method'] != 'GET' else None, auth=token,
            expect=(403,), label='excluded-endpoint-' + route['id'])
    discovery = inst.request('GET', '/api/v1/security-model/visible', auth=token, label='scoped-registry-discovery')
    visible_ids = {entry['id'] for entry in discovery['entries']}
    for entry in inventory['excluded_entries']:
        require(entry['id'] not in visible_ids, 'Excluded registry declaration remains visible: ' + entry['id'])
    if excluded == 'kickside.crm':
        inst.request('GET', '/api/v1/workspace/crm', auth=token, expect=(403,), label='excluded-crm-rest')
        navigation = inst.request('GET', '/api/v1/nav/list', auth=token, label='excluded-crm-navigation')
        require('kickside.crm' not in json.dumps(navigation), 'CRM navigation remains visible')
    else:
        for path in ('/api/v1/principals/search?q=Northwind',
                     '/api/v1/users'):
            inst.request('GET', path, auth=token, expect=(403,), label='excluded-users-rest')
        inst.request('POST', '/api/v1/principals/resolve', {'refs': [{'type': 'user', 'id': uid}]},
                     auth=token, expect=(403,), label='excluded-users-resolve')
        inst.request('GET', '/api/v1/workspace/crm', auth=token, label='allowed-crm-rest')
    inst.request('POST', '/api/public/mcp', {'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list'},
        auth=credential['token'], expect=(401,), label='removed-module-mcp-revoked')
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Northwind narrowed module scope',
        'allowed_tool_ids': tools}, auth=token, label='narrow-member-mcp-credential')['credential']
    inst.redactor.add(credential['token'])
    client = MCPClient(inst, credential['token'], '/api/public/mcp', stateful=False)
    client.initialize()
    names = client.tools()
    require('FindKnowledgeBases' in names, 'Allowed Knowledge tool disappears')
    client.call('FindKnowledgeBases', {})
    if excluded == 'kickside.crm':
        require('CRMListRecords' not in names, 'Excluded CRM tool remains discoverable')
        denied(client, 'CRMListRecords', {})
    else:
        require('CRMListRecords' in names, 'Allowed CRM tool disappears')
    visible = inst.request('GET', '/api/v1/agents/traits', auth=token, label='member-traits')
    require(excluded not in json.dumps(visible), 'Excluded module trait remains visible')
    Browser.release(ctx)
    browser = ctx.browser_check()
    browser.login(email, inst.password)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    splash = browser.frame.locator('kickside-agent-onboarding')
    if splash.count() and splash.is_visible():
        splash.get_by_label('Agent name', exact=True).fill('Northwind scoped assistant')
        splash.get_by_role('button', name='Create agent', exact=True).click()
        browser.frame.locator('wippy-chat').wait_for(timeout=30000)
    browser.reload()
    expect(browser.frame.locator('.sidebar')).to_be_visible(timeout=30000)
    if excluded == 'kickside.crm':
        expect(browser.frame.locator('.sidebar').get_by_text('CRM', exact=True)).to_have_count(0)
    expect(browser.frame.locator('.sidebar').get_by_text('Knowledge', exact=True)).to_be_visible()
    if split_groups:
        marker = 'GROUP-SCOPE-' + suffix.upper()
        browser.stream('Begin with ' + marker + '. Then write four sentences explaining how a team '
                       'records and reviews shared work. Do not use tools.', marker, 'group-set-relay-reply')
        sessions = inst.request('GET', '/api/v1/sessions?limit=100', auth=token,
                                label='group-set-started-sessions')['sessions']
        require(sessions, 'Named group set does not start a session through relay')
        require(len(sessions) == 1, 'Named group set creates duplicate sessions')
        messages = inst.request('GET', '/api/v1/sessions/messages?session_id=' + sessions[0]['session_id'],
                                auth=token, label='group-set-persisted-chat')['messages']
        require(any(row['type'] == 'assistant' and marker in str(row.get('data')) for row in messages),
                'Relay reply does not persist under the named group set')
    nav(ctx, 'Knowledge')
    expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
    browser.settle()
    browser.clean(0)
    browser.screenshot('group-without-' + excluded.rsplit('.', 1)[-1], full_page=False)
    inst.evidence.save('module-group-access', {'group': group, 'excluded': excluded, 'policies': selected,
        'tools': sorted(names), 'member_id': uid, 'excluded_endpoint_count': len(inventory['excluded_routes']),
        'excluded_registry_count': len(inventory['excluded_entries'])})


def module_requirement_bindings(ctx):
    install_probe(ctx)
    bindings = ctx.inst.request('GET', '/api/v1/security-model/bindings', label='installed-module-security-bindings')
    require(bindings['targets'], 'Installed module security requirement matrix is empty')
    ctx.inst.evidence.save('module-security-bindings', bindings)


def parameterless_hub_install(ctx):
    inst = ctx.inst
    inst.install('kickside/llm-ocr')
    entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.llm_ocr%3Astage',
                         label='parameterless-hub-installed-stage')['entry']
    require(entry['kind'] == 'function.lua', 'Parameterless Hub install omits its executable stage')


def member_session_lifecycle(ctx):
    from playwright.sync_api import expect
    from scenarios_security_ui import login_member
    inst = ctx.inst
    inst.install('kickside/knowledge')
    policies = inst.request('GET', '/api/v1/security/policies')['policies']
    policy = next(p['id'] for p in policies if p.get('intent') == 'module_access'
                  and p.get('surface') == 'kickside.knowledge')
    suffix = uuid.uuid4().hex[:10]
    scopes = []
    accounts = []
    for name in ('affected', 'unchanged'):
        slug = name + '_' + suffix
        body = {'slug': slug, 'label': name, 'policies': [policy]}
        inst.request('POST', '/api/v1/security/scopes', body, label=name + '-scope')
        scopes.append(body)
        group = 'kickside.security.scopes:' + slug
        inst.cleanup.add(name + ' scope', lambda slug=slug: inst.request(
            'DELETE', '/api/v1/security/scopes?slug=' + slug))
        account = inst.request('POST', '/api/v1/users', {
            'email': name + '-' + suffix + '@smoke.example', 'password': inst.password,
            'full_name': name, 'groups': ['app.security:user', group]}, expect=(201,))['user']
        inst.cleanup.add(name + ' member', lambda uid=account['user_id']: inst.request(
            'DELETE', '/api/v1/users/' + uid, expect=(202,)))
        accounts.append(account)

    def login(account):
        token = inst.request('POST', '/api/public/user/token', {
            'email': account['email'], 'password': inst.password}, auth='')['token']
        inst.redactor.add(token)
        inst.request('GET', '/api/v1/user/me', auth=token)
        return token

    tokens = [login(account) for account in accounts]
    browser = ctx.browser_check()
    login_member(ctx, accounts[1])
    nav(ctx, 'Knowledge')
    expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
    before = inst.request('GET', '/api/v1/keeper/sync/state')['registry']['current_version']
    inst.request('POST', '/api/v1/security/scopes', scopes[0], label='idempotent-scope-save')
    same = inst.request('GET', '/api/v1/keeper/sync/state')['registry']['current_version']
    require(before == same, 'Idempotent scope save writes registry history')
    ctx.restart()
    browser = ctx.browser
    after = inst.request('GET', '/api/v1/keeper/sync/state')['registry']['current_version']
    require(same == after, 'Unchanged boot writes registry history')
    browser.reload()
    expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
    for token in tokens:
        inst.request('GET', '/api/v1/user/me', auth=token, label='member-token-after-restart')
    inst.request('POST', '/api/v1/security/scopes', {**scopes[0], 'label': 'Renamed scope'},
                 label='metadata-only-scope-change')
    for token in tokens:
        inst.request('GET', '/api/v1/user/me', auth=token, label='member-token-after-metadata')
    inst.request('GET', '/api/v1/knowledge/list', auth=tokens[0], label='granted-policy-admits-module')
    inst.request('POST', '/api/v1/security/scopes', {**scopes[0], 'policies': []},
                 label='effective-scope-change')
    inst.request('GET', '/api/v1/knowledge/list', auth=tokens[0], expect=(403,), label='changed-policy-denies-module')
    inst.request('GET', '/api/v1/user/me', auth=tokens[0], label='changed-policy-keeps-session')
    inst.request('GET', '/api/v1/user/me', auth=tokens[1], label='unaffected-policy-keeps-token')
    browser.reload()
    expect(browser.frame.locator('kickside-knowledge')).to_be_visible(timeout=30000)
    expect(browser.page.get_by_role('button', name='Sign In', exact=True)).to_have_count(0)
    current = login(accounts[0])
    inst.request('PUT', '/api/v1/users/' + accounts[0]['user_id'] + '/groups', {
        'groups': ['app.security:user', 'kickside.security.scopes:' + scopes[1]['slug']]},
        label='membership-generation-change')
    inst.request('GET', '/api/v1/user/me', auth=current, expect=(401,), label='membership-revokes-old-token')
    login(accounts[0])
    inst.request('GET', '/api/v1/user/me', auth=tokens[1], label='unaffected-membership-keeps-token')
    inst.evidence.save('member-session-lifecycle', {'registry_before': before, 'registry_after': after,
        'affected_user': accounts[0]['user_id'], 'unchanged_user': accounts[1]['user_id']})
    browser.screenshot('unaffected-member-session')
    browser.reset_context()
    browser.login()


def default_member_matrix(ctx):
    install_probe(ctx)
    matrix = ctx.inst.request('GET', '/api/v1/security-model/inspect', label='default-member-access-matrix')
    ctx.inst.evidence.save('default-member-matrix', matrix)
    require(len(matrix['matrix']) >= 1000, 'Default-member matrix omits the installed registry')
    require(not matrix['losses'], 'Default member loses registry surface permissions: ' + json.dumps(matrix['losses'][:20]))
    require(not matrix['changes'], 'Default member changes registry surface permissions: ' + json.dumps(matrix['changes'][:20]))
    require(not matrix['unadmitted_additions'], 'Default member reaches registry entries added after the historical surface'
            ' outside a declared module policy: ' + json.dumps(matrix['unadmitted_additions'][:20]))


def apply_dependency_bindings(app, bindings):
    by_component = {row['component']: row['parameters'] for row in bindings}
    applied = set()
    for path in sorted((app / 'src').rglob('_index.yaml')):
        document = yaml.safe_load(path.read_text())
        changed = False
        for entry in document.get('entries', []):
            component = entry.get('component')
            if entry.get('kind') != 'ns.dependency' or component not in by_component:
                continue
            parameters = by_component[component]
            names = {row['name'] for row in parameters}
            short_names = {name.rsplit(':', 1)[-1] for name in names}
            module_namespace = component.replace('/', '.').replace('-', '_')
            def replaced(name):
                namespace, separator, short_name = name.rpartition(':')
                return (name in names or name in short_names or
                        (separator and short_name in short_names and
                         (namespace == module_namespace or namespace.startswith(module_namespace + '.'))))
            entry['parameters'] = [row for row in entry.get('parameters', [])
                if not replaced(row['name'])] + parameters
            applied.add(component)
            changed = True
        if changed:
            path.write_text(yaml.safe_dump(document, sort_keys=False))
    require(applied == by_component.keys(), 'Fixture bindings lack root dependencies: ' +
            ', '.join(sorted(by_component.keys() - applied)))


def published_member_bindings(ctx):
    from runtime import RuntimePool
    root = ctx.inst.evidence.root / ctx.inst.evidence.label / ('published-bindings-' + uuid.uuid4().hex[:8])
    source = root / 'source'
    bindings = json.loads((HERE / 'mocks/security_model/published_bindings.json').read_text())
    shutil.copytree(Path(ctx.inst.config['source']) / 'app', source / 'app',
        ignore=shutil.ignore_patterns('.git', '.wippy', 'node_modules', '.env', '*.db', '__pycache__'))
    apply_dependency_bindings(source / 'app', bindings)
    pool = RuntimePool({**ctx.inst.config, 'source': str(source)}, ctx.inst.engine, root / 'instances')
    fixture = pool.context("scenarios_security_model")
    inst = fixture.inst
    try:
        inst.boot()
        install_probe(fixture)
        matrix = inst.request('GET', '/api/v1/security-model/published-member',
                              label='published-member-module-access')
        require(len(matrix['matrix']) >= 50, 'Published-binding matrix omits member endpoints')
        require(not matrix['losses'], 'Published app bindings lose member endpoints: ' + json.dumps(matrix['losses']))
        ctx.inst.evidence.save('published-bindings-access', {'bindings': bindings, 'matrix': matrix,
            'paths': inst.evidence.paths})
    finally:
        failures = pool.cleanup()
        shutil.rmtree(source)
        require(not failures, 'Published-binding fixture cleanup fails: ' + '; '.join(failures))


REGISTRY = [Scenario('access_scope_without_' + module, 'full',
    lambda ctx, surface='kickside.' + module: scope_without(ctx, surface), ('first_agent',),
    instance_setup=True, issues=('SECURITY-MODULE-BOUNDARIES', 'USERS-EDITOR-CONTENT-OVERLAP') +
        (('MCP-CREDENTIAL-SCOPE-RESOLUTION', 'USERS-RESOLVER-OWNED-READER') if module == 'users' else ()) +
        (('SECURITY-SCOPE-PROJECTION-LIVENESS',) if module == 'crm' else ()), features=(
        'kickside/security|http|GET /api/v1/security/policies',
        'kickside/security|http|POST /api/v1/security/scopes',
        'kickside/users|http|PUT /api/v1/users/{id}/groups',
        'kickside/mcp|http|POST /api/public/mcp',
    )) for module in ('crm', 'users')]

REGISTRY += [Scenario('access_default_member_matrix', 'full', default_member_matrix, ('access_catalog',), instance_setup=True, issues=('SECURITY-DEFAULT-MEMBERS', 'T21'))]

REGISTRY += [Scenario('access_published_member_bindings', 'full', published_member_bindings,
                     ('boot',), instance_setup=True, issues=('SECURITY-PUBLISHED-BINDINGS',
                                                   'TRANSFORM-REQUIREMENT-ENDPOINT-ACCESS'))]

REGISTRY += [
    Scenario('access_scope_group_union', 'full',
             lambda ctx: scope_without(ctx, 'kickside.crm', split_groups=True),
             ('first_agent',), instance_setup=True, issues=('SECURITY-GROUP-UNION', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
    Scenario('access_scope_group_deny', 'full',
             lambda ctx: scope_without(ctx, 'kickside.crm', split_groups=True, deny_module=True),
             ('first_agent',), instance_setup=True, issues=('SEC-HIDDEN-KIND-LISTING', 'SECURITY-GROUP-DENY', 'SECURITY-SCOPE-PROJECTION-LIVENESS')),
]

REGISTRY += [Scenario('access_module_requirement_bindings', 'full', module_requirement_bindings,
                      ('access_catalog',), instance_setup=True, issues=('SECURITY-REQUIREMENT-DEFAULTS',))]

REGISTRY += [Scenario('access_hub_parameterless_install', 'full', parameterless_hub_install,
    ('boot',), instance_setup=True, issues=('KEEPER-NATIVE-EMPTY-PARAMETERS',))]

REGISTRY += [Scenario('access_member_session_lifecycle', 'full', member_session_lifecycle,
    ('first_agent',), instance_setup=True, issues=('SECURITY-BOOT-NOOP', 'SECURITY-LOGIN-GENERATION', 'SECURITY-SCOPE-PROJECTION-LIVENESS'))]

def requirement_choice_registry_filter(ctx):
    install_probe(ctx)
    receipt = ctx.inst.request('GET', '/api/v1/security-model/requirement-choices', label='requirement-model-choices')
    require(receipt['success'] and receipt['defaults_win'] and receipt['constrained_choices']
            and receipt['typed_errors'] and receipt['explicit_choices'] and receipt['sole_candidate'],
            'Requirement candidate resolution fails its contract')


def requirement_choices(ctx):
    requirement_choice_registry_filter(ctx)
    requirement = 'kickside.crm.security:user_security_scope'
    rejected = ctx.inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
        {'component': 'kickside/crm', 'parameters': [
            {'name': requirement, 'value': 'security.model:outside_candidates'}]},
        expect=(409,), label='missing-required-binding', timeout=120)
    require(rejected.get('code') == 'REQUIREMENTS_MISSING'
            and requirement in rejected.get('error', '') and 'security.scope' in rejected.get('error', ''),
            'Hub accepts an invalid required binding or omits its id/kind: ' + json.dumps(rejected))
    installed = lambda: sorted(row.get('component') for row in ctx.inst.request(
        'GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0', label='fill-gaps-dependencies')['dependencies'])
    before = installed()
    filled = ctx.inst.request('POST', '/api/v1/keeper/hub/dependencies/fill-gaps',
        {'component': 'kickside/crm', 'run_migrations': True}, label='fill-gaps-plan', timeout=120)
    row = next((r for r in filled.get('requirements', []) if r.get('full_id') == requirement), None)
    require(row is not None and filled.get('applicable') is True and row['value'] == row['default']
            and not row['missing'] and row['value_source'] != 'llm',
            'Fill gaps does not return the reviewed deterministic plan: ' + json.dumps(row))
    require(installed() == before, 'Fill gaps applies the plan it returns')

REGISTRY += [Scenario('access_requirement_model_choices', 'full', requirement_choices,
    ('boot',), instance_setup=True, issues=('SMOKE-REQUIREMENT-CANDIDATE-REGISTRY-FILTER',
                                            'KEEPER-REQUIREMENT-CHOICE', 'KEEPER-SOLE-REQUIREMENT-CANDIDATE',
                                            'KEEPER-REQUIRED-BINDING-ERROR', 'KEEPER-FILL-GAPS'))]


def hub_requirement_defaults(ctx):
    from runtime import Instance
    inst = Instance(ctx.inst.config, ctx.inst.engine,
        ctx.inst.evidence.root / ctx.inst.evidence.label / ('fresh-hub-defaults-' + uuid.uuid4().hex[:8]))
    matrix = []
    host_requirements = {
        'kickside/agent-onboarding': {
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/dashboard': {
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/research': {
            'target_db': ('db.sql', 'app:db'),
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/crm': {
            'target_db': ('db.sql', 'app:db'),
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
            'admin_security_scope': ('security.scope', 'app.security:admin'),
        },
        'kickside/mcp-client': {
            'process_host': ('process.host', 'app:processes'),
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/simplefin': {
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/webscout': {
            'api_router': ('http.router', 'app:api'),
            'ui_server': ('http.service', 'app:gateway'),
        },
        'kickside/atlassian': {
            'ui_server': ('http.service', 'app:gateway'),
        },
    }
    try:
        inst.boot()
        for module in ('kickside/crm', 'chestor/workspace', 'kickside/knowledge'):
            plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': module, 'run_migrations': True}, label=module.replace('/', '-') + '-default-plan', timeout=120)
            requirements = [row for row in plan['requirements'] if row['module'] == module
                            and row['name'] == 'user_security_scope']
            require(len(requirements) == 1, 'Hub omits member requirement for ' + module)
            row = requirements[0]
            require(row['expected_kind'] == 'security.scope'
                    and row['default'] == 'kickside.security.groups:members'
                    and row['value'] == row['default'] and row['value_source'] == 'default'
                    and not row['missing'] and not row['invalid'],
                    'Fresh Hub install does not use declared member default: ' + json.dumps(row))
            explicit = {'name': row['full_id'], 'value': 'app.security:members'}
            inst.install(module, [explicit])
            update = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': module, 'run_migrations': True}, label=module.replace('/', '-') + '-update-plan', timeout=120)
            bound = next(r for r in update['requirements'] if r['full_id'] == row['full_id'])
            require(bound['value'] == explicit['value'] and bound['value_source'] in ('provided', 'existing'),
                    'Hub update replaces an existing exact member binding: ' + json.dumps(bound))
            matrix.append({'module': module, 'requirement': row['full_id'], 'default': row['value'],
                           'explicit_binding': explicit['value'],
                           'install_source': row['value_source'], 'update_source': bound['value_source']})
        for module, expected in host_requirements.items():
            plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': module, 'run_migrations': True}, label=module.replace('/', '-') + '-host-plan', timeout=120)
            rows = {row['name']: row for row in plan['requirements'] if row['module'] == module}
            for name, (kind, value) in expected.items():
                row = rows.get(name)
                require(row is not None, 'Hub omits host requirement ' + module + ':' + name)
                require(row.get('expected_kind') == kind,
                        'Host requirement has the wrong value kind: ' + json.dumps(row))
                require(row.get('default') is None,
                        'Host requirement declares a module default: ' + json.dumps(row))
                require(row.get('value') == value and row.get('value_source') in ('provided', 'provided_bare', 'existing', 'existing_bare', 'registry')
                        and not row.get('missing') and not row.get('invalid'),
                        'Application host binding does not resolve the planned requirement: ' + json.dumps(row))
                matrix.append({'module': module, 'requirement': row['full_id'], 'kind': kind,
                               'value': row.get('value'), 'source': row.get('value_source')})
        ctx.inst.evidence.save('fresh-hub-defaults', matrix)
    finally:
        failures = inst.cleanup.run()
        require(not failures, 'Fresh Hub default fixture cleanup fails: ' + '; '.join(failures))


REGISTRY += [Scenario('access_hub_requirement_defaults', 'full', hub_requirement_defaults,
    ('boot',), instance_setup=True, issues=('SECURITY-REQUIREMENT-DEFAULTS', 'KEEPER-FIRST-INSTALL-SOURCE',
                                            'REQUIREMENT-HOST-DEFAULTS'))]


def users_security_update_bindings(ctx):
    install_probe(ctx)
    receipt = ctx.inst.request('GET', '/api/v1/security-model/users-update', label='users-security-update-bindings')
    require(len(receipt['bindings']) == 1 and len(receipt['bindings'][0]['parameters']) == 4,
            'Users update omits a transitive Security host binding: ' + json.dumps(receipt))
    ctx.inst.evidence.save('users-security-update-bindings', receipt)


REGISTRY += [Scenario('users_security_update_bindings', 'full', users_security_update_bindings,
                     ('boot',), instance_setup=True, issues=('USERS-SECURITY-TRANSITIVE-DB',))]


def mcp_credential_scope_resolution(ctx):
    run_focused_module_test(ctx, 'kickside/mcp', 'module_access_policy')


REGISTRY += [Scenario('regression_mcp_credential_scope_resolution', 'regression',
    mcp_credential_scope_resolution, ('boot',), instance_setup=True,
    issues=('MCP-CREDENTIAL-SCOPE-RESOLUTION',))]


REGISTRY += [Scenario('regression_requirement_choice_registry_filter', 'regression',
    requirement_choice_registry_filter, ('boot',), instance_setup=True,
    issues=('SMOKE-REQUIREMENT-CANDIDATE-REGISTRY-FILTER',))]


def transform_requirement_endpoint_access(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'user_endpoint_policy_test')


REGISTRY += [Scenario('regression_transform_requirement_endpoint_access', 'regression',
    transform_requirement_endpoint_access, ('boot',), instance_setup=True,
    issues=('TRANSFORM-REQUIREMENT-ENDPOINT-ACCESS',))]


def shared_member_scope(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'shared_member_scope_test')


REGISTRY += [Scenario('regression_shared_member_scope', 'regression', shared_member_scope,
    ('boot',), instance_setup=True, issues=('SECURITY-PUBLISHED-BINDINGS',))]


def users_resolver_owned_reader(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'mcp_group_resolver_test')


REGISTRY += [Scenario('regression_users_resolver_owned_reader', 'regression',
    users_resolver_owned_reader, ('boot',), instance_setup=True,
    issues=('USERS-RESOLVER-OWNED-READER',))]
