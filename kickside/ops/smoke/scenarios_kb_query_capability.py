"""KB answer controls follow the configured query capability."""
from harness import Scenario, require
from scenarios import nav, platform_onboarding
from runtime_fixtures import isolated_fixture
from scenarios_ai import kb_create


def kb_query_capability(ctx):
    with isolated_fixture(ctx) as fixture:
        platform_onboarding(fixture)
        query_capability(fixture)


def query_capability(ctx):
    from playwright.sync_api import expect

    ctx.browser_check().login()
    personal = ctx.browser.frame.locator('kickside-agent-onboarding')
    with ctx.browser.page.expect_response(lambda r: '/api/v1/ui/splash/first_agent/seen' in r.url
                                           and r.request.method == 'POST') as response:
        personal.get_by_role('button', name='Skip for now', exact=True).click()
    require(response.value.status == 200 and response.value.json().get('success'),
            'KB fixture does not dismiss personal onboarding')
    ctx.inst.install('kickside/kb10')
    ctx.state.update(model='class:fast', embed='class:embed')
    fixtures = []
    for enabled in (False, True):
        title = 'Northwind query capability ' + str(enabled)
        kid = kb_create(ctx, 'document', title, analysis=enabled)
        ctx.inst.cleanup.add('query capability KB ' + kid,
                             lambda kid=kid: ctx.inst.request('DELETE', '/api/v1/knowledge/' + kid,
                                                            label='query-capability-delete'))
        fixtures.append((enabled, title))
    nav(ctx, 'Knowledge')
    for enabled, title in fixtures:
        ctx.browser.frame.get_by_text(title, exact=True).click()
        detail = ctx.browser.frame.locator('kx-kb-document')
        detail.get_by_role('button', name='Search', exact=True).click()
        ask = detail.get_by_role('button', name='Ask', exact=True)
        if enabled:
            expect(ask).to_have_count(1)
            ask.click()
            expect(detail.get_by_placeholder('Ask this knowledge base a question…')).to_be_visible()
        else:
            expect(ask).to_have_count(0)
            expect(detail.get_by_placeholder('Search every indexed passage…')).to_be_visible()
        ctx.browser.screenshot('query-capability-' + str(enabled))
        ctx.browser.frame.get_by_role('button', name='Back', exact=True).click()


REGISTRY = [Scenario('regression_kb_query_capability', 'regression', kb_query_capability,
                     ('platform_onboarding',), issues=('KB10-ASK-CAPABILITY-SHADOW',
                         'SMOKE-PERSONAL-ONBOARDING-FIXTURE-LIFETIME', 'EE2-2636'))]
