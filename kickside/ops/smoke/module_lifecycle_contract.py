"""Published module lifecycle with live automation data and declared retention."""
from contextlib import contextmanager, nullcontext
import json
from pathlib import Path
import uuid
from urllib.parse import quote

from harness import require
from scenarios import nav
from runtime_fixtures import isolated_fixture

MODULE = 'kickside/sync'
TYPE = 'kickside.sync:sync'
HUB = '/api/v1/keeper/hub/dependencies'


def versions(inst, module=MODULE):
    rows = inst.request('GET', '/api/v1/keeper/hub/versions?module=' + quote(module, safe=''), label='published-versions')['items']
    values = {row['version'] for row in rows}
    stable = [v for v in values if len(v.split('.')) == 3 and all(p.isdigit() for p in v.split('.'))]
    stable.sort(key=lambda v: tuple(map(int, v.split('.'))))
    require(stable, 'Published lifecycle fixture requires a released version')
    return stable


def latest_version(inst):
    return versions(inst)[-1]


def dependency(inst, module=MODULE):
    rows = inst.request('GET', HUB + '?entries=1&migrations=1', label='installed-dependencies')['dependencies']
    matches = [row for row in rows if row['component'] == module]
    require(len(matches) <= 1, 'Module has duplicate root dependencies')
    return matches[0] if matches else None


def install_latest(inst, expected=None, module=MODULE, *, replacement=False, refresh_session=False):
    latest = expected or (None if replacement else versions(inst, module)[-1])
    existing = dependency(inst, module)
    arguments = {'component': module, 'version': '*', 'run_migrations': True}
    if existing:
        arguments['parameters'] = existing['parameters']
    plan = inst.request('POST', HUB + '/plan', arguments, label='install-plan-latest', timeout=120)
    require(not [r for r in plan.get('requirements', []) if r.get('missing') or r.get('invalid')],
        'Published module plan has unresolved requirements: ' + json.dumps(plan))
    if replacement:
        selected = [row for row in plan['graph'] if row['module'] == module]
        require(len(selected) == 1 and selected[0].get('version'),
            'Hub source plan has no unique module version selection')
        latest = selected[0]['version']
    payload = dict(plan['install_payload'], version='*', run_migrations=True)
    result = inst.request('POST', HUB + '/install', payload, label='install-latest', timeout=300)
    require(not [r for r in result.get('execution', []) if r['status'] in ('failed', 'rollback_failed')],
        'Published module lifecycle execution fails: ' + json.dumps(result))
    if refresh_session:
        inst.login()
    dep = dependency(inst, module)
    resolved = {r['module_version'] for r in dep['entries'] if r['module'] == module}
    require(dep['version'] == '*', 'Module lifecycle pins its dependency declaration')
    require(resolved == {latest}, 'Hub module selection ' + latest + ' resolves to ' + str(sorted(resolved)))
    inst.await_keeper()
    return dep


def update_source(ctx, source, module=MODULE, *, live=False, refresh_session=False, replacements=None, installer=None):
    import yaml
    from browser import Browser
    inst = ctx.inst
    require(Path(source).is_dir(), 'Module update has no local source tree')
    process = inst.process if live else None
    if live:
        require(process is not None and process.poll() is None, 'Live module update has no running runtime')
    lifecycle = nullcontext() if live else Browser.paused(inst, [ctx], lambda context, operation: operation(context))
    with lifecycle:
        selected_sources = dict(replacements or {}, **{module: source})
        config_path = inst.app / '.wippy.yaml'
        config = yaml.safe_load(config_path.read_text())
        config.setdefault('workspace', {}).setdefault('replacements', {}).update(selected_sources)
        config_path.write_text(yaml.safe_dump(config, sort_keys=False))
        inst.config['replace'] = dict(inst.config['replace'], **selected_sources)
        inst.resolve_dependencies(modules=tuple(selected_sources))
    install = install_latest if installer is None else installer
    dep = install(inst, module=module, replacement=True, refresh_session=refresh_session)
    resolved = {row['module_version'] for row in dep['entries'] if row['module'] == module}
    require(len(resolved) == 1, 'Local source applied ownership has no unique Hub module selection')
    selected = {'name': module, 'version': resolved.pop()}
    replacements = yaml.safe_load(config_path.read_text())['workspace']['replacements']
    require(replacements[module] == source, 'Module source replacement differs from its declared tree')
    inst.evidence.save('local-update-selection', {'dependency': dep, 'selection': selected,
        'replacement': {'from': module, 'to': replacements[module]}})
    inst.manifest()
    if live:
        require(inst.process is process and process.poll() is None, 'Live module update restarts or stops the runtime')


