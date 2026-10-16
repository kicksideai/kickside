"""Resolve capability facets to the resources their declared ports reference."""
from harness import require


def classes(entry):
    value = entry.get('meta', {}).get('class', [])
    return {value} if isinstance(value, str) else set(value)


def contracts(entry):
    return {row['contract'] for row in entry.get('data', {}).get('contracts', [])}


def output_events(entry):
    return {row['type'] if isinstance(row, dict) else row
            for row in entry.get('meta', {}).get('events', {}).get('output', [])}


def entry_owners(dependencies):
    owners = {}
    for dependency in dependencies:
        for entry in dependency['entries']:
            module = entry.get('module')
            if not module:
                continue
            previous = owners.get(entry['id'])
            require(previous is None or previous == module,
                    'Resolved entry has multiple module owners: ' + entry['id'])
            owners[entry['id']] = module
    return owners


def fixture_owner(declaration, resources, ports, oauth_providers=()):
    exposed = [port for port in ports if port['binding'] == declaration['id']]
    require(exposed, 'Capability declares no owning port: ' + declaration['id'])
    owners = {}
    for port in exposed:
        fields = port.get('config_schema', {}).values()
        provider = next((field['provider'] for field in fields if field.get('provider')), declaration.get('meta', {}).get('provider'))
        required_classes = {field['class'] for field in fields if field.get('class')}
        for resource in resources:
            if resource['id'] == declaration['id'] or 'kickside.contract:component' not in contracts(resource):
                continue
            meta = resource.get('meta', {})
            if provider:
                matches = 'connection' in classes(resource) and meta.get('provider') == provider
                for oauth in oauth_providers:
                    if oauth.get('meta', {}).get('oauth_provider') != provider:
                        continue
                    binding = oauth.get('data', {}).get('component_contract')
                    matches = matches or (resource['id'] == binding if binding else
                        'kickside.oauth:oauth_connection_contract' in contracts(resource))
            elif required_classes:
                matches = bool(classes(resource) & required_classes)
            else:
                matches = bool(meta.get('component', {}).get('create') and
                               output_events(declaration) & output_events(resource))
            if matches:
                owners[resource['id']] = port
    require(len(owners) == 1, 'Capability has no unique declared resource owner: ' + declaration['id'] +
            '; candidates=' + str(sorted(owners)))
    return next(iter(owners.items()))
