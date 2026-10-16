"""Live lifecycle reductions precede an already admitted Agent's tool response."""
import json
import threading
import uuid

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios_agent_background import _fixture, _effects
from scenarios_core import system
from scenarios_hot_update_work import database_rows
from scenarios_manual_task import KIND, _drive
from scenarios_selected_install import _identity
from scenarios import nav


class ModelBarrier:
    def __init__(self):
        self.entered = threading.Event()
        self.released = threading.Event()

    def hold(self):
        self.entered.set()
        require(self.released.wait(timeout=45), 'Controlled external model response barrier times out')

    def release(self):
        self.released.set()


def _selected_agent(inst, fixture):
    grant = fixture['grant']
    inst.request('POST', '/api/v1/security/delegations', {**grant, 'operation_id': uuid.uuid4().hex})
    inst.cleanup.add('held task delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
        {'principal': grant['principal'], 'root': grant['root'], 'operation_id': uuid.uuid4().hex}))
    root = str(uuid.uuid4())
    body = {'type': KIND, 'component_id': root, 'request_id': uuid.uuid4().hex, 'parent_id': fixture['agent'],
            'principal': grant['principal'], 'input': {'title': 'Held Agent tool boundary',
            'target': {'kind': 'agent', 'agent_id': fixture['agent'], 'prompt': 'Record the admitted effect'}}}
    receipt = inst.request('POST', '/api/v1/automations/selected', body, auth=fixture['token'])
    require(receipt.get('success') and receipt['id'] == root, 'Held Agent installation changes its reserved root')
    inst.cleanup.add('held Agent task', lambda: inst.request('DELETE', '/api/v1/automations/' + root, auth=fixture['token']))
    identity, generation = _identity(inst, root)
    require(generation == 1 and identity['principal'] == grant['principal']
            and identity['authorized_by'] == {'kind': 'user', 'id': fixture['member']['user_id']}
            and identity['component_id'] == root, 'Held Agent admission substitutes authority')
    fixture['root'] = root
    return identity


def _adopt_held_agent(ctx, fixture, identity):
    from playwright.sync_api import expect
    inst, browser = ctx.inst, ctx.browser_check()
    root = fixture['root']
    admin = inst.request('GET', '/api/v1/user/me')['user']
    require(admin['id'] not in (fixture['member']['user_id'], fixture['bot']),
            'Held adoption does not use an independent human authorizer')
    audit_query = "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation"
    original_audits = database_rows(inst, audit_query)
    ownership = inst.request('GET', '/api/v1/component-access/grants/' + root)
    nav(ctx, 'Automations')
    manager = browser.frame.locator('kickside-automation-manager')
    manager.get_by_role('button', name='Open Held Agent tool boundary details', exact=True).click()
    manager.get_by_role('tab', name='Config', exact=True).click()
    editor = manager.locator('wc-execution-identity-editor')
    expect(editor.get_by_label('Authorized by', exact=True)).to_have_text('Agent operator', timeout=30000)
    picker = editor.locator('wc-run-as-picker')
    picker.get_by_role('combobox', name='Run as', exact=True).click()
    picker.get_by_role('option', name=fixture['label'] + ' Bot account', exact=True).click()
    path = '/api/v1/automations/' + root + '/identity'
    with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(path)) as response:
        editor.get_by_role('button', name='Save run-as account', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('state') == 'succeeded',
            'Actual Config cannot adopt the bot while its original model response holds')
    expect(editor.get_by_role('status')).to_contain_text('Run-as account saved', timeout=30000)
    expect(editor.get_by_label('Authorized by', exact=True)).to_have_text(admin['full_name'], timeout=30000)
    adopted, generation = _identity(inst, root)
    require(generation == 2 and adopted['principal'] == identity['principal']
            and adopted['authorized_by'] == {'kind': 'user', 'id': admin['id']}
            and adopted['component_id'] == identity['component_id']
            and all(adopted.get(field) == identity.get(field) and (field in adopted) == (field in identity)
                    for field in ('credential_id', 'link_id')),
            'Held adoption replaces the bot, root or inherited restrictions')
    require(not _effects(inst, fixture) and inst.request('GET', '/api/v1/component-access/grants/' + root) == ownership,
            'Held adoption performs an early effect or changes ownership/access')
    audits = database_rows(inst, audit_query)
    require(len(original_audits) == 2 and audits[:2] == original_audits and len(audits) == 3,
            'Held adoption rewrites or duplicates original identity audit records')
    last = json.loads(audits[-1]['record_json'])
    require(last['old_principal'] == last['new_principal'] == 'user:' + fixture['bot']
            and last['authorizer'] == 'user:' + admin['id']
            and last['request_id'] == response.value.request.post_data_json['request_id']
            and inst.token not in json.dumps(audits) and fixture['token'] not in json.dumps(audits),
            'Held adoption audit misattributes its command or exposes a bearer')
    inst.evidence.save('held-adoption-before-release', {'original_identity': identity,
        'adopted_identity': adopted, 'audits': audits, 'ownership': ownership,
        'request': response.value.request.post_data_json, 'drive': _drive(inst, root)})
    return adopted, generation