@contextmanager
def published_fixture(ctx, module=MODULE, *, published_app=False, prepare=None):
    config = dict(ctx.inst.config, replace={k: v for k, v in ctx.inst.config['replace'].items() if k != module})
    if published_app:
        config.update(source=None, published='latest', replace={})
    with isolated_fixture(ctx, config=config, prepare=prepare) as fixture:
        for splash in ('welcome', 'first_agent'):
            fixture.inst.request('POST', '/api/v1/ui/splash/' + splash + '/seen', label='fixture-' + splash)
        fixture.browser_check().login()
        yield fixture


def sync_fixture(ctx, *, auth=None):
    inst = ctx.inst
    for module in ('kickside/automation', 'kickside/inbox', 'kickside/webhooks', 'chestor/workspace'):
        inst.install(module)
    automations = inst.request('GET', '/api/v1/automations', auth=auth, label='fixture-automation-baseline')['automations']
    require(not [r for r in automations if r['type'] == TYPE], 'Published lifecycle fixture starts with live Sync data')
    title = 'Northwind module retention ' + uuid.uuid4().hex[:8]
    hook = inst.request('POST', '/api/v1/webhooks', {'label': title,
        'schema': {'type': 'object', 'required': ['product'], 'properties': {'product': {'type': 'string'}}}}, auth=auth, label='retention-hook')['webhook']
    inst.redactor.add(hook['secret'])
    spec = {'title': title, 'enabled': True,
        'trigger': {'v': 2, 'source': 'kickside.webhooks:webhook_received', 'config': {'thread_id': hook['thread_id']}, 'backfill': 'none'},
        'sink_port': 'kickside.inbox.sink:inbox_item', 'sink_config': {},
        'transform': {'kind': 'expr', 'expr': json.dumps({'title': title, 'content': 'Northwind preserved warehouse data'})}}
    aid = inst.request('POST', '/api/v1/automations', {'type': TYPE, 'input': spec}, auth=auth, label='retention-sync')['id']
    stored = inst.request('GET', '/api/v1/automations/' + aid + '/config', auth=auth, label='retention-config')['config']
    return aid, hook, stored, title


def receipt(ctx, hook, title, key, expected=None):
    inst = ctx.inst
    inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], {'product': 'Northwind tea'},
        auth=hook['secret'], expect=(202,), headers={'Idempotency-Key': key}, label='retention-delivery-' + key)
    def delivered():
        rows = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='retention-receipts')['items']
        matches = [r for r in rows if r['title'] == title]
        return matches if len(matches) >= (int(key) if expected is None else expected) else None
    return inst.wait(delivered, 'Published sync delivers after module mutation', seconds=60)


def type_menu(ctx, present):
    types = ctx.inst.request('GET', '/api/v1/automations/types', label='live-type-catalog')['types']
    require(any(r['id'] == TYPE for r in types) is present, 'Automation type catalog differs from live module installation')
    nav(ctx, 'Automations')
    ctx.browser.frame.get_by_role('button', name='Add automation', exact=True).first.click()
    dialog = ctx.browser.frame.get_by_role('dialog', name='Add an automation', exact=True)
    dialog.wait_for(timeout=30000)
    require(('Data Sync' in dialog.locator('.kx-cat-name').all_text_contents()) is present,
        'Automation creation menu differs from live module installation')
    dialog.get_by_role('button', name='Cancel', exact=True).click()


