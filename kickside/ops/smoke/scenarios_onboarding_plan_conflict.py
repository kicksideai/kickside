"""Onboarding waits for permission projection before planning each install."""
import json

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios import platform_onboarding


def onboarding_plan_conflict(ctx):
    with isolated_fixture(ctx) as fixture:
        browser = fixture.browser_check()
        base = fixture.inst.base + '/api/v1/'
        plan_url = base + 'keeper/hub/dependencies/plan'
        install_url = base + 'keeper/hub/dependencies/install'
        status_url = base + 'security/projection'
        plans, installs, responses, statuses = [], [], [], []
        held = 0
        current = False

        def observe(request):
            if request.method == 'POST' and request.url == plan_url:
                require(current, 'Onboarding requests a plan before security projection is current')
                plans.append(request.post_data_json)

        def responded(response):
            if response.request.method == 'POST' and response.url == plan_url:
                responses.append({'status': response.status, 'body': response.json(),
                                  'request': response.request.post_data_json})

        def installed(route):
            nonlocal current
            response = route.fetch()
            require(response.status == 200, 'Onboarding installation fails')
            installs.append(route.request.post_data_json)
            current = False
            route.fulfill(response=response)

        def projection_status(route):
            nonlocal held, current
            response = route.fetch()
            body = response.json()
            if len(installs) == 1 and held < 2:
                body['current'] = False
                held += 1
            statuses.append(body)
            current = body.get('current') is True
            route.fulfill(response=response, body=json.dumps(body))

        browser.page.on('request', observe)
        browser.page.on('response', responded)
        browser.page.route(status_url, projection_status)
        browser.page.route(install_url, installed)
        try:
            platform_onboarding(fixture)
            require(held == 2, 'Onboarding does not wait through the controlled stale projection')
            require(len(plans) >= 2 and len(plans) == len(installs) == len(responses),
                    'Onboarding repeats or omits a plan or install')
            require(all(response['status'] == 200 for response in responses),
                    'Onboarding sends a rejected plan request')
            fixture.inst.evidence.save('onboarding-projection-currency',
                                       {'plans': plans, 'installs': installs, 'responses': responses, 'statuses': statuses})
        finally:
            browser.page.remove_listener('request', observe)
            browser.page.remove_listener('response', responded)
            browser.page.unroute(status_url, projection_status)
            browser.page.unroute(install_url, installed)


REGISTRY = [Scenario('regression_onboarding_plan_conflict', 'regression', onboarding_plan_conflict,
                     issues=('ONBOARDING-DEPENDENCY-INSTALL-CONFLICT',))]
