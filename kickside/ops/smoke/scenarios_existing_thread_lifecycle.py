"""Stored thread containers retain their lifecycle across installation updates."""
import uuid
import shutil
import yaml

from harness import Scenario, require
from module_harness import run_focused_module_test
from scenarios_core import delete_user
from scenarios_hot_update_work import database_rows
from module_lifecycle_contract import update_source
from runtime_fixtures import isolated_fixture
from scenarios_identity_policy_upgrade import published_source


def existing_thread_lifecycle(ctx):
    source = ctx.inst.config['replace']['kickside/core']
    def prepare(fixture):
        inst = fixture.inst
        directory = inst.app / 'core-update-source'
        receipt = published_source(directory, 'kickside/core', None)
        inst.evidence.save('core-update-baseline', receipt)
        inst.config['replace'] = dict(inst.config['replace'], **{'kickside/core': str(directory)})
        config_path = inst.app / '.wippy.yaml'
        config = yaml.safe_load(config_path.read_text())
        config['workspace']['replacements'] = inst.config['replace']
        config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    config = dict(ctx.inst.config, replace=dict(ctx.inst.config['replace']))
    with isolated_fixture(ctx, config=config, prepare=prepare) as fixture:
        inst = fixture.inst
        email = 'stored.containers.' + uuid.uuid4().hex[:8] + '@smoke.example'
        uid = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                           'full_name': 'Stored containers member', 'groups': ['app.security:members']},
                           expect=(201,), label='stored-member')['user']['user_id']
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='stored-member-token')['token']
        inst.redactor.add(token)
        # Login provisions the member's containers through the workspace plugin.
        from browser import Browser
        member = Browser(inst, session=fixture.browser_session)
        try:
            member.login(email=email, password=inst.password)
            def stored_containers():
                rows = database_rows(inst, "SELECT c.component_id,t.thread_class FROM kickside_components c "
                "JOIN kickside_thread t ON t.id=c.component_id JOIN kickside_component_meta m ON m.component_id=c.component_id "
                "WHERE m.key='owner' AND m.value='" + uid + "' AND t.thread_class IN ('kickside.inbox','kickside.uploads')")
                return rows if len(rows) == 2 else None
            containers = inst.wait(stored_containers, 'Member containers exist')
        finally:
            member.close()
        require({row['thread_class'] for row in containers} == {'kickside.inbox', 'kickside.uploads'}, 'Stored fixture omits member containers')
        ids = [row['component_id'] for row in containers]
        rows = database_rows(inst, "UPDATE kickside_components SET impl_id='kickside.core:thread' WHERE component_id IN (" +
            ','.join("'" + id + "'" for id in ids) + ") OR component_id IN (SELECT id FROM kickside_thread WHERE thread_class='lifecycle') "
            "RETURNING component_id,impl_id", write=True)
        require(len(rows) == 3, 'Stored fixture omits the canonical lifecycle root')
        inst.evidence.save('stored-thread-bindings', rows)
        directory = inst.app / 'core-update-source'
        shutil.rmtree(directory / 'src')
        shutil.copytree(source, directory, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
            '.git', '.wippy', 'wippy.lock', 'node_modules', '__pycache__', 'test', 'lint-harness'))
        update_source(fixture, str(directory), module='kickside/core', live=True, refresh_session=True)
        declaration = inst.request('GET', '/api/v1/keeper/registry/entry?id=kickside.core%3Athread',
                                   label='core-update-thread-declaration')['entry']
        require(declaration['kind'] == 'contract.binding', 'Core Hub update omits the stored thread kind')
        preserved = database_rows(inst, "SELECT component_id,impl_id FROM kickside_components WHERE component_id IN (" +
            ','.join("'" + row['component_id'] + "'" for row in rows) + ")")
        require(sorted(preserved, key=lambda row: row['component_id']) == sorted(rows, key=lambda row: row['component_id']),
                'Core Hub update changes stored thread bindings')
        inst.evidence.save('stored-thread-bindings-after-update', preserved)
        delete_user(inst, uid, email, inst.password)
        inst.request('GET', '/api/v1/user/me', auth=token, expect=(401,), label='stored-token-refused')
        inst.wait(lambda: not database_rows(inst, "SELECT component_id FROM kickside_components WHERE component_id IN (" +
            ','.join("'" + id + "'" for id in ids) + ")"), 'Stored member containers leave lifecycle ownership')


def existing_thread_lifecycle_contract(ctx):
    run_focused_module_test(ctx, 'kickside/core', 'lifecycle_wiring_test')
    run_focused_module_test(ctx, 'kickside/core', 'reaper_test')


REGISTRY = [Scenario('existing_thread_lifecycle', 'regression', existing_thread_lifecycle, ('core_ready',),
                     issues=('USERS-EXISTING-INSTALLATION-DELETE-LIFECYCLE',), instance_setup=True)]

REGISTRY += [Scenario('existing_thread_lifecycle_contract', 'regression', existing_thread_lifecycle_contract,
                      issues=('USERS-EXISTING-INSTALLATION-DELETE-LIFECYCLE',))]
