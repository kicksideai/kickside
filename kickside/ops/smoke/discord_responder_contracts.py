"""Live Discord gateway messages cross the responder identity and reply path."""
import json
import uuid
from mocks.jira_regressions import DiscordGatewayFixture

from harness import require
from runtime_fixtures import complete_splashes


def assert_responder_facts(details):
    from playwright.sync_api import expect
    page = details.page
    health = details.locator('.kx-dfact').filter(has=page.get_by_text('Health', exact=True))
    expect(health.locator('.kx-dfact-v')).to_have_text('Ready', timeout=30000)
    reply = details.locator('.kx-dfact').filter(has=page.get_by_text('Details', exact=True))
    expect(reply.locator('.kx-dfact-v')).to_have_text('Reply reaches the channel', timeout=30000)
    details.get_by_role('tab', name='Activity', exact=True).click()
    outcome = details.locator('.kx-dfact').filter(has=page.get_by_text('Last outcome', exact=True))
    expect(outcome.locator('.kx-dfact-v')).to_have_text('active', timeout=30000)
    failures = details.locator('.kx-dfact').filter(has=page.get_by_text('Failed deliveries', exact=True))
    expect(failures.locator('.kx-dfact-v')).to_have_text('0', timeout=30000)
    expect(details.get_by_text('Failed delivery', exact=True)).to_have_count(0)


