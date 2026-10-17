"""Ordinary members validate transforms through the served Sync editor."""
import json
import uuid

from harness import Scenario, require
from module_lifecycle_contract import sync_fixture
from runtime_fixtures import complete_splashes, isolated_fixture
from scenarios import nav
from scenarios_core import http


def browser_transform_member_validation(ctx):
    from playwright.sync_api import expect

    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox', 'chestor/workspace'):
            inst.install(module)
        complete_splashes(fixture, 'welcome')
        email = 'transform-member-' + uuid.uuid4().hex[:12] + '@smoke.example'
        user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
            'full_name': 'Northwind transform member'}, expect=(201,))['user']
        inst.cleanup.add('transform member', lambda: inst.request(
            'DELETE', '/api/v1/users/' + user['user_id'], expect=(202,)))
        token = inst.request('POST', '/api/public/user/token', {'email': email,
            'password': inst.password}, auth='')['token']
        inst.redactor.add(token)
        identity = inst.request('GET', '/api/v1/user/me', auth=token)
        require(identity['security']['is_admin'] is False
                and set(identity['security']['groups']) == {'app.security:user', 'app.security:members'},
                'Transform browser fixture acquires more than ordinary member access')
        original = inst.token
        try:
            inst.token = token
            complete_splashes(fixture, 'first_agent')
        finally:
            inst.token = original
        aid, hook, _, title = sync_fixture(fixture, auth=token)
        inst.cleanup.add('member Sync', lambda: inst.request('DELETE', '/api/v1/automations/' + aid, auth=token))
        inst.cleanup.add('member webhook', lambda: inst.request('DELETE', '/api/v1/webhooks/' + hook['webhook_id'], auth=token))
        sample = {'product': 'Sample source item'}
        inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], sample,
            auth=hook['secret'], expect=(202,), headers={'Idempotency-Key': uuid.uuid4().hex},
            label='member-transform-source-item')
        browser = fixture.browser_check()
        browser.login(email, inst.password)
        nav(fixture, 'Automations')
        row = browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
        row.get_by_role('button', name='More actions for ' + title, exact=True).click()
        row.get_by_role('menuitem', name='Edit ' + title, exact=True).click()
        manage = browser.frame.locator('kickside-sync-manage')
        manage.locator('[data-test="sync-manage"]').wait_for(timeout=30000)
        transform = manage.locator('kickside-transform-assist')
        editor = transform.locator('[data-test="expr-editor"]')
        inst.evidence.save('member-transform-widget-inputs', {
            'attributes': transform.evaluate('element => Object.fromEntries([...element.attributes].map(a => [a.name, a.value]))'),
            'generation_disabled': transform.locator('[data-test="generate"]').is_disabled()})
        inst.wait(lambda: transform.get_attribute('samples') == json.dumps([{'payload': sample}], separators=(',', ':')),
            'Sync passes its real source item to Transform', seconds=30, pump=browser.page.wait_for_timeout)
        expected = {'title': title, 'content': sample['product']}
        expression = '{title: ' + json.dumps(title) + ', content: payload.product}'
        records = []
        for value, valid in ((expression, True), ('(', False), (expression, True)):
            with browser.page.expect_response(lambda response: response.request.method == 'POST'
                    and response.url.endswith('/api/v1/transform/validate')) as response:
                editor.fill(value)
                editor.press('Tab')
            body = response.value.json()
            require(response.value.status == 200 and body.get('ok') is True and body.get('valid') is valid,
                    'Member Transform editor validation differs: ' + str(body))
            expect(transform.locator('[data-test="status"]')).to_have_text(
                'Validated' if valid else 'Needs review', timeout=30000)
            if valid:
                require(body['outputs'] == [expected], 'Transform member validation loses its exact output')
                expect(transform.locator('[data-test="output-preview"]')).to_contain_text(expected['content'])
            else:
                require(body.get('errors'), 'Invalid member expression has no validation errors')
                expect(transform.locator('[data-test="verrors"]')).to_be_visible()
            records.append({'status': response.value.status, 'body': body})
        with browser.page.expect_response(lambda response: response.request.method == 'PUT'
                and response.url.endswith('/api/v1/automations/' + aid)) as response:
            manage.get_by_role('button', name='Save', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success') is True,
                'Ordinary member cannot save the validated transform')
        stored = inst.request('GET', '/api/v1/automations/' + aid + '/config', auth=token)['config']
        require(stored['transform'] == {'kind': 'expr', 'expr': expression},
                'Member editor does not persist its exact validated transform')
        browser.screenshot('ordinary-member-transform-validation', full_page=False)
        inst.evidence.save('ordinary-member-transform-validation', {
            'user_id': user['user_id'], 'groups': identity['security']['groups'],
            'validation': records, 'stored_transform': stored['transform']})


REGISTRY = [Scenario('browser_transform_member_validation', 'regression', browser_transform_member_validation,
    ('boot',), instance_setup=True,
    issues=('TRANSFORM-REQUIREMENT-ENDPOINT-ACCESS', 'TRANSFORM-COMPONENT-INPUT-SCHEMA',
            'SYNC-TRANSFORM-SOURCE-SAMPLES', 'SYNC-TRANSFORM-SAMPLE-ENVELOPE'),
    features=http('transform', 'POST /api/v1/transform/validate')
        + http('automation', 'POST /api/v1/automations/source-samples'))]
