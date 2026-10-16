"""A declared workflow Error boundary preserves its cause in the durable run."""
import json
import uuid

from harness import require
from cleanup_evidence import delete_workflow


def failure_workflow(ctx, *, scope='instance'):
    inst = ctx.inst
    from scenarios_automation import dispatch_workflow
    marker = 'Northwind missing stock NW-FAIL-' + uuid.uuid4().hex[:8]
    wid, _ = dispatch_workflow(ctx, marker)
    base = '/api/v1/workflows/' + wid
    inst.cleanup.add('Failure workflow', lambda: delete_workflow(ctx, wid), scope=scope)
    schema = {'type': 'object', 'required': ['code', 'message'], 'additionalProperties': False,
        'properties': {'code': {'type': 'string'}, 'message': {'type': 'string'}, 'fail': {'type': 'boolean'}}}
    error_schema = {'type': 'object', 'required': ['message'], 'additionalProperties': False,
        'properties': {'code': {'type': 'string'}, 'kind': {'type': 'string'},
            'message': {'type': 'string'}, 'fail': {'type': 'boolean'}}}
    inst.request('POST', base + '/apply', {'commands': [
        {'type': 'node.update', 'body': {'id': 'start', 'config': {'input_schema': schema}}},
        {'type': 'node.update', 'body': {'id': 'finish', 'config': {'output_schema': schema}}},
        {'type': 'node.update', 'body': {'id': 'code-error', 'title': 'Northwind stock refusal',
            'config': {'error_schema': error_schema}}},
        {'type': 'node.add', 'body': {'id': 'decision', 'kind': 'branch', 'title': 'Northwind stock check',
            'config': {'predicate': 'output.result.fail'}}},
        {'type': 'edge.remove', 'body': {'id': 'receipt-finish'}},
        {'type': 'edge.add', 'body': {'id': 'receipt-decision', 'source_id': 'receipt', 'source_port': 'result',
            'target_id': 'decision', 'target_port': 'in'}},
        {'type': 'edge.add', 'body': {'id': 'decision-code-error', 'source_id': 'decision', 'source_port': 'true',
            'target_id': 'code-error', 'target_port': 'in', 'transform': 'output.result'}},
        {'type': 'edge.add', 'body': {'id': 'decision-finish', 'source_id': 'decision', 'source_port': 'false',
            'target_id': 'finish', 'target_port': 'in', 'transform': 'output.result'}},
    ]}, label='failure-flow-definition')
    version = inst.request('POST', base + '/publish', {}, label='failure-flow-publish')['version']
    return wid, version, marker


def verify_failure_cause(ctx):
    inst = ctx.inst
    wid, version, marker = failure_workflow(ctx)
    base = '/api/v1/workflows/' + wid
    launched = inst.request('POST', base + '/run', {'version': version,
        'input': {'code': 'NORTHWIND_STOCK_MISSING', 'message': marker, 'fail': True}}, label='failure-flow-launch')
    rid = launched['run_id']

    def failed():
        detail = inst.request('GET', base + '/runs/' + rid, label='failure-run-detail')
        require(detail['run']['status'] in ('pending', 'running', 'failed'), 'Error boundary completes without failure')
        return detail if detail['run']['status'] == 'failed' else None

    detail = inst.wait(failed, 'Workflow failure records its terminal status', seconds=60)
    run = detail['run']
    require(isinstance(run.get('error'), str) and marker in run['error'], 'Failed run loses its known cause: ' + json.dumps(run))
    require(run.get('finished_at'), 'Failed run has no terminal timestamp')
    listed = inst.request('GET', base + '/runs', label='failure-run-list')['runs']
    matches = [row for row in listed if row['run_id'] == rid]
    require(len(matches) == 1 and matches[0]['status'] == 'failed' and matches[0]['error'] == run['error'],
        'Run list loses the persisted failure cause')
    timeline = inst.request('GET', base + '/runs/' + rid + '/events', label='failure-run-timeline')['timeline']
    boundaries = [event for event in timeline['events'] if event['type'] == 'flow.failed']
    require(len(boundaries) == 1 and marker in json.dumps(boundaries[0]), 'Run timeline loses its failure cause')

    def terminal_event():
        events = inst.request('GET', '/api/v1/threads/' + wid + '/events', label='failure-run-events')['events']
        failures = [event for event in events if event['type'] == 'kickside.workflows.runs.events:failed']
        require(len(failures) <= 1, 'Workflow publishes duplicate terminal failures')
        return failures[0] if failures else None

    event = inst.wait(terminal_event, 'Workflow publishes its durable failure cause', seconds=35)
    require(marker in json.dumps(event), 'Terminal failure event loses its known cause')
    repeated = inst.request('GET', base + '/runs/' + rid, label='failure-run-repeated')['run']
    require(repeated['status'] == 'failed' and repeated['error'] == run['error'], 'Failure observation changes its recorded cause')
    inst.evidence.save('workflow-failure-contract', {'run_id': rid, 'error': run['error'], 'event': event})
