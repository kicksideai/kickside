"""Published provider identities and existing Hub bindings survive source updates."""
import base64
from copy import deepcopy
import json
from pathlib import Path
import shutil
import uuid

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test
from module_lifecycle_contract import dependency, update_source
from runtime_fixtures import isolated_fixture
from scenarios_identity_policy_upgrade import published_source
from scenarios_published_installation_update import prepare_published_deployment
from scenarios_published_security_identity import expected_security_identities, identity_changes
from scenarios_runtime_batch_root import registry_entry
from upgrade_regressions import candidate_dependency_sources

HERE = Path(__file__).parent / 'mocks/security_model'


# Code Execution 0.1.18 still wraps its trait calls through the retired
# contract result-window helper.  It was published against Contract 0.2.4;
# do not boot that archived provider against the current Contract source and
# mistake the deliberately incoherent graph for an update failure.
CODE_EXECUTION_HISTORICAL_CONTRACT = {
    'component': 'kickside/contract',
    'version': '0.2.4',
    'hash': '8967ae4cf083c3a47cf3643cd2afcac9dae9178b7054565096415310ce881ab2',
}
CODE_EXECUTION_CONTRACT_CONSTRAINTS = {
    '0.1.16': None,
    '0.1.17': '*',
    '0.1.18': '*',
}


def code_execution_historical_snapshot(module, baseline):
    """Return the explicit pre-retirement catalog snapshot for Code Execution .18.

    The old application published floating ranges, so this is deliberately a
    reproducible catalog snapshot rather than a claimed recovered production
    lock.  Its artifact receipts are checked by ``prepare_published_deployment``.
    """
    if module != 'kickside/code-execution' or baseline['version'] != '0.1.18':
        return None
    snapshot = json.loads((HERE / 'published_code_execution_018_snapshot.json').read_text())
    modules = snapshot['modules']
    require(snapshot['root'] == 'kickside/kickside', 'Historical Code Execution snapshot has no application root')
    require(len(modules) == 50, 'Historical Code Execution snapshot has an incomplete application closure')
    require(modules[module] == {'version': baseline['version'], 'hash': baseline['hash']},
            'Historical Code Execution snapshot differs from its verified provider receipt')
    require(modules['kickside/contract'] == {
        'version': CODE_EXECUTION_HISTORICAL_CONTRACT['version'],
        'hash': CODE_EXECUTION_HISTORICAL_CONTRACT['hash'],
    }, 'Historical Code Execution snapshot differs from its verified Contract receipt')
    return snapshot


def owned_candidate_application(inst, candidate):
    """Copy a candidate app into the fixture without development-only trees."""
    from scenarios_published_run_as import module_source_ignore
    require(candidate is not None, 'Historical Code Execution upgrade requires the current application source')
    candidate = Path(candidate)
    require(candidate.is_dir(), 'Historical Code Execution upgrade requires the current application source')
    owned = inst.root / 'current-code-execution-application'
    shutil.copytree(candidate, owned, ignore=module_source_ignore(candidate))
    require(owned.is_dir(), 'Historical Code Execution fixture cannot stage the current application source')
    return owned


def provider_identity_inventory(ctx):
    baselines = json.loads((HERE / 'published_provider_baselines.json').read_text())
    published = json.loads((HERE / 'published_provider_registry.json').read_text())
    current = []
    for baseline in baselines:
        module = baseline['module']
        source = ctx.inst.config['replace'].get(module)
        require(source, 'Provider identity guard requires the local source for ' + module)
        for index in (Path(source) / 'src').rglob('_index.yaml'):
            document = yaml.safe_load(index.read_text())
            current.extend({'id': document['namespace'] + ':' + entry['name'], 'kind': entry['kind']}
                           for entry in document.get('entries', []))
    expected = expected_security_identities(published, current)
    require(len(expected) == sum(row['kind'] != 'ns.definition' for row in published),
            'Provider identity guard omits a published module namespace')
    changes = identity_changes(expected, current)
    ctx.inst.evidence.save('published-provider-identities', {'baselines': baselines, 'changes': changes,
                                                           'expected': expected})
    require(not changes, 'Provider source removes published identities: ' + json.dumps(changes))


BOUND_GROUP = 'security.identity.provider:bound'
SUPPORT_GROUP = 'security.identity.provider:support'


