"""A replacement authorizer adopts through the existing fenced identity picker."""
import json
import uuid

from harness import Scenario, require
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _drive, _effects, _proof
from scenarios_selected_install import _identity


def browser_bot_authorizer_adoption(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_bot_authorizer_adoption(fixture)


def _browser_bot_authorizer_adoption(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    inst = ctx.inst
    fixture = _fixture(ctx, install_auth=inst.token, cleanup_auth=inst.token)
    _grant(inst, fixture)
    root, bot, operator = fixture['root'], fixture['bot'], fixture['member']['user_id']
    inst.request('POST', '/api/v1/component-access/share/' + root,
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 11}, auth=fixture['token'])
    path = '/api/v1/automations/' + root + '/identity'
    _, generation = _identity(inst, root)
    selected = inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': generation}, auth=fixture['token'])
    require(selected['state'] == 'succeeded', 'Original operator cannot select the bot')
    action = '/api/v1/automations/' + root + '/actions/run_now'
    inst.request('POST', action, {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
    inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'Original selected bot records its effect', seconds=60)
    original_effects = _effects(inst, fixture)
    original = _proof(inst, fixture, original_effects)
    original_identity = _identity(inst, root)
    delivery_query = "SELECT item_key,state,execution_identity_json FROM kickside_trigger_item_ledger WHERE owner_id='" + root + "' ORDER BY item_key"
    inst.wait(lambda: _drive(inst, root)['last_committed_occurrence_seq'] == 1,
              'Original successful occurrence commits its native source checkpoint', seconds=60)
    ledger = database_rows(inst, delivery_query)
    inst.evidence.save('bot-adoption-original-admission', {'identity': original_identity,
        'effects': original_effects, 'drive': _drive(inst, root), 'ledger': ledger})
    require(not ledger, 'First-attempt successful occurrence leaves failed delivery work')
    audit_query = "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation"
    original_audit = database_rows(inst, audit_query)
    admin = inst.request('GET', '/api/v1/user/me')['user']['id']
    require(admin not in (operator, bot), 'Replacement authorizer is not independent')
    ownership = inst.request('GET', '/api/v1/component-access/grants/' + root)
    require(ownership['owner'] == admin, 'Deletion fixture confuses the configuring authorizer with its owner')
    deleted = inst.request('DELETE', '/api/v1/users/' + operator, expect=(202,))
    require(deleted.get('success') is True, 'Original authorizer deletion does not complete')
    inst.cleanup.remove(fixture['member_cleanup'])
    inst.wait(lambda: not database_rows(inst, "SELECT user_id FROM app_users WHERE user_id='" + operator + "'"),
              'Native principal cleanup removes the deleted authorizer', seconds=60)
    inst.request('GET', '/api/v1/user/me', auth=fixture['token'], expect=(401,))
    inst.request('POST', action, {'request_id': uuid.uuid4().hex})
    inst.wait(lambda: _drive(inst, root)['phase'] == 'blocked_identity',
              'Deleted authorizer parks the next selected execution', seconds=60)
    require(_effects(inst, fixture) == original_effects and _identity(inst, root) == original_identity,
            'Deleting the authorizer spends bot authority or retags its identity')
    require(database_rows(inst, delivery_query) == ledger and _drive(inst, root)['event_seq'] == 2
            and _drive(inst, root)['last_committed_occurrence_seq'] == 1,
            'Blocked acquisition changes original admitted work or admits the refused occurrence')
    retained_ownership = inst.request('GET', '/api/v1/component-access/grants/' + root)
    require(retained_ownership['owner'] == ownership['owner'], 'Authorizer deletion removes the independent root owner')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    trace = inst.root / inst.evidence.label / 'bot-authorizer-adoption-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        row = manager.locator('.kx-row').filter(has_text='Picker root')
        expect(row).to_contain_text('Needs attention', timeout=30000)
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        drawer = manager.locator('aside')
        expect(drawer).to_contain_text('The account this automation runs as needs to be confirmed.', timeout=30000)
        browser.screenshot('deleted-authorizer-blocked')
        manager.get_by_role('tab', name='Config', exact=True).click()
        editor = manager.locator('wc-execution-identity-editor')
        picker = editor.locator('wc-run-as-picker')
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text(fixture['label'], timeout=30000)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('state') == 'succeeded',
                'Actual UI cannot explicitly reauthorize the same bot')
        adoption_request = response.value.request.post_data_json
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        adopted, adopted_generation = _identity(inst, root)
        require(adopted['principal'] == original['principal'] and adopted['component_id'] == root
                and adopted['authorized_by'] == {'kind': 'user', 'id': admin}
                and adopted_generation == original_identity[1] + 1
                and all(adopted.get(field) == original.get(field) and (field in adopted) == (field in original)
                        for field in ('credential_id', 'link_id')),
                'UI adoption replaces the executor, root or inherited credential/link restriction')
        require(all(row in _effects(inst, fixture) for row in original_effects)
                and database_rows(inst, delivery_query) == ledger,
                'Adoption rewrites original admitted work or effect receipts')
        require(inst.request('GET', '/api/v1/component-access/grants/' + root) == retained_ownership,
                'Adoption changes existing ownership or root grants')
        drawer.get_by_role('button', name='More actions for Picker root', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(action)) as response:
            drawer.get_by_role('menuitem', name='Run Picker root now', exact=True).click()
        require(response.value.status == 200 and response.value.json()['result']['state'] == 'succeeded',
                'Actual UI cannot admit new work after adoption')
        def complete():
            rows = _effects(inst, fixture)
            require(len(rows) <= len(original_effects) + 2, 'Adoption duplicates an accepted manual occurrence')
            return rows if len(rows) == len(original_effects) + 2 and _drive(inst, root)['last_committed_occurrence_seq'] == 3 else None
        rows = inst.wait(complete, 'Pending and fresh acquisitions use the replacement authorizer',
                  seconds=60, pump=browser.page.wait_for_timeout)
        require(all(row in rows for row in original_effects), 'Adoption rewrites an original effect receipt')
        added = [row for row in rows if row not in original_effects]
        require(len(added) == 2 and all(row['actor_id'] == bot
                and json.loads(row['identity_json']) == adopted
                and json.loads(row['input_json']) == {'text': 'fixed declaration'} for row in added),
                'New execution borrows the old authorizer or substitutes its fixed declaration')
        deliveries = database_rows(inst, delivery_query)
        require(deliveries == ledger and _drive(inst, root)['event_seq'] == 3,
                'Adoption retags old admission, loses a pending occurrence or duplicates a new delivery')
        audits = database_rows(inst, audit_query)
        require(audits[:len(original_audit)] == original_audit and len(audits) == len(original_audit) + 1,
                'Adoption loses, rewrites or duplicates original audit records')
        last = json.loads(audits[-1]['record_json'])
        require(last['authorizer'] == 'user:' + admin and last['new_principal'] == last['old_principal'] == 'user:' + bot
                and last['request_id'] == adoption_request['request_id'],
                'Adoption audit does not retain its actual authorizer and unchanged bot')
        browser.clean(0)
        browser.screenshot('bot-adopted-new-effect')
        inst.evidence.save('bot-authorizer-adoption', {'root': root, 'original': original_identity,
            'adopted': (adopted, adopted_generation), 'effects': rows, 'ledger': deliveries,
            'drive': _drive(inst, root), 'audits': audits})
    finally:
        inst.evidence.save('bot-adoption-progress', {'identity': _identity(inst, root),
            'drive': _drive(inst, root), 'effects': _effects(inst, fixture), 'deliveries': database_rows(inst, delivery_query)})
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_bot_authorizer_adoption', 'regression', browser_bot_authorizer_adoption,
    ('boot',), instance_setup=True, issues=('SMOKE-AUTHORITY-FIXTURE-ISOLATION', 'BOT-AUTHORIZER-UI-ADOPTION', 'RA-B15', 'RA-S05', 'RA-H37', 'RA-H38', 'RA-H50', 'RA-H51'))]
