"""Historical group selections survive a live application update through Hub."""
from copy import deepcopy
import json
import hmac
import base64
from pathlib import Path
import shutil
import uuid
import secrets
import yaml
from urllib.parse import quote, parse_qs, urlsplit, urlencode

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios import all_checks
from scenarios_identity_policy_upgrade import published_source
from scenarios_token_continuity import token_payloads
from scenarios_hot_update_work import database_rows

HERE = Path(__file__).parent


def prepare_published_deployment(inst, baseline, *, root='kickside/kickside'):
    from ops.compat.fetch_baselines import Hub
    hub = Hub()
    receipts, pending = {}, list(baseline)
    require(root in baseline, 'Published deployment inventory omits its application root')
    vendor = inst.app / '.wippy/vendor'
    while pending:
        module = pending.pop()
        if module in receipts:
            continue
        work = inst.app / '.wippy/downloads' / module
        work.mkdir(parents=True)
        archive = hub.fetch(module, work, baseline.get(module))
        receipts[module] = {key: archive[key] for key in ('version', 'sha256')}
        destination = vendor / (module + '-' + archive['version'] + '.wapp')
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(work / 'baseline.wapp', destination)
        pending.extend(row['Data']['component'] for row in archive['entries'].values()
                       if row['Kind'] == 'ns.dependency')
    missing = sorted(set(baseline) - set(receipts))
    require(not missing, 'Published deployment graph omits baseline modules: ' + ', '.join(missing))
    modules = [dict(name=module, version=row['version'], hash=row['sha256'], **({'root': True} if module == root else {}))
               for module, row in sorted(receipts.items())]
    (inst.app / 'wippy.lock').write_text(yaml.safe_dump({
        'directories': {'modules': '.wippy', 'src': 'src'}, 'modules': modules}, sort_keys=False))
    return receipts



