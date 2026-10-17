"""Exercise package ownership through the live Hub installer."""
from harness import Scenario, require
from data_contracts import data_contracts


def chestor_package_composition(ctx):
    inst = ctx.inst
    if inst.process is None:
        inst.prepare()
        inst.start()
        inst.manifest()
    modules = ('workspace', 'graph', 'db-schema', 'journal', 'roadmap')
    for module in modules:
        inst.install('chestor/' + module)
    result = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=1&migrations=1',
                          label='chestor-composition')
    installed = {row.get('component') for row in result['dependencies']}
    expected = {'chestor/' + module for module in modules}
    require(expected <= installed, 'Chestor composition misses modules: ' + str(expected - installed))
    require('app.http_errors_test' not in str(result), 'Chestor installation includes HTTP test fixtures')


REGISTRY = [Scenario('chestor_package_composition', 'full', chestor_package_composition, instance_setup=True)]


def brave_package_readme(ctx):
    inst = ctx.inst
    inst.install('kickside/webscout-brave')
    definition = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.webscout.providers.brave:definition', label='brave-definition')['entry']
    readme = definition['data'].get('readme', '')
    require('# kickside/webscout-brave' in readme and 'kickside.webscout:search_provider' in readme and 'api_key' in readme,
            'Installed Brave module definition lacks usable documentation')
    dependency = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.webscout.providers.brave:dep.kickside.webscout', label='brave-core-dependency')['entry']
    require(dependency['data']['version'] == '*', 'Brave constrains the shared WebScout dependency')


REGISTRY += [Scenario('brave_package_readme', 'full', brave_package_readme, ('boot',), issues=('WEBSCOUT-PROVIDER-HOST-BINDINGS',))]

REGISTRY += [Scenario('data_contracts', 'full', data_contracts, ('boot',))]


