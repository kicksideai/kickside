"""Northwind core, account, administration, and continuity smoke scenarios."""
import hashlib
import json
import re
from urllib.parse import quote
import urllib.error
import urllib.request
import uuid

from harness import Scenario, require
from projection_proc_error import verify_projection_proc_error
from scenarios import Context, chat_streams, first_agent, nav, platform_onboarding, restart_continuation


def http(component, *routes):
    return tuple('kickside/' + component + '|http|' + route for route in routes)


def navigation(component, *entries):
    return tuple('kickside/' + component + '|navigation|' + entry for entry in entries)


def system(ctx, tab):
    ctx.browser.page.keyboard.press('Escape')
    ctx.browser.settle()
    nav(ctx, 'System')
    ctx.browser.settle()
    ctx.browser.frame.get_by_role('tab', name=tab, exact=True).click()


def account(ctx, label):
    ctx.browser.frame.locator('.sidebar [aria-haspopup="menu"]').click()
    ctx.browser.settle()
    ctx.browser.frame.get_by_role('menuitem', name=label, exact=True).click()


def binary_request(inst, method, path, body=None, auth=None):
    headers = {'Authorization': 'Bearer ' + (inst.token if auth is None else auth)}
    if body is not None:
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(inst.base + path, method=method, headers=headers,
                                     data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            status, payload, content_type = response.status, response.read(), response.headers.get('Content-Type', '')
    except urllib.error.HTTPError as error:
        status, payload, content_type = error.code, error.read(), error.headers.get('Content-Type', '')
    inst.evidence.save('binary-' + path.rsplit('/', 1)[-1],
                       {'path': path, 'status': status, 'type': content_type, 'bytes': len(payload),
                        'sha256': hashlib.sha256(payload).hexdigest()})
    require(status == 200, inst.redactor.text(f'{method} {path}: HTTP {status}: {payload[:1000]!r}'))
    return payload, content_type


def install_with_parameters(inst, component, parameters):
    plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                        {'component': component, 'parameters': parameters, 'run_migrations': True},
                        label=component.replace('/', '-') + '-bound-plan', timeout=120)
    unresolved = [r for r in plan.get('requirements', []) if r.get('missing') or r.get('invalid')]
    require(not unresolved, 'Bound Hub plan has unresolved requirements: ' + json.dumps(unresolved))
    payload = dict(plan['install_payload'])
    payload.pop('version', None)
    payload['run_migrations'] = True
    result = inst.request('POST', '/api/v1/keeper/hub/dependencies/install', payload,
                          label=component.replace('/', '-') + '-bound-install', timeout=300)
    require(not any(r.get('status') in ('failed', 'rollback_failed') for r in result.get('execution', [])),
            'Bound Hub installation fails: ' + str(result))


def core_ready(ctx: Context):
    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2, color_scheme='light')
    browser.page.goto(ctx.inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
    browser.page.get_by_role('button', name='Sign In', exact=True).wait_for(timeout=30000)
    require(browser.page.get_by_label('Email').is_visible(), 'Login email input is absent')
    ctx.browser.screenshot('northwind-login', full_page=False, mask_color='#e5e7eb')
    health = ctx.inst.request('GET', '/api/public/health', auth='', label='health')
    require(health.get('status') == 'healthy', 'Published runtime does not report healthy')
    robots, _ = binary_request(ctx.inst, 'GET', '/robots.txt', auth='')
    require(b'User-agent:' in robots, 'Robots document lacks crawler rules')
    llms, _ = binary_request(ctx.inst, 'GET', '/llms.txt', auth='')
    require(b'KickSide' in llms, 'LLM document lacks KickSide identity')
    public_env, _ = binary_request(ctx.inst, 'GET', '/api/public/env/public.js', auth='')
    require(b'const __WIPPY_ENV__ = JSON.parse(' in public_env and b'export default __WIPPY_ENV__' in public_env,
            'Public environment lacks its declared ES module exports')
    encoded = public_env.decode().split('JSON.parse(', 1)[1].split(');', 1)[0]
    variables = json.loads(json.loads(encoded))
    require(variables == {'PUBLIC_API_URL': ctx.inst.base}, 'Public environment exposes unexpected fields or API location')
    require(ctx.inst.password.encode() not in public_env, 'Public environment exposes administrator password')


def core_platform(ctx):
    platform_onboarding(ctx)
    ctx.browser.screenshot('northwind-first-agent-welcome', full_page=False, mask_color='#e5e7eb')


def core_personal_agent(ctx):
    from playwright.sync_api import expect
    browser, inst = ctx.browser, ctx.inst
    personal = browser.frame.locator('kickside-agent-onboarding')
    inst.evidence.save('onboarding-actions', personal.get_by_role('button').all_text_contents())
    personal.get_by_role('button', name=re.compile('Skip|Not now|Later', re.I)).click()
    expect(personal).to_have_count(0, timeout=30000)
    expect(browser.frame.locator('.sp-screen')).to_have_count(0, timeout=30000)
    dismissed = inst.request('GET', '/api/v1/nav/list?manage=1', label='personal-dismissed')
    require((dismissed.get('splash') or {}).get('id') != 'first_agent', 'Dismissed personal onboarding remains active')
    ctx.browser.screenshot('northwind-onboarding-dismissed', full_page=False, mask_color='#e5e7eb')
    reopened = inst.request('DELETE', '/api/v1/ui/splash/first_agent/seen', label='personal-reopen')
    require(reopened.get('success') is True, 'Personal onboarding reset does not acknowledge success')
    browser.reload()
    personal.get_by_label('Agent name', exact=True).wait_for(timeout=30000)
    first_agent(ctx)
    ctx.state['session'] = ctx.browser.current_session()
    ctx.browser.screenshot('northwind-personal-agent', full_page=False, mask_color='#e5e7eb')


def core_gemma_chat(ctx):
    chat_streams(ctx)
    ctx.browser.screenshot('northwind-gemma-conversation', full_page=False, mask_color='#e5e7eb')


def core_users(ctx):
    from playwright.sync_api import expect
    inst, browser = ctx.inst, ctx.browser
    system(ctx, 'Users')
    users = browser.frame.locator('kickside-users')
    users.get_by_role('button', name='Create user', exact=True).first.click()
    dialog = users.get_by_role('dialog')
    email = 'northwind.member.' + uuid.uuid4().hex[:8] + '@example.com'
    dialog.get_by_placeholder('user@example.com').fill(email)
    dialog.get_by_placeholder('Jane Doe').fill('Northwind Operations Member')
    dialog.get_by_placeholder('Minimum 8 characters').fill(inst.password)
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/users')) as response:
        dialog.get_by_role('button', name='Create', exact=True).click()
    result = response.value.json()
    require(response.value.status == 201 and result.get('user', {}).get('user_id'), 'UI user creation lacks durable user: ' + str(result))
    uid = result['user']['user_id']
    ctx.state.update(core_member=uid, core_member_email=email)
    expect(users).to_contain_text('Northwind Operations Member', timeout=30000)
    updated = inst.request('PUT', '/api/v1/users/' + uid, {'full_name': 'Northwind Warehouse Lead'}, label='user-update')
    require(updated.get('success') is True, 'User update fails')
    inst.request('PUT', '/api/v1/users/' + uid + '/groups', {'groups': ['app.security:members']}, label='member-groups-set')
    groups = inst.request('GET', '/api/v1/users/' + uid + '/groups', label='member-groups-read')
    require('app.security:user' in json.dumps(groups) and 'app.security:admin' not in json.dumps(groups), 'Member groups differ')
    scopes = inst.request('GET', '/api/v1/users/assignable-scopes', label='assignable-scopes')['scopes']
    require(any(s['id'] == 'app.security:user' for s in scopes), 'Assignable scopes omit member role')
    found = inst.request('GET', '/api/v1/principals/search?q=Northwind', label='principal-search')['principals']
    require(uid in json.dumps(found), 'Principal search omits created user')
    resolved = inst.request('POST', '/api/v1/principals/resolve', {'refs': [{'type': 'user', 'id': uid}]}, label='principal-resolve')
    require('Northwind Warehouse Lead' in json.dumps(resolved), 'Principal resolution loses updated name')
    browser.reload()
    system(ctx, 'Users')
    expect(browser.frame.locator('kickside-users')).to_contain_text('Northwind Warehouse Lead', timeout=30000)
    listed = inst.request('GET', '/api/v1/users', label='users-list')['users']
    require(any(u['user_id'] == uid and u['full_name'] == 'Northwind Warehouse Lead' for u in listed), 'Updated user is absent')
    ctx.browser.screenshot('northwind-users-and-roles', full_page=False, mask_color='#e5e7eb')


def member_token(ctx):
    result = ctx.inst.request('POST', '/api/public/user/token',
                              {'email': ctx.state['core_member_email'], 'password': ctx.inst.password})
    token = result['token']
    ctx.inst.redactor.add(token)
    return token


def core_profile(ctx):
    inst = ctx.inst
    inst.request('PUT', '/api/v1/user/me', {'full_name': 'Northwind Administrator'}, label='self-update')
    me = inst.request('GET', '/api/v1/user/me', label='self-read')
    require(me['user']['full_name'] == 'Northwind Administrator' and me['security']['is_admin'], 'Self edit loses profile or admin scope')
    inst.request('PUT', '/api/v1/profile', {'namespace': 'kickside.profile', 'key': 'bio',
                                         'value': 'Northwind operations, warehouse, and customer service.'}, label='profile-write')
    profile = inst.request('GET', '/api/v1/profile?namespace=kickside.profile&key=bio', label='profile-read')
    require('Northwind operations, warehouse, and customer service.' in json.dumps(profile), 'Profile value does not persist')
    ctx.browser.login()
    ctx.browser.frame.locator('.sidebar').wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-administrator-profile', full_page=False, mask_color='#e5e7eb')


def delete_user(inst, uid, email, password):
    queued = inst.request('DELETE', '/api/v1/users/' + uid, expect=(202,), label='retired-delete')
    require(queued['result']['deletion_queued'] is True, 'User deletion does not queue lifecycle cleanup')
    inst.wait(lambda: uid not in json.dumps(inst.request('GET', '/api/v1/users', label='retired-absent')),
              'Deleted user leaves listing')
    rejected = inst.request('POST', '/api/public/user/token', {'email': email, 'password': password}, expect=(401,), label='retired-login-rejected')
    require(rejected.get('error') and not rejected.get('token'), 'Deleted user authenticates')


def core_user_delete(ctx):
    inst = ctx.inst
    email = 'northwind.retired.' + uuid.uuid4().hex[:8] + '@example.com'
    uid = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                       'full_name': 'Northwind Retired Account', 'groups': ['app.security:members']}, expect=(201,), label='retired-create')['user']['user_id']
    delete_user(inst, uid, email, inst.password)


