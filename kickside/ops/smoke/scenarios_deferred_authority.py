"""Native deferred-authority smoke guards for the run-as identity boundary."""
import shutil
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yaml

from harness import Scenario, require

HERE = Path(__file__).resolve().parent
NAMESPACE = 'smoke.identity_authority'
OWNER = NAMESPACE + ':deferred_owner'


def _fixture(ctx, group, denied_group=None, unbound_group=None):
    """Install a private trusted owner and native policy fixture into this app."""
    inst = ctx.inst
    with ctx.paused():
        fixture = inst.app / 'src' / 'identity-authority-smoke'
        fixture.mkdir(exist_ok=True)
        shutil.copyfile(HERE / 'mocks/identity_authority/authority_fixture.lua', fixture / 'authority_fixture.lua')
        # identity_probe.lua is supplied by the identity change.  Copying its
        # merged source makes the smoke fixture exercise the exact protected
        # capture helper rather than a local imitation.
        shutil.copyfile(HERE / 'mocks/identity_authority/identity_probe.lua', fixture / 'identity_probe.lua')
        entries = [
            {'name': 'authority_fixture', 'kind': 'library.lua', 'source': 'file://authority_fixture.lua',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'identity_probe', 'kind': 'function.lua', 'source': 'file://identity_probe.lua', 'method': 'capture',
             'modules': ['security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity', 'component': 'kickside.component:component'}},
            {'name': 'component_identity', 'kind': 'function.lua', 'source': 'file://identity_probe.lua', 'method': 'component_identity',
             'modules': ['security'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity', 'component': 'kickside.component:component'}},
            {'name': 'install_delegation', 'kind': 'function.lua', 'source': 'file://authority_fixture.lua', 'method': 'install_delegation',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'deferred', 'kind': 'function.lua', 'source': 'file://authority_fixture.lua', 'method': 'deferred',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'projection', 'kind': 'function.lua', 'source': 'file://authority_fixture.lua', 'method': 'projection',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'clear_projection_fence', 'kind': 'function.lua', 'source': 'file://authority_fixture.lua', 'method': 'clear_projection_fence',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'adopt_restricted', 'kind': 'function.lua', 'source': 'file://authority_fixture.lua', 'method': 'adopt_restricted',
             'modules': ['http', 'json', 'registry', 'funcs', 'security', 'sql', 'uuid', 'time'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'scope_projection': 'kickside.security.service:scope_projection',
                         'scope_store': 'kickside.security.persist:scope_store', 'component': 'kickside.component:component'}},
            {'name': 'install_delegation.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/identity-authority/delegation', 'func': NAMESPACE + ':install_delegation'},
            {'name': 'deferred.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/identity-authority/deferred', 'func': NAMESPACE + ':deferred'},
            {'name': 'projection.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/identity-authority/projection', 'func': NAMESPACE + ':projection'},
            {'name': 'clear_projection_fence.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/identity-authority/projection/clear', 'func': NAMESPACE + ':clear_projection_fence'},
            {'name': 'adopt_restricted.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/identity-authority/adopt-restricted', 'func': NAMESPACE + ':adopt_restricted'},
            {'name': 'deferred_owner', 'kind': 'registry.entry', 'meta': {'private': True}},
            {'name': 'deferred_owner_access', 'kind': 'security.policy', 'groups': ['app.security:admin'],
             'policy': {'actions': 'kickside.execution.defer', 'resources': OWNER, 'effect': 'allow'}},
            {'name': 'operator_role', 'kind': 'registry.entry', 'meta': {'type': 'kickside.security.role', 'title': 'Smoke delegation operators'},
             'role_id': group, 'protected': False},
        ]
        for index, role in enumerate((denied_group, unbound_group)):
            if role:
                entries.append({'name': 'fixture_role_' + str(index), 'kind': 'registry.entry',
                                'meta': {'type': 'kickside.security.role', 'title': 'Smoke delegation fixture role'},
                                'role_id': role, 'protected': False})
        entries.extend([
            {'name': 'fixture_role_binding', 'kind': 'security.policy',
             'groups': [role for role in (group, denied_group, unbound_group) if role],
             'policy': {'actions': 'registry.get', 'resources': NAMESPACE + ':operator_role', 'effect': 'allow'}},
            {'name': 'probe_access', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['registry.get', 'funcs.call'],
                        'resources': NAMESPACE + ':identity_probe', 'effect': 'allow'}},
        ])
        (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))


