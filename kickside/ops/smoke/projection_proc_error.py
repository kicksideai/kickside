"""A returned process error keeps projection work pending for retry."""
from pathlib import Path

from browser import Browser
from harness import require


def verify_projection_proc_error(ctx, *, thread_id=None, thread_factory=None, append_event=None):
    import yaml
    from scenarios_core import create_thread

    inst = ctx.inst
    fixture = inst.app / 'src' / 'projection-error-smoke'
    fixture.mkdir(exist_ok=True)
    (fixture / 'worker.lua').write_text((Path(__file__).resolve().parents[2] /
        'core/core/test/src/test_refusing_proc_worker.lua').read_text())
    (fixture / '_index.yaml').write_text(yaml.safe_dump({
        'version': '1.0', 'namespace': 'app.smoke.projection_error', 'entries': [{
            'name': 'worker', 'kind': 'process.lua', 'meta': {'type': 'projection.worker'},
            'source': 'file://worker.lua', 'method': 'run',
        }],
    }, sort_keys=False))
    ctx.restart()
    tid = thread_id or (thread_factory() if thread_factory else create_thread(ctx, 'Northwind Refused Projection Batch'))
    base = '/api/v1/threads/' + tid
    registered = inst.request('POST', base + '/projections', {
        'kind': 'northwind-refused', 'projection_key': 'northwind-refused',
        'worker_ref': 'proc://app.smoke.projection_error:worker',
        'start_seq': 0,
    }, expect=(201,), label='refused-projection-register')
    inst.cleanup.add('refused projection', lambda: inst.request('POST', base + '/projections/remove',
        {'projection_id': registered['projection_id']}, label='refused-projection-remove'), scope='scenario')
    if append_event:
        append_event(tid)
    else:
        inst.request('POST', base + '/messages', {'text': 'Northwind refused event', 'role': 'user'},
                     expect=(201,), label='refused-projection-event')

    def failure():
        listing = inst.request('GET', base + '/projections', label='refused-projection-cursor')
        cursor = next(c for c in listing['cursors'] if c['id'] == registered['cursor_id'])
        require(cursor['last_seq'] == 0, 'Refused process batch advances its cursor')
        runs = inst.request('GET', '/api/v1/job-runs?job_id=' + cursor['job_id'], label='refused-projection-runs')['runs']
        settled = [r for r in runs if r['status'] != 'running']
        require(all(r['status'] == 'failed' for r in settled), 'Refused process batch completes successfully')
        if not settled:
            return None
        require(all('worker refused the batch' in (r['error_text'] or '') for r in settled),
                'Failed batch loses the returned worker error')
        jobs = inst.request('GET', '/api/v1/jobs?thread_id=' + tid, label='refused-projection-jobs')['jobs']
        job = next(j for j in jobs if j['id'] == cursor['job_id'])
        require(job['status'] in ('pending', 'running'), 'Failed batch loses its retry slot')
        return {'cursor': cursor, 'runs': settled, 'job': job}

    inst.evidence.save('refused-projection-retry', inst.wait(failure,
        'Returned process error fails the batch without advancing the cursor', seconds=60))
