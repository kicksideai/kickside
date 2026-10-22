"""CRM resolution is observable through published workflow Blocks and record reads."""
import json
import uuid

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios_automation import dispatch_workflow, replace_workflow_block, flow_detail
from scenarios_hot_update_work import database_rows


CRM = '/api/v1/workspace/crm/'
EVENT = 'kickside.crm.events:'


def resolve_fixture(ctx, *, suggestions=False):
    inst = ctx.inst
    inst.install('kickside/crm')
    cid = inst.request('POST', '/api/v1/workspace/crm', {
        'title': 'Resolution workflow records', 'idempotency_key': uuid.uuid4().hex},
        expect=(201,), label='resolve-crm-create')['component_id']
    base = CRM + cid
    current = inst.request('GET', base + '/schema')['revision']
    declaration = {
        'version': 'resolve-workflow', 'objects': [{'type': 'person', 'label': 'People'}],
        'attributes': [
            {'object_type': 'person', 'attr': 'name', 'label': 'Name', 'data_type': 'text'},
            {'object_type': 'person', 'attr': 'email', 'label': 'Email', 'data_type': 'email',
             'config': {'alias': 'email'}},
        ], 'pipelines': [], 'views': [], 'merge_config': {'objects': {}},
    }
    if suggestions:
        declaration['merge_config']['objects']['person'] = {
            'thresholds': {'ignore_below': .5, 'review_at': .5},
            'patterns': [{'kind': 'value_exact', 'attr': 'name', 'weight': 1, 'reason': 'same_name'}],
        }
    inst.request('POST', base + '/schema', {'declaration': declaration, 'expected_revision': current},
                 label='resolve-crm-schema')
    wid, _ = dispatch_workflow(ctx, 'Resolve contact identity')
    replace_workflow_block(inst, wid, 'receipt', 'kickside.crm.blocks:resolve',
                           title='Resolve contact identity', config={'crm_id': cid},
                           port_map={'error': 'failed'}, transforms={'result': '', 'error': ''})
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {},
                           label='resolve-workflow-publish')['version']
    return cid, wid, version


def resolve(ctx, wid, version, email, *, record_id=None):
    body = {'object_type': 'person', 'match': {'alias_type': 'email', 'alias_value': email},
            'values': {'name': 'Matching contact'}}
    if record_id:
        body['record_id'] = record_id
    rid = ctx.inst.request('POST', '/api/v1/workflows/' + wid + '/run',
                           {'version': version, 'input': body}, label='resolve-workflow-run')['run_id']
    detail = ctx.inst.wait(lambda: flow_detail(ctx.inst, wid, rid), 'Resolve workflow completes', seconds=60)
    result = detail['run']['output']['result']
    require(isinstance(result, dict) and result.get('record', {}).get('record_id'),
            'Resolve Block does not return its declared record: ' + json.dumps(detail))
    ctx.inst.evidence.save('resolve-workflow-output', {'run_id': rid, 'result': result})
    return result


