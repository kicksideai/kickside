"""Bot selection on the existing responder owner crosses real provider ingress."""
import json
import uuid
import yaml

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from channel_bot_ingress import DiscordChannel, SlackChannel
from scenarios_agent_background import _fixture, _effects
from scenarios_bot_root_isolation import _state
from scenarios_delegation_ui import _automation
from scenarios_hot_update_work import database_rows
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity
from scenarios_providers import wait_for_provider


def provider_wire_fixture(ctx, provider, *, auth=None):
    inst = ctx.inst
    inst.install('kickside/channel')
    wire = provider(ctx)
    origin = wire.origin
    inst.cleanup.add('channel provider fixture', ctx.fixtures.stop)
    with ctx.paused():
        directory = inst.app / ('src/channel-egress-' + uuid.uuid4().hex[:12])
        directory.mkdir()
        entries = [
            {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'resources': [origin + '/*'], 'actions': ['http_client.request'], 'effect': 'allow'}},
            {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'resources': ['127.0.0.1'], 'actions': ['http_client.private_ip'], 'effect': 'allow'}},
        ]
        (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'smoke.channel_egress',
                                                             'entries': entries}, sort_keys=False))
    inst.install('kickside/' + provider.provider,
                 parameters=[{'name': name, 'value': value} for name, value in wire.endpoints.items()])
    discovered = wait_for_provider(inst, wire.impl, auth=auth)
    inst.evidence.save(wire.provider + '-connection-discovery-ready', discovered)
    return wire


def _channel_fixture(ctx, provider):
    inst = ctx.inst
    fixture = _fixture(ctx)
    wire = provider_wire_fixture(ctx, provider, auth=fixture['token'])
    token = fixture['token']
    connection = inst.request('POST', '/api/v1/connections', {'impl_id': wire.impl,
        'name': wire.title + ' selected execution', 'private_context': wire.private_context, 'validate': True},
        auth=token)['component_id']
    def cleanup_connection():
        fresh = inst.request('POST', '/api/public/user/token',
            {'email': fixture['member']['email'], 'password': inst.password}, auth='')['token']
        inst.redactor.add(fresh)
        inst.request('DELETE', '/api/v1/connections/' + connection, auth=fresh)
    inst.cleanup.add(wire.title + ' selected connection', cleanup_connection)
    inst.request('POST', '/api/v1/component-access/share/' + connection,
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 3}, auth=token)
    title = wire.title + ' selected responder ' + uuid.uuid4().hex[:10]
    root = inst.request('POST', '/api/v1/automations', {'type': 'kickside.channel.responder:channel_responder',
        'input': {'title': title, 'connection_id': connection, 'channel_id': 'NW', 'channel_name': 'northwind-orders',
                  'agent_id': fixture['agent'], 'target': 'channel', 'response_policy': {'mode': 'immediate'}}},
        auth=token)['id']
    inst.cleanup.add(wire.title + ' selected responder', lambda: inst.request('DELETE', '/api/v1/automations/' + root, auth=token))
    inst.request('POST', '/api/v1/component-access/share/' + root,
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 3}, auth=token)
    fixture.update(root=root, connection=connection, responder_title=title, wire=wire)
    return fixture


