"""Directory search and continuation through the authenticated transport."""
import uuid
from urllib.parse import quote

from harness import Scenario, require


def users_directory_continuation(ctx):
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    label = 'Directory-' + suffix
    slug = 'directory-' + suffix
    inst.request('POST', '/api/v1/security/scopes', {
        'slug': slug, 'label': label, 'policies': [], 'enabled': True,
    }, label='directory-scope-create')
    user_ids = []
    for index in range(67):
        name = label + ('%_\\' if index == 65 else '')
        created = inst.request('POST', '/api/v1/users', {
            'email': 'directory-' + suffix + '-' + str(index) + '@smoke.example',
            'password': inst.password, 'full_name': name, 'groups': ['app.security:members'],
        }, expect=(201,), label='directory-user-create-' + str(index))
        user_ids.append(created['user']['user_id'])
    inst.request('PUT', '/api/v1/users/' + user_ids[-1], {'status': 'inactive'}, label='directory-user-inactivate')
    base = '/api/v1/principals/search?q=' + quote(label) + '&limit=7'
    cursor, seen_users, groups, cursors = None, [], [], set()
    for index in range(30):
        page = inst.request('GET', base + ('&cursor=' + quote(cursor) if cursor else ''),
                            label='directory-page-' + str(index))
        require(isinstance(page['has_more'], bool), 'Directory omits its continuation verdict')
        require(len(page['principals']) <= 7, 'Directory exceeds its requested page size')
        for principal in page['principals']:
            if principal['type'] == 'user':
                require(not groups, 'Directory returns users after the group plane')
                require(principal['id'] not in seen_users, 'Directory continuation repeats a user')
                seen_users.append(principal['id'])
            else:
                groups.append(principal)
        if not page['has_more']:
            require(not page.get('cursor'), 'An exhausted directory issues a continuation')
            break
        cursor = page['cursor']
        require(cursor and cursor not in cursors, 'Directory continuation makes no progress')
        cursors.add(cursor)
    require(set(seen_users) == set(user_ids[:-1]), 'Directory omits active users or includes an inactive user')
    require(len(groups) == 1 and groups[0]['label'] == label, 'Directory continuation omits the matching group')
    exact = inst.request('GET', '/api/v1/principals/search?kinds=user&q=' + quote((label + '%_\\').upper()),
                         label='directory-literal-search')
    require([p['id'] for p in exact['principals']] == [user_ids[65]], 'Directory treats literal characters as a pattern')
    oldest = inst.request('GET', '/api/v1/principals/search?kinds=user&q=' + quote(user_ids[0]),
                          label='directory-oldest-search')
    require([p['id'] for p in oldest['principals']] == [user_ids[0]], 'Directory searches only the first roster page')
    inst.request('GET', base + '&cursor=invalid%25%25%25', expect=(400,), label='directory-invalid-cursor')
    inst.request('GET', '/api/v1/principals/search?q=different&cursor=' + quote(cursor),
                 expect=(400,), label='directory-mismatched-cursor')
    inst.evidence.save('directory-continuation', {'active_users': len(seen_users), 'groups': groups,
                                                'continuations': len(cursors)})
    for uid in user_ids:
        inst.request('DELETE', '/api/v1/users/' + uid, expect=(202,), label='directory-user-delete')
    inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug, label='directory-scope-delete')


REGISTRY = [Scenario('users_directory_continuation', 'full', users_directory_continuation, ('boot',),
    instance_setup=True, features=('kickside/users|http|GET /api/v1/principals/search',))]
