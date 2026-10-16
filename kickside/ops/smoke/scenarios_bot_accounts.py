"""Bot-account credential exclusion at the native Users boundaries."""
from harness import Scenario, require
from module_harness import run_focused_module_test


def bot_accounts_users_auth_exclusion(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_auth_exclusion_test')


REGISTRY = [Scenario('bot_accounts_users_auth_exclusion', 'regression', bot_accounts_users_auth_exclusion,
                     issues=('RA-H02', 'RA-H04', 'RA-H26', 'RA-H27', 'RA-H28', 'RA-H29', 'RA-H30', 'RA-H45'))]


def bot_accounts_sso_auth_exclusion(ctx):
    run_focused_module_test(ctx, 'kickside/sso', 'bot_exclusion_test', lint=True)


def bot_accounts_sso_browser_admission(ctx):
    import uuid
    from runtime_fixtures import isolated_fixture
    from scenarios_hot_update_work import database_rows

    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        inst.install('kickside/sso')
        email = 'sso-admission-' + uuid.uuid4().hex[:12] + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {
            'email': email, 'password': inst.password, 'full_name': 'SSO admission account',
            'groups': ['app.security:admin'],
        }, expect=(201,), label='sso-admission-user')['user']
        token = inst.request('POST', '/api/public/user/token', {
            'email': email, 'password': inst.password,
        }, auth='', label='sso-admission-token')['token']
        inst.redactor.add(token)
        user_id = user['user_id']
        require(str(uuid.UUID(user_id)) == user_id, 'SSO admission user id is not a UUID')
        database_rows(inst, "INSERT INTO app_user_bot_accounts (user_id, created_by, created_at) "
                      "VALUES ('" + user_id + "', 'smoke-fixture', '2026-10-10T00:00:00Z') RETURNING user_id",
                      write=True)
        browser = fixture.browser_check()
        browser.context.add_cookies([{'name': 'x-auth-token', 'value': token, 'url': inst.base}])
        browser.page.goto(inst.base + '/api/public/facade/config', wait_until='domcontentloaded', timeout=30000)
        path = '/api/v1/sso/oidc/link'
        with browser.rejection('POST', path, 401) as response:
            browser.page.evaluate("""path => {
                const form = document.createElement('form');
                form.method = 'POST'; form.action = path;
                document.body.append(form); form.submit();
            }""", path)
        body = response.value.json()
        require(body.get('success') is False and body.get('error') == 'Authentication required'
                and body.get('details') == 'You must be authenticated to access this endpoint',
                'Saved ineligible browser account reaches provider discovery instead of credential admission')
        require('url' not in body and 'set-cookie' not in response.value.headers,
                'Refused browser account creates an SSO flow or redirect')
        require('Authentication required' in browser.page.locator('body').inner_text(),
                'Browser does not render the original SSO authentication refusal')
        require(database_rows(inst, "SELECT user_id FROM app_user_identities WHERE user_id='" + user_id + "'") == [],
                'Refused browser account receives a provider identity')
        inst.evidence.save('sso-browser-admission', {
            'status': response.value.status, 'body': body, 'browser': browser.page.locator('body').aria_snapshot(),
        })
        browser.screenshot('sso-browser-admission')


def bot_accounts_sso_provisioning(ctx):
    run_focused_module_test(ctx, 'kickside/sso', 'provisioner_test')


def _bot_accounts_update(ctx, suite, label):
    import os
    from pathlib import Path
    import subprocess
    import sys
    root = Path(ctx.inst.config['source']).resolve()
    evidence = ctx.inst.root / (label + '-upgrade')
    evidence.mkdir(parents=True, exist_ok=True)
    environment = dict(ctx.inst.env, PATH=str(Path(ctx.inst.config['binary']).parent)
                       + os.pathsep + ctx.inst.env.get('PATH', ''), TMPDIR=str(evidence))
    log = evidence / 'result.log'
    with log.open('w') as output:
        result = subprocess.run([sys.executable, '-m', suite,
                                 '--engine', ctx.inst.engine, '--evidence', str(evidence)],
                                cwd=root, env=environment, stdout=output, stderr=subprocess.STDOUT, timeout=900)
    require(result.returncode == 0, 'Published ' + label + ' update fails; see ' + str(log))
    ctx.inst.evidence.save(label + '-update', {'engine': ctx.inst.engine, 'status': 'pass', 'log': str(log)})


def bot_accounts_sso_update(ctx):
    _bot_accounts_update(ctx, 'ops.compat.integration.test_sso_bot_accounts_upgrade', 'sso')


def compat_migration_repeat_preservation(ctx):
    _bot_accounts_update(ctx, 'ops.compat.integration.test_migration_repeat', 'migration-repeat')


