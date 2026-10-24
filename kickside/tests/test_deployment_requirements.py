import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import yaml


def source_root():
    configured = os.environ.get('KICKSIDE_SOURCE_ROOT')
    return Path(configured).resolve() if configured else Path(__file__).resolve().parents[1]


def private_fixture(path):
    return Path(__file__).resolve().parent / path


class DeploymentRequirementsSourceSelectionTest(unittest.TestCase):
    def test_selected_product_source_overrides_the_private_suite_location(self):
        with tempfile.TemporaryDirectory() as directory, \
             patch.dict(os.environ, {'KICKSIDE_SOURCE_ROOT': directory}):
            self.assertEqual(source_root(), Path(directory).resolve())

    def test_runtime_release_fixture_stays_with_the_private_suite(self):
        with tempfile.TemporaryDirectory() as directory, \
             patch.dict(os.environ, {'KICKSIDE_SOURCE_ROOT': directory}):
            fixture = private_fixture('fixtures/runtime-release.json')
            self.assertTrue(fixture.is_file())
            self.assertNotEqual(fixture, source_root() / 'tests/fixtures/runtime-release.json')


class DeploymentRequirementsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = source_root() / 'app/src/deployment/_index.yaml'
        cls.entries = [entry for entry in yaml.safe_load(path.read_text())['entries']
                       if entry['kind'] == 'ns.requirement' and entry.get('meta', {}).get('value_kind', '').startswith('cloud.')]
        cls.requirements = {value['name']: value for entry in cls.entries for value in [json.loads(entry['default'])]}

    def test_resources_and_secret_inputs_form_a_complete_dependency_graph(self):
        inputs = {value["name"]: value for entry in self.entries
                  for value in [json.loads(entry["default"]) ]
                  if entry["meta"]["value_kind"] == "cloud.input"}
        resources = {name: value for name, value in self.requirements.items() if name not in inputs}
        completed = set()
        while len(completed) < len(resources):
            ready = {name for name, resource in resources.items() if name not in completed
                     and all(edge["target"] in completed
                             for edge in resource.get("dependencies", {}).values())}
            self.assertTrue(ready, "Deployment graph contains a cycle or absent dependency")
            completed.update(ready)
        for name in ("admin_password", "hub_token"):
            self.assertTrue(inputs[name]["secret"])
            self.assertTrue(inputs[name]["writeOnly"])
            self.assertNotIn("default", inputs[name])
        for binding in resources["application"]["environment"]:
            self.assertIn(binding["secret_name"], resources)
            self.assertNotIn("value", binding)
        root = source_root()
        manifest = yaml.safe_load((root / "app/wippy.yaml").read_text())
        self.assertIn("postgres", manifest["publish"]["profiles"]["include"])

    def test_hub_defaults_are_json_strings(self):
        for entry in self.entries:
            self.assertIsInstance(entry['default'], str)
            value = json.loads(entry['default'])
            self.assertIsInstance(value, dict)
            self.assertTrue(value['name'])

    def test_requirements_retain_typed_targets_and_input_entries_have_no_json_default(self):
        path = source_root() / 'app/src/deployment/_index.yaml'
        entries = yaml.safe_load(path.read_text())['entries']
        catalog = {entry['name']: entry for entry in entries}
        self.assertEqual(len(self.entries), 15)
        for entry in self.entries:
            with self.subTest(name=entry['name']):
                self.assertTrue(entry['meta']['value_kind'].startswith('cloud.'))
                self.assertTrue(entry['targets'])
                for target in entry['targets']:
                    sink = catalog[target['entry'].split(':', 1)[1]]
                    self.assertEqual(sink['kind'], 'registry.entry')
                    self.assertEqual(target['path'], '.value')
                    self.assertNotIn('default', sink)

    def test_kubernetes_has_signed_runtimes_for_both_node_types(self):
        image = self.requirements['runtime-image']
        target = image['target_overrides']['kubernetes']
        self.assertEqual(target['platform'], 'auto')
        self.assertEqual(set(target['runtime_sources']), {'amd64', 'arm64'})
        for source in target['runtime_sources'].values():
            self.assertTrue(source['url'].startswith('https://'))
            self.assertEqual(len(source['checksum']), 64)
            self.assertTrue(source['signature'])
            self.assertTrue(source['public_key'])

    def test_runtime_sources_match_the_certified_release(self):
        release = json.loads(private_fixture('fixtures/runtime-release.json').read_text())
        image = self.requirements['runtime-image']
        sources = {image['platform'].split('/')[1]: {
            'url': image['runtime_url'],
            **{key: image[key] for key in ('checksum', 'signature', 'public_key')},
        }}
        for architecture, source in sources.items():
            with self.subTest(target='default', architecture=architecture):
                self.assertEqual(source, release['sources'][architecture])
        for target_name, target in image['target_overrides'].items():
            for architecture, source in target.get('runtime_sources', {}).items():
                with self.subTest(target=target_name, architecture=architecture):
                    self.assertEqual(source, release['sources'][architecture])
                    self.assertIn('/' + release['version'] + '/', source['url'])

    def test_kubernetes_has_no_aws_database_or_image_dependency(self):
        for name in ('runtime-image', 'database', 'application'):
            target = self.requirements[name]['target_overrides']['kubernetes']
            document = json.dumps(target)
            self.assertNotIn('amazonaws', document)
            self.assertNotIn('ecr.aws', document)
            self.assertNotIn('aws-rds', document)
        self.assertEqual(self.requirements['database']['target_overrides']['kubernetes']['image_auth'], 'none')
        application = self.requirements['application']['target_overrides']['kubernetes']
        self.assertEqual(application['working_directory'], '/data')
        self.assertIn('/app/wippy.lock /data/wippy.lock', application['args'][0])
        self.assertIn('vars.postgres_sslmode=disable', application['args'][0])
        self.assertTrue(self.requirements['endpoint']['target_overrides']['kubernetes']['allow_tunnel'])
        self.assertEqual(self.requirements['endpoint']['target_overrides']['kubernetes']['protocol'], 'http')

    def test_secret_source_keys_match_generated_material(self):
        expected = {
            'admin-password': 'ADMIN_PASSWORD',
            'database-password': 'DATABASE_PASSWORD',
            'encryption-key': 'ENCRYPTION_KEY',
            'hub-token': 'HUB_TOKEN',
        }
        material = self.requirements['secret-material']
        sources = set(material['generate']) | set(material['import'])
        for name, source_key in expected.items():
            secret = self.requirements[name]
            self.assertEqual(secret['source_key'], source_key)
            self.assertIn(source_key, sources)

    def test_kubernetes_network_allows_application_database_traffic(self):
        network = self.requirements['network']['target_overrides']['kubernetes']
        self.assertIn({'kind': 'dependency', 'value': 'application'}, network['ingress'])
        self.assertIn({'kind': 'dependency', 'value': 'database'}, network['egress'])

    def test_aws_database_verification_and_temporal_are_preserved(self):
        app = self.requirements['application']
        self.assertIn('sslmode=verify-full', app['args'][0])
        self.assertTrue(app['temporal']['enabled'])
        self.assertIn('temporal', self.requirements['runtime-image'])


