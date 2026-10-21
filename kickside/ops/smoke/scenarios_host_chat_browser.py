# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""The host startChat API opens the application chat from an embedded app."""
from harness import Scenario, require
from scenarios_hub_ui import keeper_browser
from mcp_contracts import open_keeper_application


def host_start_chat_browser(ctx):
    from playwright.sync_api import expect

    browser = keeper_browser(ctx)
    with browser.page.expect_response(lambda response: '/api/v1/keeper/agents/list' in response.url) as response:
        keeper = open_keeper_application(ctx, browser)
    agents = response.value.json()['agents']
    require(agents and agents[0].get('start_token'), 'Keeper fixture has no public chat agent')
    reference = agents[0].get('model')
    require(reference, 'Keeper chat agent has no model reference')
    provider = 'kickside.models:openai_compat_plain.provider'
    profile = ctx.inst.request('POST', '/api/v1/models/provider-profiles', {
        'name': 'Host chat fixture', 'provider_id': provider,
        'config': {'base_url': 'http://127.0.0.1:1/v1'}, 'api_key': 'host-chat-fixture',
    }, expect=(201,), label='host-chat-model-profile')['profile']['id']
    ctx.inst.cleanup.add('Host chat model profile', lambda: ctx.inst.request(
        'DELETE', '/api/v1/models/provider-profiles/' + profile), scope='scenario')
    name = 'host-chat-model-fixture' if reference.startswith('class:') else reference
    ctx.inst.request('PUT', '/api/v1/models/cards', {
        'name': name, 'title': 'Host chat model fixture', 'provider_id': provider,
        'provider_profile_id': profile, 'provider_model': 'host-chat-fixture',
        'capabilities': ['generate', 'tool_use'], 'max_tokens': 8192, 'output_tokens': 1024,
        'class': [reference.removeprefix('class:')] if reference.startswith('class:') else [],
        'enabled': True,
    }, label='host-chat-model-card')
    ctx.inst.cleanup.add('Host chat model card', lambda: ctx.inst.request(
        'DELETE', '/api/v1/models/cards?name=' + name), scope='scenario')
    token = agents[0]['start_token']
    ctx.inst.redactor.add(token)
    keeper.locator('.ask-btn').click()
    if len(agents) > 1:
        keeper.locator('.agent-item').first.click()
    chat = browser.frame.locator('wippy-chat')
    expect(chat).to_be_visible(timeout=30000)
    session_id = browser.current_session()
    stored = ctx.inst.request('GET', '/api/v1/sessions/get?session_id=' + session_id,
                              label='keeper-host-chat-session')['session']
    require(stored['session_id'] == session_id, 'Keeper Ask chat has no durable session')
    expect(browser.frame.get_by_role('button', name='Close chat', exact=True)).to_be_visible()
    browser.screenshot('keeper-host-start-chat')
    ctx.inst.evidence.save('keeper-host-start-chat', {
        'api': 'host.startChat', 'sidebar': True,
        'chat_visible': chat.is_visible(),
        'selected_agent': agents[0]['id'], 'session_id': session_id,
    })


REGISTRY = [Scenario('host_start_chat_browser', 'regression', host_start_chat_browser,
                     ('boot',), instance_setup=True, issues=('APP-HOST-CHAT-INTENT-OWNERSHIP',))]