def _held_agent(ctx, reduction):
    from playwright.sync_api import expect
    barrier = ModelBarrier()
    inst = ctx.inst
    inst.cleanup.add('external model barrier', barrier.release)
    fixture = _fixture(ctx, before_tool_response=barrier.hold)
    if reduction == 'adopt':
        fixture['grant'] = {**fixture['grant'], 'groups': fixture['grant']['groups'] + ['app.security:admin']}
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    system(ctx, 'Users')
    panel = browser.frame.locator('kickside-users')
    panel.get_by_role('tab', name='Bots', exact=True).click()
    row = panel.locator('.ku-row').filter(has_text=fixture['label'])
    expect(row.get_by_text('active', exact=True)).to_be_visible(timeout=30000)
    trace = inst.root / inst.evidence.label / ('held-agent-' + reduction + '-trace.zip')
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    identity = _selected_agent(inst, fixture)
    root = fixture['root']
    expected_identity = (identity, 1)
    if reduction == 'adopt':
        inst.request('POST', '/api/v1/component-access/share/' + root,
            {'subject_type': 'group', 'subject_id': 'app.security:admin', 'access_mask': 11}, auth=fixture['token'])
    try:
        admitted = inst.request('POST', '/api/v1/automations/' + root + '/actions/run_now',
                                {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
        require(admitted.get('result', {}).get('state') == 'succeeded', 'Held task does not admit run-now')
        inst.wait(barrier.entered.is_set, 'Native Agent enters its actual external model call', seconds=60,
                  pump=browser.page.wait_for_timeout)
        require(not _effects(inst, fixture), 'Held external response performs an effect before release')
        require(_identity(inst, root) == (identity, 1), 'Running Agent rewrites its selected identity')
        path = '/api/v1/users/' + fixture['bot']
        if reduction == 'disable':
            row.get_by_role('button', name='Disable ' + fixture['label'], exact=True).click()
            confirmation = browser.page.get_by_role('alertdialog', name='Disable bot', exact=True)
            expect(confirmation).to_contain_text('retains')
            with browser.page.expect_response(lambda r: r.request.method == 'DELETE' and r.url.endswith(path)) as response:
                confirmation.get_by_role('button', name='Disable', exact=True).click()
            require(response.value.status == 202 and response.value.json().get('success'), 'Held bot UI disable fails')
            expect(row.get_by_text('inactive', exact=True)).to_be_visible(timeout=30000)
        elif reduction == 'groups':
            row.get_by_role('button', name='Edit ' + fixture['label'], exact=True).click()
            editor = panel.get_by_role('dialog', name='Edit bot', exact=True)
            editor.locator('input[type=checkbox][value="app.security:admin"]').uncheck()
            with browser.page.expect_response(lambda r: r.request.method == 'PUT' and r.url.endswith(path)) as response:
                editor.get_by_role('button', name='Save', exact=True).click()
            require(response.value.status == 200 and response.value.json().get('success'), 'Held bot UI group reduction fails')
            require('app.security:admin' not in inst.request('GET', path + '/groups')['groups'], 'Held group reduction is not durable')
        elif reduction == 'adopt':
            expected_identity = _adopt_held_agent(ctx, fixture, identity)
        elif reduction != 'control':
            raise ValueError('Unknown held-run reduction')
        browser.screenshot('held-agent-' + reduction + '-before-release')
        barrier.release()
        def settled():
            effects = _effects(inst, fixture)
            requests = [row for row in ctx.fixtures.requests('openai-tools') if row['path'] == '/v1/chat/completions']
            if reduction == 'disable':
                require(len(requests) <= 1, 'A disabled admitted Agent issues a subsequent model provider request')
            if reduction not in ('control', 'adopt'):
                require(not effects, 'An admitted Agent performs a tool effect after live bot ' + reduction)
            drive = _drive(inst, root)
            return {'effects': effects, 'model_requests': requests, 'drive': drive} if len(requests) >= 2 or drive['phase'].startswith('blocked_') else None
        result = inst.wait(settled, 'Held Agent reaches its post-response tool or refused execution boundary', seconds=60,
                           pump=browser.page.wait_for_timeout)
        if reduction in ('control', 'adopt'):
            require(len(result['effects']) == 1 and result['effects'][0]['actor_id'] == fixture['bot']
                    and json.loads(result['effects'][0]['identity_json']) == identity, 'Unchanged held control has no exact native bot effect')
        else:
            require(not _effects(inst, fixture), 'Reduced held Agent retains an effect')
            tool_results = [value for request in result['model_requests'] for value in request['body']['messages'] if value.get('role') == 'tool']
            require(result['drive']['phase'].startswith('blocked_') or (tool_results and all('"success":true' not in value.get('content', '') for value in tool_results)),
                    'Reduced held Agent has no explicit execution or tool refusal')
        if reduction == 'disable':
            require(len(result['model_requests']) == 1 and result['drive']['phase'].startswith('blocked_'),
                    'Disabled held execution does not block before another provider call')
        require(_identity(inst, root) == expected_identity, 'Live lifecycle transition rewrites the canonical identity or generation')
        audits = database_rows(inst, "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation")
        generations = [0, 1, 2] if reduction == 'adopt' else [0, 1]
        require(len(audits) == len(generations) and [int(value['identity_generation']) for value in audits] == generations,
                'Held transition rewrites or duplicates the identity audit')
        if reduction == 'adopt':
            original_effects = result['effects']
            inst.wait(lambda: _drive(inst, root)['last_committed_occurrence_seq'] == 1,
                      'Original held admission commits once after adoption', seconds=60, pump=browser.page.wait_for_timeout)
            require(_effects(inst, fixture) == original_effects, 'Adoption duplicates its original admitted effect')
            drawer = browser.frame.locator('kickside-automation-manager aside')
            drawer.get_by_role('button', name='More actions for Held Agent tool boundary', exact=True).click()
            action = '/api/v1/automations/' + root + '/actions/run_now'
            with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith(action)) as response:
                drawer.get_by_role('menuitem', name='Run Held Agent tool boundary now', exact=True).click()
            require(response.value.status == 200 and response.value.json()['result']['state'] == 'succeeded',
                    'Actual Run now cannot admit new work after held adoption')
            def adopted_complete():
                effects = _effects(inst, fixture)
                require(len(effects) <= 2, 'Held adoption duplicates an admitted occurrence')
                return effects if len(effects) == 2 and _drive(inst, root)['last_committed_occurrence_seq'] == 2 else None
            effects = inst.wait(adopted_complete, 'New actual run uses the replacement authorizer', seconds=60,
                                pump=browser.page.wait_for_timeout)
            require(all(row in effects for row in original_effects), 'New admission rewrites the original held effect')
            added = [row for row in effects if row not in original_effects]
            require(len(added) == 1 and added[0]['actor_id'] == fixture['bot']
                    and added[0]['root'] == root and json.loads(added[0]['identity_json']) == expected_identity[0],
                    'New held-adoption work borrows the original authorizer or replaces the bot')
            requests = [row for row in ctx.fixtures.requests('openai-tools') if row['path'] == '/v1/chat/completions']
            require(len(requests) == 4 and all(any(value.get('role') == 'tool' for value in requests[index]['body']['messages'])
                    for index in (1, 3)), 'Held adoption bypasses or duplicates the native model/tool turns')
            require(_identity(inst, root) == expected_identity and database_rows(inst,
                "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='" + root + "' ORDER BY identity_generation") == audits,
                'New held-adoption run changes the canonical identity or original audits')
            inst.evidence.save('held-adoption-new-admission', {'original_effects': original_effects,
                'effects': effects, 'identity': expected_identity, 'audits': audits, 'model_requests': requests,
                'drive': _drive(inst, root)})
        browser.clean(0)
        browser.screenshot('held-agent-' + reduction + '-settled')
        inst.evidence.save('held-agent-' + reduction + '-proof', {'identity': identity, 'result': result, 'audits': audits})
    finally:
        barrier.release()
        inst.evidence.save('held-agent-' + reduction + '-progress', {'identity': _identity(inst, root),
            'effects': _effects(inst, fixture), 'drive': _drive(inst, root), 'model_requests': ctx.fixtures.requests('openai-tools')})
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


def browser_bot_held_agent_control(ctx):
    with isolated_fixture(ctx) as fixture:
        _held_agent(fixture, 'control')


def browser_bot_held_agent_disable(ctx):
    with isolated_fixture(ctx) as fixture:
        _held_agent(fixture, 'disable')


def browser_bot_held_agent_group_reduction(ctx):
    with isolated_fixture(ctx) as fixture:
        _held_agent(fixture, 'groups')


def browser_bot_held_agent_adoption(ctx):
    with isolated_fixture(ctx) as fixture:
        _held_agent(fixture, 'adopt')


REGISTRY = [
    Scenario('browser_bot_held_agent_control', 'regression', browser_bot_held_agent_control, ('boot',), instance_setup=True,
             issues=('BOT-HELD-AGENT-AUTHORITY',)),
    Scenario('browser_bot_held_agent_disable', 'regression', browser_bot_held_agent_disable, ('boot',), instance_setup=True,
             issues=('RA-S04', 'BOT-HELD-AGENT-AUTHORITY', 'RA-B11', 'RA-H40', 'UPSTREAM-AGENT-TOOL-LIVE-AUTHORITY')),
    Scenario('browser_bot_held_agent_group_reduction', 'regression', browser_bot_held_agent_group_reduction, ('boot',), instance_setup=True,
             issues=('BOT-HELD-AGENT-AUTHORITY', 'RA-H40', 'UPSTREAM-AGENT-TOOL-LIVE-AUTHORITY')),
    Scenario('browser_bot_held_agent_adoption', 'regression', browser_bot_held_agent_adoption, ('boot',), instance_setup=True,
             issues=('BOT-HELD-CARRIER-ADOPTION', 'RA-H38', 'RA-H50', 'RA-H51')),
]