def core_security(ctx):
    inst = ctx.inst
    policies = inst.request('GET', '/api/v1/security/policies', label='policies')
    require(policies.get('policies'), 'Policy catalog is empty')
    slug = 'northwind-warehouse-review'
    saved = inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Northwind Warehouse Review',
                         'description': 'Fictional inventory reviewers', 'policies': [], 'enabled': True}, label='scope-create')
    require(saved['scope']['slug'] == slug, 'Scope creation changes slug')
    scopes = inst.request('GET', '/api/v1/security/scopes', label='scopes')
    require('Northwind Warehouse Review' in json.dumps(scopes), 'Created scope is absent')
    system(ctx, 'Security')
    ctx.browser.frame.get_by_text('Northwind Warehouse Review', exact=True).wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-security-scopes', full_page=False, mask_color='#e5e7eb')
    inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug, label='scope-delete')
    require(slug not in json.dumps(inst.request('GET', '/api/v1/security/scopes', label='scope-absent')), 'Deleted scope remains')


def core_settings(ctx):
    inst = ctx.inst
    settings = inst.request('GET', '/api/v1/settings', label='settings')
    require(settings.get('settings'), 'Settings listing is empty')
    blocks = inst.request('GET', '/api/v1/settings/blocks', label='settings-blocks')
    require(blocks.get('blocks'), 'Settings blocks are empty')
    inst.request('PUT', '/api/v1/settings', {'namespace': 'kickside.users', 'key': 'token_expiration', 'value': '48h'}, label='settings-token-duration')
    stored = inst.request('GET', '/api/v1/settings?namespace=kickside.users', label='settings-token-duration-read')
    require(any(s['key'] == 'token_expiration' and s['value'] == '48h' for s in stored['settings']), 'Settings duration does not persist')
    system(ctx, 'Settings')
    ctx.browser.frame.locator('kickside-settings').wait_for(timeout=30000)
    ctx.browser.frame.locator('kickside-settings').get_by_text('Authentication', exact=True).wait_for(timeout=30000)
    view = ctx.browser.frame.locator('kickside-settings')
    view.get_by_role('button', name='All settings', exact=True).click()
    table = view.get_by_role('table')
    table.get_by_role('columnheader', name='Owner', exact=True).wait_for(timeout=30000)
    table.get_by_role('columnheader', name='Setting', exact=True).wait_for(timeout=30000)
    table.get_by_role('columnheader', name='Value', exact=True).wait_for(timeout=30000)
    search = view.get_by_placeholder('Search settings', exact=True)
    search.fill('token_expiration')
    table.get_by_role('row').filter(has_text='token_expiration').wait_for(timeout=30000)
    search.fill('')
    ctx.browser.screenshot('northwind-settings', full_page=False, mask_color='#e5e7eb')


def upload_appearance_logo(ctx, path):
    from playwright.sync_api import expect
    browser = ctx.browser
    appearance = browser.frame.locator('kickside-appearance')
    with browser.page.expect_response(lambda r: r.url.endswith('/api/v1/nav/logo') and r.request.method == 'POST') as response:
        appearance.locator('input[type=file]').set_input_files(str(path))
    result = response.value.json()
    require(response.value.status == 200 and result.get('url'), 'Logo upload lacks instance storage URL: ' + str(result))
    expect(appearance.get_by_alt_text('Logo preview')).to_be_visible(timeout=30000)
    ctx.inst.evidence.save('appearance-logo-fields', appearance.locator('input').evaluate_all(
        'nodes => nodes.map(node => ({type: node.type, placeholder: node.placeholder, label: node.getAttribute("aria-label")}))'))
    browser.screenshot('appearance-logo-upload', full_page=False)
    return result['url']


def core_appearance(ctx):
    from playwright.sync_api import expect
    from PIL import Image, ImageDraw
    inst, browser = ctx.inst, ctx.browser
    system(ctx, 'Appearance')
    appearance = browser.frame.locator('kickside-appearance')
    image = Image.new('RGB', (320, 96), '#17494d')
    draw = ImageDraw.Draw(image)
    draw.polygon([(20, 70), (44, 24), (68, 70)], fill='#ffffff')
    draw.text((88, 42), 'NORTHWIND', fill='#ffffff')
    path = inst.root / 'temp' / 'northwind-logo.png'
    image.save(path)
    url = upload_appearance_logo(ctx, path)
    ctx.state['core_logo'] = url
    appearance.get_by_placeholder(re.compile(r'^kickside$', re.I)).fill('Northwind Operations')
    appearance.get_by_role('button', name='Save', exact=True).click()
    inst.wait(lambda: inst.request('GET', '/api/public/branding', auth='').get('logo_url') == url,
              'Branding logo persists', pump=browser.page.wait_for_timeout)
    downloaded, mime = binary_request(inst, 'GET', url, auth='')
    require(downloaded == path.read_bytes() and 'image/png' in mime, 'Instance logo storage changes bytes or MIME')
    appearance.get_by_role('button', name='Dark', exact=True).click()
    expect(appearance.get_by_role('button', name='Dark', exact=True)).to_have_attribute('aria-pressed', 'true')
    ctx.browser.screenshot('northwind-appearance-dark', full_page=False, mask_color='#e5e7eb')
    appearance.get_by_role('button', name='Light', exact=True).click()
    expect(appearance.get_by_role('button', name='Light', exact=True)).to_have_attribute('aria-pressed', 'true')
    ctx.browser.screenshot('northwind-appearance-light', full_page=False, mask_color='#e5e7eb')
    inst.request('PUT', '/api/v1/nav/config', {'layout': 'horizontal'}, label='horizontal-navigation')
    inst.wait(lambda: inst.request('GET', '/api/v1/nav/list?manage=1')['config']['layout'] == 'horizontal', 'Horizontal layout persists', pump=browser.page.wait_for_timeout)
    browser.frame.locator('header[aria-label="App navigation"]').wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-horizontal-navigation', full_page=False, mask_color='#e5e7eb')
    inst.request('PUT', '/api/v1/nav/config', {'layout': 'vertical'}, label='vertical-navigation')
    browser.frame.locator('.sidebar').wait_for(timeout=30000)


def core_shell_catalogs(ctx):
    inst = ctx.inst
    for path, key in [('/api/v1/nav/list', 'items'), ('/api/v1/settings/tabs', 'tabs'),
                      ('/api/v1/account/items', 'items')]:
        result = inst.request('GET', path, label=key + '-catalog')
        require(result.get(key), path + ' is empty')
    contributions = inst.request('GET', '/api/v1/ui/contributions?types=ui.nav_item,ui.settings_tab,ui.account_item', label='ui-contributions')
    require(contributions.get('success') is True and len(contributions) > 1, 'UI contributions lack payload')


def core_sharing(ctx):
    inst = ctx.inst
    inst.install('chestor/workspace')
    token = member_token(ctx)
    folder = inst.request('POST', '/api/v1/workspace/entries', {'type': 'folder', 'name': 'Northwind Shared Warehouse'}, label='private-folder')['entry']['id']
    ctx.state['core_folder'] = folder
    base = '/api/v1/workspace/entries/' + folder
    denied = inst.request('GET', base, auth=token, expect=(403, 404), label='member-private-denied')
    require(denied.get('error') and folder not in json.dumps(inst.request('GET', '/api/v1/workspace/entries', auth=token)), 'Private folder leaks to member')
    capabilities = inst.request('GET', '/api/v1/components/access-model', label='access-vocabulary')['capabilities']
    require({c['key']: c['bit'] for c in capabilities} == {'read': 1, 'write': 2, 'delete': 4, 'admin': 8}, 'Access vocabulary changes')
    share = '/api/v1/component-access/share/' + folder
    subject = {'subject_id': ctx.state['core_member'], 'subject_type': 'user'}
    inst.request('POST', share, {**subject, 'access_mask': 1}, label='share-read')
    grants = inst.request('GET', '/api/v1/component-access/grants/' + folder, label='read-grants')
    require(ctx.state['core_member'] in json.dumps(grants), 'Read grant is absent')
    readable = inst.request('GET', base, auth=token, label='member-read')
    require(readable['entry']['name'] == 'Northwind Shared Warehouse', 'Shared member read loses title')
    denied = inst.request('PUT', base, {'name': 'Unauthorized warehouse edit'}, auth=token, expect=(403,), label='member-write-denied')
    require(denied.get('error'), 'Read-only member write lacks denial')
    inst.request('POST', share, {**subject, 'access_mask': 3}, label='share-write')
    inst.request('PUT', base, {'name': 'Northwind Warehouse Plan'}, auth=token, label='member-write')
    require(inst.request('GET', base)['entry']['name'] == 'Northwind Warehouse Plan', 'Shared edit does not persist')
    inst.request('POST', share, {**subject, 'action': 'revoke'}, label='share-revoke')
    denied = inst.request('GET', base, auth=token, expect=(403, 404), label='member-revoked')
    require(denied.get('error'), 'Revoked member remains authorized')


