"""Native error metadata at the Users administrative HTTP boundary."""
import uuid

from harness import Scenario, require
from module_harness import run_focused_module_test


def native_errors_users(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'users_account_creation_and_authentication_test')
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    email = 'native-errors-' + suffix + '@smoke.example'
    created = inst.request('POST', '/api/v1/users', {
        'email': email,
        'password': inst.password,
        'full_name': 'Native Error Guard',
        'groups': ['app.security:user'],
    }, expect=(201,), label='native-errors-users-create')
    duplicate = inst.request('POST', '/api/v1/users', {
        'email': email,
        'password': inst.password,
        'full_name': 'Native Error Guard Duplicate',
        'groups': ['app.security:user'],
    }, expect=(400,), label='native-errors-users-duplicate')
    require(duplicate.get('success') is False, 'Duplicate user creation reports success')
    require(duplicate.get('error') == 'User already exists', 'Duplicate user error message changes')
    require(duplicate.get('kind') == 'AlreadyExists', 'Duplicate user error loses AlreadyExists kind')
    require(duplicate.get('code') == 'USER_ALREADY_EXISTS', 'Duplicate user error loses machine code')
    require(duplicate.get('retryable') is False, 'Duplicate user creation remains retryable')
    require((duplicate.get('details') or {}).get('code') == 'USER_ALREADY_EXISTS',
            'Duplicate user error details lose machine code')

    missing = inst.request('PUT', '/api/v1/users/native-errors-missing-' + suffix, {
        'full_name': 'Missing Native Error Guard',
    }, expect=(404,), label='native-errors-users-not-found')
    require(missing.get('success') is False, 'Missing user update reports success')
    require(missing.get('error') == 'User not found', 'Missing user error message changes')
    require(missing.get('kind') == 'NotFound', 'Missing user update loses NotFound kind')
    require(missing.get('code') == 'USER_NOT_FOUND', 'Missing user update loses machine code')
    require(missing.get('retryable') is False, 'Missing user update remains retryable')
    require((missing.get('details') or {}).get('code') == 'USER_NOT_FOUND',
            'Missing user error details lose machine code')
    user_id = created['user']['user_id']
    for method, route, payload in (
        ('POST', '/api/v1/users', {'email': email, 'password': inst.password, 'groups': 'not-an-array'}),
        ('PUT', '/api/v1/users/' + user_id, {'groups': 'not-an-array'}),
        ('PUT', '/api/v1/users/' + user_id + '/groups', {'groups': 'not-an-array'}),
    ):
        rejected = inst.request(method, route, payload, expect=(400,), label='native-errors-users-groups')
        require(rejected.get('success') is False, 'Malformed groups report success')
        require(rejected.get('kind') == 'Invalid', 'Group validation loses Invalid kind')
        require(rejected.get('code') == 'GROUPS_INVALID', 'Group validation loses machine code')
        require(rejected.get('retryable') is False, 'Group validation remains retryable')
        require((rejected.get('details') or {}).get('code') == 'GROUPS_INVALID',
                'Group validation loses native details')
    inst.evidence.save('native-errors-users', {'duplicate': duplicate, 'missing': missing})
    inst.request('DELETE', '/api/v1/users/' + user_id, expect=(202,),
                 label='native-errors-users-delete')


REGISTRY = [Scenario('native_errors_users', 'regression', native_errors_users, ('boot',),
                     instance_setup=True, issues=('NE-03',), features=tuple('kickside/users|http|' + route for route in (
                         'POST /api/v1/users', 'PUT /api/v1/users/{id}')))]
