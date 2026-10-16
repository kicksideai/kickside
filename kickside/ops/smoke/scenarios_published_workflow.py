"""Original human Workflow and Await state survives a published Hub UI update."""
import json
import uuid
from urllib.parse import quote

from harness import Scenario, require
from scenarios import workflow
from workflow_history_contract import durable_history
from module_lifecycle_contract import update_source
from scenarios_hot_update_work import database_rows, review_item, completed_workflow
from scenarios_published_run_as import REGISTRY as PUBLISHED, browser_published_human_automation_update, install_source_through_hub_ui


def browser_published_workflow_await_hub_ui_update(ctx):
    state = {'runs': {}, 'frames': {}, 'completed': {}, 'pending': None}

    def rows(inst):
        return database_rows(inst, "SELECT run_id,workflow_id,version,dataflow_id,trigger_kind,trigger_id,dedup_key,origin,started_at,invocation_id,binding_id,binding_revision,execution_identity_json,creation_payload_json,admission_hash FROM workflow_runs WHERE workflow_id='" + state['workflow'] + "' ORDER BY run_id")

    def frame(inst, dataflow):
        rows = database_rows(inst, "SELECT dataflow_id,actor_id,CAST(actor_context AS TEXT) AS actor_context FROM dataflows WHERE dataflow_id='" + dataflow + "'")
        require(len(rows) == 1, 'Original Workflow has no unique durable Dataflow frame')
        return rows[0]

    def frame_policies(inst, phase):
        missing = []
        policies = set()
        for dataflow, before in state['frames'].items():
            require(frame(inst, dataflow) == before, 'Hub update changes an original durable Dataflow frame')
            context = json.loads(before['actor_context'])
            require(context.get('kind') == 'dataflow.execution_frame' and context.get('policy_ids'),
                    'Published Workflow does not capture its native Dataflow policy frame')
            policies.update(context['policy_ids'])
        for policy in sorted(policies):
            entry = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(policy, safe=''),
                                 expect=(200, 404), label='published-workflow-frame-policy').get('entry')
            if entry is None:
                missing.append(policy)
            else:
                require(entry['kind'] == 'security.policy', 'Persisted Dataflow policy changes registry kind')
        inst.evidence.save('published-workflow-frame-policies-' + phase,
                           {'frames': state['frames'], 'policy_ids': sorted(policies), 'missing': missing})
        require(not missing, 'Hub update removes persisted Dataflow policies: ' + json.dumps(missing))

    def approve(fixture, case, phase):
        from scenarios_hot_update_work import open_review_controls
        browser, inst = fixture.browser_check(), fixture.inst
        reason = 'Retained human review ' + phase
        trace = inst.root / inst.evidence.label / ('published-workflow-' + phase + '-trace.zip')
        trace.parent.mkdir(parents=True, exist_ok=True)
        browser.context.tracing.start(screenshots=True, snapshots=True, sources=True)
        try:
            detail = open_review_controls(fixture, case['item'], {'reason': reason})
            path = '/api/v1/inbox/' + quote(case['item']['id'], safe='') + '/approve'
            with browser.page.expect_response(lambda response: response.request.method == 'POST'
                    and response.url.endswith(path)) as response:
                detail.get_by_role('button', name='Approve', exact=True).click()
            require(response.value.status == 200 and response.value.json().get('success') is True,
                    'Original human review does not resume after ' + phase)
            require(response.value.request.post_data_json.get('form') == {'reason': reason},
                    'Browser submits a different original review form')
            done = inst.wait(lambda: completed_workflow(inst, state['workflow'], case['run']),
                            'Original published Workflow completes after ' + phase, seconds=60,
                            pump=browser.page.wait_for_timeout)
            require(reason in json.dumps(done['run']['output']) and 'approve' in json.dumps(done['run']['output']),
                    'Original human review output does not reach Finish')
            repeated = inst.request('POST', path, {'form': {'reason': reason}}, expect=(409,),
                                    label='published-workflow-review-replay-' + phase)
            require(repeated.get('success') is False and 'resolved' in str(repeated).lower(),
                    'Original review replay loses its explicit conflict')
            state['completed'][case['run']] = done['run']
            browser.clean(0)
            browser.screenshot('published-workflow-review-' + phase)
            inst.evidence.save('published-workflow-completed-' + phase, {'run': done,
                'item': case['item'], 'human_actor': state['actor'], 'reason': reason})
        finally:
            browser.context.tracing.stop(path=str(trace))
            inst.evidence.paths.append(str(trace))

    def start(fixture, phase):
        inst = fixture.inst
        body = {'version': state['version'], 'input': {'marker': 'Existing human Workflow ' + phase},
                'trigger_id': state['workflow'], 'dedup_key': uuid.uuid4().hex}
        rid = inst.request('POST', '/api/v1/workflows/' + state['workflow'] + '/run', body,
                           label='published-workflow-run-' + phase)['run_id']
        item = inst.wait(lambda: review_item(inst, state['workflow'], rid),
                         'Original human Workflow reaches Await', seconds=60)
        require(item['status'] == 'pending' and item['actor_id'] == state['actor'],
                'Original review belongs to another actor')
        row = next(row for row in rows(inst) if row['run_id'] == rid)
        identity = json.loads(row['execution_identity_json'])
        require(identity['principal'] == {'kind': 'user', 'id': state['actor']}
                and identity['authorized_by'] == {'kind': 'user', 'id': state['actor']},
                'Published manual Workflow borrows another execution or configuring principal')
        require(row['dataflow_id'] and row['trigger_id'] == body['trigger_id']
                and row['dedup_key'] == body['dedup_key'], 'Workflow loses its original activation or dedup references')
        state['runs'][rid] = row
        state['frames'][row['dataflow_id']] = frame(inst, row['dataflow_id'])
        return {'run': rid, 'item': item, 'body': body}

    def observe(fixture, phase):
        inst = fixture.inst
        if phase == 'before_restart':
            return
        if phase == 'baseline':
            state['actor'] = inst.request('GET', '/api/v1/user/me')['user']['id']
            wid, version = workflow(fixture, review=True)
            state.update(workflow=wid, version=version)
            state['definition'] = inst.request('GET', '/api/v1/workflows/' + wid + '/state')['state']
            require(state['definition']['can_undo'] is True and state['definition']['can_redo'] is False,
                    'Published Workflow has no exact original in-memory history baseline')
            first = start(fixture, 'baseline')
            approve(fixture, first, 'baseline')
            state['pending'] = start(fixture, 'held-before-update')
            frame_policies(inst, phase)
        else:
            if phase in ('update', 'repeat'):
                update_source(fixture, fixture.state['published_sources']['kickside/workflows'],
                              'kickside/workflows', live=True)
            require(rows(inst) == sorted(state['runs'].values(), key=lambda row: row['run_id']),
                    'Hub update rewrites or duplicates original Workflow identity, input or activation references')
            frame_policies(inst, phase)
            expected = dict(state['definition'], can_undo=False, can_redo=False) if phase == 'restart' else state['definition']
            require(inst.request('GET', '/api/v1/workflows/' + state['workflow'] + '/state',
                                 label='published-workflow-definition-' + phase)['state'] == expected,
                    'Hub update changes the existing published Workflow definition or its authorized history boundary')
            if phase in ('update', 'repeat'):
                require(not database_rows(inst, "SELECT workflow_id FROM workflow_undo_history WHERE workflow_id='" + state['workflow'] + "'"),
                        'First published transition invents unavailable in-memory Workflow history')
            for rid, completed in state['completed'].items():
                detail = inst.request('GET', '/api/v1/workflows/' + state['workflow'] + '/runs/' + rid,
                                      label='published-workflow-completed-read-' + phase)
                inst.evidence.save('published-workflow-completed-comparison-' + phase,
                                   {'before': completed, 'after': detail['run']})
                require(detail['run'] == completed, 'Hub update changes the completed original Workflow output or identity')
            pending = state['pending']
            item = review_item(inst, state['workflow'], pending['run'])
            require(item == pending['item'], 'Hub update loses or rewrites the original pending review correlation')
            replay = inst.request('POST', '/api/v1/workflows/' + state['workflow'] + '/run', pending['body'],
                                  label='published-workflow-run-replay-' + phase)
            require(replay['run_id'] == pending['run'] and replay.get('deduped') is True,
                    'Original waiting-run command replay allocates another activation')
            approve(fixture, pending, phase)
            state['pending'] = None if phase == 'restart' else start(fixture, 'held-after-' + phase)
        if phase == 'restart':
            inst.evidence.save('published-workflow-first-history-boundary', {
                'saved_definition': state['definition'], 'can_undo': False, 'can_redo': False,
                'owner_order': 'workflow-undo: first published transition starts empty; later transitions preserve history'})
            durable_history(fixture, state['workflow'], 'Northwind smoke review',
                            fixture.state['published_sources']['kickside/workflows'])
        inst.evidence.save('published-workflow-' + phase, {'definition': state['definition'],
            'runs': rows(inst), 'completed': state['completed'], 'pending': state['pending'],
            'original_human': state['actor']})

    browser_published_human_automation_update(ctx, installer=install_source_through_hub_ui,
                                            observe=observe, modules=('kickside/workflows',))


REGISTRY = [Scenario('browser_published_workflow_await_hub_ui_update', 'regression',
    browser_published_workflow_await_hub_ui_update, ('boot',), instance_setup=True,
    issues=PUBLISHED[0].issues + ('RA-B16', 'RA-C07', 'BOT-PUBLISHED-WORKFLOW-AWAIT-CONTINUITY',
                                 'DATAFLOW-PUBLISHED-PROJECTED-POLICY-CONTINUITY',
                                 'WORKFLOW-PUBLISHED-RESTART-STATE-CONTINUITY',
                                 'WORKFLOW-PUBLISHED-RUN-RESPONSE-SHAPE'))]
