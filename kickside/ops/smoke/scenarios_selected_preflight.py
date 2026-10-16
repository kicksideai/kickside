"""Selected installation authorizes before allocating its protected root."""
import uuid

from harness import Scenario, require
from scenarios_hot_update_work import database_rows
from scenarios_run_as_picker import _candidate_fixture
from scenarios_selected_install import TYPE, _owned_root, _identity, assert_unallocated_root


def selected_install_preflight(ctx):
    inst = ctx.inst
    fixture = _candidate_fixture(ctx)
    token = fixture['token']
    root = _owned_root(inst)
    request = {'type': TYPE, 'input': {'title': 'Selection preflight'}, 'component_id': root,
               'request_id': uuid.uuid4().hex, 'principal': {'kind': 'user', 'id': fixture['bot']}}
    inst.request('POST', '/api/v1/automations/selected', request, auth=token, expect=(403,))
    denied_allocations = assert_unallocated_root(inst, root)
    delegation = {**fixture['delegation'], 'root': '*'}
    inst.request('POST', '/api/v1/security/delegations', {**delegation, 'operation_id': uuid.uuid4().hex})
    inst.cleanup.add('preflight delegation', lambda: inst.request('DELETE', '/api/v1/security/delegations',
        {'principal': delegation['principal'], 'root': '*', 'operation_id': uuid.uuid4().hex}))
    user = fixture['member']['user_id']
    groups = database_rows(inst, "SELECT group_id FROM app_user_groups WHERE user_id='" + user + "'")
    inst.request('PUT', '/api/v1/users/' + user + '/groups', {'groups': [r['group_id'] for r in groups] + delegation['groups']})
    selected = inst.request('POST', '/api/v1/automations/selected', request, auth=token)
    identity, generation = _identity(inst, root)
    require(selected['id'] == root and identity['principal'] == request['principal'] and generation == 1
            and identity['authorized_by'] == {'kind': 'user', 'id': user}, 'Permitted preflight changes selected admission')
    require(inst.request('POST', '/api/v1/automations/selected', request, auth=token) == selected, 'Preflight changes installed command replay')
    self_root = _owned_root(inst)
    self_request = {**request, 'component_id': self_root, 'request_id': uuid.uuid4().hex, 'principal': {'kind': 'user', 'id': user}}
    inst.request('POST', '/api/v1/automations/selected', self_request, auth=token)
    self_identity, _ = _identity(inst, self_root)
    require(self_identity['principal'] == self_identity['authorized_by'] == self_request['principal'], 'Self installation changes its identity')
    inst.evidence.save('selected-preflight-proof', {'root': root, 'identity': identity, 'generation': generation,
        'replay': selected, 'self_identity': self_identity, 'denied_durable_state_absent': True,
        'denied_allocations': denied_allocations})


def selected_install_preflight_controls(ctx):
    from module_harness import run_focused_module_test
    run_focused_module_test(ctx, 'kickside/automation', 'round_reconcile_test')


REGISTRY = [Scenario('selected_install_preflight_controls', 'regression', selected_install_preflight_controls, issues=('AUTOMATION-SELECTED-INSTALL-PREFLIGHT',)),
            Scenario('selected_install_preflight', 'regression', selected_install_preflight,
                     issues=('AUTOMATION-SELECTED-INSTALL-PREFLIGHT', 'RA-H56', 'SMOKE-SELECTED-INSTALL-REFUSAL-PROOF'))]
