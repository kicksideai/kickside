"""Review real Hub plans, requirement candidates, and installs in the Keeper UI."""
from pathlib import Path
import re
import shutil
import uuid

from harness import Scenario, require
from mcp_contracts import open_keeper_application
from runtime_fixtures import complete_splashes, isolated_fixture


def keeper_browser(ctx):
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.reset_context()
    browser.login()
    browser.frame.locator('.sidebar').wait_for(timeout=30000)
    return browser


def keeper_ui(ctx):
    browser = keeper_browser(ctx)
    return browser, open_keeper_application(ctx, browser)


def hub_ui(ctx):
    browser, frame = keeper_ui(ctx)
    frame.get_by_role('button', name='Settings', exact=True).click()
    frame.get_by_role('button', name=re.compile('^Wippy Hub')).click()
    frame.get_by_placeholder('Search modules, e.g. agent, llm, dataflow…', exact=True).wait_for(timeout=30000)
    return browser, frame


def module_details(ctx, frame, component):
    from playwright.sync_api import expect
    search = frame.get_by_placeholder('Search modules, e.g. agent, llm, dataflow…', exact=True)
    with ctx.browser.page.expect_response(lambda r: '/keeper/hub/browse?' in r.url, timeout=30000) as response:
        search.fill(component.split('/', 1)[1])
    ctx.inst.evidence.save('hub-browse-' + component.replace('/', '-'),
                           {'status': response.value.status, 'body': response.value.json()})
    ctx.browser.screenshot('hub-browse-' + component.replace('/', '-'))
    card = frame.locator('.mod-card').filter(has_text=component)
    expect(card).to_be_visible(timeout=30000)
    with ctx.browser.context.expect_event('response', predicate=lambda r: '/keeper/hub/readme?' in r.url,
                                         timeout=30000) as readme:
        card.click()
    ctx.inst.evidence.save('hub-module-readme', {'status': readme.value.status, 'body': readme.value.text()})
    return frame.get_by_role('button', name=re.compile(r'^(Install|Reinstall \/ update)')).first


def install_dialog(ctx, frame, component):
    from playwright.sync_api import expect
    install = module_details(ctx, frame, component)
    with ctx.browser.page.expect_response(lambda r: r.request.method == 'POST'
                                          and r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000) as response:
        install.click()
    ctx.inst.evidence.save('hub-install-plan', {'status': response.value.status, 'body': response.value.json()})
    dialog = frame.get_by_role('dialog')
    expect(dialog.get_by_text('Install ' + component, exact=True)).to_be_visible(timeout=30000)
    expect(dialog.get_by_text('Resolving install plan…', exact=True)).to_have_count(0, timeout=120000)
    ctx.browser.screenshot('hub-install-plan')
    return dialog


def dashboard_logs(ctx):
    from playwright.sync_api import expect
    browser = keeper_browser(ctx)
    with browser.context.expect_event('response', predicate=lambda r: r.url.endswith('/keeper/logger/stats'),
                                      timeout=30000) as response:
        frame = open_keeper_application(ctx, browser)
    ctx.inst.evidence.save('keeper-log-stats', {'status': response.value.status, 'body': response.value.text()})
    logs = frame.locator('.card').filter(has=frame.get_by_text('Logs', exact=True))
    browser.screenshot('keeper-dashboard-logs')
    expect(logs.locator('.log-bar')).to_be_visible(timeout=30000)
    expect(logs.get_by_text('No log stats', exact=True)).to_have_count(0)


def module_readme(ctx):
    from playwright.sync_api import expect
    browser, frame = hub_ui(ctx)
    module_details(ctx, frame, 'kickside/crm').wait_for(timeout=30000)
    readme = frame.get_by_role('button', name='Readme', exact=True)
    browser.screenshot('keeper-module-readme')
    expect(readme).to_be_enabled(timeout=30000)
    readme.click()
    expect(frame.locator('article.readme')).to_contain_text('CRM', timeout=30000)