def module_uninstall(ctx):
    with published_fixture(ctx) as fixture:
        inst = fixture.inst
        current = latest_version(inst)
        dep = install_latest(inst, current)
        aid, hook, stored, title = sync_fixture(fixture)
        before = receipt(fixture, hook, title, '1')
        type_menu(fixture, True)
        preview = inst.request('POST', HUB + '/uninstall', {'id': dep['id'], 'component': MODULE,
            'dry_run': True, 'migration_policy': 'leave'}, label='uninstall-preview', timeout=120)['preview']
        require(any(r.get('name') == MODULE or r.get('component') == MODULE for r in preview['removed']),
            'Uninstall plan does not declare module teardown: ' + json.dumps(preview))
        require(dependency(inst), 'Uninstall preview mutates installation')
        inst.request('POST', HUB + '/uninstall', {'id': dep['id'], 'component': MODULE,
            'migration_policy': 'leave'}, label='uninstall-live', timeout=300)
        inst.await_keeper()
        require(dependency(inst) is None, 'Uninstalled module remains installed')
        fixture.browser.reload()
        type_menu(fixture, False)
        kinds = inst.request('GET', '/api/v1/workspace/entries/types', label='removed-workspace-type')['types']
        require(TYPE not in json.dumps(kinds), 'Uninstalled module keeps its workspace creation type')
        listed = inst.request('GET', '/api/v1/automations', label='unavailable-automation-list')['automations']
        rows = [r for r in listed if r['id'] == aid]
        require(len(rows) == 1 and rows[0].get('availability', {}).get('code') == 'unavailable',
            'Existing automation loses its typed unavailable state after module removal: ' + json.dumps(listed))
        row = fixture.browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
        require('Unavailable' in row.inner_text() and 'Reinstall its module' in row.inner_text(),
            'Removed automation module does not explain its unavailable state in the UI')
        install_latest(inst, current)
        fixture.browser.reload()
        type_menu(fixture, True)
        require(inst.request('GET', '/api/v1/automations/' + aid + '/config', label='reinstalled-config')['config'] == stored,
            'Leave-data uninstall/reinstall changes the automation declaration')
        rows = receipt(fixture, hook, title, '2')
        require({r['id'] for r in before}.issubset({r['id'] for r in rows}), 'Reinstall loses existing sink data')


def module_update(ctx):
    with published_fixture(ctx) as fixture:
        inst = fixture.inst
        current = latest_version(inst)
        baseline = install_latest(inst, current)
        inst.evidence.save('published-update-baseline', {'version': current, 'dependency': baseline})
        aid, hook, stored, title = sync_fixture(fixture)
        before = receipt(fixture, hook, title, '1')
        source = ctx.inst.config['replace'].get(MODULE)
        if not source and ctx.inst.config.get('source'):
            source = str(Path(ctx.inst.config['source']) / 'platform' / 'sync')
        require(source, 'Module update requires a local source replacement')
        update_source(fixture, source)
        require(inst.request('GET', '/api/v1/automations/' + aid + '/config', label='updated-config')['config'] == stored,
            'Published module update changes the installed automation declaration')
        rows = receipt(fixture, hook, title, '2')
        require({r['id'] for r in before}.issubset({r['id'] for r in rows}), 'Module update loses existing sink data')
        type_menu(fixture, True)
        row = fixture.browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
        row.get_by_role('button', name='More actions for ' + title, exact=True).click()
        row.get_by_role('menuitem', name='Edit ' + title, exact=True).click()
        manage = fixture.browser.frame.locator('kickside-sync-manage')
        manage.locator('[data-test="sync-manage"]').wait_for(timeout=30000)
        require(manage.locator('[data-test="pl-title"]').input_value() == title, 'Updated module bundle loses the persisted config')
        manage.get_by_role('button', name='Cancel', exact=True).click()
