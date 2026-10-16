"""Owner decision 2026-10-10: unsigned saved tokens require one-time re-login."""
from copy import deepcopy
import hashlib
import json

import yaml

from browser import Browser
from harness import Scenario, require
from mcp_client import MCPClient
from module_lifecycle_contract import update_source
from runtime_fixtures import isolated_fixture, complete_splashes
from scenarios_hot_update_work import database_rows
from scenarios_token_continuity import source_fixture, member, issue, token_payloads, MODULE


def token_entry(directory):
    path = directory / 'src/security/_index.yaml'
    document = yaml.safe_load(path.read_text())
    entry = next(row for row in document['entries'] if row['name'] == 'tokens')
    return path, document, entry


def unsigned_source(ctx):
    directory = source_fixture(ctx)
    path, document, entry = token_entry(directory)
    entry.pop('token_key_env')
    entry['token_key'] = ''
    path.write_text(yaml.safe_dump(document, sort_keys=False))
    config_path = ctx.inst.app / '.wippy.yaml'
    config = yaml.safe_load(config_path.read_text())
    config['override'].pop('kickside.users.security:tokens:data.token_key_env')
    config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    ctx.inst.resolve_dependencies(modules=(MODULE,))


def retained_data(inst):
    result = {}
    for table in ('app_users', 'app_user_groups', 'kickside_component_access',
                  'kickside_settings', 'kickside_components', 'kickside_component_meta'):
        rows = database_rows(inst, 'SELECT * FROM ' + table)
        encoded = sorted(json.dumps(row, sort_keys=True, default=str) for row in rows)
        result[table] = {'rows': len(rows), 'digest': hashlib.sha256(
            '\n'.join(encoded).encode()).hexdigest(),
            'row_digests': [hashlib.sha256(row.encode()).hexdigest() for row in encoded]}
    return result


def keeper_tools(inst, token):
    client = MCPClient(inst, token, '/keeper-mcp/')
    client.initialize()
    try:
        return client.tools()
    finally:
        client.close()


def await_workspace(inst, user_id, browser):
    def ready():
        for line in (inst.root / 'runtime.log').read_text().splitlines():
            if inst.redactor.text('kickside.core.threads.workspace_plugin') not in line:
                continue
            fields = line.split('\t')
            require(len(fields) >= 5, 'Workspace provisioning log lacks structured fields')
            record = json.loads(fields[-1])
            if record.get('user_id') != user_id:
                continue
            require(fields[-2] != 'workspace provisioning failed',
                    'Initial workspace provisioning fails: ' + str(record))
            if fields[-2] == 'workspace provisioned':
                return record
        return None
    result = inst.wait(ready, 'Initial user workspace provisioning', seconds=35,
                       pump=browser.page.wait_for_timeout)
    inst.evidence.save('transition-workspace-baseline', result)


