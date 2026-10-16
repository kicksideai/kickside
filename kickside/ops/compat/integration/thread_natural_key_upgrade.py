"""Published Core threads retain their identity through a live Hub update."""
from pathlib import Path
import shutil
import uuid
from urllib.parse import quote
import yaml


def verify(ctx):
    from harness import require
    from module_lifecycle_contract import update_source
    from runtime_fixtures import isolated_fixture
    from ops.compat.fetch_baselines import Hub
    from ops.compat.integration.test_run_as_upgrade import write_published_entries
    source = ctx.inst.config['replace']['kickside/core']
    published = {}
    def configure(fixture):
        directory = fixture.inst.app / 'baseline-core'
        directory.mkdir()
        baseline = Hub().fetch('kickside/core', directory)
        published.update(version=baseline['version'], sha256=baseline['sha256'])
        (directory / 'src').mkdir()
        write_published_entries(directory / 'src', baseline['entries'])
        shutil.copyfile(Path(source) / 'wippy.yaml', directory / 'wippy.yaml')
        (directory / 'version.txt').write_text(baseline['version'] + '\n')
        fixture.inst.config['replace'] = {'kickside/core': str(directory)}
        path = fixture.inst.app / '.wippy.yaml'
        config = yaml.safe_load(path.read_text())
        config.setdefault('workspace', {})['replacements'] = fixture.inst.config['replace']
        config['override'] = {
            'kickside.core.threads.api:create_thread:source': Path(__file__).with_suffix('.lua').read_text(),
            'kickside.core.threads.api:create_thread:modules': ['http', 'json', 'contract', 'security'],
        }
        path.write_text(yaml.safe_dump(config, sort_keys=False))

    config = dict(ctx.inst.config, source=None, published='latest', replace={})
    with isolated_fixture(ctx, config=config, prepare=configure) as fixture:
        inst = fixture.inst
        lock = yaml.safe_load((inst.app / 'wippy.lock').read_text())
        baseline = next(row for row in lock['modules'] if row['name'] == 'kickside/core')
        require(baseline['version'] == published['version'], 'Published Core baseline differs from its verified archive')
        marker = uuid.uuid4().hex
        tuples = [{'thread_class': 'published:' + marker, 'external_ref': 'opaque:ref'},
                  {'thread_class': 'published', 'external_ref': marker + ':ref'}]
        before = [inst.request('POST', '/api/v1/threads', key,
                               label='natural-key-published-create-' + str(i)) for i, key in enumerate(tuples)]
        for row in before:
            inst.request('POST', '/api/v1/threads/' + row['thread_id'] + '/messages',
                         {'text': 'Published natural-key history ' + marker},
                         expect=(200, 201), label='natural-key-published-message')
        events = [inst.request('GET', '/api/v1/threads/' + row['thread_id'] + '/events',
                               label='natural-key-published-history')['events'] for row in before]
        pid = inst.process.pid
        token = inst.token
        directory = Path(inst.config['replace']['kickside/core'])
        shutil.rmtree(directory / 'src')
        shutil.copytree(Path(source) / 'src', directory / 'src')
        shutil.copyfile(Path(source) / 'version.txt', directory / 'version.txt')
        update_source(fixture, str(directory), 'kickside/core', live=True)
        identity = 'kickside.core.threads.persist:natural_key'
        applied = inst.request('GET', '/api/v1/keeper/registry/entry?id=' + quote(identity, safe=''),
                               label='natural-key-applied-resolver')['entry']
        require(applied['kind'] == 'library.lua', 'Hub does not apply the natural-key resolver')
        require(inst.process.pid == pid and inst.process.poll() is None, 'Core Hub update replaces the runtime process')
        require(inst.token == token, 'Core Hub update changes the login token')
        after = [inst.request('POST', '/api/v1/threads', key,
                              label='natural-key-updated-replay-' + str(i)) for i, key in enumerate(tuples)]
        require([row['thread_id'] for row in after] == [row['thread_id'] for row in before],
                'Published natural-key identities change after Hub update')
        require(all(row['created'] is False for row in after), 'Hub update recreates published threads')
        for row, history in zip(after, events):
            current = inst.request('GET', '/api/v1/threads/' + row['thread_id'] + '/events', label='natural-key-retained-history')['events']
            require(current == history, 'Core Hub update changes thread event history')
        keys = [{'thread_class': 'fresh:' + marker, 'external_ref': 'tail'},
                {'thread_class': 'fresh', 'external_ref': marker + ':tail'}]
        distinct = [inst.request('POST', '/api/v1/threads', key,
                                 label='natural-key-updated-collision-' + str(i)) for i, key in enumerate(keys)]
        require(distinct[0]['thread_id'] != distinct[1]['thread_id'], 'Updated Core aliases a true natural-key collision')
        require(distinct[1]['thread_id'][14] == '8', 'Verified collision does not allocate UUIDv8')
        inst.evidence.save('natural-key-hub-upgrade', {'published_baseline': published, 'published_graph': lock['modules'], 'runtime_pid': pid,
            'before': [row['thread_id'] for row in before], 'after': [row['thread_id'] for row in after],
            'collision': [row['thread_id'] for row in distinct]})
