"""The Hub planner binds newly introduced Security requirements on both engines."""
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest
import uuid
import yaml
from ops.compat.fetch_baselines import Hub
from ops.compat.inventory import ROOT, discover, local_entries
from ops.compat.migrations import command, write_entries

class SecurityRequirementsTests(unittest.TestCase):
    def test_users_update_binds_security_on_an_existing_host(self):
        with tempfile.TemporaryDirectory(prefix='security-requirements-', dir=os.environ['TMPDIR']) as directory:
            work = Path(directory)
            upstream = Hub().fetch('keeper/keeper', work)
            print('Keeper planner:', upstream['version'], upstream['sha256'], flush=True)
            selected = {key: upstream['entries'][key] for key in ('keeper.hub:planner', 'keeper.hub:ownership', 'keeper.gov:consts')}
            source = work / 'runtime/src'
            source.mkdir(parents=True)
            runtime = source.parent
            write_entries(source, selected)
            users = yaml.safe_load((ROOT / 'platform/users/src/_index.yaml').read_text())['entries']
            dependency = next(row for row in users if row['kind'] == 'ns.dependency' and row['component'] == 'kickside/security')
            requirements = [row for row in yaml.safe_load((ROOT / 'platform/security/src/_index.yaml').read_text())['entries'] if row['kind'] == 'ns.requirement']
            users_resources = {identity: row['Kind'] for identity, row in local_entries(
                discover([ROOT])['kickside/users'], work / 'users-resources').items()}
            harness = yaml.safe_load((ROOT / 'ops/compat/harness/_index.yaml').read_text())
            harness['entries'] = [row for row in harness['entries'] if row['name'] not in ('plan', 'suite')]
            harness['entries'] += [
                {'name': 'guard', 'kind': 'library.lua', 'source': 'file://security_update_contract.lua'},
                {'name': 'fixture', 'kind': 'library.lua', 'source': 'file://fixture.lua', 'modules': ['json']},
                {'name': 'suite', 'kind': 'function.lua', 'source': 'file://suite.lua', 'method': 'run',
                 'meta': {'type': 'test', 'suite': 'security_requirements', 'timeout': '300s'},
                 'imports': {'test': 'wippy.test:test', 'planner': 'keeper.hub:planner', 'fixture': 'app:fixture', 'guard': 'app:guard'}},
            ]
            (source / '_index.yaml').write_text(yaml.safe_dump(harness))
            shutil.copy(ROOT / 'ops/compat/integration/security_requirements.lua', source / 'suite.lua')
            shutil.copy(ROOT / 'ops/compat/integration/security_update_contract.lua', source / 'security_update_contract.lua')
            (source / 'fixture.lua').write_text('return {}\n')
            (runtime / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'kickside', 'module': 'security-requirements', 'type': 'application', 'directories': {'src': 'src', 'modules': '.wippy'}}))
            (runtime / '.wippy.yaml').write_text('version: "1.0"\n')
            env = dict(os.environ, PGHOST='127.0.0.1', PGPORT='5433', PGUSER='kickside', PGPASSWORD='kickside', ENCRYPTION_KEY='12' * 32)
            command(['wippy', 'init', '--src-dir', 'src', '--modules-dir', '.wippy'], runtime, work / 'init.log', env)
            try:
                command(['wippy', 'update'], runtime, work / 'update.log', env)
            finally:
                shutil.copy(work / 'update.log', Path(os.environ['TMPDIR']) / 'security-requirements-update.log')
            for engine in ('sqlite', 'postgres'):
                with self.subTest(engine=engine):
                    fixture = {'component': dependency['component'], 'requirements': requirements,
                               'users_resources': users_resources, 'db_kind': 'db.sql.' + engine}
                    (source / 'fixture.lua').write_text('return require("json").decode([=[' + json.dumps(fixture) + ']=])\n')
                    database = 'gf_harness_compat_' + uuid.uuid4().hex
                    overrides = {'app:db:file': str(work / 'database.sqlite')}
                    if engine == 'postgres':
                        overrides.update({'app:db:kind': 'db.sql.postgres', 'app:db:host': env['PGHOST'], 'app:db:port': int(env['PGPORT']), 'app:db:database': database, 'app:db:username': env['PGUSER'], 'app:db:password': env['PGPASSWORD'], 'app:db:options.sslmode': 'disable'})
                        command(['createdb', database], runtime, work / 'createdb.log', env)
                    (runtime / '.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0', 'override': overrides}))
                    log = work / (engine + '.log')
                    try:
                        command(['wippy', 'test'], runtime, log, env)
                        output = log.read_text()
                        self.assertIn('PASSED', output, output[-5000:])
                        self.assertNotIn('FAILED', output, output[-5000:])
                    finally:
                        if log.exists(): shutil.copy(log, Path(os.environ['TMPDIR']) / ('security-requirements-' + engine + '.log'))
                        if engine == 'postgres': command(['dropdb', database], runtime, work / 'dropdb.log', env)