def provider_members(fixture):
    inst = fixture.inst
    tokens = []
    for label, groups in (('bound', [SUPPORT_GROUP, BOUND_GROUP]), ('outside', [SUPPORT_GROUP])):
        email = 'provider-' + label + '-' + uuid.uuid4().hex[:10] + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
            'full_name': 'Provider ' + label + ' member'}, expect=(201,), label='provider-' + label + '-member')['user']
        inst.request('PUT', '/api/v1/users/' + user['user_id'] + '/groups',
                     {'groups': ['app.security:user', *groups]}, label='provider-' + label + '-groups')
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='provider-' + label + '-login')['token']
        inst.redactor.add(token)
        own = inst.request('GET', '/api/v1/user/me', auth=token, label='provider-' + label + '-membership')
        require(set(own['security']['groups']) == {'app.security:user', *groups},
                'Provider member retains administrator or default module membership')
        fixture.state['provider_' + label] = user['user_id']
        tokens.append(token)
    return tuple(tokens)


def archived_dependency_constraint(source, component):
    """Return an archived module's exact declared range for one component."""
    matches = []
    for index in sorted((Path(source) / 'src').glob('*.yaml')):
        document = yaml.safe_load(index.read_text())
        for entry in document.get('entries', []):
            if entry.get('kind') == 'ns.dependency' and entry.get('component') == component:
                matches.append(entry.get('version'))
    require(len(matches) <= 1, 'Published provider declares duplicate dependency on ' + component)
    return matches[0] if matches else None


def provider_historical_closure(module, baseline):
    if module != 'kickside/code-execution':
        return ()
    expected = CODE_EXECUTION_CONTRACT_CONSTRAINTS.get(baseline['version'])
    require(baseline['version'] in CODE_EXECUTION_CONTRACT_CONSTRAINTS,
            'Code Execution fixture has no verified Contract constraint for ' + baseline['version'])
    if baseline['version'] != '0.1.18':
        return ()
    return ({**CODE_EXECUTION_HISTORICAL_CONTRACT, 'provider_constraint': expected},)


