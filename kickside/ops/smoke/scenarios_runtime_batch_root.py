"""Root and module batch replacement preserves authored requirement bindings."""
import json
from pathlib import Path
import socket
from urllib.parse import quote

from harness import Scenario, require
from module_lifecycle_contract import HUB, published_fixture, versions


def registry_entry(inst, identifier, label):
    return inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(identifier, safe=''),
                        label=label)['entry']


def binding_values(inst, identifier, label):
    requirement = registry_entry(inst, identifier, label + '-requirement')
    namespace = identifier.split(':', 1)[0]
    for target in requirement['data']['targets']:
        target_id = target['entry'] if ':' in target['entry'] else namespace + ':' + target['entry']
        actual = registry_entry(inst, target_id, label + '-target')
        path = target['path'].strip()
        append = path.endswith('+=')
        if append:
            path = path[:-2].strip()
        parts = path.lstrip('.').split('.')
        if parts[0] not in ('data', 'meta'):
            actual = actual['data']
        for part in parts:
            actual = actual[part]
        yield target_id, target['path'], actual, append


def assert_bindings(inst, expected, label):
    for identifier, value in expected.items():
        for target_id, path, actual, append in binding_values(inst, identifier, label):
            require(value in actual if append else actual == value, identifier + ' loses its binding at ' + target_id
                    + path + ': ' + json.dumps(actual))


def resident_inventory(rows, selected):
    return {row['id']: {'component': row['component'], 'version': row['version'],
                       'parameters': row['parameters'],
                       'entries': sorted((entry['id'], entry['kind'], entry['module'], entry['module_version'])
                                         for entry in row['entries'])}
            for row in rows if row['component'] not in selected}


def install_bindings(inst, dependency, expected, label):
    namespace = next(entry['id'].split(':', 1)[0] for entry in dependency['entries']
                     if entry['kind'] == 'ns.definition' and entry['module'] == dependency['component'])
    requirements = [entry['id'] for entry in dependency['entries'] if entry['kind'] == 'ns.requirement']
    parameters = {}
    for row in dependency['parameters']:
        name = row['name']
        addresses = [name] if ':' in name else [identifier for identifier in requirements
            if identifier.split(':', 1)[1] == name and (identifier.split(':', 1)[0] == namespace
                or identifier.split(':', 1)[0].startswith(namespace + '.'))]
        remaining = [identifier for identifier in addresses if identifier not in expected]
        if len(remaining) == len(addresses):
            parameters[name] = row
        else:
            parameters.update({identifier: {'name': identifier, 'value': row['value']}
                               for identifier in remaining})
    parameters.update({name: {'name': name, 'value': value} for name, value in expected.items()})
    module = {'id': dependency['id'], 'component': dependency['component'], 'version': '*',
              'parameters': list(parameters.values()), 'run_migrations': True}
    plan = inst.request('POST', HUB + '/plan', module, label=label, timeout=120)
    inst.request('POST', HUB + '/install', plan['install_payload'], label=label + '-install', timeout=300)
    inst.await_keeper()
    assert_bindings(inst, expected, label + '-binding')


