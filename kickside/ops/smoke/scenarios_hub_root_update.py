"""An installed application receives a usable Hub update plan."""
import json
from pathlib import Path
import sqlite3

from harness import Scenario, require
from module_lifecycle_contract import dependency, install_latest, published_fixture, versions
from mcp_contracts import open_keeper_application
from module_harness import run_focused_module_test, run_focused_module_suite


def root_descriptor_literals(ctx):
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, 'app/test/test_published_interfaces.py',
        'PublishedInterfaces.test_deployment_inputs_have_real_defaulted_targets_without_cloud_execution'],
        cwd=root, capture_output=True, text=True, timeout=60)
    ctx.inst.evidence.save('root-descriptor-literals', {
        'exit_code': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr})
    require(result.returncode == 0, 'Root deployment descriptor literals: ' + result.stdout + result.stderr)


def root_application_hub_plan(ctx):
    with published_fixture(ctx, published_app=True) as fixture:
        inst = fixture.inst
        latest = versions(inst, 'kickside/kickside')[-1]
        plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                            {'component': 'kickside/kickside', 'version': '>=' + latest,
                             'run_migrations': True}, label='root-application-update-plan', timeout=120)
        unresolved = [row for row in plan.get('requirements', [])
                      if row.get('missing') or row.get('invalid')]
        require(not unresolved and not plan.get('missing_requirements'),
                'Installed root application has no usable Hub update plan: '
                + json.dumps([row.get('name') for row in unresolved]))


def install_historical_module(inst, module, constraint, excluded_parameters=()):
    existing = dependency(inst, module)
    require(existing, 'Upgrade fixture requires the installed ' + module)
    parameters = {row['name']: row for row in existing['parameters']
                  if row['name'] not in excluded_parameters}
    bindings = json.loads((Path(__file__).parent / 'mocks/access_install_parameters.json').read_text())
    parameters.update({row['name']: row for row in bindings[module]['parameters']})
    plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                        {'component': module, 'version': constraint,
                         'parameters': list(parameters.values()), 'run_migrations': True},
                        label='historical-module-plan', timeout=120)
    inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                 dict(plan['install_payload'], run_migrations=True),
                 label='historical-module-install', timeout=300)
    inst.await_keeper()
    return dependency(inst, module)


def provider_update_dependency_capability(ctx):
    with published_fixture(ctx, published_app=True) as fixture:
        inst = fixture.inst
        existing = install_historical_module(inst, 'kickside/connection', '>=0.1.0 <0.1.49')
        plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                            {'component': 'kickside/connection', 'version': '*',
                             'parameters': existing['parameters']},
                            label='unrestricted-connection-plan', timeout=120)
        inst.request('POST', '/api/v1/keeper/hub/dependencies/install', plan['install_payload'],
                     label='unrestricted-connection-install', timeout=300)
        inst.await_keeper()
        arguments = {'component': 'kickside/atlassian',
                     'version': '>=' + versions(inst, 'kickside/atlassian')[-1],
                     'parameters': [
                         {'name': 'kickside.atlassian:env_storage', 'value': 'app.env:store'},
                         {'name': 'kickside.atlassian:ui_server', 'value': 'app:gateway'}]}
        plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan', arguments,
                            label='provider-update-plan', timeout=120)
        require(not [row for row in plan.get('requirements', []) if row.get('missing') or row.get('invalid')],
                'Provider update has unresolved requirements')
        inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                     dict(plan['install_payload'], run_migrations=True),
                     label='provider-update-install', timeout=300)
        inst.await_keeper()


def package_default_update(ctx, module, constraint, parameter):
    with published_fixture(ctx, published_app=True) as fixture:
        inst = fixture.inst
        existing = install_historical_module(inst, module, constraint, (parameter,))
        plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                            {'component': module, 'version': '>=' + versions(inst, module)[-1],
                             'parameters': existing['parameters']}, label='module-update-plan', timeout=120)
        unresolved = [row for row in plan.get('requirements', []) if row.get('missing') or row.get('invalid')]
        require(not unresolved, module + ' update cannot use its package resource default: '
                + json.dumps([row.get('name') for row in unresolved]))


def ui_update_package_default(ctx):
    package_default_update(ctx, 'kickside/ui', '>=0.1.0 <0.1.34', 'kickside.ui:branding_fs')


def inbox_update_package_default(ctx):
    package_default_update(ctx, 'kickside/inbox', '>=0.1.0 <0.1.55',
                           'kickside.inbox.security:assignment_security_scope')


def keeper_embedded_settings(ctx):
    for splash in ('welcome', 'first_agent'):
        ctx.inst.request('POST', '/api/v1/ui/splash/' + splash + '/seen', label='fixture-' + splash)
    browser = ctx.browser_check()
    start = len(browser.errors)
    browser.login()
    frame = open_keeper_application(ctx, browser)
    frame.get_by_role('button', name='Settings', exact=True).click()
    frame.get_by_role('button', name='MCP', exact=True).click()
    frame.get_by_role('button', name='New Token', exact=True).wait_for(timeout=30000)
    browser.settle()
    browser.clean(start)


def kb10_query_log_upgrade(ctx):
    run_focused_module_test(ctx, 'kickside/kb10', 'query_log_migration_test')