def _browser_bot_channel(ctx, provider):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixture = _channel_fixture(ctx, provider)
    root = fixture['root']
    wire = fixture['wire']
    original, generation = _identity(inst, root)
    require(original['principal'] == original['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']},
            'Existing responder installation changes its configuring identity')
    browser = ctx.browser_check()
    login_member(ctx, fixture['member'])
    trace = inst.root / inst.evidence.label / (provider.provider + '-bot-execution-trace.zip')
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        manager, editor, picker = _automation(ctx, fixture['responder_title'])
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_have_count(0)
        path = '/api/v1/automations/' + root + '/identity'
        inst.request('POST', path, {'principal': fixture['grant']['principal'], 'request_id': uuid.uuid4().hex,
                     'expected_identity_generation': generation}, auth=fixture['token'], expect=(403,))
        require(_identity(inst, root) == (original, generation) and not _effects(inst, fixture),
                'Ungrant responder submission changes authority or executes')
        delegation = {**fixture['grant'], 'root': root}
        inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
        inst.cleanup.add(wire.title + ' root delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': delegation['principal'], 'root': root, 'operation_id': uuid.uuid4().hex}))
        picker.get_by_role('combobox', name='Run as', exact=True).press('Escape')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        before = _state(inst, [fixture], effects=_effects)
        provider_posts = wire.posts()
        model_requests = ctx.fixtures.requests('openai-tools')
        inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': delegation['principal'], 'root': root, 'operation_id': uuid.uuid4().hex})
        require(not inst.request('GET', '/api/v1/users/run-as-candidates?component_id=' + root,
            auth=fixture['token'])['candidates'], 'Revoked responder delegation leaves a selectable bot')
        with browser.rejection('POST', path, 403) as refused:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        expect(editor.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(editor.get_by_role('status')).to_have_count(0)
        refused_payload = refused.value.request.post_data_json
        require(refused_payload['principal'] == delegation['principal']
            and refused_payload['expected_identity_generation'] == generation,
            'Stale responder form substitutes the pending bot or generation')
        require(_state(inst, [fixture], effects=_effects) == before and wire.posts() == provider_posts
            and ctx.fixtures.requests('openai-tools') == model_requests,
            'Refused stale responder selection changes protected state or performs provider work')
        browser.clean(0)
        browser.screenshot(provider.provider + '-stale-bot-selection-refused')
        inst.evidence.save(provider.provider + '-stale-picker-refusal', {
            'payload': refused_payload, 'protected': before, 'provider_posts': provider_posts,
            'model_requests': model_requests, 'status': refused.value.status})
        inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
        replay = inst.request('POST', path, refused_payload, auth=fixture['token'], expect=(403,))
        require(replay.get('success') is False and _state(inst, [fixture], effects=_effects) == before,
                'Restored grant rewrites a refused command outcome or its protected state')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name='Me', exact=True).click()
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('state') == 'succeeded',
                'Responder picker does not commit its native owner command')
        saved_payload = response.value.request.post_data_json
        require(saved_payload['principal'] == refused_payload['principal']
            and saved_payload['expected_identity_generation'] == refused_payload['expected_identity_generation']
            and saved_payload['request_id'] != refused_payload['request_id'],
            'Fresh responder selection changes the bot or generation, or reuses a refused command id')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        identity, selected_generation = _identity(inst, root)
        require(identity['principal'] == delegation['principal'] and identity['authorized_by'] == original['authorized_by']
                and identity['component_id'] == root and selected_generation == generation + 1,
                'Responder selection changes its bot, human authorizer or protected root')
        browser.clean(0)
        browser.screenshot(provider.provider + '-owner-selects-bot')
        inst.wait(wire.ready, 'One authenticated ' + wire.title + ' subscription is ready', seconds=60,
                  pump=browser.page.wait_for_timeout)
        subscription = wire.authentication()
        posts = wire.posts
        before = len(posts())
        event, external_id = wire.event('Record the selected execution effect')
        wire.send(event)
        try:
            inst.wait(lambda: len(_effects(inst, fixture)) == 1 and len(posts()) == before + 1,
                      'Selected provider turn records its real bot tool effect and admitted reply', seconds=120,
                      pump=browser.page.wait_for_timeout)
        finally:
            inst.evidence.save(provider.provider + '-selected-progress', {'effects': _effects(inst, fixture), 'posts': posts(),
                'model_requests': ctx.fixtures.requests('openai-tools'),
                'state': inst.request('GET', '/api/v1/automations/' + root + '/state', auth=fixture['token'])})
        effects = _effects(inst, fixture)
        carried = json.loads(effects[0]['identity_json'])
        require(effects[0]['actor_id'] == fixture['bot'] and effects[0]['root'] == root and carried == identity,
                'Provider Channel/session/tool frame substitutes its bot, authorizer or root')
        reply = posts()[before:]
        require(len(reply) == 1, 'Selected provider turn produces no unique admitted conversation reply')
        wire.assert_reply(reply[0])
        audits = database_rows(inst, "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='"
                               + root + "' ORDER BY identity_generation")
        require(len(audits) == 2 and int(audits[-1]['identity_generation']) == selected_generation,
                'Responder selection duplicates or loses its identity audit')
        audit = json.loads(audits[-1]['record_json'])
        require(audit['authorizer'] == 'user:' + fixture['member']['user_id'] and audit['new_principal'] == 'user:' + fixture['bot']
                and fixture['token'] not in json.dumps(audits), 'Responder audit changes authority or contains a bearer')
        events = inst.request('GET', '/api/v1/threads/' + root + '/events', auth=fixture['token'])['events']
        activated = [row for row in events if row['type'].endswith(':session.activated')]
        require(len(activated) == 1, 'One provider turn starts more than one admitted session')
        activation = activated[0]['body']
        if isinstance(activation, str): activation = json.loads(activation)
        conversation = activation['thread_id']
        inst.request('GET', '/api/v1/threads/' + conversation + '/events', auth=fixture['token'], expect=(403,))
        transcript = database_rows(inst, "SELECT type,body FROM kickside_event WHERE thread_id='" + conversation + "' ORDER BY seq")
        inbound = [row for row in transcript if row['type'].endswith(':message.inbound')
                   and external_id in str(row['body'])]
        require(len(inbound) == 1, 'Authenticated ingress has no unique durable admitted inbound event')
        later, later_id = wire.event('Record the next admitted execution effect')
        later.update(principal=original['principal'], authorized_by=delegation['principal'], component_id=str(uuid.uuid4()),
                     execution_identity=original)
        wire.send(later)
        inst.wait(lambda: len(_effects(inst, fixture)) == 2 and len(posts()) == before + 2,
                  'A later authenticated turn ignores forged payload authority and retains the admitted bot', seconds=120,
                  pump=browser.page.wait_for_timeout)
        later_effects = _effects(inst, fixture)
        require(all(row['actor_id'] == fixture['bot'] and row['root'] == root
                    and json.loads(row['identity_json']) == identity for row in later_effects),
                'Inbound provider fields choose another executor, authorizer or root')
        wire.send(later)
        browser.page.wait_for_timeout(1500)
        require(_effects(inst, fixture) == later_effects and len(posts()) == before + 2,
                'Replayed provider delivery repeats its effect or outbound reply')
        acknowledgement = wire.acknowledgement()
        later_inbound = database_rows(inst, "SELECT type,body FROM kickside_event WHERE thread_id='" + conversation + "' ORDER BY seq")
        require(len([row for row in later_inbound if row['type'].endswith(':message.inbound') and later_id in str(row['body'])]) == 1,
                'Later provider delivery or replay loses or duplicates its durable inbound event')
        later_events = inst.request('GET', '/api/v1/threads/' + root + '/events', auth=fixture['token'])['events']
        require(len([row for row in later_events if row['type'].endswith(':session.activated')]) == 1,
                'Later or replayed turn rotates the selected bot session')
        browser.clean(0)
        browser.screenshot(provider.provider + '-real-bot-tool-and-reply')
        inst.evidence.save(provider.provider + '-bot-execution-proof', {'identity': identity, 'effects': effects, 'reply': reply,
            'later_effects': later_effects, 'later_replies': posts()[before:], 'audits': audits, 'subscription': subscription, 'acknowledgement': acknowledgement, 'activation': activation, 'inbound': inbound})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


