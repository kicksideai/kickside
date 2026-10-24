"""Browser proofs for Settings presentation and agent-workflow diagnostics."""
import uuid

from harness import Scenario, require
from runtime_fixtures import complete_splashes, isolated_fixture
from scenarios_automation import open_workflow
from scenarios_core import system
from scenarios_llm_diagnostics import agent_workflow, finish_response, has_error_type, model_fixture


def settings_notices_theme_radius_browser(ctx):
    """The shipped notice and universal theme tokens reach the Settings UI."""
    from playwright.sync_api import expect

    complete_splashes(ctx, 'welcome', 'first_agent')
    info = ctx.inst.request('GET', '/api/v1/settings/about', label='settings-surface-about')
    require(info.get('notices'), 'Settings notice fixture has no bundled notice text')

    browser = ctx.browser_check(viewport={'width': 1600, 'height': 1000}, color_scheme='light')
    browser.login()
    system(ctx, 'Settings')
    settings = browser.frame.locator('kickside-settings')
    expect(settings.get_by_role('button', name='All settings', exact=True)).to_be_visible(timeout=30000)
    # This is deliberately measured on the Settings shell before entering About:
    # a missing theme import used to leave the genuine Settings controls unthemed.
    nav_item = settings.locator('.ks-nav-item').first
    expect(nav_item).to_be_visible()
    light_shell = nav_item.evaluate("""el => {
        const style = getComputedStyle(el)
        return { color: style.color, radius: style.borderRadius, background: style.backgroundColor }
    }""")
    require(light_shell['radius'] == '8px' and light_shell['color'] != 'rgba(0, 0, 0, 0)',
            'Settings navigation loses its rendered theme/radius contract: ' + str(light_shell))

    settings.get_by_role('button', name='About', exact=True).click()
    notices = settings.locator('kickside-settings-about .ks-about-notices')
    expect(notices).to_have_text(info['notices'], timeout=30000)
    light_notice = notices.evaluate("""el => {
        const style = getComputedStyle(el)
        return { background: style.backgroundColor, color: style.color, radius: style.borderRadius }
    }""")
    require(light_notice['background'] != 'rgba(0, 0, 0, 0)' and light_notice['radius'] != '0px'
            and light_notice['radius'] == '6px',
            'Bundled notices do not render with the Settings theme radius: ' + str(light_notice))

    browser.page.emulate_media(color_scheme='dark')
    dark_notice = notices.evaluate("""el => {
        const style = getComputedStyle(el)
        return { background: style.backgroundColor, color: style.color, radius: style.borderRadius }
    }""")
    require(dark_notice['radius'] == light_notice['radius'] and dark_notice['background'] != light_notice['background'],
            'Settings notice does not retain its radius while the rendered theme changes: '
            + str({'light': light_notice, 'dark': dark_notice}))
    browser.screenshot('settings-notices-theme-radius-dark', full_page=False)
    browser.page.emulate_media(color_scheme='light')


def _launch_diagnostic_workflow(ctx, title):
    """Start the published agent through the actual Workflow Run dialog."""
    from playwright.sync_api import expect

    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    open_workflow(ctx, title)
    browser.frame.get_by_role('button', name='Run', exact=True).click()
    dialog = browser.frame.get_by_role('dialog', name='Run with input', exact=True)
    # The shared dispatch fixture intentionally has an open input object, which
    # renders this dialog's no-input state. The click still exercises the user
    # launch control; provider failure does not depend on arbitrary form data.
    expect(dialog).to_contain_text('This Workflow needs no input.')
    workflow_id = ctx.state['last_diagnostic_workflow']['workflow_id']
    with browser.page.expect_response(lambda response: response.request.method == 'POST'
                                      and response.url.endswith('/workflows/' + workflow_id + '/simulate')) as response:
        dialog.get_by_role('button', name='Run', exact=True).click()
    launched = response.value.json()
    require(response.value.status == 200 and launched.get('run_id'),
            'Workflow Run dialog does not create a durable agent run: ' + str(launched))
    run_id = launched['run_id']
    base = '/api/v1/workflows/' + workflow_id + '/runs/' + run_id
    done = ctx.inst.wait(lambda: value if (value := ctx.inst.request('GET', base, label='diagnostic-ui-run-status'))['run']['status']
                         in ('completed', 'failed') else None,
                         'Workflow Run dialog reaches a terminal result', seconds=90,
                         pump=browser.page.wait_for_timeout)
    return browser, done, run_id


