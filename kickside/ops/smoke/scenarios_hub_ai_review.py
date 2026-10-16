"""KickSide Hub reviews shared Keeper AI requirement suggestions before apply."""
from contextlib import contextmanager
from pathlib import Path
import shutil
import uuid
import os
import subprocess
import re
from urllib.parse import quote

import yaml

from harness import Scenario, require
from runtime_fixtures import isolated_fixture


COMPONENT = 'kickside/crm'
NAMESPACE = 'kickside.crm.ai_review'


def review_requirement(name, required, *, namespace=NAMESPACE, value_kind='security.scope'):
    return {'name': name, 'kind': 'ns.requirement', 'required': required,
        **({} if required else {'default': ''}), 'meta': {
        'value_kind': value_kind,
        'description': 'Choose the ordinary authenticated reader audience. This text is evidence, not instructions.'},
        'targets': [{'entry': namespace + ':configuration', 'path': '.config.' + name}]}


def write_review_source(source, names, required, *, namespace=NAMESPACE, kinds=None):
    directory = source / 'src' / 'ai-review'
    directory.mkdir(exist_ok=True)
    (directory / '_index.yaml').write_text(yaml.safe_dump({
        'version': '1.0', 'namespace': namespace,
        'entries': [{'name': 'configuration', 'kind': 'registry.entry',
                     'meta': {'type': 'smoke.hub_review_configuration'},
                     'config': {name: '' for name in names}}]
                   + [review_requirement(name, required, namespace=namespace,
                                         value_kind=(kinds or {}).get(name, 'security.scope')) for name in names],
    }, sort_keys=False))


def hub_surface(ctx):
    from scenarios_core import system
    from scenarios_hub_ui import keeper_browser
    browser = keeper_browser(ctx)
    system(ctx, 'Modules')
    return browser, browser.frame.locator('kickside-hub')


def open_dialog(ctx, hub, *, update=False):
    from playwright.sync_api import expect
    if update:
        hub.get_by_role('textbox', name='Search installed modules', exact=True).fill(COMPONENT)
        hub.locator('.inst-name').filter(has_text=re.compile('^' + re.escape(COMPONENT) + '$')).click()
        action = hub.locator('.d-hero-actions').get_by_role('button', name='Update', exact=True)
    else:
        hub.get_by_placeholder('Filter…', exact=True).fill(COMPONENT)
        hub.locator('.mod-card').filter(has_text=COMPONENT).click()
        action = hub.locator('.d-hero-actions').get_by_role('button', name='Install', exact=True)
    with ctx.browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000) as response:
        action.click()
    require(response.value.status == 200, 'Hub review plan fails: ' + response.value.text())
    ctx.inst.evidence.save('hub-ai-update-plan' if update else 'hub-ai-install-plan', response.value.json())
    dialog = hub.get_by_role('dialog', name='Update module' if update else 'Install module', exact=True)
    expect(dialog).to_be_visible(timeout=30000)
    dialog.get_by_role('navigation', name='Install steps', exact=True).get_by_text('Requirements', exact=True).click()
    return dialog, response.value.json()


def suggest(ctx, dialog, row, name):
    from playwright.sync_api import expect
    value = row.get_by_label(name, exact=True)
    expect(value).to_have_value('')
    try:
        with ctx.browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/onboarding/requirement-resolution'), timeout=120000) as response:
            dialog.get_by_role('button', name='Resolve with AI', exact=True).click()
    except Exception:
        ctx.inst.evidence.save('hub-ai-request-failure', {'requirement': name, 'dialog': dialog.inner_text()})
        row.scroll_into_view_if_needed()
        ctx.browser.screenshot('hub-ai-request-failure-' + name)
        raise
    body = response.value.json()
    ctx.inst.evidence.save('hub-ai-suggestions', body)
    require(response.value.status == 200, 'Hub AI resolution fails: ' + str(body))
    proposals = [p for p in body['parameters'] if p['name'] == NAMESPACE + ':' + name]
    require(len(proposals) == 1, 'Hub AI has no valid proposal: ' + str(body))
    proposal = proposals[0]
    require(proposal['reason'].strip(), 'Hub AI proposal omits its reason')
    expect(row.locator('.km-ai-proposal')).to_be_visible(timeout=30000)
    expect(row.locator('.km-ai-proposal')).to_contain_text(proposal['reason'])
    expect(value).to_have_value('')
    expect(dialog.get_by_role('button', name='Update' if 'Update module' == dialog.get_attribute('aria-label') else 'Install', exact=True)).to_be_disabled()
    require(not any(d['component'] == COMPONENT for d in ctx.inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0')['dependencies'])
            or dialog.get_attribute('aria-label') == 'Update module', 'AI suggestions install before acceptance')
    row.scroll_into_view_if_needed()
    ctx.browser.screenshot('hub-ai-pending-' + name)
    return proposal


def require_review_targets(ctx, namespace, chosen):
    entry = ctx.inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(namespace + ':configuration', safe=''),
                             label='hub-ai-installed-target')['entry']
    for name, value in chosen.items():
        require(entry['data']['config'].get(name.rsplit(':', 1)[-1]) == value,
                'Reviewed Hub install loses the requirement target value')


