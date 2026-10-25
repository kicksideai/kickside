"""Exercise package ownership through the live Hub installer."""
from contextlib import contextmanager
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

import yaml

from harness import Failure, Scenario, require
from data_contracts import data_contracts
from module_harness import _private_suite_root, public_source_overlay


def public_source_root(ctx):
    source = ctx.inst.config.get('source')
    require(source, 'Release source guard requires the configured public source checkout')
    root = Path(source).resolve()
    require(root.is_dir(), 'Release source guard requires the configured public source checkout')
    return root


RELEASE_PACK_QUALITY_FILES = (
    '.github/scripts/test_packaging.py',
    '.github/scripts/release_content.py',
)


@contextmanager
def public_release_pack_quality(ctx):
    """Stage private pack-quality tooling beside selected public release bytes."""
    source = public_source_root(ctx)
    with public_source_overlay(ctx, RELEASE_PACK_QUALITY_FILES) as root:
        for relative in ('app/wippy.yaml', 'app/.wippy.yaml', 'app/version.txt',
                         '.github/modules.json', '.release-please-manifest.json'):
            require((root / relative).read_bytes() == (source / relative).read_bytes(),
                    'Release pack quality must exercise selected public source: ' + relative)
        yield root


def release_content_helper(root):
    path = root / '.github/scripts/release_content.py'
    spec = importlib.util.spec_from_file_location('release_content_quality', path)
    require(spec and spec.loader, 'Release content quality helper is not importable')
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    return helper


def assert_public_app_pack_quality(ctx):
    """Pack selected app bytes without building or publishing them."""
    with public_release_pack_quality(ctx) as root:
        command = [sys.executable, '.github/scripts/test_packaging.py', '--module', 'app', '--embed']
        result = subprocess.run(command, cwd=root, capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, result.stdout + result.stderr)

        version = json.loads((root / '.release-please-manifest.json').read_text())['app']
        require(version == (root / 'app/version.txt').read_text().strip(),
                'Published application version differs from the selected release manifest')
        helper = release_content_helper(root)
        first = helper.build_pack(root / 'app', root / '.smoke/release-content-one', version, ['app:app_fs'])
        second = helper.build_pack(root / 'app', root / '.smoke/release-content-two', version, ['app:app_fs'])
        first_digest = helper.content_digest(first)
        second_digest = helper.content_digest(second)
        require(first_digest == second_digest,
                'Selected public application package content is not deterministic')
        return {'command': command, 'output': result.stdout + result.stderr,
                'version': version, 'content_digest': first_digest}


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
    require(dependency['data']['version'] == '>=0.1.32',
            'Brave shared WebScout dependency declared floor differs')


REGISTRY += [Scenario('brave_package_readme', 'full', brave_package_readme, ('boot',), issues=('WEBSCOUT-PROVIDER-HOST-BINDINGS',))]

REGISTRY += [Scenario('data_contracts', 'full', data_contracts, ('boot',))]


RELEASE_HARNESS_TOOLING = (
    'scripts/check-release-hygiene.py',
    'scripts/test-release-hygiene.py',
    'tests/test_release_hygiene.py',
    '.github/scripts/release_content.py',
    'tests/test_build_input_refresh.py',
    'tests/fixtures/previous-build-inputs.lock',
)


def release_harness_configuration(ctx):
    import subprocess
    import sys

    root = public_source_root(ctx)
    suite = _private_suite_root()
    checks = [
        (suite, 'tests.test_source_conventions', [sys.executable, '-m', 'unittest', 'tests.test_source_conventions'], 60),
        (suite, 'scripts/check-source-conventions.py', [sys.executable, 'scripts/check-source-conventions.py',
                                                         '--root', str(root)], 60),
        (suite, 'ops.compat.tests.test_fetch', [sys.executable, '-m', 'unittest',
                                                'ops.compat.tests.test_fetch'], 60),
        (suite, 'ops/smoke/coverage/tests/test_issues.py', [sys.executable, '-m', 'unittest',
         'discover', '-s', 'ops/smoke/coverage', '-p', 'test_issues.py'], 60),
    ]
    with public_source_overlay(ctx, RELEASE_HARNESS_TOOLING) as overlay:
        checks.extend([
            (overlay, 'scripts/test-release-hygiene.py', [sys.executable, 'scripts/test-release-hygiene.py'], 60),
            (overlay, 'tests.test_release_hygiene', [sys.executable, '-m', 'unittest',
                                                      'tests.test_release_hygiene'], 60),
            (overlay, 'tests.test_build_input_refresh', [sys.executable, '-m', 'unittest',
                                                          'tests.test_build_input_refresh'], 60),
        ])
        for cwd, label, command, timeout in checks:
            result = subprocess.run(command, cwd=cwd, capture_output=True, text=True, timeout=timeout)
            require(result.returncode == 0, label + ': ' + result.stdout + result.stderr)
    ctx.inst.evidence.save('release-harness-configuration', {
        'checks': [label for _, label, _, _ in checks], 'status': 'pass',
    })


