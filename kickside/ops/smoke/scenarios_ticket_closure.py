import yaml

from harness import Scenario, require
from scenarios_core import create_thread
from scenarios import first_agent, member_identity, refresh_member_token
from scenarios_chat import for_role
from scenarios_jira import jira_setup, regression_2439


def projection_failure_contract(ctx):
    fixture = ctx.inst.app / 'src' / 'projection-failure-contract-smoke'
    fixture.mkdir(exist_ok=True)
    (fixture / 'worker.lua').write_text(
        'local M = {}\n'
        'function M.deterministic(_input) error("projection worker boom") end\n'
        'function M.infrastructure(_input) error(errors.new({message = "database unavailable", '
        'kind = errors.UNAVAILABLE, retryable = true})) end\nreturn M\n')
    (fixture / '_index.yaml').write_text(yaml.safe_dump({
        'version': '1.0', 'namespace': 'app.smoke.projection_failure_contract', 'entries': [{
            'name': failure, 'kind': 'function.lua', 'meta': {'type': 'projection.worker'},
            'source': 'file://worker.lua', 'method': failure,
        } for failure in ('deterministic', 'infrastructure')],
    }, sort_keys=False))
    ctx.restart()
    thread_id = create_thread(ctx, 'Projection failure contract')
    ctx.inst.cleanup.add('Projection failure thread', lambda: ctx.inst.request('DELETE', '/api/v1/threads/' + thread_id),
                         scope='scenario')
    base = '/api/v1/threads/' + thread_id
    ctx.inst.request('POST', base + '/messages', {'text': 'Projection event', 'role': 'user'},
                     expect=(201,), label='projection-failure-event')
    for failure in ('deterministic', 'infrastructure'):
        registered = ctx.inst.request('POST', base + '/projections', {
            'kind': 'failure-contract', 'projection_key': failure,
            'worker_ref': 'func://app.smoke.projection_failure_contract:' + failure, 'start_seq': 0,
        }, expect=(201,), label='projection-failure-register-' + failure)

        def settled():
            cursors = ctx.inst.request('GET', base + '/projections', label='projection-failure-cursor')['cursors']
            cursor = next((row for row in cursors if row['id'] == registered['cursor_id']), None)
            if cursor is None:
                return None
            jobs = ctx.inst.request('GET', '/api/v1/jobs?thread_id=' + thread_id,
                                    label='projection-failure-job')['jobs']
            job = next((row for row in jobs if row['id'] == cursor['job_id']), None)
            if job is None:
                return None
            snapshot = {'job': job, 'cursor': cursor}
            ctx.inst.evidence.save('projection-failure-' + failure, snapshot)
            require(cursor['last_seq'] == 0, 'Failed projection advances its cursor')
            require(job['status'] in ('pending', 'running'), 'Failed projection loses its reusable slot')
            if not job.get('last_error') or job['attempts'] < 1:
                return None
            message = 'projection worker boom' if failure == 'deterministic' else 'database unavailable'
            require(message in job['last_error'], 'Projection loses its worker error')
            if failure == 'deterministic':
                return snapshot if job['status'] == 'pending' and job.get('scheduled_at') is None else None
            return snapshot if job['attempts'] > job['max_attempts'] else None

        snapshot = ctx.inst.wait(settled, 'Projection ' + failure + ' failure follows its slot contract', seconds=60)
        job = snapshot['job']
        if failure == 'deterministic':
            require(job['attempts'] == 1, 'Deterministic function failure retries before parking')
        else:
            require(job['status'] == 'running' or job.get('scheduled_at') is not None,
                    'Infrastructure failure parks instead of retrying')


def member_discord_reply(ctx):
    ctx.browser_check().login()
    jira_setup(ctx)
    member = member_identity(ctx)
    refresh_member_token(ctx.inst, member, '/api/v1/agents/traits', lambda result: bool(result.get('traits')),
                         'discord-member-admission')
    ctx.state['chat_member'] = member

    def reply(member_ctx):
        member_ctx.browser_check().login(member['email'], member_ctx.inst.password)
        first_agent(member_ctx)
        regression_2439(member_ctx)

    for_role('member', reply)(ctx)


REGISTRY = [
    Scenario('regression_EE2_2571_projection_failure_contract', 'regression', projection_failure_contract,
        ('first_agent',), instance_setup=True, model=True, issues=('EE2-2571',)),
    Scenario('regression_EE2_2439_member_reply', 'regression', member_discord_reply,
        ('first_agent',), instance_setup=True, model=True, issues=('EE2-2439',)),
]