def discord_gateway_responder(ctx, *, conversation_update=None):
    from scenarios import nav
    from scenarios_issue_guards import session_screen
    from scenarios_providers import configure_provider_endpoints, connect
    inst = ctx.inst
    inst.install('kickside/channel')
    inst.install('chestor/workspace')
    origin = ctx.state['provider_bases']['discord']

    ingress = DiscordGatewayFixture(origin)
    ingress.new_identity()
    token, bot_id = ingress.token, ingress.bot_id
    fixture = ingress.request
    inst.redactor.add(token)
    gateway = fixture('gateway')['url']
    configure_provider_endpoints(ctx, {'kickside.discord:endpoint_api': origin + '/api/v10',
                                       'kickside.discord:endpoint_gateway': gateway})
    ctx.restart()
    inst.manifest()
    model = inst.config['model']
    from model_fixture import live_profile
    _, cards = live_profile(ctx, 'On-prem GPU server')
    card = next(card for card in cards if card.get('provider_model') == model['llm'])
    agent = inst.request('POST', '/api/v1/user-agents', {'title': 'Northwind Discord assistant',
        'model': card['name'], 'traits': [],
        'prompt': 'Answer each human message with one short plain text sentence. Use no tools.'},
        label='discord-agent')['component_id']
    inst.cleanup.add('Discord agent', lambda: inst.request('DELETE', '/api/v1/user-agents/' + agent), scope='scenario')
    fixture('config', {'flags': 524288, 'read_status': 200, 'write_status': 200})
    cid = connect(ctx, 'Discord responder', 'kickside.discord.connection:discord_connection',
                  {'bot_token': token}, scope='scenario')
    spec = {'title': 'Northwind Discord responder', 'connection_id': cid, 'channel_id': 'NW',
            'target': 'channel', 'agent_id': agent, 'response_policy': {'mode': 'immediate'}}
    rid = inst.request('POST', '/api/v1/automations',
                       {'type': 'kickside.channel.responder:channel_responder', 'input': spec},
                       label='discord-responder-install')['id']
    base = '/api/v1/automations/' + rid
    inst.cleanup.add('Discord responder', lambda: inst.request('DELETE', base), scope='scenario')

    def state():
        return inst.request('GET', base + '/state', label='discord-responder-health')['state']

    def drive_state(expected):
        result = inst.request('POST', base + '/actions/status', {}, label='discord-responder-drive-status')
        drives = result['result']['drives']
        require(drives and any(d['drive_key'] == 'main' for d in drives), 'Responder has no main drive')
        return all(d['enabled'] == (expected == 'active') and d['phase'] == expected for d in drives)

    def reason(expected):
        value = state()
        require(value.get('health_reason') not in ('agent_run_failed', 'identity_resolution_failed') or
                value.get('health_reason') == expected, 'Responder fails: ' + str(value))
        return value if value.get('health_reason') == expected else None

    def posts():
        return [r for r in ctx.fixtures.requests('discord') if r['method'] == 'POST'
                and r['path'] == '/api/v10/channels/NW/messages']

    def send(content):
        event = {'id': str(uuid.uuid4().int), 'guild_id': 'NW', 'channel_id': 'NW',
                 'author': {'id': 'NW-human', 'username': 'Northwind Operator', 'bot': False},
                 'timestamp': '2026-10-05T12:00:00Z', 'content': '<@' + bot_id + '> ' + content,
                 'mentions': [{'id': bot_id}], 'attachments': []}
        require(fixture('message', event)['delivered'] == 1, 'One Discord bot has no unique ready gateway')
        return event

    def ready():
        connection = inst.request('GET', '/api/v1/workspace/entries/' + cid, label='discord-connection-ready')['entry']
        gateway = fixture('gateway')
        return connection.get('meta', {}).get('health_reason') == 'gateway_ready' and gateway['connections'] == 1

    inst.wait(ready, 'Discord connection gateway ready')
    require(fixture('gateway')['identifies'][-1]['intents'] == 37377, 'Gateway does not subscribe to MESSAGE CONTENT')
    start = len(posts())
    send('Northwind has 24 cartons. Confirm receipt.')
    inst.wait(lambda: reason('reply_sent'), 'Discord responder reply', seconds=120)
    sent = posts()[start:]
    require(len(sent) == 1 and sent[0]['status'] == 200 and sent[0]['body'].get('content', '').strip(),
            'An admitted Discord turn has no single durable reply: ' + str(sent))
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    session_screen(ctx)
    nav(ctx, 'Automations')
    browser.frame.get_by_role('button', name='Open ' + spec['title'] + ' details', exact=True).click()
    details = browser.frame.get_by_role('dialog', name=spec['title'], exact=True)
    details.get_by_role('tab', name='State', exact=True).click()
    assert_responder_facts(details)
    browser.screenshot('discord-gateway-visible-activity')
    details.get_by_role('button', name='Close details', exact=True).click()
    events = inst.request('GET', '/api/v1/threads/' + rid + '/events', label='discord-responder-events')
    activated = [e for e in events['events'] if e['type'].endswith(':session.activated')]
    require(len(activated) == 1, 'Responder does not record one admitted session')
    activated_body = activated[0]['body']
    conversation = (json.loads(activated_body) if isinstance(activated_body, str) else activated_body)['thread_id']
    if conversation_update is not None:
        conversation_update(ctx, conversation, send, posts, state, ingress, base)
        return
    inst.request('POST', base + '/actions/pause', {}, label='discord-responder-pause')
    inst.wait(lambda: drive_state('paused'), 'Discord responder drive pause')
    start = len(posts())
    paused_message = send('Northwind responder is paused.')
    inst.wait(lambda: reason('responder_disabled'), 'Paused responder reason')
    require(len(posts()) == start, 'A paused responder posts a reply')
    audit = inst.request('GET', '/api/v1/threads/' + conversation + '/events', label='discord-paused-audit')['events']
    witnessed = []
    for event in audit:
        body = event.get('body', {})
        body = json.loads(body) if isinstance(body, str) else body
        if body.get('external_message_id') == paused_message['id']:
            witnessed.append(event)
    require(len(witnessed) == 1 and witnessed[0]['type'].endswith(':message.inbound'),
            'A declined Discord message has no unique durable audit event')
    inst.request('POST', base + '/actions/resume', {}, label='discord-responder-resume')
    inst.wait(lambda: drive_state('active'), 'Discord responder drive resume')
    fixture('config', {'write_status': 403})
    send('Northwind reply permissions disappear.')
    inst.wait(lambda: reason('discord_permission_missing'), 'Discord reply permission reason', seconds=120)
    require(len(posts()) == start + 1 and posts()[-1]['status'] == 403, 'Discord does not retain the refused reply')
    fixture('config', {'write_status': 200})
    inst.evidence.save('discord-gateway-responder', {'state': state(), 'gateway': fixture('gateway'), 'posts': posts()})
