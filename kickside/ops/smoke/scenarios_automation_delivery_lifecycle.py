"""Event deliveries preserve their cursor across slot loss and retire settled mappings."""
from contextlib import contextmanager
import uuid

from harness import Scenario, require
from live_work_gate import work_gate
from runtime_fixtures import isolated_fixture
from scenarios_hot_update_work import install_work_fixture, active_automation, database_rows


@contextmanager
def delivery_fixture(ctx):
    with work_gate() as (gate, url), isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
            inst.install(module)
        with fixture.paused():
            install_work_fixture(fixture, url)
        hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Event delivery lifecycle',
            'schema': {'type': 'object', 'properties': {'marker': {'type': 'string'}}}},
            label='delivery-webhook')['webhook']
        inst.redactor.add(hook['secret'])
        title = 'Event receipt ' + uuid.uuid4().hex[:12]
        gate.release()
        aid = active_automation(fixture, url, title, hook=hook)
        inst.wait(lambda: len(inbox(inst, title)) == 1 and gate.snapshot().get('automation', {}).get('effects') == 1,
                  'Initial event creates one real Inbox destination', seconds=60)
        yield fixture, gate, hook, aid, title


def inbox(inst, title):
    return [row for row in inst.request('GET', '/api/v1/inbox?status=all&limit=200', label='delivery-inbox')['items']
            if row['title'] == title]


def drives(inst, aid):
    return database_rows(inst, "SELECT drive_key, job_id, cursor, event_seq, round_token, wake_generation, "
                         "wake_applied_generation FROM kickside_automation_drive WHERE automation_id='" + aid + "'")


def send(inst, hook, marker):
    inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], {'marker': marker},
                 auth=hook['secret'], expect=(202,), headers={'Idempotency-Key': marker}, label='next-source-event')


def missing_slot(ctx):
    with delivery_fixture(ctx) as (fixture, gate, hook, aid, title):
        inst = fixture.inst
        before = inst.wait(lambda: (lambda rows: rows if len(rows) == 1 and rows[0]['job_id']
            and rows[0]['round_token'] is None else None)(drives(inst, aid)), 'Initial round releases its slot', seconds=60)
        original = before[0]
        first_item = inbox(inst, title)[0]['id']
        with fixture.paused():
            database_rows(inst, "DELETE FROM kickside_job WHERE id='" + original['job_id'] + "' RETURNING id", write=True)
            retained = drives(inst, aid)
            require(retained[0]['job_id'] == original['job_id'] and retained[0]['event_seq'] == original['event_seq'],
                    'Missing-job fixture changes the stored source position')
        send(inst, hook, 'retained-backlog-' + uuid.uuid4().hex)
        accepted = inst.request('POST', '/api/v1/automations/' + aid + '/control',
                                {'control': 'run_now', 'request_id': uuid.uuid4().hex}, label='stale-slot-run-now')
        inst.evidence.save('missing-slot-before-dispatch', {'before': before, 'retained': retained, 'accepted': accepted})
        try:
            inst.wait(lambda: len(inbox(inst, title)) == 2, 'Accepted run_now drains the next source event', seconds=60)
            after = drives(inst, aid)
            items = inbox(inst, title)
            require(after[0]['job_id'] and after[0]['job_id'] != original['job_id']
                    and after[0]['event_seq'] > original['event_seq'], 'Dispatcher does not provision and advance its slot')
            require(first_item in {row['id'] for row in items} and gate.snapshot()['automation']['effects'] == 2,
                    'Slot provisioning replays an already delivered event')
        finally:
            inst.evidence.save('missing-slot-after-dispatch', {
                'drives': drives(inst, aid), 'items': inbox(inst, title), 'effects': gate.snapshot(),
                'status': inst.request('GET', '/api/v1/automations/' + aid + '/status')})


def settled_mapping(ctx):
    with delivery_fixture(ctx) as (fixture, gate, hook, aid, title):
        inst = fixture.inst
        query = "SELECT item_key, dest_ref_json, updated_at FROM kickside_automation_receipt WHERE owner_id='" + aid + "'"
        before = inst.wait(lambda: (lambda rows: rows if len(rows) == 1 and rows[0]['dest_ref_json'] else None)(
            database_rows(inst, query)), 'Event delivery commits its mapped receipt', seconds=60)
        original_item = inbox(inst, title)[0]['id']
        aged_key = before[0]['item_key']
        database_rows(inst, "UPDATE kickside_automation_receipt SET updated_at='2000-01-01T00:00:00Z' "
                      "WHERE owner_id='" + aid + "' RETURNING item_key", write=True)
        send(inst, hook, 'recent-event-' + uuid.uuid4().hex)
        inst.request('POST', '/api/v1/automations/' + aid + '/control',
                     {'control': 'run_now', 'request_id': uuid.uuid4().hex}, label='receipt-retention-demand')
        inst.wait(lambda: len(inbox(inst, title)) == 2, 'A second source event delivers independently', seconds=60)
        try:
            inst.wait(lambda: not any(row['item_key'] == aged_key for row in database_rows(inst, query)),
                      'Existing dispatcher retires the aged settled event mapping', seconds=60)
            remaining = database_rows(inst, query)
            require(len(remaining) == 1 and remaining[0]['dest_ref_json'],
                    'Receipt retention removes the recent delivery mapping')
            require(original_item in {row['id'] for row in inbox(inst, title)},
                    'Receipt retirement removes its remote destination')
        finally:
            inst.evidence.save('settled-event-mapping-retention', {
                'before': before, 'remaining': database_rows(inst, query),
                'items': inbox(inst, title), 'drives': drives(inst, aid), 'effects': gate.snapshot()})


REGISTRY = [
    Scenario('automation_missing_slot_event_delivery', 'regression', missing_slot,
             issues=('AUTOMATION-UNSERVED-WAKE', 'AUTOMATION-STALE-SLOT-REFERENCE'), features=(
                 'kickside/automation|http|POST /api/v1/automations/{id}/control',
                 'kickside/automation|http|GET /api/v1/automations/{id}/status',)),
    Scenario('automation_settled_mapping_delivery', 'regression', settled_mapping,
             issues=('AUTOMATION-SETTLED-EVENT-RECEIPT-RETENTION',), features=(
                 'kickside/automation|http|POST /api/v1/automations/{id}/control',
                 'kickside/inbox|http|GET /api/v1/inbox',)),
]
