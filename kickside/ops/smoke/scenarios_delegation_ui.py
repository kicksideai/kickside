"""Security's served act-as controls mutate native group delegation only."""
import uuid
from urllib.parse import parse_qs, urlsplit

from harness import Scenario, require
from scenarios import nav
from scenarios_core import system, navigation
from scenarios_manual_task import _fixture, _grant, _effects, _proof
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity


def _security(ctx):
    browser = ctx.browser
    system(ctx, 'Security')
    panel = browser.frame.locator('kickside-security')
    panel.get_by_role('tab', name='Act-as grants', exact=True).click()
    return panel


def _choose(browser, panel, kinds, query, principal_id):
    from playwright.sync_api import expect
    picker = panel.locator('wc-principal-picker[kinds="' + kinds + '"]')
    picker.locator('button[aria-haspopup="listbox"]').click()
    def matches(response):
        url = urlsplit(response.url)
        params = parse_qs(url.query)
        return (response.request.method == 'GET' and url.path == '/api/v1/principals/search'
                and params.get('q') == [query] and params.get('kinds') == [kinds])
    with browser.page.expect_response(matches) as response:
        picker.get_by_role('combobox', name='Search people or groups', exact=True).fill(query)
    body = response.value.json()
    require(response.value.status == 200 and body.get('success') is True, 'Principal picker search fails')
    rows = body['principals']
    selected = [row for row in rows if row['id'] == principal_id and row['type'] == kinds]
    require(len(selected) == 1, 'Principal search does not return exactly one intended identity')
    row = selected[0]
    require(row.get('sublabel'), 'Principal picker lacks a visible identity discriminator')
    option = picker.get_by_role('option').filter(has=browser.frame.get_by_text(row['label'], exact=True))
    option = option.filter(has=browser.frame.get_by_text(row['sublabel'], exact=True))
    expect(option).to_have_count(1)
    option.click()
    return rows


def _automation(ctx, title="Picker root"):
    nav(ctx, 'Automations')
    manager = ctx.browser.frame.locator('kickside-automation-manager')
    manager.get_by_role('button', name='Open ' + title + ' details', exact=True).click()
    manager.get_by_role('tab', name='Config', exact=True).click()
    editor = manager.locator('wc-execution-identity-editor')
    return manager, editor, editor.locator('wc-run-as-picker')