def install_credential_probe(directory):
    target = directory / 'src/installation_proof'
    target.mkdir()
    shutil.copyfile(HERE / 'mocks/published_installation/credential_probe.lua', target / 'credential_probe.lua')
    namespace = 'kickside.users.installation_proof'
    entries = [
        {'name': 'credentials', 'kind': 'function.lua', 'source': 'file://credential_probe.lua',
         'method': 'handler', 'modules': ['http', 'security', 'funcs', 'env', 'hash', 'registry'],
         'security': {'actor': {'id': namespace + ':credentials'}, 'policies': [namespace + ':probe_access']}},
        {'name': 'credentials.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'router'},
         'method': 'POST', 'path': '/installation-proof', 'func': namespace + ':credentials'},
        {'name': 'probe_access', 'kind': 'security.policy', 'policy': {
            'actions': ['security.token_store.get', 'security.token.validate', 'funcs.call', 'env.get', 'security.actor.create', 'security.policy.get', 'security.policy_group.get', 'registry.get'],
            'resources': ['kickside.users.security:tokens', 'kickside.users.binding:subject_lookup', 'ENCRYPTION_KEY', '*'], 'effect': 'allow'}},
    ]
    (target / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
    index = directory / 'src/_index.yaml'
    document = yaml.safe_load(index.read_text())
    router = next(row for row in document['entries'] if row['name'] == 'public_router')
    router['targets'].append({'entry': namespace + ':credentials.endpoint', 'path': '.meta.router'})
    index.write_text(yaml.safe_dump(document, sort_keys=False))

def published_installation_update(ctx, *, credentials=False, plan_only=False):
    candidates = ctx.inst.config['replace']
    baseline = json.loads((HERE / 'mocks/security_model/published_installation_baseline.json').read_text())
    inventory = dict(baseline)
    if credentials:
        inventory.update(json.loads((HERE / 'mocks/security_model/published_mcp_baseline.json').read_text()))
    fixture_ids = json.loads((HERE / 'mocks/security_model/published_registry.json').read_text())
    historical = sorted(row['id'] for row in fixture_ids if row['kind'] == 'security.policy'
                        and row['id'].endswith('_endpoint_access') and row['id'].startswith('kickside.'))
    historical = [id for id in historical if id.split(':')[0].split('.')[1] in
                  ('agents', 'automation', 'component', 'connection', 'core', 'identity', 'inbox',
                   'models', 'oauth', 'transform', 'ui', 'users')]
    require(len(historical) == 15, 'Published installation fixture omits a historical endpoint policy')
    if credentials:
        historical.append('kickside.mcp.security:mcp_endpoint_access')
    sources, receipts, scratch = {}, {}, []
    slug = 'historical-installation-' + uuid.uuid4().hex[:10]
    group = 'kickside.security.scopes:' + slug
    def prepare(fixture):
        inst = fixture.inst
        source = inst.root / 'published-installation'
        source.mkdir()
        scratch.append(source)
        receipts['kickside/kickside'] = published_source(source / 'app', 'kickside/kickside',
                                                       baseline['kickside/kickside'], application=True)
        for module in inventory:
            if module == 'kickside/kickside' or module not in candidates:
                continue
            directory = source / module.replace('/', '-')
            receipts[module] = published_source(directory, module, inventory[module])
            sources[module] = str(directory)
        inst.config.update(source=None, published=baseline['kickside/kickside']['version'], replace={})
        runtime = yaml.safe_load((source / 'app/.wippy.yaml').read_text())
        (inst.app / 'src').mkdir(exist_ok=True)
        runtime['workspace'] = {'include_host_dependencies': True}
        (inst.app / '.wippy.yaml').write_text(yaml.safe_dump(runtime, sort_keys=False))
        installed = prepare_published_deployment(inst, baseline)
        inst.evidence.save('published-installed-graph', installed)
        inst.config.update(replace=sources)
        if sources:
            runtime['workspace']['replacements'] = sources
        (inst.app / '.wippy.yaml').write_text(yaml.safe_dump(runtime, sort_keys=False))
        inst.evidence.save('published-installation-receipts', receipts)
    config = deepcopy(ctx.inst.config)
    config.update(source=None, published=None, replace={})
    try:
        with isolated_fixture(ctx, config=config, prepare=prepare) as fixture:
            inst = fixture.inst
            if credentials:
                parameters = [{'name': name, 'value': value} for name, value in {
                    'kickside.mcp:api_router': 'app:api', 'kickside.mcp:public_router': 'app:api.public',
                    'kickside.mcp:target_db': 'app:db', 'kickside.mcp:ui_server': 'app:gateway',
                    'kickside.mcp.security:user_security_scope': 'app.security:user',
                }.items()]
                dependency = {'component': 'kickside/mcp', 'version': inventory['kickside/mcp']['version'],
                              'parameters': parameters}
                payload = dict(dependency, run_migrations=True) if plan_only else {
                    'dependencies': [dependency], 'run_migrations': True}
                plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan', payload,
                                    label='installation-historical-mcp-plan', timeout=120)
                plans = [plan] if plan_only else plan['plans']
                require(plan['applicable'] and not [row for item in plans for row in item['requirements']
                        if row.get('missing') or row.get('invalid')],
                        'Historical MCP installation has unresolved requirements')
                if plan_only:
                    return
                inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                    dict(plan['install_payload'], run_migrations=True), label='installation-historical-mcp-install', timeout=300)
                inst.login()
            policies, offset = [], 0
            while True:
                page = inst.request('GET', '/api/v1/keeper/registry/entries?kind=security.policy&limit=200&offset=' + str(offset),
                                    label='installation-baseline-policies')
                for row in page['entries']:
                    entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(row['id'], safe=''),
                                         label='installation-baseline-policy-' + row['id'])['entry']
                    data = entry['data']
                    if 'app.security:user' in data.get('groups', []) and row['id'] not in historical:
                        policies.append(row['id'])
                if not page['has_more']:
                    break
                require(page['count'] > 0, 'Published policy pagination makes no progress')
                offset += page['count']
            require(policies, 'Published member runtime policies are absent')
            inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Historical endpoint selections',
                         'policies': historical + policies}, label='installation-historical-group')
            inst.wait(lambda: any(row['id'] == group for row in inst.request('GET', '/api/v1/users/assignable-scopes')['scopes']),
                      'Published installation group is assignable', seconds=60)
            email = slug + '@smoke.example'
            user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                                'full_name': 'Historical installation member', 'groups': [group, 'app.security:user']}, expect=(201,),
                                label='installation-member')['user']
            token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                                 auth='', label='installation-saved-token')['token']
            inst.redactor.add(token)
            def signing_shape(bearer):
                parts = bearer.split('.')
                expected = base64.urlsafe_b64encode(hmac.digest(inst.env['ENCRYPTION_KEY'].encode(), parts[0].encode(), 'sha256')).decode()
                return {'parts': len(parts), 'matches_environment': len(parts) == 2 and hmac.compare_digest(parts[1], expected)}
            inst.evidence.save('installation-signing-before', signing_shape(token))
            paths = ('/api/v1/connections', '/api/v1/user-agents', '/api/v1/user/me', '/api/v1/profile',
                     '/api/v1/principals/search?q=member', '/api/v1/nav/list')
            shared = inst.request('POST', '/api/v1/threads', {'title': 'Historical shared thread'}, expect=(201,),
                                  label='installation-shared-thread')['thread']['id']
            private = inst.request('POST', '/api/v1/threads', {'title': 'Historical private thread'}, expect=(201,),
                                   label='installation-private-thread')['thread']['id']
            inst.request('POST', '/api/v1/component-access/share/' + shared,
                         {'subject_type': 'group', 'subject_id': group, 'access_mask': 1}, label='installation-group-share')
            inst.request('PUT', '/api/v1/settings', {'namespace': 'kickside.users', 'key': 'token_expiration', 'value': '48h'},
                         label='installation-settings-before')
            def shared_access(bearer, phase):
                inst.request('GET', '/api/v1/threads/' + shared, auth=bearer, label='installation-share-' + phase)
                inst.request('GET', '/api/v1/threads/' + private, auth=bearer, expect=(403, 404),
                             label='installation-private-denied-' + phase)
                inst.request('PATCH', '/api/v1/threads/' + shared, {'attrs': {'unauthorized': True}}, auth=bearer,
                             expect=(403,), label='installation-share-write-denied-' + phase)
            mcp = None
            oauth = {}
            if credentials:
                mcp = inst.request('POST', '/api/v1/mcp/credentials',
                    {'label': 'Historical restricted credential', 'whitelist_component_ids': [shared],
                     'allowed_tool_ids': ['kickside.agents.traits:agents_action'],
                     'policy': {'allowed_trait_ids': []}}, auth=token,
                    label='installation-mcp-before')['credential']
                inst.redactor.add(mcp['token'])
            def mcp_access(phase):
                from mcp_client import MCPClient
                client = MCPClient(inst, mcp['token'], '/api/public/mcp', stateful=False)
                client.initialize()
                info = client.rpc('tools/call', {'name': 'session_info', 'arguments': {}}, 'installation-mcp-' + phase)
                require(not info.get('isError'), 'Historical MCP credential loses its session identity: ' + str(info))
                require(shared in json.dumps(info) and user['user_id'] in json.dumps(info),
                        'Historical MCP credential loses its principal or component restriction')
                allowed = client.rpc('tools/call', {'name': 'call_tool',
                    'arguments': {'id': 'Agents', 'arguments': {'action': 'list'}}},
                    'installation-mcp-tool-allowed-' + phase)
                require(not allowed.get('isError'), 'Historical MCP credential loses its allowed tool: ' + str(allowed))
                denied = client.rpc('tools/call', {'name': 'call_tool', 'arguments': {'id': 'CreateArtifact', 'arguments': {}}},
                                    'installation-mcp-tool-denied-' + phase)
                require(denied.get('isError') is True, 'Restricted historical MCP credential admits an unlisted tool')
                require('tool not active' in json.dumps(denied), 'Unlisted tool fails outside the restriction gate')
            def prepare_oauth():
                import hashlib
                redirect = 'http://127.0.0.1:49174/callback'
                registered = inst.request('POST', '/api/public/mcp/oauth/register',
                    {'redirect_uris': [redirect], 'client_name': 'Historical installation credential'},
                    auth='', expect=(201,), label='installation-oauth-register')
                verifier = secrets.token_urlsafe(48)
                challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
                params = {'response_type': 'code', 'client_id': registered['client_id'], 'redirect_uri': redirect,
                          'code_challenge_method': 'S256', 'code_challenge': challenge,
                          'resource': inst.base + '/api/public/mcp'}
                grant = inst.request('POST', '/api/v1/mcp/oauth/consent', {'params': params},
                                     label='installation-oauth-consent')
                code = parse_qs(urlsplit(grant['redirect_to']).query)['code'][0]
                inst.redactor.add(code)
                oauth['exchange'] = {'grant_type': 'authorization_code', 'client_id': registered['client_id'],
                                    'redirect_uri': redirect, 'code_verifier': verifier,
                                    'resource': params['resource'], 'code': code}
            def exchange_oauth():
                from mcp_client import MCPClient
                require(oauth.get('exchange'), 'Historical OAuth grant is absent')
                issued = inst.request('POST', '/api/public/mcp/oauth/token',
                    raw=urlencode(oauth['exchange']).encode(), auth='',
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}, label='installation-oauth-exchange-after')
                inst.redactor.add(issued['access_token'])
                client = MCPClient(inst, issued['access_token'], '/api/public/mcp', stateful=False)
                client.initialize()
                info = client.rpc('tools/call', {'name': 'session_info', 'arguments': {}}, 'installation-oauth-session-after')
                require(not info.get('isError'), 'Historical OAuth grant loses MCP access after update')
            def apply_update():
                payloads = token_payloads(inst)
                group_before = database_rows(inst, 'SELECT slug, policies FROM kickside_security_scopes')
                grants_before = database_rows(inst, 'SELECT * FROM kickside_component_access')
                mcp_before = database_rows(inst, 'SELECT credential_id, actor_id, whitelist_json, policy_json, status FROM kickside_mcp_credentials') if credentials else None
                inst.evidence.save('installation-stored-authority-before', {'groups': group_before, 'grants': grants_before,
                                                                          'credentials': mcp_before})
                inst.evidence.save('installation-credentials-before', {
                    'accounts': database_rows(inst, 'SELECT user_id, status, auth_generation FROM app_users'),
                    'memberships': database_rows(inst, 'SELECT user_id, group_id FROM app_user_groups')})
                for module, directory in sources.items():
                    directory = Path(directory)
                    source = Path(candidates[module])
                    shutil.rmtree(directory / 'src')
                    shutil.copytree(source, directory, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
                        '.git', '.wippy', 'wippy.lock', 'node_modules', '__pycache__', 'test', 'lint-harness'))
                install_credential_probe(Path(sources['kickside/users']))
                from module_lifecycle_contract import versions
                latest = versions(inst, 'kickside/kickside')[-1]
                plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                    {'component': 'kickside/kickside', 'version': '>=' + latest, 'run_migrations': True},
                    label='installation-application-plan', timeout=120)
                require(not [row for row in plan.get('requirements', []) if row.get('missing') or row.get('invalid')],
                        'Published application update has unresolved requirements')
                applied = inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                    dict(plan['install_payload'], run_migrations=True), label='installation-application-install', timeout=300)
                require(not [row for row in applied.get('execution', []) if row['status'] in ('failed', 'rollback_failed')],
                        'Published application update fails')
                after = token_payloads(inst)
                require(all(after.get(key) == value for key, value in payloads.items()),
                        'Application Hub update rewrites saved session payloads')
                inst.evidence.save('installation-credentials-after', {
                    'accounts': database_rows(inst, 'SELECT user_id, status, auth_generation FROM app_users'),
                    'memberships': database_rows(inst, 'SELECT user_id, group_id FROM app_user_groups'),
                    'delegations': database_rows(inst, 'SELECT * FROM app_user_delegation_epochs'),
                    'scopes': database_rows(inst, 'SELECT * FROM kickside_security_scopes')})
                def stored_authority():
                    groups = database_rows(inst, 'SELECT slug, policies FROM kickside_security_scopes')
                    grants = database_rows(inst, 'SELECT * FROM kickside_component_access')
                    credential_rows = database_rows(inst, 'SELECT credential_id, actor_id, whitelist_json, policy_json, status FROM kickside_mcp_credentials') if credentials else None
                    inst.evidence.save('installation-stored-authority-after', {'groups': groups, 'grants': grants,
                                                                             'credentials': credential_rows})
                    require(groups == group_before, 'Hub update changes historical policy selections')
                    current_grants = {row['access_id']: row for row in grants}
                    for row in grants_before:
                        current = current_grants.get(row['access_id'])
                        require(current is not None, 'Hub update removes a stored component grant')
                        require(all(current.get(key) == value for key, value in row.items() if key != 'access_mask'),
                                'Hub update changes a stored grant identity')
                        require(current['access_mask'] & row['access_mask'] == row['access_mask'],
                                'Hub update removes stored component access')
                        if row['subject_id'] == group:
                            require(current['access_mask'] == row['access_mask'], 'Hub update expands the historical group share')
                    require(credential_rows == mcp_before, 'Hub update changes historical MCP restrictions')
                    inst.login()
                    stored = inst.request('GET', '/api/v1/settings?namespace=kickside.users', label='installation-settings-after')
                    require(any(row['key'] == 'token_expiration' and row['value'] == '48h' for row in stored['settings']),
                            'Hub update changes the stored authentication setting')
                def native_access():
                    proof = inst.request('POST', '/api/public/installation-proof',
                        {'subject_id': user['user_id'], 'token': token, 'group': group, 'policies': historical}, auth='', label='installation-native-credential')
                    require(proof.get('valid') is True, 'Saved native credential fails: ' + str(proof))
                def native_grants():
                    proof = inst.request('POST', '/api/public/installation-proof',
                        {'subject_id': user['user_id'], 'token': token, 'group': group, 'policies': historical},
                        auth='', label='installation-native-historical-grants')
                    rows = proof['native']
                    require({row['id'] for row in rows} == set(historical), 'Native proof omits a historical component')
                    require(all(row['direct'] == 'allow' and row['composed'] == 'allow'
                                and row['foreign'] == 'undefined' and row['action'] == 'undefined' for row in rows),
                            'Historical direct and composed native authority differ: ' + str(rows))
                def fresh_access():
                    refreshed = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                                             auth='', label='installation-refreshed-token')['token']
                    inst.redactor.add(refreshed)
                    inst.evidence.save('installation-signing-after', signing_shape(refreshed))
                    all_checks(inst, [(path, lambda path=path: inst.request('GET', path, auth=refreshed,
                        label='installation-fresh-after-' + path)) for path in paths]
                        + [('fresh group share', lambda: shared_access(refreshed, 'fresh-after'))])
                def preserved_group():
                    inst.login()
                    groups = inst.request('GET', '/api/v1/users/' + user['user_id'] + '/groups',
                                          label='installation-preserved-groups')['groups']
                    require(group in groups, 'Application update loses the historical custom group')
                    inst.evidence.save('published-installation-update', {'receipts': receipts, 'historical': historical,
                                                                       'groups': groups, 'live_hub_update': True})
                def browser_access():
                    browser = fixture.browser_check()
                    browser.login(email, inst.password)
                    browser.frame.locator('.sidebar').wait_for(timeout=30000)
                def published_identity():
                    from scenarios_published_security_identity import published_security_identity
                    published_security_identity(fixture)
                all_checks(inst, [(path, lambda path=path: inst.request('GET', path, auth=token,
                           label='installation-saved-after-' + path)) for path in paths]
                           + [('saved group share', lambda: shared_access(token, 'saved-after')), ('stored authority', stored_authority), ('historical native grants', native_grants), ('native credential', native_access), ('fresh member', fresh_access), ('historical group', preserved_group),
                              ('member browser', browser_access), ('published identities', published_identity)]
                           + ([('MCP credential', lambda: mcp_access('after')), ('historical OAuth grant', exchange_oauth)]
                              if credentials else []))
            checks = [(path, lambda path=path: inst.request('GET', path, auth=token,
                       label='installation-before-' + path)) for path in paths if path not in ('/api/v1/profile', '/api/v1/principals/search?q=member')]
            checks.extend((path, lambda path=path: inst.request('GET', path, auth=token, expect=(403,),
                         label='installation-published-denial-' + path))
                         for path in ('/api/v1/profile', '/api/v1/principals/search?q=member'))
            checks.append(('published group share', lambda: shared_access(token, 'before')))
            if credentials:
                checks.append(('published MCP credential', lambda: mcp_access('before')))
                checks.append(('published OAuth grant', prepare_oauth))
            checks.append(('live application update', apply_update))
            all_checks(inst, checks)
            from scenarios_core import delete_user
            inst.login()
            delete_user(inst, user['user_id'], email, inst.password)
    finally:
        for directory in scratch:
            shutil.rmtree(directory)