def role_transition(role):
    def run(ctx):
        from playwright.sync_api import expect
        with isolated_fixture(ctx, config=deepcopy(ctx.inst.config), prepare=unsigned_source) as fixture:
            inst = fixture.inst
            directory = fixture.state['continuity_source']
            inst.install('kickside/agents')
            complete_splashes(fixture, 'welcome')
            admin = inst.request('GET', '/api/v1/user/me')['user']
            user = admin if role == 'admin' else member(inst)
            user_id = admin['id'] if role == 'admin' else user['user_id']
            actual = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.users.security%3Atokens')['entry']
            inst.evidence.save('transition-token-store', {
                'signing_environment_field': 'token_key_env' in actual.get('data', {}),
                'inline_signing_key': bool(actual.get('data', {}).get('token_key'))})
            old_token = issue(inst, user)
            require('.' not in old_token, 'Transition fixture does not issue an unsigned bearer')
            if role != 'onboarding':
                created = inst.request('POST', '/api/v1/user-agents',
                    {'title': 'Saved-token transition assistant'}, auth=old_token)['component_id']
                inst.request('POST', '/api/v1/component-access/share/' + created,
                    {'subject_type': 'group', 'subject_id': 'app.security:members', 'access_mask': 1}, auth=old_token)
            inst.request('PUT', '/api/v1/settings',
                {'namespace': 'kickside.users', 'key': 'token_expiration', 'value': '48h'})
            minted = inst.request('POST', '/api/v1/keeper/mcp/tokens',
                {'label': 'Signing transition guard', 'scopes': ['mcp.root']})['token']['token']
            inst.redactor.add(minted)
            baseline_tools = keeper_tools(inst, minted)
            browser = fixture.browser_check()
            browser.login(user['email'], inst.password)
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            await_workspace(inst, user_id, browser)
            storage = browser.context.storage_state()
            before = retained_data(inst)
            payloads = token_payloads(inst)
            path, document, entry = token_entry(directory)
            entry['token_key_env'] = 'ENCRYPTION_KEY'
            path.write_text(yaml.safe_dump(document, sort_keys=False))
            update_source(fixture, str(directory), MODULE, live=True, refresh_session=True)
            after = retained_data(inst)
            inst.evidence.save('unsigned-transition-retention', {'role': role, 'before': before, 'after': after})
            require(before == after, 'Signing activation changes account rows, groups, shares, settings or agents')
            current_payloads = token_payloads(inst)
            require(all(current_payloads.get(key) == value for key, value in payloads.items()),
                    'Signing activation removes or rewrites stored unsigned credentials')
            pid = inst.process.pid
            for attempt in range(3):
                inst.request('GET', '/api/v1/user/me', auth=old_token, expect=(401,),
                             label='unsigned-bearer-rejection-' + str(attempt))
            require(inst.process.pid == pid and inst.process.poll() is None,
                    'Unsigned HTTP admission crashes the runtime')
            require(keeper_tools(inst, minted) == baseline_tools, 'Signing activation breaks a Keeper MCP bearer')
            browser.reset_context(storage_state=storage)
            browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
            browser.page.wait_for_url(inst.base + '/login', timeout=30000)
            expect(browser.page.get_by_role('button', name='Sign In', exact=True)).to_be_visible()
            browser.login(user['email'], inst.password)
            signed = issue(inst, user)
            require('.' in signed, 'Re-login does not issue a signed bearer')
            require(inst.request('GET', '/api/v1/user/me', auth=signed)['user']['id'] == user_id,
                    'Re-login returns a different account')
            if role == 'onboarding':
                require(not inst.request('GET', '/api/v1/user-agents', auth=signed)['agents'],
                        'Re-login creates an agent for an account without one')
                expect(browser.frame.locator('kickside-agent-onboarding').get_by_label('Agent name', exact=True)).to_be_visible(timeout=30000)
            signed_browser_token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
            inst.redactor.add(signed_browser_token)
            signed_storage = browser.context.storage_state()
            inst.login()
            path, document, entry = token_entry(directory)
            entry['token_length'] = 40
            path.write_text(yaml.safe_dump(document, sort_keys=False))
            update_source(fixture, str(directory), MODULE, live=True)
            require(inst.request('GET', '/api/v1/user/me', auth=signed)['user']['id'] == user_id,
                    'A signed bearer loses authentication after a module update')
            browser.reset_context(storage_state=signed_storage)
            browser.page.goto(inst.base + '/', wait_until='domcontentloaded', timeout=30000)
            browser.frame.locator('.sidebar').wait_for(timeout=30000)
            original_browser = browser
            inst.evidence.save('unsigned-transition-browser-errors', browser.errors)
            with Browser.paused(inst, [fixture], lambda context, operation: operation(context)):
                pass
            browser = fixture.browser_check()
            require(inst.request('GET', '/api/v1/user/me', auth=signed)['user']['id'] == user_id,
                    'A signed bearer loses authentication after a restart')
            require(browser.page.url != inst.base + '/login', 'A signed browser session logs out after restart')
            restored_token = browser.page.evaluate("JSON.parse(localStorage.getItem('@wippy_token_info')).token")
            require(restored_token == signed_browser_token, 'A restart replaces the saved signed browser token')
            browser_identity = inst.request('GET', '/api/v1/user/me', auth=restored_token,
                                            label='signed-browser-after-restart')
            require(browser_identity['user']['id'] == user_id,
                    'The saved signed browser token loses its identity after restart')
            require(keeper_tools(inst, minted) == baseline_tools, 'A restart breaks a retained Keeper MCP bearer')
            final = retained_data(inst)
            inst.evidence.save('signed-transition-retention', {'role': role, 'before': before, 'after': final})
            require(before == final, 'Re-login or restart changes retained installation data')
            original_browser.clean(0)
    return run


REGISTRY = [Scenario('runtime_unsigned_token_transition_' + role, 'regression', role_transition(role),
                     issues=('RUNTIME-UNSIGNED-TOKEN-SIGNING-CONTINUITY',
                             'HOST-UNBOUND-AUTH-EXPIRY-CALLBACK'))
            for role in ('admin', 'member', 'onboarding')]
