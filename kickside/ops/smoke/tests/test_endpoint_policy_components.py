"""Historical policy identities remain grant-bearing module components."""
import fnmatch
import json
import os
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch

import yaml
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scenarios_endpoint_access import pattern_conditions

ROOT = Path(__file__).resolve().parents[3]
MODULES = {
    **{'platform/' + name: (name, 'kickside.' + name) for name in
       ('agents', 'automation', 'connection', 'identity', 'inbox', 'models', 'oauth', 'transform', 'ui')},
    **{'core/' + name: (name, 'kickside.' + name) for name in ('component', 'core')},
    'core/jobs': ('jobs', 'kickside.core.jobs'),
}


def module_repositories():
    roots = [ROOT]
    roots.extend(Path(value) for value in os.environ.get('SECURITY_MODULE_ROOTS', '').split(os.pathsep) if value)
    return roots


def module_sources(repositories):
    sources = {}
    for repository in repositories:
        plan_path = repository / '.github/modules.json'
        if plan_path.is_file():
            plan = json.loads(plan_path.read_text())
            for relative, module in plan['modules'].items():
                sources[module['organization'] + '/' + module['module']] = repository / relative
            continue
        manifest = repository / 'wippy.yaml'
        if manifest.is_file():
            module = yaml.safe_load(manifest.read_text()) or {}
            sources[module['organization'] + '/' + module['module']] = repository
    return sources


def declared_module_roots():
    return sorted({path.resolve() for path in module_sources(module_repositories()).values()})


def entries(root):
    result = {}
    for path in root.rglob('_index.yaml'):
        document = yaml.safe_load(path.read_text())
        for entry in document.get('entries', []) or []:
            result[document['namespace'] + ':' + entry['name']] = entry
    return result


def admits(entry, endpoint):
    policy = entry.get('policy', {})
    resources = policy.get('resources', [])
    actions = policy.get('actions', [])
    if isinstance(resources, str):
        resources = [resources]
    if isinstance(actions, str):
        actions = [actions]
    return ('access' in actions and any(fnmatch.fnmatchcase(endpoint, pattern) for pattern in resources)
            and all(re.search(condition['value'], endpoint) for condition in policy.get('conditions', [])))