class InstanceStorageTest(unittest.TestCase):
    def test_branding_uses_the_application_instance_storage_contract(self):
        root = source_root()
        storage = yaml.safe_load((root / 'app/src/app/registry/storage/_index.yaml').read_text())
        entries = {entry['name']: entry for entry in storage['entries']}
        self.assertEqual(entries['branding_fs']['directory'], './.wippy/branding/')
        self.assertTrue(entries['branding_fs']['auto_init'])
        config = yaml.safe_load((root / 'app/.wippy.yaml').read_text())
        self.assertEqual(config['vars']['instance_data_dir'], './.wippy')
        for name, suffix in (('data_dir', ''), ('uploads', '/uploads'), ('tmp', '/tmp'), ('branding_fs', '/branding')):
            self.assertEqual(config['override'][f'app:{name}:directory'], '${instance_data_dir}' + suffix)
        dependencies = yaml.safe_load((root / 'app/src/app/deps/registry/kickside_dependencies/_index.yaml').read_text())
        ui = next(entry for entry in dependencies['entries'] if entry.get('component') == 'kickside/ui')
        self.assertIn({'name': 'kickside.ui:branding_fs', 'value': 'app:branding_fs'}, ui['parameters'])

    def test_deployments_and_container_resolve_the_same_persistent_data_root(self):
        root = source_root()
        entries = yaml.safe_load((root / 'app/src/deployment/_index.yaml').read_text())['entries']
        app = next(json.loads(entry['default']) for entry in entries
                   if entry['kind'] == 'ns.requirement' and entry['meta']['value_kind'] == 'cloud.application')
        for target in (app, app['target_overrides']['kubernetes']):
            self.assertIn('--set vars.instance_data_dir=/data', target['args'][0])
            self.assertNotIn('kickside.ui:branding_fs:directory', target['args'][0])
        dockerfile = (root / 'Dockerfile').read_text()
        self.assertIn('VOLUME ["/data"]', dockerfile)
        self.assertIn('"vars.instance_data_dir=/data"', dockerfile)
