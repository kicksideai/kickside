"""CRM resolution is observable through published workflow Blocks and record reads."""
import json
import uuid

from harness import Scenario, require
from runtime_fixtures import complete_splashes, isolated_fixture
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


def resolve_run(ctx, wid, version, email, *, record_id=None):
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
    return rid, result


def resolve(ctx, wid, version, email, *, record_id=None):
    _, result = resolve_run(ctx, wid, version, email, record_id=record_id)
    return result


def browser(ctx):
    complete_splashes(ctx, 'welcome', 'first_agent')
    value = ctx.browser_check(viewport={'width': 1600, 'height': 1000}, device_scale_factor=2)
    value.login()
    value.frame.locator('.sidebar').wait_for(timeout=30000)
    return value


def assert_published_resolve_output(ctx, run_id, record_id, email):
    """The published workflow's recorded Resolve result remains readable in its UI."""
    from playwright.sync_api import expect
    from scenarios_automation import open_workflow

    browser(ctx)
    open_workflow(ctx, 'Resolve contact identity')
    frame = ctx.browser.frame
    frame.get_by_role('button', name='Past runs', exact=True).click()
    row = frame.get_by_role('dialog', name='Runs', exact=True).locator('.wf-runs-row').filter(has_text=run_id[:8])
    expect(row).to_contain_text('Completed', timeout=30000)
    row.click()
    frame.locator('.vue-flow__node[data-id="receipt"]').click()
    output = frame.locator('.wf-panel--run .wf-payload').filter(
        has=frame.get_by_text('Output', exact=True)).locator('.wf-run-output')
    expect(output).to_contain_text(record_id, timeout=30000)
    expect(output).to_contain_text(email, timeout=30000)
    ctx.browser.screenshot('resolve-record-lifetime-published-output')


def merge_review_fixture(ctx):
    """Publish a review Block that renders the Resolve suggestion for a human."""
    inst = ctx.inst
    wid, _ = dispatch_workflow(ctx, 'Review resolved duplicate output')
    replace_workflow_block(inst, wid, 'receipt', 'kickside.crm.blocks:merge_review',
                           title='Review resolved duplicate output', config={'priority': 'normal'},
                           port_map={'result': 'do_not_merge', 'error': 'failed'},
                           transforms={'result': 'output.result', 'error': 'output.error'})
    version = inst.request('POST', '/api/v1/workflows/' + wid + '/publish', {},
                           label='resolve-suggestion-review-publish')['version']
    return wid, version


def assert_merge_review_output(ctx, cid, suggestion):
    """A reviewer sees the Resolve score, reason, identities, and matching evidence."""
    from playwright.sync_api import expect
    from scenarios import nav

    wid, version = merge_review_fixture(ctx)
    run = ctx.inst.request('POST', '/api/v1/workflows/' + wid + '/run', {
        'version': version,
        'input': {
            'crm_id': cid,
            'object_type': suggestion['object_type'],
            'left_id': suggestion['left_id'],
            'right_id': suggestion['right_id'],
            'confidence': suggestion['confidence'],
            'reason': suggestion['reason'],
            'evidence': suggestion['evidence'],
            'evidence_hash': suggestion['evidence_hash'],
        }}, label='resolve-suggestion-review-run')['run_id']

    def pending_item():
        items = ctx.inst.request('GET', '/api/v1/inbox?status=all&limit=200',
                                 label='resolve-suggestion-review-inbox')['items']
        matches = [item for item in items if item.get('metadata', {}).get('run_id') == run]
        require(len(matches) <= 1, 'Resolve suggestion creates duplicate merge-review inbox items')
        return matches[0] if matches else None

    item = ctx.inst.wait(pending_item, 'Resolve suggestion reaches merge-review inbox', seconds=60)
    require(item['item_type'] == 'crm_merge_review',
            'Resolve suggestion does not create a CRM merge-review item: ' + str(item))
    browser(ctx)
    nav(ctx, 'Inbox')
    ctx.browser.frame.get_by_role('button').filter(has_text='Reason: same_name').click(timeout=30000)
    review = ctx.browser.frame.locator('kickside-crm-merge-review[item-id="' + item['id'] + '"]')
    expect(review).to_contain_text('100% match', timeout=30000)
    expect(review).to_contain_text('Same Name', timeout=30000)
    expect(review).to_contain_text(suggestion['left_id'], timeout=30000)
    expect(review).to_contain_text(suggestion['right_id'], timeout=30000)
    expect(review).to_contain_text('Matched', timeout=30000)
    expect(review).to_contain_text('name: Matching contact', timeout=30000)
    ctx.browser.screenshot('resolve-suggestion-merge-review-output')


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
            second_run, second = resolve_run(fixture, wid, version, email, record_id=next_id)
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
            if reused:
                assert_published_resolve_output(fixture, second_run, next_id, email)


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
        assert_merge_review_output(fixture, cid, suggestion)


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
