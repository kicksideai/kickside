"""Whole membership at the public login and authenticated Users endpoints."""
import uuid

import yaml

from harness import Scenario, require


def users_whole_membership(ctx):
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    namespace = 'app.security'
    extra_groups = [namespace + ':membership_' + suffix + '_' + str(i) for i in range(120)]
    groups = extra_groups + ['app.security:user']
    with ctx.paused():
        fixture = inst.app / 'src' / ('membership-' + suffix)
        fixture.mkdir()
        entries = []
        for index, group in enumerate(extra_groups):
            entries.extend([
                {'name': 'membership_role_' + suffix + '_' + str(index), 'kind': 'registry.entry',
                 'meta': {'type': 'kickside.security.role', 'title': 'Membership ' + str(index)},
                 'role_id': group, 'protected': False},
                {'name': 'membership_marker_' + suffix + '_' + str(index), 'kind': 'security.policy', 'groups': [group],
                 'policy': {'actions': 'smoke.membership.marker', 'resources': namespace + ':marker', 'effect': 'allow'}},
            ])
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
    email = 'membership-' + suffix + '@smoke.example'
    created = inst.request('POST', '/api/v1/users', {
        'email': email, 'password': inst.password, 'full_name': 'Whole Membership', 'groups': groups,
    }, expect=(201,), label='whole-membership-create')
    uid = created['user']['user_id']
    logged_in = inst.request('POST', '/api/public/user/token', {
        'email': email, 'password': inst.password,
    }, auth='', label='whole-membership-login')
    token = logged_in['token']
    inst.redactor.add(token)
    require(set(logged_in['actor']['metadata']['security_groups']) == set(groups),
            'Login trims the account membership')
    stored = inst.request('GET', '/api/v1/users/' + uid + '/groups', label='whole-membership-store')
    require(set(stored['groups']) == set(groups), 'Groups endpoint trims the account membership')
    me = inst.request('GET', '/api/v1/user/me', auth=token, label='whole-membership-self')
    require(set(me['security']['groups']) == set(groups), 'Self-service trims the account membership')
    require(me['security']['is_admin'] is False, 'Membership changes grant administrator authority')
    inst.request('GET', '/api/v1/users', auth=token, expect=(403,), label='whole-membership-admin-denied')
    inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:user']},
                 label='whole-membership-revoke')
    inst.request('GET', '/api/v1/user/me', auth=token, expect=(401,), label='whole-membership-stale-token')
    refreshed = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='whole-membership-refresh')
    inst.redactor.add(refreshed['token'])
    require(refreshed['actor']['metadata']['security_groups'] == ['app.security:user'],
            'Renewed login retains revoked memberships')
    inst.evidence.save('whole-membership', {'user_id': uid, 'membership_count': len(groups),
                                          'refreshed_membership_count': 1})
    inst.request('DELETE', '/api/v1/users/' + uid, expect=(202,), label='whole-membership-delete')


REGISTRY = [Scenario('users_whole_membership', 'full', users_whole_membership, ('boot',),
    instance_setup=True, issues=('SEC-USERS-MANAGEMENT-POLICY', 'SECURITY-SCOPE-PROJECTION-LIVENESS'), features=tuple('kickside/users|http|' + route for route in (
        'POST /api/v1/users', 'POST /api/public/user/token', 'GET /api/v1/user/me',
        'GET /api/v1/users/{id}/groups', 'PUT /api/v1/users/{id}/groups')))]
