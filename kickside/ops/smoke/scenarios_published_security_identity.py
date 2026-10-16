"""Published security identities remain usable by persisted session scopes."""
import json
from pathlib import Path

from harness import Scenario, require
from module_harness import run_focused_module_test


def endpoint_decision():
    return json.loads((Path(__file__).parent / 'mocks/security_model/endpoint_identity_decision.json').read_text())


def recorded_removals():
    transitions = json.loads((Path(__file__).parents[1] / 'compat/transitions.json').read_text())
    return {row['id'] for row in transitions if row['code'] == 'removed_id' and row['path'] == ''}


def identity_changes(published, current):
    active = {entry['id']: entry['kind'] for entry in current}
    decision = endpoint_decision()
    sanctioned = dict(decision['renames'], **decision['additional_suffix_conversions']['renames'])
    removed = recorded_removals()
    return [entry for entry in published
            if active.get(entry['id']) != entry['kind']
            and not (entry['id'] not in active and entry['id'] in removed)
            and not (entry['id'] not in active and entry['kind'] == 'http.endpoint' and entry['id'] in sanctioned
                     and active.get(sanctioned[entry['id']]) == 'http.endpoint')]


def expected_security_identities(published, current):
    active = {entry['id'] for entry in current if entry['kind'] == 'ns.definition'}
    roots = {entry['id'].split(':')[0] for entry in published if entry['kind'] == 'ns.definition'}
    installed = {entry['id'].split(':')[0] for entry in published
                 if entry['kind'] == 'ns.definition' and entry['id'] in active}
    return [entry for entry in published if entry['kind'] in ('security.policy', 'http.endpoint', 'ns.requirement')
            and max((root for root in roots if entry['id'].startswith(root + ':')
                     or entry['id'].startswith(root + '.')), key=len, default=None) in installed]


def published_security_identity(ctx):
    published = json.loads((Path(__file__).parent / 'mocks/security_model/published_registry.json').read_text())
    published += json.loads((Path(__file__).parent / 'mocks/security_model/published_mcp_registry.json').read_text())
    published += json.loads((Path(__file__).parent / 'mocks/security_model/published_provider_registry.json').read_text())
    registry, offset = [], 0
    while True:
        page = ctx.inst.request('GET', '/api/v1/keeper/registry/entries?limit=200&offset=' + str(offset),
                                label='identity-registry-inventory')
        registry.extend({'id': entry['id'], 'kind': entry['kind']} for entry in page['entries'])
        if not page['has_more']:
            break
        require(page['count'] > 0, 'Security identity inventory pagination makes no progress')
        offset += page['count']
    expected = expected_security_identities(published, registry)
    require(expected, 'Published security identity fixture has no installed module coverage')
    decision = endpoint_decision()
    sanctioned = dict(decision['renames'], **decision['additional_suffix_conversions']['renames'])
    ids = {entry['id'] for entry in expected}
    ids.update(sanctioned[id] for id in tuple(ids) if id in sanctioned)
    current = [entry for entry in registry if entry['id'] in ids]
    changes = identity_changes(expected, current)
    ctx.inst.evidence.save('published-security-identity', {'decision': decision, 'expected': expected,
                                                        'current': current, 'changes': changes})
    require(not changes, 'Update removes or changes unsanctioned published session security identities: ' + json.dumps(changes))


def cursor_waiter_upgrade(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'cursor_waiter_shutdown_test')


def cursor_waiter_state_upgrade(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'cursor_waiter_upgrade_test')


def published_mcp_identity(ctx):
    ctx.inst.install('kickside/mcp')
    published_security_identity(ctx)


def crm_endpoint_policy_identity(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'user_endpoint_policy_test')


def crm_module_policy_composition(ctx):
    run_focused_module_test(ctx, 'kickside/crm', 'module_access_policy_test')


REGISTRY = [
    Scenario('regression_crm_module_policy_composition', 'regression', crm_module_policy_composition,
             issues=('CRM-MODULE-POLICY-PICKER-COMPONENTS',)),
    Scenario('regression_crm_endpoint_policy_identity', 'regression', crm_endpoint_policy_identity, ('boot',),
             issues=('CRM-SECURITY-POLICY-IDENTITY',)),
    Scenario('regression_published_security_identity', 'regression', published_security_identity, ('boot',),
             issues=('PUBLISHED-SESSION-SECURITY-IDENTITY', 'SMOKE-PUBLISHED-IDENTITY-SOURCE-COVERAGE',
                     'SMOKE-PUBLISHED-IDENTITY-NESTED-MODULE')),
    Scenario('regression_published_mcp_identity', 'regression', published_mcp_identity,
             issues=('SECURITY-PUBLISHED-MCP-ENDPOINT-IDENTITY',)),
    Scenario('regression_cursor_waiter_upgrade', 'regression', cursor_waiter_upgrade,
             issues=('CORE-CURSOR-BROKER-OUTDATED-EXIT',)),
    Scenario('regression_cursor_waiter_upgrade_state', 'regression', cursor_waiter_state_upgrade,
             issues=('CORE-CURSOR-BROKER-UPGRADE-STATE',)),
]
