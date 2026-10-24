"""An independent reviewer cannot revive revoked selected Workflow authority."""
import json
import uuid
from urllib.parse import quote

from harness import Scenario, require
from runtime_fixtures import isolated_fixture
from scenarios_hot_update_work import database_rows, open_review_controls
from scenarios_manual_task import KIND, _effects
from scenarios_security_ui import login_member
from scenarios_selected_install import _identity
from scenarios_workflow_selected import _workflow_fixture, _delegate, _runs, _review_decision


def _await_fixture(ctx):
    inst = ctx.inst
    suffix = uuid.uuid4().hex[:10]
    reviewer = inst.request('POST', '/api/v1/users', {'full_name': 'Independent reviewer',
        'email': 'reviewer-' + suffix + '@smoke.example', 'password': inst.password}, expect=(201,))['user']
    inst.cleanup.add('independent reviewer', lambda: inst.request('DELETE', '/api/v1/users/' + reviewer['user_id'], expect=(202,)))
    reviewer_token = inst.request('POST', '/api/public/user/token', {'email': reviewer['email'], 'password': inst.password}, auth='')['token']
    inst.redactor.add(reviewer_token)
    fixture = _workflow_fixture(ctx, review=True, review_assignee=reviewer['user_id'], review_token=reviewer_token)
    fixture.update(reviewer=reviewer, reviewer_token=reviewer_token)
    _delegate(inst, fixture)
    root = str(uuid.uuid4())
    body = {'type': KIND, 'component_id': root, 'request_id': uuid.uuid4().hex, 'parent_id': fixture['workflow'],
        'principal': {'kind': 'user', 'id': fixture['bot']}, 'input': {'title': 'Retained Await authority', 'target': fixture['target']}}
    receipt = inst.request('POST', '/api/v1/automations/selected', body, auth=fixture['token'])
    require(receipt.get('success') and receipt['id'] == root, 'Await task admission changes its protected root')
    fixture['root'] = root
    inst.cleanup.add('selected Await root', lambda: inst.request('DELETE', '/api/v1/automations/' + root, auth=fixture['token']))
    started = inst.request('POST', '/api/v1/automations/' + root + '/actions/run_now', {'request_id': uuid.uuid4().hex}, auth=fixture['token'])
    require(started.get('result', {}).get('state') == 'succeeded', 'Selected Await task is not admitted')
    runs = inst.wait(lambda: rows if len(rows := _runs(inst, fixture)) == 1 else None, 'Selected task creates one Workflow run', seconds=60)
    run = runs[0]
    decision = _review_decision(inst, fixture, run['run_id'], reviewer_token=reviewer_token)
    require(decision['status'] == 'pending' and decision['actor_id'] == reviewer['user_id'], 'Decision belongs to another actor')
    fixture.update(run=run, decision=decision)
    return fixture


