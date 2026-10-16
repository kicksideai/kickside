"""Fresh member login follows Security groups across a live Hub update."""
import shutil
from copy import deepcopy

import yaml

from harness import Scenario, require
from module_lifecycle_contract import update_source
from module_harness import run_focused_module_test
from runtime_fixtures import isolated_fixture
from scenarios_token_continuity import source_fixture, member, issue, NS, PATH

MODULE = 'kickside/security'
GROUP_NS = 'kickside.security.hot_login'
ISSUE = 'SECURITY-HOT-UPDATE-FRESH-MEMBER-LOGIN'


def group_entries(name, *, updated=False):
    group = GROUP_NS + ':' + name
    entries = [
        {'name': name, 'kind': 'security.scope', 'policies': []},
        {'name': 'composition', 'kind': 'registry.entry',
         'meta': {'type': 'kickside.security.group_composition'},
         'group_id': group, 'groups': ['app.security:user']},
    ]
    if updated:
        entries[1]['policies'] = [GROUP_NS + ':current', GROUP_NS + ':deny_removed']
        entries.append({'name': 'default_membership', 'kind': 'registry.entry',
                        'meta': {'type': 'kickside.users.default_membership'},
                        'group_id': group, 'new_users': True})
        for name, resource, effect in (('current', 'added', 'allow'), ('deny_removed', 'removed', 'deny')):
            entries.append({'name': name, 'kind': 'security.policy', 'groups': [],
                            'policy': {'actions': 'smoke.continuity', 'resources': NS + ':' + resource,
                                       'effect': effect}})
    return {'version': '1.0', 'namespace': GROUP_NS, 'entries': entries}


def prepare(ctx):
    source_fixture(ctx)
    inst = ctx.inst
    source = inst.config['replace'].get(MODULE)
    require(source, 'Hot login guard requires the local Security replacement')
    directory = inst.root / 'security-hot-login-update'
    shutil.copytree(source, directory, ignore=shutil.ignore_patterns(
        '.git', '.wippy', 'node_modules', '__pycache__', 'test', 'ui', 'lint-harness'))
    target = directory / 'src/hot_login'
    target.mkdir()
    (target / '_index.yaml').write_text(yaml.safe_dump(group_entries('previous'), sort_keys=False))
    config_path = inst.app / '.wippy.yaml'
    config = yaml.safe_load(config_path.read_text())
    config.setdefault('workspace', {}).setdefault('replacements', {})[MODULE] = str(directory)
    config_path.write_text(yaml.safe_dump(config, sort_keys=False))
    inst.config['replace'] = dict(inst.config['replace'], **{MODULE: str(directory)})
    inst.resolve_dependencies(modules=(MODULE,))
    ctx.state['hot_login_source'] = directory


def hot_login(ctx):
    with isolated_fixture(ctx, config=deepcopy(ctx.inst.config), prepare=prepare) as fixture:
        inst = fixture.inst
        previous = member(inst)
        inst.request('PUT', '/api/v1/users/' + previous['user_id'],
            {'groups': ['app.security:user', GROUP_NS + ':previous']}, label='hot-previous-member-groups')
        issue(inst, previous)
        directory = fixture.state['hot_login_source']
        (directory / 'src/hot_login/_index.yaml').write_text(yaml.safe_dump(
            group_entries('current_members', updated=True), sort_keys=False))
        runtime = inst.process
        update_source(fixture, str(directory), MODULE, live=True, refresh_session=True)
        fresh = member(inst)
        response = inst.request('POST', '/api/public/user/token',
            {'email': fresh['email'], 'password': inst.password}, auth='', label='hot-fresh-member-login')
        token = response['token']
        inst.redactor.add(token)
        require(GROUP_NS + ':current_members' in response['security']['groups'],
                'Fresh login does not receive the updated default group')
        require(GROUP_NS + ':previous' not in response['security']['groups'],
                'Fresh login retains the removed default group')
        decisions = inst.request('GET', PATH, auth=token, label='hot-fresh-member-authority')
        require(decisions['saved'] == {'retained': True, 'removed': False, 'added': True},
                'Fresh member authority differs from the live group policies')
        inst.request('GET', '/api/v1/user/me', auth=token, label='hot-fresh-member-profile')
        removed = inst.request('POST', '/api/public/user/token',
            {'email': previous['email'], 'password': inst.password}, auth='', expect=(403,),
            label='hot-removed-group-login')
        require(removed.get('kind') == 'NotFound' and removed.get('retryable') is False,
                'Removed policy group loses its typed non-retryable error')
        require(inst.process is runtime and runtime.poll() is None, 'Hot login guard restarts the runtime')
        inst.evidence.save('hot-fresh-member-login', {'runtime_pid': runtime.pid, 'restart': False,
            'groups': response['security']['groups'], 'decisions': decisions, 'removed_group': removed})


def native_hot_login(ctx):
    run_focused_module_test(ctx, MODULE, 'scope_projection_test')
    run_focused_module_test(ctx, 'kickside/users', 'login_scope_test')


REGISTRY = [
    Scenario('regression_hot_update_fresh_member_login', 'regression', hot_login,
             ('boot',), issues=(ISSUE,), features=tuple('kickside/users|http|' + route for route in (
                 'POST /api/public/user/token', 'POST /api/v1/users', 'GET /api/v1/user/me'))),
    Scenario('regression_hot_login_group_projection', 'regression', native_hot_login, issues=(ISSUE,)),
]
