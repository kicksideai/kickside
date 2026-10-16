import os
import tempfile
from pathlib import Path
import unittest
import yaml

from scenarios_hot_update_work import revision


class HotUpdateSourceTest(unittest.TestCase):
    def test_runtime_revision_preserves_existing_migration_code_and_declarations(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'src'
            source.mkdir()
            (source / 'work.lua').write_text('return {}\n')
            migration = source / 'migration.lua'
            migration.write_text('return {migration = function() return true end}\n')
            declaration = {'name': 'migration', 'kind': 'function.lua', 'source': 'file://migration.lua',
                           'meta': {'type': 'migration'}, 'method': 'migration'}
            index = source / '_index.yaml'
            index.write_text(yaml.safe_dump({'namespace': 'test.work', 'entries': [
                {'name': 'work', 'kind': 'library.lua', 'source': 'file://work.lua'}, declaration]}))
            self.assertEqual(revision(root, 'before'), ['test.work:work'])
            self.assertEqual(revision(root, 'after'), ['test.work:work'])
            self.assertEqual(migration.read_text(), 'return {migration = function() return true end}\n')
            self.assertEqual(yaml.safe_load(index.read_text())['entries'][1], declaration)

    def test_revision_changes_shared_executable_source_and_declares_the_logger(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'src'
            source.mkdir()
            code = source / 'work.lua'
            code.write_text('return {run = function() return true end}\n')
            index = source / '_index.yaml'
            index.write_text(yaml.safe_dump({'namespace': 'test.work', 'entries': [
                {'name': 'work', 'kind': 'library.lua', 'source': 'file://work.lua'},
                {'name': 'run', 'kind': 'function.lua', 'source': 'file://work.lua', 'method': 'run', 'modules': ['time']},
            ]}))
            self.assertEqual(revision(root, 'before'), ['test.work:work', 'test.work:run'])
            before = code.read_text()
            self.assertIn('hot-update-executable-before', before)
            self.assertIn('require("logger"):named(', before)
            self.assertEqual(before.count('hot-update-executable-'), 1)
            revision(root, 'after')
            after = code.read_text()
            self.assertNotEqual(before, after)
            self.assertIn('hot-update-executable-after', after)
            self.assertNotIn('hot-update-executable-before', after)
            self.assertTrue(after.endswith('return {run = function() return true end}\n'))
            entries = yaml.safe_load(index.read_text())['entries']
            self.assertEqual(entries[0]['modules'], ['logger'])
            self.assertEqual(entries[1]['modules'], ['time', 'logger'])
            self.assertTrue(all(entry['meta']['hot_update_revision'] == 'after' for entry in entries))
