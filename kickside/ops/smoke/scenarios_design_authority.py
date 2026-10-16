"""Execution authority refreshes before each new automation effect."""
import json
import uuid

from harness import Scenario, require
from module_harness import run_focused_module_test
from live_work_gate import work_gate
from scenarios_deferred_authority import _user
from scenarios_hot_update_work import active_automation, database_rows, install_work_fixture


def live_effect_authority(ctx):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    with work_gate() as (gate, url):
        with ctx.paused():
            install_work_fixture(ctx, url)
        suffix = uuid.uuid4().hex[:12]
        user, token = _user(inst, suffix, 'effect-authorizer', ['app.security:user', 'app.security:admin'])
        original = inst.token
        try:
            inst.token = token
            aid = active_automation(ctx, url, 'Authority boundary ' + suffix)
        finally:
            inst.token = original
        inst.wait(lambda: gate.snapshot().get('automation', {}).get('entered') == 1,
                  'First effect reaches its authorized barrier', seconds=60)
        inst.request('PUT', '/api/v1/users/' + user['user_id'], {'status': 'inactive'},
                     label='revoke-authorizer-account-between-effects')
        gate.release()
        def parked():
            rows = database_rows(inst, "SELECT phase,last_error_json FROM kickside_automation_drive WHERE automation_id='" + aid + "' AND drive_key='main'")
            return rows[0] if rows and rows[0]['phase'] in ('blocked_identity', 'blocked_access') else None
        state = inst.wait(parked, 'Revoked authority parks before the destination effect', seconds=60)
        error = json.loads(state['last_error_json'])
        require(error['kind'] == 'PermissionDenied', 'Park loses the typed authority refusal: ' + str(error))
        require(state['phase'] == 'blocked_identity' and error['error_kind'] == 'subject',
                'Inactive authority loses its typed identity park: ' + str(state))
        require(gate.snapshot() == {'automation': {'entered': 1, 'effects': 1}},
                'The authorized in-flight transform is lost or repeated')
        ledger = database_rows(inst, "SELECT state FROM kickside_trigger_item_ledger WHERE owner_id='" + aid + "'")
        require(ledger and all(row['state'] == 'parked' for row in ledger), 'Denied work is discarded or reports an unsent effect')
        prepared = database_rows(inst, "SELECT idempotency_key FROM kickside_automation_prepared WHERE automation_id='" + aid + "'")
        require(len(prepared) == 1, 'Park discards completed preparation')
        receipts = database_rows(inst, "SELECT item_key FROM kickside_automation_receipt WHERE owner_id='" + aid + "'")
        require(receipts == [], 'The destination effect runs after revocation')
        inst.evidence.save('effect-boundary-authority', {'drive': state, 'calls': gate.snapshot(), 'ledger': ledger, 'prepared': prepared})


def live_transform_resource_authority(ctx):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    with work_gate() as (gate, url):
        with ctx.paused():
            install_work_fixture(ctx, url)
        suffix = uuid.uuid4().hex[:12]
        user, token = _user(inst, suffix, 'transform-authorizer', ['app.security:user', 'app.security:admin'])
        hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Resource boundary ' + suffix,
            'schema': {'type': 'object', 'properties': {'marker': {'type': 'string'}}}},
            label='transform-resource-hook')['webhook']
        inst.redactor.add(hook['secret'])
        inst.request('POST', '/api/v1/component-access/share/' + hook['thread_id'],
                     {'subject_type': 'user', 'subject_id': user['user_id'], 'access_mask': 1},
                     label='grant-transform-resource')
        original = inst.token
        try:
            inst.token = token
            aid = active_automation(ctx, url, 'Resource boundary ' + suffix,
                                    hook=hook, enabled=False, deliveries=2)
            inst.request('POST', '/api/v1/automations/' + aid + '/control', {'control': 'resume'},
                         label='admit-two-transform-effects')
        finally:
            inst.token = original
        inst.wait(lambda: gate.snapshot().get('automation', {}).get('entered') == 1,
                  'First transform reaches its authorized barrier', seconds=60)
        inst.request('POST', '/api/v1/component-access/share/' + hook['thread_id'],
                     {'subject_type': 'user', 'subject_id': user['user_id'], 'action': 'revoke'},
                     label='revoke-transform-resource-between-effects')
        gate.release()
        def parked():
            rows = database_rows(inst, "SELECT phase,last_error_json FROM kickside_automation_drive WHERE automation_id='" + aid + "' AND drive_key='main'")
            return rows[0] if rows and rows[0]['phase'] == 'blocked_access' else None
        state = inst.wait(parked, 'Revoked resource parks before the next transform', seconds=60)
        error = json.loads(state['last_error_json'])
        require(error['kind'] == 'PermissionDenied' and error['error_kind'] == 'access',
                'Resource park loses its typed authority refusal: ' + str(error))
        require(gate.snapshot() == {'automation': {'entered': 1, 'effects': 1}},
                'A later transform starts with a revoked resource grant')
        receipts = database_rows(inst, "SELECT item_key FROM kickside_automation_receipt WHERE owner_id='" + aid + "'")
        require(len(receipts) == 1, 'Resource refusal loses the first completed delivery')
        ledger = database_rows(inst, "SELECT state FROM kickside_trigger_item_ledger WHERE owner_id='" + aid + "'")
        require(len(ledger) == 1 and ledger[0]['state'] == 'parked', 'Resource refusal loses the second delivery')
        inst.evidence.save('transform-resource-authority', {'drive': state, 'calls': gate.snapshot(),
                           'ledger': ledger, 'receipts': receipts})


