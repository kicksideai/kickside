"""Two live syncs share the durable Connection capacity owner."""
from datetime import datetime
import json
from pathlib import Path
import uuid
import re
import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test
from runtime_fixtures import complete_splashes
from scenarios import nav
from scenarios_hot_update_work import database_rows
from runtime import psql

NS = 'app.smoke.connection_capacity'


def capacity_harness(ctx):
    run_focused_module_test(ctx, 'kickside/connection', 'capacity_boundary_test', lint=True)
    run_focused_module_test(ctx, 'kickside/connection', 'capacity_floor_test')
    for pattern in ('drive_test', 'failure_classification_test', 'ledger_order_test', 'connection_capacity_test'):
        run_focused_module_test(ctx, 'kickside/automation', pattern)


def capacity_provider_harness(ctx):
    for module in ('atlassian', 'discord', 'fireflies', 'github', 'google', 'hubspot',
                   'phantombuster', 'simplefin', 'telegram'):
        root = Path(ctx.inst.config['replace']['kickside/' + module]) / 'test'
        replacements = yaml.safe_load((root / '.wippy.yaml').read_text())['workspace']['replacements']
        lock = yaml.safe_load((root / 'wippy.lock').read_text())
        missing = [entry['name'] for entry in lock['modules']
                   if entry['version'] == '0.0.0' and entry['name'] not in replacements]
        require(not missing, module + ' harness has unresolved local dependencies: ' + ', '.join(missing))
        run_focused_module_test(ctx, 'kickside/' + module, 'capacity_transport_test', lint=True)
    for module, pattern in (('discord', 'data_error_test'), ('fireflies', 'pull_core_test'),
                            ('google', 'pull_core_test')):
        run_focused_module_test(ctx, 'kickside/' + module, pattern)


