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
from scenarios_published_security_identity import expected_security_identities, identity_changes
from scenarios_runtime_batch_root import registry_entry

HERE = Path(__file__).parent / 'mocks/security_model'


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


def provider_binding_update(ctx, specification, baseline):
    module, namespace = specification['module'], specification['namespace']
    candidate = ctx.inst.config['replace'][module]
    receipts = {}
    requirement_id = namespace + '.security:user_security_scope'
    parameters = [{'name': name, 'value': value} for name, value in {
        requirement_id: BOUND_GROUP, **specification['parameters']}.items()]
    bundle_id = namespace + '.security:module_access'
    def prepare(fixture):
        inst = fixture.inst
        directory = inst.root / 'published-provider'
        receipts.update(published_source(directory, module, baseline))
        inst.config['replace'] = dict(inst.config['replace'], **{module: str(directory)})
        configuration = inst.app / '.wippy.yaml'
        config = yaml.safe_load(configuration.read_text())
        config['workspace']['replacements'] = inst.config['replace']
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
        inst.resolve_dependencies(modules=(module,))
    with isolated_fixture(ctx, config=deepcopy(ctx.inst.config), prepare=prepare) as fixture:
        inst = fixture.inst
        inst.install(module, parameters=parameters, version='=' + baseline['version'])
        before = dependency(inst, module)
        require({row['module_version'] for row in before['entries'] if row['module'] == module} == {baseline['version']},
                'Provider fixture does not install the requested published baseline')
        supplied = {row['name']: row['value'] for row in before['parameters']}
        require(all(supplied.get(row['name']) == row['value'] for row in parameters),
                'Published baseline loses an existing supplied parameter')
        inst.evidence.save('published-provider-before', {'module': module, 'archive': receipts, 'dependency': before})
        directory = inst.root / 'published-provider'
        shutil.rmtree(directory / 'src')
        shutil.copytree(candidate, directory, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
            '.git', '.wippy', 'node_modules', '__pycache__', 'test', 'lint-harness'))
        update_source(fixture, str(directory), module, live=True, refresh_session=True)
        after = dependency(inst, module)
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
