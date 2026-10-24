"""An installed application receives a usable Hub update plan."""
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import yaml

from candidate_hub_registry import CandidateHubRegistry
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
        inventory = inst.request('GET', '/api/v1/keeper/hub/dependencies',
                                 label='root-application-update-inventory')
        roots = [row for row in inventory.get('modules', [])
                 if row.get('name') == 'kickside/kickside' and row.get('is_root')]
        require(len(roots) == 1 and roots[0].get('version'),
                'Update all cannot discover the installed application root')
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


def _at_least(version, floor):
    def parsed(value):
        match = re.fullmatch(r'v?(\d+)\.(\d+)\.(\d+)', str(value))
        require(match is not None, 'Hub selected a non-semver provider dependency: ' + str(value))
        return tuple(map(int, match.groups()))
    return parsed(version) >= parsed(floor)


def _connection_contract(index):
    entries = yaml.safe_load(index.read_text()).get('entries', [])
    dependencies = [entry for entry in entries
                    if entry.get('kind') == 'ns.dependency'
                    and entry.get('component') == 'kickside/connection']
    require(len(dependencies) == 1 and dependencies[0].get('version') == '>=0.3.0',
            'Candidate source does not declare the capacity Connection contract: '
            + json.dumps(dependencies))


def _pack_candidate(inst, source, module, version):
    """Use the native packer; do not invent a catalog artifact from source text."""
    source = Path(source)
    test_root = source / 'test'
    config = test_root / '.wippy.yaml'
    require(config.is_file(), 'Candidate provider has no native package test config')
    artifact = inst.root / (module.replace('/', '-') + '-' + version + '.wapp')
    packed = subprocess.run([inst.config['binary'], '--config', str(config), 'pack',
                             '--module', module, str(artifact)], cwd=test_root,
                            env=inst.env, capture_output=True, text=True, timeout=180)
    inst.evidence.save('candidate-provider-pack', {
        'artifact': str(artifact), 'exit_code': packed.returncode,
        'stdout': packed.stdout, 'stderr': packed.stderr})
    require(packed.returncode == 0 and artifact.is_file(),
            'Native candidate pack fails: ' + packed.stderr)
    return artifact


