import tempfile
import unittest
from pathlib import Path

from harness import Scenario
from source_profile import build, requirements


class SourceProfileTests(unittest.TestCase):
    def scenario(self):
        return Scenario('source', 'regression', lambda ctx: None,
                        source_components=('spiralscout/meetings',),
                        source_checkout_roots=('module',))

    def cohort(self, root):
        source = root / 'kickside'
        source.mkdir()
        meetings = root / 'meetings'
        meetings.mkdir()
        (meetings / 'wippy.yaml').write_text('organization: spiralscout\nmodule: meetings\n')
        template = root / 'module'
        template.mkdir()
        (template / '.kickside-module.json').write_text('{"initialized": false}\n')
        return source, meetings, template

    def test_collects_explicit_selected_inputs(self):
        self.assertEqual(requirements([self.scenario()]),
                         (['spiralscout/meetings'], ['module']))

    def test_selects_public_sibling_by_manifest_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            source, meetings, template = self.cohort(Path(directory))
            profile = build(source, {}, [self.scenario()])
            self.assertEqual(profile['replacements'],
                             {'spiralscout/meetings': str(meetings)})
            self.assertEqual(profile['checkouts'], {'module': str(template)})

    def test_explicit_replacement_wins_over_sibling_discovery(self):
        with tempfile.TemporaryDirectory() as directory:
            source, _, _ = self.cohort(Path(directory))
            selected = Path(directory) / 'external' / 'selected'
            selected.mkdir(parents=True)
            (selected / 'wippy.yaml').write_text('organization: spiralscout\nmodule: meetings\n')
            profile = build(source, {'spiralscout/meetings': str(selected)},
                            [self.scenario()])
            self.assertEqual(profile['replacements']['spiralscout/meetings'], str(selected))

    def test_rejects_mismatched_explicit_module_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            source, _, _ = self.cohort(Path(directory))
            selected = Path(directory) / 'external' / 'selected'
            selected.mkdir(parents=True)
            (selected / 'wippy.yaml').write_text('organization: other\nmodule: source\n')
            with self.assertRaisesRegex(ValueError, 'identities do not match.*other/source'):
                build(source, {'spiralscout/meetings': str(selected)}, [self.scenario()])

    def test_rejects_duplicate_sibling_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, _, _ = self.cohort(root)
            duplicate = root / 'duplicate'
            duplicate.mkdir()
            (duplicate / 'wippy.yaml').write_text('organization: spiralscout\nmodule: meetings\n')
            with self.assertRaisesRegex(ValueError, 'duplicate module identities.*spiralscout/meetings'):
                build(source, {}, [self.scenario()])

    def test_rejects_missing_declared_inputs(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'kickside'
            source.mkdir()
            with self.assertRaisesRegex(ValueError, 'spiralscout/meetings.*declared checkout identities'):
                build(source, {}, [self.scenario()])

    def test_ignores_nested_fixture_manifest(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'kickside'
            source.mkdir()
            fixture = source / 'test' / 'meetings'
            fixture.mkdir(parents=True)
            (fixture / 'wippy.yaml').write_text('organization: spiralscout\nmodule: meetings\n')
            scenario = Scenario('source', 'regression', lambda ctx: None,
                                source_components=('spiralscout/meetings',))
            with self.assertRaisesRegex(ValueError, 'spiralscout/meetings'):
                build(source, {}, [scenario])

    def test_ignores_unselected_sibling_duplicates(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'kickside'
            source.mkdir()
            for name in ('one', 'two'):
                sibling = root / name
                sibling.mkdir()
                (sibling / 'wippy.yaml').write_text('organization: other\nmodule: duplicate\n')
            self.assertEqual(build(source, {}, []), {'replacements': {}, 'checkouts': {}})

    def test_requires_declared_docs_checkout_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'kickside'
            source.mkdir()
            docs = root / 'docs'
            docs.mkdir()
            scenario = Scenario('docs', 'regression', lambda ctx: None,
                                source_checkout_roots=('docs',))
            with self.assertRaisesRegex(ValueError, 'declared checkout identities: docs'):
                build(source, {}, [scenario])
            (docs / 'kickside-development').mkdir()
            (docs / 'kickside-development/developer-handbook.md').write_text('handbook\n')
            (docs / 'operations').mkdir()
            (docs / 'operations/configuration.md').write_text('configuration\n')
            with self.assertRaisesRegex(ValueError, 'declared checkout identities: docs'):
                build(source, {}, [scenario])
            (docs / 'building-modules').mkdir()
            (docs / 'building-modules/index.md').write_text('module authoring\n')
            (docs / 'reference').mkdir()
            (docs / 'reference/documentation-catalog.md').write_text('public documentation catalog\n')
            self.assertEqual(build(source, {}, [scenario])['checkouts'], {'docs': str(docs)})

    def test_requires_declared_docs_site_checkout_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'kickside'
            source.mkdir()
            site = root / 'docs-site'
            site.mkdir()
            scenario = Scenario('docs-site', 'regression', lambda ctx: None,
                                source_checkout_roots=('docs-site',))
            with self.assertRaisesRegex(ValueError, 'declared checkout identities: docs-site'):
                build(source, {}, [scenario])
            (site / 'scripts').mkdir()
            (site / 'tests').mkdir()
            for path in ('mkdocs.yml', 'scripts/sync_sources.py', 'tests/test_workflows.py'):
                (site / path).write_text('present\n')
            self.assertEqual(build(source, {}, [scenario])['checkouts'], {'docs-site': str(site)})

    def test_requires_real_public_repository_bundle_markers(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'kickside'
            source.mkdir()
            repositories = root / 'public-repositories'
            repositories.mkdir()
            scenario = Scenario('public-source-hygiene', 'regression', lambda ctx: None,
                                source_checkout_roots=('public-repositories',))
            with self.assertRaisesRegex(ValueError, 'declared checkout identities: public-repositories'):
                build(source, {}, [scenario])
            for name in ('kickside', 'providers', 'converters', 'crm', 'components', 'chestor', 'module', 'docs'):
                marker = repositories / name / '.git'
                marker.mkdir(parents=True)
                (marker / 'HEAD').write_text('ref: refs/heads/main\n')
            self.assertEqual(build(source, {}, [scenario])['checkouts'],
                             {'public-repositories': str(repositories)})


if __name__ == '__main__':
    unittest.main()
