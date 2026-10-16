"""Member endpoint policy and real authenticated-router acceptance."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import uuid
import yaml

from harness import Scenario, require
from scenarios import member_identity, refresh_member_token, all_checks

HERE = Path(__file__).resolve().parent
NS = 'unrelated.member.acceptance'
STRANGER_GROUP = 'app.security:endpoint_stranger'


def member_endpoint_matrix(ctx):
    inst = ctx.inst
    for module in ('chestor/workspace', 'chestor/graph', 'chestor/journal', 'chestor/roadmap', 'chestor/db-schema',
                   'kickside/crm', 'kickside/dashboard', 'kickside/research', 'kickside/knowledge', 'kickside/kb10',
                   'kickside/code-execution', 'kickside/mcp', 'kickside/mcp-client', 'kickside/simplefin', 'kickside/webscout',
                   'kickside/transform', 'kickside/transfer', 'kickside/workflows', 'kickside/skills', 'kickside/webhooks'):
        parameters = {
            'kickside/transfer': [{'name': 'kickside.transfer:scratch_storage', 'value': 'app:tmp'}],
            'kickside/skills': [{'name': 'kickside.skills:upload_storage', 'value': 'app:uploads'}],
        }.get(module)
        inst.install(module, parameters=parameters)
    from scenarios_studio import install_studio
    install_studio(ctx)
    with ctx.paused():
        fixture = inst.app / 'src' / 'member-endpoint-acceptance'
        fixture.mkdir()
        (fixture / 'probe.lua').write_text((HERE / 'mocks/member_endpoint_probe.lua').read_text())
        entries = [
            {'name': 'handler', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'handler', 'modules': ['http', 'security', 'registry'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'inspect', 'kind': 'function.lua', 'source': 'file://probe.lua', 'method': 'inspect', 'modules': ['http', 'security', 'registry'],
             'imports': {'execution_identity': 'kickside.execution:execution_identity'}},
            {'name': 'declared.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'}, 'method': 'GET', 'path': '/member-acceptance/declared', 'func': NS + ':handler'},
            {'name': 'unmarked.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'}, 'method': 'GET', 'path': '/member-acceptance/unmarked', 'func': NS + ':handler'},
            {'name': 'inspect.endpoint', 'kind': 'http.endpoint', 'meta': {'router': 'app:api'}, 'method': 'GET', 'path': '/member-acceptance/inspect', 'func': NS + ':inspect'},
            {'name': 'module_access', 'kind': 'security.policy', 'meta': {'title': 'Member acceptance', 'surface': NS, 'intent': 'module_access'}, 'groups': [],
             'policy': {'actions': 'access', 'resources': [NS + ':declared.endpoint'], 'effect': 'allow'}},
            {'name': 'overgrant', 'kind': 'security.policy', 'groups': [],
             'policy': {'actions': 'access', 'resources': [NS + ':unmarked.endpoint'], 'effect': 'allow'}},
            {'name': 'handler_access', 'kind': 'security.policy', 'groups': ['app.security:user'], 'policy': {'actions': 'access', 'resources': NS + ':handler', 'effect': 'allow'}},
            {'name': 'stranger_role', 'kind': 'registry.entry', 'meta': {'type': 'kickside.security.role', 'title': 'Endpoint Stranger'}, 'role_id': STRANGER_GROUP, 'protected': False},
            {'name': 'stranger_marker', 'kind': 'security.policy', 'groups': [STRANGER_GROUP], 'policy': {'actions': 'acceptance.marker', 'resources': NS + ':marker', 'effect': 'allow'}},
        ]
        (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': NS, 'entries': entries}, sort_keys=False))
    member = member_identity(ctx)
    email = 'endpoint-stranger-' + uuid.uuid4().hex[:8] + '@smoke.example'
    inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password, 'full_name': 'Endpoint Stranger', 'groups': [STRANGER_GROUP]}, expect=(201,), label='endpoint-stranger-create')
    stranger = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='', label='endpoint-stranger-login')['token']
    inst.redactor.add(stranger)
    result = refresh_member_token(inst, member, '/api/v1/member-acceptance/declared', lambda r: bool(r.get('actor')),
                                  'unrelated-member-route')
    require(result['actor'] == member['id'], 'Declared endpoint loses the member actor')
    inst.request('GET', '/api/v1/member-acceptance/unmarked', auth=member['token'], expect=(403,), label='handler-grant-cannot-admit-endpoint')
    inventory = inst.request('GET', '/api/v1/member-acceptance/inspect', label='composed-member-inventory')
    checks = []
    for route in inventory['routes']:
        path = re.sub(r'\{[^}]+\}', '00000000-0000-4000-8000-000000000731', route['path'])
        for audience, auth, status in [('stranger', stranger, 403), ('anonymous', '', 401)]:
            if audience == 'stranger' and route['baseline']:
                continue
            checks.append((audience + ' ' + route['id'], lambda r=route, p=path, a=auth, code=status, label=audience:
                inst.request(r['method'], p, {} if r['method'] != 'GET' else None, auth=a, expect=(code,), label='endpoint-' + label + '-' + r['id'])))
    for route in inventory['admin_routes']:
        path = re.sub(r'\{[^}]+\}', '00000000-0000-4000-8000-000000000731', route['path'])
        for audience, auth, status in [('member', member['token'], 403), ('stranger', stranger, 403), ('anonymous', '', 401)]:
            checks.append((audience + ' admin ' + route['id'], lambda r=route, p=path, a=auth, code=status, label=audience:
                inst.request(r['method'], p, {} if r['method'] != 'GET' else None, auth=a, expect=(code,), label='admin-endpoint-' + label + '-' + r['id'])))
    all_checks(inst, checks)
    for path in ('/api/v1/renderers', '/api/v1/principals/search?q=Northwind', '/api/v1/identity/links',
                 '/api/v1/transfer/exportable', '/api/v1/skills', '/api/v1/webscout/providers',
                 '/api/v1/component-kinds/create-view', '/api/v1/dashboard/overview'):
        inst.request('GET', path, auth=member['token'], label='member-catalog-' + path.rsplit('/', 1)[-1])
    profile = inst.request('GET', '/api/v1/user/me', auth=member['token'], label='self-service-actor')
    require(member['id'] in json.dumps(profile), 'Self-service selects another actor')
    for method, path, body in [('GET', '/api/v1/users', None), ('GET', '/api/v1/models/admin', None),
                               ('GET', '/api/v1/settings', None), ('POST', '/api/v1/workspace/crm', {'title': 'Refused member schema'}),
                               ('DELETE', '/api/v1/ui/splash/seen', None)]:
        inst.request(method, path, body, auth=member['token'], expect=(403,), label='unmarked-admin-boundary')
    inst.evidence.save('member-endpoint-matrix', {'count': inventory['count'], 'negative_http_checks': len(checks), 'member_id': member['id'],
        'admin_count': len(inventory['admin_routes']), 'policy_matrix': inventory['policy_matrix'],
        'overgrant_rejected': inventory['overgrant_rejected']})


REGISTRY = [Scenario('member_endpoint_matrix', 'full', member_endpoint_matrix, ('boot',), issues=('SEC-MEMBER-MODULE-POLICY-GROUPS',), instance_setup=True)]


def member_generated_plugin(ctx):
    inst = ctx.inst
    with ctx.paused():
        generated = inst.app / 'generated-member-plugin'
        generated.mkdir()
        template = HERE.parents[1] / 'app/templates/plugin'
        shutil.copytree(template / 'src', generated / 'src')
        (generated / 'static').mkdir()
        (generated / 'wippy.yaml').write_text((template / 'wippy.yaml').read_text())
        for path in [generated / 'wippy.yaml', *sorted((generated / 'src').rglob('*'))]:
            if path.is_file():
                text = path.read_text().replace('acme.starter', 'northwind.member_plugin').replace('acme/starter', 'northwind/member-plugin')
                if path.name == 'wippy.yaml':
                    manifest = yaml.safe_load(text)
                    manifest['organization'] = 'northwind'
                    manifest['module'] = 'member-plugin'
                    text = yaml.safe_dump(manifest, sort_keys=False)
                path.write_text(text)
        config_path = inst.app / '.wippy.yaml'
        config = yaml.safe_load(config_path.read_text())
        config.setdefault('workspace', {}).setdefault('replacements', {})['northwind/member-plugin'] = str(generated)
        config_path.write_text(yaml.safe_dump(config, sort_keys=False))
        fixture = inst.app / 'src' / 'generated-plugin-acceptance'
        fixture.mkdir()
        group = 'app.security:generated_plugin_stranger'
        (fixture / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0', 'namespace': 'northwind.generated_acceptance', 'entries': [
            {'name': 'plugin', 'kind': 'ns.dependency', 'component': 'northwind/member-plugin', 'version': '*'},
            {'name': 'stranger_role', 'kind': 'registry.entry', 'meta': {'type': 'kickside.security.role', 'title': 'Generated Plugin Stranger'}, 'role_id': group, 'protected': False},
            {'name': 'stranger_marker', 'kind': 'security.policy', 'groups': [group], 'policy': {'actions': 'generated.plugin.marker', 'resources': 'northwind.generated_acceptance:marker', 'effect': 'allow'}},
        ]}, sort_keys=False))
        for action in ('update', 'install'):
            completed = subprocess.run([inst.config['binary'], '--config', '.wippy.yaml', action], cwd=inst.app, env=inst.env,
                                       capture_output=True, text=True, timeout=300)
            inst.evidence.save('generated-plugin-' + action, {'code': completed.returncode, 'output': completed.stdout, 'error': completed.stderr})
            require(completed.returncode == 0, action + ' generated plugin fails: ' + inst.redactor.text(completed.stderr))
    member = member_identity(ctx)
    expected = {'success': True, 'module': 'northwind/member-plugin', 'count': 0}
    response = refresh_member_token(inst, member, '/api/v1/starter/status', lambda r: r.get('success') is True,
                                    'generated-plugin-member')
    require(response == expected, 'Generated plugin status differs for member')
    response = inst.request('GET', '/api/v1/starter/status', auth=inst.token, label='generated-plugin-admin')
    require(response == expected, 'Generated plugin status differs for admin')
    email = 'generated-plugin-stranger-' + uuid.uuid4().hex[:8] + '@smoke.example'
    inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password, 'full_name': 'Generated Plugin Stranger',
                 'groups': [group]}, expect=(201,), label='generated-plugin-stranger-create')
    stranger = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, auth='', label='generated-plugin-stranger-login')['token']
    inst.redactor.add(stranger)
    inst.request('GET', '/api/v1/starter/status', auth=stranger, expect=(403,), label='generated-plugin-stranger')
    inst.request('GET', '/api/v1/starter/status', auth='', expect=(401,), label='generated-plugin-anonymous')
    inst.evidence.save('generated-plugin-declaration', {'id': 'northwind.member_plugin.api:get_status.endpoint',
                      'endpoint_policy': yaml.safe_load((generated / 'src/security/_index.yaml').read_text())['entries']})


REGISTRY += [Scenario('member_generated_plugin', 'full', member_generated_plugin, ('boot',), issues=('T20',), instance_setup=True)]
