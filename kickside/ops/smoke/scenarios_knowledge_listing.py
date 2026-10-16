"""Knowledge catalog search, selected chips, and continuation under member access."""
import uuid
from urllib.parse import quote

from harness import Scenario, require


def knowledge_complete_listing(ctx):
    inst = ctx.inst
    inst.install('kickside/knowledge')
    inst.install('kickside/kb10')
    suffix = uuid.uuid4().hex[:12]
    label = 'KB-list-' + suffix
    model = 'smoke/listing-embed-' + suffix
    inst.request('PUT', '/api/v1/models/cards', {
        'name': model, 'title': 'Listing embedding metadata', 'provider_id': 'wippy.llm.openai_compat:provider',
        'provider_model': 'qwen3-embed', 'capabilities': ['embed'], 'class': [], 'dimensions': 512,
        'max_tokens': 8192, 'output_tokens': 0,
    }, label='knowledge-list-model')
    members = []
    for role in ('owner', 'stranger'):
        email = 'kb-list-' + suffix + '-' + role + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {
            'email': email, 'password': inst.password, 'full_name': role, 'groups': ['app.security:members'],
        }, expect=(201,), label='knowledge-list-member-' + role)['user']
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='knowledge-list-login-' + role)['token']
        inst.redactor.add(token)
        members.append((user['user_id'], token))
    owner, stranger = members[0][1], members[1][1]
    identifiers = []
    for index in range(205):
        created = inst.request('POST', '/api/v1/knowledge/create', {
            'name': label + ' ' + str(index), 'kb_type': 'document', 'embedding_model': model,
        }, auth=owner, label='knowledge-list-create-' + str(index))
        identifiers.append(created['id'])
    foreign = inst.request('POST', '/api/v1/knowledge/create', {
        'name': label + ' foreign', 'kb_type': 'document', 'embedding_model': model,
    }, auth=stranger, label='knowledge-list-foreign-create')['id']
    selected = inst.request('GET', '/api/v1/knowledge/list?ids=' + quote(identifiers[0] + ',' + foreign),
                            auth=owner, label='knowledge-list-selected')
    require([row['id'] for row in selected['items']] == [identifiers[0]],
            'Knowledge selected chips miss an older KB or disclose an unreadable KB')
    base = '/api/v1/knowledge/list?q=' + quote(label) + '&limit=7'
    cursor, seen, cursors = None, [], set()
    for index in range(40):
        page = inst.request('GET', base + ('&cursor=' + quote(cursor) if cursor else ''),
                            auth=owner, label='knowledge-list-page-' + str(index))
        require(isinstance(page['has_more'], bool), 'Knowledge listing omits its continuation verdict')
        require(page['count'] == len(page['items']) <= 7, 'Knowledge listing exceeds the requested page')
        for row in page['items']:
            require(row['id'] not in seen, 'Knowledge continuation repeats a KB')
            seen.append(row['id'])
        if not page['has_more']:
            require(not page.get('cursor'), 'An exhausted knowledge listing issues continuation')
            break
        cursor = page['cursor']
        require(cursor and cursor not in cursors, 'Knowledge continuation makes no progress')
        cursors.add(cursor)
    require(set(seen) == set(identifiers), 'Knowledge search stops at the first page or leaks another member’s KB')
    complete = inst.request('GET', '/api/v1/knowledge/list', auth=owner, label='knowledge-list-complete')
    require({row['id'] for row in complete['items']} == set(identifiers) and not complete['has_more'],
            'Knowledge default listing is incomplete')
    inst.request('GET', base + '&cursor=invalid%25%25%25', auth=owner, expect=(400,),
                 label='knowledge-list-invalid-cursor')
    inst.request('GET', '/api/v1/knowledge/list?q=different&cursor=' + quote(cursor), auth=owner,
                 expect=(400,), label='knowledge-list-mismatched-cursor')
    inst.evidence.save('knowledge-listing', {'owned_kbs': len(seen), 'foreign_hidden': True,
                                          'selected_older_kb': identifiers[0]})
    for identifier in identifiers:
        inst.request('DELETE', '/api/v1/knowledge/' + identifier, auth=owner, label='knowledge-list-delete')
    inst.request('DELETE', '/api/v1/knowledge/' + foreign, auth=stranger, label='knowledge-list-foreign-delete')
    for identifier, _ in members:
        inst.request('DELETE', '/api/v1/users/' + identifier, expect=(202,), label='knowledge-list-member-delete')
    inst.request('DELETE', '/api/v1/models/cards?name=' + quote(model), label='knowledge-list-model-delete')


REGISTRY = [Scenario('knowledge_complete_listing', 'full', knowledge_complete_listing, ('boot',),
    instance_setup=True, issues=('SMOKE-ONBOARDING-EXPLICIT-MODEL-LIMITS',), features=tuple('kickside/knowledge|http|' + route for route in (
        'POST /api/v1/knowledge/create', 'GET /api/v1/knowledge/list', 'DELETE /api/v1/knowledge/{id}')))]