def _open_run_inspector(browser, run_id, status):
    """Open the durable run through the user-facing Workflow history."""
    from playwright.sync_api import expect

    browser.frame.get_by_role('button', name='Past runs', exact=True).click()
    runs = browser.frame.get_by_role('dialog', name='Runs', exact=True)
    row = runs.locator('.wf-runs-row')
    expect(row).to_have_count(1, timeout=30000)
    row = row.first
    expect(row).to_contain_text(status, timeout=30000)
    row.click()
    return browser, row, browser.frame.locator('.wf-panel--run')


def workflow_provider_diagnostic_browser(ctx):
    """A provider rejection remains readable in the real Workflow failure UI."""
    from playwright.sync_api import expect

    marker = 'Northwind provider rejection ' + uuid.uuid4().hex[:8]
    title = 'Provider diagnostic browser ' + uuid.uuid4().hex[:8]

    def response(_body):
        return 429, {}, {'error': {'type': 'rate_limit_error', 'code': 'rate_limit_exceeded',
                                   'message': marker}}

    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response) as (model, _):
            agent_workflow(fixture, model, title=title, run=False)
            browser, done, visible_run_id = _launch_diagnostic_workflow(fixture, title)
            run = done['run']
            require(run['status'] == 'failed' and has_error_type(done, 'rate_limit_exceeded'),
                    'Deterministic provider rejection does not fail the agent workflow: ' + str(done))
            browser, row, inspector = _open_run_inspector(browser, visible_run_id, 'Failed')
            browser.frame.locator('.vue-flow__node').filter(has_text='Provider diagnostic agent').click()
            failure = inspector.locator('.wf-run-fail')
            expect(failure).to_contain_text(marker, timeout=30000)
            expect(failure).to_contain_text('rate_limit_exceeded')
            browser.screenshot('workflow-provider-diagnostic-browser', full_page=False)


def workflow_tool_argument_diagnostic_browser(ctx):
    """A failed agent run retains its malformed tool-call diagnostic in the UI."""
    from playwright.sync_api import expect

    title = 'Tool argument diagnostic browser ' + uuid.uuid4().hex[:8]
    malformed = '{"answer":'
    marker = 'Northwind tool diagnostic rejection ' + uuid.uuid4().hex[:8]
    calls = 0

    def response(body):
        nonlocal calls
        calls += 1
        if calls == 1:
            return finish_response(body, malformed, 'malformed-browser-call')
        require(calls == 2, 'Tool diagnostic fixture repeats its rejected provider response')
        return 429, {}, {'error': {'type': 'rate_limit_error', 'code': 'rate_limit_exceeded',
                                   'message': marker}}

    with isolated_fixture(ctx) as fixture:
        with model_fixture(fixture, response) as (model, _):
            agent_workflow(fixture, model, title=title, run=False)
            browser, done, visible_run_id = _launch_diagnostic_workflow(fixture, title)
            run = done['run']
            require(run['status'] == 'failed' and calls == 2 and has_error_type(done, 'rate_limit_exceeded'),
                    'Tool argument fixture does not retain the malformed call through workflow failure: ' + str(done))
            browser, row, inspector = _open_run_inspector(browser, visible_run_id, 'Failed')
            browser.frame.locator('.vue-flow__node').filter(has_text='Provider diagnostic agent').click()
            expect(inspector.locator('.wf-run-fail')).to_contain_text(marker, timeout=30000)
            expect(inspector.get_by_text('Agent trace', exact=True)).to_be_visible(timeout=30000)
            details = inspector.locator('.wf-payload').filter(has_text='Tool call details')
            details.get_by_text('Tool call details', exact=True).click()
            expect(details).to_contain_text('raw_arguments', timeout=30000)
            expect(details).to_contain_text('arguments_error')
            expect(details).to_contain_text('unexpected EOF')
            browser.screenshot('workflow-tool-argument-diagnostic-browser', full_page=False)


REGISTRY = [
    Scenario('settings_notices_theme_radius_browser', 'regression', settings_notices_theme_radius_browser,
             ('boot',), issues=('SETTINGS-NOTICES-THEME-RADIUS',)),
    Scenario('workflow_provider_diagnostic_browser', 'regression', workflow_provider_diagnostic_browser,
             ('boot',), instance_setup=True, issues=('UPSTREAM-PROVIDER-ERROR-CAUSE',)),
    Scenario('workflow_tool_argument_diagnostic_browser', 'regression', workflow_tool_argument_diagnostic_browser,
             ('boot',), instance_setup=True, issues=('UPSTREAM-TOOL-ARGUMENT-DIAGNOSTIC',)),
]