def _user(inst, suffix, label, groups):
    email = label + '-' + suffix + '@smoke.example'
    record = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                          'full_name': label, 'groups': groups}, expect=(201,), label=label + '-create')['user']
    inst.cleanup.add(label + ' user', lambda uid=record['user_id']: inst.request(
        'DELETE', '/api/v1/users/' + uid, expect=(202,), label=label + '-delete'))
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label=label + '-login')['token']
    inst.redactor.add(token)
    return record, token


def deferred_native_authority(ctx):
    """RA-H07/H08/H10: a worker cannot replace the recorded authorizer scope."""
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    operators = 'app.security:deferred_operators_' + suffix
    denies = 'app.security:deferred_denies_' + suffix
    unbound = 'app.security:deferred_unbound_' + suffix
    _fixture(ctx, operators, denies, unbound)
    inst.install('kickside/inbox')
    inst.install('kickside/automation')
    # The target has an ordinary signed session.  The authorizer's single
    # operator membership is the only source of its delegation decision.
    target, _ = _user(inst, suffix, 'deferred-target', ['app.security:user'])
    authorizer, authorizer_token = _user(inst, suffix, 'deferred-authorizer', ['app.security:user', operators])
    automation = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': {
        'title': 'Deferred authority root ' + suffix, 'enabled': False,
        'schedule': {'type': 'interval', 'expression': '1h'},
        'target': {'kind': 'action', 'port': 'kickside.inbox.sink:inbox_item', 'config': {},
                   'input': {'title': 'Deferred authority fixture', 'content': suffix}},
    }}, label='deferred-authority-root')['id']
    inst.cleanup.add('deferred authority automation', lambda: inst.request(
        'DELETE', '/api/v1/automations/' + automation, label='deferred-authority-root-delete'))
    inst.request('POST', '/api/v1/component-access/share/' + automation,
                 {'subject_type': 'user', 'subject_id': authorizer['user_id'], 'access_mask': 15},
                 label='authorizer-component-admin')
    payload = {'target_id': target['user_id'], 'authorizer_id': authorizer['user_id'], 'group': operators,
               'root': automation, 'component_id': automation}
    # A durable native policy record for the exact resource does not authorize
    # an authorizer who has no membership binding to it.
    inst.request('POST', '/api/v1/identity-authority/delegation',
                 {**payload, 'group': unbound, 'policy_name': 'unbound_' + suffix}, label='native-unbound-delegation')
    inst.request('PUT', '/api/v1/users/' + authorizer['user_id'] + '/groups',
                 {'groups': ['app.security:user', operators]}, label='authorizer-unbound-scope-refresh')
    unbound_denial = inst.request('POST', '/api/v1/identity-authority/deferred', payload, expect=(403,),
                                  label='grant-record-unbound-to-authorizer')
    require(unbound_denial.get('success') is False and 'delegation' in unbound_denial.get('error', '').lower(),
            'a delegation record without authorizer binding permits deferred execution')
    payload['root'] = '*'
    payload.pop('component_id')
    created = inst.request('POST', '/api/v1/identity-authority/delegation', payload,
                           label='native-all-roots-delegation')
    require(created.get('success') is True and created.get('policy_id', '').startswith('kickside.delegate:'),
            'fixture does not create the native all-roots delegation policy')
    # Replacing the unchanged membership forces a fresh Users-derived scope
    # after the policy declaration exists; the session itself is not authority.
    inst.request('PUT', '/api/v1/users/' + authorizer['user_id'] + '/groups',
                 {'groups': ['app.security:user', operators]}, label='authorizer-live-scope-refresh')
    payload['root'] = automation
    payload['component_id'] = automation
    allowed = inst.request('POST', '/api/v1/identity-authority/deferred', payload,
                           label='deferred-live-authorizer-allow')
    require(allowed.get('success') is True and allowed.get('result', {}).get('actor_id') == target['user_id'],
            'deferred resolution does not evaluate the native policy as the recorded authorizer')
    # An exact-root native deny wins over the all-root allow after both scope
    # groups are materialized for the same recorded authorizer.
    exact_deny = inst.request('POST', '/api/v1/identity-authority/delegation',
                          {**payload, 'group': denies, 'root': automation, 'effect': 'deny',
                           'policy_name': 'exact_deny_' + suffix}, label='native-exact-root-deny')
    require(exact_deny.get('success') is True, 'fixture does not create exact-root native deny')
    inst.request('PUT', '/api/v1/users/' + authorizer['user_id'] + '/groups',
                 {'groups': ['app.security:user', operators, denies]}, label='authorizer-exact-deny-scope-refresh')
    exact_denial = inst.request('POST', '/api/v1/identity-authority/deferred', payload, expect=(403,),
                                label='exact-root-deny-overrides-all-root-allow')
    require(exact_denial.get('success') is False and 'delegation' in exact_denial.get('error', '').lower(),
            'exact-root deny does not override all-root native allow')
    # The broad admin worker stays able to call the trusted owner. Removing the
    # authorizer's operator group must nevertheless deny on the next boundary.
    inst.request('PUT', '/api/v1/users/' + authorizer['user_id'] + '/groups',
                 {'groups': ['app.security:user']}, label='remove-authorizer-delegation')
    denied = inst.request('POST', '/api/v1/identity-authority/deferred', payload, expect=(403,),
                          label='broad-worker-cannot-substitute-authorizer')
    require(denied.get('success') is False and 'delegation' in denied.get('error', '').lower(),
            'deferred worker scope substitutes for removed authorizer delegation')
    inst.request('GET', '/api/v1/user/me', auth=authorizer_token, expect=(401,),
                 label='authorizer-reduction-revokes-old-session')
    authorizer_token = inst.request('POST', '/api/public/user/token',
                                    {'email': authorizer['email'], 'password': inst.password}, auth='',
                                    label='authorizer-current-session')['token']
    inst.redactor.add(authorizer_token)
    # The signed authorizer session remains a distinct principal and cannot
    # use the fixture endpoint as an accidental worker grant.
    inst.request('POST', '/api/v1/identity-authority/deferred', payload, auth=authorizer_token, expect=(403,),
                 label='authorizer-session-has-no-worker-grant')
    inst.evidence.save('deferred-native-authority', {'target': target['user_id'], 'authorizer': authorizer['user_id'],
                       'operator_group': operators, 'native_policy': created['policy_id'], 'root': automation,
                       'exact_deny_policy': exact_deny['policy_id']})