def batch_bindings(ctx, selected_modules=None):
    with published_fixture(ctx, published_app=True) as fixture:
        inst = fixture.inst
        installed = inst.request('GET', HUB + '?entries=1&migrations=1',
                                 label='batch-root-inventory', timeout=120)['dependencies']
        core = next(row for row in installed if row['component'] == 'kickside/core')
        binding = 'kickside.core.security:user_security_scope'
        original_binding = registry_entry(inst, binding, 'batch-original-binding')['data']['default']
        expected = {binding: 'app.security:admin'}
        install_bindings(inst, core, expected, 'batch-root-module-baseline')
        if not selected_modules:
            users = next(row for row in installed if row['component'] == 'kickside/users')
            user_binding = {'kickside.users:login_role_resource': 'app.security:*'}
            install_bindings(inst, users, user_binding, 'batch-users-address-baseline')
            expected.update(user_binding)
        installed = inst.request('GET', HUB + '?entries=1&migrations=1',
                                 label='batch-root-configured-inventory', timeout=120)['dependencies']
        selected = set(selected_modules) if selected_modules else {row['component'] for row in installed}
        residents = resident_inventory(installed, selected)
        if selected_modules:
            require(residents, 'The partial batch has no unselected resident modules')
        dependencies = [{'id': row['id'], 'component': row['component'], 'version': '*',
                         'parameters': row['parameters']} for row in installed if row['component'] in selected]
        application = 'kickside/kickside'
        root = next((row for row in dependencies if row['component'] == application), None)
        if root is None:
            root = {'component': application, 'version': '>=' + versions(inst, application)[-1],
                    'parameters': []}
        dependencies = [row for row in dependencies if row['component'] != application]
        for label, batch in (('root-first', [root] + dependencies), ('root-last', dependencies + [root])):
            plan = inst.request('POST', HUB + '/plan', {'dependencies': batch, 'run_migrations': True},
                                label='batch-' + label + '-plan', timeout=120)
            require(plan.get('applicable') is True and plan.get('native_plan'), 'Root batch plan is not applicable')
            require(not any(item.get('missing_requirements') or any(row.get('missing') or row.get('invalid')
                        for row in item.get('requirements', [])) for item in plan['plans']),
                    'Root batch plan has unresolved requirements')
        result = inst.request('POST', HUB + '/install', dict(plan['install_payload'], run_migrations=True),
                              label='batch-root-install', timeout=300)
        require(not [row for row in result.get('execution', []) if row.get('status') in ('failed', 'rollback_failed')],
                'Root batch install fails')
        require(sum(row.get('step') == 'governance' for row in result.get('execution', [])) == 1,
                'Root batch does not commit one governance changeset')
        inst.await_keeper()
        assert_bindings(inst, expected, 'batch-root-installed')
        if residents:
            after = inst.request('GET', HUB + '?entries=1&migrations=1',
                                 label='batch-resident-installed-inventory', timeout=120)['dependencies']
            require(resident_inventory(after, selected) == residents, 'The batch changes an unselected resident module')
        fixture.close_browser()
        inst.stop()
        inst.start()
        inst.request('GET', '/api/v1/user/me', label='batch-root-reboot-access')
        assert_bindings(inst, expected, 'batch-root-reboot')
        if residents:
            after = inst.request('GET', HUB + '?entries=1&migrations=1',
                                 label='batch-resident-reboot-inventory', timeout=120)['dependencies']
            require(resident_inventory(after, selected) == residents, 'Cold replay changes an unselected resident module')
        if selected_modules:
            require(original_binding != expected[binding], 'The resident update has no changed binding')
            declaration = registry_entry(inst, core['id'], 'resident-update-declaration')
            data = dict(declaration['data'])
            parameters = {row['name']: row for row in data['parameters']}
            parameters[binding] = {'name': binding, 'value': original_binding}
            data['parameters'] = list(parameters.values())
            inst.stop()
            with socket.socket() as unavailable:
                unavailable.bind(('127.0.0.1', 0))
                inst.env['WIPPY_REGISTRY'] = 'http://127.0.0.1:' + str(unavailable.getsockname()[1])
                inst.start()
                inst.request('PUT', '/api/v1/keeper/registry/entry?id=' + quote(core['id'], safe=''),
                             {'data': data}, label='resident-update-without-hub', timeout=300)
                inst.await_keeper()
                assert_bindings(inst, {binding: original_binding}, 'resident-update-binding')
                after = inst.request('GET', HUB + '?entries=1&migrations=1',
                                     label='resident-update-inventory', timeout=120)['dependencies']
                require(resident_inventory(after, selected) == residents,
                        'Updating a resident declaration without Hub access changes an unselected module')


def root_batch_bindings(ctx):
    batch_bindings(ctx)


def resident_modules(ctx):
    batch_bindings(ctx, ('kickside/kickside', 'kickside/core', 'keeper/keeper'))


def published_requirement_contracts(ctx):
    contracts = json.loads((Path(__file__).parent / 'mocks/runtime_batch_root/requirement_contracts.json').read_text())
    with published_fixture(ctx, published_app=True) as fixture:
        for contract in contracts:
            plan = fixture.inst.request('POST', HUB + '/plan',
                {'component': contract['component'], 'version': '*', 'parameters': contract['parameters']},
                label='published-requirement-contract-plan', timeout=120)
            module = next(row for row in plan['graph'] if row['module'] == contract['component'])
            declared = {row['id'] for row in module['requirements']}
            required = {row['name'] for row in contract['parameters']}
            fixture.inst.evidence.save('published-requirement-contract', {
                'component': module['module'], 'version': module['version'],
                'digest': module['digest'], 'required': sorted(required), 'declared': sorted(declared)})
            require(required <= declared, 'Published ' + module['module'] + '@' + module['version']
                    + ' removes requirements used by existing declarations: ' + ', '.join(sorted(required - declared)))


REGISTRY = [Scenario('runtime_hub_batch_root_bindings', 'regression', root_batch_bindings,
                     ('boot',), instance_setup=True,
                     issues=('RUNTIME-HUB-BATCH-ROOT-BINDINGS', 'RUNTIME-HUB-BATCH-PARAMETER-ADDRESSES')),
            Scenario('runtime_hub_batch_resident_modules', 'regression', resident_modules,
                     ('boot',), instance_setup=True, issues=('RUNTIME-HUB-BATCH-RESIDENT-MANIFESTS',)),
            Scenario('published_requirement_contracts', 'regression', published_requirement_contracts,
                     ('boot',), instance_setup=True, issues=('PUBLISHED-CODE-EXECUTION-REQUIREMENT-RETIREMENT',))]