def submit_install(ctx, browser, frame, dialog, component):
    from playwright.sync_api import expect
    dialog.get_by_role('button', name='Skip', exact=True).click()
    with browser.page.expect_response(lambda r: r.request.method == 'POST'
                                     and r.url.endswith('/keeper/hub/dependencies/install'), timeout=300000) as response:
        dialog.get_by_role('button', name='Install', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success'),
            'Hub UI installation fails: ' + str(response.value.json()))
    expect(dialog).to_have_count(0, timeout=30000)
    details = frame.locator('.mod-hero').filter(has_text=component)
    expect(details.locator('.mod-hero-org')).to_have_text(component, timeout=30000)
    expect(details.get_by_text('installed', exact=True)).to_be_visible()
    expect(details.get_by_role('button', name='Reinstall / update')).to_be_visible()
    browser.screenshot('hub-installed-' + component.replace('/', '-'))


def requirement_review(ctx):
    from playwright.sync_api import expect
    from model_fixture import live_profile
    from scenarios_hub_ai_review import write_review_source, require_review_targets

    module_source = Path(ctx.inst.config['replace']['kickside/crm'])
    copy = ctx.inst.root / 'temp' / ('hub-review-' + uuid.uuid4().hex[:8])
    shutil.copytree(module_source, copy, ignore=shutil.ignore_patterns(
        '.git', '.wippy', 'node_modules', 'test', 'tests', 'wippy.lock'))
    write_review_source(copy, ['scope_choice', 'sole_service'], True, namespace='kickside.crm.review',
                        kinds={'scope_choice': 'security.scope', 'sole_service': 'http.service'})
    config = {**ctx.inst.config, 'replace': {**ctx.inst.config['replace'], 'kickside/crm': str(copy)}}
    try:
        with isolated_fixture(ctx, config=config) as child:
            inst = child.inst
            _, cards = live_profile(child, 'Northwind Hub choice', scope='instance')
            card = next(row for row in cards if row.get('provider_model') == inst.config['model']['llm'])
            inst.request('PUT', '/api/v1/models/cards', {**card, 'class': ['fast']}, label='hub-fast-model')
            before = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0')['dependencies']
            require(not any(row['component'] == 'kickside/crm' for row in before), 'Hub review fixture already installs CRM')
            services = inst.request('GET', '/api/v1/keeper/registry/entries?kind=http.service&limit=200',
                                    label='hub-sole-service')['entries']
            require([entry['id'] for entry in services] == ['app:gateway'],
                    'Hub review fixture does not have exactly one compatible HTTP service: ' + str(services))
            browser, frame = hub_ui(child)
            dialog = install_dialog(child, frame, 'kickside/crm')
            default = dialog.locator('label.block').filter(has_text='kickside.crm.security:user_security_scope')
            expect(default.locator('input.req-value-input')).to_have_value('kickside.security.groups:members', timeout=30000)
            expect(default.get_by_text('default', exact=True)).to_be_visible()
            sole = dialog.locator('label.block').filter(has_text='kickside.crm.review:sole_service')
            expect(sole.locator('input.req-value-input')).to_have_value('app:gateway', timeout=30000)
            expect(sole.get_by_text('registry', exact=True)).to_be_visible()
            choice = dialog.locator('label.block').filter(has_text='kickside.crm.review:scope_choice')
            value = choice.locator('input.req-value-input')
            expect(value).to_have_value('')
            expect(choice.get_by_text('security.scope', exact=True)).to_be_visible()
            value.click()
            options = frame.get_by_role('listbox').get_by_role('option')
            try:
                expect(options.filter(has_text='kickside.security.groups:members')).to_be_visible(timeout=30000)
            finally:
                inst.evidence.save('hub-requirement-menu', {
                    'options': options.all_text_contents(),
                    'input': value.input_value(),
                    'focused': value.evaluate('(input) => input === document.activeElement'),
                    'menus': frame.get_by_role('listbox').count(),
                })
                browser.screenshot('hub-requirement-menu')
            expect(options.first.locator('.req-value-option-meta')).to_have_text('security.scope')
            value.press('Escape')
            expect(dialog.get_by_role('button', name='Install', exact=True)).to_be_disabled()
            with browser.page.expect_response(lambda r: r.request.method == 'POST'
                                             and r.url.endswith('/keeper/hub/dependencies/fill-gaps'), timeout=120000) as response:
                dialog.get_by_role('button', name='Suggest with AI', exact=True).click()
            plan = response.value.json()
            inst.evidence.save('hub-requirement-proposal', plan)
            require(response.value.status == 200, 'Requirement suggestion fails: ' + str(plan))
            row = next(r for r in plan['requirements'] if r['full_id'] == 'kickside.crm.review:scope_choice')
            require(response.value.status == 200 and row['value'] and not row['missing'] and not row['invalid'],
                    'Fill gaps does not review a compatible requirement choice: ' + str(row))
            expect(value).to_have_value('')
            expect(choice.get_by_role('button', name='Accept suggestion', exact=True)).to_be_visible()
            require(row['choice_reason'].strip(), 'Requirement suggestion omits its reason')
            expect(choice).to_contain_text(row['choice_reason'])
            expect(dialog.get_by_role('button', name='Install', exact=True)).to_be_disabled()
            after = inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0')['dependencies']
            require(before == after, 'Fill gaps applies the plan before review')
            with browser.page.expect_response(lambda r: r.request.method == 'POST'
                                             and r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000):
                choice.get_by_role('button', name='Accept suggestion', exact=True).click()
            expect(value).to_have_value(row['value'], timeout=30000)
            expect(choice.get_by_text(re.compile(r'Model suggestion \(accepted\):'))).to_be_visible()
            expect(dialog.get_by_text('Resolving install plan…', exact=True)).to_have_count(0, timeout=120000)
            value.fill('app:db')
            value.press('Enter')
            expect(choice.get_by_text('invalid', exact=True)).to_be_visible(timeout=120000)
            expect(choice.get_by_text('value must reference an existing security.scope', exact=True)).to_be_visible()
            expect(dialog.get_by_role('button', name='Install', exact=True)).to_be_disabled()
            browser.screenshot('hub-invalid-required-binding')
            value.fill(row['value'])
            value.press('Enter')
            expect(choice.get_by_text('invalid', exact=True)).to_have_count(0, timeout=120000)
            submit_install(child, browser, frame, dialog, 'kickside/crm')
            require_review_targets(child, 'kickside.crm.review',
                                   {'scope_choice': row['value'], 'sole_service': 'app:gateway'})
            frame.get_by_role('button', name='Back to hub', exact=True).click()
            dialog = install_dialog(child, frame, 'kickside/crm')
            expect(default.locator('input.req-value-input')).to_have_value('kickside.security.groups:members', timeout=30000)
            expect(choice.locator('input.req-value-input')).to_have_value(row['value'], timeout=30000)
            browser.screenshot('hub-update-preserves-bindings')
            dialog.get_by_role('button', name='Cancel', exact=True).click()
    finally:
        shutil.rmtree(copy)