def core_member_boundaries(ctx):
    inst, browser = ctx.inst, ctx.browser
    token = member_token(ctx)
    me = inst.request('GET', '/api/v1/user/me', auth=token, label='member-profile')
    require(me['security']['is_admin'] is False, 'Member derives administrator privileges')
    for path in ['/api/v1/settings', '/api/v1/security/scopes', '/api/v1/users']:
        denied = inst.request('GET', path, auth=token, expect=(403,), label='member-denied-' + path.rsplit('/', 1)[-1])
        require(denied.get('error'), 'Member denial has no observable error for ' + path)
    browser.login(ctx.state['core_member_email'], inst.password)
    browser.frame.locator('kickside-agent-onboarding').get_by_label('Agent name', exact=True).wait_for(timeout=30000)
    member_nav = inst.request('GET', '/api/v1/nav/list?manage=1', auth=token, label='member-navigation')
    require('completed_splashes' not in json.dumps(member_nav), 'Member reads instance onboarding settings')
    ctx.browser.screenshot('northwind-member-first-agent', full_page=False, mask_color='#e5e7eb')
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)


def create_thread(ctx, title='Northwind Stock Ledger', **extra):
    created = ctx.inst.request('POST', '/api/v1/threads', {'title': title, **extra}, expect=(201,), label='thread-create')
    require(created['thread']['id'] == created['component_id'], 'Thread and component identities differ')
    return created['thread']['id']


def core_threads(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, attrs={'warehouse': 'Northwind East', 'crates': 47})
    ctx.state['core_thread'] = tid
    base = '/api/v1/threads/' + tid
    current = inst.request('GET', base, label='thread-read')['thread']
    require('Northwind East' in json.dumps(current), 'Thread attributes do not persist')
    inst.request('PATCH', base, {'attrs': {'warehouse': 'Northwind West', 'crates': 59}}, label='thread-update')
    require('Northwind West' in json.dumps(inst.request('GET', base)), 'Thread patch does not persist')
    classes = inst.request('GET', '/api/v1/thread-classes', label='thread-classes')
    require(classes.get('classes'), 'Thread class catalog is empty')
    require(tid in json.dumps(inst.request('GET', '/api/v1/threads', label='thread-list')), 'Created thread is absent from list')
    for path, key in [('/api/v1/jobs', 'jobs'), ('/api/v1/job-runs', 'runs')]:
        result = inst.request('GET', path, label=key)
        require(result['count'] == len(result[key]), 'Job listing count differs')