def browser_security_act_as_grant(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    inst = ctx.inst
    fixture = _fixture(ctx)
    complete_splashes(ctx, 'welcome', 'first_agent')
    root, bot, delegation = fixture['root'], fixture['bot'], fixture['delegation']
    original, generation = _identity(inst, root)
    inst.request('DELETE', '/api/v1/security/delegations', {
        'principal': delegation['principal'], 'root': root, 'operation_id': uuid.uuid4().hex})
    _grant(inst, fixture)
    competing_slug = 'picker-peer-' + uuid.uuid4().hex[:12]
    inst.request('POST', '/api/v1/security/scopes', {'slug': competing_slug,
        'label': 'Candidate operators', 'policies': [], 'enabled': True})
    inst.cleanup.add('same-label operator scope', lambda: inst.request('DELETE',
        '/api/v1/security/scopes?slug=' + competing_slug))
    competing_user = inst.request('POST', '/api/v1/users', {
        'email': 'picker-peer-' + uuid.uuid4().hex[:12] + '@smoke.example',
        'password': inst.password, 'full_name': fixture['label']}, expect=(201,))['user']
    inst.cleanup.add('same-label picker user', lambda: inst.request('DELETE',
        '/api/v1/users/' + competing_user['user_id'], expect=(202,)))
    unrelated_email = 'unrelated-operator-' + uuid.uuid4().hex[:12] + '@smoke.example'
    unrelated = inst.request('POST', '/api/v1/users', {'email': unrelated_email, 'password': inst.password,
        'full_name': 'Unrelated operator'}, expect=(201,))['user']
    inst.cleanup.add('unrelated operator', lambda: inst.request('DELETE', '/api/v1/users/' + unrelated['user_id'], expect=(202,)))
    inst.request('POST', '/api/v1/component-access/share/' + root,
        {'subject_type': 'user', 'subject_id': unrelated['user_id'], 'access_mask': 11}, auth=fixture['token'])
    ungranted = inst.request('GET', fixture['path'], auth=fixture['token'])
    require(not ungranted['candidates'], 'Group membership creates delegation before an explicit grant')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    trace = inst.root / inst.evidence.label / 'security-act-as-grant-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    peers = []
    peer_traces = []
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        panel = _security(ctx)
        user_rows = _choose(browser, panel, 'user', fixture['label'], bot)
        group_rows = _choose(browser, panel, 'group', 'Candidate operators', delegation['groups'][0])
        require(any(row['id'] == competing_user['user_id'] and row['label'] == fixture['label'] for row in user_rows)
                and any(row['id'] == 'kickside.security.scopes:' + competing_slug
                        and row['label'] == 'Candidate operators' for row in group_rows),
                'Shared principal pickers do not expose both real same-label controls')
        panel.get_by_label('Component root', exact=True).fill(root)
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/security/delegations')) as response:
            panel.get_by_role('button', name='Save act-as grant', exact=True).click()
        body = response.value.json()
        require(response.value.status == 200 and body.get('success'), 'Security UI does not confirm native grant: ' + str(body))
        saved = response.value.request.post_data_json
        require(saved['principal'] == delegation['principal'] and saved['root'] == root and saved['groups'] == delegation['groups'],
                'Shared pickers change the target, root or exact operator group')
        expect(panel.get_by_text('Act-as grant saved', exact=True)).to_be_visible(timeout=30000)
        browser.clean(0)
        browser.screenshot('security-native-act-as-grant')
        native = inst.request('GET', '/api/v1/security/delegations')['delegations']
        matched = [row for row in native if row['policy_id'] == body['policy_id']]
        require(len(matched) == 1 and matched[0]['active'] and matched[0]['groups'] == delegation['groups'], 'Grant inventory loses its native policy')
        from scenarios import Context
        unrelated_ctx = Context(inst, browser_session=browser.session)
        peers.append(unrelated_ctx)
        unrelated_browser = unrelated_ctx.browser_check()
        login_member(unrelated_ctx, {**unrelated, 'email': unrelated_email})
        unrelated_trace = trace.with_name('security-unrelated-picker-trace.zip')
        unrelated_browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        peer_traces.append((unrelated_browser, unrelated_trace))
        _, _, unrelated_picker = _automation(unrelated_ctx)
        unrelated_picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(unrelated_picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_have_count(0)
        expect(unrelated_picker.get_by_role('option')).to_have_count(1, timeout=30000)
        unrelated_browser.clean(0)
        unrelated_browser.screenshot('security-unrelated-picker-excludes-bot')
        operator_ctx = Context(inst, browser_session=browser.session)
        peers.append(operator_ctx)
        operator_browser = operator_ctx.browser_check()
        login_member(operator_ctx, {**fixture['member'], 'email': fixture['email']})
        operator_trace = trace.with_name('security-authorized-picker-trace.zip')
        operator_browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        peer_traces.append((operator_browser, operator_trace))
        manager, editor, picker = _automation(operator_ctx)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_be_visible(timeout=30000)
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        identity_path = '/api/v1/automations/' + root + '/identity'
        with operator_browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(identity_path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200 and response.value.json()['state'] == 'succeeded', 'Granted operator UI does not select its bot')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        drawer = manager.locator('aside')
        drawer.get_by_role('button', name='More actions for Picker root', exact=True).click()
        with operator_browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/actions/run_now')) as response:
            drawer.get_by_role('menuitem', name='Run Picker root now', exact=True).click()
        require(response.value.status == 200 and response.value.json()['result']['state'] == 'succeeded', 'Granted operator run is not admitted')
        inst.wait(lambda: len(_effects(inst, fixture)) == 1, 'UI grant admits the bot-only fixed effect', seconds=60,
                  pump=operator_browser.page.wait_for_timeout)
        effects = _effects(inst, fixture)
        identity = _proof(inst, fixture, effects)
        require(_identity(inst, root) == (identity, generation + 1) and identity['authorized_by'] == original['authorized_by'],
                'Delegation grant replaces the native identity or authorizer')
        operator_browser.clean(0)
        operator_browser.screenshot('security-granted-bot-effect')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name='Me', exact=True).click()
        with operator_browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(identity_path)) as response:
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        require(response.value.status == 200, 'Ordinary self selection changes under delegation')
        expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
        restored = _identity(inst, root)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
        with browser.page.expect_response(lambda r: r.request.method == 'DELETE' and r.url.endswith('/security/delegations')) as response:
            panel.get_by_role('button', name='Revoke act-as grant for ' + bot + ' at ' + root, exact=True).click()
        revoked = response.value.json()
        require(response.value.status == 200 and revoked.get('success'), 'Admin UI cannot confirm native revocation')
        revoke_payload = response.value.request.post_data_json
        expect(panel.get_by_text('Act-as grant revoked', exact=True)).to_be_visible(timeout=30000)
        expect(panel.get_by_role('button', name='Revoke act-as grant for ' + bot + ' at ' + root, exact=True)).to_have_count(0)
        browser.clean(0)
        browser.screenshot('security-native-act-as-revoked')
        with operator_browser.rejection('POST', identity_path, 403):
            editor.get_by_role('button', name='Save run-as account', exact=True).click()
        expect(editor.get_by_role('alert')).to_be_visible(timeout=30000)
        expect(editor.get_by_role('status')).to_have_count(0)
        require(_identity(inst, root) == restored and _effects(inst, fixture) == effects,
                'Revoked stale UI save changes stored identity or creates another effect')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True)).to_have_count(0)
        operator_browser.clean(0)
        operator_browser.screenshot('security-revoked-stale-picker-refusal')
        panel.get_by_label('All component roots', exact=True).check()
        with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/security/delegations')) as response:
            panel.get_by_role('button', name='Save act-as grant', exact=True).click()
        all_roots = response.value.request.post_data_json
        require(response.value.status == 200 and response.value.json().get('success') and all_roots['root'] == '*'
                and all_roots['principal'] == delegation['principal'] and all_roots['groups'] == delegation['groups'],
                'Explicit all-roots UI choice alters native target or group semantics')
        inst.cleanup.add('all-roots UI delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
            {'principal': delegation['principal'], 'root': '*', 'operation_id': uuid.uuid4().hex}))
        expect(panel.get_by_text('Act-as grant saved', exact=True)).to_be_visible(timeout=30000)
        candidates = inst.request('GET', '/api/v1/users/run-as-candidates', auth=fixture['token'])
        require(any(row['id'] == bot for row in candidates['candidates']), 'Explicit all-roots UI grant does not admit pre-install discovery')
        require(_identity(inst, root) == restored and _effects(inst, fixture) == effects,
                'All-roots grant executes or replaces an existing identity')
        browser.clean(0)
        browser.screenshot('security-explicit-all-roots-grant')
        inst.evidence.save('security-act-as-ui-proof', {'grant': saved, 'revoke': revoke_payload,
            'identity': identity, 'restored': restored, 'effects': effects,
            'picker_directory_rows': {'users': user_rows, 'groups': group_rows},
            'same_label_principals': {'user': competing_user['user_id'],
                'group': 'kickside.security.scopes:' + competing_slug},
            'unrelated_picker_excludes_bot': True, 'stale_save_status': 403, 'all_roots': all_roots})
    finally:
        for peer, path in peer_traces:
            peer.context.tracing.stop(path=str(path))
            inst.evidence.paths.append(str(path))
        for peer in peers:
            peer.close_browser()
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_security_act_as_grant', 'regression', browser_security_act_as_grant, ('boot',), instance_setup=True,
                     issues=('SMOKE-PRINCIPAL-PICKER-IDENTITY', 'BOT-SECURITY-ACT-AS-UI', 'RA-B03', 'RA-B10', 'RA-H50', 'RA-H51', 'SECURITY-SCOPE-PROJECTION-LIVENESS'),
                     features=navigation('security', 'kickside.security:tab.security'))]