def provider_binding_update(ctx, specification, baseline):
    module, namespace = specification['module'], specification['namespace']
    candidate_sources = deepcopy(ctx.inst.config['replace'])
    candidate = candidate_sources[module]
    receipts = {}
    closure = provider_historical_closure(module, baseline)
    snapshot = code_execution_historical_snapshot(module, baseline)
    current_closure_sources = {}
    requirement_id = namespace + '.security:user_security_scope'
    parameters = [{'name': name, 'value': value} for name, value in {
        requirement_id: BOUND_GROUP, **specification['parameters']}.items()]
    bundle_id = namespace + '.security:module_access'
    def prepare(fixture):
        inst = fixture.inst
        directory = inst.root / 'published-provider'
        receipts.update(published_source(directory, module, baseline))
        historical_sources = {module: str(directory)}
        if snapshot:
            application = inst.root / 'published-application'
            app_receipt = published_source(application, snapshot['root'], snapshot['modules'][snapshot['root']],
                                           application=True)
            require(app_receipt == {'version': snapshot['modules'][snapshot['root']]['version'],
                                    'sha256': snapshot['modules'][snapshot['root']]['hash']},
                    'Historical Code Execution application receipt differs from its catalog snapshot')
            runtime = yaml.safe_load((application / '.wippy.yaml').read_text())
            runtime['workspace'] = {'include_host_dependencies': True}
            (inst.app / 'src').mkdir(exist_ok=True)
            (inst.app / '.wippy.yaml').write_text(yaml.safe_dump(runtime, sort_keys=False))
            deployed = prepare_published_deployment(inst, snapshot['modules'], root=snapshot['root'])
            expected_deployment = {component: {'version': row['version'], 'sha256': row['hash']}
                                   for component, row in snapshot['modules'].items()}
            require(deployed == expected_deployment,
                    'Historical Code Execution deployment differs from its catalog snapshot')
            receipts.update(deployed)
            inst.config.update(source=None, published=None, replace=historical_sources)
        else:
            for closure_entry in closure:
                component = closure_entry['component']
                current = inst.config['replace'].get(component)
                require(current, 'Provider fixture needs the current source for ' + component)
                current_closure_sources[component] = current
                archived = inst.root / ('published-' + component.replace('/', '-'))
                receipt = published_source(archived, component, closure_entry)
                require(receipt == {'version': closure_entry['version'], 'sha256': closure_entry['hash']},
                        'Published closure receipt differs from its pinned artifact: ' + component)
                historical_sources[component] = str(archived)
                receipts[component] = receipt
        if module == 'kickside/code-execution':
            expected = CODE_EXECUTION_CONTRACT_CONSTRAINTS[baseline['version']]
            require(archived_dependency_constraint(directory, 'kickside/contract') == expected,
                    'Published Code Execution Contract constraint differs from its verified archive')
        inst.config['replace'] = dict(inst.config['replace'], **historical_sources)
        configuration = inst.app / '.wippy.yaml'
        config = yaml.safe_load(configuration.read_text())
        config.setdefault('workspace', {})['replacements'] = inst.config['replace']
        configuration.write_text(yaml.safe_dump(config, sort_keys=False))
        declaration = inst.app / 'src/published-provider-installation'
        declaration.mkdir()
        entries = [
            {'name': 'bound', 'kind': 'security.scope', 'policies': []},
            {'name': 'support', 'kind': 'security.scope', 'policies': []},
            {'name': 'bound_composition', 'kind': 'registry.entry',
             'meta': {'type': 'kickside.security.group_composition'}, 'group_id': BOUND_GROUP,
             'policies': [bundle_id]},
            {'name': 'support_composition', 'kind': 'registry.entry',
             'meta': {'type': 'kickside.security.group_composition'}, 'group_id': SUPPORT_GROUP,
             'policies': ['kickside.component.security:module_access', 'kickside.connection.security:module_access',
                          'kickside.knowledge.security:module_access']},
        ]
        (declaration / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0',
            'namespace': 'security.identity.provider', 'entries': entries}, sort_keys=False))
        dependencies = [dict(row, name='provider-support-' + str(index), kind='ns.dependency', version='*')
                        for index, row in enumerate(specification.get('dependencies', []))]
        if baseline['declared']:
            dependencies.append({'name': 'historical-provider', 'kind': 'ns.dependency', 'component': module,
                                 'version': '=' + baseline['version'], 'parameters': parameters})
        if dependencies:
            installation = inst.app / 'src/published-provider-dependency'
            installation.mkdir()
            (installation / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'app.deps',
                'entries': dependencies}, sort_keys=False))
        if specification.get('prepare'):
            specification['prepare'](fixture)
        inst.resolve_dependencies(modules=tuple(historical_sources))
    fixture_config = deepcopy(ctx.inst.config)
    if snapshot:
        fixture_config.update(source=None, published=snapshot['modules'][snapshot['root']]['version'], replace={})
    with isolated_fixture(ctx, config=fixture_config, prepare=prepare) as fixture:
        inst = fixture.inst
        inst.install(module, parameters=parameters, version='=' + baseline['version'])
        before = dependency(inst, module)
        require({row['module_version'] for row in before['entries'] if row['module'] == module} == {baseline['version']},
                'Provider fixture does not install the requested published baseline')
        supplied = {row['name']: row['value'] for row in before['parameters']}
        require(all(supplied.get(row['name']) == row['value'] for row in parameters),
                'Published baseline loses an existing supplied parameter')
        inst.evidence.save('published-provider-before', {'module': module, 'archive': receipts, 'dependency': before})
        if snapshot:
            source_root = ctx.inst.config.get('source')
            candidate_app = Path(source_root) / 'app' if source_root else None
            candidate_app = owned_candidate_application(inst, candidate_app)
            staged_sources = candidate_dependency_sources(candidate_sources, (snapshot['root'], module),
                                                          application=candidate_app)
            inst.evidence.save('published-provider-candidate-application', {
                'declared_source': str(Path(source_root) / 'app'), 'staged_source': str(candidate_app),
                'excluded': ['.git', '.wippy', 'wippy.lock', 'node_modules', '__pycache__', 'test', 'tests', 'lint-harness'],
            })
            update_source(fixture, str(candidate_app), snapshot['root'],
                          replacements=staged_sources, refresh_session=True)
            # The staged root update brings the complete candidate graph into
            # the restarted runtime.  Only then may the retained provider root
            # be installed from its current local source.  A local source can
            # deliberately retain the published coordinate, so the source
            # provenance—not a fabricated version bump—is the transition.
            update_source(fixture, candidate, module, live=True, refresh_session=True)
            require(inst.config['replace'].get(module) == candidate,
                    'Current provider Hub install does not retain the candidate source selection')
            updates = [snapshot['root'], module]
        else:
            directory = inst.root / 'published-provider'
            shutil.rmtree(directory / 'src')
            shutil.copytree(candidate, directory, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
                '.git', '.wippy', 'node_modules', '__pycache__', 'test', 'lint-harness'))
            update_source(fixture, str(directory), module, live=True, refresh_session=True)
            for closure_entry in closure:
                component = closure_entry['component']
                update_source(fixture, current_closure_sources[component], component, live=True)
            updates = [module, *(row['component'] for row in closure)]
        inst.evidence.save('published-provider-upgrade-order', {
            'baseline': baseline, 'historical_closure': closure,
            'catalog_snapshot': snapshot and {'cutoff': snapshot['catalog_cutoff'], 'root': snapshot['root']},
            'updates': updates,
        })
        after = dependency(inst, module)
        resolved_after = {row['module_version'] for row in after['entries'] if row['module'] == module}
        if snapshot:
            require(len(resolved_after) == 1,
                    'Current provider Hub install has no unique Code Execution selection')
        updated = {row['name']: row['value'] for row in after['parameters']}
        require(all(updated.get(name) == value for name, value in supplied.items()),
                'Hub update drops or rewrites an existing provider binding')
        for row in parameters:
            registry_entry(inst, row['name'], 'updated-provider-requirement')
        requirement = registry_entry(inst, requirement_id, 'updated-provider-security-requirement')
        endpoint = registry_entry(inst, specification['endpoint_component'], 'updated-endpoint-component')
        require(requirement['data']['targets'] == [{'entry': endpoint['id'], 'path': '.groups +='}],
                'Historical requirement changes its endpoint component target')
        require(BOUND_GROUP in endpoint['data']['groups'], 'Historical requirement no longer attaches its endpoint policy')
        bundle = registry_entry(inst, bundle_id, 'updated-provider-bundle')
        require(endpoint['id'] in bundle['meta']['includes'], 'Selectable provider bundle does not compose the historical component')
        catalog = inst.request('GET', '/api/v1/security/policies', label='updated-public-provider-policies')['policies']
        require(any(row['id'] == bundle_id and row.get('intent') == 'module_access' for row in catalog),
                'Provider bundle is not publicly selectable')
        member_token, outside_token = provider_members(fixture)
        access = specification['probe'](fixture, member_token, outside_token)
        inst.evidence.save('published-provider-after', {'module': module, 'archive': receipts, 'dependency': after,
            'current_provider_selection': {'versions': sorted(resolved_after),
                                           'source': inst.config['replace'].get(module)},
            'endpoint_component': endpoint, 'requirement': requirement, 'bundle': bundle, 'access': access})


