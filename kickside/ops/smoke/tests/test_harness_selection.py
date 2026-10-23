"""Focused harness selection executes declared cases with the production CLI."""
from pathlib import Path
import tempfile
import unittest

import yaml


class HarnessSelectionTests(unittest.TestCase):
    def test_null_metadata_on_an_ordinary_entry_does_not_break_test_discovery(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'ordinary', 'kind': 'function.lua', 'meta': None},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            config = {}
            _focus_tests(root, config, 'case', available={'fixture:case'})
            self.assertEqual(config['override'], {})

    def test_loaded_registry_focus_does_not_parse_unrelated_source_directories(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'harness'
            root.mkdir()
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            unrelated = Path(directory) / 'unloaded'
            unrelated.mkdir()
            (unrelated / 'not_loaded.yaml').write_text('invalid: [yaml')
            config = {'workspace': {'replacements': {'example/unloaded': str(unrelated)}}}
            _focus_tests(root, config, 'case', available={'fixture:case', 'loaded:foreign_test'})
            self.assertEqual(config['override'], {'loaded:foreign_test:meta.type': 'test_focus_excluded'})

    def test_resolved_catalog_excludes_only_loaded_replacement_tests(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'harness'
            root.mkdir()
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
                {'name': 'other', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            dependency = Path(directory) / 'dependency'
            dependency.mkdir()
            (dependency / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'foreign', 'entries': [
                {'name': 'loaded', 'meta': {'type': 'test'}},
                {'name': 'not_imported', 'meta': {'type': 'test'}},
            ]}))
            config = {'workspace': {'replacements': {'example/dependency': str(dependency)}}}
            available = {'fixture:setup', 'fixture:case', 'fixture:other', 'foreign:loaded'}
            _focus_tests(root, config, 'case', available=available)
            self.assertEqual(config['override'], {
                'fixture:other:meta.type': 'test_focus_excluded',
                'foreign:loaded:meta.type': 'test_focus_excluded',
            })

    def test_source_declaration_does_not_credit_a_test_absent_from_the_loaded_catalog(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            with self.assertRaisesRegex(RuntimeError, 'matches no test'):
                _focus_tests(root, {}, 'case', available={'fixture:setup'})

    def test_focuses_entries_and_suites_without_removing_declarations(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_index.yaml').write_text(yaml.safe_dump({
                'namespace': 'fixture', 'entries': [
                    {'name': 'first', 'kind': 'function.lua', 'meta': {'type': 'test', 'suite': 'alpha'}},
                    {'name': 'second', 'kind': 'function.lua', 'meta': {'type': 'test', 'suite': 'alpha'}},
                    {'name': 'third', 'kind': 'function.lua', 'meta': {'type': 'test', 'suite': 'beta'}},
                ]}))
            config = {'override': {'fixture:db:file': 'owned.sqlite'}}
            _focus_tests(root, config, 'first')
            self.assertEqual(config['override'], {
                'fixture:db:file': 'owned.sqlite',
                'fixture:second:meta.type': 'test_focus_excluded',
                'fixture:third:meta.type': 'test_focus_excluded',
            })
            config = {}
            _focus_tests(root, config, 'alpha')
            self.assertEqual(config['override'], {'fixture:third:meta.type': 'test_focus_excluded'})
            self.assertEqual(len(yaml.safe_load((root / '_index.yaml').read_text())['entries']), 3)
            with self.assertRaisesRegex(RuntimeError, 'matches no test'):
                _focus_tests(root, {}, 'missing')

    def test_focused_runs_retain_the_ordered_harness_initialization_suite(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace':'fixture','entries':[
                {'name':'initialize','meta':{'type':'test','suite':'00_setup'}},
                {'name':'case','meta':{'type':'test','suite':'behavior'}}]}))
            config = {}
            _focus_tests(root, config, 'case')
            self.assertNotIn('fixture:initialize:meta.type', config['override'])

    def test_focused_runs_exclude_replacement_source_tests_and_their_setup(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'harness'
            root.mkdir()
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            dependency = Path(directory) / 'dependency'
            dependency.mkdir()
            (dependency / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'foreign', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            config = {'workspace': {'replacements': {'example/dependency': str(dependency)}}}
            _focus_tests(root, config, 'case')
            self.assertNotIn('fixture:setup:meta.type', config['override'])
            self.assertEqual(config['override']['foreign:setup:meta.type'], 'test_focus_excluded')
            self.assertEqual(config['override']['foreign:case:meta.type'], 'test_focus_excluded')

    def test_full_root_runs_exclude_replacement_source_tests_and_their_setup(self):
        from module_harness import _focus_tests
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'harness'
            root.mkdir()
            (root / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'fixture', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'first', 'meta': {'type': 'test', 'suite': 'behavior'}},
                {'name': 'second', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            dependency = Path(directory) / 'dependency'
            dependency.mkdir()
            (dependency / '_index.yaml').write_text(yaml.safe_dump({'namespace': 'foreign', 'entries': [
                {'name': 'setup', 'meta': {'type': 'test', 'suite': '00_setup'}},
                {'name': 'case', 'meta': {'type': 'test', 'suite': 'behavior'}},
            ]}))
            config = {'workspace': {'replacements': {'example/dependency': str(dependency)}}}
            _focus_tests(root, config)
            self.assertEqual(config['override'], {
                'foreign:setup:meta.type': 'test_focus_excluded',
                'foreign:case:meta.type': 'test_focus_excluded',
            })
