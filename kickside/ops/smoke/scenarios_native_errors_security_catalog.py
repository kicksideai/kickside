"""Native catalog failures survive the Security library, contract and HTTP boundary."""
from pathlib import Path
import shutil
from urllib.parse import urlencode

import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test

HERE = Path(__file__).resolve().parent
NAMESPACE = 'app.smoke.native_errors_security_catalog'


def install_catalog_fixture(ctx):
    inst = ctx.inst
    with ctx.paused():
        fixture = inst.app / 'src' / 'native-errors-security-catalog'
        fixture.mkdir(exist_ok=True)
        shutil.copyfile(HERE / 'mocks/native_errors_security/catalog_fixture.lua', fixture / 'catalog_fixture.lua')
        entries = []
        for name, method in (('seed', 'POST'), ('read', 'GET'), ('clear', 'DELETE')):
            entries.extend([
                {'name': name, 'kind': 'function.lua', 'source': 'file://catalog_fixture.lua',
                 'method': name, 'modules': ['http', 'sql', 'uuid']},
                {'name': name + '.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
                 'method': method, 'path': '/native-errors-security-catalog/' + name,
                 'func': NAMESPACE + ':' + name},
            ])
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))
    ctx.restart()


def security_catalog_errors(ctx):
    install_catalog_fixture(ctx)
    inst = ctx.inst
    for raw in ('{', 'false', '7', '"text"', 'null'):
        seeded = inst.request('POST', '/api/v1/native-errors-security-catalog/seed?' + urlencode({'policies': raw}),
                              label='native-security-catalog-seed')
        slug = seeded['slug']
        clear_path = '/api/v1/native-errors-security-catalog/clear?' + urlencode({'slug': slug})
        inst.cleanup.add('native catalog ' + slug, lambda path=clear_path: inst.request('DELETE', path))
        try:
            failure = inst.request('GET', '/api/v1/security/scopes', expect=(500,),
                                   label='native-security-catalog-error')
            require(failure.get('success') is False, 'Corrupt scope catalog reports success')
            require(isinstance(failure.get('error'), str), 'Catalog failure loses its error string')
            require(failure.get('kind') == 'Internal', 'Catalog failure loses its native kind')
            require(failure.get('retryable') is False, 'Corrupt persisted policies remain retryable')
            details = failure.get('details') or {}
            require(details.get('code') == 'persisted_data' and
                    details.get('field') == 'kickside_security_scopes.policies',
                    'Catalog failure loses persisted-data details')
            stored = inst.request('GET', '/api/v1/native-errors-security-catalog/read?' + urlencode({'slug': slug}),
                                  label='native-security-catalog-stored')
            require(stored['rows'][0]['policies'] == raw and stored['rows'][0]['updated_at'] == 'before',
                    'Catalog failure rewrites stored policies or timestamp')
        finally:
            inst.request('DELETE', clear_path, label='native-security-catalog-clear')
        healthy = inst.request('GET', '/api/v1/security/scopes', label='native-security-catalog-restored')
        require(healthy.get('success') is True and isinstance(healthy.get('scopes'), list),
                'Healthy scope catalog loses its published shape')
    run_focused_module_test(ctx, 'kickside/security', 'catalog_native_failure_test')
    run_focused_module_test(ctx, 'kickside/security', 'scope_catalog_test')


def security_catalog_browser(ctx):
    from playwright.sync_api import expect
    from runtime_fixtures import complete_splashes
    from scenarios_core import system

    install_catalog_fixture(ctx)
    inst = ctx.inst
    complete_splashes(ctx, 'welcome', 'first_agent')
    browser = ctx.browser_check()
    browser.login()
    import uuid
    path = '/api/v1/threads/' + str(uuid.uuid4())
    with browser.rejection('GET', path, 404) as response:
        browser.page.evaluate("""async path => {
            const session = JSON.parse(localStorage.getItem('@wippy_token_info'));
            const response = await fetch(path, {headers: {Authorization: 'Bearer ' + session.token}});
            return {status: response.status, body: await response.json()};
        }""", path)
    missing = response.value.json()
    require(missing.get('success') is False and missing.get('kind') == 'NotFound' and
            missing.get('retryable') is False and
            (missing.get('details') or {}).get('code') == 'core_http_thread_not_found',
            'Actual browser Core response loses its native missing-thread envelope')
    require(isinstance(missing.get('error'), str) and missing['error'],
            'Actual browser Core response loses its original error string')
    inst.evidence.save('native-core-browser-missing-thread', missing)
    system(ctx, 'Security')
    panel = browser.frame.locator('kickside-security')
    refresh = panel.get_by_role('button', name='Refresh', exact=True)
    expect(refresh).to_be_enabled(timeout=30000)
    seeded = inst.request('POST', '/api/v1/native-errors-security-catalog/seed?' + urlencode({'policies': '{'}),
                          label='native-security-catalog-browser-seed')
    clear_path = '/api/v1/native-errors-security-catalog/clear?' + urlencode({'slug': seeded['slug']})
    try:
        with browser.server_failure('GET', '/api/v1/security/scopes', 500) as response:
            refresh.click()
        failure = response.value.json()
        require(failure.get('success') is False and failure.get('kind') == 'Internal' and
                failure.get('retryable') is False and (failure.get('details') or {}).get('code') == 'persisted_data',
                'Browser catalog failure loses its native persisted-data fields')
        expect(panel.locator('.ks-top-notice')).to_contain_text(failure['error'], timeout=30000)
        browser.screenshot('native-security-catalog-visible-error')
    finally:
        inst.request('DELETE', clear_path, label='native-security-catalog-browser-clear')
    refresh.click()
    expect(panel.locator('.ks-top-notice')).to_have_count(0, timeout=30000)
    browser.settle()


REGISTRY = [Scenario('native_errors_security_catalog', 'regression', security_catalog_errors, ('boot',),
                     instance_setup=True, issues=('NE-33', 'NE-233'),
                     features=('kickside/security|http|GET /api/v1/security/scopes',))]
REGISTRY += [Scenario('native_errors_security_catalog_browser', 'regression', security_catalog_browser, ('boot',),
                     instance_setup=True, issues=('NE-33', 'NE-233', 'NE-234'),
                     features=('kickside/security|http|GET /api/v1/security/scopes',))]
