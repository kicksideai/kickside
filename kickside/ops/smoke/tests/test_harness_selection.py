"""Focused harness selection executes declared cases with the production CLI."""
from pathlib import Path
import tempfile
import unittest

import yaml


class HarnessSelectionTests(unittest.TestCase):
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
