"""Measure the registry-defined product surface without starting application services."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

HERE = Path(__file__).resolve().parent
NAV_TYPES = {'ui.nav_item', 'ui.settings_tab', 'ui.account_item', 'ui.splash', 'ui.splash.step', 'view.page', 'kickside.settings:block'}
META_CATEGORIES = {
    'agent.trait': 'capability', 'tool': 'mcp_tool', 'kickside.automation': 'automation',
    'sso.provider': 'connection_provider', 'upload.type': 'upload_kind',
    'convert.rasterizer': 'converter', 'kickside.transform.strategy': 'transform',
    'kickside.block': 'workflow_block', 'inbox.item_type': 'inbox_kind',
    'kickside.models:provider_profile_preset': 'model_provider',
}
CONTRACT_CATEGORIES = {
    'kickside.data:pullable': 'source', 'kickside.data:writable': 'sink',
    'kickside.trigger:source': 'trigger', 'kickside.trigger:triggerable': 'trigger',
    'kickside.connection:provider': 'connection_provider',
    'kickside.connection:connection': 'connection_provider',
}


def feature_categories(entry):
    meta, data = entry.get('meta', {}), entry.get('data', {})
    categories = set()
    typ = meta.get('type')
    if typ in NAV_TYPES:
        categories.add('navigation')
    if typ in META_CATEGORIES and (typ != 'tool' or entry['kind'] == 'function.lua'):
        categories.add(META_CATEGORIES[typ])
    if meta.get('oauth_provider'):
        categories.add('connection_provider')
    if entry['kind'] == 'contract.binding' and meta.get('class'):
        categories.add('workspace_kind')
    for contract in data.get('contracts', []):
        name = contract['contract']
        if name in CONTRACT_CATEGORIES:
            categories.add(CONTRACT_CATEGORIES[name])
    if entry['kind'] == 'function.wasm' and entry['id'].startswith('kickside.convert.'):
        categories.add('converter')
    if entry['kind'] == 'http.endpoint':
        categories.add('http')
    return categories


PRODUCT_ORGS = {'kickside', 'chestor'}
PRIVATE_MODULES = {'kickside/dxf2md'}


def product_owner(owner):
    if not isinstance(owner, str) or '/' not in owner:
        return False
    return owner.split('/', 1)[0] in PRODUCT_ORGS and owner not in PRIVATE_MODULES


def build_inventory(entries, provenance=None):
    index = {}
    for entry in entries:
        if entry['id'] in index:
            raise ValueError('Duplicate registry entry: ' + entry['id'])
        index[entry['id']] = entry
    components = {}
    ports_by_binding = {}
    for entry in entries:
        if entry.get('meta', {}).get('type') == 'kickside.automation.port':
            binding = entry.get('data', {}).get('binding')
            if binding not in index:
                raise ValueError('Missing port binding: ' + entry['id'])
            ports_by_binding.setdefault(binding, []).append(entry)

    def prefix(router, visiting=()):
        if router in visiting:
            raise ValueError('HTTP router cycle: ' + router)
        if router not in index or index[router]['kind'] != 'http.router':
            raise ValueError('Missing HTTP router: ' + str(router))
        e = index[router]
        parent = e.get('meta', {}).get('parent') or e.get('data', {}).get('parent')
        if parent and ':' not in parent:
            parent = e['id'].split(':')[0] + ':' + parent
        base = prefix(parent, visiting + (router,)) if parent else ''
        return base.rstrip('/') + '/' + e.get('data', {}).get('prefix', '').strip('/')

    def add(entry, category, identity=None, label=None, **details):
        owner = entry.get('registry', {}).get('owner')
        if not owner:
            raise ValueError('Missing registry owner: ' + entry['id'])
        if not product_owner(owner):
            return
        identity = identity or entry['id']
        feature = {'id': owner + '|' + category + '|' + identity, 'category': category,
                   'entry': entry['id'], 'label': label or entry.get('meta', {}).get('title') or identity}
        feature.update(details)
        components.setdefault(owner, {'features': []})['features'].append(feature)

    for entry in entries:
        categories = feature_categories(entry)
        if entry['id'] == 'kickside.mcp:consts':
            source = entry['data']['source']
            declaration = re.search(r'M\.META_TOOLS\s*=\s*\{([^}]+)\}', source)
            if not declaration:
                raise ValueError('Missing META_TOOLS source declaration')
            body = re.sub(r'--[^\n]*', '', declaration.group(1))
            names = re.findall(r'"([^"]+)"', body)
            remainder = re.sub(r'"[^"]+"', '', body).strip(' \t\r\n,')
            if not names or remainder:
                raise ValueError('Unsupported META_TOOLS source declaration')
            for name in names:
                add(entry, 'mcp_tool', entry['id'] + '#META_TOOLS/' + name, name)
        if not categories and entry.get('meta', {}).get('type') != 'kickside.automation.port':
            continue
        owner = entry.get('registry', {}).get('owner')
        if not owner:
            raise ValueError('Missing registry owner: ' + entry['id'])
        if not product_owner(owner):
            continue
        meta, data = entry.get('meta', {}), entry.get('data', {})
        if meta.get('type') == 'kickside.automation.port':
            binding = index[data['binding']]
            if data.get('event') and 'operations' in data:
                raise ValueError('Conflicting event and operations port markers: ' + entry['id'])
            if data.get('event'):
                outputs = {e['type'] for e in binding.get('meta', {}).get('events', {}).get('output', [])}
                if data['event'] not in outputs:
                    raise ValueError('Undeclared port event: ' + entry['id'])
                categories.add('trigger')
            elif 'operations' in data:
                if 'sink' not in feature_categories(binding):
                    raise ValueError('Port operations require writable contract: ' + entry['id'])
                categories.add('sink')
            elif 'source' in feature_categories(binding):
                categories.add('source')
            else:
                raise ValueError('Unknown port contract: ' + entry['id'])
        elif entry['id'] in ports_by_binding:
            categories -= {'source', 'sink', 'trigger'}
        for category in sorted(categories):
            if category == 'http':
                router = meta.get('router')
                if router and ':' not in router:
                    router = entry['id'].split(':')[0] + ':' + router
                base = prefix(router)
                path = base.rstrip('/') + '/' + data['path'].lstrip('/')
                methods = data['method'] if isinstance(data['method'], list) else [data['method']]
                for method in methods:
                    if method not in {'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', '*'}:
                        raise ValueError('Invalid HTTP method: ' + method)
                    add(entry, category, method + ' ' + path, method + ' ' + path, method=method, path=path)
            elif category == 'workspace_kind':
                classes = meta['class'] if isinstance(meta['class'], list) else [meta['class']]
                add(entry, category, label=str(classes[0]), entry_kind=classes[0])
            elif category == 'upload_kind':
                formats = data.get('mime_types', [])
                add(entry, category, formats=formats)
            else:
                add(entry, category)
    ids = set()
    for component in components.values():
        component['features'].sort(key=lambda f: f['id'])
        for feature in component['features']:
            if feature['id'] in ids:
                raise ValueError('Duplicate feature: ' + feature['id'])
            ids.add(feature['id'])
    return {'schema_version': 1, 'provenance': provenance or {},
            'components': dict(sorted(components.items())), 'feature_count': len(ids)}


def project_entry(entry):
    meta, data = entry.get('meta', {}), entry.get('data', {})
    projected = {'id': entry['id'], 'kind': entry['kind'], 'registry': {'owner': entry['registry']['owner']},
                 'meta': {key: meta[key] for key in ('type', 'title', 'router', 'parent', 'class', 'oauth_provider', 'events') if key in meta},
                 'data': {key: data[key] for key in ('prefix', 'parent', 'method', 'path', 'binding', 'event', 'mime_types') if key in data}}
    if 'contracts' in data:
        projected['data']['contracts'] = [{'contract': c['contract']} for c in data['contracts']]
    if 'operations' in data:
        projected['data']['operations'] = {name: {} for name in data['operations']}
    if entry['id'] == 'kickside.mcp:consts':
        projected['data']['source'] = data['source']
    return projected


class Registry:
    def __init__(self, runtime, binary='wippy'):
        self.runtime, self.binary = Path(runtime).resolve(), binary

    def command(self, *args, timeout=300):
        scratch = self.runtime / 'temp'
        scratch.mkdir(exist_ok=True)
        env = os.environ.copy()
        env['TMPDIR'] = str(scratch)
        completed = subprocess.run([self.binary, *args], cwd=self.runtime, capture_output=True,
                                   text=True, timeout=timeout, check=True, env=env)
        return completed.stdout

    def listing(self):
        return json.loads(self.command('registry', 'list', '--registry-meta', '--json'))

    def show(self, entry):
        result = json.loads(self.command('registry', 'show', entry['id'], '--json', timeout=60))
        result['registry'] = entry.get('registry', {})
        return result

    def entries(self, snapshot=None):
        listed = self.listing()
        selected = [e for e in listed if e['kind'] == 'http.router' or
                    (product_owner(e.get('registry', {}).get('owner')) and
                     (e['kind'] in {'http.endpoint', 'contract.binding'} or feature_categories(e)
                      or e.get('meta', {}).get('type') == 'kickside.automation.port'
                      or e['id'] == 'kickside.mcp:consts'))]
        entries = []
        with ThreadPoolExecutor(max_workers=4) as pool:
            for full in pool.map(self.show, selected):
                entries.append(project_entry(full))
                if len(entries) % 100 == 0:
                    print(f'Registry details: {len(entries)}/{len(selected)}', flush=True)
        if snapshot:
            snapshot.write_text(json.dumps(entries, indent=2, sort_keys=True) + '\n')
        return entries


def seed_document(modules, parameters=None):
    return {'version': '1.0', 'namespace': 'coverage.seed', 'entries': [
        {'name': 'dep_' + str(i), 'kind': 'ns.dependency', 'component': name, 'version': '*',
         'parameters': (parameters or {}).get(name, [])} for i, name in enumerate(sorted(modules))]}


def router_binding(requirement, bindings):
    name = requirement.split(':')[1]
    if name not in bindings:
        raise ValueError('Declare host router binding for requirement: ' + requirement)
    return bindings[name]


def bootstrap(directory, module_config, binary='wippy'):
    directory = Path(directory).resolve()
    if directory.exists() and any(directory.iterdir()):
        raise ValueError('Bootstrap directory must be empty')
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'src').mkdir()
    registry = Registry(directory, binary)
    registry.command('init', '--src-dir', './src')
    seed = directory / 'src/_index.yaml'
    seed.write_text(json.dumps(seed_document({'kickside/kickside'})))
    registry.command('update')
    roots = set(module_config['modules']) | {'kickside/kickside'}
    for entry in registry.listing():
        if entry.get('meta', {}).get('type') == 'kickside.hub:onboarding_profile':
            roots.update(p['component'] for p in registry.show(entry)['data']['packages'])
    seed.write_text(json.dumps(seed_document(roots)))
    registry.command('update')
    parameters = {}
    requirements = [e for e in registry.listing() if e['kind'] == 'ns.requirement'
                    and e.get('registry', {}).get('owner') in roots - {'kickside/kickside'}]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for entry in pool.map(registry.show, requirements):
            if any(t.get('path') == '.meta.router' for t in entry.get('data', {}).get('targets', [])):
                value = router_binding(entry['id'], module_config['router_bindings'])
                parameters.setdefault(entry['registry']['owner'], []).append(
                    {'name': entry['id'], 'value': value})
    seed.write_text(json.dumps(seed_document(roots, parameters)))
    registry.command('update')
    return registry


def lock_provenance(runtime):
    raw = (Path(runtime) / 'wippy.lock').read_bytes()
    text = raw.decode()
    modules = re.findall(r'(?m)^\s+- name: ([\w/-]+)\n\s+version: ([\w.+-]+)\n\s+hash: ([a-f0-9]+)', text)
    if not modules:
        raise ValueError('Lock contains no resolved modules')
    return {'basis': 'published registry with optional modules',
            'lock_sha256': hashlib.sha256(raw).hexdigest(),
            'modules': [{'name': n, 'version': v, 'hash': h} for n, v, h in sorted(modules)]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--runtime', type=Path, help='Lock-resolved app directory')
    source.add_argument('--bootstrap', type=Path, help='Empty scratch directory; resolve latest Hub app and modules')
    source.add_argument('--entries', type=Path, help='Full registry export including data and registry.owner')
    parser.add_argument('--modules', type=Path, default=HERE / 'modules.json')
    parser.add_argument('--output', type=Path, default=HERE / 'inventory.json')
    parser.add_argument('--binary', default='wippy')
    parser.add_argument('--snapshot', type=Path, help='Save structural registry facts for offline regeneration')
    args = parser.parse_args()
    if args.entries:
        inventory = build_inventory(json.loads(args.entries.read_text()))
    else:
        registry = bootstrap(args.bootstrap, json.loads(args.modules.read_text()), args.binary) if args.bootstrap else Registry(args.runtime, args.binary)
        inventory = build_inventory(registry.entries(args.snapshot), lock_provenance(registry.runtime))
    if not inventory['feature_count']:
        raise ValueError('Inventory contains no product features')
    args.output.write_text(json.dumps(inventory, indent=2, sort_keys=True) + '\n')
    print(f"{inventory['feature_count']} features in {len(inventory['components'])} components")


if __name__ == '__main__':
    main()