def release_harness_configuration(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    checks = {script: [sys.executable, script] for script in
             ['scripts/test-release-hygiene.py', 'tests/test_source_conventions.py',
              'scripts/check-source-conventions.py',
              '.github/scripts/test_delivery.py', '.github/scripts/test_release_content.py']}
    checks['ops.compat.tests.test_fetch'] = [sys.executable, '-m', 'unittest',
                                          'ops.compat.tests.test_fetch']
    checks['tests.test_build_input_refresh'] = [sys.executable, '-m', 'unittest',
                                              'tests.test_build_input_refresh']
    checks['ops/smoke/coverage/tests/test_issues.py'] = [sys.executable, '-m', 'unittest',
        'discover', '-s', 'ops/smoke/coverage', '-p', 'test_issues.py']
    for script, command in checks.items():
        result = subprocess.run(command, cwd=root, capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, script + ': ' + result.stdout + result.stderr)
    ctx.inst.evidence.save('release-harness-configuration', {'checks': list(checks), 'status': 'pass'})


REGISTRY += [Scenario('release_harness_configuration', 'full', release_harness_configuration,
                      issues=('R5-RELEASE-HISTORY-DSN', 'R5-RELEASE-HARNESS-SQLITE-PATH',
                              'R5-RELEASE-HARNESS-COVERAGE', 'NE-09', 'NE-68', 'NE-15', 'NE-01', 'NE-02', 'NE-07', 'NE-23', 'NE-71',
                              'COMPAT-INITIAL-RELEASE-CANDIDATE', 'RELEASE-FRESH-BUILD-INPUTS', 'NE-50', 'NE-235', 'NE-242', 'SMOKE-CARRIER-JSON-CLONE-CONVENTION', 'RELEASE-CONTENT-DETERMINISTIC-PACK-FIXTURE', 'MODULE-MAKE-TEST-TARGETS', 'TEMPLATE-PUBLIC-RELEASE-WORKFLOW'))]


def release_contract_invokers(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, 'scripts/check-contract-surface.py'], cwd=root,
                            capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-contract-invokers', {'status': 'pass'})


REGISTRY += [Scenario('release_contract_invokers', 'full', release_contract_invokers,
                      issues=('R5-RELEASE-CONTRACT-INVOKER',))]


def release_documentation_mirrors(ctx):
    from pathlib import Path
    import subprocess

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run(['node', 'scripts/check-wiki-sources.mjs'], cwd=root / 'app',
                            capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    harness = root / 'app/test/documentation'
    for command in (['wippy', 'update'], ['wippy', 'install'], ['wippy', 'lint']):
        result = subprocess.run(command, cwd=harness, capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-documentation-mirrors', {'status': 'pass'})


REGISTRY += [Scenario('release_documentation_mirrors', 'full', release_documentation_mirrors,
                      issues=('R5-RELEASE-DOCUMENTATION-MIRROR', 'R5-T03'))]


def release_runtime_profiles(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, '.github/scripts/test_packaging.py', '--module', 'app', '--embed'],
                            cwd=root, capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-runtime-profiles', {'status': 'pass'})


REGISTRY += [Scenario('release_runtime_profiles', 'full', release_runtime_profiles,
                      ('shell_vendor_build',),
                      issues=('R5-RELEASE-PUBLISHED-PROFILES',))]

REGISTRY += [Scenario('release_frontend_entrypoints', 'full', release_runtime_profiles,
                      ('shell_vendor_build',),
                      issues=('R5-RELEASE-FRONTEND-ARTIFACTS',))]


def delegation_migration_preservation(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, '-m', 'unittest',
                             'ops.compat.integration.test_delegation_upgrade'],
                            cwd=root, capture_output=True, text=True, timeout=900)
    require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('delegation-migration-preservation', {'output': result.stdout})


REGISTRY += [Scenario('delegation_migration_preservation', 'full', delegation_migration_preservation,
                      issues=('MCP-DELEGATION-UPGRADE-PRESERVATION',))]


def sync_document_provenance(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/sync', 'document_test', lint=True)


REGISTRY += [Scenario('sync_document_provenance', 'regression', sync_document_provenance,
                      issues=('SYNC-NATIVE-PROVENANCE-ERROR',))]


def channel_execution_authority(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/channel', 'execution_authority_test', lint=True)


REGISTRY += [Scenario('channel_execution_authority', 'regression', channel_execution_authority,
                      issues=('CHANNEL-HARNESS-AUTHORITY-SNAPSHOT', 'CHANNEL-SUPERVISOR-HARNESS-IMPORT-CLOSURE',))]


def hubspot_capacity_boundary(ctx):
    from pathlib import Path
    import subprocess
    import sys
    from module_harness import run_focused_module_test

    source = ctx.inst.config['replace'].get('kickside/hubspot')
    require(source, 'HubSpot boundary guard requires a local replacement')
    result = subprocess.run([sys.executable, 'scripts/check_architecture.py'], cwd=Path(source),
                            capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    run_focused_module_test(ctx, 'kickside/hubspot', 'capacity_transport_test')


REGISTRY += [Scenario('hubspot_capacity_boundary', 'regression', hubspot_capacity_boundary,
                      issues=('HUBSPOT-CAPACITY-DETAILS-BOUNDARY',))]


def release_source_boundaries(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    result = subprocess.run([sys.executable, '.github/scripts/test_packaging.py',
                             'PackagingTest.test_all_release_source_boundaries'],
                            cwd=root, capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-source-boundaries', {'output': result.stdout})


REGISTRY += [Scenario('release_source_boundaries', 'regression', release_source_boundaries,
                      issues=('RELEASE-SOURCE-PACKAGING-BOUNDARIES',))]


def release_explicit_publication(ctx):
    from pathlib import Path
    import subprocess
    import sys

    root = Path(__file__).resolve().parents[2]
    output = {}
    for script in ('.github/scripts/test_delivery.py', '.github/scripts/test_release_content.py'):
        result = subprocess.run([sys.executable, script], cwd=root, capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, script + ': ' + result.stdout + result.stderr)
        output[script] = result.stdout + result.stderr
    ctx.inst.evidence.save('release-explicit-publication', output)


REGISTRY += [Scenario('release_explicit_publication', 'regression', release_explicit_publication,
                      issues=('RELEASE-EXPLICIT-UNCHANGED-PUBLICATION',))]