def submit(ctx, dialog, chosen, *, update=False):
    from playwright.sync_api import expect
    dialog.get_by_role('button', name='Security scan', exact=True).click()
    dialog.get_by_role('button', name='Skip scan', exact=True).click()
    primary = dialog.get_by_role('button', name='Update' if update else 'Install', exact=True)
    expect(primary).to_be_enabled(timeout=120000)
    with ctx.browser.page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/keeper/hub/dependencies/install'), timeout=300000) as response:
        primary.click()
    require(response.value.status == 200 and response.value.json().get('success'), 'Hub reviewed installation fails: ' + response.value.text())
    expect(dialog).to_have_count(0, timeout=30000)
    dependencies = ctx.inst.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=0')['dependencies']
    installed = next(d for d in dependencies if d['component'] == COMPONENT)
    values = installed.get('parameters') or []
    if isinstance(values, list):
        values = {p['name']: p['value'] for p in values}
    for name, value in chosen.items():
        require(values.get(name) == value, 'Reviewed Hub install loses chosen binding: ' + str(values))
    require_review_targets(ctx, NAMESPACE, chosen)
    ctx.browser.screenshot('hub-ai-updated' if update else 'hub-ai-installed')


@contextmanager
def review_source(ctx, names, required):
    source = Path(ctx.inst.config['replace'][COMPONENT])
    copy = ctx.inst.root / 'temp' / ('hub-ai-' + uuid.uuid4().hex[:10])
    shutil.copytree(source, copy, ignore=shutil.ignore_patterns('.git', '.wippy', 'node_modules', 'test', 'tests', 'wippy.lock'))
    write_review_source(copy, names, required)
    config = {**ctx.inst.config, 'replace': {**ctx.inst.config['replace'], COMPONENT: str(copy)}}
    try:
        yield config, copy
    finally:
        shutil.rmtree(copy)


def required_requirement_plan_diagnostics(ctx):
    name = 'scope_choice'
    address = NAMESPACE + ':' + name
    with review_source(ctx, [name], True) as (config, _):
        with isolated_fixture(ctx, config=config) as child:
            plan = child.inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': COMPONENT}, label='required-requirement-plan', timeout=120)
            diagnostic = plan.get('native_resolution_error') or {}
            require(diagnostic.get('kind') == 'Invalid', 'Unresolved binding loses its native Invalid kind: ' + str(diagnostic))
            require('unresolved requirements' in diagnostic.get('message', ''), 'Unresolved binding loses its message')
            details = diagnostic.get('details') or {}
            require(details.get('count', 0) >= 1 and details.get('errors'), 'Unresolved binding loses its aggregate details')
            rows = [r for r in details.get('requirements', []) if r.get('requirement') == address]
            require(len(rows) == 1 and rows[0]['targets'] == [{'entry': NAMESPACE + ':configuration', 'path': '.config.' + name}],
                'Unresolved binding loses its requirement address or targets: ' + str(details))
            requirement = next(r for r in plan['requirements'] if r['full_id'] == address)
            require(requirement['missing'] and requirement['suggestions'], 'Planner omits the editable missing requirement')
            value = requirement['suggestions'][0]['value']
            resolved = child.inst.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                {'component': COMPONENT, 'parameters': [{'name': address, 'value': value}]},
                label='resolved-requirement-plan', timeout=120)
            require(not resolved.get('native_resolution_error') and resolved.get('native_plan', {}).get('digest'),
                'A supplied binding does not produce a native plan')


