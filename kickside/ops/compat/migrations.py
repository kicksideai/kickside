"""Run published migrations, seed data, then run added migrations on both engines."""
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import uuid

import yaml

# Boot environment of the harness application. Every baseline and update phase
# runs the users module, whose admin bootstrap reads these variables.
HARNESS_ENV = {
    'ENCRYPTION_KEY': '12' * 32,
    'KICKSIDE_USERS_ADMIN_GROUP_ID': 'app:admins',
    'KICKSIDE_USERS_ADMIN_INIT_ENABLED': 'false',
}


def harness_env(base, recipe_env):
    return dict(base, **HARNESS_ENV, **recipe_env)


def migration_plan(old, new):
    before = {i: r for i, r in old.items() if (r.get('Meta') or {}).get('type') == 'migration'}
    after = {i: r for i, r in new.items() if (r.get('Meta') or {}).get('type') == 'migration'}
    def order(rows):
        return sorted(rows, key=lambda i: ((rows[i].get('Meta') or {}).get('timestamp', ''), i))
    return {'baseline': order(before), 'added': order({i: after[i] for i in after.keys() - before.keys()}),
            'changed': sorted(i for i in before.keys() & after.keys() if before[i]['Data'] != after[i]['Data'])}


def checkpoint_entries(entries, identity):
    namespace = identity.split(':', 1)[0]
    ordered = [step for step in migration_plan(entries, entries)['baseline'] if step.split(':', 1)[0] == namespace]
    if identity not in ordered:
        raise ValueError(f'{identity}: pending migration checkpoint is absent')
    before = set(ordered[:ordered.index(identity)])
    through = before | {identity}
    def subset(allowed):
        return {key: row for key, row in entries.items() if (row.get('Meta') or {}).get('type') != 'migration' or key in allowed}
    return subset(before), subset(through)


def upgrade_checkpoint(published, current, identities, fixture_registry=()):
    """Rehearse selected migrations from the published schema before their checkpoint.

    ``fixture_registry`` is the deliberately small set of host configuration
    entries which can be resolved dynamically rather than imported by a
    migration.  Read each from its own raw inventory: the published bytes build
    the baseline and the current bytes build the update.
    """
    ordered = migration_plan(published, published)['baseline']
    boundary = min(ordered.index(identity) for identity in identities)
    baseline_ids = ordered[:boundary]
    fixture_registry = list(fixture_registry)
    baseline = closure(published, baseline_ids + fixture_registry)
    if set(identities) & baseline.keys():
        raise ValueError('published checkpoint depends on a selected upgrade migration')
    baseline.update({key: row for key, row in published.items() if row['Kind'] == 'env.variable'})
    update = dict(baseline, **closure(current, list(identities) + fixture_registry))
    update.update({key: row for key, row in current.items() if row['Kind'] == 'env.variable'})
    return baseline, update


def database_baseline(plan, recipes, current=None):
    root = Path(__file__).resolve().parents[2]
    declarations = {}
    baseline = list(plan['baseline'])
    for identity in plan['baseline']:
        recipe = recipes.get(identity, {})
        kinds = [kind for kind in ('baseline_setup', 'baseline_checkpoint') if kind in recipe]
        if not kinds:
            continue
        if len(kinds) != 1:
            raise ValueError(f'{identity}: conflicting baseline declarations')
        kind = kinds[0]
        declaration = recipe[kind]
        if identity in plan['added']:
            raise ValueError(f'{identity}: added migration cannot be baseline setup')
        if set(declaration) != {'reason', 'proof'} or not all(isinstance(value, str) and value.strip() for value in declaration.values()):
            raise ValueError(f'{identity}: baseline declaration needs a reason and repository proof')
        proof = (root / declaration['proof']).resolve()
        if not proof.is_relative_to(root) or not proof.is_file():
            raise ValueError(f'{identity}: baseline proof must be a repository file')
        declarations[identity] = declaration
        if kind == 'baseline_checkpoint':
            if current is None or identity in current:
                raise ValueError(f'{identity}: pending baseline checkpoint must be a removed migration')
            before = plan['baseline'][:plan['baseline'].index(identity)]
            namespace = identity.split(':', 1)[0]
            baseline = [step for step in baseline if step in before or step.split(':', 1)[0] != namespace]
        else:
            baseline = [step for step in baseline if step != identity]
    return baseline, declarations


