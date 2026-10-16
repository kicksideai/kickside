"""Sessions actions through the desktop panel, mobile drawer, and component surface."""
from functools import partial
import uuid

from playwright.sync_api import expect

from browser import ASSISTANT_TEXT
from harness import Scenario, require
from scenarios import nav


def sessions_flow_ready(ctx):
    inst, browser = ctx.inst, ctx.browser_check()
    users = {'admin': {'email': inst.email, 'token': inst.token, 'agent': ctx.state['agent']}}
    email = 'sessions-member-' + uuid.uuid4().hex[:10] + '@smoke.example'
    created = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Sessions Member', 'groups': ['app.security:members']}, expect=(201,), label='sessions-member')
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
        auth='', label='sessions-member-token')['token']
    inst.redactor.add(token)
    users['member'] = {'email': email, 'token': token, 'id': created['user']['user_id']}
    for role, user in users.items():
        browser.login(user['email'], inst.password)
        if role == 'member':
            onboarding = browser.frame.locator('kickside-agent-onboarding')
            onboarding.get_by_label('Agent name', exact=True).fill('Northwind Sessions Member Assistant')
            with browser.page.expect_response(lambda r: '/api/v1/user-agents' in r.url and r.request.method == 'POST') as response:
                onboarding.get_by_role('button', name='Create agent', exact=True).click()
            require(response.value.status == 200, 'Member onboarding does not create its agent')
            user['agent'] = response.value.json()['component_id']
        else:
            browser.open_chat(user['agent'])
        browser.frame.locator('wippy-chat').get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)
        user['history'] = 'NW-SESSIONS-HISTORY-' + role.upper()
        browser.stream('Give twelve numbered fictional Northwind office tasks, two sentences each. End with ' + user['history'] + '.',
            user['history'], 'sessions-seed-' + role)
        user['session'] = browser.current_session()
        user['title'] = 'Northwind Sessions ' + role + ' history'
        inst.request('POST', '/api/v1/sessions/rename', {'session_id': user['session'], 'title': user['title']},
            auth=user['token'], label='sessions-seed-title-' + role)
        user['saved'] = inst.request('GET', '/api/v1/sessions/get?session_id=' + user['session'],
            auth=user['token'], label='sessions-seed-' + role)['session']
        user['agent_title'] = inst.request('GET', '/api/v1/user-agents/' + user['agent'],
            auth=user['token'], label='sessions-agent-' + role)['agent']['title']
    config = inst.request('GET', '/api/v1/nav/list?manage=1', label='sessions-nav-before')['config']
    items = config.get('custom_items') or []
    inst.request('PUT', '/api/v1/nav/config', {'custom_items': items + [{
        'id': 'sessions-manager-proof', 'label': 'Session manager', 'path': '/session-manager',
        'route_name': 'session-manager', 'render': 'component', 'component_tag': 'kickside-sessions',
    }]}, label='sessions-manager-mount')
    ctx.state['sessions_flow_users'] = users
    browser.login()


def mounted_sessions(ctx, mount):
    browser = ctx.browser_check()
    browser.page.set_viewport_size({'width': 1440, 'height': 900})
    if mount == 'manager':
        nav(ctx, 'Session manager')
        panel = browser.frame.locator('.surface-buffer--top kickside-sessions')
    else:
        nav(ctx, 'Sessions')
        if mount == 'drawer':
            browser.page.set_viewport_size({'width': 390, 'height': 844})
            browser.frame.get_by_role('button', name='Open sessions', exact=True).click()
        panel = browser.frame.locator('.sessions-panel kickside-sessions')
    expect(panel).to_be_visible(timeout=30000)
    return panel


