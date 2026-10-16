"""Authenticated HTTP qualification of staged ordinary Users installation."""
import json
from pathlib import Path
import shutil
import uuid

import yaml

from harness import Scenario, require
from scenarios_hot_update_work import database_rows
from scenarios_run_as_browser import _bot_fixture

NS = 'smoke.selected_install'
TYPE = NS + ':prepared_task'


def _prepare(ctx):
    inst = ctx.inst
    inst.install('kickside/automation')
    with ctx.paused():
        directory = inst.app / 'src/selected-install-smoke'
        directory.mkdir(exist_ok=True)
        shutil.copyfile(Path(inst.config['source']) / 'platform/users/test/suites/bot_install_probe.lua',
                        directory / 'prepare.lua')
        entries = [
            {'name': 'prepared_task', 'kind': 'contract.binding',
             'meta': {'type': 'kickside.automation', 'class': 'automation', 'title': 'Prepared HTTP fixture', 'inputs': {'type': 'object'}},
             'contracts': [
                 {'contract': 'kickside.contract:installable', 'methods': {'install': NS + ':prepare'}},
                 {'contract': 'kickside.automation:prepared_installable', 'methods': {'prepare_install': NS + ':prepare'}}]},
            {'name': 'prepare', 'kind': 'function.lua', 'source': 'file://prepare.lua', 'method': 'prepare',
             'imports': {'automations': 'kickside.automation:automation'}},
            {'name': 'fixture_access', 'kind': 'security.policy',
             'groups': ['kickside.security.groups:members', 'app.security:user'],
             'policy': {'actions': ['access', 'registry.get', 'funcs.call'],
                        'resources': [TYPE, NS + ':prepare'], 'effect': 'allow'}},
        ]
        (directory / '_index.yaml').write_text(yaml.safe_dump(
            {'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))


def _owned_root(inst):
    component_id = str(uuid.uuid4())
    def cleanup():
        for table in ('kickside_automation_drive', 'kickside_automation_op', 'kickside_automation_command'):
            database_rows(inst, "DELETE FROM " + table + " WHERE automation_id='" + component_id
                          + "' RETURNING automation_id", write=True)
        database_rows(inst, "DELETE FROM kickside_components WHERE component_id='" + component_id
                      + "' RETURNING component_id", write=True)
    inst.cleanup.add('selected installation ' + component_id, cleanup)
    return component_id


def _identity(inst, component_id):
    rows = database_rows(inst, "SELECT CAST(private_context AS TEXT) AS private_context,identity_generation FROM kickside_components WHERE component_id='"
                         + component_id + "'")
    require(len(rows) == 1, 'Selected component does not exist exactly once')
    return json.loads(rows[0]['private_context'])['_execution_identity'], int(rows[0]['identity_generation'])


def assert_unallocated_root(inst, component_id):
    allocations = {}
    for table, column in (
        ('kickside_components', 'component_id'),
        ('kickside_component_access', 'component_id'),
        ('kickside_execution_identity_audit', 'component_id'),
        ('kickside_automation_drive', 'automation_id'),
        ('kickside_automation_op', 'automation_id'),
        ('kickside_automation_command', 'automation_id'),
    ):
        rows = database_rows(inst, 'SELECT ' + column + ' FROM ' + table + " WHERE " + column + "='" + component_id + "'")
        require(not rows, 'Unpermitted selection allocates durable state in ' + table)
        allocations[table] = rows
    return allocations


def selected_install_api(ctx):
    inst = ctx.inst
    _prepare(ctx)
    bot = _bot_fixture(inst, 'selected-bot-' + uuid.uuid4().hex[:12] + '@smoke.example')
    component_id = _owned_root(inst)
    body = {'type': TYPE, 'input': {'title': 'Selected HTTP task'}, 'component_id': component_id,
            'request_id': 'selected:' + component_id, 'principal': {'kind': 'user', 'id': bot}}
    installed = inst.request('POST', '/api/v1/automations/selected', body, label='selected-install-http')
    require(installed.get('success') is True and installed.get('id') == component_id,
            'Selected HTTP installation does not return its reserved UUID')
    identity, generation = _identity(inst, component_id)
    require(identity['principal'] == body['principal'] and identity['component_id'] == component_id,
            'Selected HTTP installation stores another executor or root')
    creator = database_rows(inst, "SELECT subject_id FROM kickside_component_access WHERE component_id='"
                            + component_id + "' AND source_component_id='" + component_id
                            + "' AND subject_type='user' AND access_mask=15")
    require(len(creator) == 1 and identity['authorized_by'] == {'kind': 'user', 'id': creator[0]['subject_id']}
            and creator[0]['subject_id'] != bot, 'Creation replaces the configuring human with its executor')
    audits = database_rows(inst, "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='"
                           + component_id + "' ORDER BY identity_generation")
    require(len(audits) == 2 and generation == 1, 'Selected HTTP installation does not record both identity admissions')
    replay = inst.request('POST', '/api/v1/automations/selected', body, label='selected-install-http-replay')
    require(replay == installed, 'Selected HTTP replay changes its result')
    require(_identity(inst, component_id) == (identity, generation), 'Replay changes the stored identity')
    require(database_rows(inst, "SELECT identity_generation,record_json FROM kickside_execution_identity_audit WHERE component_id='"
                          + component_id + "' ORDER BY identity_generation") == audits, 'Replay adds an identity audit')
    conflict = inst.request('POST', '/api/v1/automations/selected',
                            {**body, 'input': {'title': 'Changed task'}}, expect=(409,), label='selected-install-http-conflict')
    require(conflict.get('success') is False, 'Changed request reports success')
    invalid = inst.request('POST', '/api/v1/automations/selected', {'type': TYPE, 'input': {}},
                           expect=(400,), label='selected-install-http-missing-authority')
    require(invalid.get('success') is False, 'Missing command authority reports success')
    inst.request('POST', '/api/v1/automations/selected', body, auth='', expect=(401,),
                 label='selected-install-http-anonymous')

    email = 'selected-member-' + uuid.uuid4().hex[:12] + '@smoke.example'
    member = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                          'full_name': 'Selected HTTP operator'}, expect=(201,), label='selected-install-member')['user']
    inst.cleanup.add('selected installation member', lambda: inst.request(
        'DELETE', '/api/v1/users/' + member['user_id'], expect=(202,)))
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                         auth='', label='selected-install-member-login')['token']
    inst.redactor.add(token)
    inst.request('GET', '/api/v1/automations', auth=token, label='selected-install-member-module-access')
    denied_id = _owned_root(inst)
    denied = inst.request('POST', '/api/v1/automations/selected',
                          {**body, 'component_id': denied_id, 'request_id': 'selected:' + denied_id},
                          auth=token, expect=(403,), label='selected-install-member-no-delegation')
    require(denied.get('success') is False, 'An ungranted operator selects another principal')
    denied_allocations = assert_unallocated_root(inst, denied_id)

    legacy = inst.request('POST', '/api/v1/automations', {'type': TYPE, 'input': {'title': 'Existing install path'}},
                          label='selected-install-legacy-control')
    legacy_id = legacy['id']
    inst.cleanup.add('legacy installation control', lambda: inst.request('DELETE', '/api/v1/automations/' + legacy_id))
    legacy_identity, _ = _identity(inst, legacy_id)
    require(legacy_identity['principal'] == legacy_identity['authorized_by']
            and legacy_identity['principal']['id'] == creator[0]['subject_id'], 'Existing install changes its human executor')
    inst.evidence.save('selected-install-http-proof', {'component_id': component_id, 'identity': identity,
                      'identity_generation': generation, 'audits': audits, 'denied_allocations': denied_allocations,
                      'legacy_identity': legacy_identity})


REGISTRY = [Scenario('bot_accounts_selected_install_api', 'regression', selected_install_api,
                     issues=('RA-S02', 'RA-H56', 'RA-H19', 'RA-H50', 'RA-H51', 'RA-C03',
                             'SMOKE-SHARED-SOURCE-FIXTURE-REENTRY', 'SMOKE-SELECTED-INSTALL-REFUSAL-PROOF'))]
