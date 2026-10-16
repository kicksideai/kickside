"""Chat-only access to an existing deployment with owned-object cleanup."""
from dataclasses import replace
import json
import os
from pathlib import Path
import shlex
import shutil
from urllib.parse import urlsplit

from harness import Cleanup, Evidence, Redactor, Result, require, validate_run_root
from runtime import Instance
from scenarios import Context


def credentials(path):
    values = {}
    for line in Path(path).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, separator, value = line.removeprefix('export ').partition('=')
        if not separator:
            raise ValueError('Credentials file contains a line without KEY=value')
        parsed = shlex.split(value)
        if len(parsed) != 1:
            raise ValueError('Credentials file values must be single quoted or unquoted strings')
        values[key] = parsed[0]
    for key in ('ADMIN_EMAIL', 'ADMIN_PASSWORD'):
        if not values.get(key):
            raise ValueError('Credentials file requires ' + key)
    return values


def configuration(args):
    target = urlsplit(args.chat_target)
    if target.scheme not in ('http', 'https') or not target.netloc or target.query or target.fragment or target.username:
        raise ValueError('--chat-target must be an HTTP(S) origin')
    path = os.environ.get('SMOKE_CHAT_CREDENTIALS_FILE')
    if not path:
        raise ValueError('Existing targets require SMOKE_CHAT_CREDENTIALS_FILE')
    values = credentials(path)
    model = os.environ.get('SMOKE_LLM_MODEL')
    if not model:
        raise ValueError('Existing targets require SMOKE_LLM_MODEL to verify the default agent')
    root = args.run_root or Path(os.environ.get('SMOKE_RUN_ROOT', ''))
    if not args.run_root and not os.environ.get('SMOKE_RUN_ROOT'):
        raise ValueError('Existing targets require SMOKE_RUN_ROOT or --run-root')
    return {'external': True, 'target': args.chat_target.rstrip('/'), 'credentials': values,
            'run_root': validate_run_root(root), 'published': '', 'source': '', 'replace': {},
            'runtime_version': 'external', 'model': {'llm': model}}


class ExternalInstance(Instance):
    def __init__(self, config, engine, root):
        self.config, self.engine, self.root = config, engine, root
        self.base = config['target']
        self.email = config['credentials']['ADMIN_EMAIL']
        self.password = config['credentials']['ADMIN_PASSWORD']
        self.token = ''
        self.redactor = Redactor(config['credentials'].values())
        self.evidence = Evidence(root, self.redactor)
        self.cleanup = Cleanup()
        self.fixture_state = {}
        self.env = os.environ.copy()
        self.env['TMPDIR'] = str(root / 'temp')
        (root / 'temp').mkdir(parents=True)
        self.cleanup.add('external temporary files', lambda: shutil.rmtree(root / 'temp'))

    def boot(self):
        if not self.token:
            self.login()


def setup(ctx):
    from scenarios_chat import capture_catalog
    inst = ctx.inst
    agents = inst.request('GET', '/api/v1/user-agents')['agents']
    default = ['kickside.agents.traits:trait_master', 'kickside.agents.traits:artifacts',
               'kickside.uploads.traits:file_manager']
    details = [inst.request('GET', '/api/v1/user-agents/' + row['id'])['agent'] for row in agents]
    selected = next((row for row in details if all(trait in row.get('traits', []) for trait in default)), None)
    require(selected, 'Existing target has no default onboarding agent')
    ctx.state['agent'] = selected['id']
    ctx.state['chat_admin'] = {'token': inst.token, 'email': inst.email, 'agent': selected['id']}
    capture_catalog(ctx)
    models = inst.request('GET', '/api/v1/models/admin')['models']
    name = selected['model']
    if name.startswith('class:'):
        classes = inst.request('GET', '/api/v1/models/classes')['classes']
        winners = next(row['models'] for row in classes if row['name'] == name.removeprefix('class:'))
        require(winners, 'Default agent model class is unconfigured')
        name = winners[0]['name']
    model = next(row for row in models if row['name'] == name)
    expected = inst.config['model']['llm']
    require(expected and (model.get('provider_model') == expected or name.endswith('/' + expected)),
            'Existing default agent does not resolve to SMOKE_LLM_MODEL')
    inst.evidence.save('default-agent', selected)


def member_setup(ctx):
    from scenarios_chat import identity, capture_catalog
    inst = ctx.inst
    values = inst.config['credentials']
    require(values.get('MEMBER_EMAIL') and values.get('MEMBER_PASSWORD'),
            'Existing target member checks require MEMBER_EMAIL and MEMBER_PASSWORD in the credentials file')
    member = {'email': values['MEMBER_EMAIL'], 'password': values['MEMBER_PASSWORD'],
              'token': inst.request('POST', '/api/public/user/token',
              {'email': values['MEMBER_EMAIL'], 'password': values['MEMBER_PASSWORD']}, auth='')['token']}
    inst.redactor.add(member['token'])
    with identity(ctx, member):
        agents = inst.request('GET', '/api/v1/user-agents')['agents']
        require(agents, 'Existing member has no onboarding agent')
        member['agent'] = agents[0]['id']
        capture_catalog(ctx)
    ctx.state['chat_member'] = member


def run_target(config, engine, root, selected):
    from smoke import execute_scenario
    inst = ExternalInstance(config, engine, root)
    ctx = Context(inst)
    outcomes, results = {}, []
    try:
        for scenario in selected:
            require(scenario.owner == 'scenarios_chat', 'Existing targets accept chat scenarios only')
            if scenario.name == 'chat_setup':
                scenario = replace(scenario, run=setup)
            elif scenario.name == 'chat_member_setup':
                scenario = replace(scenario, run=member_setup)
            result = execute_scenario(config, engine, scenario, ctx, outcomes, lambda: None)
            outcomes[scenario.name] = result
            results.append(result)
            print(engine + ' ' + scenario.name + ': ' + result.status, flush=True)
    finally:
        errors = inst.cleanup.run()
        results.append(Result('cleanup', engine, 'failed' if errors else 'passed', 0,
                              inst.redactor.text('\n'.join(errors))))
    return results