def parameterless_install(ctx):
    from playwright.sync_api import expect
    with isolated_fixture(ctx) as child:
        browser, frame = hub_ui(child)
        dialog = install_dialog(child, frame, 'kickside/llm-ocr')
        expect(dialog.get_by_text('No configuration required.', exact=True)).to_be_visible(timeout=30000)
        submit_install(child, browser, frame, dialog, 'kickside/llm-ocr')


REGISTRY = [
    Scenario('keeper_dashboard_logs_ui', 'full', dashboard_logs, ('boot',),
             issues=('KEEPER-LOGGER-UI-ERROR',)),
    Scenario('keeper_module_readme_ui', 'full', module_readme, ('boot',),
             issues=('KEEPER-HUB-README-ERROR',)),
    Scenario('hub_requirement_review_ui', 'full', requirement_review, ('boot',), model=True, instance_setup=True,
             issues=('KEEPER-HUB-README-ERROR', 'KEEPER-FILL-GAPS', 'KEEPER-REQUIREMENT-CHOICE', 'KEEPER-SOLE-REQUIREMENT-CANDIDATE',
                     'KEEPER-REQUIRED-BINDING-ERROR', 'HUB-REQ-DEFAULT-BINDING', 'KEEPER-FIRST-INSTALL-SOURCE',
                     'SECURITY-REQUIREMENT-DEFAULTS', 'SMOKE-HUB-REQUIREMENT-REVIEW-FIXTURE'),
             features=('kickside/hub|navigation|kickside.hub:tab.keeper',)),
    Scenario('hub_parameterless_install_ui', 'full', parameterless_install, ('boot',), instance_setup=True,
             issues=('KEEPER-NATIVE-EMPTY-PARAMETERS', 'KEEPER-HUB-README-ERROR'),
             features=('kickside/hub|navigation|kickside.hub:tab.keeper',)),
]