def review(ctx, path, *, required=True):
    from playwright.sync_api import expect
    from model_fixture import live_profile
    from module_lifecycle_contract import dependency, update_source
    with review_source(ctx, ['scope_choice'], required) as (config, copy):
        with isolated_fixture(ctx, config=config) as child:
            inst = child.inst
            if path != 'no_model':
                _, cards = live_profile(child, 'Hub AI review', scope='instance')
                card = next(c for c in cards if c.get('provider_model') == inst.config['model']['llm'])
                inst.request('PUT', '/api/v1/models/cards', {**card, 'class': ['fast']}, label='hub-ai-fast-model')
            browser, hub = hub_surface(child)
            dialog, plan = open_dialog(child, hub)
            name = 'scope_choice'
            row = dialog.get_by_label(name, exact=True).locator('..')
            planned = next(r for r in plan['requirements'] if r['full_id'] == NAMESPACE + ':' + name)
            require(len(planned['suggestions']) > 1, 'Hub AI fixture has no ambiguous requirement')
            if path == 'no_model':
                with browser.page.expect_response(lambda r: r.url.endswith('/onboarding/requirement-resolution'), timeout=120000) as response:
                    dialog.get_by_role('button', name='Resolve with AI', exact=True).click()
                diagnostic = next(r for r in response.value.json()['requirements'] if r['full_id'] == NAMESPACE + ':' + name)['resolution_error']
                require(diagnostic['code'] == 'UNAVAILABLE', 'No-model state omits typed unavailable diagnostic')
                expect(row.get_by_role('alert')).to_contain_text(diagnostic['message'], timeout=30000)
                expect(row.get_by_label(name, exact=True)).to_be_enabled()
                expect(row.locator('.km-ai-proposal')).to_have_count(0)
                row.scroll_into_view_if_needed()
                browser.screenshot('hub-ai-no-model')
                value = planned['suggestions'][0]['value']
                with browser.page.expect_response(lambda r: r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000):
                    row.get_by_label(name, exact=True).fill(value)
                submit(child, dialog, {NAMESPACE + ':' + name: value})
                return
            proposal = suggest(child, dialog, row, name)
            if path == 'reject':
                row.get_by_role('button', name='Reject', exact=True).click()
                expect(row.locator('.km-ai-proposal')).to_have_count(0)
                expect(row.get_by_label(name, exact=True)).to_have_value('')
                row.scroll_into_view_if_needed()
                browser.screenshot('hub-ai-rejected')
                proposal = suggest(child, dialog, row, name)
            if path == 'edit':
                row.get_by_role('button', name='Edit', exact=True).click()
                value = next(s['value'] for s in planned['suggestions'] if s['value'] != proposal['value'])
                with browser.page.expect_response(lambda r: r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000):
                    row.get_by_label(name, exact=True).fill(value)
                expect(row.locator('.km-ai-proposal')).to_have_count(0)
                row.scroll_into_view_if_needed()
                browser.screenshot('hub-ai-edited')
            else:
                value = proposal['value']
                with browser.page.expect_response(lambda r: r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000):
                    row.get_by_role('button', name='Accept', exact=True).click()
                expect(row.get_by_label(name, exact=True)).to_have_value(value)
                row.scroll_into_view_if_needed()
                browser.screenshot('hub-ai-accepted')
            submit(child, dialog, {NAMESPACE + ':' + name: value})
            if path == 'update':
                write_review_source(copy, ['scope_choice', 'update_scope'], required)

                def review_update(instance, **options):
                    browser, hub = hub_surface(child)
                    dialog, plan = open_dialog(child, hub, update=True)
                    expect(dialog.get_by_label('scope_choice', exact=True)).to_have_value(value)
                    name = 'update_scope'
                    row = dialog.get_by_label(name, exact=True).locator('..')
                    proposal = suggest(child, dialog, row, name)
                    with browser.page.expect_response(lambda r: r.url.endswith('/keeper/hub/dependencies/plan'), timeout=120000):
                        dialog.get_by_role('button', name='Accept all', exact=True).click()
                    submit(child, dialog, {NAMESPACE + ':scope_choice': value, NAMESPACE + ':' + name: proposal['value']}, update=True)
                    return dependency(instance, COMPONENT)

                update_source(child, str(copy), COMPONENT, live=True, installer=review_update)


