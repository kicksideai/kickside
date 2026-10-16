import copy
import unittest
from pathlib import Path
import tempfile
from unittest.mock import patch
import subprocess
from inventory import build_inventory, feature_categories, router_binding, project_entry, Registry


def entry(eid, kind='registry.entry', meta=None, data=None, owner='kickside/demo'):
    return {'id': eid, 'kind': kind, 'meta': meta or {}, 'data': data or {},
            'registry': {'owner': owner}}


class InventoryTests(unittest.TestCase):
    def test_router_prefixes_and_methods(self):
        entries = [entry('app:api', 'http.router', data={'prefix': '/api/v1/'}),
                   entry('demo:route', 'http.endpoint', {'router': 'app:api'},
                         {'method': ['GET', 'POST'], 'path': '/items/{id}'})]
        features = build_inventory(entries)['components']['kickside/demo']['features']
        self.assertEqual(['GET /api/v1/items/{id}', 'POST /api/v1/items/{id}'],
                         sorted(f['label'] for f in features))

    def test_router_reference_uses_endpoint_namespace(self):
        entries = [entry('demo:well_known_router', 'http.router', data={'prefix': '/.well-known/'}),
                   entry('demo:e', 'http.endpoint', {'router': 'well_known_router'}, {'method': 'GET', 'path': '/oauth'})]
        self.assertEqual('GET /.well-known/oauth', build_inventory(entries)['components']['kickside/demo']['features'][0]['label'])

    def test_nested_router(self):
        entries = [entry('app:api', 'http.router', data={'prefix': '/api/v1/'}),
                   entry('demo:child', 'http.router', {'parent': 'app:api'}, {'prefix': '/demo'}),
                   entry('demo:e', 'http.endpoint', {'router': 'demo:child'}, {'method': 'GET', 'path': '/x'})]
        self.assertEqual('GET /api/v1/demo/x', build_inventory(entries)['components']['kickside/demo']['features'][0]['label'])

    def test_unbound_endpoint_fails(self):
        with self.assertRaisesRegex(ValueError, 'router'):
            build_inventory([entry('demo:e', 'http.endpoint', data={'method': 'GET', 'path': '/x'})])

    def test_missing_router_and_cycles_fail(self):
        for routers in [[], [entry('a:r', 'http.router', {'parent': 'a:r'}, {'prefix': '/x'})]]:
            with self.subTest(routers=routers), self.assertRaises(ValueError):
                build_inventory(routers + [entry('demo:e', 'http.endpoint', {'router': 'a:r'}, {'method': 'GET', 'path': '/x'})])

    def test_workspace_matches_class_discovery(self):
        e = entry('demo:graph', 'contract.binding', {'class': ['graph'], 'title': 'Graph'})
        self.assertIn('workspace_kind', feature_categories(e))
        self.assertNotIn('workspace_kind', feature_categories(entry('demo:internal', 'contract.binding')))

    def test_semantic_metadata_and_contracts(self):
        for value, category in [('agent.trait', 'capability'), ('tool', 'mcp_tool'),
                                ('ui.nav_item', 'navigation'), ('ui.settings_tab', 'navigation'),
                                ('ui.account_item', 'navigation'), ('ui.splash', 'navigation'),
                                ('ui.splash.step', 'navigation'), ('kickside.automation', 'automation'),
                                ('upload.type', 'upload_kind'), ('convert.rasterizer', 'converter'),
                                ('sso.provider', 'connection_provider')]:
            with self.subTest(value=value):
                self.assertIn(category, feature_categories(entry('demo:x', 'function.lua' if value == 'tool' else 'registry.entry', meta={'type': value})))
        for contract, category in [('kickside.data:pullable', 'source'), ('kickside.data:writable', 'sink'),
                                   ('kickside.trigger:source', 'trigger'), ('kickside.connection:provider', 'connection_provider')]:
            self.assertIn(category, feature_categories(entry('demo:x', 'contract.binding', data={'contracts': [{'contract': contract}]})))

    def test_port_resolves_binding_contracts(self):
        entries = [entry('demo:binding', 'contract.binding', data={'contracts': [{'contract': 'kickside.data:writable'}]}),
                   entry('demo:port', meta={'type': 'kickside.automation.port'}, data={'binding': 'demo:binding', 'operations': {'upsert': {}}})]
        features = build_inventory(entries)['components']['kickside/demo']['features']
        self.assertEqual(['sink'], [f['category'] for f in features])
        self.assertEqual('demo:port', features[0]['entry'])

    def test_event_ports_are_trigger_kinds(self):
        entries = [entry('demo:binding', 'contract.binding', {'events': {'output': [{'type': 'demo.events:created'}]}}),
                   entry('demo:port', meta={'type': 'kickside.automation.port'}, data={'binding': 'demo:binding', 'event': 'demo.events:created'})]
        features = build_inventory(entries)['components']['kickside/demo']['features']
        self.assertEqual(['trigger'], [f['category'] for f in features])

    def test_invalid_event_port_fails(self):
        entries = [entry('demo:binding', 'contract.binding', {'events': {'output': [{'type': 'demo.events:created'}]}}),
                   entry('demo:port', meta={'type': 'kickside.automation.port'}, data={'binding': 'demo:binding', 'event': 'demo.events:unknown'})]
        with self.assertRaisesRegex(ValueError, 'event'):
            build_inventory(entries)

    def test_builtin_mcp_tools_derive_from_module_source(self):
        e = entry('kickside.mcp:consts', 'library.lua', data={'source': 'M.META_TOOLS = { "session_info", "list_tools" }'}, owner='kickside/mcp')
        features = build_inventory([e])['components']['kickside/mcp']['features']
        self.assertEqual(['list_tools', 'session_info'], sorted(f['label'] for f in features))
        self.assertTrue(all(f['category'] == 'mcp_tool' for f in features))

    def test_mcp_source_declaration_fails_on_unparsed_expressions(self):
        e = entry('kickside.mcp:consts', 'library.lua', data={'source': 'M.META_TOOLS = { make_tools() }'}, owner='kickside/mcp')
        with self.assertRaisesRegex(ValueError, 'META_TOOLS'):
            build_inventory([e])

    def test_registry_projection_omits_runtime_configuration(self):
        e = entry('demo:library', 'library.lua', {'title': 'Library', 'private_context': {'password': 'sensitive'}},
                  {'source': 'sensitive', 'url': 'private-endpoint', 'contracts': [{'contract': 'demo:contract', 'methods': {'run': 'sensitive'}}]})
        result = project_entry(e)
        self.assertNotIn('private_context', result['meta'])
        self.assertNotIn('source', result['data'])
        self.assertNotIn('url', result['data'])
        self.assertEqual([{'contract': 'demo:contract'}], result['data']['contracts'])

    def test_explicit_public_router_binding(self):
        self.assertEqual('app:api.public', router_binding('kickside.mcp:public_router', {'public_router': 'app:api.public'}))
        with self.assertRaisesRegex(ValueError, 'Declare'):
            router_binding('demo:unknown', {})

    def test_conflicting_port_markers_fail(self):
        entries = [entry('demo:binding', 'contract.binding', {'events': {'output': [{'type': 'demo.events:created'}]}}),
                   entry('demo:port', meta={'type': 'kickside.automation.port'}, data={'binding': 'demo:binding', 'event': 'demo.events:created', 'operations': {}})]
        with self.assertRaisesRegex(ValueError, 'markers'):
            build_inventory(entries)

    def test_private_tools_remain_in_inventory(self):
        self.assertIn('mcp_tool', feature_categories(entry('demo:t', 'function.lua', meta={'type': 'tool', 'private': True})))

    def test_stable_ids_and_order(self):
        entries = [entry('demo:z', 'function.lua', meta={'type': 'tool', 'title': 'Z'}), entry('demo:a', meta={'type': 'agent.trait'})]
        original = build_inventory(entries)
        entries[0]['meta']['title'] = 'Renamed'
        renamed = build_inventory(list(reversed(entries)))
        self.assertEqual([f['id'] for f in original['components']['kickside/demo']['features']],
                         [f['id'] for f in renamed['components']['kickside/demo']['features']])
        self.assertEqual(original, build_inventory(list(reversed(copy.deepcopy([entry('demo:z', 'function.lua', meta={'type': 'tool', 'title': 'Z'}), entry('demo:a', meta={'type': 'agent.trait'})])))))

    def test_provenance_required_and_duplicates_rejected(self):
        bad = entry('demo:a', 'function.lua', meta={'type': 'tool'}); bad.pop('registry')
        with self.assertRaisesRegex(ValueError, 'owner'):
            build_inventory([bad])
        e = entry('demo:a', 'function.lua', meta={'type': 'tool'})
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            build_inventory([e, e])

    def test_only_kickside_and_chestor_modules_count(self):
        entries = [entry('app:api', 'http.router', data={'prefix': '/api/v1/'}),
                   entry('kickside.inbox.api:list', 'http.endpoint', {'router': 'app:api'},
                         {'method': 'GET', 'path': '/inbox'}, owner='kickside/inbox'),
                   entry('wippy.session.api:list', 'http.endpoint', {'router': 'app:api'},
                         {'method': 'GET', 'path': '/sessions'}, owner='wippy/session'),
                   entry('keeper:tool', 'function.lua', {'type': 'tool'}, owner='keeper/keeper'),
                   entry('kickside.convert.dxf2md:tool', 'function.lua', {'type': 'tool'}, owner='kickside/dxf2md')]
        result = build_inventory(entries)
        self.assertEqual({'kickside/inbox'}, set(result['components']))
        self.assertEqual('GET /api/v1/inbox', result['components']['kickside/inbox']['features'][0]['label'])

    def test_registry_commands_use_runtime_scratch_directory(self):
        with tempfile.TemporaryDirectory(prefix='.test-registry-', dir=Path(__file__).resolve().parents[1]) as directory:
            registry = Registry(directory)
            with patch('inventory.subprocess.run', return_value=subprocess.CompletedProcess([], 0, stdout='[]')) as run:
                registry.command('registry', 'list', '--json')
            scratch = Path(run.call_args.kwargs['env']['TMPDIR'])
            self.assertTrue(scratch.is_relative_to(Path(directory)))
            self.assertTrue(scratch.is_dir())

    def test_framework_internals_excluded(self):
        x = build_inventory([entry('wippy:t', meta={'type': 'tool'}, owner='wippy/agent')])
        self.assertEqual({}, x['components'])

    def test_empty_inventory_rejected_by_consumer(self):
        self.assertEqual({}, build_inventory([])['components'])


if __name__ == '__main__':
    unittest.main()