REGISTRY += [Scenario('release_harness_configuration', 'full', release_harness_configuration,
                      issues=('R5-RELEASE-HISTORY-DSN', 'R5-RELEASE-HARNESS-SQLITE-PATH',
                              'R5-RELEASE-HARNESS-COVERAGE', 'NE-09', 'NE-68', 'NE-15', 'NE-01', 'NE-02', 'NE-07', 'NE-23', 'NE-71',
                              'COMPAT-INITIAL-RELEASE-CANDIDATE', 'RELEASE-FRESH-BUILD-INPUTS', 'NE-50', 'NE-235', 'NE-242', 'SMOKE-CARRIER-JSON-CLONE-CONVENTION', 'RELEASE-CONTENT-DETERMINISTIC-PACK-FIXTURE', 'MODULE-MAKE-TEST-TARGETS', 'TEMPLATE-PUBLIC-RELEASE-WORKFLOW'))]


def release_contract_invokers(ctx):
    import subprocess
    import sys

    root = public_source_root(ctx)
    suite = _private_suite_root()
    checks = {
        'tests.test_contract_surface': [sys.executable, '-m', 'unittest', 'tests.test_contract_surface'],
        'scripts/check-contract-surface.py': [sys.executable, 'scripts/check-contract-surface.py',
                                              '--root', str(root)],
    }
    for label, command in checks.items():
        result = subprocess.run(command, cwd=suite, capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, label + ': ' + result.stdout + result.stderr)
    ctx.inst.evidence.save('release-contract-invokers', {'checks': list(checks), 'status': 'pass'})


REGISTRY += [Scenario('release_contract_invokers', 'full', release_contract_invokers,
                      issues=('R5-RELEASE-CONTRACT-INVOKER',))]


def release_documentation_mirrors(ctx):
    import subprocess

    root = public_source_root(ctx)
    result = subprocess.run(['node', 'scripts/check-wiki-sources.mjs'], cwd=root / 'app',
                            capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    with public_source_overlay(ctx, ()) as overlay:
        harness = overlay / 'app/test/documentation'
        for command in (['wippy', 'update'], ['wippy', 'install'], ['wippy', 'lint']):
            result = subprocess.run(command, cwd=harness, capture_output=True, text=True, timeout=60)
            require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-documentation-mirrors', {
        'status': 'pass', 'native_commands_in_overlay': True,
    })


REGISTRY += [Scenario('release_documentation_mirrors', 'full', release_documentation_mirrors,
                      issues=('R5-RELEASE-DOCUMENTATION-MIRROR', 'R5-T03'))]


def release_runtime_profiles(ctx):
    ctx.inst.evidence.save('release-runtime-profiles', assert_public_app_pack_quality(ctx))


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
    import subprocess
    import sys
    from module_harness import _private_suite_root, run_focused_module_test, selected_module_overlay

    source = ctx.inst.config['replace'].get('kickside/hubspot')
    require(source, 'HubSpot boundary guard requires a local replacement')
    with selected_module_overlay(
            ctx, 'kickside/hubspot',
            [('providers/hubspot/scripts/check_architecture.py', 'scripts/check_architecture.py')],
            owner=_private_suite_root().parent, repository=True) as root:
        result = subprocess.run([sys.executable, 'scripts/check_architecture.py'], cwd=root,
                                capture_output=True, text=True, timeout=60)
        require(result.returncode == 0, result.stdout + result.stderr)
    run_focused_module_test(ctx, 'kickside/hubspot', 'capacity_transport_test')


REGISTRY += [Scenario('hubspot_capacity_boundary', 'regression', hubspot_capacity_boundary,
                      issues=('HUBSPOT-CAPACITY-DETAILS-BOUNDARY',))]


