"""Real runtime/engine regression: a destructive migration must fail the gate."""
import copy
import os
from pathlib import Path
import tempfile
import unittest
from ops.compat.migrations import rehearse

CREATE = '''return require("migration").define(function()
 migration("create fixture", function()
  for _, engine in ipairs({"sqlite", "postgres"}) do
   database(engine, function() up(function(db)
    local _, err = db:execute("CREATE TABLE compat_record(id TEXT PRIMARY KEY, value TEXT NOT NULL)")
    if err then error(tostring(err)) end
   end) end)
  end
 end)
end)'''
ADD = CREATE.replace('create fixture', 'extend fixture').replace('CREATE TABLE compat_record(id TEXT PRIMARY KEY, value TEXT NOT NULL)', "ALTER TABLE compat_record ADD COLUMN optional TEXT")

def entry(stamp, source):
    return {'Kind': 'function.lua', 'Meta': {'type': 'migration', 'timestamp': stamp},
            'Data': {'source': source, 'method': 'migrate', 'imports': {'migration': 'wippy.migration:migration'}}}

class UpgradeTests(unittest.TestCase):
    def test_preserving_update_passes_and_destructive_update_fails_both_engines(self):
        root = Path(os.environ['TMPDIR'])
        old = {'compat:create': entry('2026-01-01', CREATE)}
        new = {**old, 'compat:extend': entry('2026-01-02', ADD)}
        fixture = {'compat:extend': {'seed': ["INSERT INTO compat_record VALUES ('published-id', 'published value')"],
            'assertions': [{'query': 'SELECT id, value FROM compat_record', 'rows': [{'id': 'published-id', 'value': 'published value'}]}]}}
        with tempfile.TemporaryDirectory(dir=root) as directory:
            result = rehearse(old, new, Path(directory) / 'preserve', fixture)
            self.assertEqual(set(result['engines']), {'sqlite', 'postgres'})
            self.assertTrue(all(row['status'] == 'pass' for row in result['engines'].values()))
            broken = copy.deepcopy(new)
            broken['compat:extend']['Data']['source'] = ADD.replace('ALTER TABLE compat_record ADD COLUMN optional TEXT', 'DELETE FROM compat_record')
            for engine in ('sqlite', 'postgres'):
                with self.assertRaises(ValueError):
                    rehearse(old, broken, Path(directory) / engine, fixture, engines=(engine,))

    def test_baseline_uses_published_helpers_before_loading_current_helpers(self):
        old_create = CREATE.replace('"CREATE TABLE compat_record(id TEXT PRIMARY KEY, value TEXT NOT NULL)"', 'require("helper").statement')
        old = {'compat:create': entry('2026-01-01', old_create),
               'compat:helper': {'Kind': 'library.lua', 'Meta': {}, 'Data': {'source': 'return {statement = "CREATE TABLE compat_record(id TEXT PRIMARY KEY, value TEXT NOT NULL)"}'}}}
        old['compat:create']['Data']['imports']['helper'] = 'compat:helper'
        new = copy.deepcopy(old)
        new['compat:helper']['Data']['source'] = 'return {statement = "INVALID CURRENT HELPER", alter = "ALTER TABLE compat_record ADD COLUMN optional TEXT"}'
        new['compat:extend'] = entry('2026-01-02', ADD.replace('"ALTER TABLE compat_record ADD COLUMN optional TEXT"', 'require("helper").alter'))
        new['compat:extend']['Data']['imports']['helper'] = 'compat:helper'
        fixture = {'compat:extend': {'seed': ["INSERT INTO compat_record VALUES ('p', 'v')"],
            'assertions': [{'query': 'SELECT id FROM compat_record', 'rows': [{'id': 'p'}]}]}}
        with tempfile.TemporaryDirectory(dir=Path(os.environ['TMPDIR'])) as directory:
            result = rehearse(old, new, Path(directory) / 'versions', fixture)
            self.assertTrue(all(row['status'] == 'pass' for row in result['engines'].values()))

    def test_later_added_migration_preserves_data_from_an_earlier_added_step(self):
        old = {'compat:create': entry('2026-01-01', CREATE)}
        create_second = CREATE.replace('create fixture', 'create second').replace('compat_record', 'compat_second')
        extend_second = ADD.replace('compat_record', 'compat_second')
        new = {**old, 'compat:second': entry('2026-01-02', create_second),
               'compat:extend': entry('2026-01-03', extend_second)}
        fixtures = {identity: {'seed': ["INSERT INTO compat_record VALUES ('" + identity + "', 'published')"],
                               'assertions': [{'query': "SELECT value FROM compat_record WHERE id = '" + identity + "'",
                                               'rows': [{'value': 'published'}]}]} for identity in ('compat:second', 'compat:extend')}
        fixtures['compat:extend'].update(seed_before=["INSERT INTO compat_second VALUES ('between-updates', 'retained')"],
            after=[{'query': 'SELECT id, value FROM compat_second',
                    'rows': [{'id': 'between-updates', 'value': 'retained'}]}])
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            result = rehearse(old, new, Path(directory) / 'steps', fixtures)
            self.assertTrue(all(row['status'] == 'pass' for row in result['engines'].values()))
            broken = copy.deepcopy(new)
            broken['compat:extend']['Data']['source'] = extend_second.replace('ALTER TABLE compat_second ADD COLUMN optional TEXT', 'DELETE FROM compat_second')
            for engine in ('sqlite', 'postgres'):
                with self.subTest(engine=engine), self.assertRaises(ValueError):
                    rehearse(old, broken, Path(directory) / engine, fixtures, engines=(engine,))
