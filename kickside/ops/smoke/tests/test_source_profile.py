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
            with self.assertRaisesRegex(ValueError, 'spiralscout/meetings.*module-template'):
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


if __name__ == '__main__':
    unittest.main()
