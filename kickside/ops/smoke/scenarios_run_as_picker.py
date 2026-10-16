"""Real host qualification of the Users-owned candidate API and shared picker."""
import uuid
from urllib.parse import quote

from harness import Scenario, require
from scenarios_hot_update_work import database_rows
from scenarios_run_as_browser import _bot_fixture
from scenarios_selected_install import _prepare, TYPE
from scenarios_security_ui import login_member


def _mount(browser, root):
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    browser.frame.locator('body').evaluate("""async (body, root) => {
        const {loadByTagName} = await import('@wippy-fe/proxy');
        await loadByTagName('wc-run-as-picker', {timeoutMs: 8000});
        document.querySelector('#run-as-picker-fixture')?.remove();
        const panel = document.createElement('section');
        panel.id = 'run-as-picker-fixture';
        panel.style.cssText = 'position:fixed;left:20px;top:20px;width:360px;padding:20px;z-index:10000;background:var(--p-content-background)';
        const picker = document.createElement('wc-run-as-picker');
        picker.setAttribute('root', root);
        window.runAsPickerEvents = [];
        for (const name of ['config-changed', 'change']) picker.addEventListener(name, event => {
            window.runAsPickerEvents.push({name, detail: event.detail});
            if (event.detail?.principal?.id) picker.setAttribute('value', event.detail.principal.id);
        });
        panel.append(picker); body.append(panel);
    }""", root)
    return browser.frame.locator('wc-run-as-picker')


def _candidate_fixture(ctx, *, automation_type=TYPE, install_input=None, install_auth=None, cleanup_auth=None, bot_id=None):
    inst = ctx.inst
    _prepare(ctx)
    bot = bot_id if bot_id is not None else _bot_fixture(inst, 'candidate-bot-' + uuid.uuid4().hex[:12] + '@smoke.example')
    label = 'Sales execution account ' + uuid.uuid4().hex[:8]
    inst.request('PUT', '/api/v1/users/' + bot, {'full_name': label})
    email = 'candidate-operator-' + uuid.uuid4().hex[:12] + '@smoke.example'
    member = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                          'full_name': 'Candidate operator'}, expect=(201,))['user']
    member_cleanup = inst.cleanup.add('candidate operator', lambda: inst.request('DELETE', '/api/v1/users/' + member['user_id'], expect=(202,)))
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='')['token']
    inst.redactor.add(token)
    root = inst.request('POST', '/api/v1/automations', {'type': automation_type,
        'input': install_input if install_input is not None else {'title': 'Picker root'}}, auth=token if install_auth is None else install_auth)['id']
    if install_auth is not None:
        inst.request('POST', '/api/v1/component-access/share/' + root,
            {'subject_type': 'user', 'subject_id': member['user_id'], 'access_mask': 11}, auth=install_auth)
    slug = 'candidate-operators-' + uuid.uuid4().hex[:10]
    inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Candidate operators', 'policies': [], 'enabled': True})
    inst.cleanup.add('candidate operator scope', lambda: inst.request('DELETE', '/api/v1/security/scopes?slug=' + slug))
    delegation = {'principal': {'kind': 'user', 'id': bot}, 'root': root,
                  'groups': ['kickside.security.scopes:' + slug]}
    inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
    inst.cleanup.add('candidate delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
        {'principal': delegation['principal'], 'root': root, 'operation_id': uuid.uuid4().hex}))
    def cleanup_root():
        fresh = cleanup_auth
        if fresh is None:
            fresh = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='')['token']
        inst.redactor.add(fresh)
        inst.request('DELETE', '/api/v1/automations/' + root, auth=fresh)
    inst.cleanup.add('candidate root', cleanup_root)
    path = '/api/v1/users/run-as-candidates?component_id=' + root
    return {'bot': bot, 'label': label, 'member': member, 'email': email, 'token': token,
            'root': root, 'delegation': delegation, 'path': path, 'member_cleanup': member_cleanup}


def browser_run_as_candidate_picker(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_run_as_candidate_picker(fixture)


def _browser_run_as_candidate_picker(ctx):
    from playwright.sync_api import expect
    fixture = _candidate_fixture(ctx)
    inst = ctx.inst
    bot, label, member, email, token, root, delegation, path = (fixture[key] for key in
        ('bot', 'label', 'member', 'email', 'token', 'root', 'delegation', 'path'))
    page = inst.request('GET', path, auth=token, label='ungranted-candidates')
    require(page['me']['id'] == member['user_id'] and not page['candidates'], 'Ungrant caller receives a selectable bot')
    inst.request('GET', path, auth='', expect=(401,), label='anonymous-candidates')
    inst.request('GET', path + '&limit=invalid', auth=token, expect=(400,), label='invalid-candidate-limit')
    inst.request('GET', '/api/v1/users/run-as-candidates?component_id=' + str(uuid.uuid4()), auth=token,
                 expect=(403,), label='candidate-root-refusal')

    browser = ctx.browser_check()
    trace = inst.root / inst.evidence.label / 'run-as-picker-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    login_member(ctx, {**member, 'email': email})
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        picker = _mount(browser, root)
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text('Me', timeout=30000)
        browser.clean(0)
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=label + ' Bot account', exact=True)).to_have_count(0)
        browser.screenshot('run-as-picker-ungranted')
        browser.clean(0)

        current = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + member['user_id'] + "'")
        inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
                     {'groups': [row['group_id'] for row in current] + delegation['groups']})
        granted = inst.request('GET', path + '&q=' + quote(label), auth=token, label='live-granted-candidates')
        require([row['id'] for row in granted['candidates']] == [bot], 'Live candidate does not follow the new operator membership')
        picker.get_by_role('combobox', name='Run as', exact=True).press('Escape')
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        option = picker.get_by_role('option', name=label + ' Bot account', exact=True)
        expect(option).to_be_visible(timeout=30000)
        browser.clean(0)
        option.click()
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text(label)
        events = browser.frame.locator('body').evaluate('() => window.runAsPickerEvents')
        require(events == [{'name': 'config-changed', 'detail': {'principal': {'kind': 'user', 'id': bot}, 'label': label}}],
                'One picker choice does not emit exactly one ordinary User configuration event')
        browser.screenshot('run-as-picker-selected')
        browser.clean(0)
        inst.request('PUT', '/api/v1/users/' + bot, {'status': 'inactive'})
        picker.get_by_role('combobox', name='Run as', exact=True).click()
        expect(picker.get_by_role('option')).to_have_count(1, timeout=30000)
        expect(picker.get_by_role('option', name=label + ' Bot account', exact=True)).to_have_count(0)
        expect(picker.get_by_role('combobox', name='Run as', exact=True)).to_contain_text('Selection unavailable')
        browser.screenshot('run-as-picker-disabled-candidate')
        browser.clean(0)
        inst.evidence.save('run-as-candidate-picker-proof', {'root': root, 'bot': bot, 'ungranted': page,
                          'granted': granted, 'events': events, 'disabled_candidate_absent': True})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_run_as_candidate_picker', 'regression', browser_run_as_candidate_picker,
                     ('boot',), instance_setup=True,
                     issues=('USERS-DECLARED-MEMBER-ENDPOINT-COVERAGE', 'BOT-RUN-AS-CANDIDATES', 'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY', 'SMOKE-AUTHORITY-FIXTURE-ISOLATION'))]
