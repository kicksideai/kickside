"""Provider descriptors supply rendered brand icons to both connection catalogues."""
import json
from pathlib import Path
import shutil

import yaml

from harness import Scenario, require
from runtime_fixtures import isolated_fixture

HERE = Path(__file__).resolve().parent
CATALOG = json.loads((HERE / 'fixtures/provider_icons.json').read_text())
NS = 'app.smoke.provider_icons'


def setup(ctx):
    inst = ctx.inst
    with ctx.paused():
        fixture = inst.app / 'src' / 'provider-icons'
        fixture.mkdir()
        shutil.copyfile(HERE / 'mocks/provider_icon_seed.lua', fixture / 'seed.lua')
        entries = [
            {'name': 'seed', 'kind': 'function.lua', 'source': 'file://seed.lua', 'method': 'handler',
             'modules': ['http', 'json', 'registry'], 'imports': {'component': 'kickside.component:component', 'connection_manager': 'kickside.oauth:connection_manager'}},
            {'name': 'seed.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/provider-icon-fixture', 'func': NS + ':seed'},
            {'name': 'access', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['access', 'funcs.call'], 'resources': [NS + ':seed', NS + ':seed.endpoint'], 'effect': 'allow'}},
        ]
        modules = {row['module']: row for row in CATALOG}
        entries.extend({'name': 'dep.' + module, 'kind': 'ns.dependency', 'component': 'kickside/' + module,
                        'version': '*', 'parameters': row['parameters']} for module, row in sorted(modules.items()))
        (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))
        inst.resolve_dependencies()
    inst.manifest()


def check(row):
    def run(ctx):
        inst = ctx.inst
        entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + row['entry'], label='provider-brand-declaration')['entry']
        meta, data = entry.get('meta', {}), entry.get('data', {})
        icon = meta.get('icon') or meta.get('component', {}).get('icon') or data.get('icon')
        require(icon == row['icon'], row['entry'] + ': declared icon differs: ' + str(icon))
        if entry['kind'] == 'contract.binding' or meta.get('oauth_provider'):
            badges = inst.request('GET', '/api/v1/connections/providers/badges', label='provider-brand-badges')['providers']
            badge = next((badge for badge in badges if badge['provider'] == row['provider']), None)
            require(badge and badge['icon'] == icon, row['entry'] + ': provider badge differs: ' + str(badge))
            created = inst.request('POST', '/api/v1/provider-icon-fixture', {'entry': row['entry'], 'provider': row['provider']}, label='provider-brand-seed')
            cid = created['component_id']
            inst.cleanup.add('provider icon connection ' + cid, lambda: inst.request('DELETE', '/api/v1/connections/' + cid), scope='provider_icons')
            connections = inst.request('GET', '/api/v1/connections', label='provider-brand-connections')['connections']
            connection = next((value for value in connections if value['component_id'] == cid), None)
            require(connection and connection['icon'] == icon, row['entry'] + ': connection badge differs: ' + str(connection))
    return run



def hub_plan_conflict(ctx):
    with isolated_fixture(ctx) as fixture:
        for module in sorted({row['module'] for row in CATALOG}):
            fixture.inst.install('kickside/' + module)


REGISTRY = [Scenario('provider_brands_setup', 'regression', setup, ('boot',), instance_setup=True)]
REGISTRY.append(Scenario('provider_brand_hub_plan_conflict', 'regression', hub_plan_conflict, ('boot',),
                         issues=('PROVIDER-BRAND-HUB-PLAN-CONFLICT',)))
for row in CATALOG:
    REGISTRY.append(Scenario('provider_brand_' + row['module'].replace('-', '_') + '_' + row['entry'].split(':')[1],
                             'regression', check(row), ('provider_brands_setup',), issues=('PROVIDER-DECLARED-BRAND-ICONS',)))


def connections_cleanup(ctx):
    failures = ctx.inst.cleanup.run(scope='provider_icons')
    require(not failures, 'Provider connection cleanup fails: ' + '; '.join(failures))


REGISTRY.append(Scenario('provider_brand_connections_cleanup', 'regression', connections_cleanup,
                         tuple(scenario.name for scenario in REGISTRY if scenario.name.startswith('provider_brand_')
                               and scenario.name != 'provider_brand_hub_plan_conflict'),
                         issues=('PROVIDER-OAUTH-DELETE-CLEANUP',)))
