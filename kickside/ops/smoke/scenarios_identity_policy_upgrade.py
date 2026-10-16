"""Group authority survives a real update from a published module archive."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import uuid

import msgpack
import yaml
import zstandard

from harness import Scenario, require
from module_lifecycle_contract import update_source
from runtime_fixtures import isolated_fixture
from scenarios_token_continuity import credential_snapshot, token_payloads


def published_source(directory, module, baseline, *, application=False):
    from ops.compat.fetch_baselines import Hub
    from ops.compat.integration.test_run_as_upgrade import write_published_entries
    directory.mkdir()
    archive = Hub().fetch(module, directory, baseline)
    raw = (directory / 'baseline.wapp').read_bytes()
    offset, size = struct.unpack('<QQ', raw[-16:])
    decoder = zstandard.ZstdDecompressor()
    index = msgpack.unpackb(decoder.decompress(raw[offset:offset + size]), raw=False)
    resources = index['Resources'] or []
    frames = sorted([index['Metadata'], index['Entries'], *(index['DataFrames'] or []),
                     *(resource['Frame'] for resource in resources)], key=lambda frame: frame['Offset'])
    entries = archive['entries']
    for resource in resources:
        frame = resource['Frame']
        files = msgpack.unpackb(decoder.decompress(raw[frame['Offset']:frame['Offset'] + frame['Size']]), raw=False)['Files']
        identity = resource['ID']['ns'] + ':' + resource['ID']['name']
        target = directory / 'resources' / identity.replace(':', '_')
        for name, file in files.items():
            path = target / name
            require(path.resolve().is_relative_to(target.resolve()), 'Published resource path leaves its root')
            location = file['Location']
            size = file['CompressedSize'] if file['Compressed'] else file['Size']
            if location.get('Chunks'):
                content = bytearray()
                for chunk in sorted(location['Chunks'], key=lambda chunk: chunk['Offset']):
                    require(chunk['Offset'] == len(content), 'Published resource chunks overlap or have gaps')
                    data_frame = frames[chunk['FrameIndex']]
                    require(0 <= chunk['FrameOffset'] <= data_frame['Size'] - chunk['Size'],
                            'Published resource chunk leaves its data frame')
                    start = data_frame['Offset'] + chunk['FrameOffset']
                    content.extend(raw[start:start + chunk['Size']])
                content = bytes(content)
            else:
                data_frame = frames[location['FrameIndex']]
                require(0 <= location['Offset'] <= data_frame['Size'] - size,
                        'Published resource leaves its data frame')
                start = data_frame['Offset'] + location['Offset']
                content = raw[start:start + size]
            require(len(content) == size, 'Published resource stored size fails verification')
            if file['Compressed']:
                content = decoder.decompress(content, max_output_size=file['Size'])
            require(len(content) == file['Size'] and hashlib.sha256(content).hexdigest() == file['Hash'],
                    'Published resource content fails verification')
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
            path.chmod(file['Mode'] & 0o777)
            os.utime(path, (file['ModTime'], file['ModTime']))
        entries[identity] = {'Kind': 'fs.directory', 'Meta': entries[identity]['Meta'],
                             'Data': {'directory': str(target)}}
    (directory / 'src').mkdir()
    write_published_entries(directory / 'src', entries)
    organization, name = module.split('/')
    (directory / 'wippy.yaml').write_text(yaml.safe_dump({'organization': organization, 'module': name,
        'type': 'application' if application else 'plugin', 'directories': {'src': 'src'}}, sort_keys=False))
    if application:
        frame = index['Metadata']
        metadata = msgpack.unpackb(decoder.decompress(raw[frame['Offset']:frame['Offset'] + frame['Size']]), raw=False)
        (directory / '.wippy.yaml').write_text(yaml.safe_dump(dict(version='1.0', **metadata['runtime']), sort_keys=False))
    (directory / 'version.txt').write_text(archive['version'] + '\n')
    return {key: archive[key] for key in ('version', 'sha256')}


def published_policy_group_update(ctx, module, retired, path):
    candidate = ctx.inst.config['replace'][module]
    fixtures = Path(__file__).parent / 'mocks/security_model'
    baseline = json.loads((fixtures / 'published_policy_baselines.json').read_text())[module]
    runtime_policies = yaml.safe_load((fixtures / 'published_policies.yaml').read_text())
    for policy in runtime_policies:
        policy['groups'] = []
        policy['meta'] = {'private': True}
    runtime_ids = ['security.identity.published:' + policy['name'] for policy in runtime_policies]
    published = {}
    def prepare(fixture):
        directory = fixture.inst.app / 'published-module'
        published.update(published_source(directory, module, baseline))
        fixture.inst.config['replace'] = dict(fixture.inst.config['replace'], **{module: str(directory)})
        configuration = fixture.inst.app / '.wippy.yaml'
        data = yaml.safe_load(configuration.read_text())
        data['workspace']['replacements'] = fixture.inst.config['replace']
        configuration.write_text(yaml.safe_dump(data, sort_keys=False))
        permissions = fixture.inst.app / 'src/published-user-permissions'
        permissions.mkdir()
        (permissions / '_index.yaml').write_text(yaml.safe_dump({'version': '1.0',
            'namespace': 'security.identity.published', 'entries': runtime_policies}, sort_keys=False))
        fixture.inst.resolve_dependencies(modules=(module,))
    with isolated_fixture(ctx, config=dict(ctx.inst.config, replace=dict(ctx.inst.config['replace'])), prepare=prepare) as fixture:
        inst = fixture.inst
        slug = 'published-policy-' + uuid.uuid4().hex[:10]
        group = 'kickside.security.scopes:' + slug
        saved = inst.request('POST', '/api/v1/security/scopes', {'slug': slug, 'label': 'Published module group',
            'policies': [retired, *runtime_ids]}, label='published-policy-group')['scope']
        email = slug + '@smoke.example'
        member = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
            'full_name': 'Published group member'}, expect=(201,), label='published-group-member')['user']
        inst.wait(lambda: any(row['id'] == group for row in inst.request('GET', '/api/v1/users/assignable-scopes')['scopes']),
                  'Published group is assignable', seconds=60)
        inst.request('PUT', '/api/v1/users/' + member['user_id'] + '/groups',
                     {'groups': ['app.security:user', group]}, label='published-group-membership')
        token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                             auth='', label='published-group-login')['token']
        inst.redactor.add(token)
        before = inst.request('GET', path, auth=token, label='published-group-access')
        payloads = token_payloads(inst)
        credential_snapshot(inst, 'published-group-credentials-before')
        inst.evidence.save('published-policy-group-baseline', {'module': module, 'published': published,
            'scope': saved, 'member': member['user_id'], 'access': before})
        directory = inst.app / 'published-module'
        shutil.rmtree(directory / 'src')
        shutil.copytree(candidate, directory, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
            '.git', '.wippy', 'node_modules', '__pycache__', 'test', 'lint-harness'))
        update_source(fixture, str(directory), module, live=True)
        credential_snapshot(inst, 'published-group-credentials-after')
        after_payloads = token_payloads(inst)
        require(all(after_payloads.get(key) == value for key, value in payloads.items()),
                'Hub update rewrites or removes a saved token payload')
        inst.request('GET', path, auth=token, label='updated-saved-group-access')
        refreshed = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password},
                                 auth='', label='updated-group-refresh')['token']
        inst.redactor.add(refreshed)
        inst.request('GET', path, auth=refreshed, label='updated-fresh-group-access')
        browser = fixture.browser_check()
        browser.login(email, inst.password)
        browser.frame.locator('.sidebar').wait_for(timeout=30000)
        after = inst.request('GET', '/api/v1/users/' + member['user_id'] + '/groups', label='updated-group-membership')['groups']
        require(set(after) == {'app.security:user', group}, 'Hub update changes the member group assignments')
        inst.evidence.save('published-policy-group-update', {'module': module, 'published': published,
            'member': member['user_id'], 'groups': after, 'saved_token_accepted': True, 'refreshed_token_accepted': True})


REGISTRY = [
    Scenario('regression_published_policy_group_update', 'regression',
             lambda ctx: published_policy_group_update(ctx, 'kickside/connection',
                 'kickside.connection.security:connection_endpoint_access', '/api/v1/connections'),
             issues=('SECURITY-RETIRED-POLICY-GROUP-UPDATE', 'SECURITY-HISTORICAL-GROUP-SHELL-ISOLATION', 'SMOKE-CLI-REPOSITORY-IMPORTS')),
    Scenario('regression_published_core_policy_group_update', 'regression',
             lambda ctx: published_policy_group_update(ctx, 'kickside/agents',
                 'kickside.agents.security:agents_endpoint_access', '/api/v1/user-agents'),
             issues=('SECURITY-RETIRED-POLICY-GROUP-UPDATE', 'SECURITY-HISTORICAL-GROUP-SHELL-ISOLATION', 'SMOKE-CLI-REPOSITORY-IMPORTS')),
]
