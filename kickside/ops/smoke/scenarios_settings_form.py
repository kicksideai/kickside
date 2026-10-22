# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Settings validate parsed structured drafts and display stored-value errors."""
import json
import re

from harness import Scenario, require
from scenarios_automation_task_forms import frontend_specs


def settings_form(ctx):
    frontend_specs(ctx, 'settings', (
        'src/app/settings.schema.spec.ts', 'src/app/settings.row-errors.spec.ts',
    ), 'settings-form')


REGISTRY = [Scenario('settings_form_schema_and_row_errors', 'regression', settings_form,
                     issues=('SETTINGS-STRUCTURED-SCHEMA-VALIDATION', 'SETTINGS-STORED-ROW-ERROR'))]


def settings_fixture(fixture):
    import yaml
    with fixture.paused():
        directory = fixture.inst.app / 'src' / 'settings-browser-fixture'
        directory.mkdir()
        entries = []
        for key, schema, default in (
            ('array_value', {'type': 'array', 'items': {'type': 'string'}}, ['valid']),
            ('object_value', {'type': 'object', 'required': ['enabled'],
                              'properties': {'enabled': {'type': 'boolean'}}}, {'enabled': True}),
        ):
            entries.append({'name': key, 'kind': 'registry.entry',
                            'meta': {'type': 'kickside.settings:definition'},
                            'namespace': 'settings.browser.fixture', 'key': key,
                            'value_type': 'json', 'default': default, 'schema': schema})
        entries.append({'name': 'stored_value', 'kind': 'registry.entry',
                        'meta': {'type': 'kickside.settings:definition'},
                        'namespace': 'settings.browser.fixture', 'key': 'stored_value',
                        'value_type': 'string', 'default': 'valid'})
        (directory / '_index.yaml').write_text(yaml.safe_dump({
            'version': '1.0', 'namespace': 'settings.browser.fixture', 'entries': entries}, sort_keys=False))


def settings_browser(ctx):
    from runtime_fixtures import complete_splashes
    from scenarios_core import system
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    system(ctx, 'Settings')
    view = browser.frame.locator('kickside-settings')
    view.get_by_role('button', name='All settings', exact=True).click()
    view.get_by_placeholder('Search settings', exact=True).fill('settings.browser.fixture')
    return browser, view


def structured_settings_browser(ctx, key, invalid, error, valid):
    from playwright.sync_api import expect
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        settings_fixture(fixture)
        browser, view = settings_browser(fixture)
        writes = []
        browser.page.on('request', lambda request: writes.append(request.post_data_json)
                        if request.method == 'PUT' and request.url.endswith('/api/v1/settings') else None)
        row = view.locator('.ks-row').filter(has_text=key)
        row.locator('textarea').fill(invalid)
        expect(row.locator('.ks-field-err')).to_have_text(error)
        expect(row.get_by_role('button', name='Save', exact=True)).to_be_disabled()
        require(not writes, 'Invalid structured JSON reaches the settings writer')
        browser.screenshot('settings-invalid-' + key)
        row.locator('textarea').fill(valid)
        expect(row.locator('.ks-field-err')).to_have_count(0)
        expect(row.get_by_role('button', name='Save', exact=True)).to_be_enabled()
        with browser.page.expect_response(lambda response: response.request.method == 'PUT'
                                          and response.url.endswith('/api/v1/settings')) as response:
            row.get_by_role('button', name='Save', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success'),
                'Corrected structured setting does not save')
        require(writes == [{'namespace': 'settings.browser.fixture', 'key': key, 'value': json.loads(valid)}],
                'Corrected structured setting loses its parsed value')
        ctx.inst.evidence.save('structured-settings-browser', {'saved_corrected_value': writes})


def array_settings_browser(ctx):
    structured_settings_browser(ctx, 'array_value', '[{}]', '[0]: Must be a string', '["corrected"]')


def object_settings_browser(ctx):
    structured_settings_browser(ctx, 'object_value', '{"enabled":"yes"}',
                                'enabled: Must be a boolean', '{"enabled":false}')


def stored_settings_error_browser(ctx):
    import yaml
    from playwright.sync_api import expect
    from runtime_fixtures import isolated_fixture
    with isolated_fixture(ctx) as fixture:
        settings_fixture(fixture)
        inst = fixture.inst
        inst.request('PUT', '/api/v1/settings', {'namespace': 'settings.browser.fixture',
                     'key': 'stored_value', 'value': 'previous-format'}, label='stored-settings-override')
        with fixture.paused():
            path = inst.app / 'src' / 'settings-browser-fixture' / '_index.yaml'
            document = yaml.safe_load(path.read_text())
            entry = next(row for row in document['entries'] if row['name'] == 'stored_value')
            entry.update(value_type='int', default=5)
            path.write_text(yaml.safe_dump(document, sort_keys=False))
        stored = inst.request('GET', '/api/v1/settings?namespace=settings.browser.fixture',
                              label='stored-settings-error')['settings']
        invalid = next(row for row in stored if row['key'] == 'stored_value')
        require(invalid.get('error'), 'Earlier stored value has no service error')
        browser, view = settings_browser(fixture)
        row = view.locator('.ks-row').filter(has_text='stored_value')
        expect(row.get_by_role('alert')).to_have_text(invalid['error'])
        expect(row).to_have_class(re.compile('ks-row-invalid'))
        browser.screenshot('settings-stored-error')
        row.get_by_role('button', name='Reset to default', exact=True).click()
        expect(row.get_by_role('alert')).to_have_count(0)
        expect(row.locator('input')).to_have_value('5')
        expect(row.get_by_role('button', name='Reset to default', exact=True)).to_have_count(0)
        browser.screenshot('settings-stored-error-reset')


REGISTRY.extend([
    Scenario('settings_array_json_browser', 'regression', array_settings_browser,
             ('boot',), instance_setup=True, issues=('SETTINGS-STRUCTURED-SCHEMA-VALIDATION', 'SMOKE-SETTINGS-FIXTURE-BOOT-ORDER')),
    Scenario('settings_object_json_browser', 'regression', object_settings_browser,
             ('boot',), instance_setup=True, issues=('SETTINGS-STRUCTURED-SCHEMA-VALIDATION',)),
    Scenario('settings_stored_error_browser', 'regression', stored_settings_error_browser,
             ('boot',), instance_setup=True, issues=('SETTINGS-STORED-ROW-ERROR',)),
])