def core_thread_hierarchy(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Parent Ledger')
    base = '/api/v1/threads/' + tid
    child = create_thread(ctx, 'Northwind Reserve Ledger', parent_id=tid)
    require(child in json.dumps(inst.request('GET', base + '/children', label='thread-children')), 'Thread hierarchy loses child')
    graph = inst.request('GET', base + '/graph', label='thread-graph')
    require(graph['thread_id'] == tid and child in json.dumps(graph['edges']), 'Thread graph omits child edge')


def core_thread_messages(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Shipment Messages')
    base = '/api/v1/threads/' + tid
    sent = inst.request('POST', base + '/messages', {'text': 'Northwind shipment NW-731 contains 47 crates.', 'role': 'user'}, expect=(201,), label='thread-message')
    require('NW-731' in json.dumps(sent['event']), 'Message response loses shipment marker')
    events = inst.request('GET', base + '/events', label='thread-message-read')
    require('NW-731' in json.dumps(events), 'Message does not persist in event stream')


def core_thread_events(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Event Ledger')
    base = '/api/v1/threads/' + tid
    single = inst.request('POST', base + '/events', {'type': 'kickside.threads:message.created', 'role': 'user',
                          'body': {'text': 'Northwind event NW-EVENT-731'}}, expect=(201,), label='append-event')
    require(single['inserted'] == 1, 'Single event is not inserted')
    batch = {'events': [{'id': str(uuid.uuid4()), 'type': 'kickside.threads:message.created', 'role': 'user',
                        'body': {'text': 'Northwind batch NW-BATCH-' + str(index)}} for index in range(2)]}
    appended = inst.request('POST', base + '/events/batch', batch, label='append-batch')
    require(appended['inserted'] == 2, 'Batch inserts wrong count')
    duplicate = inst.request('POST', base + '/events/batch', batch, label='repeat-batch')
    require(duplicate['inserted'] == 0 and duplicate['duplicates'] == 2, 'Batch is not idempotent')
    stored = inst.request('GET', base + '/events', label='events-read')
    for marker in ['NW-EVENT-731', 'NW-BATCH-0', 'NW-BATCH-1']:
        require(marker in json.dumps(stored), 'Event stream loses ' + marker)


def core_retention(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Retention Ledger')
    base = '/api/v1/threads/' + tid + '/retention'
    default = inst.request('GET', base, label='retention-default')
    require(default['is_default'] is False and default['policy']['event_hot_retention_days'] == 90
            and default['policy']['enabled'] is True, 'Declared thread retention policy differs')
    inst.request('PUT', base, {'event_hot_retention_days': 120, 'enabled': True, 'archive_mode': 'hard_delete'}, label='retention-update')
    stored = inst.request('GET', base, label='retention-stored')
    require(stored['is_default'] is False and stored['policy']['event_hot_retention_days'] == 120 and stored['policy']['archive_mode'] == 'hard_delete', 'Retention update does not persist')


def core_projections(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Projection Ledger')
    base = '/api/v1/threads/' + tid + '/projections'
    registered = inst.request('POST', base, {'kind': 'northwind-ledger', 'projection_key': 'northwind-review',
                              'cursor_key': 'northwind-review', 'worker_ref': 'func://kickside.core.lifecycle:child_lifecycle_projection'},
                              expect=(201,), label='projection-register')
    cursor = {'cursor_id': registered['cursor_id']}
    listed = inst.request('GET', base, label='projection-read')
    require(registered['projection_id'] in json.dumps(listed), 'Projection descriptor is absent')
    paused = inst.request('PUT', base + '/pause', cursor, label='projection-pause')
    require(paused['cursor_id'] == cursor['cursor_id'] and paused['status'] == 'paused', 'Cursor does not pause')
    resumed = inst.request('PUT', base + '/resume', cursor, label='projection-resume')
    require(resumed['cursor_id'] == cursor['cursor_id'] and resumed['status'] == 'active', 'Cursor does not resume')
    inst.request('POST', base + '/remove', {'projection_id': registered['projection_id']}, label='projection-remove')
    require(registered['projection_id'] not in json.dumps(inst.request('GET', base)), 'Removed projection remains')


def core_thread_delete(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Archived Ledger')
    inst.request('DELETE', '/api/v1/threads/' + tid, label='thread-delete')
    require(tid not in json.dumps(inst.request('GET', '/api/v1/threads')), 'Deleted thread remains listed')
    absent = inst.request('GET', '/api/v1/threads/' + tid, expect=(404,), label='deleted-thread-absent')
    require(absent.get('error'), 'Deleted thread read lacks not-found error')


def core_workspace_dashboard(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    inst.install('chestor/workspace')
    inst.install('kickside/dashboard')
    for name in ['Northwind Customer Operations', 'Northwind Warehouse Planning', 'Northwind Supplier Reviews', 'Northwind Quarterly Reports']:
        folder = inst.request('POST', '/api/v1/workspace/entries', {'type': 'folder', 'name': name}, label='workspace-folder')['entry']
        require(folder['name'] == name and folder.get('id'), 'Workspace folder loses identity or title')
    ctx.browser.reload()
    nav(ctx, 'Workspace')
    expect(ctx.browser.frame.get_by_text('Northwind Warehouse Planning', exact=True).first).to_be_visible(timeout=30000)
    ctx.browser.screenshot('northwind-workspace-tree', full_page=False, mask_color='#e5e7eb')
    overview = inst.request('GET', '/api/v1/dashboard/overview', label='dashboard-overview')
    require(overview.get('surfaces') and overview['count'] == len(overview['surfaces']), 'Dashboard lacks consistent surfaces')
    nav(ctx, 'Dashboard')
    ctx.browser.frame.locator('kickside-dashboard').wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-dashboard', full_page=False, mask_color='#e5e7eb')


def core_transfer(ctx):
    inst, browser = ctx.inst, ctx.browser
    install_with_parameters(inst, 'kickside/transfer', [{'name': 'kickside.transfer:scratch_storage', 'value': 'app:tmp'}])
    browser.reload()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    agent = inst.request('POST', '/api/v1/user-agents', {'title': 'Northwind Export Assistant',
                         'prompt': 'You help fictional Northwind warehouse operators.', 'traits': []}, label='export-agent')['component_id']
    exportable = inst.request('GET', '/api/v1/transfer/exportable', label='exportable')
    require(agent in json.dumps(exportable['components']), 'Created agent is not exportable')
    account(ctx, 'Export / Import')
    picker = browser.frame.locator('kickside-transfer')
    picker.get_by_text('Northwind Export Assistant', exact=True).wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-transfer-picker', full_page=False, mask_color='#e5e7eb')
    browser.page.keyboard.press('Escape')
    bundle, content_type = binary_request(inst, 'POST', '/api/v1/transfer/export', {'component_ids': [agent]})
    require(len(bundle) > 100 and 'application/octet-stream' in content_type, 'Export lacks a component bundle')
    boundary = 'northwind_' + uuid.uuid4().hex
    raw = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="northwind.kxb"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode()
           + bundle + f'\r\n--{boundary}--\r\n'.encode())
    imported = inst.request('POST', '/api/v1/transfer/import', raw=raw,
                            headers={'Content-Type': 'multipart/form-data; boundary=' + boundary}, label='import-bundle')
    require(imported['count'] == 1 and len(imported['created']) == 1, 'Import creates wrong component count')
    created = imported['created'][0]
    require(created != agent, 'Import reuses original component identity')
    detail = inst.request('GET', '/api/v1/user-agents/' + created, label='imported-agent')['agent']
    require(detail['title'] == 'Northwind Export Assistant' and 'Northwind warehouse' in detail['prompt'], 'Import loses agent configuration')


def core_identity(ctx):
    inst, browser = ctx.inst, ctx.browser
    links = inst.request('GET', '/api/v1/identity/links', label='identity-links')
    require(links.get('success') is True and not links['links'], 'Fresh Northwind user has unexpected linked identities')
    account(ctx, 'Linked accounts')
    identity = browser.frame.locator('kickside-identity-links')
    with browser.page.expect_response(lambda r: r.url.endswith('/api/v1/identity/link-codes') and r.request.method == 'POST') as response:
        identity.get_by_role('button', name='Generate link code', exact=True).click()
    issued = response.value.json()
    require(issued.get('code') and issued['expires_in_seconds'] > 0 and issued['code'] in issued['instructions'], 'Identity code lacks expiration or instructions')
    inst.redactor.add(issued['code'])
    ctx.browser.screenshot('northwind-linked-accounts', full_page=False, mask_color='#e5e7eb')
    browser.page.keyboard.press('Escape')
    rejected = inst.request('POST', '/api/v1/identity/unlink', {'provider': '', 'external_id': ''}, expect=(400,), label='unlink-invalid')
    require(rejected.get('error') and rejected.get('success') is False, 'Invalid unlink lacks explicit error')
    require(not inst.request('GET', '/api/v1/identity/links')['links'], 'Invalid unlink creates identity links')


def core_hub(ctx):
    inst = ctx.inst
    system(ctx, 'Modules')
    ctx.browser.frame.locator('kickside-hub').wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-hub-catalog', full_page=False, mask_color='#e5e7eb')
    before = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=1', label='dependencies-before')['dependencies']
    inst.install('chestor/journal')
    installed = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=1', label='dependencies-after')['dependencies']
    require(any(d['component'] == 'chestor/journal' for d in installed), 'Installed module is absent from dependency list')
    plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan', {'component': 'chestor/journal', 'run_migrations': True}, label='update-dry-run', timeout=120)
    require(plan.get('install_payload', {}).get('component') == 'chestor/journal', 'Update dry run lacks planned module')
    after = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=1')['dependencies']
    require([(d['component'], d.get('version')) for d in after] == [(d['component'], d.get('version')) for d in installed], 'Dry run mutates installed dependencies')
    inst.evidence.save('installation-counts', {'before': len(before), 'after': len(installed)})


def core_hub_auth(ctx):
    inst = ctx.inst
    status = inst.request('GET', '/api/v1/hub/auth', label='hub-auth-status')
    require(isinstance(status.get('authenticated'), bool), 'Hub auth status lacks authentication state')
    rejected = inst.request('POST', '/api/v1/hub/auth', {'token': ''}, expect=(400,), label='hub-auth-empty')
    require(rejected.get('error') == 'token required', 'Hub accepts an empty token')
    cleared = inst.request('DELETE', '/api/v1/hub/auth', label='hub-auth-clear')
    require(cleared.get('success') is True, 'Hub runtime token clearing lacks acknowledgment')
    after = inst.request('GET', '/api/v1/hub/auth', label='hub-auth-external-source')
    require(after.get('authenticated') == status['authenticated'] and 'token' not in after,
            'Clearing an unset runtime token changes external credential authentication or exposes a token')
    if status['authenticated']:
        require(after.get('user_id') == status.get('user_id') and after.get('registry') == status.get('registry'),
                'Clearing the runtime override changes the external registry identity')


def core_hub_auth_status(ctx):
    result = ctx.inst.request('GET', '/api/v1/hub/auth', label='hub-auth-status')
    require(isinstance(result.get('authenticated'), bool) and 'token' not in result, 'Hub auth status lacks state or exposes token')


def core_hub_auth_invalid(ctx):
    rejected = ctx.inst.request('POST', '/api/v1/hub/auth', {'token': ''}, expect=(400,), label='hub-auth-empty')
    require(rejected.get('error') == 'token required' and rejected.get('success') is False, 'Hub accepts empty credential')


def core_access_model(ctx):
    capabilities = ctx.inst.request('GET', '/api/v1/components/access-model', label='access-vocabulary')['capabilities']
    require({c['key']: c['bit'] for c in capabilities} == {'read': 1, 'write': 2, 'delete': 4, 'admin': 8}, 'Access vocabulary changes')


def core_share_grants(ctx):
    inst = ctx.inst
    inst.install('chestor/workspace')
    folder = inst.request('POST', '/api/v1/workspace/entries', {'type': 'folder', 'name': 'Northwind Grants Ledger'}, label='grant-folder')['entry']['id']
    share = '/api/v1/component-access/share/' + folder
    grants = '/api/v1/component-access/grants/' + folder
    subject = {'subject_id': ctx.state['core_member'], 'subject_type': 'user'}
    inst.request('POST', share, {**subject, 'access_mask': 1}, label='grant-read')
    listed = inst.request('GET', grants, label='grant-read-persisted')
    require(any(g['subject_id'] == subject['subject_id'] and g['access_mask'] == 1 for g in listed['access']), 'Read grant does not persist')
    inst.request('POST', share, {**subject, 'access_mask': 3}, label='grant-write')
    listed = inst.request('GET', grants, label='grant-write-persisted')
    require(any(g['subject_id'] == subject['subject_id'] and g['access_mask'] == 3 for g in listed['access']), 'Write grant does not persist')
    inst.request('POST', share, {**subject, 'action': 'revoke'}, label='grant-revoke')
    listed = inst.request('GET', grants, label='grant-revoked')
    require(not any(g['subject_id'] == subject['subject_id'] for g in listed['access']), 'Revoked grant remains')


def core_hub_recommendations(ctx):
    inst = ctx.inst
    result = inst.request('POST', '/api/v1/onboarding/module-recommendations',
                          {'need': 'Northwind needs a journal to record warehouse shift handovers. Recommend the journal.',
                           'candidates': [{'component': 'chestor/journal', 'title': 'Journal', 'description': 'Warehouse shift notes', 'keywords': ['notes', 'journal']}],
                           'workspace_context': {'configured_components': []}}, label='gemma-recommendations', timeout=120)
    require(result.get('available') is True and result.get('component_ids') == ['chestor/journal'], 'Gemma recommendations lose the allowed journal candidate')


def core_keeper_navigation(ctx):
    from playwright.sync_api import expect
    system(ctx, 'Modules')
    link = ctx.browser.frame.get_by_role('link', name='Keeper', exact=False)
    expect(link).to_be_visible(timeout=30000)
    expect(link).to_have_attribute('href', '/c/keeper:main/')
    ctx.browser.screenshot('northwind-system-keeper-navigation', full_page=False, mask_color='#e5e7eb')


def core_hub_resolution(ctx):
    result = ctx.inst.request('POST', '/api/v1/onboarding/requirement-resolution',
                              {'component': 'chestor/journal', 'requirements': [{'name': 'northwind.invalid_requirement'}]},
                              label='grounded-requirement-resolution', timeout=120)
    require(result.get('success') is True and result.get('parameters') == [], 'Requirement resolver invents a binding outside the authoritative plan')


def mcp_call(ctx, tool_ids, calls):
    from mcp_client import MCPClient
    inst = ctx.inst
    inst.install('kickside/mcp')
    credential = inst.request('POST', '/api/v1/mcp/credentials',
                              {'label': 'Northwind core inspection', 'allowed_tool_ids': list(tool_ids)}, label='inspection-credential')['credential']
    token, cid = credential['token'], credential['credential_id']
    inst.redactor.add(token)
    client = MCPClient(inst, token, '/api/public/mcp', stateful=False)
    try:
        client.rpc('initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
                           'clientInfo': {'name': 'Northwind Inspection', 'version': '1'}}, 'inspection-initialize')
        output = []
        for name, arguments in calls:
            output.append(client.call(name, arguments))
        return output
    finally:
        inst.request('POST', '/api/v1/mcp/credentials/' + str(cid) + '/revoke', {}, label='inspection-revoke')


def core_documentation(ctx):
    result = mcp_call(ctx, ['app:documentation'], [('read_kickside_documentation', {})])[0]
    require('discovery' in json.dumps(result).lower() and 'pages' in json.dumps(result), 'Canonical documentation list lacks discovery handbook')


def core_hub_inspection(ctx):
    from module_lifecycle_contract import versions
    version = versions(ctx.inst, 'kickside/hub')[-1]
    result = mcp_call(ctx, ['kickside.hub.instruments:inspect_module_artifact', 'kickside.hub.instruments:inspect_registry_entries'],
                      [('InspectModuleArtifact', {'component': 'kickside/hub', 'version': version}),
                       ('InspectRegistryCandidates', {'ids': ['kickside.channel:channel_kind']})])
    require('kickside/hub' in json.dumps(result[0]) and 'entries' in json.dumps(result[0]), 'Module artifact inspection lacks module entries')
    require('kickside.channel:channel_kind' in json.dumps(result[1]) and 'kickside.channel' in json.dumps(result[1]), 'Registry inspection loses exact binding')


def core_websocket(ctx):
    inst, browser = ctx.inst, ctx.browser
    before = len(browser.frames)
    browser.reload()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    inst.request('PUT', '/api/v1/nav/config', {'title': 'Northwind Operations'}, label='realtime-nav-broadcast')
    inst.wait(lambda: any('nav.changed' in json.dumps(f) for f in browser.frames[before:]), 'WebSocket receives navigation change',
              pump=browser.page.wait_for_timeout)
    inst.evidence.save('websocket-frames', browser.frames[before:])
    require(browser.frames[before:], 'Authenticated shell receives no realtime frames')
    ctx.browser.screenshot('northwind-realtime-shell', full_page=False, mask_color='#e5e7eb')


def core_dm_component(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Direct Message', impl_id='kickside.dm:dm_kind', thread_class='kickside.dm')
    detail = inst.request('GET', '/api/v1/threads/' + tid, label='dm-thread')['thread']
    require(detail['thread_class'] == 'kickside.dm' and detail['component_id'] == tid, 'DM binding loses class or component identity')
    inst.request('DELETE', '/api/v1/threads/' + tid, label='dm-delete')
    require(tid not in json.dumps(inst.request('GET', '/api/v1/threads')), 'Deleted DM remains listed')


def core_channel_component(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Warehouse Channel', impl_id='kickside.channel:channel_kind', thread_class='kickside.channel')
    detail = inst.request('GET', '/api/v1/threads/' + tid, label='channel-thread')['thread']
    require(detail['thread_class'] == 'kickside.channel' and detail['component_id'] == tid, 'Channel binding loses class or component identity')
    inst.request('DELETE', '/api/v1/threads/' + tid, label='channel-delete')
    require(tid not in json.dumps(inst.request('GET', '/api/v1/threads')), 'Deleted channel remains listed')


def install_channel_responder(ctx, title):
    from mocks.services import JIRA_EMAIL, JIRA_TOKEN
    inst = ctx.inst
    inst.install('kickside/atlassian')
    if not ctx.state.get('core_jira_url'):
        ctx.state['core_jira_url'] = ctx.fixtures.start('jira')
        inst.cleanup.add('Northwind Jira fixture', lambda: ctx.fixtures.stop('jira'))
    base_url = ctx.state['core_jira_url']
    catalog = inst.request('GET', '/api/v1/connections/providers/discover', label='jira-provider')['providers']
    provider = next(p for p in catalog if p['id'] == 'kickside.atlassian.connection:atlassian_connection')
    inst.evidence.save('jira-connection-contract', provider)
    connection = inst.request('POST', '/api/v1/connections',
                              {'impl_id': provider['id'], 'name': 'Northwind Warehouse Transport',
                               'private_context': {'site_url': base_url, 'deployment': 'cloud', 'email': JIRA_EMAIL, 'api_token': JIRA_TOKEN}},
                              label='responder-connection')['component_id']
    created = inst.request('POST', '/api/v1/automations', {'type': 'kickside.channel.responder:channel_responder',
                           'input': {'title': title, 'connection_id': connection,
                                     'agent_id': ctx.state['agent'], 'target': 'channel', 'channel_id': 'northwind-warehouse'}}, label='channel-responder-install')
    rid = created['id']
    state = inst.request('GET', '/api/v1/automations/' + rid + '/state', label='channel-responder-state')
    require(connection in json.dumps(state) and 'northwind-warehouse' in json.dumps(state), 'Responder loses connection routing')
    return rid


def core_channel_responder_install(ctx):
    inst = ctx.inst
    rid = install_channel_responder(ctx, 'Northwind Receiving Responder')
    listed = inst.request('GET', '/api/v1/automations', label='installed-responder-list')
    require(rid in json.dumps(listed) and 'Northwind Receiving Responder' in json.dumps(listed),
            'Installed channel responder is absent from automation list')
    config = inst.request('GET', '/api/v1/automations/' + rid + '/state', label='installed-responder-config')
    require(ctx.state['agent'] in json.dumps(config) and 'northwind-warehouse' in json.dumps(config),
            'Installed channel responder loses agent or destination')
    inst.request('DELETE', '/api/v1/automations/' + rid, label='installed-responder-delete')
    require(rid not in json.dumps(inst.request('GET', '/api/v1/automations')), 'Deleted responder remains listed')


def core_channel_responder_binding(ctx):
    inst = ctx.inst
    rid = install_channel_responder(ctx, 'Northwind Dispatch Responder')
    listed = inst.request('GET', '/api/v1/automations', label='responder-binding-list')
    item = next(a for a in listed['automations'] if a['id'] == rid)
    require(item['title'] == 'Northwind Dispatch Responder' and item['type'] == 'kickside.channel.responder:channel_responder',
            'Responder binding loses title or implementation')
    require(item['public_state']['agent'] == ctx.state['agent'] and item['public_state']['channel_id'] == 'northwind-warehouse',
            'Responder binding loses agent or destination')
    inst.request('DELETE', '/api/v1/automations/' + rid, label='responder-binding-delete')
    inst.wait(lambda: rid not in json.dumps(inst.request('GET', '/api/v1/automations', label='responder-binding-absent')),
              'Deleted responder leaves listing')


def core_channel_responder(ctx):
    inst = ctx.inst
    rid = install_channel_responder(ctx, 'Northwind Warehouse Responder')
    for action, paused in [('pause', True), ('resume', False)]:
        inst.request('POST', '/api/v1/automations/' + rid + '/actions/' + action, {}, label='channel-responder-' + action)
        def settled():
            result = inst.request('POST', '/api/v1/automations/' + rid + '/actions/status', {},
                                  label='channel-responder-' + action + '-status')['result']
            drives = result['drives']
            expected = 'paused' if paused else 'active'
            return bool(drives) and all(drive['phase'] == expected and drive['enabled'] is not paused for drive in drives)
        inst.wait(settled, 'Responder ' + action + ' persists')
    inst.request('DELETE', '/api/v1/automations/' + rid, label='channel-responder-delete')
    require(rid not in json.dumps(inst.request('GET', '/api/v1/automations')), 'Deleted responder remains listed')


def core_channel_watch(ctx):
    inst = ctx.inst
    tid = create_thread(ctx, 'Northwind Channel Watch', impl_id='kickside.channel:channel_kind', thread_class='kickside.channel')
    created = inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': {
                           'title': 'Northwind Channel Receipt Watch', 'enabled': True,
                           'trigger': {'v': 2, 'source': 'kickside.channel:channel_message_received', 'config': {'thread_id': tid}, 'backfill': 'none'},
                           'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
                           'transform': {'kind': 'expr', 'expr': '{"title":"Northwind Channel Receipt","content":"Fictional Northwind channel activity"}'}}},
                          label='channel-watch-install')
    aid = created['id']
    state = inst.request('GET', '/api/v1/automations/' + aid + '/config', label='channel-watch-config')
    require(tid in json.dumps(state) and 'kickside.channel:channel_message_received' in json.dumps(state), 'Channel watch loses source binding or thread')
    status = inst.request('GET', '/api/v1/automations/' + aid + '/status', label='channel-watch-status')
    require(status.get('success') is True and len(status) > 1, 'Channel watch lacks runtime status')
    for control in ['pause', 'resume']:
        changed = inst.request('POST', '/api/v1/automations/' + aid + '/control',
                                {'control': control, 'request_id': uuid.uuid4().hex}, label='channel-watch-' + control)
        require(changed.get('success') is True, 'Channel watch control fails')
    inst.request('DELETE', '/api/v1/automations/' + aid, label='channel-watch-delete')
    inst.wait(lambda: aid not in json.dumps(inst.request('GET', '/api/v1/automations', label='channel-watch-absent')),
              'Deleted channel watch leaves listing')


def core_widgets(ctx):
    result = ctx.inst.request('GET', '/api/v1/component-kinds/create-view?class=automation', label='automation-create-view')
    require(result.get('success') is True and result.get('create_view', {}).get('tag_name'), 'Automation create-view discovery lacks descriptor')


def core_restart(ctx):
    inst, browser = ctx.inst, ctx.browser
    tid = ctx.state['core_thread']
    before = inst.request('GET', '/api/v1/threads/' + tid, label='before-restart-thread')['thread']
    browser = ctx.restart(hard=True)
    after = inst.request('GET', '/api/v1/threads/' + tid, label='after-restart-thread')['thread']
    require(before == after, 'Restart changes durable thread identity or attributes')
    branding = inst.request('GET', '/api/public/branding', auth='', label='after-restart-branding')
    require(branding['title'] == 'Northwind Operations' and branding['logo_url'] == ctx.state['core_logo'], 'Restart loses branding')
    binary_request(inst, 'GET', branding['logo_url'], auth='')
    browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    nav(ctx, 'Dashboard')
    browser.frame.locator('kickside-dashboard').wait_for(timeout=30000)
    ctx.browser.screenshot('northwind-dashboard-after-restart', full_page=False, mask_color='#e5e7eb')


def core_logout(ctx):
    inst, browser = ctx.inst, ctx.browser
    request_phases = {'before_logout': list(browser.errors)}
    account(ctx, 'Sign out')
    browser.page.get_by_role('button', name='Sign In', exact=True).wait_for(timeout=30000)
    require('/login' in browser.page.url, 'UI logout does not return to login')
    ctx.browser.screenshot('northwind-branded-login', full_page=False, mask_color='#e5e7eb')
    request_phases['login_visible'] = list(browser.errors)
    browser.settle()
    browser.page.get_by_label('Email').fill(inst.email)
    browser.page.get_by_label('Password').fill(inst.password)
    with browser.page.expect_response(lambda r: '/api/public/user/token' in r.url and r.request.method == 'POST') as response:
        browser.page.get_by_role('button', name='Sign In', exact=True).click()
    require(response.value.status == 200, 'Browser login fails: HTTP ' + str(response.value.status))
    browser.page.wait_for_url(inst.base + '/', timeout=30000)
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    request_phases['signed_in'] = list(browser.errors)
    inst.evidence.save('logout-request-phases', request_phases)
    token = member_token(ctx)
    logout = inst.request('POST', '/api/v1/user/logout', {}, auth=token, label='member-logout')
    require(logout.get('success') is True, 'Logout lacks acknowledgment')
    denied = inst.request('GET', '/api/v1/user/me', auth=token, expect=(401,), label='logged-out-token-denied')
    require(denied.get('error'), 'Logged-out token remains authorized')


def core_session_logout(ctx):
    inst = ctx.inst
    token = member_token(ctx)
    before = inst.request('GET', '/api/v1/user/me', auth=token, label='before-session-logout')
    require(before['user']['id'] == ctx.state['core_member'], 'Session belongs to a different member')
    logout = inst.request('POST', '/api/v1/user/logout', {}, auth=token, label='session-logout')
    require(logout.get('success') is True and logout.get('revoked') == 1, 'Logout does not revoke one session')
    denied = inst.request('GET', '/api/v1/user/me', auth=token, expect=(401,), label='session-logout-denied')
    require(denied.get('error'), 'Revoked session remains authorized')


def core_gemma_restart(ctx):
    system(ctx, 'Appearance')
    ctx.browser.frame.locator('kickside-appearance').get_by_role('button', name='Dark', exact=True).click()
    restart_continuation(ctx)
    ctx.browser.screenshot('northwind-gemma-continuity-dark', full_page=False, mask_color='#e5e7eb')
    system(ctx, 'Appearance')
    ctx.browser.frame.locator('kickside-appearance').get_by_role('button', name='Light', exact=True).click()


def core_replay_setup(ctx):
    inst, browser = ctx.inst, ctx.browser
    system(ctx, 'Appearance')
    browser.frame.locator('kickside-appearance').get_by_role('button', name='Show setup again', exact=True).click()
    browser.frame.get_by_role('heading', name='Name your workspace', exact=True).wait_for(timeout=30000)
    replay = inst.request('GET', '/api/v1/nav/list?manage=1', label='setup-reopened')
    require(replay['splash']['id'] == 'welcome', 'Instance reset does not reopen platform onboarding')
    ctx.browser.screenshot('northwind-platform-onboarding-reopened', full_page=False, mask_color='#e5e7eb')
    inst.request('POST', '/api/v1/ui/splash/welcome/seen', label='setup-recompleted')
    require((inst.request('GET', '/api/v1/nav/list').get('splash') or {}).get('id') != 'welcome', 'Recompleted platform onboarding remains active')
    browser.reload()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)


BASE = ('core_ready',)
REGISTRY = [
    Scenario('core_ready', 'full', core_ready, features=http('kickside', 'GET /login', 'GET /api/public/health', 'GET /api/public/env/public.js', 'GET /llms.txt', 'GET /robots.txt')),
    Scenario('core_platform', 'full', core_platform, ('core_ready',), True, issues=('ONBOARDING-DEPENDENCY-INSTALL-CONFLICT',),
             features=navigation('ui', 'kickside.ui:splash.welcome', 'kickside.ui:splash.welcome.step.workspace', 'kickside.ui:splash.welcome.step.logo', 'kickside.ui:splash.welcome.step.models', 'kickside.ui:splash.welcome.step.mcp', 'kickside.ui:splash.welcome.step.done')
             + navigation('hub', 'kickside.hub:splash.welcome.step.modules') + http('users', 'POST /api/public/user/token') + http('ui', 'POST /api/v1/ui/splash/{id}/seen', 'GET /api/v1/nav/list'), instance_setup=True),
    Scenario('core_personal_agent', 'full', core_personal_agent, ('core_platform',),
             features=navigation('agent-onboarding', 'kickside.agent_onboarding:splash.first_agent', 'kickside.agent_onboarding:splash.first_agent.step.create') + http('ui', 'DELETE /api/v1/ui/splash/{id}/seen', 'POST /api/v1/ui/splash/{id}/seen'), instance_setup=True),
    Scenario('core_gemma_chat', 'full', core_gemma_chat, ('core_personal_agent',), True, features=http('kickside', 'GET /api/v1/ws/join')),
    Scenario('core_users', 'full', core_users, ('core_personal_agent',), features=http('users', 'POST /api/v1/users', 'PUT /api/v1/users/{id}', 'GET /api/v1/users', 'PUT /api/v1/users/{id}/groups', 'GET /api/v1/users/{id}/groups', 'GET /api/v1/users/assignable-scopes', 'GET /api/v1/principals/search', 'POST /api/v1/principals/resolve') + navigation('users', 'kickside.users:tab.users')),
    Scenario('core_profile', 'full', core_profile, ('core_personal_agent',), features=http('users', 'GET /api/v1/user/me', 'PUT /api/v1/user/me', 'GET /api/v1/profile', 'PUT /api/v1/profile')),
    Scenario('core_user_delete', 'full', core_user_delete, BASE, features=http('users', 'DELETE /api/v1/users/{id}', 'POST /api/v1/users', 'GET /api/v1/users', 'POST /api/public/user/token')),
    Scenario('core_security', 'full', core_security, ('core_personal_agent',), features=http('security', 'GET /api/v1/security/policies', 'GET /api/v1/security/scopes', 'POST /api/v1/security/scopes', 'DELETE /api/v1/security/scopes') + navigation('security', 'kickside.security:tab.security')),
    Scenario('core_settings', 'full', core_settings, ('core_personal_agent',), features=http('settings', 'GET /api/v1/settings', 'GET /api/v1/settings/blocks', 'PUT /api/v1/settings') + navigation('settings', 'kickside.settings:tab.settings') + navigation('users', 'kickside.users:block.authentication')),
    Scenario('core_appearance', 'full', core_appearance, ('core_personal_agent',), features=http('ui', 'POST /api/v1/nav/logo', 'GET /api/public/branding', 'PUT /api/v1/nav/config', 'GET /api/v1/nav/list') + navigation('ui', 'kickside.ui:tab.appearance')),
    Scenario('core_shell_catalogs', 'full', core_shell_catalogs, BASE, features=http('ui', 'GET /api/v1/nav/list', 'GET /api/v1/settings/tabs', 'GET /api/v1/account/items', 'GET /api/v1/ui/contributions')),
    Scenario('core_sharing', 'full', core_sharing, ('core_users',), features=http('component', 'GET /api/v1/components/access-model', 'GET /api/v1/component-access/grants/{id}', 'POST /api/v1/component-access/share/{id}'), instance_setup=True),
    Scenario('core_access_model', 'full', core_access_model, BASE, features=http('component', 'GET /api/v1/components/access-model')),
    Scenario('core_share_grants', 'full', core_share_grants, ('core_users',), features=http('component', 'GET /api/v1/component-access/grants/{id}', 'POST /api/v1/component-access/share/{id}'), instance_setup=True),
    Scenario('core_member_boundaries', 'full', core_member_boundaries, ('core_users',), features=http('users', 'GET /api/v1/user/me', 'POST /api/public/user/token') + navigation('agent-onboarding', 'kickside.agent_onboarding:splash.first_agent')),
    Scenario('core_threads', 'full', core_threads, BASE, features=http('core', 'POST /api/v1/threads', 'GET /api/v1/threads', 'GET /api/v1/threads/{id}', 'PATCH /api/v1/threads/{id}', 'GET /api/v1/thread-classes', 'GET /api/v1/jobs', 'GET /api/v1/job-runs')),
    Scenario('core_thread_hierarchy', 'full', core_thread_hierarchy, BASE, features=http('core', 'POST /api/v1/threads', 'GET /api/v1/threads/{id}/children', 'GET /api/v1/threads/{id}/graph')),
    Scenario('core_thread_messages', 'full', core_thread_messages, BASE, features=http('core', 'POST /api/v1/threads', 'POST /api/v1/threads/{id}/messages', 'GET /api/v1/threads/{id}/events')),
    Scenario('core_thread_events', 'full', core_thread_events, BASE, features=http('core', 'POST /api/v1/threads', 'POST /api/v1/threads/{id}/events', 'POST /api/v1/threads/{id}/events/batch', 'GET /api/v1/threads/{id}/events')),
    Scenario('core_retention', 'full', core_retention, BASE, features=http('core', 'POST /api/v1/threads', 'GET /api/v1/threads/{id}/retention', 'PUT /api/v1/threads/{id}/retention')),
    Scenario('core_projections', 'full', core_projections, BASE, features=http('core', 'POST /api/v1/threads', 'POST /api/v1/threads/{id}/projections', 'GET /api/v1/threads/{id}/projections', 'PUT /api/v1/threads/{id}/projections/pause', 'PUT /api/v1/threads/{id}/projections/resume', 'POST /api/v1/threads/{id}/projections/remove')),
    Scenario('core_projection_proc_error', 'full', verify_projection_proc_error, BASE, issues=('B03',), features=http('core', 'POST /api/v1/threads/{id}/projections', 'GET /api/v1/threads/{id}/projections', 'GET /api/v1/job-runs', 'GET /api/v1/jobs'), instance_setup=True),
    Scenario('core_thread_delete', 'full', core_thread_delete, BASE, features=http('core', 'POST /api/v1/threads', 'DELETE /api/v1/threads/{id}', 'GET /api/v1/threads')),
    Scenario('core_workspace_dashboard', 'full', core_workspace_dashboard, ('core_personal_agent',), features=http('dashboard', 'GET /api/v1/dashboard/overview') + navigation('dashboard', 'kickside.dashboard:nav_item'), instance_setup=True),
    Scenario('core_transfer', 'full', core_transfer, ('core_personal_agent',), features=http('transfer', 'GET /api/v1/transfer/exportable', 'POST /api/v1/transfer/export', 'POST /api/v1/transfer/import') + navigation('transfer', 'kickside.transfer:account.transfer'), instance_setup=True),
    Scenario('core_identity', 'full', core_identity, ('core_personal_agent',), features=http('identity', 'GET /api/v1/identity/links', 'POST /api/v1/identity/link-codes', 'POST /api/v1/identity/unlink') + navigation('identity', 'kickside.identity:account.identity')),
    Scenario('core_hub', 'full', core_hub, ('core_personal_agent',), features=navigation('hub', 'kickside.hub:tab.modules') + navigation('kickside', 'app.ui:system', 'app.views:main'), instance_setup=True),
    Scenario('core_hub_auth', 'full', core_hub_auth, BASE, features=http('hub', 'GET /api/v1/hub/auth', 'POST /api/v1/hub/auth', 'DELETE /api/v1/hub/auth')),
    Scenario('core_hub_auth_status', 'full', core_hub_auth_status, BASE, features=http('hub', 'GET /api/v1/hub/auth')),
    Scenario('core_hub_auth_invalid', 'full', core_hub_auth_invalid, BASE, features=http('hub', 'POST /api/v1/hub/auth')),
    Scenario('core_hub_recommendations', 'full', core_hub_recommendations, ('core_platform',), True, features=http('hub', 'POST /api/v1/onboarding/module-recommendations')),
    Scenario('core_keeper_navigation', 'full', core_keeper_navigation, ('core_personal_agent',), features=navigation('hub', 'kickside.hub:tab.keeper')),
    Scenario('core_hub_resolution', 'full', core_hub_resolution, BASE, True, features=http('hub', 'POST /api/v1/onboarding/requirement-resolution')),
    Scenario('core_documentation', 'full', core_documentation, BASE, features=('kickside/kickside|mcp_tool|app:documentation',), instance_setup=True),
    Scenario('core_hub_inspection', 'full', core_hub_inspection, BASE, features=('kickside/hub|mcp_tool|kickside.hub.instruments:inspect_module_artifact', 'kickside/hub|mcp_tool|kickside.hub.instruments:inspect_registry_entries'), instance_setup=True),
    Scenario('core_websocket', 'full', core_websocket, ('core_personal_agent',), features=http('kickside', 'GET /api/v1/ws/join')),
    Scenario('core_dm_component', 'full', core_dm_component, BASE, features=('kickside/dm|workspace_kind|kickside.dm:dm_kind',)),
    Scenario('core_channel_component', 'full', core_channel_component, BASE, features=('kickside/channel|workspace_kind|kickside.channel:channel_kind',)),
    Scenario('core_channel_responder', 'full', core_channel_responder, ('core_personal_agent',), features=('kickside/channel|workspace_kind|kickside.channel.responder:channel_responder', 'kickside/channel|automation|kickside.channel.responder:channel_responder'), instance_setup=True),
    Scenario('core_channel_responder_install', 'full', core_channel_responder_install, ('core_personal_agent',), features=('kickside/channel|workspace_kind|kickside.channel.responder:channel_responder', 'kickside/channel|automation|kickside.channel.responder:channel_responder'), instance_setup=True),
    Scenario('core_channel_responder_binding', 'full', core_channel_responder_binding, ('core_personal_agent',), features=('kickside/channel|workspace_kind|kickside.channel.responder:channel_responder', 'kickside/channel|automation|kickside.channel.responder:channel_responder'), instance_setup=True),
    Scenario('core_channel_watch', 'full', core_channel_watch, BASE, features=('kickside/channel|trigger|kickside.channel:channel_message_received',)),
    Scenario('core_widgets', 'full', core_widgets, BASE, features=http('widgets', 'GET /api/v1/component-kinds/create-view')),
    Scenario('core_restart', 'full', core_restart, ('core_threads', 'core_appearance', 'core_workspace_dashboard'), features=http('core', 'GET /api/v1/threads/{id}') + http('ui', 'GET /api/public/branding') + navigation('dashboard', 'kickside.dashboard:nav_item')),
    Scenario('core_logout', 'full', core_logout, ('core_users',), issues=('TS-LOGOUT-ASSET-ABORT',), features=http('users', 'POST /api/v1/user/logout', 'POST /api/public/user/token') + http('kickside', 'GET /login')),
    Scenario('core_session_logout', 'full', core_session_logout, ('core_users',), features=http('users', 'POST /api/v1/user/logout', 'GET /api/v1/user/me', 'POST /api/public/user/token')),
    Scenario('core_gemma_restart', 'full', core_gemma_restart, ('core_gemma_chat', 'core_appearance'), True, features=http('kickside', 'GET /api/v1/ws/join') + navigation('ui', 'kickside.ui:tab.appearance')),
    Scenario('core_replay_setup', 'full', core_replay_setup, ('core_personal_agent',), features=http('ui', 'DELETE /api/v1/ui/splash/seen', 'POST /api/v1/ui/splash/{id}/seen') + navigation('ui', 'kickside.ui:splash.welcome', 'kickside.ui:splash.welcome.step.workspace')),
]


def settings_cache_bootloader(ctx):
    with (ctx.inst.root / 'runtime.log').open('rb') as source:
        source.seek(ctx.inst.boot_log_offset)
        log = source.read().decode()
    warmers = [line for line in log.splitlines() if 'SUCCESS:' in line and 'settings cache warmed' in line]
    require(len(warmers) == 1 and '.settings:cache_bootloader' in warmers[0],
            'Settings cache does not warm exactly once through its canonical bootloader: ' + str(warmers))
    require('.settings.service:cache_bootloader' not in log, 'Duplicate Settings bootloader remains registered')
    settings = ctx.inst.request('GET', '/api/v1/settings', label='single-warmer-settings')
    require(settings.get('settings'), 'Settings are unavailable after cache warm')
    ctx.inst.evidence.save('settings-cache-warmers', warmers)


REGISTRY += [Scenario('core_settings_cache_bootloader', 'full', settings_cache_bootloader,
    ('boot',), features=http('settings', 'GET /api/v1/settings'))]


def scope_projection_handoff(ctx):
    inst = ctx.inst
    slug = 'northwind-scope-handoff'
    sid = 'kickside.security.scopes:' + slug
    saved = inst.request('POST', '/api/v1/security/scopes',
        {'slug': slug, 'label': 'Northwind scope handoff', 'policies': [], 'enabled': True}, label='scope-handoff-save')
    require(saved.get('success') is True, 'Scope write does not acknowledge projection')
    entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(sid, safe=''), label='scope-handoff-registry')['entry']
    require(entry['kind'] == 'security.scope' and entry['meta']['label'] == 'Northwind scope handoff', 'Successful scope write lacks its registry projection')
    inst.request('POST', '/api/v1/security/scopes',
        {'slug': slug, 'label': 'Northwind scope handoff updated', 'policies': [], 'enabled': True}, label='scope-handoff-update')
    updated = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(sid, safe=''), label='scope-handoff-updated')['entry']
    require(updated['meta']['label'] == 'Northwind scope handoff updated', 'Scope update returns before registry update')
    deleted = inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug, label='scope-handoff-delete')
    require(deleted.get('success') is True, 'Scope deletion does not acknowledge projection')
    absent = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(sid, safe=''), label='scope-handoff-absent', expect=(404,))
    require(not absent.get('entry'), 'Successful scope deletion leaves a registry scope')
    log = (inst.root / 'runtime.log').read_text()
    require('scope projection boot reconcile failed' not in log and 'no such column' not in log, 'Scope boot reconcile races the schema')


