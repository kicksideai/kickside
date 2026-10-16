"""Distribution and host import contracts for the independent component."""
import json
from pathlib import Path
import re
import unittest
import yaml

MODULE = Path(__file__).resolve().parents[1]
REPO = MODULE.parent
EXACT_SEMVER = re.compile(
    r'^(?:=\s*)?v?\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$'
)


def is_unpinned_dependency_version(version):
    return not EXACT_SEMVER.fullmatch(version.strip())

class PackageContract(unittest.TestCase):
    def test_module_identity_and_public_release_registration(self):
        manifest = yaml.safe_load((MODULE / 'wippy.yaml').read_text())
        self.assertEqual(manifest['organization'], 'kickside')
        self.assertEqual(manifest['module'], 'agent-onboarding')
        self.assertEqual(manifest['type'], 'plugin')
        self.assertEqual(manifest['visibility'], 'public')
        packages = json.loads((REPO / 'release-please-config.json').read_text())['packages']
        self.assertIn('agent-onboarding', packages)
        self.assertIn('agent-onboarding', json.loads((REPO / '.release-please-manifest.json').read_text()))
        delivery = json.loads((REPO / '.github/modules.json').read_text())['modules']['agent-onboarding']
        self.assertEqual(delivery['visibility'], 'public')
        self.assertIn('postgres', delivery['profiles'])
        matrix = yaml.safe_load((REPO / '.github/workflows/ci.yml').read_text())['jobs']['modules']['strategy']['matrix']['include']
        self.assertEqual({row['engine'] for row in matrix if row['module'] == 'agent-onboarding'}, {'sqlite', 'postgres'})

    def test_simple_release_has_its_version_file(self):
        versions = json.loads((REPO / '.release-please-manifest.json').read_text())
        self.assertEqual((MODULE / 'version.txt').read_text().strip(), versions['agent-onboarding'])
        self.assertTrue((MODULE / 'CHANGELOG.md').is_file())

    def test_external_host_imports_have_peer_dependencies_and_types(self):
        package = json.loads((MODULE / 'ui/package.json').read_text())
        for external in ('vue', '@wippy-fe/proxy'):
            self.assertIn(external, package.get('peerDependencies', {}))
        config = json.loads((MODULE / 'ui/tsconfig.json').read_text())
        self.assertIn('@wippy-fe/proxy', config['compilerOptions']['types'])

    def test_plugin_does_not_install_the_host_application(self):
        declaration = yaml.safe_load((MODULE / 'src/_index.yaml').read_text())
        applications = [e for e in declaration['entries'] if e.get('component') == 'kickside/kickside']
        self.assertEqual(applications, [])
        harness = yaml.safe_load((MODULE / 'test/_index.yaml').read_text())
        self.assertFalse(any(e.get('component') == 'kickside/kickside' for e in harness['entries']))

    def test_host_binds_only_onboarding_rendering(self):
        parameters = json.loads((MODULE / 'host-parameters.json').read_text())
        self.assertEqual(parameters, [{'name': 'kickside.agent_onboarding:ui_server', 'value': 'app:gateway'}])

    def test_dependencies_only_render_and_create(self):
        declaration = yaml.safe_load((MODULE / 'src/_index.yaml').read_text())
        dependencies = {e['component']: e['version'] for e in declaration['entries'] if e.get('kind') == 'ns.dependency'}
        self.assertEqual(dependencies, {f'kickside/{name}': '*' for name in ('agents', 'component', 'ui', 'users', 'settings', 'widgets')})

    def test_no_presets_or_hardcoded_capabilities(self):
        for path in (MODULE / 'src').rglob('*'):
            if path.suffix in ('.lua', '.yaml'):
                self.assertNotIn('kickside.agent_onboarding.preset', path.read_text(), str(path))
                self.assertNotRegex(path.read_text(), r'kickside\.[\w.]+\.traits:')
        self.assertFalse((MODULE / 'src/presets.lua').exists())
        self.assertFalse((MODULE / 'src/api/list_presets.lua').exists())

    def test_npm_lock_resolves_installable_packages(self):
        lock = json.loads((MODULE / 'ui/package-lock.json').read_text())
        for name, package in lock['packages'].items():
            if name:
                self.assertTrue(name.startswith('node_modules/'), name)
                self.assertFalse(package.get('link', False), name)

    def test_dependency_declaration_version_policy(self):
        accepted = ('*', '^5.0.0', '~5.0.0', '>=5.0.0', '>=5.0.0 <6.0.0', '5.x', '5.0', 'latest')
        rejected = (
            '5.0.0', '=5.0.0', '=v5.0.0', '= 5.0.0', ' = v5.0.0 ', ' 5.0.0 ', 'v5.0.0',
            '5.0.0-rc.1', '5.0.0+build.1',
        )
        for version in accepted:
            self.assertTrue(is_unpinned_dependency_version(version), version)
        for version in rejected:
            self.assertFalse(is_unpinned_dependency_version(version), version)

    def test_declarations_use_unpinned_dependencies(self):
        package = json.loads((MODULE / 'ui/package.json').read_text())
        for group in ('dependencies', 'devDependencies', 'peerDependencies'):
            for name, version in package.get(group, {}).items():
                self.assertTrue(is_unpinned_dependency_version(version), (name, version))
        for path in (MODULE / 'src').rglob('*.yaml'):
            data = yaml.safe_load(path.read_text())
            for entry in data.get('entries', []):
                if entry.get('kind') == 'ns.dependency':
                    self.assertTrue(is_unpinned_dependency_version(entry['version']))

if __name__ == '__main__':
    unittest.main()
