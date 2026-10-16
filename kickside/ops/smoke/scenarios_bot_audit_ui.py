"""Committed execution provenance stays distinct from the caller and selection."""
import json
import uuid
from urllib.parse import parse_qs, urlsplit

from harness import Scenario, require
from runtime_fixtures import complete_splashes
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import _fixture, _grant, _drive, _effects, _proof
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def _history_pagination_reduction(ctx, fixture, reader, reader_token, original, retained):
    from playwright.sync_api import expect
    inst, browser = ctx.inst, ctx.browser_check()
    root = fixture['root']
    history_path = '/api/v1/automations/' + root + '/history'
    query = "SELECT * FROM kickside_automation_delivery_history WHERE automation_id='" + root + "' ORDER BY round_at,round_token,source_port,item_key,identity_key"
    keys = []
    for _ in range(26):
        key = uuid.uuid4().hex
        keys.append(key)
        database_rows(inst, "INSERT INTO kickside_automation_delivery_history "
            "(automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at) "
            "VALUES ('" + root + "','pagination-fixture','" + key + "','retained-source','page-" + key
            + "','" + key + "','waiting','" + original['round_at'] + "','" + original['expires_at']
            + "') RETURNING item_key", write=True)
    rows = database_rows(inst, query)
    require(len(rows) == len(retained) + len(keys) and all(row in rows for row in retained),
            'Pagination fixtures change original retained evidence')
    share = '/api/v1/component-access/share/' + root
    subject = {'subject_type': 'user', 'subject_id': reader['user_id']}
    inst.request('POST', share, {**subject, 'access_mask': 11}, auth=fixture['token'])
    browser.frame.locator('kickside-automation-manager').get_by_role('button', name='Close details', exact=True).click()
    nav(ctx, 'Agents')
    nav(ctx, 'Automations')
    manager = browser.frame.locator('kickside-automation-manager')
    manager.get_by_role('button', name='Open Picker root details', exact=True).click()
    manager.get_by_role('tab', name='Activity', exact=True).click()
    activity = manager.get_by_role('region', name='Execution history', exact=True)
    deliveries = activity.locator('article').filter(has_text='Identity evidence')
    recorded = activity.locator('article').filter(has_text='Recorded admission')
    expect(deliveries.or_(recorded)).to_have_count(25, timeout=30000)
    first = inst.request('GET', history_path + '?kind=deliveries&page_size=25', auth=reader_token)
    require(len(first['entries']) == 25 and first.get('next_page_token'), 'Authorized first page has no bounded cursor')
    with browser.page.expect_response(lambda response: response.request.method == 'GET'
            and '/history?' in response.url and 'page_token=' in response.url) as next_response:
        activity.get_by_role('button', name='More deliveries', exact=True).click()
    second = next_response.value.json()
    next_url = urlsplit(next_response.value.url)
    require(next_url.path == history_path
            and parse_qs(next_url.query).get('page_token') == [first['next_page_token']],
            'Actual Activity substitutes its authorized cursor or history root')
    require(next_response.value.status == 200 and second['kind'] == 'deliveries'
            and len(second['entries']) == len(rows) - 25 and not second.get('next_page_token'),
            'Actual Activity cannot read the last authorized page')
    expect(deliveries.or_(recorded)).to_have_count(len(rows), timeout=30000)
    item_keys = [entry['item_key'] for entry in first['entries'] + second['entries']]
    require(len(set(item_keys)) == len(rows) and set(item_keys) == {row['item_key'] for row in rows},
            'Actual paginated Activity omits or duplicates retained deliveries')
    expect(activity.get_by_role('button', name='More deliveries', exact=True)).to_have_count(0)
    browser.clean(0)
    browser.screenshot('history-authorized-pages')
    manager.get_by_role('tab', name='Config', exact=True).click()
    manager.get_by_role('tab', name='Activity', exact=True).click()
    expect(deliveries.or_(recorded)).to_have_count(25, timeout=30000)
    expect(activity.get_by_role('button', name='More deliveries', exact=True)).to_be_enabled(timeout=30000)
    inst.request('POST', share, {**subject, 'access_mask': 1}, auth=fixture['token'])
    rejected_path = next_url.path + '?' + next_url.query
    with browser.rejection('GET', rejected_path, 404) as refused:
        activity.get_by_role('button', name='More deliveries', exact=True).click()
    refusal = refused.value.json()
    require(not refusal.get('entries'), 'Revoked historical cursor exposes private records')
    expect(activity.get_by_role('alert')).to_be_visible(timeout=30000)
    expect(activity.locator('article')).to_have_count(0)
    for label in ('Historical executor', 'Historical authorizer', 'Control initiator'):
        expect(activity.get_by_label(label, exact=True)).to_have_count(0)
    expect(activity.get_by_role('button', name='More deliveries', exact=True)).to_have_count(0)
    expect(activity.get_by_role('button', name='More control requests', exact=True)).to_have_count(0)
    require(database_rows(inst, query) == rows, 'Refused history page changes retained evidence')
    require(inst.request('GET', '/api/v1/automations/' + root + '/status', auth=reader_token).get('success'),
            'ADMIN reduction breaks existing READ status')
    browser.clean(0)
    browser.screenshot('history-live-reduction-clears-records')
    proof = {'reader': reader['user_id'], 'root': root, 'first': first, 'second': second,
        'refusal': refusal, 'additional_absent_identity_fixture_keys': keys,
        'retained_rows_unchanged': True, 'private_dom_records_after_reduction': 0}
    inst.evidence.save('history-pagination-reduction', proof)
    return proof


