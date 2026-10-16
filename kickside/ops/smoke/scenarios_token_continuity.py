"""Saved credentials follow live membership across real Hub policy updates."""
import shutil
import hashlib
import uuid
from contextlib import contextmanager
from copy import deepcopy
from urllib.parse import quote
from pathlib import Path

import yaml

from harness import Scenario, require
from module_lifecycle_contract import update_source
from module_harness import run_focused_module_test
from scenarios_hot_update_work import database_rows
from runtime_fixtures import isolated_fixture

MODULE = 'kickside/users'
NS = 'kickside.users.continuity'
PATH = '/api/v1/token-continuity'


def source_fixture(ctx):
    inst = ctx.inst
    source = inst.config['replace'].get(MODULE)
    require(source, 'Token continuity requires the local Users source replacement')
    directory = inst.root / 'users-continuity-update'
    shutil.copytree(source, directory, ignore=shutil.ignore_patterns(
        '.git', '.wippy', 'node_modules', '__pycache__', 'test', 'ui', 'lint-harness'))
    target = directory / 'src' / 'continuity'
    target.mkdir()
    shutil.copyfile(Path(__file__).parent / 'mocks/token_continuity/probe.lua', target / 'probe.lua')
    entries = [
        {'name': 'probe', 'kind': 'function.lua', 'source': 'file://probe.lua',
         'method': 'handler', 'modules': ['http', 'security']},
        {'name': 'probe.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'router'},
         'method': 'GET', 'path': '/token-continuity', 'func': NS + ':probe'},
        policy('before', ['access', 'smoke.continuity'], [NS + ':probe.endpoint', NS + ':retained']),
        policy('removed', ['smoke.continuity'], [NS + ':removed']),
        policy('read_current_group', ['security.policy_group.get'], ['app.security:user']),
    ]
    (target / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))
    index = directory / 'src/_index.yaml'
    document = yaml.safe_load(index.read_text())
    router = next(row for row in document['entries'] if row['name'] == 'api_router')
    router['targets'].append({'entry': NS + ':probe.endpoint', 'path': '.meta.router'})
    index.write_text(yaml.safe_dump(document, sort_keys=False))
    config_path = inst.app / '.wippy.yaml'
    config = yaml.safe_load(config_path.read_text())
    config.setdefault('workspace', {}).setdefault('replacements', {})[MODULE] = str(directory)
    config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    inst.config['replace'] = dict(inst.config['replace'], **{MODULE: str(directory)})
    inst.resolve_dependencies(modules=(MODULE,))
    ctx.state['continuity_source'] = directory
    return directory


def policy(name, actions, resources):
    return {'name': name, 'kind': 'security.policy', 'groups': ['app.security:user'],
            'policy': {'actions': actions, 'resources': resources, 'effect': 'allow'}}


def member(inst):
    email = 'continuity-' + uuid.uuid4().hex[:10] + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Saved credential member'}, expect=(201,), label='continuity-member')['user']
    return user


def issue(inst, user):
    token = inst.request('POST', '/api/public/user/token',
        {'email': user['email'], 'password': inst.password}, auth='', label='continuity-api-issue')['token']
    inst.redactor.add(token)
    return token


def token_payloads(inst):
    rows = database_rows(inst, 'SELECT token_key, token_value FROM kickside_user_auth_tokens')
    return {row['token_key']: hashlib.sha256(
        row['token_value'] if isinstance(row['token_value'], bytes)
        else str(row['token_value']).encode()).hexdigest() for row in rows}


def credential_snapshot(inst, label):
    payloads = token_payloads(inst)
    sessions = database_rows(inst, 'SELECT token_key, user_id, auth_generation FROM kickside_user_sessions')
    inst.evidence.save(label, {
        'payload_digests': {hashlib.sha256(key.encode()).hexdigest(): value for key, value in payloads.items()},
        'sessions': [{'key_digest': hashlib.sha256(row['token_key'].encode()).hexdigest(),
                      'user_id': row['user_id'], 'auth_generation': row['auth_generation']}
                     for row in sessions],
        'accounts': database_rows(inst, 'SELECT user_id, status, auth_generation FROM app_users'),
        'delegations': database_rows(inst, 'SELECT user_id, generation FROM app_user_delegation_epochs'),
        'runtime_pid': inst.process.pid,
    })


