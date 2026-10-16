"""Published ordinary-human responders retain admitted conversations through Hub updates."""
import json

from channel_bot_ingress import DiscordChannel, SlackChannel
from harness import Scenario, require
from scenarios import nav
from scenarios_agent_background import model_tool_fixture
from scenarios_bot_channel import provider_wire_fixture
from scenarios_hot_update_work import database_rows
from scenarios_published_run_as import REGISTRY as PUBLISHED, browser_published_human_automation_update, install_source_through_hub_ui
from scenarios_selected_install import _identity


def activation_body(row):
    body = row['body']
    return json.loads(body) if isinstance(body, str) else body


def require_activation_continuity(original, current):
    require(original and current, 'Provider activation evidence is absent')
    original_by_id = {row['id']: row for row in original}
    current_by_id = {row['id']: row for row in current}
    require(len(original_by_id) == len(original) and len(current_by_id) == len(current),
            'Provider activation identifiers are duplicated')
    require(all(current_by_id.get(id) == row for id, row in original_by_id.items()),
            'Provider loses or rewrites an original activation reference')
    fields = ('session_id', 'thread_id', 'route_key')
    body = activation_body(original[0])
    require(all(isinstance(body.get(field), str) and body[field] for field in fields),
            'Original provider conversation coordinates are absent')
    coordinates = tuple(body[field] for field in fields)
    require(all(tuple(activation_body(row).get(field) for field in fields) == coordinates
                for row in original + current), 'Provider rotates its original session, thread or route')