class EndpointPolicyComponentsTests(unittest.TestCase):
    def test_module_sources_include_repository_manifest_roots(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            repository = Path(directory)
            plan = repository / '.github/modules.json'
            plan.parent.mkdir()
            plan.write_text(json.dumps({'modules': {'crm': {
                'organization': 'kickside', 'module': 'crm'}}}))
            self.assertEqual(module_sources([repository]), {'kickside/crm': repository / 'crm'})

    def test_module_sources_include_direct_replacement_roots(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            repository = Path(directory)
            (repository / 'wippy.yaml').write_text('organization: kickside\nmodule: crm\n')
            with patch.dict(os.environ, {'SECURITY_MODULE_ROOTS': str(repository)}):
                self.assertEqual(module_sources(module_repositories())['kickside/crm'], repository)

    def test_direct_replacement_inventory_excludes_nested_harnesses(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            repository=Path(directory)
            (repository/'wippy.yaml').write_text('organization: example\nmodule: product\n')
            (repository/'test').mkdir()
            (repository/'test/wippy.yaml').write_text('organization: example\nmodule: harness\n')
            with patch(__name__+'.module_repositories',return_value=[repository]):
                self.assertEqual(declared_module_roots(),[repository.resolve()])

    def test_realtime_dispatch_has_no_member_surface(self):
        registry = entries(ROOT / 'core/realtime-dispatch/src')
        self.assertFalse(any(entry['kind'] == 'http.endpoint' for entry in registry.values()))
        self.assertFalse(any((entry.get('meta') or {}).get('intent') == 'module_access'
                             for entry in registry.values()))
        self.assertFalse(any(entry['kind'] == 'ns.requirement'
                             and entry.get('default') == 'kickside.security.groups:members'
                             for entry in registry.values()))

    def test_normalized_endpoints_preserve_published_transport(self):
        modules = module_sources(module_repositories())
        fixture = json.loads((ROOT / 'ops/smoke/fixtures/endpoint-normalization.json').read_text())
        declarations = {}
        seen = set()
        for row in fixture['endpoints']:
            with self.subTest(module=row['module'], endpoint=row['new']):
                self.assertNotIn(row['old'], seen)
                seen.add(row['old'])
                self.assertEqual(row['new'], row['old'].removesuffix('.user.endpoint') + '.endpoint')
                if row['module'] not in declarations:
                    self.assertIn(row['module'], modules, 'Module source is not declared to this fixture')
                    declarations[row['module']] = entries(modules[row['module']] / 'src')
                registry = declarations[row['module']]
                self.assertNotIn(row['old'], registry)
                current = registry[row['new']]
                self.assertEqual(current['kind'], 'http.endpoint')
                for field in ('method', 'path', 'func'):
                    self.assertEqual(current[field], row[field])
                self.assertEqual(current.get('meta', {}).get('router'), row['router'])
        self.assertEqual(len(seen), 266)

    def test_endpoint_free_member_policies_retain_included_runtime_grants(self):
        modules = declared_module_roots()
        count = 0
        for module in modules:
            registry = entries(module / 'src')
            for identity, entry in registry.items():
                if (entry.get('meta') or {}).get('intent') != 'module_access':
                    continue
                included = [registry[child] for child in entry['meta'].get('includes', [])
                            if child in registry]
                resources = entry['policy']['resources']
                own_endpoints = {id for id, endpoint in registry.items() if endpoint['kind'] == 'http.endpoint'}
                if any(admits(candidate, endpoint) for candidate in [entry, *included] for endpoint in own_endpoints):
                    continue
                runtimes = [registry[child] for child in entry['meta'].get('includes', [])
                            if child.endswith(':module_runtime') and child in registry]
                if not runtimes:
                    continue
                self.assertEqual(len(runtimes), 1, identity)
                if entry['policy']['actions'] != 'access' and entry['policy'] != runtimes[0]['policy']:
                    continue
                with self.subTest(policy=identity):
                    self.assertTrue(resources, identity)
                    self.assertEqual(entry['policy'], runtimes[0]['policy'], identity)
                    self.assertEqual(list(pattern_conditions(entry['policy'].get('conditions', []))), [], identity)
                count += 1
        self.assertEqual(count, 36)

    def test_endpoint_grants_list_exact_declared_identities(self):
        for path in ('platform/mcp', 'core/jobs'):
            with self.subTest(module=path):
                registry = entries(ROOT / path / 'src')
                endpoint_ids = {id for id, entry in registry.items() if entry['kind'] == 'http.endpoint'}
                for id, entry in registry.items():
                    if entry['kind'] != 'security.policy':
                        continue
                    policy = entry.get('policy', {})
                    actions = policy.get('actions', [])
                    if isinstance(actions, str):
                        actions = [actions]
                    if 'access' not in actions or policy.get('effect') != 'allow':
                        continue
                    resources = policy['resources']
                    if isinstance(resources, str):
                        resources = [resources]
                    selected = {endpoint for endpoint in endpoint_ids if admits(entry, endpoint)}
                    if selected:
                        self.assertEqual(set(resources), selected, id)
                        self.assertNotIn('conditions', policy, id)
                        for endpoint in selected:
                            self.assertFalse(admits(entry, endpoint + '.unlisted'), id)

    def test_each_historical_component_owns_the_endpoint_grant_once(self):
        for path, (name, namespace) in MODULES.items():
            with self.subTest(module=path):
                registry = entries(ROOT / path / 'src')
                historical = namespace + '.security:' + name + '_endpoint_access'
                component = registry[historical]
                bundle = registry[namespace + '.security:module_access']
                self.assertIn(historical, bundle['meta']['includes'])
                self.assertTrue(component['policy']['resources'])
                self.assertNotEqual(bundle['policy']['actions'], 'access')
                endpoints = [id for id, entry in registry.items() if entry['kind'] == 'http.endpoint'
                             and id in component['policy']['resources']]
                for endpoint, entry in registry.items():
                    if entry['kind'] == 'http.endpoint' and endpoint not in endpoints:
                        self.assertFalse(admits(component, endpoint), endpoint)
                for endpoint in endpoints:
                    self.assertTrue(admits(component, endpoint), endpoint)
                    grants = [id for id, entry in registry.items() if admits(entry, endpoint)]
                    self.assertEqual(grants, [historical], endpoint)

    def test_additional_historical_component_retains_native_meaning_and_composes_once(self):
        registry = entries(ROOT / 'platform/mcp/src')
        historical = 'kickside.mcp.security:mcp_endpoint_access'
        published = json.loads((Path(__file__).resolve().parents[1] /
            'mocks/security_model/published_endpoint_components.json').read_text())
        self.assertNotIn('conditions', registry[historical]['policy'])
        self.assertTrue(registry[historical]['policy']['resources'])
        bundle = registry['kickside.mcp.security:module_access']
        self.assertIn(historical, bundle['meta']['includes'])
        self.assertNotEqual(bundle['policy']['actions'], 'access')
        requirement = registry['kickside.mcp.security:user_security_scope']
        self.assertIn({'entry': historical, 'path': '.groups +='}, requirement['targets'])
        for endpoint, entry in registry.items():
            if entry['kind'] == 'http.endpoint' and (endpoint in registry[historical]['policy']['resources']
                    or endpoint in registry['kickside.mcp.security:oauth_endpoint_access']['policy']['resources']):
                grants = [id for id, candidate in registry.items() if admits(candidate, endpoint)]
                self.assertEqual(len(grants), 1, endpoint)
                self.assertIn(grants[0], bundle['meta']['includes'], endpoint)

    def test_users_components_keep_separate_original_meanings(self):
        registry = entries(ROOT / 'platform/users/src')
        expected = {
            'kickside.users.security:users_endpoint_access': ('me', 'update_me', 'logout'),
            'kickside.users.profile:profile_endpoint_access': ('get_profile', 'put_profile'),
            'kickside.users.directory:directory_endpoint_access': ('principals_search', 'principals_resolve'),
        }
        endpoints = [id for id, entry in registry.items() if entry['kind'] == 'http.endpoint']
        for historical, names in expected.items():
            component = registry[historical]
            self.assertIn(historical, registry['kickside.users.security:directory_access']['meta']['includes'])
            permitted = {'kickside.users.api:' + name + '.endpoint' for name in names}
            for endpoint in endpoints:
                self.assertEqual(admits(component, endpoint), endpoint in permitted, historical + ' ' + endpoint)

    def test_contract_binding_admits_only_core_member_endpoints(self):
        policy = entries(ROOT / 'core/contract/src')['kickside.contract.http:user_endpoint_access']
        for endpoint in ('kickside.core.threads.api:list_threads.endpoint', 'kickside.core.retention.api:get_thread_retention.endpoint'):
            self.assertTrue(admits(policy, endpoint), endpoint)
        for endpoint in ('kickside.agents.api:list.endpoint', 'kickside.core.jobs.api:list.endpoint',
                         'kickside.core_extension:list.endpoint', 'kickside.core.api:admin.endpoint'):
            self.assertFalse(admits(policy, endpoint), endpoint)