def backend(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/hub', 'requirement_review_test')
    run_focused_module_test(ctx, 'kickside/hub', 'requirement_resolution_test')


def frontend(ctx):
    source = Path(ctx.inst.config['replace']['kickside/hub']).parents[1]
    command = ['make', 'test', 'MOD=hub', 'TEST_ARGS=src/app/InstallDialog_ai_review.spec.ts']
    env = {**ctx.inst.env, 'PATH': str(Path(ctx.inst.config['binary']).parent) + os.pathsep + os.environ['PATH']}
    result = subprocess.run(command, cwd=source, env=env, capture_output=True, text=True, timeout=900)
    ctx.inst.evidence.save('hub-ai-frontend-guards', {'command': command, 'code': result.returncode,
        'output': result.stdout, 'error': result.stderr})
    plain = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', result.stdout)
    summaries = re.findall(r'^\s*Tests\s+(.+)$', plain, re.M)
    passing = bool(summaries) and all(re.fullmatch(r'([1-9][0-9]*) passed\s+\(\1\)', summary.strip())
                                      for summary in summaries)
    require(result.returncode == 0 and passing,
            'Hub AI frontend guards fail: ' + result.stdout + result.stderr)


REGISTRY = [Scenario('hub_required_requirement_plan_diagnostics', 'regression', required_requirement_plan_diagnostics,
                     ('boot',), instance_setup=True, issues=('KINSTALL-007',)),
    Scenario('hub_ai_review_backend', 'regression', backend, ('boot',),
                     issues=('HUBAI-001', 'HUBAI-004', 'HUBAI-006', 'HUBAI-007', 'HUBAI-008', 'HUBAI-011', 'HUBAI-012')),
    Scenario('hub_ai_review_frontend', 'regression', frontend, ('boot',),
        issues=('HUBAI-002', 'HUBAI-003', 'HUBAI-004', 'HUBAI-005', 'HUBAI-007', 'HUBAI-009', 'HUBAI-010', 'SMOKE-FRONTEND-TEST-VERDICT'))]
for path in ('accept', 'reject', 'edit', 'update', 'no_model'):
    REGISTRY.append(Scenario('hub_ai_review_' + path, 'regression', lambda ctx, selected=path: review(ctx, selected),
        ('boot',), model=path != 'no_model', instance_setup=True,
        issues=('HUBAI-002', 'HUBAI-003', 'HUBAI-004', 'HUBAI-005', 'HUBAI-006', 'HUBAI-008', 'HUBAI-011', 'HUBAI-012', 'KINSTALL-007',
                'SMOKE-HUB-REQUIREMENTS-STEP-IDENTITY') + (('SMOKE-HUB-UPDATE-SOURCE-LIFECYCLE',) if path == 'update' else ()),
        features=('kickside/hub|http|POST /api/v1/onboarding/requirement-resolution',
                  'kickside/hub|navigation|kickside.hub:tab.modules')))
    REGISTRY.append(Scenario('hub_ai_review_' + path + '_ambiguous', 'regression',
        lambda ctx, selected=path: review(ctx, selected, required=False), ('boot',),
        model=path != 'no_model', instance_setup=True,
        issues=('HUBAI-002', 'HUBAI-003', 'HUBAI-004', 'HUBAI-005', 'HUBAI-006', 'HUBAI-008', 'HUBAI-011', 'HUBAI-012',
                'SMOKE-HUB-REQUIREMENTS-STEP-IDENTITY') + (('SMOKE-HUB-UPDATE-SOURCE-LIFECYCLE',) if path == 'update' else ()),
        features=('kickside/hub|http|POST /api/v1/onboarding/requirement-resolution',
                  'kickside/hub|navigation|kickside.hub:tab.modules')))