REGISTRY += [Scenario('core_scope_projection_handoff', 'full', scope_projection_handoff,
    ('boot',), features=http('security', 'POST /api/v1/security/scopes', 'DELETE /api/v1/security/scopes'))]


def core_model_request_options(ctx):
    from playwright.sync_api import expect
    inst, browser = ctx.inst, ctx.browser
    personal = browser.frame.locator('kickside-agent-onboarding')
    if personal.is_visible():
        personal.get_by_role('button', name=re.compile('Skip|Not now|Later', re.I)).click()
    name = 'request-options-' + uuid.uuid4().hex[:8]
    body = {
        'name': name, 'title': name, 'provider_model': name,
        'enabled': True, 'max_tokens': 32768, 'output_tokens': 4096,
        'capabilities': ['generate', 'reasoning'], 'classes': [],
        'options': {'thinking_effort': 'medium', 'reasoning_model_request': True,
                    'provider_specific': 'preserve', 'nested': {'limit': 4, 'api_key': 'private'}},
    }
    inst.request('PUT', '/api/v1/models/cards', body, label='request-options-create')
    inst.cleanup.add('request options card', lambda: inst.request(
        'DELETE', '/api/v1/models/cards?name=' + quote(name, safe=''), label='request-options-delete'))
    browser.reload()
    system(ctx, 'Models')
    models = browser.frame.locator('kickside-models')
    row = models.locator('.km-mrow').filter(has_text=name)
    row.get_by_role('button', name='Edit model', exact=True).click()
    effort = models.get_by_label('Thinking effort', exact=True)
    expect(effort).to_have_value('medium')
    browser.screenshot('model-request-options-string')
    models.get_by_label('Title', exact=True).fill(name + ' edited')
    with browser.page.expect_response(lambda r: r.request.method == 'PUT'
                                     and r.url.endswith('/api/v1/models/cards')) as saved:
        models.get_by_role('button', name='Save model', exact=True).click()
    require(saved.value.status == 200, 'String reasoning option save fails')
    card = next(item for item in inst.request('GET', '/api/v1/models/admin',
                label='request-options-string')['models'] if item['name'] == name)
    require(card['options']['thinking_effort'] == 'medium', 'String thinking effort changes during editing')
    require(card['options']['provider_specific'] == 'preserve' and card['options']['nested'] == {'limit': 4},
            'Saving loses provider options or exposes a credential')
    row.get_by_role('button', name='Edit model', exact=True).click()
    effort.fill('4')
    with browser.page.expect_response(lambda r: r.request.method == 'PUT'
                                     and r.url.endswith('/api/v1/models/cards')) as saved:
        models.get_by_role('button', name='Save model', exact=True).click()
    require(saved.value.status == 200, 'Numeric reasoning option save fails')
    browser.reload()
    system(ctx, 'Models')
    row.get_by_role('button', name='Edit model', exact=True).click()
    expect(effort).to_have_value('4')
    card = next(item for item in inst.request('GET', '/api/v1/models/admin',
                label='request-options-number')['models'] if item['name'] == name)
    require(type(card['options']['thinking_effort']) is int and card['options']['thinking_effort'] == 4,
            'Numeric thinking effort loses its number type')
    browser.screenshot('model-request-options-number')
    models.get_by_role('button', name='Cancel', exact=True).click()