def projection_checked_fast_path(ctx):
    """RA-H47/H48/H49: live group sets reuse safely and fence only affected sets."""
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    group = 'app.security:projection_warm_' + suffix
    unrelated = 'app.security:projection_unrelated_' + suffix
    _fixture(ctx, group)
    warm = {'groups': [group]}
    first = inst.request('POST', '/api/v1/identity-authority/projection', warm, label='projection-first-materialize')
    require(first.get('success') is True, 'initial projection materialization fails: ' + str(first))
    first_scope = first['result'].get('scope_name')
    # A reduction fence for a different principal must not turn a warm scope
    # lookup into a global reconciliation or deny unrelated authority.
    warm_again = inst.request('POST', '/api/v1/identity-authority/projection',
                              {**warm, 'fence_group': unrelated}, label='projection-unrelated-fence')
    require(warm_again.get('success') is True and warm_again['result'].get('scope_name') == first_scope,
            'unrelated pending reduction prevents checked warm scope reuse')
    # The affected set fails closed until its reduction fence clears.
    affected = inst.request('POST', '/api/v1/identity-authority/projection',
                            {**warm, 'fence_group': group}, expect=(409,), label='projection-affected-fence')
    require(affected.get('success') is False, 'affected reduction fence permits materialization')
    inst.request('POST', '/api/v1/identity-authority/projection/clear', {'group': group}, label='projection-clear-affected-fence')
    aggregate = inst.request('POST', '/api/v1/identity-authority/projection',
                            {**warm, 'fence_group': first_scope}, expect=(409,), label='projection-aggregate-fence')
    require(aggregate.get('success') is False, 'materialized-set reduction fence permits warm reuse')
    inst.request('POST', '/api/v1/identity-authority/projection/clear', {'group': first_scope}, label='projection-clear-aggregate-fence')
    inst.request('POST', '/api/v1/identity-authority/projection/clear', {'group': unrelated}, label='projection-clear-unrelated-fence')
    # Concurrent calls must return one canonical group-set scope.  The Security
    # owner coalesces the materialization rather than creating per-request scopes.
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(inst.request, 'POST', '/api/v1/identity-authority/projection', warm,
                               label='projection-concurrent-' + str(index)) for index in range(6)]
        concurrent = [future.result() for future in futures]
    require(all(row.get('success') is True for row in concurrent), 'concurrent checked materializations fail: ' + str(concurrent))
    require({row['result'].get('scope_name') for row in concurrent} == {first_scope},
            'same memberships materialize more than one native group set')
    inst.evidence.save('projection-checked-fast-path', {'group': group, 'scope': first_scope,
                       'concurrent_requests': len(concurrent), 'unrelated_fence': unrelated})


