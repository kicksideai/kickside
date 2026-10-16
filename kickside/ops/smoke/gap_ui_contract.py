"""Live configuration and session-list refresh through their declared user surfaces."""
from contextlib import contextmanager
import json
import re
import uuid

from browser import Browser
from harness import require
from scenarios import nav
from module_lifecycle_contract import sync_fixture, receipt
from runtime_fixtures import isolated_fixture


def reconfigure_sync(ctx):
    with isolated_fixture(ctx) as ctx:
        for splash in ('welcome', 'first_agent'):
            ctx.inst.request('POST', '/api/v1/ui/splash/' + splash + '/seen', label='fixture-' + splash)
        inst = ctx.inst
        ctx.browser_check().login()
        for package in ('kickside/webhooks', 'kickside/sync'):
            inst.install(package)
        aid, hook, stored, title = sync_fixture(ctx)
        inst.cleanup.add('UI reconfigured sync', lambda: inst.request('DELETE', '/api/v1/automations/' + aid))
        inst.cleanup.add('UI reconfigure webhook', lambda: inst.request('DELETE', '/api/v1/webhooks/' + hook['webhook_id']))
        before = receipt(ctx, hook, title, '1')
        nav(ctx, 'Automations')
        row = ctx.browser.frame.locator('kickside-automation-manager .kx-row').filter(has_text=title)
        row.get_by_role('button', name='More actions for ' + title, exact=True).click()
        row.get_by_role('menuitem', name='Edit ' + title, exact=True).click()
        manage = ctx.browser.frame.locator('kickside-sync-manage')
        form = manage.locator('[data-test="sync-manage"]')
        form.wait_for(timeout=30000)
        updated = 'Northwind UI reconfigured ' + uuid.uuid4().hex[:8]
        require(manage.locator('[data-test="pl-title"]').input_value() == title, 'Manage UI does not load its saved title')
        manage.locator('[data-test="pl-title"]').fill(updated)
        expression = json.dumps({'title': updated, 'content': 'Northwind UI configuration reaches its drive'})
        manage.locator('kickside-transform-assist [data-test="expr-editor"]').fill(expression)
        with ctx.browser.page.expect_response(lambda r: r.request.method == 'PUT' and '/api/v1/automations/' + aid in r.url) as response:
            manage.get_by_role('button', name='Save', exact=True).click()
        require(response.value.status == 200 and response.value.json().get('success'), 'UI reconfigure does not persist its declaration')
        form.wait_for(state='detached', timeout=30000)
        config = inst.request('GET', '/api/v1/automations/' + aid + '/config', label='ui-reconfigured-config')['config']
        require(config['title'] == updated and config['transform']['expr'] == expression, 'UI reconfigure loses edited fields')
        for key in ('trigger', 'sink_port', 'sink_config'):
            require(config['_portable_input'][key] == stored['_portable_input'][key], 'UI reconfigure changes an unedited field: ' + key)
        after = receipt(ctx, hook, updated, '2', expected=1)
        require(len(after) == 1 and 'reaches its drive' in after[0]['content'], 'Reconfigured drive uses its old transform')
        rows = inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='reconfigured-preserved-data')['items']
        require({r['id'] for r in before}.issubset({r['id'] for r in rows}), 'UI reconfigure loses existing data')

@contextmanager
def mounted_new_session(ctx):
    inst, browser = ctx.inst, ctx.browser_check()
    browser.login()
    nav(ctx, 'Sessions')
    panel = browser.frame.locator('kickside-sessions').first
    panel.locator('.kx-row').first.wait_for(timeout=30000)
    retained = panel.element_handle()
    count = panel.locator('.kx-row').count()
    existing = {s['session_id'] for s in inst.request('GET', '/api/v1/sessions?limit=100', label='session-before-create')['sessions']}
    other = Browser(inst, session=ctx.browser_session)
    session = None
    start = len(browser.frames)
    try:
        other.login()
        other.frame.locator('.sidebar').get_by_text('Agents', exact=True).click()
        agent = inst.request('GET', '/api/v1/user-agents/' + ctx.state['agent'])['agent']
        card = other.frame.locator('kickside-agents .kx-card').filter(has_text=agent['title'])
        card.locator('.kx-card-chat').click()
        other.frame.locator('wippy-chat').get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)
        def created():
            rows = inst.request('GET', '/api/v1/sessions?limit=100', label='session-created')['sessions']
            fresh = [s for s in rows if s['session_id'] not in existing]
            require(len(fresh) <= 1, 'Starting one agent chat creates duplicate durable sessions')
            if fresh:
                require(rows[0]['session_id'] == fresh[0]['session_id'], 'New chat is not the newest session in the declared list')
            return fresh[0] if fresh else None
        session = inst.wait(created, 'New chat persists one session', seconds=30, pump=browser.page.wait_for_timeout)
        inst.wait(lambda: panel.locator('.kx-row').count() == count + 1, 'Mounted session panel reflects creation', seconds=30, pump=browser.page.wait_for_timeout)
        yield inst, browser, panel, retained, session
        other.clean(0)
    finally:
        inst.evidence.save('mounted-session-relay', browser.frames[start:])
        if session:
            inst.request('DELETE', '/api/v1/sessions/delete?session_id=' + session['session_id'], label='fresh-session-cleanup')
        other.close()


def session_freshness(ctx):
    with mounted_new_session(ctx) as (inst, browser, panel, retained, session):
        title = 'Northwind live session ' + uuid.uuid4().hex[:8]
        inst.request('POST', '/api/v1/sessions/rename', {'session_id': session['session_id'], 'title': title}, label='external-session-rename')
        saved = inst.request('GET', '/api/v1/sessions/get?session_id=' + session['session_id'], label='renamed-durable-session')['session']
        require(saved['title'] == title, 'Session rename does not persist its new title')
        row = panel.locator('.kx-row').filter(has_text=title)
        row.wait_for(timeout=30000)
        require(retained.evaluate('el => el.isConnected'), 'Session freshness proof remounts its panel')
        when = row.locator('.kx-row-meta').inner_text()
        require(re.search(r'\b(now|seconds? ago|[0-9]+s ago)\b', when, re.I), 'New Postgres session has a stale relative timestamp: ' + when)
        inst.evidence.save('mounted-session-freshness', {'session_id': session['session_id'], 'title': title, 'row': row.inner_text()})
        renamed = title + ' renamed'
        inst.request('POST', '/api/v1/sessions/rename', {'session_id': session['session_id'], 'title': renamed}, label='second-external-session-rename')
        panel.locator('.kx-name').get_by_text(renamed, exact=True).wait_for(timeout=30000)
        require(retained.evaluate('el => el.isConnected'), 'Rename refresh replaces the mounted panel')
        inst.request('DELETE', '/api/v1/sessions/delete?session_id=' + session['session_id'], label='fresh-session-delete')
        panel.locator('.kx-name').get_by_text(renamed, exact=True).wait_for(state='detached', timeout=30000)


def session_recent_time(ctx):
    with mounted_new_session(ctx) as (inst, browser, panel, retained, session):
        row = panel.locator('.kx-row').first
        when = row.locator('.kx-row-meta').inner_text()
        inst.evidence.save('fresh-session-relative-time', {'session': session, 'rendered': when})
        require(re.search(r'\b(now|seconds? ago|[0-9]+s ago)\b', when, re.I), 'New Postgres session has a stale relative timestamp: ' + when)
        require(retained.evaluate('el => el.isConnected'), 'Relative time proof replaces the mounted panel')
