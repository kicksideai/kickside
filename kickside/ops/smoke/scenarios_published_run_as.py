"""Published human automations and saved credentials survive actual Hub updates."""
from pathlib import Path
import hashlib
import shutil

import yaml

from harness import Scenario, require
from module_lifecycle_contract import published_fixture, sync_fixture, receipt, update_source
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_selected_install import _identity
from scenarios_token_continuity import token_payloads, credential_snapshot
from upgrade_regressions import candidate_dependency_sources


# A module's test harnesses live at its root; source directories named test or
# tests below the root (keeper.tests.api) are shipped entries.
HARNESS_DIRECTORIES = {'test', 'tests', 'lint-harness'}
COPY_IGNORED = shutil.ignore_patterns('.git', '.wippy', 'wippy.lock', 'node_modules', '__pycache__')


def module_source_ignore(root):
    def ignore(directory, names):
        ignored = set(COPY_IGNORED(directory, names))
        if Path(directory) == root:
            ignored |= HARNESS_DIRECTORIES & set(names)
        return ignored
    return ignore


BOT_ACCOUNTS_ENDPOINT = {
    'data': {'func': 'bot_accounts_list', 'method': 'GET', 'path': '/users/bots'},
    'id': 'kickside.users.api:bot_accounts_list.endpoint',
    'kind': 'http.endpoint',
    'meta': {'router': 'app:api'},
}


def published_bot_accounts_capability(inst, token, label):
    entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.users.api%3Abot_accounts_list.endpoint',
                         label=label + '-bot-api-entry')['entry']
    require(entry == BOT_ACCOUNTS_ENDPOINT,
            'Published bot candidate endpoint differs from its current registry contract: ' + str(entry))
    bots = inst.request('GET', '/api/v1/users/bots', auth=token, label=label + '-bot-api-list')
    require(bots.get('success') is True and bots.get('users') == [],
            'Published bot candidate capability changes its empty human baseline: ' + str(bots))
    require(type(bots.get('count')) is int and bots['count'] == len(bots['users'])
            and type(bots.get('limit')) is int and bots['limit'] > 0
            and type(bots.get('offset')) is int and bots['offset'] == 0,
            'Published bot candidate paging is incoherent: ' + str(bots))
    return {'entry': entry, 'listing': bots}


def _sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _active_controller_source(inst, controller):
    entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=keeper.gov.service%3Acentral',
                         label='published-controller-active-source')['entry']
    source = entry.get('data', {}).get('source')
    require(isinstance(source, str), 'Active governance controller has no registry source')
    active_sha256 = hashlib.sha256(source.encode()).hexdigest()
    require(active_sha256 == controller['central_sha256'],
            'Active governance controller differs from the selected source override')
    return {**controller, 'registry_entry': entry['id'], 'active_source_sha256': active_sha256}