def browser_discord_bot_execution(ctx):
    with isolated_fixture(ctx) as fixture:
        _browser_bot_channel(fixture, DiscordChannel)


def browser_slack_bot_execution(ctx):
    with isolated_fixture(ctx) as fixture:
        _browser_bot_channel(fixture, SlackChannel)


REGISTRY = [Scenario('browser_discord_bot_execution', 'regression', browser_discord_bot_execution,
                     ('boot',), instance_setup=True,
                     issues=('SMOKE-PROVIDER-DISCOVERY-READINESS', 'BOT-CHANNEL-STALE-PICKER-REVOCATION', 'RA-B10', 'USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-CHANNEL-PROVIDER-EXECUTION', 'RA-B06', 'RA-B09', 'RA-H50', 'RA-H51', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY'))]


def channel_bot_identity_boundaries(ctx):
    from module_harness import run_focused_module_test
    for entry in ['receive_test', 'registry_authority_test', 'bridge_policy_test', 'execution_authority_test', 'identity_unlink_gc_test']:
        run_focused_module_test(ctx, 'kickside/channel', entry)


REGISTRY += [Scenario('channel_bot_identity_boundaries', 'regression', channel_bot_identity_boundaries,
                     issues=('BOT-CHANNEL-PROVIDER-EXECUTION', 'CHANNEL-HARNESS-IDENTITY-DEPENDENCIES', 'RA-H41', 'RA-H42', 'RA-H43', 'RA-H44'))]

REGISTRY += [Scenario('browser_slack_bot_execution', 'regression', browser_slack_bot_execution, ('boot',), instance_setup=True,
                      issues=('SMOKE-PROVIDER-DISCOVERY-READINESS', 'BOT-CHANNEL-STALE-PICKER-REVOCATION', 'RA-B10', 'USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-CHANNEL-PROVIDER-EXECUTION', 'RA-B07', 'RA-B09', 'RA-H50', 'RA-H51', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY'))]
