"""Authenticated operator and selected-principal declaration preflight."""
from pathlib import Path
import shutil
import uuid

import yaml

from harness import Scenario, require
from scenarios_deferred_authority import _fixture, _user

NAMESPACE = 'smoke.run_as_preflight'
BASE = '/api/v1/run-as-preflight'


def run_as_declaration_preflight(ctx):
    inst = ctx.inst
    inst.install('kickside/automation')
    suffix = uuid.uuid4().hex[:12]
    operators = 'app.security:preflight_operators_' + suffix
    executors = 'app.security:preflight_executors_' + suffix
    _fixture(ctx, operators, unbound_group=executors)
    with ctx.paused():
        fixture = inst.app / 'src' / 'run-as-preflight'
        fixture.mkdir(exist_ok=True)
        shutil.copyfile(Path(__file__).parent / 'mocks/identity_authority/preflight_probe.lua',
                        fixture / 'preflight_probe.lua')
        entries = [
            {'name': 'check', 'kind': 'function.lua', 'source': 'file://preflight_probe.lua',
             'method': 'check', 'modules': ['http', 'json'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity',
                         'declaration_authority': 'kickside.automation:declaration_authority'},
             'security': {'policies': [NAMESPACE + ':fixture_read',
                                      'kickside.automation.security:round_worker_actor',
                                      'kickside.automation.security:execution_scope']}},
            {'name': 'check.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'},
             'method': 'POST', 'path': '/run-as-preflight', 'func': NAMESPACE + ':check'},
            {'name': 'fixture_read', 'kind': 'security.policy',
             'policy': {'actions': 'registry.get', 'resources': NAMESPACE + ':*', 'effect': 'allow'}},
            {'name': 'fixture_access', 'kind': 'security.policy', 'groups': ['app.security:user'],
             'policy': {'actions': ['access', 'funcs.call'],
                        'resources': [NAMESPACE + ':check', NAMESPACE + ':check.endpoint'], 'effect': 'allow'}},
        ]
        for name, groups in [('shared', [operators, executors]), ('operator_only', [operators]),
                             ('executor_only', [executors])]:
            entries.extend([
                {'name': name, 'kind': 'ns.definition'},
                {'name': name + '_read', 'kind': 'security.policy', 'groups': groups,
                 'policy': {'actions': 'registry.get', 'resources': NAMESPACE + ':' + name, 'effect': 'allow'}},
            ])
        (fixture / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NAMESPACE, 'entries': entries}, sort_keys=False))
    selected, _ = _user(inst, suffix, 'preflight-executor', ['app.security:user', 'app.security:members', executors])
    operator, token = _user(inst, suffix, 'preflight-operator', ['app.security:user', 'app.security:members', operators])
    ungranted, ungranted_token = _user(inst, suffix, 'preflight-ungranted', ['app.security:user', 'app.security:members', operators])
    target = {'kind': 'user', 'id': selected['user_id']}
    payload = {'principal': target, 'refs': [{'kind': 'module', 'id': NAMESPACE + ':shared'}]}
    absent = inst.request('POST', BASE, payload, auth=token, expect=(403,), label='preflight-absent-delegation')
    require(absent['operator_allowed'] and not absent['selected_allowed'],
            'Ungrantable selection passes preflight or operator access is missing')
    inst.request('POST', '/api/v1/identity-authority/delegation',
                 {'target_id': selected['user_id'], 'authorizer_id': operator['user_id'], 'group': operators},
                 label='preflight-native-delegation')
    allowed = inst.request('POST', BASE, payload, auth=token, label='preflight-delegated-selection')
    require(allowed['success'] and allowed['principal'] == target
            and allowed['authorized_by'] == {'kind': 'user', 'id': operator['user_id']},
            'Delegated preflight substitutes the configuring caller for the selected executor')
    for resource, operator_allowed, selected_allowed in [('operator_only', True, False),
                                                        ('executor_only', False, True)]:
        result = inst.request('POST', BASE, {**payload, 'refs': [{'kind': 'module', 'id': NAMESPACE + ':' + resource}]},
                              auth=token, expect=(403,), label='preflight-' + resource)
        require(result['operator_allowed'] == operator_allowed and result['selected_allowed'] == selected_allowed,
                'Declaration checks borrow the other principal authority for ' + resource)
    forged = inst.request('POST', BASE, {**payload, 'authorized_by': target}, auth=token, expect=(403,),
                          label='preflight-forged-authorizer')
    require(not forged['selected_allowed'] and forged.get('selected_error'),
            'A forged authorizer passes immediate preflight')
    # The native grant is group-bound. Remove only this user's operator membership.
    inst.request('PUT', '/api/v1/users/' + ungranted['user_id'] + '/groups',
                 {'groups': ['app.security:user', 'app.security:members']}, label='preflight-ungranted-membership')
    ungranted_token = inst.request('POST', '/api/public/user/token',
                                   {'email': ungranted['email'], 'password': inst.password}, auth='',
                                   label='preflight-ungranted-current-session')['token']
    inst.redactor.add(ungranted_token)
    refused = inst.request('POST', BASE, payload, auth=ungranted_token, expect=(403,),
                           label='preflight-ungranted-selection')
    require(not refused['selected_allowed'], 'Unbound native delegation passes preflight')
    self_result = inst.request('POST', BASE, {**payload, 'principal': {'kind': 'user', 'id': operator['user_id']}},
                               auth=token, label='preflight-existing-self-selection')
    require(self_result['success'], 'Existing human self-selection fails after the update')
    inst.evidence.save('run-as-declaration-preflight', {'operator': operator['user_id'],
                       'selected': selected['user_id'], 'shared': allowed, 'self': self_result})


REGISTRY = [
    Scenario('run_as_declaration_preflight', 'full', run_as_declaration_preflight, ('boot',),
             instance_setup=True, issues=('RA-H15', 'RA-H13')),
]