@contextmanager
def updated_policy_fixture(ctx):
    with isolated_fixture(ctx, config=deepcopy(ctx.inst.config), prepare=source_fixture) as fixture:
        inst = fixture.inst
        directory = fixture.state['continuity_source']
        user = member(inst)
        api_token = issue(inst, user)
        browser = fixture.browser_check()
        response = browser.context.request.post(inst.base + '/api/public/user/token',
            data={'email': user['email'], 'password': inst.password})
        require(response.status == 200, 'Browser session issue fails')
        browser_token = response.json()['token']
        inst.redactor.add(browser_token)
        browser.context.add_cookies([{'name': 'x-auth-token', 'value': browser_token, 'url': inst.base}])
        saved_payloads = token_payloads(inst)
        baseline = {'retained': True, 'removed': True, 'added': False}
        baseline_scopes = {'saved': baseline, 'live': baseline}
        for token in (api_token, browser_token):
            require(inst.request('GET', PATH, auth=token, label='continuity-before') == baseline_scopes,
                    'Saved token baseline differs from its group policy')
        browser_before = browser.context.request.get(inst.base + PATH)
        require(browser_before.status == 200 and browser_before.json() == baseline_scopes,
                'Saved browser cookie baseline differs from its group policy')
        browser.page.goto(inst.base + PATH, wait_until='domcontentloaded', timeout=30000)
        credential_snapshot(inst, 'credentials-before-update')
        index = directory / 'src/continuity/_index.yaml'
        document = yaml.safe_load(index.read_text())
        entries = document['entries']
        next(row for row in entries if row['name'] == 'before')['name'] = 'after'
        entries[:] = [row for row in entries if row['name'] != 'removed']
        entries.append(policy('added', ['smoke.continuity'], [NS + ':added']))
        index.write_text(yaml.safe_dump(document, sort_keys=False))
        update_source(fixture, str(directory), MODULE, live=True)
        credential_snapshot(inst, 'credentials-after-update')
        dependencies = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=1',
                                    label='continuity-applied-policies')['dependencies']
        active = {entry['id'] for dependency in dependencies for entry in dependency.get('entries', [])}
        require(not {NS + ':before', NS + ':removed'} & active,
                'Hub update retains the renamed or removed fixture policy')
        require({NS + ':after', NS + ':added'} <= active, 'Hub update omits current fixture policies')
        for name in ('before', 'removed', 'after', 'added'):
            inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(NS + ':' + name, safe=''),
                         expect=(200, 400, 404), label='continuity-current-policy-' + name)
        expected = {'retained': True, 'removed': False, 'added': True}
        def current_groups():
            result = inst.request('GET', PATH + '?policy_ids=1', label='continuity-current-groups')
            return result if result.get('live') == expected else None
        current = inst.wait(current_groups, 'Hub update projects current group authority', seconds=60)
        inst.evidence.save("live-group-policy-update", {
            "expected": expected, "current_groups": current["live"],
            "active_fixture_policies": sorted(entry for entry in active if entry.startswith(NS + ":")),
            "runtime_pid": inst.process.pid, "relogin": False,
        })
        yield fixture, user, api_token, browser, browser_token, saved_payloads, current


def hub_policy_projection(ctx):
    with updated_policy_fixture(ctx):
        pass


def hub_policy_update(ctx):
    with updated_policy_fixture(ctx) as updated:
        fixture, user, api_token, browser, browser_token, saved_payloads, current = updated
        inst = fixture.inst
        expected = {"retained": True, "removed": False, "added": True}
        statuses = {}
        for kind, token in (('api', api_token), ('browser', browser_token)):
            statuses[kind] = {}
            for name, path in (('probe', PATH), ('profile', '/api/v1/user/me'),
                               ('agents', '/api/v1/user-agents')):
                result = inst.request('GET', path, auth=token, expect=(200, 401, 403),
                    label='continuity-after-' + kind + '-' + name)
                statuses[kind][name] = result
        browser_result = browser.context.request.get(inst.base + PATH)
        browser_scope = browser_result.json()
        current_payloads = token_payloads(inst)
        unchanged = all(current_payloads.get(key) == value for key, value in saved_payloads.items())
        inst.evidence.save('saved-token-continuity', {'responses': statuses,
            'browser_cookie_status': browser_result.status, 'browser_scope': browser_scope,
            'expected': expected, 'current_groups': current['live'],
            'runtime_pid': inst.process.pid, 'user_id': user['user_id'], 'relogin': False,
            'saved_payloads_unchanged': unchanged})
        require(unchanged, 'Hub policy update rewrites or removes saved tokens')
        expected_scopes = {'saved': expected, 'live': expected}
        require(statuses['api']['probe'] == expected_scopes and statuses['browser']['probe'] == expected_scopes,
                'Saved policy-ID tokens do not recover current group policies after Hub update')
        require(browser_result.status == 200 and browser_scope == expected_scopes,
                'Saved browser cookie loses live authorization after Hub update')
        for kind in ('api', 'browser'):
            require(statuses[kind]['profile'].get('success') is True
                    and statuses[kind]['profile'].get('user', {}).get('id') == user['user_id'],
                    'Saved credential loses its self-service identity')
            require(statuses[kind]['agents'].get('success') is True,
                    'Saved credential loses agent access')