REGISTRY += [Scenario('core_model_request_options', 'full', core_model_request_options,
                     ('core_platform',), features=http('models', 'GET /api/v1/models/admin',
                     'PUT /api/v1/models/cards', 'DELETE /api/v1/models/cards')
                     + navigation('models', 'kickside.models:tab.models'))]


def core_required_setup(ctx):
    from required_setup import required_setup
    required_setup(ctx)


REGISTRY += [Scenario('core_required_setup', 'full', core_required_setup,
                     ('core_ready',), features=http('hub', 'GET /api/v1/hub/required-setup',
                     'POST /api/v1/hub/required-setup'), instance_setup=True)]


def assert_branding_browser(ctx, url, image_bytes=None):
    from playwright.sync_api import expect
    from browser import assert_image_content
    browser = ctx.browser
    browser.settle()
    browser.page.goto(ctx.inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
    logo = browser.page.locator('#brand-logo')
    expect(logo).to_have_attribute('src', url, timeout=30000)
    expect(logo).to_be_visible()
    ctx.inst.wait(lambda: logo.evaluate('el => el.complete && el.naturalWidth > 0'),
        'Login logo decodes', seconds=30, pump=browser.page.wait_for_timeout)
    if image_bytes is not None:
        assert_image_content(logo, image_bytes)
    browser.screenshot('login-logo')
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    shell_logo = browser.frame.locator('.sidebar img').first
    expect(shell_logo).to_have_attribute('src', url, timeout=30000)
    ctx.inst.wait(lambda: shell_logo.evaluate('el => el.complete && el.naturalWidth > 0'),
        'App shell logo decodes', seconds=30, pump=browser.page.wait_for_timeout)
    if image_bytes is not None:
        assert_image_content(shell_logo, image_bytes)
    browser.screenshot('shell-logo')


def logo_upgrade(ctx, upgrade):
    from PIL import Image
    from module_lifecycle_contract import published_fixture
    module = 'kickside/ui'
    with published_fixture(ctx, module, published_app=True) as fixture:
        core_appearance(fixture)
        previous = fixture.state['core_logo']
        previous_bytes, _ = binary_request(fixture.inst, 'GET', previous, auth='')
        assert_branding_browser(fixture, previous, previous_bytes)
        upgrade(fixture)
        upgraded = fixture.inst.request('GET', '/api/public/branding', auth='', label='upgraded-branding')['logo_url']
        assert_branding_browser(fixture, upgraded, previous_bytes)
        preserved, _ = binary_request(fixture.inst, 'GET', upgraded, auth='')
        require(preserved == previous_bytes, 'Upgrade changes the previous logo bytes')
        system(fixture, 'Appearance')
        path = fixture.inst.root / 'temp' / 'northwind-replacement-logo.png'
        Image.new('RGB', (96, 96), '#ed8936').save(path)
        current = upload_appearance_logo(fixture, path)
        require(path.read_bytes() != previous_bytes, 'Replacement fixture uses the previous logo bytes')
        fixture.inst.wait(lambda: fixture.inst.request('GET', '/api/public/branding', auth='').get('logo_url') == current,
            'Replacement branding persists', pump=fixture.browser.page.wait_for_timeout)
        fixture.browser.reload()
        assert_branding_browser(fixture, current, path.read_bytes())
        data, _ = binary_request(fixture.inst, 'GET', current, auth='')
        require(data == path.read_bytes(), 'Replacement logo changes after reload')


def regression_logo_upgrade(ctx):
    from upgrade_regressions import upgrade_application
    logo_upgrade(ctx, lambda fixture: upgrade_application(fixture, ctx.inst.config['source'], ctx.inst.config['replace']))


def regression_logo_module_upgrade(ctx):
    from module_lifecycle_contract import update_source
    module = 'kickside/ui'
    logo_upgrade(ctx, lambda fixture: update_source(fixture, ctx.inst.config['replace'][module], module=module))


def regression_published_logo_restart(ctx):
    logo_upgrade(ctx, lambda fixture: fixture.restart())


REGISTRY.append(Scenario('regression_published_logo_restart', 'regression', regression_published_logo_restart,
    ('core_ready',), issues=('SMOKE-PUBLISHED-DEPENDENCY-OWNERSHIP', 'SMOKE-ISOLATED-RESTART-LIFECYCLE'),
    features=http('ui', 'POST /api/v1/nav/logo', 'GET /api/public/branding') +
        navigation('ui', 'kickside.ui:tab.appearance')))


REGISTRY.append(Scenario('regression_logo_upgrade', 'full', regression_logo_upgrade, ('core_ready',),
    features=http('ui', 'POST /api/v1/nav/logo', 'GET /api/public/branding') +
        navigation('ui', 'kickside.ui:tab.appearance'), issues=('APPEARANCE-LOGO-UPGRADE', 'SMOKE-UPGRADE-MANIFEST-SOURCE-ROOT')))

REGISTRY.append(Scenario('regression_logo_module_upgrade', 'full', regression_logo_module_upgrade, ('core_ready',),
    features=http('ui', 'POST /api/v1/nav/logo', 'GET /api/public/branding') +
        navigation('ui', 'kickside.ui:tab.appearance'), issues=('APPEARANCE-LOGO-UPGRADE',
            'SMOKE-PUBLISHED-DEPENDENCY-OWNERSHIP', 'HOST-UNBOUND-AUTH-EXPIRY-CALLBACK')))


def regression_projection_retry_ui(ctx):
    from playwright.sync_api import expect
    from scenarios_crm_chestor import create_entry, workspace_open, journal_recall_ready
    from scenarios_access import install_package
    from cleanup_evidence import delete_visible_component
    install_package(ctx, 'chestor/workspace')
    install_package(ctx, 'chestor/journal')
    marker = 'NW-PROJECTION-RETRY-' + uuid.uuid4().hex[:8]
    entry = {}
    def create_journal():
        entry.update(create_entry(ctx, 'journal', 'Northwind projection retry ' + marker))
        ctx.inst.cleanup.add('projection retry journal', lambda: delete_visible_component(ctx,
            entry['id'], '/api/v1/threads/' + entry['id']), scope='scenario')
        return entry['id']
    def append_event(identifier):
        ctx.inst.request('POST', '/api/v1/workspace/journals/' + identifier + '/events', {
            'event_type': 'finding', 'title': marker, 'body': 'Northwind durable journal evidence survives a refused observer batch.',
        }, label='journal-refused-observer-event')
    verify_projection_proc_error(ctx, thread_factory=create_journal, append_event=append_event)
    journal_recall_ready(ctx, '/api/v1/workspace/journals/' + entry['id'], marker)
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    workspace_open(ctx, entry['name'])
    surface = browser.frame.locator('chestor-journal[entry-id="' + entry['id'] + '"][mode="full"]')
    surface.get_by_role('button', name='Recall lens', exact=True).click()
    query = surface.get_by_role('textbox', name='Search this journal graph', exact=True)
    query.fill(marker)
    query.press('Enter')
    expect(surface.locator('.jr-view')).to_contain_text(marker, timeout=30000)
    browser.screenshot('projection-refused-observer-journal')


REGISTRY.append(Scenario('regression_projection_retry_ui', 'full', regression_projection_retry_ui, ('core_personal_agent',),
    instance_setup=True, issues=('B03', 'T16'), features=http('core', 'POST /api/v1/threads/{id}/projections',
        'GET /api/v1/threads/{id}/projections', 'GET /api/v1/job-runs', 'GET /api/v1/jobs')))


from shell_vendor import shell_origin_only, shell_vendor_build

REGISTRY += [
    Scenario('shell_vendor_build', 'regression', shell_vendor_build, issues=('EE2-2576', 'SHELL-VENDOR-ICONS-001')),
    Scenario('shell_origin_only', 'regression', shell_origin_only, ('core_personal_agent', 'shell_vendor_build'),
             issues=('EE2-2576', 'SHELL-VENDOR-HOST-001', 'SHELL-VENDOR-ICONS-001')),
]