def select_fixtures(added, recipes, *, engine=None):
    selected = {'seed': [], 'assertions': [], 'after': [], 'env': {}, 'registry': {}, 'before': {}, 'step_after': {}}
    for identity in added:
        recipe = recipes.get(identity)
        if not recipe or not recipe.get('seed') or not recipe.get('assertions'):
            raise ValueError(f'{identity}: added migration requires representative seed and preservation assertions')
        def statement(value):
            if isinstance(value, str) and value.strip():
                return value
            if (not isinstance(value, dict) or set(value) != {'sqlite', 'postgres'}
                    or not all(isinstance(sql, str) and sql.strip() for sql in value.values())):
                raise ValueError(f'{identity}: fixture SQL needs a statement for both engines')
            return value[engine] if engine is not None else value

        def cases(values):
            return [dict(case, query=statement(case['query'])) for case in values]

        selected['before'][identity] = [statement(value) for value in recipe.get('seed_before', [])]
        selected['step_after'][identity] = cases(recipe.get('step_after', []))
        selected['seed'].extend(statement(value) for value in recipe['seed'])
        for key in ('assertions', 'after'):
            selected[key].extend(cases(recipe.get(key, [])))
        selected['env'].update(recipe.get('env', {}))
        for identity, row in recipe.get('registry', {}).items():
            if identity in selected['registry'] and selected['registry'][identity] != row:
                raise ValueError(f'{identity}: conflicting fixture configuration')
            selected['registry'][identity] = row
    return selected


def closure(entries, identities):
    result = {}
    pending = list(identities)
    while pending:
        identity = pending.pop()
        if identity in result:
            continue
        row = entries.get(identity)
        if row is None:
            if identity.startswith(('wippy.migration:', 'wippy.test:')):
                continue
            raise ValueError(f'{identity}: migration import is not in the published/local owned inventory')
        if row['Kind'] not in ('function.lua', 'library.lua', 'registry.entry'):
            raise ValueError(f'{identity}: unsupported migration import kind {row["Kind"]}')
        result[identity] = row
        pending.extend(i for i in (row.get('Meta') or {}).get('depends_on', []) if ':' in i and not i.startswith('ns:'))
        imports = (row.get('Data') or {}).get('imports') or {}
        pending.extend(imports.values())
    return result


def bind_fixture_registry(entries, bindings):
    """Bind declared harness values without replacing an inventory entry.

    Runtime configuration entries are intentionally not imports of every caller:
    a module can resolve one dynamically with ``registry.get``.  A migration
    fixture therefore names each required host binding explicitly.  Keep the
    row from its own phase inventory, then apply only that declarative binding;
    in particular, never use the current row while constructing a published
    baseline.
    """
    configured = copy.deepcopy(entries)
    for identity, binding in bindings.items():
        row = configured.get(identity)
        if row is None:
            raise ValueError(f'{identity}: fixture registry binding is absent from this phase inventory')
        if row['Kind'] != 'registry.entry':
            raise ValueError(f'{identity}: fixture registry binding must target a registry entry')
        if not isinstance(binding, dict) or any(key not in ('Meta', 'Data') or not isinstance(value, dict)
                                                for key, value in binding.items()):
            raise ValueError(f'{identity}: fixture registry binding must contain Meta and/or Data objects')
        for key, value in binding.items():
            row.setdefault(key, {}).update(value)
    return configured


def write_entries(work, entries):
    grouped = {}
    for identity, row in sorted(entries.items()):
        namespace, name = identity.split(':', 1)
        meta = copy.deepcopy(row.get('Meta') or {})
        if meta.get('type') == 'migration':
            meta.pop('type')
            meta.pop('depends_on', None)
        data = copy.deepcopy(row.get('Data') or {})
        if row['Kind'] == 'env.variable':
            data['storage'] = 'app:env_storage'
        source = data.get('source')
        if source:
            filename = identity.replace(':', '__').replace('/', '_') + '.lua'
            (work / filename).write_text(source)
            data['source'] = 'file://' + filename
        grouped.setdefault(namespace, []).append({'name': name, 'kind': row['Kind'], 'meta': meta, **data})
    for number, (namespace, rows) in enumerate(sorted(grouped.items())):
        (work / f'entries-{number}.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': namespace, 'entries': rows}))


def command(args, work, log, env):
    with log.open('a') as output:
        try:
            result = subprocess.run(args, cwd=work, stdout=output, stderr=subprocess.STDOUT, env=env, timeout=600)
        except subprocess.TimeoutExpired:
            raise ValueError(f'migration command times out; see {log.name}') from None
    if result.returncode:
        raise ValueError(f'migration command fails; see {log.name}')


