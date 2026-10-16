"""Read durable teardown state in the scenario's scratch database."""
import sqlite3
import subprocess

from harness import require
from browser import Browser


def count_rows(inst, query, identifier):
    if inst.engine == 'sqlite':
        with sqlite3.connect('file:' + str(inst.root / 'data' / 'app.db') + '?mode=ro', uri=True) as db:
            return db.execute(query.format('?'), (identifier,)).fetchone()[0]
    pg = inst.config['pg']
    result = subprocess.run(['psql', '-h', pg['host'], '-p', pg['port'], '-U', pg['user'],
        '-d', inst.db, '-v', 'ON_ERROR_STOP=1', '-Atqc',
        query.format("'" + identifier.replace("'", "''") + "'")],
        env=inst.env, capture_output=True, text=True, timeout=35)
    require(result.returncode == 0, 'Cleanup proof query fails: ' + inst.redactor.text(result.stderr))
    return int(result.stdout.strip())


def workflow_publication_ready(inst, workflow_id):
    return count_rows(inst, "SELECT COUNT(*) FROM workflow_runs WHERE workflow_id={} AND "
        "(status NOT IN ('completed','failed','cancelled','terminated') OR terminal_event_pending)", workflow_id) == 0


def delete_workflow(ctx, workflow_id):
    def delete():
        ctx.inst.wait(lambda: workflow_publication_ready(ctx.inst, workflow_id), 'Workflow terminal events publish before deletion')
        ctx.inst.request('DELETE', '/api/v1/workflows/' + workflow_id)
    delete_visible_resource(ctx, delete)


def await_automation_deletion(inst, automation_id, receipt):
    require(isinstance(receipt, dict) and receipt.get('success') is True,
            'Automation deletion fails: ' + str(receipt))
    require(receipt.get('id') == automation_id,
            'Automation deletion returns a different id: ' + str(receipt))
    if receipt.get('deleted') is False or receipt.get('in_progress') is True or receipt.get('cleanup_pending') is True:
        details = receipt.get('details')
        require(receipt.get('in_progress') is True and receipt.get('cleanup_pending') is True and
                receipt.get('retryable') is True and isinstance(details, dict) and
                (details.get('needs_continue') is True or
                 isinstance(details.get('wait_for'), str) and details['wait_for']),
                'Automation deletion has no declared completion progress: ' + str(receipt))

    def completed():
        listing = inst.request('GET', '/api/v1/automations')
        automations = listing.get('automations') if isinstance(listing, dict) else None
        require(isinstance(automations, list), 'Automation listing has no automations: ' + str(listing))
        return listing if all(item.get('id') != automation_id for item in automations) else None

    completed_listing = inst.wait(completed, 'Automation deletion completes')
    require(completed_listing is not None, 'Automation deletion does not complete')


def own_automation(inst, automation_id):
    def cleanup():
        receipt = inst.request('DELETE', '/api/v1/automations/' + automation_id,
                               label='owned-automation-delete')
        await_automation_deletion(inst, automation_id, receipt)
        inst.cleanup.remove(cleanup)

    return inst.cleanup.add('Automation ' + automation_id, cleanup, scope='scenario')


def cleanup_rows(inst, identifier, *, knowledge=False):
    tables = {'kickside_components': 'component_id', 'kickside_thread': 'id',
              'kickside_projection': 'thread_id', 'kickside_projection_cursor': 'thread_id',
              'kickside_component_thread_reap': 'component_id'}
    if knowledge:
        tables['kb10_stores'] = 'component_id'
    counts = {}
    for table, column in tables.items():
        query = 'SELECT COUNT(*) FROM ' + table + ' WHERE ' + column + '={}'
        counts[table] = count_rows(inst, query, identifier)
    return counts


def await_cleanup(inst, identifier, *, knowledge=False):
    def completed():
        counts = cleanup_rows(inst, identifier, knowledge=knowledge)
        return counts if all(value == 0 for value in counts.values()) else None
    counts = inst.wait(completed, 'Durable bounded cleanup completes')
    inst.evidence.save('cleanup-completed-' + identifier, counts)


def delete_component(inst, identifier, path, *, knowledge=False):
    if cleanup_rows(inst, identifier, knowledge=knowledge)['kickside_components']:
        inst.request('DELETE', path, expect=(200, 202))
    await_cleanup(inst, identifier, knowledge=knowledge)


def delete_visible_resource(ctx, delete):
    try:
        if ctx.browser is not None:
            ctx.browser.clean(0)
    finally:
        try:
            Browser.release(ctx)
        finally:
            delete()


def delete_visible_component(ctx, identifier, path, *, knowledge=False):
    delete_visible_resource(ctx, lambda: delete_component(ctx.inst, identifier, path, knowledge=knowledge))