def _browser_await_boundary(ctx, reduction):
    from playwright.sync_api import expect
    inst = ctx.inst
    fixture = _await_fixture(ctx)
    identity, generation = _identity(inst, fixture['root'])
    require(generation == 1 and identity['principal'] == {'kind':'user','id':fixture['bot']}
        and identity['authorized_by'] == {'kind':'user','id':fixture['member']['user_id']}
        and fixture['reviewer']['user_id'] not in [identity['principal']['id'],identity['authorized_by']['id']],
        'Independent reviewer becomes configuring or execution authority')
    require(json.loads(fixture['run']['execution_identity_json']) == identity and not _effects(inst, fixture),
            'Await admission loses its canonical identity or executes prematurely')
    browser = ctx.browser_check()
    login_member(ctx, fixture['reviewer'])
    trace = inst.root / inst.evidence.label / ('await-' + reduction + '-trace.zip')
    trace.parent.mkdir(parents=True,exist_ok=True)
    browser.context.tracing.start(screenshots=True,snapshots=True,sources=True)
    path = '/api/v1/inbox/' + quote(fixture['decision']['id'], safe='') + '/approve'
    bot_path = '/api/v1/users/' + fixture['bot']
    grant = {**fixture['delegation'],'root':'*'}
    try:
        detail = open_review_controls(ctx, fixture['decision'], {'reason': 'Independent human decision'})
        inbox = browser.frame.locator('kickside-inbox')
        if reduction == 'disable':
            disabled=inst.request('DELETE',bot_path,expect=(202,))
            require(disabled.get('success') is True and disabled.get('result', {}).get('retained') is True, 'Await lifecycle removes the selected ordinary User')
        elif reduction == 'groups':
            groups = inst.request('GET', bot_path + '/groups')['groups']
            changed = inst.request('PUT', bot_path + '/groups', {'groups': []})
            current = inst.request('GET', bot_path + '/groups')['groups']
            rows = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + fixture['bot'] + "'")
            inst.evidence.save('await-groups-reduction', {'before': groups, 'mutation': changed, 'after': current, 'rows': rows})
            require('app.security:admin' in groups and changed.get('success')
                and changed['result']['membership_effect'] == 'reduction'
                and current == ['app.security:user'] and rows == [{'group_id': 'app.security:user'}],
                'Group reduction does not remove execution membership while retaining the ordinary baseline')
            control_email = 'await-groups-current-' + uuid.uuid4().hex[:12] + '@smoke.example'
            control = inst.request('POST', '/api/v1/users', {
                'email': control_email, 'password': inst.password,
                'full_name': 'Current reduced Workflow access control', 'groups': current,
            }, expect=(201,), label='await-groups-current-user')['user']
            inst.cleanup.add('current reduced Workflow access control', lambda: inst.request(
                'DELETE', '/api/v1/users/' + control['user_id'], expect=(202,)))
            control_token = inst.request('POST', '/api/public/user/token', {
                'email': control_email, 'password': inst.password,
            }, auth='', label='await-groups-current-login')['token']
            inst.redactor.add(control_token)
            inst.request('POST', '/api/v1/workflows/' + fixture['workflow'] + '/run', {
                'version': fixture['version'], 'input': {'text': 'reduced group control'},
            }, auth=control_token, expect=(403,), label='await-groups-current-workflow-access')
        elif reduction == 'delegation':
            inst.request('DELETE','/api/v1/security/delegations',{'principal':grant['principal'],'root':grant['root'],'operation_id':uuid.uuid4().hex})
        else: raise ValueError('Unknown Await reduction')
        with browser.rejection('POST',path,403) as refused:
            detail.get_by_role('button',name='Approve',exact=True).click()
        require(refused.value.json().get('success') is False, 'Reduced Await browser decision reports success')
        expect(inbox.get_by_role('alert')).to_be_visible(timeout=30000)
        items=inst.request('GET','/api/v1/inbox?status=all&limit=200',auth=fixture['reviewer_token'])['items']
        retained=[item for item in items if item['id']==fixture['decision']['id']]
        require(len(retained)==1 and retained[0]['status']=='pending' and not _effects(inst,fixture),
                'Refused Await decision commits terminal state or performs a post-Await effect')
        require(_identity(inst,fixture['root'])==(identity,generation) and _runs(inst,fixture)[0]['execution_identity_json']==fixture['run']['execution_identity_json'],
                'Refused reviewer decision rewrites execution identity')
        browser.screenshot('await-'+reduction+'-refused')
        if reduction=='disable': inst.request('PUT',bot_path,{'status':'active'})
        elif reduction=='groups': inst.request('PUT',bot_path+'/groups',{'groups':groups})
        else: inst.request('POST','/api/v1/security/delegations',{**grant,'operation_id':uuid.uuid4().hex})
        with browser.page.expect_response(lambda r:r.request.method=='POST' and r.url.endswith(path)) as response:
            detail.get_by_role('button',name='Approve',exact=True).click()
        require(response.value.status==200 and response.value.json().get('success'), 'Restored original Await authority does not admit the same reviewer decision')
        require(response.value.request.post_data_json == refused.value.request.post_data_json, 'Await retry changes the human decision payload')
        def complete():
            detail=inst.request('GET','/api/v1/workflows/'+fixture['workflow']+'/runs/'+fixture['run']['run_id'],auth=fixture['token'])
            require(detail['run']['status']!='failed','Restored Await run fails: '+str(detail))
            return detail if detail['run']['status']=='completed' else None
        done=inst.wait(complete,'Restored Await completes with the original bot authority',seconds=60,pump=browser.page.wait_for_timeout)
        effects=_effects(inst,fixture)
        require(len(effects)==1 and effects[0]['actor_id']==fixture['bot'] and json.loads(effects[0]['identity_json'])==identity,
                'Await resume replaces bot/original authorizer/root with reviewer or worker')
        require('Independent human decision' in json.dumps(done['run']['output']), 'Real reviewer form does not reach the original Workflow effect')
        require(_runs(inst,fixture)[0]['execution_identity_json']==fixture['run']['execution_identity_json'] and _identity(inst,fixture['root'])==(identity,generation),
                'Restored review changes the admitted identity or generation')
        browser.clean(0)
        browser.screenshot('await-'+reduction+'-restored')
        inst.evidence.save('await-'+reduction+'-proof',{'identity':identity,'decision':fixture['decision'],'reviewer':fixture['reviewer']['user_id'],'effects':effects,'run':done})
    finally:
        inst.evidence.save('await-'+reduction+'-progress',{'identity':_identity(inst,fixture['root']),'runs':_runs(inst,fixture),'effects':_effects(inst,fixture)})
        browser.context.tracing.stop(path=str(trace));inst.evidence.paths.append(str(trace))


