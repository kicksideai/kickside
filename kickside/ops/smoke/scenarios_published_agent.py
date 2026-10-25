"""Existing ordinary-human Agent tools retain provider credentials through Hub updates."""
import json
import re

from harness import Scenario, require
from scenarios import nav
from scenarios_hot_update_work import database_rows
from scenarios_selected_install import _identity
from scenarios_published_run_as import REGISTRY as PUBLISHED, browser_published_human_automation_update, install_source_through_hub_ui


def browser_published_agent_provider_hub_ui_update(ctx):
    state = {'effects': []}

    def setup(fixture):
        from scenarios_agent_background import model_tool_fixture
        inst = fixture.inst
        tools = model_tool_fixture(fixture, allow_groups=['app.security:admin'])
        title = 'Existing human analyst ' + tools['suffix']
        agent = inst.request('POST', '/api/v1/user-agents', {'title': title,
            'description': 'Original installed Agent provider proof',
            'prompt': 'Use each configured recording tool exactly once and report both results.',
            'model': tools['model'], 'tools': [tools['namespace'] + ':effect', tools['namespace'] + ':human_effect'],
            'traits': []})['component_id']
        spec = {'title': title + ' schedule', 'enabled': True,
            'schedule': {'type': 'interval', 'expression': '24h'},
            'target': {'kind': 'agent', 'agent_id': agent, 'prompt': 'Record each configured effect exactly once'}}
        root = inst.request('POST', '/api/v1/automations', {'type': 'kickside.automation.recurring:task', 'input': spec})['id']
        state.update(tools=tools, agent=agent, title=title, root=root)

    def configuration(inst):
        tools = state['tools']
        return {'agent': inst.request('GET', '/api/v1/user-agents/' + state['agent'])['agent'],
            'automation': inst.request('GET', '/api/v1/automations/' + state['root'] + '/config')['config'],
            'identity': _identity(inst, state['root']),
            'audit': database_rows(inst, "SELECT identity_generation,CAST(record_json AS TEXT) AS record_json FROM kickside_execution_identity_audit WHERE component_id='" + state['root'] + "' ORDER BY identity_generation"),
            'profile': database_rows(inst, "SELECT id,name,provider_id,config_json,secret_json,enabled,created_at,updated_at FROM kickside_model_provider_profiles WHERE id='" + tools['profile'] + "'"),
            'card': database_rows(inst, "SELECT * FROM kickside_model_cards WHERE name='" + tools['model'] + "'")}

    def effects(inst):
        return database_rows(inst, 'SELECT effect_id,root,actor_id,identity_json,action FROM ' + state['tools']['table'] + ' ORDER BY effect_id')

    def observe(fixture, phase):
        from playwright.sync_api import expect
        inst = fixture.inst
        if phase == 'before_restart':
            return
        current = configuration(inst)
        if phase == 'baseline':
            state['actor'] = inst.request('GET', '/api/v1/user/me')['user']['id']
            state['configuration'] = current
            identity = current['identity'][0]
            require(identity['principal'] == {'kind': 'user', 'id': state['actor']}
                    and identity['authorized_by'] == identity['principal'], 'Published Agent automation borrows another principal')
            require(current['audit'] and len(current['profile']) == 1 and current['profile'][0]['secret_json'],
                    'Published Agent fixture has no original identity audit or encrypted model credential')
        else:
            require(current == state['configuration'], 'Hub update changes the original Agent/configuration/identity/audit/provider credential/model card')
        before = effects(inst)
        require(before == state['effects'], 'Update loses or adds an original Agent tool effect')
        browser = fixture.browser_check()
        trace = inst.root / inst.evidence.label / ('published-agent-' + phase + '-trace.zip')
        trace.parent.mkdir(parents=True, exist_ok=True)
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            nav(fixture, 'Agents')
            expect(browser.frame.locator('kickside-agents').get_by_text(state['title'], exact=True)).to_be_visible(timeout=30000)
            nav(fixture, 'Automations')
            row = browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=state['title'] + ' schedule')
            expect(row).to_be_visible(timeout=30000)
            row.get_by_role('button', name=re.compile('^More actions')).click()
            action = '/api/v1/automations/' + state['root'] + '/actions/run_now'
            with browser.page.expect_response(lambda response: response.request.method == 'POST' and response.url.endswith(action)) as response:
                browser.frame.get_by_role('menuitem', name='Run ' + state['title'] + ' schedule now', exact=True).click()
            require(response.value.status == 200 and response.value.json().get('success') is True,
                    'Original Agent automation UI run fails after ' + phase)
            def delivered():
                rows = effects(inst)
                require({row['effect_id'] for row in before} <= {row['effect_id'] for row in rows}, 'Agent loses an original effect receipt')
                require(len(rows) <= len(before) + 2, 'Agent duplicates a configured tool effect')
                return rows if len(rows) == len(before) + 2 else None
            rows = inst.wait(delivered, 'Original Agent records both native tool effects after ' + phase,
                             seconds=60, pump=browser.page.wait_for_timeout)
            added = [row for row in rows if row['effect_id'] not in {row['effect_id'] for row in before}]
            require({row['action'] for row in added} == {'agent.effect', 'agent.human_effect'}, 'Agent omits an original configured tool')
            for row in rows:
                identity = json.loads(row['identity_json'])
                require(row['root'] == state['root'] and row['actor_id'] == state['actor']
                        and identity['principal'] == {'kind': 'user', 'id': state['actor']}
                        and identity['authorized_by'] == identity['principal'] and identity['component_id'] == state['root'],
                        'Original Agent tool effect substitutes executor/authorizer/root')
            state['effects'] = rows
            browser.clean(0)
            browser.screenshot('published-agent-' + phase)
            inst.evidence.save('published-agent-' + phase, {'configuration': current, 'effects': rows,
                'original_human': state['actor'], 'provider_requests': fixture.fixtures.requests('openai-tools')})
        finally:
            inst.evidence.save('published-agent-progress-' + phase, {'effects': effects(inst),
                'provider_requests': fixture.fixtures.requests('openai-tools')})
            browser.context.tracing.stop(path=str(trace))
            inst.evidence.paths.append(str(trace))

    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui,
        setup=setup, observe=observe, modules=('kickside/agents', 'kickside/models'),
        controller_source='keeper/keeper')


REGISTRY = [Scenario('browser_published_agent_provider_hub_ui_update', 'regression',
    browser_published_agent_provider_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-B16', 'RA-C04', 'BOT-PUBLISHED-AGENT-PROVIDER-CONTINUITY'))]