def browser_published_human_automation_update(ctx, *, installer=None, setup=None, observe=None, modules=(),
                                               controller_source=None):
    from playwright.sync_api import expect
    from scenarios_identity_policy_upgrade import published_source

    require(controller_source in (None, 'keeper/keeper'),
            'Published update fixture supports only the Keeper governance controller override')

    def prepare(fixture):
        inst = fixture.inst
        source = ctx.inst.config.get('source')
        candidates = candidate_dependency_sources(ctx.inst.config['replace'],
            ('kickside/kickside', 'kickside/sync', 'kickside/automation', 'kickside/inbox', 'kickside/webhooks')
            + tuple(modules) + ((controller_source,) if controller_source else ()),
            application=Path(source) / 'app' if source else None)
        sources, baselines, controller = {}, {}, None
        for module, candidate in candidates.items():
            manifest = yaml.safe_load((Path(candidate) / 'wippy.yaml').read_text())
            directory = inst.root / 'temp/published-sources' / module.replace('/', '_')
            directory.parent.mkdir(exist_ok=True)
            if module == controller_source:
                receipt = inst.root / 'temp/published-controller-receipts' / module.replace('/', '_')
                receipt.parent.mkdir(exist_ok=True)
                baselines[module] = published_source(receipt, module, None, application=manifest.get('type') == 'application')
                directory = inst.root / 'temp/runtime-support' / module.replace('/', '_')
                shutil.copytree(candidate, directory, ignore=module_source_ignore(Path(candidate)))
                central = directory / 'src/keeper/gov/service/central.lua'
                require(central.is_file(), 'Controller source has no governance central: ' + module)
                controller = {
                    'component': module,
                    'declared_source': str(Path(candidate).resolve()),
                    'active_source': str(directory),
                    'central_path': str(central),
                    'central_sha256': _sha256(central),
                    'published_receipt': baselines[module],
                    'published_receipt_path': str(receipt),
                }
            else:
                baselines[module] = published_source(directory, module, None, application=manifest.get('type') == 'application')
            sources[module] = str(directory)
        require(controller_source is None or controller is not None,
                'Selected controller source is absent from the source replacement closure: ' + str(controller_source))
        configuration = yaml.safe_load((Path(sources['kickside/kickside']) / '.wippy.yaml').read_text())
        require(not configuration.get('workspace'), 'Published application includes local source replacements')
        configuration['workspace'] = {'include_host_dependencies': True, 'replacements': sources}
        inst.config['replace'] = sources
        fixture.state['published_sources'] = sources
        fixture.state['candidate_sources'] = candidates
        (inst.app / '.wippy.yaml').write_text(yaml.safe_dump(configuration, sort_keys=False))
        inst.evidence.save('published-human-runtime-baseline', {
            'archives': baselines,
            'historical_app_product_archives': {
                module: receipt for module, receipt in baselines.items() if module != controller_source},
            'profiles': sorted(configuration.get('profiles', {})),
        })
        if controller is not None:
            fixture.state['controller_source'] = controller
            inst.evidence.save('published-human-controller-override', controller)

    with published_fixture(ctx, published_app=True, prepare=prepare) as fixture:
        inst = fixture.inst
        controller = fixture.state.get('controller_source')
        if controller is not None:
            inst.evidence.save('published-human-controller-active', _active_controller_source(inst, controller))
        aid, hook, declaration, title = sync_fixture(fixture)
        if setup is not None:
            setup(fixture)
        before = receipt(fixture, hook, title, '1')
        identity = _identity(inst, aid)
        configurer = inst.request('GET', '/api/v1/user/me')['user']['id']
        require(identity[0]['principal'] == {'kind': 'user', 'id': configurer}
                and identity[0]['authorized_by'] == {'kind': 'user', 'id': configurer},
                'Published ordinary installation does not retain its configuring human')
        require(all(row['actor_id'] == configurer for row in before),
                'Published automation delivers as another actor')
        audit_query = "SELECT identity_generation,CAST(record_json AS TEXT) AS record_json FROM kickside_execution_identity_audit WHERE component_id='" + aid + "' ORDER BY identity_generation"
        audit = database_rows(inst, audit_query)
        require(audit, 'Published automation has no retained identity audit')
        api_token = inst.token
        bot_endpoint = published_bot_accounts_capability(inst, api_token, 'published-baseline')
        browser = fixture.browser_check()
        browser_token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
        require(browser_token, 'Published login does not retain its browser credential')
        inst.redactor.add(browser_token)
        browser.context.add_cookies([{'name': 'x-auth-token', 'value': browser_token, 'url': inst.base}])
        response = browser.context.request.get(inst.base + '/api/v1/user/me')
        require(response.status == 200 and response.json()['user']['id'] == configurer,
                'Published browser cookie has no authenticated human baseline')
        if observe is not None:
            observe(fixture, 'baseline')
        payloads = token_payloads(inst)
        accounts = database_rows(inst, 'SELECT user_id,email,full_name,status,auth_generation FROM app_users ORDER BY user_id')
        groups = database_rows(inst, 'SELECT user_id,group_id,source,created_at FROM app_user_groups ORDER BY user_id,group_id')
        credential_snapshot(inst, 'published-human-before-update')
        inst.evidence.save('published-human-automation-baseline', {
            'automation': aid, 'identity': identity, 'declaration': declaration,
            'configurer': configurer, 'accounts': accounts, 'groups': groups,
            'receipt_ids': sorted(row['id'] for row in before)})
        replacements = fixture.state['published_sources']
        for module, path in replacements.items():
            directory = Path(path)
            shutil.rmtree(directory / 'src')
            source = Path(fixture.state['candidate_sources'][module])
            shutil.copytree(source, directory, dirs_exist_ok=True, ignore=module_source_ignore(source))
        root_source = replacements['kickside/kickside']
        pid = inst.process.pid
        for phase, count in (('update', 2), ('repeat', 3), ('restart', 4)):
            if phase == 'restart':
                if observe is not None:
                    observe(fixture, 'before_restart')
                with fixture.paused():
                    pass
            else:
                def transport(instance, **arguments):
                    return installer(fixture, instance, **arguments)
                try:
                    update_source(fixture, root_source, 'kickside/kickside', live=True,
                                  replacements=replacements,
                                  installer=transport if installer is not None and phase == 'update' else None)
                finally:
                    credential_snapshot(inst, 'published-human-hub-return-' + phase)
                require(inst.process.pid == pid, 'Actual Hub update restarts the runtime')
            require(published_bot_accounts_capability(inst, api_token, 'published-' + phase) == bot_endpoint,
                    'Hub update changes the published bot candidate endpoint or listing')
            require(_identity(inst, aid) == identity, 'Hub update changes the stored executor, authorizer or generation')
            require(database_rows(inst, audit_query) == audit, 'Hub update rewrites identity audit bytes or appends a new admission')
            require(inst.request('GET', '/api/v1/automations/' + aid + '/config')['config'] == declaration,
                    'Hub update changes an existing automation declaration')
            require(database_rows(inst, 'SELECT user_id,email,full_name,status,auth_generation FROM app_users ORDER BY user_id') == accounts,
                    'Hub update rewrites existing account data or authentication generation')
            require(database_rows(inst, 'SELECT user_id,group_id,source,created_at FROM app_user_groups ORDER BY user_id,group_id') == groups,
                    'Hub update enrolls accounts or changes existing group memberships')
            current_payloads = token_payloads(inst)
            require(all(current_payloads.get(key) == value for key, value in payloads.items()),
                    'Hub update rewrites or removes a published saved token')
            profile = inst.request('GET', '/api/v1/user/me', auth=api_token)
            require(profile.get('success') and profile['user']['id'] == configurer,
                    'Published API bearer loses its original human identity')
            browser = fixture.browser_check()
            require(browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token") == browser_token,
                    'Hub update replaces the original browser login credential')
            response = browser.context.request.get(inst.base + '/api/v1/user/me')
            require(response.status == 200 and response.json()['user']['id'] == configurer,
                    'Published browser cookie loses its original human identity')
            rows = receipt(fixture, hook, title, str(count))
            require(len(rows) == count and {row['id'] for row in before} <= {row['id'] for row in rows},
                    'Existing automation loses or duplicates native delivery after update')
            require(all(row['actor_id'] == configurer for row in rows),
                    'Existing automation substitutes its configuring human at the native effect')
            trace = inst.root / inst.evidence.label / ('published-human-' + phase + '-trace.zip')
            trace.parent.mkdir(parents=True, exist_ok=True)
            browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
            try:
                nav(fixture, 'Automations')
                row = browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
                expect(row).to_be_visible(timeout=30000)
                require('Unavailable' not in row.inner_text(), 'Updated browser parks the existing automation')
                browser.screenshot('published-human-automation-' + phase)
                browser.clean(0)
            finally:
                browser.context.tracing.stop(path=str(trace))
                inst.evidence.paths.append(str(trace))
            if observe is not None:
                observe(fixture, phase)
            credential_snapshot(inst, 'published-human-' + phase)
            inst.evidence.save('published-human-automation-' + phase, {
                'identity': _identity(inst, aid), 'declaration': declaration,
                'receipt_ids': sorted(row['id'] for row in rows), 'original_api_bearer_valid': True,
                'original_browser_cookie_valid': True, 'saved_payloads_unchanged': True,
                'runtime_pid': inst.process.pid})


