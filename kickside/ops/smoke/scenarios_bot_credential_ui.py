"""The actual MCP credential form retains its authenticated human owner."""
import json
import uuid

from harness import Scenario, require
from mcp_client import MCPClient
from runtime_fixtures import complete_splashes
from scenarios import nav
from scenarios_hot_update_work import database_rows


def browser_bot_credential_ownership(ctx):
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        _browser_bot_credential_ownership(fixture)


def _browser_bot_credential_ownership(ctx):
    from playwright.sync_api import expect
    inst = ctx.inst
    inst.install('kickside/mcp')
    suffix = uuid.uuid4().hex[:12]
    bot = inst.request('POST', '/api/v1/users/bots', {'full_name': 'Credential ownership bot ' + suffix,
        'groups': ['app.security:admin']}, expect=(201,))['user']
    bot_id = bot['user_id']
    inst.cleanup.add('credential ownership bot', lambda: inst.request('DELETE', '/api/v1/users/' + bot_id, expect=(202,)))
    human = inst.request('GET', '/api/v1/user/me')['user']['id']
    require(bot.get('bot_account') is True and bot_id != human, 'Credential guard has no distinct ordinary bot')
    def bot_state():
        return {'account': database_rows(inst, "SELECT user_id,email,status,auth_generation FROM app_users WHERE user_id='" + bot_id + "'"),
            'marker': database_rows(inst, "SELECT user_id,created_by,created_at FROM app_user_bot_accounts WHERE user_id='" + bot_id + "'"),
            'groups': database_rows(inst, "SELECT group_id,source,created_at FROM app_user_groups WHERE user_id='" + bot_id + "' ORDER BY group_id,source"),
            'credentials': database_rows(inst, "SELECT credential_id FROM kickside_mcp_credentials WHERE actor_id='" + bot_id + "'")}
    baseline = bot_state()
    require(not baseline['credentials'] and any(row['group_id'] == 'app.security:admin' for row in baseline['groups']),
            'Admin-group bot begins with an inbound MCP credential')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    trace = inst.root / inst.evidence.label / 'bot-credential-ownership-trace.zip'
    trace.parent.mkdir(parents=True, exist_ok=True)
    browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
    forged = {'actor_id': bot_id, 'owner_user_id': bot_id, 'principal': {'kind': 'user', 'id': bot_id},
              'authorized_by': {'kind': 'user', 'id': bot_id},
              'execution_identity': {'version': 2, 'principal': {'kind': 'user', 'id': bot_id},
                                     'authorized_by': {'kind': 'user', 'id': bot_id}, 'component_id': str(uuid.uuid4())}}
    submissions, stored = [], []
    pattern = '**/api/v1/mcp/credentials'
    def forge(route):
        if route.request.method == 'POST':
            body = route.request.post_data_json
            require(isinstance(body, dict), 'Actual credential form submits no JSON object')
            body = {**body, **forged}
            submissions.append(body)
            route.continue_(post_data=json.dumps(body))
        else:
            route.continue_()
    try:
        nav(ctx, 'MCP')
        panel = browser.frame.locator('kickside-mcp')
        expect(panel.get_by_role('heading', name='MCP credentials', exact=True)).to_be_visible(timeout=30000)
        for adversarial in (True, False):
            label = ('Forged owner request ' if adversarial else 'Human owner control ') + suffix
            panel.get_by_role('button', name='New credential', exact=True).first.click()
            dialog = browser.frame.get_by_role('dialog', name='New MCP credential', exact=True)
            expect(dialog).to_be_visible(timeout=30000)
            expect(dialog.locator('wc-run-as-picker, wc-principal-picker')).to_have_count(0)
            expect(dialog.get_by_role('combobox', name='Run as', exact=True)).to_have_count(0)
            dialog.get_by_placeholder('research-agent', exact=True).fill(label)
            if adversarial:
                browser.page.route(pattern, forge)
            try:
                with browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/mcp/credentials')) as response:
                    dialog.get_by_role('button', name='Create credential', exact=True).click()
            finally:
                if adversarial:
                    browser.page.unroute(pattern, forge)
            data = response.value.json()
            require(response.value.status == 200 and data.get('success') and data.get('credential'),
                    'The real UI cannot mint its own human credential')
            credential = data['credential']
            token, cid = credential['token'], credential['credential_id']
            inst.redactor.add(token)
            inst.cleanup.add('human UI credential ' + cid,
                lambda cid=cid: inst.request('DELETE', '/api/v1/mcp/credentials/' + cid))
            require(credential['actor_id'] == human, 'Submitted bot identity replaces the authenticated credential owner')
            rows = database_rows(inst, "SELECT credential_id,actor_id,execution_identity_json,label,status FROM kickside_mcp_credentials WHERE credential_id='" + cid + "'")
            require(len(rows) == 1 and rows[0]['actor_id'] == human and rows[0]['label'] == label and rows[0]['status'] == 'active',
                    'The real UI writes a bot-owned or inactive credential')
            identity = json.loads(rows[0]['execution_identity_json'])
            require(identity['principal'] == identity['authorized_by'] == {'kind': 'user', 'id': human},
                    'Credential frame borrows the forged bot principal or authorizer')
            stored.extend(rows)
            if adversarial:
                require(len(submissions) == 1 and all(submissions[0][key] == value for key, value in forged.items()),
                        'Forged identity metadata does not reach the actual credential request')
            else:
                require(not (set(response.value.request.post_data_json) & set(forged)),
                        'Unmodified credential UI supplies a selectable owner identity')
            expect(dialog.get_by_role('button', name='Done', exact=True)).to_be_visible(timeout=30000)
            dialog.get_by_role('button', name='Done', exact=True).click()
            expect(dialog).to_have_count(0, timeout=30000)
            expect(panel.get_by_text(label, exact=True)).to_be_visible(timeout=30000)
            client = MCPClient(inst, token, '/api/public/mcp', stateful=False)
            client.initialize()
            require(client.tools(), 'Human UI credential has no real admitted MCP catalog')
            require(bot_state() == baseline, 'Credential UI reclassifies the bot, changes groups or mints a bot credential')
            browser.clean(0)
            browser.screenshot('credential-human-owner-' + ('forgery' if adversarial else 'control'))
        inst.evidence.save('bot-credential-ownership', {'human': human, 'bot': bot_id,
            'bot_state': baseline, 'submitted_forgery': submissions, 'credentials': stored})
    finally:
        browser.context.tracing.stop(path=str(trace))
        inst.evidence.paths.append(str(trace))


REGISTRY = [Scenario('browser_bot_credential_ownership', 'regression', browser_bot_credential_ownership,
    ('boot',), instance_setup=True, issues=('SMOKE-AUTHORITY-FIXTURE-ISOLATION', 'BOT-CREDENTIAL-UI-OWNERSHIP', 'MCP-MINT-RESPONSE-ACTOR-TYPE', 'RA-B14', 'RA-H31', 'RA-H32', 'RA-H33'))]
