"""A Discord conversation crosses a real Hub update and witnesses new hub/bridge code."""
import json
import uuid
import yaml
from urllib.parse import quote

from browser import Browser
from harness import require
from discord_responder_contracts import discord_gateway_responder
from module_lifecycle_contract import update_source
from runtime_fixtures import temporary_source

MODULE = 'kickside/channel'


def channel_hot_update(ctx):
    from scenarios import nav
    inst = ctx.inst
    inst.install('kickside/discord')
    marker = uuid.uuid4().hex
    with temporary_source(ctx, MODULE) as directory:
        def update(context, conversation, send, posts, state, ingress, base):
            browser = context.browser
            logins = []
            browser.page.on('request', lambda request: logins.append(request.url)
                if '/api/public/user/token' in request.url and request.method == 'POST' else None)
            def audit():
                return inst.request('GET', '/api/v1/threads/' + conversation + '/events', label='channel-update-conversation')['events']
            def inbound(message):
                matches = []
                for event in audit():
                    body = event.get('body', {})
                    body = json.loads(body) if isinstance(body, str) else body
                    if body.get('external_message_id') == message['id'] and event['type'].endswith(':message.inbound'):
                        matches.append(event)
                require(len(matches) <= 1, 'Channel update duplicates an inbound message')
                return matches[0] if matches else None
            before = len(posts())
            message = send('The conversation remains active during the module update. Confirm once.')
            inst.wait(lambda: inbound(message), 'Second channel turn is admitted before update', seconds=35)
            pid = inst.process.pid
            log_start = (inst.root / 'runtime.log').stat().st_size
            for component, signature in [('hub', '    local function main(_args: any)\n'),
                                         ('bridge', 'local function main(args: any)\n')]:
                path = directory / 'src/service' / (component + '.lua')
                code = path.read_text()
                require(code.count(signature) == 1, 'Channel process has no unique main entry')
                code = code.replace(signature, signature + '    logger:info("hot-update-incarnation-' + marker + '-' + component + '")\n', 1)
                path.write_text(code)
            index = directory / 'src/service/_index.yaml'
            document = yaml.safe_load(index.read_text())
            entries = [entry for entry in document['entries'] if entry['kind'] == 'process.lua']
            for entry in entries:
                entry.setdefault('meta', {})['hot_update_revision'] = marker
            index.write_text(yaml.safe_dump(document, sort_keys=False))
            update_source(context, str(directory), MODULE, live=True)
            for entry in entries:
                eid = document['namespace'] + ':' + entry['name']
                applied = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(eid, safe=''), label='channel-applied-revision')['entry']
                require(applied.get('meta', {}).get('hot_update_revision') == marker, 'Hub does not apply candidate channel entry ' + eid)
            require(inst.process.pid == pid, 'Channel Hub update restarts the runtime')
            inst.wait(lambda: len(posts()) >= before + 1, 'Admitted turn replies after Hub update', seconds=120)
            ingress.send(message)
            later = send('The same conversation continues after the module update. Confirm once.')
            inst.wait(lambda: inbound(later), 'Post-update channel turn is admitted', seconds=35)
            inst.wait(lambda: len(posts()) >= before + 2, 'Post-update turn replies exactly once', seconds=120)
            require(len(posts()) == before + 2, 'Channel update duplicates an outbound reply or replays a duplicate inbound')
            events = inst.request('GET', '/api/v1/threads/' + base.rsplit('/', 1)[1] + '/events', label='channel-update-bindings')['events']
            activated = [event for event in events if event['type'].endswith(':session.activated')]
            require(len(activated) == 1, 'Channel update rotates or duplicates the admitted session')
            require(state().get('health_reason') == 'reply_sent', 'Channel update loses its reply proof or leaves a turn stuck')
            browser.reload()
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            nav(context, 'Automations')
            require(not logins and '/login' not in browser.page.url, 'Channel Hub update logs the browser out')
            inst.evidence.save('channel-update-continuity', {'runtime_pid': pid, 'conversation': conversation,
                'messages': [message['id'], later['id']], 'posts': posts(), 'activations': activated,
                'state': state(), 'browser_session_continues': True})
            def upgrades():
                with (inst.root / 'runtime.log').open('rb') as log:
                    log.seek(log_start)
                    text = log.read().decode()
                return all('hot-update-incarnation-' + marker + '-' + component in text for component in ('hub', 'bridge'))
            inst.wait(upgrades, 'Hub and bridge execute the new Hub-installed code in the active conversation', seconds=35)
            inst.evidence.save('channel-update-native-incarnations', {'hub': True, 'bridge': True, 'marker': marker})
        discord_gateway_responder(ctx, conversation_update=update)