def _published_channel(ctx, provider):
    state = {'effects': [], 'history': [], 'deliveries': []}

    def setup(fixture):
        inst = fixture.inst
        tools = model_tool_fixture(fixture, allow_groups=['app.security:admin'])
        wire = provider_wire_fixture(fixture, provider)
        title = 'Existing human ' + wire.title + ' responder ' + tools['suffix']
        agent = inst.request('POST', '/api/v1/user-agents', {'title': title + ' analyst',
            'description': 'Original installed responder provider proof',
            'prompt': 'Use each configured recording tool exactly once and report both results.',
            'model': tools['model'], 'tools': [tools['namespace'] + ':effect', tools['namespace'] + ':human_effect'],
            'traits': []})['component_id']
        connection = inst.request('POST', '/api/v1/connections', {'impl_id': wire.impl,
            'name': title + ' connection', 'private_context': wire.private_context, 'validate': True})['component_id']
        root = inst.request('POST', '/api/v1/automations', {'type': 'kickside.channel.responder:channel_responder',
            'input': {'title': title, 'connection_id': connection, 'channel_id': 'NW',
                'channel_name': 'northwind-orders', 'agent_id': agent, 'target': 'channel',
                'response_policy': {'mode': 'immediate'}}})['id']
        state.update(wire=wire, tools=tools, title=title, agent=agent, connection=connection, root=root)

    def configuration(inst):
        tools = state['tools']
        return {'agent': inst.request('GET', '/api/v1/user-agents/' + state['agent'])['agent'],
            'automation': database_rows(inst, "SELECT component_id,impl_id,CAST(private_context AS TEXT) AS private_context,context_revision,identity_generation,identity_hash FROM kickside_components WHERE component_id='" + state['root'] + "'"),
            'identity': _identity(inst, state['root']),
            'audit': database_rows(inst, "SELECT identity_generation,CAST(record_json AS TEXT) AS record_json FROM kickside_execution_identity_audit WHERE component_id='" + state['root'] + "' ORDER BY identity_generation"),
            'connection': database_rows(inst, "SELECT component_id,impl_id,CAST(private_context AS TEXT) AS private_context,created_at,context_revision FROM kickside_components WHERE component_id='" + state['connection'] + "'"),
            'profile': database_rows(inst, "SELECT id,name,provider_id,config_json,secret_json,enabled,created_at,updated_at FROM kickside_model_provider_profiles WHERE id='" + tools['profile'] + "'"),
            'card': database_rows(inst, "SELECT * FROM kickside_model_cards WHERE name='" + tools['model'] + "'")}

    def effects(inst):
        return database_rows(inst, 'SELECT effect_id,root,actor_id,identity_json,action FROM ' + state['tools']['table'] + ' ORDER BY effect_id')

    def activations(inst):
        return [row for row in inst.request('GET', '/api/v1/threads/' + state['root'] + '/events')['events']
                if row['type'].endswith(':session.activated')]

    def history(inst, conversation):
        return database_rows(inst, "SELECT id,type,CAST(body AS TEXT) AS body,seq FROM kickside_event WHERE thread_id='" + conversation + "' ORDER BY seq")

    def observe(fixture, phase):
        from playwright.sync_api import expect
        if phase == 'before_restart':
            return
        inst, wire = fixture.inst, state['wire']
        current = configuration(inst)
        if phase == 'baseline':
            state['actor'] = inst.request('GET', '/api/v1/user/me')['user']['id']
            state['configuration'] = current
            identity = current['identity'][0]
            require(identity['principal'] == identity['authorized_by'] == {'kind': 'user', 'id': state['actor']},
                    'Published responder substitutes its configuring human')
            require(len(current['connection']) == len(current['profile']) == 1 and current['profile'][0]['secret_json'],
                    'Published responder has no original connection context or encrypted model credential')
        else:
            require(current == state['configuration'], 'Update changes original responder/Agent/configuration/identity/audit/provider credentials/model card')
            require_activation_continuity(state['activation'], activations(inst))
            retained = history(inst, state['conversation'])
            require(retained[:len(state['history'])] == state['history'], 'Update rewrites or removes original conversation history')
        require(effects(inst) == state['effects'], 'Update loses or adds an original responder effect')
        browser = fixture.browser_check()
        trace = inst.root / inst.evidence.label / (wire.provider + '-published-' + phase + '-trace.zip')
        trace.parent.mkdir(parents=True, exist_ok=True)
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            nav(fixture, 'Automations')
            row = browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=state['title'])
            expect(row).to_be_visible(timeout=30000)
            require('Unavailable' not in row.inner_text(), 'Updated browser parks the original responder')
            inst.wait(wire.ready, 'One original authenticated provider subscription is ready', seconds=60,
                      pump=browser.page.wait_for_timeout)
            subscription = wire.authentication()
            for turn in range(2):
                before, posts = effects(inst), wire.posts()
                event, external_id = wire.event('Record both original effects after ' + phase + ' turn ' + str(turn))
                wire.send(event)
                def delivered():
                    rows = effects(inst)
                    require({item['effect_id'] for item in before} <= {item['effect_id'] for item in rows},
                            'Provider loses an original effect receipt')
                    require(len(rows) <= len(before) + 2 and len(wire.posts()) <= len(posts) + 1,
                            'One provider delivery duplicates an effect or reply')
                    if len(rows) != len(before) + 2 or len(wire.posts()) != len(posts) + 1:
                        return None
                    admitted = activations(inst)
                    if not admitted:
                        return None
                    conversation = activation_body(admitted[0])['thread_id']
                    reference = wire.reply_reference(wire.posts()[-1])
                    transcript = history(inst, conversation)
                    receipts = [item for item in transcript if item['type'].endswith(':reply.sent')
                                and str(json.loads(item['body']).get('message_ref')) == reference]
                    require(len(receipts) <= 1, 'One provider reply commits duplicate durable receipts')
                    return rows if len(receipts) == 1 else None
                rows = inst.wait(delivered, 'Original provider turn records both native effects and one admitted reply',
                                 seconds=120, pump=browser.page.wait_for_timeout)
                added = [item for item in rows if item['effect_id'] not in {item['effect_id'] for item in before}]
                require({item['action'] for item in added} == {'agent.effect', 'agent.human_effect'},
                        'Provider omits an original configured Agent tool')
                for item in rows:
                    require(item['actor_id'] == state['actor'] and item['root'] == state['root']
                            and json.loads(item['identity_json']) == state['configuration']['identity'][0],
                            'Provider/session/tool frame changes original executor/authorizer/root/restrictions')
                wire.assert_reply(wire.posts()[-1])
                admitted = activations(inst)
                if phase == 'baseline' and turn == 0:
                    require(len(admitted) == 1, 'Baseline provider turn has no unique admitted conversation')
                    state['activation'] = admitted
                    activation = activation_body(admitted[0])
                    state['conversation'] = activation['thread_id']
                require_activation_continuity(state['activation'], admitted)
                transcript = history(inst, state['conversation'])
                require(transcript[:len(state['history'])] == state['history'], 'Provider turn rewrites original history')
                require(len([item for item in transcript if item['type'].endswith(':message.inbound')
                             and external_id in item['body']]) == 1, 'Provider delivery has no unique durable admitted inbound')
                wire.send(event)
                wire.acknowledgement()
                browser.page.wait_for_timeout(1500)
                require(effects(inst) == rows and len(wire.posts()) == len(posts) + 1
                        and history(inst, state['conversation']) == transcript,
                        'Replayed original delivery duplicates effects, reply or durable history')
                state.update(effects=rows, history=transcript)
                state['deliveries'].append(external_id)
            browser.clean(0)
            browser.screenshot(wire.provider + '-published-' + phase)
            inst.evidence.save(wire.provider + '-published-' + phase, {'configuration': current,
                'effects': state['effects'], 'activation': state['activation'], 'history': state['history'],
                'deliveries': state['deliveries'], 'subscription': subscription, 'replies': wire.posts(),
                'model_requests': fixture.fixtures.requests('openai-tools')})
        finally:
            inst.evidence.save(wire.provider + '-published-progress-' + phase, {'effects': effects(inst),
                'replies': wire.posts(), 'model_requests': fixture.fixtures.requests('openai-tools'),
                'activation': activations(inst), 'original_activation': state.get('activation', []),
                'history': history(inst, state['conversation']) if 'conversation' in state else [],
                'original_history': state['history']})
            browser.context.tracing.stop(path=str(trace))
            inst.evidence.paths.append(str(trace))

    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui,
        setup=setup, observe=observe, modules=('kickside/agents', 'kickside/models', 'kickside/connection',
                                             'kickside/channel', 'kickside/' + provider.provider))


def browser_published_discord_responder_hub_ui_update(ctx):
    _published_channel(ctx, DiscordChannel)


def browser_published_slack_responder_hub_ui_update(ctx):
    _published_channel(ctx, SlackChannel)


REGISTRY = [Scenario('browser_published_discord_responder_hub_ui_update', 'regression',
    browser_published_discord_responder_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-B16', 'RA-C05', 'BOT-PUBLISHED-PROVIDER-CONVERSATION-CONTINUITY', 'SMOKE-PUBLISHED-PROVIDER-ACTIVATION-PROOF', 'UPSTREAM-KEEPER-HUB-BROWSE-RESPONSE-ORDER')),
    Scenario('browser_published_slack_responder_hub_ui_update', 'regression',
    browser_published_slack_responder_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-B16', 'RA-C06', 'BOT-PUBLISHED-PROVIDER-CONVERSATION-CONTINUITY', 'SMOKE-PUBLISHED-PROVIDER-ACTIVATION-PROOF', 'UPSTREAM-KEEPER-HUB-BROWSE-RESPONSE-ORDER'))]
