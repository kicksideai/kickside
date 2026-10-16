"""Native targeted permission equality proof for installation rehearsals."""
import shutil
import uuid
from pathlib import Path

import yaml

from harness import Scenario, require
from permission_equality import PermissionChange, capture_account, compare_captures, exhaustive_pairs


HERE = Path(__file__).resolve().parent
NAMESPACE = 'smoke.permission_equality'


def install_probe(ctx):
    if ctx.state.get('permission_equality_probe'):
        return
    with ctx.paused():
        fixture = ctx.inst.app / 'src' / 'permission-equality-probe'
        fixture.mkdir()
        shutil.copyfile(HERE / 'mocks/permission_equality/audit_probe.lua', fixture / 'audit_probe.lua')
        entries = [
            {'name': 'audit', 'kind': 'function.lua', 'source': 'file://audit_probe.lua', 'method': 'run',
             'modules': ['funcs', 'http', 'json', 'registry', 'security'],
             'security': {'actor': {'id': NAMESPACE + ':audit'}, 'policies': [NAMESPACE + ':audit_access']}},
            {'name': 'audit.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/permission-equality', 'func': NAMESPACE + ':audit'},
            {'name': 'audit_access', 'kind': 'security.policy', 'policy': {
                'actions': ['funcs.call', 'registry.get', 'registry.find'],
                'resources': ['kickside.users.binding:subject_lookup', '*'], 'effect': 'allow'}},
            {'name': 'marker', 'kind': 'registry.entry'},
            {'name': 'allow', 'kind': 'security.policy', 'groups': [], 'policy': {
                'actions': 'permission_equality.read', 'resources': ['', NAMESPACE + ':marker'], 'effect': 'allow'}},
            {'name': 'deny', 'kind': 'security.policy', 'groups': [], 'policy': {
                'actions': 'permission_equality.read', 'resources': ['', NAMESPACE + ':marker'], 'effect': 'deny'}},
        ]
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))
    ctx.state['permission_equality_probe'] = True


def native_snapshot(request, pairs):
    response = request({'pairs': [{'action': action, 'resource': resource} for action, resource in pairs]})
    decisions = response.get('decisions')
    require(isinstance(decisions, list) and len(decisions) == len(pairs),
            'Native exhaustive permission response does not match its request')
    return tuple((action, resource, decision) for (action, resource), decision in zip(pairs, decisions))


def native_proof(ctx):
    inst = ctx.inst
    inst.boot()
    install_probe(ctx)
    catalog = inst.request('POST', '/api/v1/permission-equality?audit=catalog', label='permission-equality-catalog')['entries']
    suffix = uuid.uuid4().hex[:12]
    scope_slug = 'permission-equality-' + suffix
    scope_id = 'kickside.security.scopes:' + scope_slug
    allow = NAMESPACE + ':allow'
    deny = NAMESPACE + ':deny'
    scope = {'slug': scope_slug, 'label': 'Permission equality native proof', 'policies': [allow]}
    inst.request('POST', '/api/v1/security/scopes', scope, label='permission-equality-allow-scope')
    inst.cleanup.add('permission equality scope', lambda: inst.request(
        'DELETE', '/api/v1/security/scopes?slug=' + scope_slug))
    inst.wait(lambda: any(row['id'] == scope_id for row in inst.request(
        'GET', '/api/v1/users/assignable-scopes')['scopes']),
        'Permission equality scope becomes assignable')
    account = inst.request('POST', '/api/v1/users', {
        'email': 'permission-equality-' + suffix + '@smoke.example', 'password': inst.password,
        'full_name': 'Permission equality native proof', 'groups': ['app.security:user', scope_id]},
        expect=(201,), label='permission-equality-account')['user']
    inst.cleanup.add('permission equality account', lambda: inst.request(
        'DELETE', '/api/v1/users/' + account['user_id'], expect=(202,)))

    def request(body):
        return inst.request('POST', '/api/v1/permission-equality?audit=measure',
                            {'user_id': account['user_id'], **body}, label='permission-equality-audit', timeout=120)

    candidate_rules = [{'actions': 'permission_equality.read', 'resources': ['', NAMESPACE + ':marker'], 'effect': 'deny'}]
    before = capture_account(request, account['user_id'], catalog, candidate_rules=candidate_rules)
    require(('permission_equality.read', '', 'A') in before['snapshot'],
            'Targeted native proof omits the empty resource grant')
    actions = sorted({action for rule in before['rules'].values() for action in
                      (rule['actions'] if isinstance(rule['actions'], list) else [rule['actions']])})
    exhaustive = exhaustive_pairs(actions, catalog)
    exhaustive_before = native_snapshot(request, exhaustive)
    inst.request('POST', '/api/v1/security/scopes', {**scope, 'policies': [deny]},
                 label='permission-equality-deny-scope')

    def captured_after():
        result = capture_account(request, account['user_id'], catalog, previous_pairs=before['pairs'])
        decision = next((value for action, resource, value in result['snapshot']
                         if action == 'permission_equality.read' and resource == NAMESPACE + ':marker'), None)
        return result if decision == 'D' else None
    after = inst.wait(captured_after, 'Permission equality deny scope becomes effective')
    require(('permission_equality.read', '', 'D') in after['snapshot'],
            'Targeted native proof omits the empty resource denial')
    exhaustive_after = native_snapshot(request, exhaustive)
    targeted_changed = exhaustive_changed = False
    try:
        compare_captures(before, after)
    except PermissionChange:
        targeted_changed = True
    if exhaustive_before != exhaustive_after:
        exhaustive_changed = True
    require(targeted_changed, 'Targeted native proof does not detect the constructed permission change')
    require(targeted_changed == exhaustive_changed,
            'Targeted and exhaustive native proof verdicts differ for the constructed account')
    inst.evidence.save('permission-equality-native-proof', {
        'account_id': account['user_id'], 'targeted_pairs': len(before['pairs']),
        'exhaustive_pairs': len(exhaustive), 'exhaustive_actions': len(actions),
        'registry_entries': len(catalog), 'targeted_changed': targeted_changed,
        'exhaustive_changed': exhaustive_changed,
    })


REGISTRY = [Scenario('permission_equality_native_proof', 'regression', native_proof, instance_setup=True,
                     issues=('SMOKE-PERMISSION-EQUALITY-EMPTY-SELECTOR',))]