def code_execution_probe(fixture, member_token, outside_token):
    inst = fixture.inst
    path = '/api/v1/code-execution/sdk-reference'
    result = inst.request('GET', path, auth=member_token, label='updated-provider-member-endpoint')
    denied = inst.request('GET', path, auth=outside_token, expect=(403,), label='updated-provider-outside-endpoint')
    return {'path': path, 'member': result, 'outside': denied, 'member_status': 200, 'outside_status': 403}


def share_provider_component(fixture, component_id):
    for label in ('bound', 'outside'):
        fixture.inst.request('POST', '/api/v1/component-access/share/' + component_id,
            {'subject_type': 'user', 'subject_id': fixture.state['provider_' + label], 'access_mask': 3},
            label='provider-' + label + '-component-share')


def kb10_probe(fixture, member_token, outside_token):
    inst = fixture.inst
    created = inst.request('POST', '/api/v1/knowledge/create', {'name': 'Published provider knowledge',
        'kb_type': 'document', 'embedding_model': 'fixture/embedding'}, label='provider-kb-create')
    component_id = created['id']
    share_provider_component(fixture, component_id)
    path = '/api/v1/kb10/' + component_id + '/browse'
    result = inst.request('GET', path, auth=member_token, label='updated-provider-member-endpoint')
    require(result.get('success') and result.get('nodes') == [], 'Updated KB10 member does not browse its real knowledge base')
    denied = inst.request('GET', path, auth=outside_token, expect=(403,), label='updated-provider-outside-endpoint')
    return {'path': path, 'member': result, 'outside': denied, 'member_status': 200, 'outside_status': 403}


def prepare_simplefin(fixture):
    inst = fixture.inst
    base = fixture.fixtures.start('simplefin')
    inst.cleanup.add('published-provider-bank-fixture', fixture.fixtures.stop)
    fixture.state['simplefin_base'] = base
    directory = inst.app / 'src/published-provider-transport'
    directory.mkdir()
    (directory / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'security.identity.transport',
        'entries': [
            {'name': 'egress', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'resources': [base + '/*'], 'actions': ['http_client.request'], 'effect': 'allow'}},
            {'name': 'loopback', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'resources': ['127.0.0.1'], 'actions': ['http_client.private_ip'], 'effect': 'allow'}},
        ]}, sort_keys=False))


