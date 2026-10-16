"""Deleting a provenance-only creator leaves live group authorization intact."""
import json
import uuid

from harness import Scenario, require
from runtime_fixtures import complete_splashes
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _drive, _effects, _proof
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def browser_bot_creator_deleted(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_bot_creator_deleted(fixture)


def _browser_bot_creator_deleted(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:12]
    email = 'bot-creator-' + suffix + '@smoke.example'
    creator = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Bot creator', 'groups': ['app.security:admin']}, expect=(201,))['user']
    creator_id = creator['user_id']
    creator_cleanup = inst.cleanup.add('independent bot creator',
        lambda: inst.request('DELETE', '/api/v1/users/' + creator_id, expect=(202,)))
    creator_token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='')['token']
    inst.redactor.add(creator_token)
    bot = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Creator independent bot ' + suffix,
        'groups': ['app.security:admin']}, auth=creator_token, expect=(201,))['user']
    bot_id = bot['user_id']
    inst.cleanup.add('creator independent bot', lambda: inst.request('DELETE', '/api/v1/users/' + bot_id, expect=(202,)))
    fixture = _fixture(ctx, bot_id=bot_id)
    _grant(inst, fixture)
    root, token, authorizer = fixture['root'], fixture['token'], fixture['member']['user_id']
    require(len({creator_id, authorizer, bot_id}) == 3 and fixture['bot'] == bot_id,
            'Creator-only guard substitutes an authentication fixture or its authorizer')
    path = '/api/v1/automations/' + root + '/identity'
    _, generation = _identity(inst, root)
    selected = inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot_id},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': generation}, auth=token)
    require(selected['state'] == 'succeeded', 'Independent authorizer cannot select the genuine bot')
    action = '/api/v1/automations/' + root + '/actions/run_now'
    inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=token)
    rows = inst.wait(lambda: _effects(inst, fixture) if len(_effects(inst, fixture)) == 1
        and _drive(inst, root)['last_committed_occurrence_seq'] == 1 else None,
        'Independent authorizer records the original bot effect', seconds=60)
    original = _proof(inst, fixture, rows)
    canonical = _identity(inst, root)
    account_query = "SELECT user_id,email,status,auth_generation FROM app_users WHERE user_id='" + bot_id + "'"
    marker_query = "SELECT user_id,created_by,created_at FROM app_user_bot_accounts WHERE user_id='" + bot_id + "'"
    groups_query = "SELECT group_id,source,created_at FROM app_user_groups WHERE user_id='" + bot_id + "' ORDER BY group_id,source"
    def bot_state():
        return {'account': database_rows(inst, account_query), 'marker': database_rows(inst, marker_query),
                'groups': database_rows(inst, groups_query)}
    baseline = bot_state()
    require(len(baseline['marker']) == 1 and baseline['marker'][0]['created_by'] == creator_id,
            'Real bot creation does not retain its authenticated native creator')
    ownership = inst.request('GET', '/api/v1/component-access/grants/' + root, auth=token)
    require(ownership['owner'] == authorizer, 'Deleted provenance creator owns the execution root')
    audit_query = "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation"
    audits = database_rows(inst, audit_query)
    inst.request('DELETE', '/api/v1/users/' + creator_id, expect=(202,))
    inst.wait(lambda: not database_rows(inst, "SELECT user_id FROM app_users WHERE user_id='" + creator_id + "'"),
              'Native principal cleanup removes the provenance creator', seconds=60)
    inst.cleanup.remove(creator_cleanup)
    inst.request('GET', '/api/v1/user/me', auth=creator_token, expect=(401,))
    require(bot_state() == baseline and _identity(inst, root) == canonical and _effects(inst, fixture) == rows
            and database_rows(inst, audit_query) == audits,
            'Creator deletion rewrites bot data, saved authorization or original effect/audit')
    require(inst.request('GET', '/api/v1/component-access/grants/' + root, auth=token) == ownership,
            'Creator deletion changes the independently owned root grants')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    login_member(ctx, {**fixture['member'], 'email': fixture['email']})
    trace = inst.root / inst.evidence.label / 'bot-creator-deleted-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        manager.get_by_role('tab', name='Config', exact=True).click()
        editor = manager.locator('wc-execution-identity-editor')
        picker = editor.locator('wc-run-as-picker')
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text(fixture['label'], timeout=30000)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200 and response.value.json()['state'] == 'succeeded',
                'Deleting only the creator prevents actual group-authorized bot selection')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        confirmed = _identity(inst, root)
        require(confirmed[0]['principal'] == original['principal'] and confirmed[0]['authorized_by'] == original['authorized_by']
                and confirmed[0]['component_id'] == root and confirmed[1] == canonical[1] + 1,
                'Post-deletion reauthorization replaces executor, authorizer or protected root')
        drawer = manager.locator('aside')
        drawer.get_by_role('button', name='More actions for Picker root', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(action)) as launched:
            drawer.get_by_role('menuitem', name='Run Picker root now', exact=True).click()
        require(launched.value.status == 200 and launched.value.json()['result']['state'] == 'succeeded',
                'Deleting only the creator prevents actual independently authorized execution')
        later = inst.wait(lambda: _effects(inst, fixture) if len(_effects(inst, fixture)) == 2
            and _drive(inst, root)['last_committed_occurrence_seq'] == 2 else None,
            'Post-deletion browser run records one further bot effect', seconds=60, pump=browser.page.wait_for_timeout)
        require(all(row in later for row in rows), 'Post-deletion execution rewrites the original effect')
        added = [row for row in later if row not in rows]
        require(len(added) == 1 and added[0]['actor_id'] == bot_id
                and json.loads(added[0]['identity_json']) == confirmed[0]
                and json.loads(added[0]['input_json']) == {'text': 'fixed declaration'},
                'Post-deletion execution borrows creator, worker or trigger authority')
        final_audits = database_rows(inst, audit_query)
        require(final_audits[:len(audits)] == audits and len(final_audits) == len(audits) + 1
                and json.loads(final_audits[-1]['record_json'])['authorizer'] == 'user:' + authorizer,
                'Post-deletion selection rewrites history or names the deleted creator as authorizer')
        require(bot_state() == baseline and _identity(inst, root) == confirmed,
                'Continued browser execution rewrites the bot lifecycle or selected identity')
        browser.clean(0)
        browser.screenshot('deleted-creator-independent-run')
        inst.evidence.save('bot-creator-deleted', {'creator': creator_id, 'authorizer': authorizer, 'bot': bot_id,
            'bot_state': baseline, 'original_identity': canonical, 'confirmed_identity': confirmed,
            'effects': later, 'audits': final_audits, 'ownership': ownership})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_bot_creator_deleted', 'regression', browser_bot_creator_deleted,
    ('boot',), instance_setup=True, issues=('SMOKE-AUTHORITY-FIXTURE-ISOLATION', 'BOT-CREATOR-UI-CONTINUITY', 'RA-H37', 'RA-H50', 'RA-H51'))]