def nested_capture_retains_admission(ctx):
    """RA-H20: nested capture retains authorizer and an actual MCP restriction."""
    inst = ctx.inst
    inst.install('kickside/mcp')
    suffix = uuid.uuid4().hex[:12]
    operators = 'app.security:nested_capture_' + suffix
    _fixture(ctx, operators)
    target, target_token = _user(inst, suffix, 'nested-target', ['app.security:user', 'app.security:members'])
    authorizer, _ = _user(inst, suffix, 'nested-authorizer', ['app.security:user', operators])
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Nested capture authority',
                              'allowed_tool_ids': []}, auth=target_token, label='nested-live-credential')['credential']
    inst.redactor.add(credential['token'])
    payload = {'target_id': target['user_id'], 'authorizer_id': authorizer['user_id'], 'group': operators,
               'root': '*', 'credential_id': credential['credential_id']}
    inst.request('POST', '/api/v1/identity-authority/delegation', payload, label='nested-native-delegation')
    inst.request('PUT', '/api/v1/users/' + authorizer['user_id'] + '/groups',
                 {'groups': ['app.security:user', operators]}, label='nested-authorizer-live-scope')
    captured = inst.request('POST', '/api/v1/identity-authority/deferred', payload,
                            label='nested-protected-capture')
    require(captured.get('success') is True, 'nested capture fails: ' + str(captured))
    nested = captured['result']['identity']
    require(nested['principal'] == {'kind': 'user', 'id': target['user_id']},
            'nested capture changes the admitted principal')
    require(nested['authorized_by'] == {'kind': 'user', 'id': authorizer['user_id']},
            'nested capture replaces the recorded authorizer with the selected principal')
    require(nested.get('credential_id') == credential['credential_id'],
            'nested capture strips the live credential restriction')
    inst.evidence.save('nested-capture-admission', {'target': target['user_id'], 'authorizer': authorizer['user_id'],
                       'credential_id': credential['credential_id']})


def protected_adoption_keeps_credential(ctx):
    """RA-H21: Component's protected identity command preserves a real credential restriction."""
    inst = ctx.inst
    inst.install('kickside/mcp')
    _fixture(ctx, 'app.security:adoption_' + uuid.uuid4().hex[:12])
    credential = inst.request('POST', '/api/v1/mcp/credentials', {'label': 'Protected adoption credential',
                              'allowed_tool_ids': []}, label='protected-adoption-live-credential')['credential']
    inst.redactor.add(credential['token'])
    adopted = inst.request('POST', '/api/v1/identity-authority/adopt-restricted',
                           {'credential_id': credential['credential_id']}, label='protected-component-adoption')
    require(adopted.get('success') is True, 'protected adoption fails: ' + str(adopted))
    receipt = adopted['receipt']
    require(receipt['identity']['credential_id'] == credential['credential_id'],
            'Component adoption strips the authoritative MCP credential restriction')
    require(receipt['identity_generation'] == 1 and receipt.get('identity_hash'),
            'Component adoption does not advance the protected identity receipt')
    inst.evidence.save('protected-adoption-credential', {'component_id': receipt['component_id'],
                       'credential_id': credential['credential_id'], 'identity_generation': receipt['identity_generation']})


REGISTRY = [
    Scenario('deferred_native_authority', 'full', deferred_native_authority, ('boot',), instance_setup=True,
             issues=('RA-H07', 'RA-H08', 'RA-H10', 'SECURITY-SCOPE-PROJECTION-LIVENESS'),
             features=('kickside/users|http|POST /api/v1/users',
                       'kickside/users|http|PUT /api/v1/users/{id}/groups',
                       'kickside/users|http|POST /api/public/user/token')),
    Scenario('projection_checked_fast_path', 'full', projection_checked_fast_path, ('boot',), instance_setup=True,
             issues=('RA-H47', 'RA-H49')),
    Scenario('nested_capture_retains_admission', 'full', nested_capture_retains_admission, ('boot',), instance_setup=True,
             issues=('RA-H20', 'SECURITY-SCOPE-PROJECTION-LIVENESS'),
             features=('kickside/mcp|http|POST /api/v1/mcp/credentials',
                       'kickside/users|http|POST /api/public/user/token')),
    Scenario('protected_adoption_keeps_credential', 'full', protected_adoption_keeps_credential, ('boot',), instance_setup=True,
             issues=('RA-H21',), features=('kickside/mcp|http|POST /api/v1/mcp/credentials',)),
]
