import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PostgresSweepTests(unittest.TestCase):
    def invoke(self, result='PASSED\n1 tests', status=0, config=True, drop_status=0):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as scratch:
            directory = Path(scratch)
            script = directory / 'ops/scripts/test-postgres.sh'
            script.parent.mkdir(parents=True)
            shutil.copyfile(ROOT / 'ops/scripts/test-postgres.sh', script)
            module = directory / 'core/fixture'
            (module / 'test').mkdir(parents=True)
            if config:
                (module / 'test/.wippy.yaml').write_text('vars:\n  pg_database: existing_owned_database\nprofiles:\n  postgres: {}\n')
            (module / 'test/wippy.lock').write_text('wippy/test\n')
            (module / 'Makefile').write_text('.PHONY: test\ntest:\n\t@gate $(WIPPY_TEST_ARGS)\n')
            binary_directory = directory / 'bin'
            binary_directory.mkdir()
            code = '''#!/usr/bin/env python3
import json, os, subprocess, sys
from pathlib import Path
name = Path(sys.argv[0]).name
with Path(os.environ['SWEEP_CALLS']).open('a') as output:
    output.write(json.dumps({'name': name, 'args': sys.argv[1:]}) + '\\n')
if name == 'timeout':
    sys.exit(subprocess.run(sys.argv[2:]).returncode)
if name in ('gate', 'wippy'):
    print(os.environ['SWEEP_RESULT'])
    sys.exit(int(os.environ['SWEEP_STATUS']))
if name == 'dropdb':
    sys.exit(int(os.environ['SWEEP_DROP_STATUS']))
print('1')
'''
            for name in ('psql', 'createdb', 'dropdb', 'timeout', 'gate', 'wippy'):
                binary = binary_directory / name
                binary.write_text(code)
                binary.chmod(0o755)
            calls = directory / 'calls.jsonl'
            environment = dict(os.environ, PATH=str(binary_directory) + os.pathsep + os.environ['PATH'],
                TMPDIR=str(directory), SWEEP_CALLS=str(calls), SWEEP_RESULT=result,
                SWEEP_STATUS=str(status), SWEEP_DROP_STATUS=str(drop_status),
                PG_HOST='127.0.0.1', PG_PORT='5433', PG_USER='kickside', PG_PASSWORD='fixture')
            run = subprocess.run(['bash', str(script), 'core/fixture'], env=environment,
                                 capture_output=True, text=True, timeout=30)
            return run, [json.loads(line) for line in calls.read_text().splitlines()]

    def test_runs_the_module_target_with_a_unique_database_and_keeps_the_timeout(self):
        run, calls = self.invoke()
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        gates = [row for row in calls if row['name'] == 'gate']
        self.assertEqual(len(gates), 1, calls)
        self.assertIn('--profile', gates[0]['args'])
        self.assertIn('postgres', gates[0]['args'])
        database = next(arg.split('=', 1)[1] for arg in gates[0]['args'] if arg.startswith('vars.pg_database='))
        self.assertNotEqual(database, 'existing_owned_database')
        self.assertTrue(any(row['name'] == 'createdb' and database in row['args'] for row in calls))
        self.assertTrue(any(row['name'] == 'dropdb' and database in row['args'] for row in calls))
        timeout = next(row for row in calls if row['name'] == 'timeout')
        self.assertEqual(timeout['args'][0], '600')
        self.assertEqual(timeout['args'][1], 'make')
        self.assertFalse(any('existing_owned_database' in arg for row in calls for arg in row['args']))

    def test_missing_profile_is_a_failure(self):
        run, _ = self.invoke(config=False)
        self.assertNotEqual(run.returncode, 0)

    def test_failed_assertions_are_a_failure(self):
        run, _ = self.invoke(result='FAILED\n1 passed 1 failed')
        self.assertNotEqual(run.returncode, 0)

    def test_nonzero_runtime_status_is_a_failure(self):
        run, _ = self.invoke(status=2)
        self.assertNotEqual(run.returncode, 0)

    def test_missing_terminal_verdict_is_a_failure(self):
        run, _ = self.invoke(result='runner starts')
        self.assertNotEqual(run.returncode, 0)

    def test_zero_executed_cases_are_a_failure(self):
        run, _ = self.invoke(result='PASSED\n0 tests')
        self.assertNotEqual(run.returncode, 0)

    def test_database_cleanup_failure_is_a_failure(self):
        run, _ = self.invoke(drop_status=1)
        self.assertNotEqual(run.returncode, 0)


class CoreSweepTests(unittest.TestCase):
    def test_delegates_to_the_module_makefile_and_propagates_failure(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as scratch:
            root = Path(scratch)
            shutil.copyfile(ROOT / 'core/Makefile', root / 'Makefile')
            module = root / 'fixture'
            (module / 'test').mkdir(parents=True)
            (module / 'test/wippy.lock').write_text('wippy/test\n')
            (module / 'Makefile').write_text('.PHONY: test\ntest:\n\t@echo "native module target $(WIPPY_TEST_ARGS)"\n\t@exit 7\n')
            binary = root / 'wippy'
            binary.write_text('#!/bin/sh\necho "PASSED 1 tests"\n')
            binary.chmod(0o755)
            environment = dict(os.environ, TMPDIR=str(root), PATH=str(root) + os.pathsep + os.environ['PATH'])
            run = subprocess.run(['make', '-C', str(root), 'test', 'MODULES=fixture',
                                  'WIPPY_TEST_ARGS=--profile postgres'], env=environment,
                                 capture_output=True, text=True, timeout=30)
            self.assertIn('native module target --profile postgres', run.stdout)
            self.assertNotEqual(run.returncode, 0)