def delivery_identity_provenance(ctx):
    inst = ctx.inst
    for module in ('kickside/sync', 'kickside/webhooks', 'kickside/inbox'):
        inst.install(module)
    with work_gate() as (gate, url):
        with ctx.paused():
            install_work_fixture(ctx, url)
        suffix = uuid.uuid4().hex[:12]
        original, original_token = _user(inst, suffix, 'delivery-original', ['app.security:user', 'app.security:admin'])
        replacement, replacement_token = _user(inst, suffix, 'delivery-replacement', ['app.security:user', 'app.security:admin'])
        admin_token = inst.token
        try:
            inst.token = original_token
            retired_source = inst.request('POST', '/api/v1/webhooks', {'label': 'Retired delivery source ' + suffix,
                'schema': {'type': 'object', 'properties': {'marker': {'type': 'string'}}}},
                label='original-delivery-source')['webhook']
            require(retired_source['actor_id'] == original['user_id'],
                    'Webhook mint does not retain its authenticated source actor')
            inst.redactor.add(retired_source['secret'])
            inst.request('POST', '/api/v1/component-access/share/' + retired_source['thread_id'],
                {'subject_type': 'user', 'subject_id': replacement['user_id'], 'access_mask': 1},
                label='grant-replacement-retired-source-write')
            inst.request('POST', '/api/public/hooks/' + retired_source['webhook_id'], {'marker': 'original-' + suffix},
                auth=retired_source['secret'], expect=(202,), headers={'Idempotency-Key': 'original-' + suffix},
                label='original-source-input')
            original_source_events = database_rows(inst, "SELECT id FROM kickside_event WHERE thread_id='" + retired_source['thread_id'] + "'")
            require(len(original_source_events) == 1, 'Active webhook source does not append its inbound event')
            inst.token = replacement_token
            hook = inst.request('POST', '/api/v1/webhooks', {'label': 'Replacement delivery source ' + suffix,
                'schema': {'type': 'object', 'properties': {'marker': {'type': 'string'}}}},
                label='replacement-delivery-source')['webhook']
            require(hook['actor_id'] == replacement['user_id'],
                    'Replacement webhook does not retain its authenticated source actor')
            inst.redactor.add(hook['secret'])
            inst.request('POST', '/api/v1/component-access/share/' + hook['thread_id'],
                {'subject_type': 'user', 'subject_id': original['user_id'], 'access_mask': 1},
                label='grant-original-replacement-source-write')
            inst.token = original_token
            aid = active_automation(ctx, url, 'Delivery provenance ' + suffix, hook=hook, enabled=False)
            inst.request('POST', '/api/v1/component-access/share/' + aid,
                {'subject_type': 'user', 'subject_id': replacement['user_id'], 'access_mask': 15},
                label='replacement-automation-admin')
            inst.request('POST', '/api/v1/automations/' + aid + '/control', {'control': 'resume'},
                label='admit-original-delivery')
        finally:
            inst.token = admin_token
        inst.wait(lambda: gate.snapshot().get('automation', {}).get('entered') == 1,
                  'Original transform reaches its authorized barrier', seconds=60)
        inst.request('PUT', '/api/v1/users/' + original['user_id'], {'status': 'inactive'},
                     label='revoke-original-delivery-authority')
        gate.release()
        def original_parked():
            rows = database_rows(inst, "SELECT phase FROM kickside_automation_drive WHERE automation_id='" + aid + "' AND drive_key='main'")
            debt = database_rows(inst, "SELECT item_key,state FROM kickside_trigger_item_ledger WHERE owner_id='" + aid + "'")
            return debt[0] if rows and rows[0]['phase'] == 'blocked_identity' and len(debt) == 1 and debt[0]['state'] == 'parked' else None
        debt = inst.wait(original_parked, 'Original prepared delivery parks', seconds=60)
        before = database_rows(inst, "SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared WHERE automation_id='" + aid + "'")
        require(len(before) == 1, 'Original prepared output disappears before identity replacement')
        generation = database_rows(inst, "SELECT identity_generation FROM kickside_components WHERE component_id='" + aid + "'")[0]['identity_generation']
        try:
            inst.token = replacement_token
            changed = inst.request('POST', '/api/v1/automations/' + aid + '/identity',
                {'principal': {'kind': 'user', 'id': replacement['user_id']}, 'request_id': uuid.uuid4().hex,
                 'expected_identity_generation': generation}, label='replace-automation-identity')
            require(changed['state'] == 'succeeded', 'Identity replacement does not finalize')
            refused = inst.request('POST', '/api/public/hooks/' + retired_source['webhook_id'], {'marker': 'retired-' + suffix},
                auth=retired_source['secret'], expect=(403,), headers={'Idempotency-Key': 'retired-' + suffix},
                label='inactive-original-source-refused')
            require('webhook principal has no live thread write access' in str(refused),
                    'Inactive webhook source loses its live-authority refusal: ' + str(refused))
            retained_source_events = database_rows(inst, "SELECT id FROM kickside_event WHERE thread_id='" + retired_source['thread_id'] + "'")
            require(retained_source_events == original_source_events,
                    'Inactive webhook source appends an event after its actor loses authority')
            inst.request('POST', '/api/public/hooks/' + hook['webhook_id'], {'marker': 'new-' + suffix},
                auth=hook['secret'], expect=(202,), headers={'Idempotency-Key': 'new-' + suffix}, label='new-replacement-input')
        finally:
            inst.token = admin_token
        def new_delivery():
            rows = database_rows(inst, "SELECT item_key FROM kickside_automation_receipt WHERE owner_id='" + aid + "'")
            require(all(row['item_key'] != debt['item_key'] for row in rows),
                    'Original delivery executes under the replacement identity')
            return rows if len(rows) == 1 else None
        receipts = inst.wait(new_delivery, 'New input executes under replacement authority', seconds=60)
        retained = database_rows(inst, "SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared WHERE automation_id='" + aid + "'")
        require(retained == before, 'Replacement alters original delivery keys or prepared output')
        ledger = database_rows(inst, "SELECT item_key,state FROM kickside_trigger_item_ledger WHERE owner_id='" + aid + "'")
        require(len(ledger) == 1 and ledger[0] == debt, 'Replacement discards or retargets original parked work')
        require(gate.snapshot() == {'automation': {'entered': 2, 'effects': 2}},
                'Prepared replay repeats a transform or prevents new input')
        inst.evidence.save('delivery-identity-provenance', {'original': original['user_id'],
            'replacement': replacement['user_id'], 'prepared': retained, 'ledger': ledger,
            'receipts': receipts, 'calls': gate.snapshot(), 'retired_source': retired_source['webhook_id'],
            'replacement_source': hook['webhook_id']})


def delivery_identity_legacy(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'round_delivery_identity_test')
    run_focused_module_test(ctx, 'kickside/component', 'identity_audit_expiry_test')


def command_authority_recovery(ctx):
    run_focused_module_test(ctx, 'kickside/automation', 'command_recovery_test')
    run_focused_module_test(ctx, 'kickside/component', 'declaration_state_test')
    run_focused_module_test(ctx, 'kickside/core', 'pin_test')


REGISTRY = [
    Scenario('design_command_authority_recovery', 'full', command_authority_recovery, ('boot',),
             instance_setup=True, issues=('DC-06',)),
    Scenario('design_live_effect_authority', 'full', live_effect_authority, ('boot',),
             instance_setup=True, issues=('DC-01',)),
    Scenario('design_live_transform_resource_authority', 'full', live_transform_resource_authority, ('boot',),
             instance_setup=True, issues=('DC-01',)),
    Scenario('design_delivery_identity_legacy', 'full', delivery_identity_legacy, ('boot',),
             instance_setup=True, issues=('DC-02',)),
    Scenario('design_delivery_identity_provenance', 'full', delivery_identity_provenance, ('boot',),
             instance_setup=True, issues=('DC-02',)),
]