def failed_install_preserves_catalog(ctx):
    from runtime import psql
    with published_fixture(ctx, module='kickside/kb10', published_app=True) as fixture:
        inst = fixture.inst
        installed = install_latest(inst, module='kickside/kb10')
        def catalog(label):
            rows = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=1&migrations=1',
                                label=label, timeout=120)['dependencies']
            return {row['id']: sorted((entry['id'], entry['module'], entry['module_version'])
                                     for entry in row['entries']) for row in rows}
        before = catalog('before-rejected-upgrade')
        migration = 'kickside.kb10.migrations:05_retrieval_observations'
        remove_receipt = "DELETE FROM _migrations WHERE id = '" + migration + "'"
        if inst.engine == 'postgres':
            statement = """CREATE FUNCTION reject_migration_receipt() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN RAISE EXCEPTION 'deliberate upgrade rejection'; END $$;
                CREATE TRIGGER reject_migration_receipt BEFORE INSERT ON _migrations
                FOR EACH ROW EXECUTE FUNCTION reject_migration_receipt();
                """ + remove_receipt
            psql(dict(inst.config['pg'], maintenance=inst.db), inst.env, statement)
        else:
            with sqlite3.connect(inst.root / 'data/app.db') as db:
                db.executescript("""CREATE TRIGGER reject_migration_receipt BEFORE INSERT ON _migrations
                    BEGIN SELECT RAISE(ABORT, 'deliberate upgrade rejection'); END;
                    """ + remove_receipt)
        rejected = inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
            {'component': 'kickside/kb10', 'version': '*', 'parameters': installed['parameters'],
             'run_migrations': True}, expect=(500,), label='rejected-upgrade', timeout=300)
        require(rejected.get('code') == 'MIGRATIONS_FAILED', 'Upgrade does not reach migration rejection')
        after = catalog('after-rejected-upgrade')
        changed = [identifier for identifier in before.keys() | after.keys()
                   if before.get(identifier) != after.get(identifier)]
        require(not changed, 'Failed Hub install changes the installed module catalog: ' + json.dumps(changed))
        if inst.engine == 'postgres':
            psql(dict(inst.config['pg'], maintenance=inst.db), inst.env,
                 'DROP TRIGGER reject_migration_receipt ON _migrations; DROP FUNCTION reject_migration_receipt()')
        else:
            with sqlite3.connect(inst.root / 'data/app.db') as db:
                db.execute('DROP TRIGGER reject_migration_receipt')
        session = inst.token
        with fixture.paused():
            pass
        inst.request('GET', '/api/v1/user/me', auth=session, label='session-after-rejected-upgrade-reboot')
        require(catalog('catalog-after-rejected-upgrade-reboot') == before,
                'Reboot after a rejected Hub install changes the module catalog')


def keeper_bulk_plan_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.hub:test')


def keeper_component_ownership_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.components.build:scanner_test')
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.components.tools:resolve_touched_test')


def keeper_changelog_error_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.knowledge.changelog:changelog_test')


REGISTRY = [Scenario('regression_keeper_bulk_update_plan', 'regression', keeper_bulk_plan_guard,
                     ('boot',), issues=('KEEPER-BATCH-UPDATE-PLAN', 'HUB-UPDATE-PACKAGE-DEFAULT',
                                      'KEEPER-PLANNED-LOGICAL-SCOPES',
                                      'KEEPER-BATCH-METADATA-READ-AMPLIFICATION',
                                      'KEEPER-EMPTY-STRUCTURED-DEFAULT')),
            Scenario('regression_keeper_component_ownership', 'regression', keeper_component_ownership_guard,
                     ('boot',), issues=('KEEPER-COMPONENT-NATIVE-OWNERSHIP',)),
            Scenario('regression_keeper_changelog_errors', 'regression', keeper_changelog_error_guard,
                     ('boot',), issues=('KEEPER-CHANGELOG-WRITE-ERROR',)),
            Scenario('regression_hub_root_application_update_plan', 'regression', root_application_hub_plan,
                     ('boot',), instance_setup=True, issues=('HUB-ROOT-APPLICATION-UPDATE-PLAN',)),
            Scenario('regression_hub_root_descriptor_literals', 'regression', root_descriptor_literals,
                     issues=('HUB-ROOT-DESCRIPTOR-LITERAL-TYPES',)),
            Scenario('regression_hub_provider_update_dependency_capability', 'regression',
                     provider_update_dependency_capability, ('boot',), instance_setup=True,
                     issues=('HUB-PROVIDER-UPDATE-DEPENDENCY-CAPABILITY',)),
            Scenario('regression_hub_ui_update_package_default', 'regression', ui_update_package_default,
                     ('boot',), instance_setup=True, issues=('HUB-UPDATE-PACKAGE-DEFAULT',)),
            Scenario('regression_hub_inbox_update_package_default', 'regression', inbox_update_package_default,
                     ('boot',), instance_setup=True, issues=('HUB-UPDATE-PACKAGE-DEFAULT',)),
            Scenario('regression_hub_keeper_embedded_settings', 'regression', keeper_embedded_settings,
                     ('boot',), issues=('HUB-KEEPER-EMBEDDED-SETTINGS',)),
            Scenario('regression_kb10_query_log_upgrade', 'regression', kb10_query_log_upgrade,
                     ('boot',), issues=('KB10-RETRIEVAL-MIGRATION-PRESERVATION',)),
            Scenario('regression_hub_failed_install_preserves_catalog', 'regression', failed_install_preserves_catalog,
                     ('boot',), instance_setup=True, issues=('HUB-INSTALL-ROLLBACK-CATALOG', 'HUB-REBOOT-AFTER-FAILED-INSTALL'))]
