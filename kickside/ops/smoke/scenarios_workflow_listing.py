"""Workflow listing across the component page boundary under member access."""
import uuid

from harness import Scenario, require


def workflows_complete_listing(ctx):
    inst = ctx.inst
    inst.install('kickside/workflows')
    suffix = uuid.uuid4().hex[:12]
    members = []
    for role in ('owner', 'stranger'):
        email = 'workflow-list-' + suffix + '-' + role + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {
            'email': email, 'password': inst.password, 'full_name': role, 'groups': ['app.security:members'],
        }, expect=(201,), label='workflow-list-member-' + role)['user']
        login = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='workflow-list-login-' + role)
        inst.redactor.add(login['token'])
        members.append((user['user_id'], login['token']))
    owner, stranger = members[0][1], members[1][1]
    created = []
    for index in range(205):
        result = inst.request('POST', '/api/v1/workflows', {
            'title': 'Workflow list ' + suffix + ' ' + str(index),
            'idempotency_key': 'workflow-list-' + suffix + '-' + str(index),
        }, auth=owner, label='workflow-list-create-' + str(index))
        created.append(result['flow_id'])
    foreign = inst.request('POST', '/api/v1/workflows', {'title': 'Foreign workflow ' + suffix},
                           auth=stranger, label='workflow-list-foreign-create')['flow_id']
    rows, offset = [], 0
    while True:
        listed = inst.request('GET', '/api/v1/workflows?limit=100&offset=' + str(offset) + '&fields=node_count,run_count',
                              auth=owner, label='workflow-list-page-' + str(offset))
        require(listed['count'] == len(listed['workflows']), 'Workflow page count differs from its rows')
        rows.extend(listed['workflows'])
        following = listed.get('next_offset')
        if following is None:
            break
        require(following > offset, 'Workflow listing continuation does not advance')
        offset = following
    require(len(rows) == 205, 'Workflow listing stops before all component pages')
    require({row['id'] for row in rows} == set(created), 'Workflow listing omits or repeats an owned workflow')
    require(foreign not in {row['id'] for row in rows}, 'Workflow listing leaks another member’s workflow')
    order = [(row['created_at'], row['id']) for row in rows]
    require(order == sorted(order, reverse=True), 'Workflow listing has no total creation-time order')
    require(all(row['node_count'] == 0 and row['run_count'] == 0 and row['status'] == 'draft' for row in rows),
            'Complete listing loses empty workflow summaries')
    published = inst.request('GET', '/api/v1/workflows?published=true', auth=owner,
                             label='workflow-list-published-filter')
    require(published['workflows'] == [] and published['count'] == 0, 'Published picker includes drafts')
    inst.evidence.save('workflow-listing', {'owned_workflows': len(rows), 'foreign_hidden': True,
                                          'first_created_included': created[0] in {row['id'] for row in rows}})
    for identifier in created:
        inst.request('DELETE', '/api/v1/workflows/' + identifier, auth=owner, label='workflow-list-delete')
    inst.request('DELETE', '/api/v1/workflows/' + foreign, auth=stranger, label='workflow-list-foreign-delete')
    for identifier, _ in members:
        inst.request('DELETE', '/api/v1/users/' + identifier, expect=(202,), label='workflow-list-member-delete')


REGISTRY = [Scenario('workflows_complete_listing', 'full', workflows_complete_listing, ('boot',),
    instance_setup=True, issues=('WORKFLOWS-PUBLISHED-LIST-DEFAULT', 'SMOKE-WORKFLOW-LIST-ORDER'), features=tuple('kickside/workflows|http|' + route for route in (
        'POST /api/v1/workflows', 'GET /api/v1/workflows', 'DELETE /api/v1/workflows/{id}')))]
