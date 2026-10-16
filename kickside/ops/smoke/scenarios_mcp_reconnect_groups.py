"""MCP reconnect follows module membership and retains component ownership gates."""
import uuid

from harness import Scenario, require


def mcp_reconnect_groups(ctx):
    inst = ctx.inst
    inst.boot()
    inst.install('kickside/mcp-client')
    policy = 'kickside.mcp_client.security:module_access'
    catalog = inst.request('GET', '/api/v1/security/policies', label='reconnect-public-policies')['policies']
    require(any(row['id'] == policy and row.get('intent') == 'module_access' for row in catalog),
            'MCP Client has no public selectable module policy')
    slug = 'reconnect-' + uuid.uuid4().hex[:10]
    group = 'kickside.security.scopes:' + slug
    inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'MCP connection access',
        'policies': [policy]}, label='reconnect-module-group')
    email = slug + '@smoke.example'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'MCP connection member'}, expect=(201,), label='reconnect-member')['user']
    inst.wait(lambda: any(row['id'] == group for row in inst.request('GET', '/api/v1/users/assignable-scopes')['scopes']),
              'Reconnect group is assignable', seconds=60)
    path = '/api/v1/mcp-client/connections/' + str(uuid.uuid4())
    results = []
    for groups, expected in ((['app.security:user', group], 400), (['app.security:user'], 403),
                             (['app.security:user', 'app.security:members'], 400)):
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': groups},
                     label='reconnect-group-membership')
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='reconnect-member-login')['token']
        inst.redactor.add(token)
        response = inst.request('PUT', path, {}, auth=token, expect=(expected,), label='reconnect-group-admission')
        if expected == 400:
            require(response.get('error') == 'MCP configuration is missing', 'Reconnect request does not reach its handler')
            refused = inst.request('PUT', path, {'private_context': {'endpoint_url': 'https://mcp.example/rpc'}},
                                   auth=token, expect=(403,), label='reconnect-ownership-refusal')
            require('connection unavailable' in refused.get('error', ''), 'Reconnect bypasses component ownership')
        results.append({'groups': groups, 'status': expected})
    inst.evidence.save('mcp-reconnect-group-admission', results)


REGISTRY = [Scenario('regression_mcp_reconnect_group_admission', 'regression', mcp_reconnect_groups,
                     issues=('PUBLISHED-SESSION-SECURITY-IDENTITY',))]


def published_contract_group_isolation(ctx):
    import json
    from pathlib import Path
    from runtime_fixtures import isolated_fixture
    from scenarios_security_model import apply_dependency_bindings
    bindings = json.loads((Path(__file__).parent / 'mocks/security_model/published_bindings.json').read_text())
    contract = [binding for binding in bindings if binding['component'] == 'kickside/contract']
    require(len(contract) == 1, 'Published app fixture has no unique Contract binding')
    def prepare(fixture):
        apply_dependency_bindings(fixture.inst.app, contract)
        fixture.inst.resolve_dependencies(modules=('kickside/contract',))
    with isolated_fixture(ctx, config=dict(ctx.inst.config, replace=dict(ctx.inst.config['replace'])), prepare=prepare) as fixture:
        inst = fixture.inst
        inst.install('kickside/mcp-client')
        email = 'published-binding-' + uuid.uuid4().hex[:10] + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
            'full_name': 'Published binding member'}, expect=(201,), label='published-binding-member')['user']
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups', {'groups': ['app.security:user']},
                     label='published-binding-core-only')
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='published-binding-login')['token']
        inst.redactor.add(token)
        inst.evidence.save('published-contract-binding', contract)
        inst.request('PUT', '/api/v1/mcp-client/connections/' + str(uuid.uuid4()), {}, auth=token,
                     expect=(403,), label='published-binding-excludes-module')


REGISTRY.append(Scenario('regression_published_contract_group_isolation', 'regression', published_contract_group_isolation,
                         issues=('SECURITY-PUBLISHED-BINDING-MODULE-ISOLATION',)))