def provider_candidate_dependency_capability(ctx):
    """Prove a real unpublished package through Keeper's Hub transport."""
    components = ('kickside/connection', 'kickside/atlassian')
    missing = [module for module in components if module not in ctx.inst.config['replace']]
    require(not missing, 'Candidate provider gate requires local sources: ' + ', '.join(missing))
    candidates = {module: ctx.inst.config['replace'][module] for module in components}
    _connection_contract(Path(candidates['kickside/atlassian']) / 'src/_index.yaml')
    candidate_version = '0.1.28'
    artifact = _pack_candidate(ctx.inst, candidates['kickside/atlassian'],
                               'kickside/atlassian', candidate_version)

    with CandidateHubRegistry(artifact, 'kickside/atlassian', candidate_version) as catalog:
        def prepare(fixture):
            # This is the supported runtime registry configuration.  The proxy
            # forwards every non-candidate RPC to the published Hub.
            fixture.inst.env['WIPPY_REGISTRY'] = catalog.url

        with published_fixture(ctx, published_app=True, prepare=prepare) as fixture:
            inst = fixture.inst
            arguments = {
                'component': 'kickside/atlassian',
                'version': '>=' + candidate_version,
                'parameters': [
                    {'name': 'kickside.atlassian:env_storage', 'value': 'app.env:store'},
                    {'name': 'kickside.atlassian:ui_server', 'value': 'app:gateway'},
                ],
                'run_migrations': True,
            }
            historical = install_historical_module(inst, 'kickside/connection', '>=0.1.0 <0.1.49')
            historical_versions = {row['module_version'] for row in historical['entries']
                                   if row['module'] == 'kickside/connection'}
            pinned_rejection = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan', arguments,
                                            expect=(409,), label='candidate-provider-pinned-connection-rejection',
                                            timeout=120)
            require(pinned_rejection.get('success') is False
                    and '>=0.3.0' in json.dumps(pinned_rejection)
                    and '<0.1.49' in json.dumps(pinned_rejection),
                    'Candidate planner does not reject the incompatible explicit historical Connection root: '
                    + json.dumps(pinned_rejection))
            # The historical installation is an explicit root requirement.  A
            # real update must first release that obsolete upper bound, just as
            # the published provider-upgrade fixture does; otherwise no solver
            # can satisfy both '<0.1.49' and this candidate's '>=0.3.0'.
            connection_plan = inst.request(
                'POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': 'kickside/connection', 'version': '*',
                 'parameters': historical['parameters'], 'run_migrations': True},
                label='candidate-provider-unrestricted-connection-plan', timeout=120)
            require(not [row for row in connection_plan.get('requirements', [])
                         if row.get('missing') or row.get('invalid')],
                    'Candidate pre-upgrade cannot release the historical Connection bound: '
                    + json.dumps(connection_plan))
            inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                         dict(connection_plan['install_payload'], run_migrations=True),
                         label='candidate-provider-unrestricted-connection-install', timeout=300)
            inst.await_keeper()
            from scenarios_issue_guards import registry_versions
            database_before = registry_versions(inst)
            try:
                plan = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan', arguments,
                                    label='candidate-provider-plan', timeout=120)
            except Exception:
                # Preserve the real catalog exchange for a rejected live plan;
                # it distinguishes a planner rejection from an unused overlay.
                inst.evidence.save('candidate-provider-catalog-traffic', {
                    'registry': catalog.url, 'artifact_sha256': catalog.digest,
                    'candidate_version': candidate_version,
                    'catalog_requests': catalog.requests,
                })
                raise
            require(not [row for row in plan.get('requirements', []) if row.get('missing') or row.get('invalid')],
                    'Candidate provider plan has unresolved requirements: ' + json.dumps(plan))
            selected = {row['module']: row for row in plan.get('graph', [])
                        if row.get('module') in components}
            require(set(selected) == set(components),
                    'Candidate provider plan omits its Connection closure: ' + json.dumps(plan.get('graph', [])))
            require(selected['kickside/atlassian'].get('version') == candidate_version,
                    'Hub does not select the candidate provider artifact: '
                    + json.dumps(selected['kickside/atlassian']))
            provider_dependencies = selected['kickside/atlassian'].get('dependencies', [])
            connection_requirement = [row for row in provider_dependencies
                                      if row.get('org') == 'kickside' and row.get('name') == 'connection']
            require(len(connection_requirement) == 1
                    and connection_requirement[0].get('version_constraint') == '>=0.3.0',
                    'Candidate provider does not declare the capacity Connection contract: '
                    + json.dumps(connection_requirement))
            require(_at_least(selected['kickside/connection'].get('version'), '0.3.0'),
                    'Hub selects an incompatible Connection artifact: ' + json.dumps(selected['kickside/connection']))
            result = inst.request('POST', '/api/v1/keeper/hub/dependencies/install',
                                  dict(plan['install_payload'], run_migrations=True),
                                  label='candidate-provider-install', timeout=300)
            require(not [row for row in result.get('execution', [])
                         if row.get('status') in ('failed', 'rollback_failed')],
                    'Candidate provider install rolls back: ' + json.dumps(result))
            inst.await_keeper()
            current = dependency(inst, 'kickside/connection')
            installed = {row['module_version'] for row in current['entries']
                         if row['module'] == 'kickside/connection'}
            require(len(installed) == 1 and all(_at_least(version, '0.3.0') for version in installed),
                    'Candidate provider leaves the historical Connection artifact installed: '
                    + json.dumps({'before': sorted(historical_versions), 'after': sorted(installed)}))
            rejected = inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                                    dict(arguments, version='>=9.9.9'), expect=(409,),
                                    label='candidate-provider-unsupported-version', timeout=120)
            require(rejected.get('code') == 'CONFLICT',
                    'Unsupported candidate version does not reject at the real planner: ' + json.dumps(rejected))
            database_after = registry_versions(inst)
            require(database_after[0] > database_before[0],
                    'Candidate install does not persist a registry history version: '
                    + json.dumps({'before': database_before, 'after': database_after}))
            kinds = [row['kind'] for row in catalog.requests]
            # The current native client uses the DownloadInfo URL embedded in
            # GetManifest, then fetches the WAPP directly; it does not make a
            # redundant GetDownloadURL RPC.  Assert every real leg instead of
            # a protocol call this runtime deliberately omits.
            require(all(kind in kinds for kind in ('candidate-version', 'candidate-get-version',
                                                   'candidate-manifest', 'artifact')),
                    'Candidate registry did not serve native catalog metadata and the packed artifact: '
                    + json.dumps(catalog.requests))
            inst.evidence.save('candidate-provider-connection-contract', {
                'registry': catalog.url, 'artifact_sha256': catalog.digest,
                'candidate_version': candidate_version,
                'historical_connection': sorted(historical_versions),
                'installed_connection': sorted(installed),
                'registry_history': {'before': database_before, 'after': database_after},
                'catalog_requests': catalog.requests,
            })


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