REGISTRY += [
    Scenario('compat_migration_repeat_preservation', 'regression', compat_migration_repeat_preservation,
             issues=('COMPAT-REPEAT-PRESERVATION', 'RA-C15')),
    Scenario('bot_accounts_sso_auth_exclusion', 'regression', bot_accounts_sso_auth_exclusion,
             issues=('RA-H02', 'RA-H26', 'RA-H28', 'RA-H29', 'RA-H45', 'RA-H51',
                     'SSO-LINK-CREDENTIAL-ADMISSION-ORDER', 'SSO-HARNESS-FLOW-RECEIPT-TYPE',
                     'SSO-CREDENTIAL-CONFIG-READ', 'SSO-HARNESS-AUTHENTICATED-ROUTER')),
    Scenario('bot_accounts_sso_browser_admission', 'regression', bot_accounts_sso_browser_admission,
             ('boot',), issues=('SSO-LINK-CREDENTIAL-ADMISSION-ORDER', 'SSO-CREDENTIAL-CONFIG-READ',
                               'SSO-HARNESS-AUTHENTICATED-ROUTER')),
    Scenario('bot_accounts_sso_provisioning', 'regression', bot_accounts_sso_provisioning,
             issues=('RA-H02', 'RA-H28', 'RA-H29', 'R5-RELEASE-HARNESS-COVERAGE')),
    Scenario('bot_accounts_sso_update', 'regression', bot_accounts_sso_update,
             issues=('RA-C02', 'RA-C14', 'RA-C16', 'RA-C18', 'RA-H45', 'CREDENTIAL-CONSUMER-INDEPENDENT-UPGRADE')),
]


def bot_accounts_mcp_auth_exclusion(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/mcp')
    require(source, 'MCP exclusion requires the local module')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'bot_accounts_test')


REGISTRY += [Scenario('bot_accounts_mcp_auth_exclusion', 'regression', bot_accounts_mcp_auth_exclusion,
                      issues=('RA-H32', 'RA-H33', 'RA-H45', 'RA-C08', 'USERS-TOKEN-CREDENTIAL-ELIGIBILITY'))]


def bot_accounts_mcp_update(ctx):
    _bot_accounts_update(ctx, 'ops.compat.integration.test_mcp_bot_accounts_upgrade', 'mcp')


REGISTRY += [Scenario('bot_accounts_mcp_update', 'regression', bot_accounts_mcp_update,
                      issues=('RA-C08', 'RA-C14', 'RA-C16', 'RA-C18', 'RA-H45', 'CREDENTIAL-CONSUMER-INDEPENDENT-UPGRADE'))]


def bot_accounts_identity_auth_exclusion(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/identity')
    require(source, 'Identity exclusion requires the local module')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'bot_accounts_test')


REGISTRY += [Scenario('bot_accounts_identity_auth_exclusion', 'regression', bot_accounts_identity_auth_exclusion,
                      issues=('RA-H34', 'RA-H45', 'RA-H51', 'RA-C05', 'RA-C06', 'SMOKE-IDENTITY-HTTP-AUTH-BOUNDARY'))]


def bot_accounts_identity_update(ctx):
    _bot_accounts_update(ctx, 'ops.compat.integration.test_identity_bot_accounts_upgrade', 'identity')


REGISTRY += [Scenario('bot_accounts_identity_update', 'regression', bot_accounts_identity_update,
                      issues=('RA-C05', 'RA-C06', 'RA-C14', 'RA-C16', 'RA-C18', 'RA-H45', 'CREDENTIAL-CONSUMER-INDEPENDENT-UPGRADE', 'COMPAT-IDENTITY-UPLOADS-HOST-RESOURCES'))]


def bot_accounts_host_credentials(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/mcp')
    require(source, 'Host credential admission requires the local module')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'host_credentials_test')


REGISTRY += [Scenario('bot_accounts_host_credentials', 'regression', bot_accounts_host_credentials,
                      issues=('RA-H51',))]


def bot_accounts_credential_readiness(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'credential_readiness_test')


REGISTRY += [Scenario('bot_accounts_credential_readiness', 'regression', bot_accounts_credential_readiness,
                      issues=('RA-H52',))]


def bot_accounts_session_admission(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/mcp')
    require(source, 'Session admission requires the native local harness')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'session_admission_test')


REGISTRY += [Scenario('bot_accounts_session_admission', 'regression', bot_accounts_session_admission,
                      issues=('RA-H53', 'RA-C01', 'USERS-TOKEN-CREDENTIAL-ELIGIBILITY'))]