def record_lifetime(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        cid, wid, version = resolve_fixture(fixture)
        base = CRM + cid
        for reused in (False, True):
            email = 'contact-' + uuid.uuid4().hex[:12] + '@example.test'
            proposed = 'person:' + uuid.uuid4().hex
            first = resolve(fixture, wid, version, email, record_id=proposed)
            require(first.get('created') is True, 'Initial resolve does not report creation')
            require(first['record']['record_id'] == proposed, 'Resolve ignores the proposed record identity')
            inst.request('POST', base + '/apply', {'commands': [
                {'type': EVENT + 'record.deleted', 'body': {'record_id': proposed, 'object_type': 'person'}}]},
                label='resolve-record-delete')
            next_id = proposed if reused else 'person:' + uuid.uuid4().hex
            second = resolve(fixture, wid, version, email, record_id=next_id)
            record = inst.request('POST', base + '/query', {'kind': 'record', 'record_id': next_id},
                                  label='resolve-recreated-record')
            events = database_rows(inst, "SELECT external_id FROM kickside_event WHERE thread_id='" + cid
                                   + "' AND type='" + EVENT + "record.created' AND CAST(body AS TEXT) LIKE '%" + email + "%'")
            claims = database_rows(inst, "SELECT record_id, state FROM kickside_crm_alias_reservation WHERE crm_id='"
                                   + cid + "' AND record_id='" + next_id + "'")
            inst.evidence.save('record-lifetime-' + str(reused).lower(), {
                'first': first, 'second': second, 'record': record, 'creates': events, 'claims': claims})
            require(second.get('created') is True and second['record']['record_id'] == next_id,
                    'Resolve does not create the new record lifetime')
            require(next_id in json.dumps(record) and email in json.dumps(record),
                    'Resolve reports creation without an authoritative record')
            require(len(events) == 2 and len({row['external_id'] for row in events}) == 2,
                    'Distinct record lifetimes reuse the durable create identity')
            require(claims == [{'record_id': next_id, 'state': 'committed'}],
                    'Replacement alias reservation does not commit')
            again = resolve(fixture, wid, version, email)
            require(again.get('created') is False and again['record']['record_id'] == next_id,
                    'Retry creates another record instead of reusing its committed identity')


def suggestion_output(ctx):
    with isolated_fixture(ctx) as fixture:
        inst = fixture.inst
        cid, wid, version = resolve_fixture(fixture, suggestions=True)
        first_email = 'first-' + uuid.uuid4().hex[:12] + '@example.test'
        second_email = 'second-' + uuid.uuid4().hex[:12] + '@example.test'
        first = resolve(fixture, wid, version, first_email)
        second = resolve(fixture, wid, version, second_email)
        updated = resolve(fixture, wid, version, first_email)
        suggestions = updated.get('merge_suggestions')
        require(updated.get('created') is False and isinstance(suggestions, list) and len(suggestions) == 1,
                'Existing-record resolve does not expose one configured duplicate suggestion: ' + str(updated))
        suggestion = suggestions[0]
        inst.evidence.save('resolve-suggestion-contract', {'first': first, 'second': second, 'updated': updated})
        require(suggestion.get('confidence') == 1 and suggestion.get('reason') == 'same_name'
                and suggestion.get('evidence') and suggestion.get('evidence_hash'),
                'Resolve suggestion omits its advertised output fields: ' + str(suggestion))
        require(suggestion['confidence'] == suggestion['score']['confidence']
                and suggestion['reason'] == suggestion['score']['reason']
                and suggestion['evidence_hash'] == suggestion['score']['evidence_hash'],
                'Resolve suggestion changes the scorer result')
        reviews = inst.request('POST', CRM + cid + '/query', {'kind': 'merge_reviews', 'status': 'all'},
                               label='resolve-suggestion-review-read')
        require(first['record']['record_id'] in str(reviews) and second['record']['record_id'] in str(reviews),
                'Resolve suggestion is absent from the merge review read model')


REGISTRY = [
    Scenario('crm_resolve_record_lifetime_workflow', 'regression', record_lifetime,
             issues=('CRM-RESOLVE-RECORD-LIFETIME',), features=(
                 'kickside/crm|workflow_block|kickside.crm.blocks:resolve',
                 'kickside/crm|http|POST /api/v1/workspace/crm/{id}/query',
                 'kickside/workflows|http|POST /api/v1/workflows/{id}/run',)),
    Scenario('crm_resolve_suggestion_workflow', 'regression', suggestion_output,
             issues=('CRM-RESOLVE-SUGGESTION-OUTPUT', 'CRM-RESOLVE-SUGGESTION-CONFIDENCE'), features=(
                 'kickside/crm|workflow_block|kickside.crm.blocks:resolve',
                 'kickside/crm|http|POST /api/v1/workspace/crm/{id}/query',
                 'kickside/workflows|http|POST /api/v1/workflows/{id}/run',)),
]