def install_fixture(ctx):
    with ctx.paused():
        directory = ctx.inst.app / 'src' / 'connection-capacity-smoke'
        directory.mkdir()
        directory.joinpath('fixture.lua').write_text(Path(__file__).with_name('fixtures').joinpath('connection_capacity.lua').read_text())
        entries = [{'name': name, 'kind': 'function.lua', 'source': 'file://fixture.lua', 'method': name,
                    'modules': ['sql', 'time']} for name in ('status', 'resources', 'pull')]
        entries += [
            {'name': 'connection', 'kind': 'contract.binding', 'meta': {'class': 'connection', 'provider': 'smoke-capacity', 'title': 'Capacity fixture'},
             'contracts': [{'contract': 'kickside.contract:component', 'methods': {'get_status': NS + ':status'}},
                           {'contract': 'kickside.connection:connection', 'methods': {'get_status': NS + ':status', 'test_connection': NS + ':status', 'discover_resources': NS + ':resources'}}]},
            {'name': 'binding', 'kind': 'contract.binding', 'contracts': [{'contract': 'kickside.data:pullable', 'methods': {'pull': NS + ':pull'}}]},
            {'name': 'source', 'kind': 'registry.entry', 'meta': {'type': 'kickside.automation.port', 'title': 'Shared capacity source'},
             'binding': NS + ':binding', 'output_schema': '{"type":"object"}',
             'config_schema': {'type': 'object', 'properties': {'connection_id': {'type': 'string', 'x-reference': {'kind': 'connection', 'access': 'READ'}}}}},
            {'name': 'functions', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['access'], 'resources': [NS + ':status', NS + ':resources', NS + ':pull'], 'effect': 'allow'}},
        ]
        directory.joinpath('_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))
        ddl = 'CREATE TABLE smoke_capacity_calls (connection_id TEXT NOT NULL, consumer TEXT NOT NULL, called_at_ms BIGINT NOT NULL)'
        if ctx.inst.engine == 'postgres':
            psql(dict(ctx.inst.config['pg'], maintenance=ctx.inst.db), ctx.inst.env, ddl)
        else:
            database_rows(ctx.inst, ddl, write=True)


def connection_capacity_live(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    for module in ('kickside/connection', 'kickside/sync', 'kickside/inbox'):
        inst.install(module)
    install_fixture(ctx)
    suffix = uuid.uuid4().hex[:8]
    def connection(label):
        return inst.request('POST', '/api/v1/connections', {'impl_id': NS + ':connection', 'name': label,
            'private_context': {}}, label='capacity-connection-' + label)['component_id']
    shared, independent = connection('Shared ' + suffix), connection('Independent ' + suffix)
    titles = {name: 'Capacity ' + name + ' ' + suffix for name in ('A', 'B', 'C')}
    def sync(name, cid, limited=False):
        return inst.request('POST', '/api/v1/automations', {'type': 'kickside.sync:sync', 'input': {
            'title': titles[name], 'enabled': True, 'trigger': {'v': 2, 'source': NS + ':source',
                'config': {'connection_id': cid, 'consumer': titles[name], 'limited': limited},
                'schedule': {'type': 'interval', 'expression': '1s'}, 'backfill': 'all'},
            'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {}, 'transform': {'kind': 'none'}}},
            label='capacity-sync-' + name)['id']
    def status(aid):
        return inst.request('GET', '/api/v1/automations/' + aid + '/status', label='capacity-status')['drives'][0]
    def floor():
        rows = database_rows(inst, "SELECT value FROM kickside_component_meta WHERE component_id='" + shared + "' AND key='kickside.connection.capacity.retry_at_ms'")
        return int(rows[0]['value']) if rows else None
    a = sync('A', shared, True)
    due = inst.wait(floor, 'First live sync persists connection capacity', seconds=35)
    b, c = sync('B', shared), sync('C', independent)
    def held(aid):
        row = status(aid)
        error = row.get('last_error') or {}
        return row if error.get('kind') == 'RateLimited' and row.get('next_run_at') and round(datetime.fromisoformat(row['next_run_at'].replace('Z', '+00:00')).timestamp() * 1000) == due else None
    before = inst.wait(lambda: held(b), 'Second live sync waits at shared floor', seconds=35)
    require(round(datetime.fromisoformat(before['next_run_at'].replace('Z', '+00:00')).timestamp() * 1000) == due,
            'Second sync adds local backoff to the exact shared floor')
    def receipts():
        return inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='capacity-receipts')['items']
    inst.wait(lambda: any(row['title'] == titles['C'] for row in receipts()), 'Independent connection delivers while shared connection waits', seconds=35)
    calls = lambda: database_rows(inst, 'SELECT connection_id,consumer,called_at_ms FROM smoke_capacity_calls ORDER BY called_at_ms,consumer')
    require(not any(row['consumer'] == titles['B'] for row in calls()), 'Held sync invokes provider before its floor')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    nav(ctx, 'Automations')
    browser.frame.get_by_role('button', name='Open ' + titles['B'] + ' details', exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name=titles['B'], exact=True)
    dialog.get_by_role('tab', name='Overview', exact=True).click()
    expect(dialog).to_contain_text('Retrying', timeout=30000)
    expect(dialog).to_contain_text(re.compile('connection capacity', re.I), timeout=30000)
    browser.screenshot('shared-connection-capacity-wait')
    with ctx.paused():
        require(floor() == due, 'Stopped runtime loses the durable connection floor')
        stored = database_rows(inst, "SELECT next_run_at,last_error_json FROM kickside_automation_drive WHERE automation_id='" + b + "' AND drive_key='main'")
        require(len(stored) == 1, 'Runtime restart loses the durable capacity wait')
        error = json.loads(stored[0]['last_error_json'] or '{}')
        retry_at = stored[0]['next_run_at']
        require(error.get('kind') == 'RateLimited' and retry_at and
                round(datetime.fromisoformat(retry_at.replace('Z', '+00:00')).timestamp() * 1000) == due,
                'Runtime restart loses the durable capacity wait')
        require(not any(row['consumer'] == titles['B'] for row in calls()), 'Restart invokes the held provider early')
    browser = ctx.browser
    require(floor() == due, 'Runtime restart loses the durable connection floor')
    inst.wait(lambda: all(any(row['title'] == titles[name] for row in receipts()) for name in ('A', 'B', 'C')),
              'Shared connection expires and both live syncs resume', seconds=60, pump=browser.page.wait_for_timeout)
    captured = calls()
    require(all(int(row['called_at_ms']) >= due for row in captured if row['consumer'] == titles['B']),
            'Second sync provider calls precede the exact floor')
    nav(ctx, 'Inbox')
    for title in titles.values():
        expect(browser.frame.locator('kickside-inbox').get_by_text(title, exact=True).first).to_be_visible(timeout=30000)
    browser.screenshot('shared-connection-capacity-resumed')
    inst.evidence.save('shared-connection-capacity', {'retry_at_ms': due, 'before_restart': before,
        'calls': captured, 'independent_delivers': True, 'browser_wait_and_resume': True})
    for aid in (a, b, c):
        inst.request('DELETE', '/api/v1/automations/' + aid, label='capacity-sync-delete')
    for cid in (shared, independent):
        inst.request('DELETE', '/api/v1/connections/' + cid, label='capacity-connection-delete')


REGISTRY = [
    Scenario('connection_capacity_harness', 'regression', capacity_harness,
             issues=('DESIGN-CONNECTION-SHARED-CAPACITY', 'AUTOMATION-NATIVE-FAILURE-PRECEDENCE')),
    Scenario('connection_capacity_provider_harness', 'regression', capacity_provider_harness,
             issues=('DESIGN-CONNECTION-SHARED-CAPACITY', 'RELEASE-HARNESS-LOCAL-CLOSURE',
                     'TOOL-CONNECTION-TYPED-ERRORS', 'CONNECTION-BASE-TYPED-ERRORS')),
    Scenario('connection_capacity_live', 'full', connection_capacity_live, ('boot',), instance_setup=True,
             issues=('DESIGN-CONNECTION-SHARED-CAPACITY', 'SMOKE-CAPACITY-RESTART-BOUNDARY'), features=(
                 'kickside/connection|http|POST /api/v1/connections', 'kickside/sync|automation|kickside.sync:sync',
                 'kickside/automation|http|GET /api/v1/automations/{id}/status')),
]