def rehearse(old, new, work, fixture, engines=('sqlite', 'postgres')):
    plan = migration_plan(old, new)
    if not plan['added']:
        return {'plan': plan, 'engines': {engine: {'status': 'no_added_migrations'} for engine in engines}}
    baseline_ids, external = database_baseline(plan, fixture, current=new)
    recipes = fixture
    fixture = select_fixtures(plan['added'], recipes)
    baseline_rows = closure(old, baseline_ids + [key for key in fixture['registry'] if key in old])
    current_rows = closure(new, plan['added'] + list(fixture['registry']))
    baseline_rows.update({i: row for i, row in old.items() if row['Kind'] == 'env.variable'})
    current_rows.update({i: row for i, row in new.items() if row['Kind'] == 'env.variable'})
    baseline_rows = bind_fixture_registry(baseline_rows, fixture['registry'])
    current_rows = bind_fixture_registry(current_rows, fixture['registry'])
    work.mkdir(parents=True)
    sources = work / 'src'
    sources.mkdir()
    (work / 'wippy.yaml').write_text(yaml.safe_dump({'organization': 'kickside', 'module': 'compat-harness', 'type': 'application', 'directories': {'src': 'src', 'modules': '.wippy'}}))
    harness = Path(__file__).parent / 'harness'
    shutil.copy(harness / 'suite.lua', sources / 'suite.lua')
    shutil.copy(harness / '_index.yaml', sources / '_index.yaml')
    env = harness_env(os.environ, fixture['env'])
    log = work / 'migration.log'
    results = {}
    (work / '.wippy.yaml').write_text(yaml.safe_dump({'version': '1.0', 'directories': {'src': 'src', 'modules': '.wippy'}}))
    (sources / 'plan.lua').write_text('return {}\n')
    command(['wippy', 'init', '--src-dir', 'src', '--modules-dir', '.wippy'], work, log, env)
    command(['wippy', 'update'], work, log, env)
    command(['wippy', 'install'], work, log, env)
    for engine in engines:
        fixture = select_fixtures(plan['added'], recipes, engine=engine)
        database = os.environ.get('COMPAT_DATABASE_PREFIX', 'compat_') + uuid.uuid4().hex
        config = {'version': '1.0', 'directories': {'src': 'src', 'modules': '.wippy'}, 'registry': {'history': {'enabled': False}}}
        if engine == 'sqlite':
            config['override'] = {'app:db:file': str(work / 'database.sqlite')}
        else:
            config['override'] = {'app:db:kind': 'db.sql.postgres', 'app:db:host': env.get('PGHOST', '127.0.0.1'),
                'app:db:port': int(env.get('PGPORT', '5433')), 'app:db:database': database,
                'app:db:username': env.get('PGUSER', 'kickside'), 'app:db:password': env.get('PGPASSWORD', 'kickside'),
                'app:db:options.sslmode': 'disable'}
        (work / '.wippy.yaml').write_text(yaml.safe_dump(config))
        pg_env = dict(env, PGHOST=env.get('PGHOST', '127.0.0.1'), PGPORT=env.get('PGPORT', '5433'), PGUSER=env.get('PGUSER', 'kickside'), PGPASSWORD=env.get('PGPASSWORD', 'kickside'))
        if engine == 'postgres':
            command(['createdb', database], work, log, pg_env)
        try:
            for phase, rows in (('baseline', baseline_rows), ('update', current_rows)):
                for path in sources.glob('entries-*'):
                    path.unlink()
                write_entries(sources, rows)
                suite = {'baseline': baseline_ids, 'added': plan['added'], 'fixture': fixture, 'phase': phase}
                (sources / 'plan.lua').write_text('local json = require("json")\nreturn json.decode(' + '[=[' + json.dumps(suite) + ']=])\n')
                phase_log = work / (engine + '-' + phase + '.log')
                try:
                    command(['wippy', 'test'], work, phase_log, env)
                finally:
                    if phase_log.exists():
                        with log.open('a') as output:
                            output.write(phase_log.read_text())
                text = phase_log.read_text()
                if 'FAILED' in text or 'No tests found' in text or 'PASSED' not in text:
                    raise ValueError(f'{engine}/{phase}: migration tests do not pass; see {log.name}')
            results[engine] = {'status': 'pass', 'baseline_migrations': len(baseline_ids), 'added_migrations': len(plan['added'])}
        finally:
            if engine == 'postgres':
                command(['dropdb', '--force', database], work, log, pg_env)
            for path in work.glob('database.sqlite*'):
                path.unlink()
    return {'plan': plan, 'engines': results, 'baseline_declarations': external}
