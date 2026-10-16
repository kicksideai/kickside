# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Explicit model setup and typed AI generation contracts."""
from harness import Scenario, require
from module_harness import run_focused_module_test


def first_agent_model_setup(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes, isolated_fixture
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        complete_splashes(fixture, 'welcome')
        browser = fixture.browser_check()
        browser.login()
        personal = browser.frame.locator('kickside-agent-onboarding')
        expect(personal.get_by_role('heading', name='Configure a model', exact=True)).to_be_visible(timeout=30000)
        create = personal.get_by_role('button', name='Create agent', exact=True)
        expect(create).to_be_disabled()
        requests = []
        browser.page.on('request', lambda request: requests.append(request.url)
                        if request.method == 'POST' and request.url.endswith('/api/v1/user-agents') else None)
        personal.locator('form').evaluate('form => form.requestSubmit()')
        expect(create).to_be_disabled()
        require(not requests, 'Onboarding creates an agent without model configuration')
        personal.get_by_role('button', name='Configure a model', exact=True).click()
        expect(personal.locator('kickside-onboard-models')).to_be_visible(timeout=30000)
        browser.screenshot('first-agent-model-required')
        provider = 'kickside.models:openai_compat_plain.provider'
        profile = inst.request('POST', '/api/v1/models/provider-profiles', {
            'name': 'Onboarding configuration fixture', 'provider_id': provider,
            'config': {'base_url': 'http://127.0.0.1:1/v1'}, 'api_key': 'configuration-fixture'},
            expect=(201,))['profile']['id']
        inst.request('PUT', '/api/v1/models/cards', {
            'name': 'onboarding-configured-model', 'title': 'Configured generation model',
            'provider_id': provider, 'provider_profile_id': profile, 'provider_model': 'configuration-fixture',
            'capabilities': ['generate', 'tool_use'], 'max_tokens': 8192, 'output_tokens': 1024,
            'class': ['fast'], 'enabled': True})
        personal.get_by_role('button', name='Check model configuration', exact=True).click()
        expect(create).to_be_enabled(timeout=30000)
        browser.screenshot('first-agent-model-configured')
        with browser.page.expect_response(lambda response: response.request.method == 'POST'
                                          and response.url.endswith('/api/v1/user-agents')) as response:
            create.click()
        result = response.value.json()
        require(response.value.status == 200 and result.get('success') is True and result.get('component_id'),
                'Configured onboarding does not create an agent: ' + str(result))
        expect(browser.frame.locator('wippy-chat')).to_be_visible(timeout=30000)
        require(len(requests) == 1, 'Onboarding creates more than one agent')
        browser.screenshot('first-agent-created')


def research_structured_report(ctx):
    run_focused_module_test(ctx, 'kickside/research', 'structured_report_test')
    run_focused_module_test(ctx, 'kickside/research', 'request_graph_test')
    run_focused_module_test(ctx, 'kickside/research', 'deliver_test')
    ctx.inst.install('kickside/research')
    result = ctx.inst.request('POST', '/api/v1/research', {'topic': 'published input'}, expect=(400,), label='research-topic-preserved')
    require(result.get('error') == 'agent_id is required', 'Research rejects its published topic input')


def transform_explicit_generation(ctx):
    run_focused_module_test(ctx, 'kickside/transform', 'b_ai_generation_test')
    result = ctx.inst.request('POST', '/api/v1/transform/assist', {
        'source_schema': {'type': 'object'}, 'sink_schema': {'type': 'object'}, 'input_shape': 'record'},
        expect=(400,), label='transform-real-samples-required')
    require(result.get('validated') is False and 'samples' in str(result.get('errors')),
            'Generation accepts missing samples')
    result = ctx.inst.request('POST', '/api/v1/transform/validate', {
        'transform': {'kind': 'expr', 'expr': '{}'}, 'source_schema': {'type': 'object'},
        'sink_schema': {'type': 'object'}, 'input_shape': 'record'}, label='transform-no-synthetic-validation')
    require(result.get('valid') is False and result.get('outputs') == [], 'Validation fabricates source data')


REGISTRY = [
    Scenario('first_agent_model_setup', 'regression', first_agent_model_setup,
             issues=('AI-FIRST-AGENT-MODEL-SETUP',), instance_setup=True),
    Scenario('research_structured_report', 'regression', research_structured_report,
             issues=('AI-RESEARCH-STRUCTURED-REPORT', 'AI-RESEARCH-INPUT-COMPATIBILITY')),
    Scenario('transform_explicit_generation', 'regression', transform_explicit_generation,
             issues=('AI-TRANSFORM-EXPLICIT-GENERATION',)),
]