def hub_update_dependency_destination(ctx):
    from scenarios_automation_task_forms import frontend_specs
    frontend_specs(ctx, 'hub', ('src/app/modules_updates_and_planning.spec.ts',),
                   'hub-update-dependency-destination')


def keeper_bulk_plan_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.hub:test')


def keeper_component_ownership_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.components.build:scanner_test')
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.components.tools:resolve_touched_test')


def keeper_changelog_error_guard(ctx):
    run_focused_module_suite(ctx, 'keeper/keeper', 'keeper.knowledge.changelog:changelog_test')


REGISTRY = [Scenario('hub_update_dependency_destination', 'regression', hub_update_dependency_destination,
                     issues=('HUB-TRANSITIVE-UPDATE-DESTINATION',)),
            Scenario('regression_keeper_bulk_update_plan', 'regression', keeper_bulk_plan_guard,
                     ('boot',), issues=('KEEPER-BATCH-UPDATE-PLAN', 'HUB-UPDATE-PACKAGE-DEFAULT',
                                      'KEEPER-PLANNED-LOGICAL-SCOPES',
                                      'KEEPER-BATCH-METADATA-READ-AMPLIFICATION',
                                      'KEEPER-EMPTY-STRUCTURED-DEFAULT')),
            Scenario('regression_keeper_component_ownership', 'regression', keeper_component_ownership_guard,
                     ('boot',), issues=('KEEPER-COMPONENT-NATIVE-OWNERSHIP',)),
            Scenario('regression_keeper_changelog_errors', 'regression', keeper_changelog_error_guard,
                     ('boot',), issues=('KEEPER-CHANGELOG-WRITE-ERROR',)),
            Scenario('regression_hub_root_application_update_plan', 'regression', root_application_hub_plan,
                     ('boot',), instance_setup=True, issues=('HUB-ROOT-APPLICATION-UPDATE-PLAN', 'HUB-DEPLOYMENT-APPLICATION-INVENTORY')),
            Scenario('regression_hub_root_descriptor_literals', 'regression', root_descriptor_literals,
                     issues=('HUB-ROOT-DESCRIPTOR-LITERAL-TYPES',)),
            Scenario('regression_hub_provider_update_dependency_capability', 'regression',
                     provider_update_dependency_capability, ('boot',), instance_setup=True,
                     issues=('HUB-PROVIDER-UPDATE-DEPENDENCY-CAPABILITY',)),
            Scenario('regression_hub_candidate_provider_dependency_capability', 'regression',
                     provider_candidate_dependency_capability, ('boot',), instance_setup=True,
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


def transitive_module_update_browser(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    from scenarios_core import system

    inventory = ctx.inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0',
                                 label='transitive-update-inventory')
    declared = {row['component'] for row in inventory['dependencies']}
    candidates = sorted(row['name'] for row in inventory['modules']
                        if row['name'] not in declared and row.get('transitive')
                        and row.get('source') == 'hub' and row.get('used_by'))
    require(candidates, 'Fixture has no graph-only Hub dependency')
    component = candidates[0]
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    system(ctx, 'Modules')
    view = browser.frame.locator('kickside-hub')
    view.get_by_role('textbox', name='Search installed modules', exact=True).fill(component)
    update = view.get_by_role('button', name='Open update planner for ' + component, exact=True)
    with browser.page.expect_response(lambda response: response.request.method == 'POST'
                                      and response.url.endswith('/keeper/hub/dependencies/plan'),
                                      timeout=120000) as response:
        update.click()
    result = response.value
    body = result.json()
    ctx.inst.evidence.save('transitive-update-browser-plan', {
        'component': component, 'request': result.request.post_data_json,
        'status': result.status, 'body': body,
    })
    require(result.status == 200 and body.get('code') != 'BAD_REQUEST',
            'Modules Update rejects a graph-only dependency: ' + json.dumps(body))
    require(not result.request.post_data_json.get('id'),
            'Graph-only update supplies a dependency destination')
    dialog = view.get_by_role('dialog', name='Update module', exact=True)
    expect(dialog).to_be_visible(timeout=30000)
    expect(dialog).to_contain_text(component)
    expect(dialog).not_to_contain_text('BAD_REQUEST')
    browser.screenshot('transitive-update-browser-plan')


REGISTRY.append(Scenario('hub_transitive_module_update_browser', 'regression',
                         transitive_module_update_browser, ('boot',), instance_setup=True,
                         issues=('HUB-TRANSITIVE-UPDATE-DESTINATION',)))