def release_source_boundaries(ctx):
    import subprocess
    import sys

    root = public_source_root(ctx)
    result = subprocess.run([sys.executable, '.github/scripts/test_packaging.py',
                             'PackagingTest.test_all_release_source_boundaries'],
                            cwd=root, capture_output=True, text=True, timeout=60)
    require(result.returncode == 0, result.stdout + result.stderr)
    ctx.inst.evidence.save('release-source-boundaries', {'output': result.stdout})


REGISTRY += [Scenario('release_source_boundaries', 'regression', release_source_boundaries,
                      issues=('RELEASE-SOURCE-PACKAGING-BOUNDARIES',))]


def validate_public_release_workflow(workflow):
    publish = workflow.get('jobs', {}).get('publish-app', {})
    require(publish.get('needs') == 'release-please' and
            publish.get('if') == "needs.release-please.outputs.app_created == 'true'",
            'Public application publication must be gated by its Release Please result')
    steps = publish.get('steps') or []
    checkout_index, checkout = next(((index, step) for index, step in enumerate(steps)
                                     if step.get('uses', '').startswith('actions/checkout@')), (-1, {}))
    checkout_action, checkout_pin = checkout.get('uses', '').split('@', 1) if '@' in checkout.get('uses', '') else ('', '')
    require(checkout_action == 'actions/checkout' and re.fullmatch(r'[0-9a-f]{40}', checkout_pin) and
            checkout.get('with', {}).get('ref') == '${{ needs.release-please.outputs.app_tag }}' and
            checkout.get('with', {}).get('persist-credentials') is False,
            'Public application publication must checkout the release tag through an immutable pin without credentials')
    setup_index, setup = next(((index, step) for index, step in enumerate(steps)
                               if step.get('uses', '').startswith('kicksideai/.github/actions/setup-wippy@')), (-1, {}))
    setup_action, setup_pin = setup.get('uses', '').split('@', 1) if '@' in setup.get('uses', '') else ('', '')
    runtime_version = setup.get('with', {}).get('version')
    require(setup_action == 'kicksideai/.github/actions/setup-wippy' and
            re.fullmatch(r'[0-9a-f]{40}', setup_pin) and
            isinstance(runtime_version, str) and
            re.fullmatch(r'\d+\.\d+\.\d+(?:[0-9A-Za-z.-]+)?', runtime_version),
            'Public application publication must use an immutable Wippy action pin and explicit runtime version')
    verify_index, verify = next(((index, step) for index, step in enumerate(steps)
                                 if step.get('name') == 'Build and verify application package'), (-1, {}))
    require(verify.get('run') == 'make -C app release-check VERSION="$APP_VERSION" WIPPY_BIN=wippy',
            'Public application publication must verify the release package before publication')
    publish_index, publish_step = next(((index, step) for index, step in enumerate(steps)
                                        if step.get('name') == 'Publish verified application release'), (-1, {}))
    publish_run = publish_step.get('run', '')
    require(publish_step.get('env', {}).get('WIPPY_HUB_TOKEN') == '${{ secrets.WIPPY_HUB_TOKEN }}' and
            'set -euo pipefail' in publish_run and
            'test -n "$WIPPY_HUB_TOKEN"' in publish_run and
            'wippy auth login --registry https://hub.wippy.ai --token "$WIPPY_HUB_TOKEN"' in publish_run and
            'make -C app release-publish VERSION="$APP_VERSION" WIPPY_BIN=wippy' in publish_run,
            'Public application publication must require Hub credentials and publish through its Make target')
    require(0 <= checkout_index < setup_index < verify_index < publish_index,
            'Public application publication must checkout, set up Wippy, verify, then publish in order')


