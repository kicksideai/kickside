from pathlib import Path
import unittest
import yaml

APP = Path(__file__).resolve().parents[1]


def entries(directory):
    result = {}
    for path in directory.rglob('*.yaml'):
        document = yaml.safe_load(path.read_text())
        if isinstance(document, dict):
            for entry in document.get('entries', []) or []:
                if isinstance(entry, dict) and 'name' in entry:
                    result[document.get('namespace', '') + ':' + entry['name']] = (entry, path)
    return result


class PublishedInterfaces(unittest.TestCase):
    def test_document_catalog_identity_keeps_its_published_address_and_content(self):
        entry, path = entries(APP / 'src')['app:documentation.rfc-document-catalog']
        data = entry.get('data', entry)
        self.assertEqual(entry['kind'], 'registry.entry')
        self.assertEqual(data['path'], 'docs/rfcs/0001-registry-document-catalog.md')
        self.assertEqual(data['title'], 'Registry Documentation Catalog')
        self.assertEqual(data['document_kind'], 'rfc')
        body = data['content']
        if body.startswith('file://'):
            body = (path.parent / body[7:]).read_text()
        self.assertIn('# RFC 0001: Registry Documentation Catalog', body)
        self.assertIn('app:documentation', body)

    def test_deployment_inputs_have_real_defaulted_targets_without_cloud_execution(self):
        catalog = entries(APP / 'src')
        inputs = {identity: row for identity, row in catalog.items() if identity.startswith('app.deployment:') and row[0]['kind'] == 'ns.requirement'}
        self.assertEqual(len(inputs), 15)
        for identity, (entry, _) in inputs.items():
            with self.subTest(identity=identity):
                self.assertIn('default', entry)
                self.assertIsInstance(entry['default'], str)
                self.assertEqual(entry.get('meta', {}).get('value_type'), 'string')
                self.assertTrue(entry.get('targets'))
                for target in entry['targets']:
                    sink, _ = catalog[target['entry']]
                    self.assertEqual(sink['kind'], 'registry.entry')
                    self.assertEqual(target['path'], '.value')

    def test_root_module_does_not_change_the_published_branding_destination(self):
        for entry, _ in entries(APP / 'src').values():
            if entry.get('kind') == 'ns.dependency' and entry.get('component') == 'kickside/ui':
                names = {parameter['name'] for parameter in entry.get('parameters', [])}
                self.assertNotIn('kickside.ui:branding_destination', names)
                parameters = {parameter['name']: parameter['value'] for parameter in entry.get('parameters', [])}
                self.assertEqual(parameters['kickside.ui:branding_fs'], 'app:branding_fs')

    def test_production_dependencies_resolve_fresh_hub_versions(self):
        sources = [APP / 'src', *APP.parent.glob('core/*/src'), *APP.parent.glob('platform/*/src')]
        for source in sources:
            for identity, (entry, _) in entries(source).items():
                if entry.get('kind') == 'ns.dependency':
                    self.assertEqual(entry.get('version'), '*', identity)


if __name__ == '__main__':
    unittest.main()
