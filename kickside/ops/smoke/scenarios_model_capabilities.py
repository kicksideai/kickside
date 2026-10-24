# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""First-party model inference, stored metadata upgrades, and picker choices."""
import os
from pathlib import Path
import subprocess

from harness import Scenario, require
from module_harness import run_focused_module_test


def discovery_capabilities(ctx):
    run_focused_module_test(ctx, 'kickside/models', 'openai_capabilities_test')
    run_focused_module_test(ctx, 'kickside/models', 'discovery_metadata_migration_test')


def picker_capabilities(ctx):
    root = Path(ctx.inst.config['replace']['kickside/widgets']).parents[1]
    environment = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    command = ['make', 'test', 'MOD=widgets',
               'TEST_ARGS=src/model-picker/app/model-picker-capabilities.spec.ts --maxWorkers=2']
    result = subprocess.run(command, cwd=root, env=environment, capture_output=True, text=True, timeout=900)
    ctx.inst.evidence.save('model-picker-capabilities', {
        'command': command, 'code': result.returncode, 'output': result.stdout, 'error': result.stderr,
    })
    require(result.returncode == 0, 'Model picker capability guard fails: ' + result.stdout + result.stderr)


REGISTRY = [
    Scenario('models_discovery_capabilities', 'regression', discovery_capabilities,
             issues=('MODELS-REASONING-GENERATIONS', 'MODELS-GENERATION-CAPABILITIES')),
    Scenario('model_picker_class_capabilities', 'regression', picker_capabilities,
             issues=('WIDGETS-CLASS-CAPABILITY',)),
]


def picker_capabilities_browser(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    from scenarios import nav

    provider = 'kickside.models:openai_compat_plain.provider'
    for name, title, capability, classes in (
        ('picker-generation-fixture', 'Picker generation fixture', 'generate', ['fast']),
        ('picker-embedding-fixture', 'Picker embedding fixture', 'embed', ['embed']),
    ):
        ctx.inst.request('PUT', '/api/v1/models/cards', {
            'name': name, 'title': title, 'provider_id': provider,
            'provider_model': name, 'capabilities': [capability], 'class': classes,
            'enabled': True, 'max_tokens': 8192, 'output_tokens': 1024,
        }, label=name)
        ctx.inst.cleanup.add(name, lambda name=name: ctx.inst.request(
            'DELETE', '/api/v1/models/cards?name=' + name), scope='scenario')
    classes = ctx.inst.request('GET', '/api/v1/models/classes', label='picker-class-fixture')['classes']
    require(any(row['name'] == 'embed' and row['capability'] == 'embed' for row in classes),
            'Fixture lacks the incompatible embedding class')
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    nav(ctx, 'Agents')
    agents = browser.frame.locator('kickside-agents')
    agents.get_by_role('button', name='New agent', exact=True).first.click()
    dialog = agents.get_by_role('dialog', name='New agent', exact=True)
    dialog.get_by_role('tab', name='Model', exact=True).click()
    picker = dialog.locator('wc-model-picker')
    with browser.page.expect_response(lambda response: response.url.endswith('/api/v1/models/classes')):
        picker.get_by_role('combobox', name='Choose model', exact=True).click()
    options = picker.get_by_role('option')
    expect(options.filter(has=browser.frame.get_by_text('Fast', exact=True))).to_be_visible(timeout=30000)
    ctx.inst.evidence.save('generation-picker-browser-options', options.all_text_contents())
    expect(options.filter(has=browser.frame.get_by_text('Embed', exact=True))).to_have_count(0)
    expect(options.filter(has_text='Picker embedding fixture')).to_have_count(0)
    expect(options.filter(has=browser.frame.get_by_text('Picker generation fixture', exact=True))).to_be_visible()
    browser.screenshot('generation-picker-browser-options')


REGISTRY.append(Scenario('model_picker_capabilities_browser', 'regression', picker_capabilities_browser,
                         ('boot',), instance_setup=True, issues=('WIDGETS-CLASS-CAPABILITY',)))


def discovered_generation_reasoning_browser(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes, isolated_fixture
    from scenarios import nav
    from scenarios_core import system
    from scenarios_llm_diagnostics import model_fixture
    from scenarios_model_discovery_requests import model_rows, response

    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response, models=model_rows(), provider='wippy.llm.openai:provider') as (_, profile):
            discovered = fixture.inst.request('POST', '/api/v1/models/provider-profiles/' + profile + '/discover', {}, label='browser-first-party-discovery')['models']
            card = next(row for row in discovered if row['provider_model'] == 'gpt-6-luna')
            require({'generate', 'reasoning'}.issubset(card['capabilities']) and card['options'].get('reasoning_model_request') is True,
                    'Browser fixture did not discover the generation/reasoning contract: ' + str(card))
            complete_splashes(fixture, 'welcome', 'first_agent')
            browser = fixture.browser_check()
            browser.login()
            system(fixture, 'Models')
            models = browser.frame.locator('kickside-models')
            row = models.locator('.km-mrow').filter(has_text=card['name'])
            expect(row).to_be_visible(timeout=30000)
            expect(row).to_contain_text('generate')
            expect(row).to_contain_text('reasoning')
            row.get_by_role('button', name='Edit model', exact=True).click()
            expect(models.get_by_label('Thinking effort', exact=True)).to_be_visible(timeout=30000)
            models.get_by_role('button', name='Cancel', exact=True).click()
            card_text = row.inner_text()
            nav(fixture, 'Agents')
            agents = browser.frame.locator('kickside-agents')
            agents.get_by_role('button', name='New agent', exact=True).first.click()
            dialog = agents.get_by_role('dialog', name='New agent', exact=True)
            dialog.get_by_role('tab', name='Model', exact=True).click()
            picker = dialog.locator('wc-model-picker')
            picker.get_by_role('combobox', name='Choose model', exact=True).click()
            option = picker.get_by_role('option').filter(has_text=card['title'])
            expect(option).to_be_visible(timeout=30000)
            option.click()
            expect(picker.get_by_role('combobox', name='Choose model', exact=True)).to_contain_text(card['title'])
            fixture.inst.evidence.save('discovered-generation-reasoning-browser', {'card': {key: card.get(key) for key in ('name', 'title', 'capabilities', 'options', 'class')}, 'models_card': card_text, 'picker_option': option.inner_text()})
            browser.screenshot('discovered-generation-reasoning-card-and-picker')


REGISTRY.append(Scenario('discovered_generation_reasoning_browser', 'regression', discovered_generation_reasoning_browser,
                         ('boot',), instance_setup=True, issues=('MODELS-REASONING-GENERATIONS', 'MODELS-GENERATION-CAPABILITIES')))