def bot_accounts_lifecycle(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_lifecycle_test')


REGISTRY += [Scenario('bot_accounts_lifecycle', 'regression', bot_accounts_lifecycle,
                      issues=('RA-H54', 'RA-H22', 'RA-H25', 'RA-C01'))]


def bot_accounts_native_delegation(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_delegation_test')
    run_focused_module_test(ctx, 'kickside/users', 'bot_delegation_effects_test')
    run_focused_module_test(ctx, 'kickside/users', 'bot_delegation_host_test')


def bot_accounts_users_harness(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'packaging_test')


REGISTRY += [Scenario('bot_accounts_native_delegation', 'regression', bot_accounts_native_delegation,
                      issues=('RA-H06', 'RA-H07', 'RA-H08', 'RA-H09', 'RA-H10', 'RA-H11', 'RA-H12', 'RA-H13', 'RA-H22', 'RA-H45', 'RA-H20', 'RA-H35', 'RA-H36', 'RA-H37'))]

REGISTRY += [Scenario('bot_accounts_users_harness', 'regression', bot_accounts_users_harness,
                      issues=('R5-RELEASE-HARNESS-COVERAGE',))]


def bot_accounts_delegation_composition(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'delegation_composition_test')


REGISTRY += [Scenario('bot_accounts_delegation_composition', 'regression', bot_accounts_delegation_composition,
                      issues=('RA-H06', 'RA-H48', 'RA-C12'))]


def bot_accounts_delegation_administration(ctx):
    run_focused_module_test(ctx, 'kickside/security', 'delegation_admin_test')


REGISTRY += [Scenario('bot_accounts_delegation_administration', 'regression', bot_accounts_delegation_administration,
                      issues=('RA-H06', 'RA-H07', 'RA-H08', 'RA-H45', 'RA-H50', 'RA-H51', 'RA-H48'))]


def bot_accounts_delegation_http(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/security')
    require(source, 'Delegation HTTP requires the local Security module')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'delegation_http_test')


REGISTRY += [Scenario('bot_accounts_delegation_http', 'regression', bot_accounts_delegation_http,
                      issues=('RA-H06', 'RA-H07', 'RA-H26', 'RA-H31', 'RA-H45', 'RA-H50', 'RA-H51', 'SMOKE-DELEGATION-DIRECTORY-OUTAGE-BOUNDARY'))]


def bot_accounts_native_selection(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_selection_test')


REGISTRY += [Scenario('bot_accounts_native_selection', 'regression', bot_accounts_native_selection,
                      issues=('RA-H53', 'BOT-GROUP-ROOT-ISOLATION', 'RA-H07', 'RA-H08', 'RA-H09', 'RA-H10', 'RA-H12', 'RA-H13',
                              'RA-H14', 'RA-H19', 'RA-H20', 'RA-H21', 'RA-H31', 'RA-H45', 'RA-H50', 'RA-H51'))]


def bot_accounts_execution_capabilities(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_execution_capabilities_test')


REGISTRY += [Scenario('bot_accounts_execution_capabilities', 'regression', bot_accounts_execution_capabilities,
                      issues=('RA-H46',))]


def bot_accounts_execution_process(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_execution_process_test')


REGISTRY += [Scenario('bot_accounts_execution_process', 'regression', bot_accounts_execution_process,
                      issues=('RA-H46', 'PROCESS-CAPABILITY-REFUSAL'))]


def bot_accounts_login_error_typing(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'login_scope_test')


REGISTRY += [Scenario('bot_accounts_login_error_typing', 'regression', bot_accounts_login_error_typing,
                      issues=('USERS-LOGIN-MINT-ERROR-TYPE',))]


def bot_accounts_selected_install(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'selected_install_test')
    run_focused_module_test(ctx, 'kickside/automation', 'command_test')
    run_focused_module_test(ctx, 'kickside/automation', 'control_test')
    run_focused_module_test(ctx, 'kickside/automation', 'declaration_writer_test')


REGISTRY += [Scenario('bot_accounts_selected_install', 'regression', bot_accounts_selected_install,
                      issues=('RA-H56', 'RA-H14', 'RA-H19', 'RA-H20', 'RA-H21', 'RA-H50', 'AUTOMATION-SELECTED-INSTALL-PREFLIGHT'))]


def bot_accounts_selected_install_native(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_selected_install_test')


REGISTRY += [Scenario('bot_accounts_selected_install_native', 'regression', bot_accounts_selected_install_native,
                      issues=('RA-H56', 'RA-H14', 'RA-H08', 'RA-H09', 'RA-H19', 'RA-H20', 'RA-H21', 'RA-H50', 'RA-H51', 'AUTOMATION-SELECTED-ROOT-DELEGATION'))]


def bot_accounts_identity_command_capture(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_identity_command_test')


REGISTRY += [Scenario('bot_accounts_identity_command_capture', 'regression', bot_accounts_identity_command_capture,
                      issues=('RA-H20', 'RA-H21', 'RA-H19'))]


def bot_accounts_run_as_candidates(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_run_as_candidates_test', lint=True)


REGISTRY += [Scenario('bot_accounts_run_as_candidates', 'regression', bot_accounts_run_as_candidates,
                      issues=('RA-H53', 'BOT-GROUP-ROOT-ISOLATION', 'BOT-RUN-AS-CANDIDATES', 'RA-H07', 'RA-H08', 'RA-H09', 'RA-H10', 'RA-H12', 'RA-H20', 'RA-H21', 'RA-H45'))]


def bot_accounts_automation_identity_reader(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'control_test', lint=True)


REGISTRY += [Scenario('bot_accounts_automation_identity_reader', 'regression', bot_accounts_automation_identity_reader,
                      issues=('BOT-AUTOMATION-IDENTITY-EDITOR',))]


def bot_accounts_automation_identity_api(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'control_api_test')


REGISTRY += [Scenario('bot_accounts_automation_identity_api', 'regression', bot_accounts_automation_identity_api,
                      issues=('BOT-AUTOMATION-IDENTITY-EDITOR',))]


def automation_manual_source(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'manual_source_test', lint=True)


REGISTRY += [Scenario('automation_manual_source', 'regression', automation_manual_source,
                      issues=('AUTOMATION-MANUAL-SOURCE', 'AUTOMATION-MANUAL-SOURCE-POSITION'))]


def bot_accounts_manual_task(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'manual_task_test')


REGISTRY += [Scenario('bot_accounts_manual_task', 'regression', bot_accounts_manual_task,
                      issues=('BOT-MANUAL-EXECUTION-TASK',))]


def bot_accounts_session_error_typing(ctx):
    from pathlib import Path
    from module_harness import run_focused_app_test
    source = ctx.inst.config['replace'].get('kickside/mcp')
    require(source, 'Session error typing requires the native local harness')
    run_focused_app_test(ctx, Path(source) / 'test-bot-accounts', 'session_error_typing_test')


REGISTRY += [Scenario('bot_accounts_session_error_typing', 'regression', bot_accounts_session_error_typing,
                      issues=('RUNTIME-TOKENSTORE-VALIDATE-ERROR-KIND',))]


def bot_accounts_admin_creation(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_admin_creation_test', lint=True)


REGISTRY += [Scenario('bot_accounts_admin_creation', 'regression', bot_accounts_admin_creation,
                      issues=('BOT-ACCOUNT-ADMIN-CREATION', 'RA-S01', 'RA-H02', 'RA-H50', 'RA-H51'))]


def automation_control_initiation(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'control_initiation_test')
    run_focused_module_test(ctx, 'kickside/automation', 'generic_actions_test')


REGISTRY += [Scenario('automation_control_initiation', 'regression', automation_control_initiation,
                      issues=('AUTOMATION-CONTROL-INITIATION',))]


def automation_delivery_history(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'round_history_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_history_storage_test', lint=True)
    run_focused_module_test(ctx, 'kickside/automation', 'recovery_dispatch_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_bookkeeping_test')
    run_focused_module_test(ctx, 'kickside/automation', 'round_delivery_identity_test')


REGISTRY += [Scenario('automation_delivery_history', 'regression', automation_delivery_history,
                      issues=('AUTOMATION-DELIVERY-HISTORY',))]


def automation_history_reader(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'history_reader_test', lint=True)


REGISTRY += [Scenario('automation_history_reader', 'regression', automation_history_reader,
    issues=('AUTOMATION-PROTECTED-HISTORY', 'AUTOMATION-HISTORY-ERROR-PAYLOAD'))]


def bot_accounts_restriction_carrier(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_restriction_carrier_test', lint=True)


REGISTRY += [Scenario('bot_accounts_restriction_carrier', 'regression', bot_accounts_restriction_carrier,
    issues=('BOT-NONEMPTY-RESTRICTION-CARRIER', 'RA-H21', 'RA-H50', 'RA-H51'))]


def bot_accounts_host_error_kind(ctx):
    run_focused_module_test(ctx, 'kickside/users', 'bot_delegation_host_test')


REGISTRY += [Scenario('bot_accounts_host_error_kind', 'regression', bot_accounts_host_error_kind,
                      issues=('RA-H45', 'RUNTIME-SQL-FUNCS-KIND-CONTINUITY'))]