REGISTRY = [Scenario('regression_published_installation_update', 'regression', published_installation_update,
                     issues=('SMOKE-PUBLISHED-WORKSPACE-FIXTURE', 'PUBLISHED-SESSION-SECURITY-IDENTITY', 'SECURITY-RETIRED-POLICY-GROUP-UPDATE', 'SMOKE-PUBLISHED-RESOURCE-BYTES', 'SECURITY-PUBLISHED-CUSTOM-GROUP-LOGIN', 'SECURITY-HISTORICAL-USERS-GRANTS', 'SMOKE-PUBLISHED-BOOT-STRICT-LINKING', 'SMOKE-PUBLISHED-DEPENDENCY-OWNERSHIP', 'SECURITY-SCOPE-PROJECTOR-HOT-UPGRADE', 'RUNTIME-INSTALL-LIFECYCLE-COMPLETION', 'RUNTIME-PUBLISHED-APPLICATION-REQUIREMENT-TARGETS', 'USERS-SAVED-SESSION-CONTRACT', 'RUNTIME-TOKENSTORE-BOOT-ENV-SIGNING', 'USERS-EXISTING-INSTALLATION-DELETE-LIFECYCLE', 'SECURITY-MEMBER-CATALOG-REGISTRY-AUTHORITY', 'SECURITY-RETIRED-SELECTION-SCOPE-CATALOG'))]


def published_credentials_update(ctx):
    published_installation_update(ctx, credentials=True)


REGISTRY.append(Scenario('regression_published_installation_credentials_update', 'regression', published_credentials_update,
    issues=('PUBLISHED-SESSION-SECURITY-IDENTITY', 'SECURITY-RETIRED-POLICY-GROUP-UPDATE',
            'USERS-SAVED-SESSION-CONTRACT', 'RUNTIME-TOKENSTORE-BOOT-ENV-SIGNING',
            'SECURITY-PUBLISHED-MCP-POLICY-UPDATE', 'SECURITY-PUBLISHED-MCP-ENDPOINT-IDENTITY',
            'SECURITY-MEMBER-CATALOG-REGISTRY-AUTHORITY', 'SECURITY-RETIRED-SELECTION-SCOPE-CATALOG')))


def published_mcp_install_plan(ctx):
    published_installation_update(ctx, credentials=True, plan_only=True)


REGISTRY.append(Scenario('regression_published_mcp_install_plan', 'regression', published_mcp_install_plan,
    issues=('KEEPER-PUBLISHED-REPLACEMENT-INSTALL-PLAN',)))