def flow(ctx, mount, role, action):
    inst, browser = ctx.inst, ctx.browser_check()
    user = ctx.state['sessions_flow_users'][role]
    browser.page.set_viewport_size({'width': 1440, 'height': 900})
    browser.login(user['email'], inst.password)
    panel = mounted_sessions(ctx, mount)
    before = inst.request('GET', '/api/v1/sessions?limit=100', auth=user['token'], label='sessions-before-action')['sessions']
    before_ids = {row['session_id'] for row in before}
    seed_messages = inst.request('GET', '/api/v1/sessions/messages?session_id=' + user['session'],
        auth=user['token'], label='sessions-history-before')['messages']
    label = 'sessions-' + '-'.join((mount, role, action))
    browser.screenshot(label + '-before', full_page=False)
    if action == 'new':
        panel.get_by_role('button', name='New chat', exact=True).click()
        chat = browser.frame.locator('wippy-chat')
        expect(chat.get_by_role('button', name='Select Agent', exact=True)).to_be_visible(timeout=30000)
        chat.get_by_role('button', name='Select Agent', exact=True).click()
        chat.get_by_text(user['agent_title'], exact=True).click()
        chat.get_by_role('button', name='Start Chat', exact=True).click()
    else:
        row = panel.locator('.kx-row').filter(has_text=user['title'])
        if action == 'resume':
            row.locator('.kx-row-main').click()
        else:
            row.get_by_role('button', name='Session actions', exact=True).click()
            row.get_by_role('menuitem', name='Restart as new chat', exact=True).click()
    chat = browser.frame.locator('wippy-chat')
    expect(chat.get_by_placeholder('Type a message', exact=True)).to_be_visible(timeout=30000)
    sid = browser.current_session()
    if action == 'resume':
        require(sid == user['session'], 'Resume changes the selected durable session')
        inst.wait(lambda: user['history'] in chat.evaluate(ASSISTANT_TEXT), 'Resume shows persisted history',
            seconds=30, pump=browser.page.wait_for_timeout)
    else:
        require(sid not in before_ids, 'New/restart reuses an existing durable session')
        require(user['history'] not in chat.evaluate(ASSISTANT_TEXT), 'Fresh chat inherits the source history')
    marker = 'NW-SESSIONS-' + '-'.join((mount, role, action)).upper()
    browser.stream('Give twelve numbered fictional Northwind office tasks, two sentences each. End with ' + marker + '.',
        marker, label + '-reply')
    messages = inst.request('GET', '/api/v1/sessions/messages?session_id=' + sid,
        auth=user['token'], label='sessions-persisted-reply')['messages']
    require(any(m['type'] == 'assistant' and marker in str(m.get('data')) for m in messages), 'Streamed reply does not persist')
    after = inst.request('GET', '/api/v1/sessions?limit=100', auth=user['token'], label='sessions-after-action')['sessions']
    fresh = {r['session_id'] for r in after} - before_ids
    require(fresh == (set() if action == 'resume' else {sid}), 'Sessions action creates the wrong number of durable sessions')
    saved = inst.request('GET', '/api/v1/sessions/get?session_id=' + sid,
        auth=user['token'], label='sessions-current')['session']
    if action == 'restart':
        for field in ('current_agent', 'current_model'):
            require(saved[field] == user['saved'][field], 'Restart changes ' + field)
    elif action == 'new':
        require(saved['current_agent'] == 'user_agent:' + user['agent'], 'New chat does not use its selected agent')
    require(sum(m['type'] == 'user' for m in messages) == (sum(m['type'] == 'user' for m in seed_messages) + 1 if action == 'resume' else 1),
        'Chat duplicates or loses user messages')
    if action != 'resume':
        retained = inst.request('GET', '/api/v1/sessions/messages?session_id=' + user['session'],
            auth=user['token'], label='sessions-source-preserved')['messages']
        require(retained == seed_messages, 'Starting a fresh chat changes source history')
    browser.screenshot(label + '-reply', full_page=False)
    inst.evidence.save(label + '-result', {'mount': mount, 'role': role, 'action': action,
        'session_id': sid, 'current_agent': saved['current_agent'], 'current_model': saved['current_model'],
        'fresh_sessions': sorted(fresh), 'streamed_marker': marker})
    browser.clean(0)


REGISTRY = [Scenario('sessions_flow_ready', 'full', sessions_flow_ready, ('first_agent',), True, instance_setup=True,
                     issues=('SECURITY-SCOPE-PROJECTION-LIVENESS',))]
for mount in ('route', 'drawer', 'manager'):
    for role in ('admin', 'member'):
        for action in ('new', 'resume', 'restart'):
            REGISTRY.append(Scenario('sessions_' + '_'.join((mount, role, action)), 'full', partial(flow, mount=mount, role=role, action=action),
                ('sessions_flow_ready',), True, issues=('SESSIONS-NEW-CHAT-MOUNT-INTENT', 'SESSIONS-MANAGER-NEW-CHAT-ACTION') if action == 'new' and mount == 'manager' else (), features=('kickside/sessions|navigation|kickside.sessions:nav_item',) +
                (('kickside/sessions|http|POST /api/v1/sessions/start-token',) if action == 'restart' else ())))