def browser_run_as_audit(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_run_as_audit(fixture)


def _browser_run_as_audit(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixture = _fixture(ctx)
    _grant(inst, fixture)
    root, bot = fixture['root'], fixture['bot']
    path = '/api/v1/automations/' + root + '/identity'
    _, generation = _identity(inst, root)
    selected = inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot},
        'request_id': uuid.uuid4().hex, 'expected_identity_generation': generation}, auth=fixture['token'])
    require(selected['state'] == 'succeeded', 'Configuring operator cannot select the executor')
    canonical = _identity(inst, root)
    authorizer = fixture['member']['user_id']
    admin_profile = inst.request('GET', '/api/v1/user/me')['user']
    admin = admin_profile['id']
    require(len({admin, authorizer, bot}) == 3, 'Provenance guard does not distinguish the trigger, authorizer and executor')
    inst.request('POST', '/api/v1/component-access/share/' + root,
        {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 11}, auth=fixture['token'])
    email = 'audit-reader-' + uuid.uuid4().hex[:12] + '@smoke.example'
    reader = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
        'full_name': 'Execution audit reader'}, expect=(201,))['user']
    inst.cleanup.add('execution audit reader', lambda: inst.request('DELETE', '/api/v1/users/' + reader['user_id'], expect=(202,)))
    reader_token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='')['token']
    inst.redactor.add(reader_token)
    inst.request('POST', '/api/v1/component-access/share/' + root,
        {'subject_type': 'user', 'subject_id': reader['user_id'], 'access_mask': 1}, auth=fixture['token'])
    denied = inst.request('GET', path, auth=reader_token, expect=(404,))
    require(not denied.get('identity'), 'Ordinary reader obtains protected execution provenance')
    audit_query = "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation"
    audits = database_rows(inst, audit_query)
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    trace = inst.root / inst.evidence.label / 'run-as-audit-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        drawer = manager.locator('aside')
        manager.get_by_role('tab', name='Config', exact=True).click()
        editor = manager.locator('wc-execution-identity-editor')
        expect(editor.get_by_label('Runs as', exact=True)).to_have_text(fixture['label'], timeout=30000)
        expect(editor.get_by_label('Authorized by', exact=True)).to_have_text('Candidate operator', timeout=30000)
        expect(editor.locator('[aria-label="Authorized by"]')).not_to_contain_text(fixture['label'])
        browser.clean(0)
        browser.screenshot('executor-and-authorizer')
        drawer.get_by_role('button', name='More actions for Picker root', exact=True).click()
        action = '/api/v1/automations/' + root + '/actions/run_now'
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(action)) as response:
            drawer.get_by_role('menuitem', name='Run Picker root now', exact=True).click()
        require(response.value.status == 200 and response.value.json()['result']['state'] == 'succeeded',
                'Independent actual browser caller cannot trigger the configured task')
        rows = inst.wait(lambda: _effects(inst, fixture) if len(_effects(inst, fixture)) == 1
            and _drive(inst, root)['last_committed_occurrence_seq'] == 1 else None,
            'Actual browser trigger records the configured bot effect', seconds=60, pump=browser.page.wait_for_timeout)
        identity = _proof(inst, fixture, rows)
        history_query = "SELECT * FROM kickside_automation_delivery_history WHERE automation_id='" + root + "' ORDER BY round_at,round_token,source_port,item_key,identity_key"
        history = database_rows(inst, history_query)
        require(len(history) == 1 and history[0]['state'] == 'resolved'
                and json.loads(history[0]['execution_identity_json'])['identity'] == identity,
                'Successful first-attempt bot execution loses its admitted historical identity')
        require(identity == canonical[0] and _identity(inst, root) == canonical
                and database_rows(inst, audit_query) == audits,
                'Independent trigger rewrites the executor, authorizer or protected audit')
        request_id = response.value.request.post_data_json['request_id']
        command_query = "SELECT generation,digest,target_receipts_json,state,outcome_json FROM kickside_automation_op WHERE automation_id='" + root + "' AND request_id='" + request_id + "'"
        commands = database_rows(inst, command_query)
        require(len(commands) == 1 and json.loads(commands[0]['target_receipts_json']).get('initiation') == {'actor_id': admin},
                'Actual browser control lacks its authenticated trigger receipt')
        replay = inst.request('POST', action, {'request_id': request_id,
            'initiation': {'actor_id': authorizer}, 'actor_id': bot}, auth=fixture['token'])
        require(replay['result']['generation'] == response.value.json()['result']['generation']
                and database_rows(inst, command_query) == commands and _effects(inst, fixture) == rows,
                'Another authenticated caller rewrites the browser trigger receipt or repeats its effect')
        require(database_rows(inst, history_query) == history, 'Command replay rewrites delivery history')
        history_path = '/api/v1/automations/' + root + '/history'
        retained = inst.request('GET', history_path + '?kind=deliveries')
        require(len(retained['entries']) == 1 and retained['entries'][0]['evidence']['identity'] == identity
                and retained['entries'][0]['evidence_status'] == 'recorded',
                'Protected historical reader does not return the exact admitted executor and authorizer')
        control_history = inst.request('GET', history_path + '?kind=controls')
        original_control = [row for row in control_history['entries'] if row['request_id'] == request_id]
        require(len(original_control) == 1 and original_control[0]['initiation'] == {'actor_id': admin}
                and not original_control[0].get('delivery') and not retained['entries'][0].get('initiation'),
                'Historical reader invents correlation between independent controls and delivery admission')
        history_denied = inst.request('GET', history_path + '?kind=deliveries', auth=reader_token, expect=(404,))
        require(not history_denied.get('entries'), 'Ordinary reader obtains protected historical records')
        public_status = inst.request('GET', '/api/v1/automations/' + root + '/status', auth=reader_token)
        require('target_receipts' not in json.dumps(public_status) and 'initiation' not in json.dumps(public_status),
                'Ordinary status exposes private trigger evidence')
        expect(editor.get_by_label('Authorized by', exact=True)).to_have_text('Candidate operator', timeout=30000)
        browser.clean(0)
        browser.screenshot('independent-trigger-retains-provenance')
        picker = editor.locator('wc-run-as-picker')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name='Me', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as changed:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(changed.value.status == 200 and changed.value.json()['state'] == 'succeeded',
                'Actual current selection change fails before historical browsing')
        current = _identity(inst, root)
        current_audits = database_rows(inst, audit_query)
        require(current[0]['principal'] == {'kind': 'user', 'id': admin}
                and current[0]['authorized_by'] == {'kind': 'user', 'id': admin}
                and current[1] == canonical[1] + 1 and database_rows(inst, history_query) == history,
                'Current selection change rewrites admitted historical identity')
        error_text = 'Destination has no capacity'
        error_key = uuid.uuid4().hex
        database_rows(inst, "INSERT INTO kickside_automation_delivery_history "
            "(automation_id,drive_key,round_token,source_port,item_key,identity_key,state,error_json,round_at,expires_at) "
            "VALUES ('" + root + "','retained-error','" + error_key + "','retained-source','retained-item','"
            + error_key + "','waiting','" + json.dumps(error_text) + "','" + history[0]['round_at']
            + "','" + history[0]['expires_at'] + "') RETURNING item_key", write=True)
        observed_history = database_rows(inst, history_query)
        require(len(observed_history) == 2 and history[0] in observed_history,
                'Retained error fixture rewrites actual committed admission')
        observed = inst.request('GET', history_path + '?kind=deliveries')
        error_records = [row for row in observed['entries'] if row['identity_key'] == error_key]
        require(len(error_records) == 1 and error_records[0]['error'] == error_text
                and error_records[0]['evidence_status'] == 'absent' and not error_records[0].get('evidence'),
                'Protected history rejects a valid retained text error or invents its identity')
        manager.get_by_role('tab', name='Activity', exact=True).click()
        activity = drawer.get_by_role('region', name='Execution history', exact=True)
        expect(activity.get_by_label('Historical executor', exact=True)).to_have_text(fixture['label'], timeout=30000)
        expect(activity.get_by_label('Historical authorizer', exact=True)).to_have_text('Candidate operator', timeout=30000)
        expect(activity.get_by_label('Control initiator', exact=True).filter(has_text=admin_profile['full_name'])).to_have_count(1)
        expect(activity.get_by_text('Recorded admission', exact=True)).to_have_count(1)
        expect(activity.get_by_text(error_text, exact=True)).to_have_count(1)
        expect(activity.get_by_text('Identity evidence absent', exact=True)).to_have_count(1)
        require(inst.request('GET', history_path + '?kind=deliveries') == observed
                and retained['entries'][0] in observed['entries'],
                'Historical reader replaces admitted identity with current selection')
        browser.clean(0)
        browser.screenshot('historical-executor-survives-selection-change')
        admin_trace = trace.with_name('run-as-audit-admin-trace.zip')
        browser.context.tracing.stop(path=str(admin_trace))
        inst.evidence.paths.append(str(admin_trace))
        login_member(ctx, {**reader, 'email': email})
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        manager.get_by_role('tab', name='Config', exact=True).click()
        expect(manager.locator('wc-execution-identity-editor')).to_have_count(0)
        expect(manager.get_by_label('Authorized by', exact=True)).to_have_count(0)
        manager.get_by_role('tab', name='Activity', exact=True).click()
        expect(manager.get_by_role('region', name='Execution history', exact=True)).to_have_count(0)
        expect(manager.get_by_label('Historical executor', exact=True)).to_have_count(0)
        require(_identity(inst, root) == current and _effects(inst, fixture) == rows
                and database_rows(inst, audit_query) == current_audits
                and database_rows(inst, history_query) == observed_history,
                'Reader navigation changes protected execution state')
        browser.clean(0)
        browser.screenshot('reader-cannot-inspect-provenance')
        pagination = _history_pagination_reduction(ctx, fixture, reader, reader_token, history[0], observed_history)
        require(_identity(inst, root) == current and _effects(inst, fixture) == rows
                and database_rows(inst, audit_query) == current_audits,
                'History pagination or permission reduction changes execution identity, audit or effect')
        inst.evidence.save('run-as-audit', {'executor': bot, 'authorizer': authorizer, 'trigger': admin,
            'reader': reader['user_id'], 'identity': canonical, 'effects': rows, 'audits': audits,
            'trigger_commands': commands, 'trigger_replay': replay, 'safe_status': public_status,
            'delivery_history': history,
            'protected_history': retained, 'control_history': control_history, 'history_refusal': history_denied,
            'observed_history': observed, 'error_identity_key': error_key,
            'current_identity': current, 'current_audits': current_audits,
            'reader_refusal': denied, 'actual_trigger_request': response.value.request.post_data_json,
            'pagination_reduction': pagination})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_run_as_audit', 'regression', browser_run_as_audit,
    ('boot',), instance_setup=True, issues=('SMOKE-AUTHORITY-FIXTURE-ISOLATION', 'BOT-PROTECTED-IDENTITY-PROVENANCE-UI', 'RA-B18', 'RA-H50', 'RA-H51', 'AUTOMATION-CONTROL-INITIATION', 'AUTOMATION-DELIVERY-HISTORY', 'AUTOMATION-PROTECTED-HISTORY', 'AUTOMATION-HISTORY-ERROR-PAYLOAD', 'AUTOMATION-HISTORY-PAGED-REVOCATION'))]
