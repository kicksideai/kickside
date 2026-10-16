"""Served Automation details use the shared Users picker and fenced identity command."""
import json
import uuid

from harness import Scenario, require
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_run_as_picker import _candidate_fixture
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def automation_identity_member_command(ctx):
    fixture = _candidate_fixture(ctx)
    inst = ctx.inst
    root, bot, member, token, delegation = (fixture[key] for key in ('root', 'bot', 'member', 'token', 'delegation'))
    original, generation = _identity(inst, root)
    current = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + member['user_id'] + "'")
    inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
                 {'groups': [row['group_id'] for row in current] + delegation['groups']})
    path = '/api/v1/automations/' + root + '/identity'
    result = inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
                          'expected_identity_generation': generation}, auth=token, label='granted-member-identity-command')
    selected, selected_generation = _identity(inst, root)
    require(result.get('state') == 'succeeded' and selected['principal'] == {'kind': 'user', 'id': bot}
            and selected['authorized_by'] == original['authorized_by'] and selected_generation == generation + 1,
            'Granted ordinary member cannot select through the owning command')


def browser_automation_identity_editor(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_automation_identity_editor(fixture)


def _browser_automation_identity_editor(ctx):
    from playwright.sync_api import expect
    fixture = _candidate_fixture(ctx)
    inst = ctx.inst
    bot, label, member, email, token, root, delegation = (fixture[key] for key in
        ('bot', 'label', 'member', 'email', 'token', 'root', 'delegation'))
    path = '/api/v1/automations/' + root + '/identity'
    original, generation = _identity(inst, root)
    projection = inst.request('GET', path, auth=token)['identity']
    require(set(projection) == {'principal', 'authorized_by', 'identity_generation'}, 'Identity reader exposes protected context')
    require(projection['principal'] == original['principal'] and projection['identity_generation'] == generation,
            'Identity reader does not match the canonical receipt')
    inst.request('GET', path, auth='', expect=(401,))
    inst.request('GET', '/api/v1/automations/' + str(uuid.uuid4()) + '/identity', auth=token, expect=(404,))
    inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
                              'expected_identity_generation': generation}, auth=token, expect=(403,))
    require(_identity(inst, root) == (original, generation), 'Ungrant crafted submission changes identity')

    browser = ctx.browser_check()
    login_member(ctx, {**member, 'email': email})
    trace = inst.root / inst.evidence.label / 'automation-identity-editor-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        manager.get_by_role('tab', name='Config', exact=True).click()
        editor = manager.locator('wc-execution-identity-editor')
        picker = editor.locator('wc-run-as-picker')
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text('Me', timeout=30000)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=label + ' Bot account', exact=True)).to_have_count(0)
        browser.screenshot('automation-identity-ungranted')
        browser.clean(0)

        current = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + member['user_id'] + "'")
        inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
                     {'groups': [row['group_id'] for row in current] + delegation['groups']})
        picker.get_by_role('combobox', name='Run as', exact=True).press('Escape')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        option = picker.get_by_role('option', name=label + ' Bot account', exact=True)
        expect(option).to_be_visible(timeout=30000)
        option.click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        inst.evidence.save('automation-identity-ui-save', {'status': response.value.status, 'body': response.value.json()})
        require(response.value.status == 200 and response.value.json().get('state') == 'succeeded', 'UI selection does not finish its owning command')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        selected, selected_generation = _identity(inst, root)
        require(selected['principal'] == {'kind': 'user', 'id': bot} and selected['authorized_by'] == original['authorized_by']
                and selected_generation == generation + 1, 'UI save replaces the executor, authorizer or generation incorrectly')
        browser.screenshot('automation-identity-selected')
        browser.clean(0)

        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name='Me', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200, 'UI cannot restore its existing human principal')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        human, human_generation = _identity(inst, root)
        require(human['principal'] == original['principal'] and human_generation == generation + 2, 'Human restoration loses the existing principal')
        expansion_trace = trace.with_name('automation-identity-expansion-trace.zip')
        browser.context.tracing.stop(path=str(expansion_trace))
        inst.evidence.paths.append(str(expansion_trace))
        login_member(ctx, {**member, 'email': email})
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        nav(ctx, 'Automations')
        manager = browser.frame.locator('kickside-automation-manager')
        editor = manager.locator('wc-execution-identity-editor')
        picker = editor.locator('wc-run-as-picker')
        manager.get_by_role('button', name='Open Picker root details', exact=True).click()
        manager.get_by_role('tab', name='Config', exact=True).click()
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text('Me', timeout=30000)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=label + ' Bot account', exact=True).click()
        inst.request('DELETE', '/api/v1/security/delegations', {'principal': delegation['principal'], 'root': root,
                     'operation_id': uuid.uuid4().hex})
        inst.request('POST', path, {'principal': {'kind': 'user', 'id': bot}, 'request_id': uuid.uuid4().hex,
                                  'expected_identity_generation': human_generation}, auth=token, expect=(403,),
                     label='pre-expansion-session-live-delegation-refusal')
        with browser.rejection('POST', path, 403):
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        expect(editor.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(editor.get_by_role('status')).to_have_count(0)
        require(_identity(inst, root) == (human, human_generation), 'Revoked delegation changes the stored human identity')
        browser.screenshot('automation-identity-live-delegation-revoked')
        browser.clean(0)
        inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
                     {'groups': [row['group_id'] for row in current]})
        with browser.rejection('POST', path, 401):
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        expect(editor.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(editor.get_by_role('status')).to_have_count(0)
        require(_identity(inst, root) == (human, human_generation), 'A stale-grant UI save changes the stored human identity')
        browser.screenshot('automation-identity-revoked')
        browser.clean(0)
        audit = database_rows(inst, "SELECT record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation")
        require(len(audit) == 3 and any(bot in row['record_json'] for row in audit), 'UI commands lose or duplicate identity audit')
        inst.evidence.save('automation-identity-editor-proof', {'root': root, 'projection': projection,
                          'selected': selected, 'restored': human, 'audits': [json.loads(row['record_json']) for row in audit],
                          'stale_grant_status': 403, 'membership_reduction_status': 401, 'run_effect_qualification': 'pending'})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_automation_identity_editor', 'regression', browser_automation_identity_editor,
                     ('boot',), parallel=('instance:browser_automation_identity_editor',), issues=('USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-AUTOMATION-IDENTITY-EDITOR', 'BOT-AUTOMATION-IDENTITY-EVALUATION', 'RA-B10', 'RA-H19', 'RA-H50', 'RA-H51', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY', 'SMOKE-AUTHORITY-FIXTURE-ISOLATION')),
            Scenario('automation_identity_member_command', 'regression', automation_identity_member_command,
                     issues=('BOT-AUTOMATION-IDENTITY-EDITOR', 'BOT-AUTOMATION-IDENTITY-EVALUATION', 'RA-H14', 'RA-H19', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY', 'SMOKE-AUTHORITY-FIXTURE-ISOLATION'))]