def browser_published_human_automation_source_update(ctx):
    browser_published_human_automation_update(ctx, controller_source='keeper/keeper')


REGISTRY = [Scenario('browser_published_human_automation_update', 'regression',
                     browser_published_human_automation_source_update, ('boot',), instance_setup=True,
                     issues=('SMOKE-PUBLISHED-WORKSPACE-FIXTURE', 'BOT-PUBLISHED-HUMAN-AUTOMATION-UPDATE', 'SMOKE-HUB-UPDATE-CLOSURE-SOURCES',
                             'SMOKE-PUBLISHED-RESOURCE-METADATA', 'SMOKE-CLI-REPOSITORY-IMPORTS',
                             'SMOKE-PUBLISHED-MANIFEST-TYPE',
                             'RUNTIME-LIVE-HUB-UPDATE-AUTHENTICATION-GAP',
                             'HUB-UPDATE-RETIRED-PROJECTION-SESSION-REVOCATION',
                             'RA-C01', 'RA-C03', 'RA-C10', 'RA-C12', 'RA-C18'))]


def install_source_through_hub_ui(fixture, inst, *, module, replacement, refresh_session):
    import re
    from mcp_contracts import open_keeper_application
    from module_lifecycle_contract import dependency
    from scenarios_hub_ui import install_dialog, submit_install

    require(replacement and not refresh_session, 'UI update changes source or authentication semantics')
    browser = fixture.browser_check()
    original = browser.page
    trace = inst.root / inst.evidence.label / 'published-human-hub-ui-trace.zip'
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    try:
        frame = open_keeper_application(fixture, browser)
        frame.get_by_role('button', name='Settings', exact=True).click()
        frame.get_by_role('button', name=re.compile('^Wippy Hub')).click()
        dialog = install_dialog(fixture, frame, module)
        dialog.get_by_label('Version', exact=True).fill('*')
        with browser.page.expect_response(lambda response: response.request.method == 'POST'
                and response.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000) as refreshed:
            dialog.get_by_role('button', name='Refresh', exact=True).click()
        inst.evidence.save('hub-ui-unconstrained-plan', {'status': refreshed.value.status,
                                                      'body': refreshed.value.json()})
        require(refreshed.value.status == 200, 'The actual UI cannot plan an unconstrained update')
        submit_install(fixture, browser, frame, dialog, module)
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))
        if browser.page is not original:
            browser.page.close()
            browser.page = original
    browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
    receipt = dependency(inst, module)
    require(receipt['version'] == '*', 'The actual UI pins the source update declaration')
    return receipt


