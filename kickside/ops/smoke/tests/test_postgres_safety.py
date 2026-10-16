import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import runtime
from harness import Failure
from runtime import Instance


PG = {'host': 'h', 'port': '5', 'user': 'u', 'password': 'p', 'maintenance': 'postgres', 'sslmode': 'disable',
      'pool_max_open': '12', 'pool_max_idle': '4'}


def instance(root):
    inst = Instance.__new__(Instance)
    inst.config = {'pg': PG, 'binary': '/bin/true', 'published': '', 'model': {}}
    inst.engine, inst.root = 'postgres', root
    inst.db, inst.db_created, inst.env = 'smoke_abc', False, {}
    inst.redactor = Mock(text=str)
    return inst


class PoolConfigTests(unittest.TestCase):
    def test_runtime_receives_declared_pool_bounds_through_the_existing_pool_configuration(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = instance(Path(directory))
            inst.port, inst.base, inst.email, inst.password = 1, 'http://x', 'e', 'p'
            command = inst.command()
        self.assertIn('app:db:pool.max_open=12', command)
        self.assertIn('app:db:pool.max_idle=4', command)
        self.assertEqual(command[command.index('app:db:pool.max_open=12') - 1], '-o')


class ScratchDatabaseTests(unittest.TestCase):
    def test_interrupt_between_create_and_return_still_drops_the_database(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = instance(Path(directory))
            statements = []
            def pg(sql):
                statements.append(sql)
                if sql.startswith('SELECT current_setting'):
                    return '100|3|10'
                if sql.startswith('CREATE DATABASE'):
                    raise KeyboardInterrupt('Signal 15')
                return ''
            inst.pg = pg
            with self.assertRaises(KeyboardInterrupt):
                inst.create_database()
            inst.drop_db()
        self.assertTrue(any(s.startswith('DROP DATABASE IF EXISTS "smoke_abc"') for s in statements))
        self.assertFalse(inst.db_created)
        self.assertFalse((Path(directory) / 'database.json').exists())

    def test_creation_refuses_when_the_server_lacks_headroom_for_the_pool(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = instance(Path(directory))
            inst.pg = Mock(return_value='100|3|90')
            with self.assertRaisesRegex(Failure, 'connection headroom'):
                inst.create_database()
        self.assertFalse(inst.db_created)
        inst.pg.assert_called_once()

    def test_owner_record_names_database_and_process(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = instance(Path(directory))
            inst.pg = Mock(side_effect=lambda sql: '100|3|10' if sql.startswith('SELECT current_setting') else '')
            inst.create_database()
            record = json.loads((Path(directory) / 'database.json').read_text())
        self.assertEqual(record['db'], 'smoke_abc')
        self.assertEqual(record['pid'], os.getpid())
        self.assertEqual(record['identity'], runtime.process_identity(os.getpid()))


class OrphanReaperTests(unittest.TestCase):
    def record(self, root, name, pid, identity):
        folder = root / name
        folder.mkdir(parents=True)
        (folder / 'database.json').write_text(json.dumps({'db': 'smoke_' + name, 'pid': pid, 'identity': identity}))

    def test_drops_only_databases_whose_owner_process_is_gone(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            self.record(root, 'live', os.getpid(), runtime.process_identity(os.getpid()))
            self.record(root, 'dead', 2 ** 22 + 1, '1')
            self.record(root, 'reused', os.getpid(), 'different-start-time')
            statements = []
            reaped = runtime.reap_orphan_databases(root, statements.append)
            self.assertEqual(sorted(reaped), ['smoke_dead', 'smoke_reused'])
            self.assertTrue(any('DROP DATABASE IF EXISTS "smoke_dead"' in s for s in statements))
            self.assertFalse(any('smoke_live' in s for s in statements))
            self.assertTrue((root / 'live' / 'database.json').exists())
            self.assertFalse((root / 'dead' / 'database.json').exists())


if __name__ == '__main__':
    unittest.main()