def release_explicit_publication(ctx):
    root = public_source_root(ctx)
    git = subprocess.run(['git', 'rev-parse', '--is-inside-work-tree'], cwd=root,
                         capture_output=True, text=True, timeout=60)
    require(git.returncode == 0 and git.stdout.strip() == 'true',
            'Release publication guard requires the selected public Git checkout')
    workflow = yaml.safe_load((root / '.github/workflows/release.yml').read_text())
    validate_public_release_workflow(workflow)
    reordered = yaml.safe_load(yaml.safe_dump(workflow))
    release_steps = reordered['jobs']['publish-app']['steps']
    verify_index = next(index for index, step in enumerate(release_steps)
                        if step.get('name') == 'Build and verify application package')
    publish_index = next(index for index, step in enumerate(release_steps)
                         if step.get('name') == 'Publish verified application release')
    release_steps[verify_index], release_steps[publish_index] = release_steps[publish_index], release_steps[verify_index]
    try:
        validate_public_release_workflow(reordered)
    except Failure:
        pass
    else:
        require(False, 'Release workflow guard does not reject publication before verification')

    version = json.loads((root / '.release-please-manifest.json').read_text())['app']
    temporary = ctx.inst.root / 'temp'
    temporary.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='release-publication-', dir=temporary) as directory:
        fixture = Path(directory)
        copy = fixture / 'kickside'
        clone = subprocess.run(['git', 'clone', '--local', '--no-hardlinks', str(root), str(copy)],
                               capture_output=True, text=True, timeout=60)
        require(clone.returncode == 0, 'Cannot create owned public Git fixture: ' + clone.stderr)
        require(version == (copy / 'app/version.txt').read_text().strip(),
                'Release manifest version differs in the owned public Git fixture')
        makefile = copy / 'app/Makefile'
        original_makefile = makefile.read_text()
        require('release-build: build' in original_makefile,
                'Release fixture cannot find the release-build prerequisite')
        makefile.write_text(original_makefile.replace('release-build: build', 'release-build:', 1) +
                            '\nrelease-build:\n\t@:\n')
        log = fixture / 'wippy-commands.jsonl'
        wippy = fixture / 'wippy'
        wippy.write_text('#!' + sys.executable + '\nimport json, sys\nfrom pathlib import Path\n'
                         'path = Path(' + repr(str(log)) + ')\n'
                         'with path.open("a") as output: output.write(json.dumps(sys.argv[1:]) + "\\n")\n')
        wippy.chmod(0o755)
        arguments = ['WIPPY=' + str(wippy)]
        checked = subprocess.run(['make', '-C', 'app', 'release-check', 'VERSION=' + version, *arguments],
                                 cwd=copy, capture_output=True, text=True, timeout=60)
        require(checked.returncode == 0, checked.stdout + checked.stderr)
        wrong = subprocess.run(['make', '-C', 'app', 'release-publish', 'VERSION=0.0.0', *arguments],
                               cwd=copy, capture_output=True, text=True, timeout=60)
        require(wrong.returncode != 0, 'Application release publish accepts a version other than app/version.txt')
        release_tag = 'kickside-v' + version
        existing_tag = subprocess.run(['git', 'tag', '--list', release_tag], cwd=copy,
                                      capture_output=True, text=True, timeout=60)
        require(existing_tag.returncode == 0, 'Cannot inspect owned public Git fixture tags: ' + existing_tag.stderr)
        if existing_tag.stdout.strip():
            removed = subprocess.run(['git', 'tag', '--delete', release_tag], cwd=copy,
                                     capture_output=True, text=True, timeout=60)
            require(removed.returncode == 0, 'Cannot remove release tag from owned public Git fixture: ' + removed.stderr)
        missing_tag = subprocess.run(['make', '-C', 'app', 'release-publish', 'VERSION=' + version, *arguments],
                                     cwd=copy, capture_output=True, text=True, timeout=60)
        require(missing_tag.returncode != 0, 'Application release publish accepts an untagged commit')
        tagged = subprocess.run(['git', 'tag', release_tag], cwd=copy,
                                capture_output=True, text=True, timeout=60)
        require(tagged.returncode == 0, 'Cannot tag owned public Git fixture: ' + tagged.stderr)
        published = subprocess.run(['make', '-C', 'app', 'release-publish', 'VERSION=' + version, *arguments],
                                   cwd=copy, capture_output=True, text=True, timeout=60)
        require(published.returncode == 0, published.stdout + published.stderr)
        commands = [json.loads(line) for line in log.read_text().splitlines()]
        expected = ['publish', '--config', '.', '--version', version, '--registry', 'https://hub.wippy.ai']
        require(len(commands) == 2 and commands[0] == [*expected, '--dry-run', '--embed', 'app:app_fs'] and
                commands[1] == [*expected, '--embed', 'app:app_fs'],
                'Application Make release targets do not preserve verified dry-run and publish commands')
    ctx.inst.evidence.save('release-explicit-publication', {
        'version': version, 'wippy_commands': commands,
        'workflow': '.github/workflows/release.yml',
    })


REGISTRY += [Scenario('release_explicit_publication', 'regression', release_explicit_publication,
                      issues=('RELEASE-EXPLICIT-UNCHANGED-PUBLICATION',))]