def browser_bot_await_disable(ctx):
    with isolated_fixture(ctx) as fixture: _browser_await_boundary(fixture,'disable')


def browser_bot_await_delegation_revoke(ctx):
    with isolated_fixture(ctx) as fixture: _browser_await_boundary(fixture,'delegation')


REGISTRY=[Scenario('browser_bot_await_disable','regression',browser_bot_await_disable,('boot',),instance_setup=True,
                  issues=('BOT-WORKFLOW-AWAIT-REVOCATION','RA-H39','RA-B11','INBOX-CALLBACK-NATIVE-ERROR')),
          Scenario('browser_bot_await_delegation_revoke','regression',browser_bot_await_delegation_revoke,('boot',),instance_setup=True,
                  issues=('BOT-WORKFLOW-AWAIT-REVOCATION','RA-H39','INBOX-CALLBACK-NATIVE-ERROR'))]


def inbox_callback_native_errors(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/inbox', 'resume_decision_test', lint=True)


REGISTRY += [Scenario('inbox_callback_native_errors', 'regression', inbox_callback_native_errors,
                      issues=('INBOX-CALLBACK-NATIVE-ERROR', 'BOT-WORKFLOW-AWAIT-REVOCATION', 'RA-H39'))]


def inbox_resolution_native_errors(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/inbox', 'resolve_test', lint=True)


REGISTRY += [Scenario('inbox_resolution_native_errors', 'regression', inbox_resolution_native_errors,
                      issues=('INBOX-CALLBACK-NATIVE-ERROR', 'BOT-WORKFLOW-AWAIT-REVOCATION', 'RA-H39'))]


def browser_bot_await_group_reduction(ctx):
    with isolated_fixture(ctx) as fixture:
        _browser_await_boundary(fixture, 'groups')


REGISTRY += [Scenario('browser_bot_await_group_reduction', 'regression', browser_bot_await_group_reduction, ('boot',), instance_setup=True,
                     issues=('BOT-WORKFLOW-AWAIT-REVOCATION', 'RA-H39', 'RA-H25', 'INBOX-CALLBACK-NATIVE-ERROR', 'UPSTREAM-DATAFLOW-LIVE-AUTHORITY'))]