def simplefin_probe(fixture, member_token, outside_token):
    inst = fixture.inst
    base = fixture.state['simplefin_base']
    token = base64.b64encode((base + '/simplefin/claim/northwind').encode()).decode()
    created = inst.request('POST', '/api/v1/connections', {'impl_id': 'kickside.simplefin.connection:simplefin_connection',
        'name': 'Published provider bank feed', 'private_context': {'setup_token': token}, 'validate': True},
        label='provider-bank-connect')
    component_id = created['component_id']
    share_provider_component(fixture, component_id)
    path = '/api/v1/simplefin/connections/' + component_id
    body = {'setup_token': base64.b64encode((base + '/simplefin/claim/rotated').encode()).decode()}
    denied = inst.request('PUT', path, body, auth=outside_token, expect=(403,), label='updated-provider-outside-endpoint')
    require(not any(row['path'] == '/simplefin/claim/rotated' for row in fixture.fixtures.requests('simplefin')),
            'Outside member reaches the SimpleFIN credential handler')
    result = inst.request('PUT', path, body, auth=member_token, label='updated-provider-member-endpoint')
    require(result.get('success') and result.get('component_id') == component_id and result.get('account_count') == 1,
            'Updated SimpleFIN member does not rotate and probe its real connection')
    records = fixture.fixtures.requests('simplefin')
    require(any(row['path'] == '/simplefin/claim/rotated' and row['status'] == 200 for row in records),
            'SimpleFIN member never claims its replacement credential')
    inst.evidence.save('published-provider-bank-requests', records)
    return {'path': path, 'member': result, 'outside': denied, 'member_status': 200, 'outside_status': 403}


PROVIDERS = {
    'kickside/code-execution': {'namespace': 'kickside.code_execution',
        'endpoint_component': 'kickside.code_execution.security:endpoint_access', 'probe': code_execution_probe,
        'parameters': {'kickside.code_execution:api_router': 'app:api', 'kickside.code_execution:ui_server': 'app:gateway'}},
    'kickside/kb10': {'namespace': 'kickside.kb10', 'endpoint_component': 'kickside.kb10.security:kb10_endpoint_access',
        'probe': kb10_probe, 'issues': ('SMOKE-PUBLISHED-PROVIDER-BOOT-GRAPH',), 'dependencies': [{'component': 'kickside/knowledge', 'parameters': [
            {'name': 'kickside.knowledge:api_router', 'value': 'app:api'},
            {'name': 'kickside.knowledge:ui_server', 'value': 'app:gateway'}]}], 'parameters': {'kickside.kb10:api_router': 'app:api', 'kickside.kb10:ui_server': 'app:gateway',
            'kickside.kb10:target_db': 'app:db', 'kickside.kb10:process_host': 'app:processes'}},
    'kickside/simplefin': {'namespace': 'kickside.simplefin',
        'endpoint_component': 'kickside.simplefin.security:simplefin_endpoint_access', 'probe': simplefin_probe,
        'prepare': prepare_simplefin,
        'parameters': {'kickside.simplefin:api_router': 'app:api', 'kickside.simplefin:ui_server': 'app:gateway'}},
}


def published_provider_binding_update(ctx, module):
    baselines = json.loads((HERE / 'published_provider_update_baselines.json').read_text())[module]
    for baseline in baselines:
        provider_binding_update(ctx, dict(PROVIDERS[module], module=module), baseline)


REGISTRY = [
    Scenario('regression_kb10_queued_job_fixture', 'regression',
             lambda ctx: run_focused_module_test(ctx, 'kickside/kb10', 'maintenance_worker_test'),
             issues=('SMOKE-KB10-QUEUED-JOB-FIXTURE',)),
    Scenario('regression_published_provider_identity', 'regression', provider_identity_inventory,
             issues=('PUBLISHED-PROVIDER-SECURITY-IDENTITY', 'PUBLISHED-CODE-EXECUTION-REQUIREMENT-RETIREMENT',
                     'PUBLISHED-KB10-REQUIREMENT-RETIREMENT', 'PUBLISHED-SIMPLEFIN-REQUIREMENT-RETIREMENT')),
    *[Scenario('regression_published_' + module.split('/')[1].replace('-', '_') + '_binding_update', 'regression',
              lambda ctx, selected=module: published_provider_binding_update(ctx, selected),
              ('boot',), instance_setup=True, issues=(issue, 'SMOKE-LOGIN-AUTHORITY-READINESS', *PROVIDERS[module].get('issues', ())))
      for module, issue in (('kickside/code-execution', 'PUBLISHED-CODE-EXECUTION-REQUIREMENT-RETIREMENT'),
                            ('kickside/kb10', 'PUBLISHED-KB10-REQUIREMENT-RETIREMENT'),
                            ('kickside/simplefin', 'PUBLISHED-SIMPLEFIN-REQUIREMENT-RETIREMENT'))],
]