def native_token_continuity(ctx):
    source = Path(ctx.inst.config['replace'][MODULE]) / 'test/suites/token_continuity_test.lua'
    require('registry.apply_version' not in source.read_text(),
            'Saved-token fixture teardown restores unrelated registry entries')
    run_focused_module_test(ctx, MODULE, 'token_continuity_test')
    run_focused_module_test(ctx, MODULE, 'token_continuity_fencing_test')
    run_focused_module_test(ctx, MODULE, 'token_continuity_coverage_test')
    run_focused_module_test(ctx, MODULE, 'token_continuity_operation_test')
    run_focused_module_test(ctx, MODULE, 'login_scope_test')
    run_focused_module_test(ctx, MODULE, 'run_as_membership_test')


def mcp_live_group_authorization(ctx):
    run_focused_module_test(ctx, "kickside/execution", 'tsplit_execution_identity_test_execution_live_authority')


def delegated_membership_scopes(ctx):
    run_focused_module_test(ctx, MODULE, 'delegation_authority_test')
    run_focused_module_test(ctx, MODULE, 'users_directory_scope_resolution_test')
    run_focused_module_test(ctx, MODULE, 'scope_reduction_boundary_test')


def disabled_webhook_principal(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        inst.install('kickside/webhooks')
        user = member(inst)
        token = issue(inst, user)
        hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Live principal guard',
            'schema': {'type': 'object'}}, auth=token, label='continuity-webhook')['webhook']
        inst.redactor.add(hook['secret'])
        path = '/api/public/hooks/' + hook['webhook_id']
        inst.request('POST', path, {'before': True}, auth=hook['secret'], expect=(202,),
            label='continuity-webhook-before')
        inst.request('PUT', '/api/v1/users/' + user['user_id'], {'status': 'inactive'},
            label='continuity-webhook-disable')
        user_id = user['user_id'].replace("'", "''")
        webhook_id = hook['webhook_id'].replace("'", "''")
        stored = database_rows(inst, "SELECT user_id, status FROM app_users WHERE user_id = '" + user_id + "'")
        require(len(stored) == 1 and stored[0]['status'] == 'inactive',
                'Webhook owner inactivation does not persist')
        events_query = "SELECT type, role, body FROM kickside_event WHERE thread_id = '" + webhook_id + "' ORDER BY seq"
        before = database_rows(inst, events_query)
        require(len(before) == 1, 'Active webhook does not durably append its baseline event')
        try:
            inst.request('POST', path, {'after': True}, auth=hook['secret'], expect=(401, 403),
                label='continuity-webhook-disabled')
        finally:
            after = database_rows(inst, events_query)
            inst.evidence.save('inactive-webhook-principal', {'owner': stored,
                'events_before': before, 'events_after': after})
        require(after == before, 'Inactive webhook owner appends a durable event')


REGISTRY = [
    Scenario('regression_delegated_membership_scopes', 'regression', delegated_membership_scopes,
             issues=('USERS-DELEGATED-MEMBERSHIP-SCOPE-LOSS', 'USERS-REDUCTION-FENCE-FIXTURE-RACE', 'RA-H47')),
    Scenario("regression_live_group_hub_policy_update", "regression", hub_policy_projection,
             ("boot",), issues=("SECURITY-LIVE-GROUP-HUB-POLICY-UPDATE",)),
    Scenario("regression_mcp_credential_live_groups", "regression", mcp_live_group_authorization,
             issues=("MCP-CREDENTIAL-LIVE-GROUP-AUTHORIZATION", "EXECUTION-AUTHORIZER-PRINCIPAL-SELECTION")),
    Scenario('regression_saved_token_hub_policy_update', 'regression', hub_policy_update,
             ('boot',), issues=('SAVED-TOKEN-LIVE-GROUP-AUTHORIZATION',
                               'USERS-SAVED-SESSION-CONTRACT',
                               'SECURITY-LIVE-GROUP-HUB-POLICY-UPDATE',
                               'RUNTIME-TOKENSTORE-HTTP-SEALED-FRAME')),
    Scenario('regression_saved_token_live_groups', 'regression', native_token_continuity,
             issues=('SMOKE-FOCUSED-RESOURCE-ISOLATION', 'SAVED-TOKEN-LIVE-GROUP-AUTHORIZATION', 'MCP-CREDENTIAL-LIVE-GROUP-AUTHORIZATION',
                     'USERS-SAVED-SESSION-CONTRACT', 'USERS-UNCHANGED-AUTHORITY-DELEGATION-REVOCATION',
                     'SMOKE-SAVED-TOKEN-REGISTRY-WRITER-ORDER')),
    Scenario('regression_webhook_disabled_principal', 'regression', disabled_webhook_principal,
             ('boot',), issues=('WEBHOOK-LIVE-PRINCIPAL-AUTHORIZATION',)),
]


def webhook_live_principal_native(ctx):
    run_focused_module_test(ctx, 'kickside/webhooks', 'tsplit_webhooks_test_webhook_ingress')


REGISTRY += [Scenario('regression_webhook_live_principal_native', 'regression',
    webhook_live_principal_native, ('boot',), instance_setup=True,
    issues=('WEBHOOK-LIVE-PRINCIPAL-AUTHORIZATION',))]