def browser_published_human_automation_hub_ui_update(ctx):
    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui,
                                              controller_source='keeper/keeper')

REGISTRY.append(Scenario('browser_published_human_automation_hub_ui_update', 'regression',
    browser_published_human_automation_hub_ui_update, ('boot',), instance_setup=True,
    issues=REGISTRY[0].issues + ('RA-B16',)))



def browser_published_human_sessions_hub_ui_update(ctx):
    from scenarios import Context
    from scenarios_token_continuity import member, issue
    import hashlib

    sessions = {}
    def observe(fixture, phase):
        inst = fixture.inst
        if phase == 'baseline':
            user = member(inst)
            api_token = issue(inst, user)
            peer = Context(inst, browser_session=fixture.browser.session)
            browser = peer.browser_check()
            browser.login(user['email'], inst.password)
            token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
            require(token, 'Published member browser has no original login credential')
            inst.redactor.add(token)
            browser.context.add_cookies([{'name': 'x-auth-token', 'value': token, 'url': inst.base}])
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            browser.settle()
            sessions.update(peer=peer, user=user['user_id'], api=api_token, browser=token,
                            admin_context=fixture.browser.context, member_context=browser.context,
                            expansion='kickside/workflows')
            from module_lifecycle_contract import dependency
            require(dependency(inst, sessions['expansion']) is None,
                    'Published session fixture already installs its module expansion')
        if phase == 'before_restart':
            sessions['peer'].suspend_browser()
            return
        if phase == 'restart':
            sessions['peer'].resume_browser()
        browser = sessions['peer'].browser_check()
        trace = inst.root / inst.evidence.label / ('published-member-session-' + phase + '-trace.zip')
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            if phase in ('baseline', 'update', 'repeat', 'expansion'):
                require(fixture.browser.context is sessions['admin_context']
                        and browser.context is sessions['member_context'],
                        'Update replaces an original member or administrator browser context')
            require(browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token") == sessions['browser'],
                    'Update replaces the original member browser token')
            profile = inst.request('GET', '/api/v1/user/me', auth=sessions['api'], label='member-saved-api-' + phase)
            require(profile.get('success') and profile['user']['id'] == sessions['user'],
                    'Published member API bearer loses its original identity')
            response = browser.context.request.get(inst.base + '/api/v1/user/me')
            require(response.status == 200 and response.json()['user']['id'] == sessions['user'],
                    'Published member cookie loses its original identity')
            require(next((cookie['value'] for cookie in browser.context.cookies(inst.base)
                          if cookie['name'] == 'x-auth-token'), None) == sessions['browser'],
                    'Update replaces the original member browser cookie value')
            original_browser = inst.request('GET', '/api/v1/user/me', auth=sessions['browser'],
                                            label='member-original-browser-bearer-' + phase)
            require(original_browser.get('success') and original_browser['user']['id'] == sessions['user'],
                    'The original member browser bearer is no longer usable')
            inst.request('GET', '/api/v1/keeper/hub/dependencies', auth=sessions['api'], expect=(403,),
                         label='member-admin-boundary-' + phase)
            browser.settle()
            browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            browser.clean(0)
            browser.screenshot('published-member-session-' + phase)
            fixture.browser.frame.locator('.sidebar').wait_for(timeout=30000)
            fixture.browser.clean(0)
            fixture.browser.screenshot('published-admin-session-' + phase)
            inst.evidence.save('published-open-human-sessions-' + phase, {
                'member': sessions['user'], 'member_api_valid': True, 'member_cookie_valid': True,
                'member_token_digest': hashlib.sha256(sessions['browser'].encode()).hexdigest(),
                'same_browser_contexts': phase != 'restart', 'member_admin_boundary': 403})
        finally:
            browser.context.tracing.stop(path=str(trace))
            inst.evidence.paths.append(str(trace))
        if phase == 'update':
            update_source(fixture, ctx.inst.config['replace'][sessions['expansion']],
                          sessions['expansion'], live=True)
            from module_lifecycle_contract import dependency
            expanded = dependency(inst, sessions['expansion'])
            require(expanded is not None and expanded['version'] == '*',
                    'Module expansion is absent or pins its dependency declaration')
            inst.evidence.save('published-session-module-expansion', expanded)
            observe(fixture, 'expansion')

    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui, observe=observe,
                                              controller_source='keeper/keeper')


REGISTRY.append(Scenario('browser_published_human_sessions_hub_ui_update', 'regression',
    browser_published_human_sessions_hub_ui_update, ('boot',), instance_setup=True,
    issues=REGISTRY[0].issues + ('RA-B16', 'RA-B17')))
