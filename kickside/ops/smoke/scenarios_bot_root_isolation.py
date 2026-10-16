"""Explicit group and root grants isolate ordinary User bot selection."""
import json
import uuid

from harness import Scenario, require
from scenarios import Context
from runtime_fixtures import complete_splashes
from scenarios_delegation_ui import _automation
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _effects, _drive, _proof
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def _state(inst, fixtures, *, effects=_effects):
    return [{
        'component': database_rows(inst, "SELECT CAST(private_context AS TEXT) AS private_context,identity_generation,identity_hash,context_revision FROM kickside_components WHERE component_id='" + fixture['root'] + "'"),
        'audit': database_rows(inst, "SELECT identity_generation,request_id,record_json FROM kickside_execution_identity_audit WHERE component_id='" + fixture['root'] + "' ORDER BY identity_generation"),
        'effects': effects(inst, fixture),
        'drive': _drive(inst, fixture['root']),
    } for fixture in fixtures]


def browser_bot_group_root_isolation(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_bot_group_root_isolation(fixture)


def _browser_bot_group_root_isolation(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixtures = []
    for _ in range(2):
        suffix = uuid.uuid4().hex[:10]
        bot = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Partition bot ' + suffix,
            'groups': ['app.security:admin']}, expect=(201,))['user']
        bot_id = bot['user_id']
        inst.cleanup.add('partition bot ' + bot_id,
            lambda bot_id=bot_id: inst.request('DELETE', '/api/v1/users/' + bot_id, expect=(202,)))
        fixture = _fixture(ctx, bot_id=bot_id, title='Partition task ' + suffix)
        fixture['title'] = 'Partition task ' + suffix
        _grant(inst, fixture)
        fixtures.append(fixture)
    require(len({value['bot'] for value in fixtures}) == 2
            and len({value['member']['user_id'] for value in fixtures}) == 2
            and len({value['root'] for value in fixtures}) == 2
            and not set(fixtures[0]['delegation']['groups']) & set(fixtures[1]['delegation']['groups']),
            'Isolation fixtures share a bot, authorizer, root or operator group')
    for own, peer in ((fixtures[0], fixtures[1]), (fixtures[1], fixtures[0])):
        foreign = '/api/v1/automations/' + peer['root'] + '/identity'
        refused = inst.request('GET', foreign, auth=own['token'], expect=(404,))
        require(not refused.get('identity'), 'An unshared root exposes its protected identity')
        inst.request('POST', '/api/v1/component-access/share/' + peer['root'],
            {'subject_type': 'user', 'subject_id': own['member']['user_id'], 'access_mask': 11}, auth=peer['token'])
        candidates = inst.request('GET', own['path'], auth=own['token'])
        require([row['id'] for row in candidates['candidates']] == [own['bot']],
                'Matching-root candidate discovery exposes another group bot')
        foreign_candidates = inst.request('GET', peer['path'], auth=own['token'])
        require(not foreign_candidates['candidates'], 'Root ADMIN borrows another group or another root act-as grant')
    baseline = _state(inst, fixtures)
    refusals = []
    for own, peer in ((fixtures[0], fixtures[1]), (fixtures[1], fixtures[0])):
        for root, bot, metadata in ((own['root'], peer['bot'], {}),
                                    (peer['root'], own['bot'], {}),
                                    (peer['root'], peer['bot'], {}),
                                    (own['root'], peer['bot'], {
                                        'authorized_by': {'kind': 'user', 'id': peer['member']['user_id']},
                                        'groups': peer['delegation']['groups'],
                                        'component_id': peer['root'],
                                        'execution_identity': {'principal': peer['delegation']['principal'],
                                            'authorized_by': {'kind': 'user', 'id': peer['member']['user_id']},
                                            'component_id': peer['root']}})):
            _, generation = _identity(inst, root)
            rejected = inst.request('POST', '/api/v1/automations/' + root + '/identity',
                {'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
                 'expected_identity_generation': generation, **metadata}, auth=own['token'], expect=(403,))
            require(rejected.get('state') != 'succeeded', 'Substituted bot/root/authorizer metadata selects an identity')
            require(_state(inst, fixtures) == baseline, 'Refused substitution mutates identity, audit, declaration, source or effects')
            refusals.append({'caller': own['member']['user_id'], 'root': root, 'bot': bot, 'forged_metadata': bool(metadata)})
    complete_splashes(ctx, 'welcome', 'first_agent')
    session = ctx.browser_check().session
    peers = []
    try:
        for own, foreign in ((fixtures[0], fixtures[1]), (fixtures[1], fixtures[0])):
            peer_ctx = Context(inst, browser_session=session)
            peers.append(peer_ctx)
            browser = peer_ctx.browser_check()
            login_member(peer_ctx, {**own['member'], 'email': own['email']})
            trace = inst.root / inst.evidence.label / ('bot-root-isolation-' + own['root'] + '-trace.zip')
            trace.parent.mkdir(parents=True, exist_ok=True)
            browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
            try:
                manager, editor, picker = _automation(peer_ctx, own['title'])
                picker.get_by_role('combobox', name='Run as', exact=True).click()
                expect(picker.get_by_role('option')).to_have_count(2, timeout=30000)
                expect(picker.get_by_role('option', name=foreign['label'] + ' Bot account', exact=True)).to_have_count(0)
                picker.get_by_role('option', name=own['label'] + ' Bot account', exact=True).click()
                path = '/api/v1/automations/' + own['root'] + '/identity'
                before = _state(inst, fixtures)
                forwarded = []
                def substitute(route):
                    payload = route.request.post_data_json
                    payload['principal'] = foreign['delegation']['principal']
                    forwarded.append(payload)
                    route.continue_(post_data=json.dumps(payload))
                browser.page.route('**' + path, substitute)
                try:
                    with browser.rejection('POST', path, 403):
                        editor.get_by_role('button', name='Save run-as account', exact=True).click()
                finally:
                    browser.page.unroute('**' + path, substitute)
                expect(editor.get_by_role('alert')).to_be_visible(timeout=30000)
                expect(editor.get_by_role('status')).to_have_count(0)
                require(len(forwarded) == 1 and _state(inst, fixtures) == before,
                        'A forged genuine UI submission changes state or claims success')
                browser.clean(0)
                browser.screenshot('cross-group-bot-substitution-refused')
                picker.get_by_role('combobox', name='Run as', exact=True).click()
                picker.get_by_role('option', name='Me', exact=True).click()
                picker.get_by_role('combobox', name='Run as', exact=True).click()
                picker.get_by_role('option', name=own['label'] + ' Bot account', exact=True).click()
                with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
                    editor.get_by_role('button', name='Save run-as account', exact=True).click()
                require(response.value.status == 200 and response.value.json()['state'] == 'succeeded',
                        'Matching group/root UI selection fails after a refused substitution')
                expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
                drawer = manager.locator('aside')
                drawer.get_by_role('button', name='More actions for ' + own['title'], exact=True).click()
                action = '/api/v1/automations/' + own['root'] + '/actions/run_now'
                with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(action)) as launched:
                    drawer.get_by_role('menuitem', name='Run ' + own['title'] + ' now', exact=True).click()
                require(launched.value.status == 200 and launched.value.json()['result']['state'] == 'succeeded',
                        'Matching-root browser run fails')
                rows = inst.wait(lambda: _effects(inst, own) if len(_effects(inst, own)) == 1
                    and _drive(inst, own['root'])['last_committed_occurrence_seq'] == 1 else None,
                    'Matching group/root records exactly one bot effect', seconds=60, pump=browser.page.wait_for_timeout)
                identity = _proof(inst, own, rows)
                require(_identity(inst, own['root']) == (identity, 1), 'Matching-root UI run rewrites its selected identity')
                browser.clean(0)
                browser.screenshot('matching-group-root-bot-effect')
            finally:
                browser.context.tracing.stop(path=str(trace))
                inst.evidence.paths.append(str(trace))
        inst.evidence.save('bot-group-root-isolation', {'roots': [value['root'] for value in fixtures],
            'bots': [value['bot'] for value in fixtures], 'baseline': baseline, 'refusals': refusals,
            'final': _state(inst, fixtures)})
    finally:
        for peer in peers:
            peer.close_browser()


REGISTRY = [Scenario('browser_bot_group_root_isolation', 'regression', browser_bot_group_root_isolation,
    ('boot',), instance_setup=True, issues=('SMOKE-AUTHORITY-FIXTURE-ISOLATION', 'BOT-GROUP-ROOT-ISOLATION', 'RA-H53', 'RA-H07', 'RA-H09', 'RA-B09'))]
