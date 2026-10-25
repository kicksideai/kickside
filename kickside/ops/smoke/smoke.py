#!/usr/bin/env python3
"""Run maintained KickSide smoke scenarios against published or source deployments."""
import argparse
from collections import Counter
import re
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import secrets
import shutil
import signal
import subprocess
import sys
import time
import traceback
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from harness import (Result, Redactor, aggregate, load_registry, select_scenarios, validate_run_root,
                     select_attached, requested_scenarios, invalidate_outcomes, schedule, parallel_resources, instance_area)
from runtime import RuntimePool, SourceSnapshot, psql, reap_orphan_databases
from process_supervision import owned_process, stop_owned_tree
from concurrent.futures import ThreadPoolExecutor
import multiprocessing
from multiprocessing.connection import Listener, Client, deliver_challenge, answer_challenge
from multiprocessing import AuthenticationError
import fcntl
import hashlib
import threading

REGISTRY = load_registry(Path(__file__).resolve().parent)


class EngineChoice(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        namespace.engine, namespace.engine_explicit = values, True


def parser():
    result = argparse.ArgumentParser(description=__doc__)
    source = result.add_mutually_exclusive_group()
    source.add_argument('--published', metavar='VERSION|latest')
    source.add_argument('--source', type=Path, metavar='CHECKOUT')
    source.add_argument('--chat-target', metavar='URL', help='Existing instance; chat tier only, no deployment or configuration writes')
    result.add_argument('--replace', action='append', default=[], metavar='ORG/MODULE=PATH')
    result.add_argument('--verify-replacements', action='store_true', help='Explicitly overlay modules when verifying a published app')
    result.add_argument('--engine', choices=('sqlite', 'postgres', 'both'), default='both', action=EngineChoice)
    result.set_defaults(engine_explicit=False)
    result.add_argument('--attach', action='store_true', help='Keep an engine worker alive and reuse prerequisites')
    result.add_argument('--shutdown', action='store_true', help='Clean up attached workers under the run root')
    result.add_argument('--workers', type=int, default=1, help='Maximum independent scenarios in one engine')
    result.add_argument('--_serve', type=Path, help=argparse.SUPPRESS)
    result.add_argument('--tier', choices=('quick', 'full', 'regression', 'chat'), default='quick')
    result.add_argument('--scenario', action='append', default=[], help='Scenario name; repeat or separate with commas')
    result.add_argument('--list', action='store_true')
    result.add_argument('--run-root', type=Path, help='Evidence parent outside any repository; defaults to SMOKE_RUN_ROOT')
    return result


def runtime_version(binary):
    output = subprocess.run([binary, 'version'], text=True, capture_output=True, timeout=35, check=True).stdout
    match = re.search(r'\b(v\d+\.\d+\.\d+[a-z]*|nightly-\d{8}-[0-9a-f]+)\b', output)
    if not match:
        raise ValueError('Wippy did not report a recognizable version')
    expected = os.environ.get('SMOKE_WIPPY_VERSION', '')
    if expected and match.group(1) != expected:
        raise ValueError(f'SMOKE_WIPPY_VERSION is {expected}; the binary reports {match.group(1)}')
    return match.group(1)


def validate_args(args):
    if args.workers < 1:
        raise ValueError('Workers must be positive')
    if args.attach and not args.engine_explicit:
        args.engine = 'sqlite'
    if args.replace and not (args.source or (args.published and args.verify_replacements)):
        raise ValueError('--replace requires --source or --published with --verify-replacements')
    if args.verify_replacements and not (args.published and args.replace):
        raise ValueError('--verify-replacements requires --published and --replace')
    if args.chat_target and (args.tier != 'chat' or args.engine == 'both' or args.attach or args.shutdown or args.replace):
        raise ValueError('--chat-target requires --tier chat and one explicit --engine; deployment options are unavailable')
    if not args.list and not args.shutdown and not args._serve and not (args.published or args.source or args.chat_target):
        raise ValueError('Select --published or --source')


def configuration(args):
    validate_args(args)
    def env(name):
        value = os.environ.get(name, '')
        if not value:
            raise ValueError('Required environment variable: ' + name)
        return value
    binary = os.environ.get('SMOKE_WIPPY_BIN') or shutil.which('wippy')
    if not binary:
        raise ValueError('Set SMOKE_WIPPY_BIN or put Wippy on PATH')
    version = runtime_version(binary)
    model_names = ['SMOKE_LLM_BASE_URL', 'SMOKE_LLM_API_KEY', 'SMOKE_LLM_MODEL', 'SMOKE_EMBED_MODEL']
    values = [os.environ.get(name, '') for name in model_names]
    if any(values) and not all(values):
        raise ValueError('Model configuration is incomplete; set all four SMOKE model variables or unset all four')
    model = dict(zip(('base', 'key', 'llm', 'embed'), values)) if all(values) else {}
    if args.tier == 'chat' and not model:
        raise ValueError('The chat tier requires all four SMOKE model variables; it cannot skip real-model checks')
    pg = {}
    if args.engine in ('postgres', 'both'):
        pg = dict(zip(('host', 'port', 'user', 'password'), [env(name) for name in
                      ('SMOKE_PG_HOST', 'SMOKE_PG_PORT', 'SMOKE_PG_USER', 'SMOKE_PG_PASSWORD')]))
        pg.update(maintenance=os.environ.get('SMOKE_PG_MAINTENANCE_DB', 'postgres'),
                  sslmode=os.environ.get('SMOKE_PG_SSLMODE', 'require'),
                  pool_max_open=os.environ.get('SMOKE_PG_POOL_MAX_OPEN', '12'),
                  pool_max_idle=os.environ.get('SMOKE_PG_POOL_MAX_IDLE', '4'))
    replacements = {}
    for specification in args.replace:
        module, separator, path = specification.partition('=')
        if not separator or module.count('/') != 1 or not Path(path).is_dir():
            raise ValueError('Invalid replacement; use org/module=existing-directory')
        if module in replacements:
            raise ValueError('Duplicate replacement: ' + module)
        if module in ('wippy/session', 'wippy/framework', 'wippy/facade', 'wippy/web', 'wippy/webcomponent', 'wippy/theme'):
            raise ValueError('Runtime/framework/facade/web/theme replacements are prohibited: ' + module)
        replacements[module] = str(Path(path).resolve())
    run_root = validate_run_root(args.run_root or Path(env('SMOKE_RUN_ROOT')))
    if args.source:
        source = args.source.resolve()
        if not (source / 'app/.wippy.yaml').is_file():
            raise ValueError('Source checkout has no app/.wippy.yaml')
    return {'binary': str(Path(binary).resolve()), 'host': env('SMOKE_HOST'), 'pg': pg, 'model': model,
            'email': os.environ.get('SMOKE_ADMIN_EMAIL') or 'admin-' + uuid.uuid4().hex[:8] + '@smoke.example',
            'password': os.environ.get('SMOKE_ADMIN_PASSWORD') or secrets.token_urlsafe(24),
            'source': str(args.source.resolve()) if args.source else '', 'published': args.published or '',
            'replace': replacements, 'run_root': run_root, 'runtime_version': version,
            'database_prefix': os.environ.get('SMOKE_DB_PREFIX', 'smoke')}


def write_results(root, results, tier, config, timings=None):
    counts = aggregate(results)
    document = {'tier': tier, 'published': config['published'], 'source': config['source'],
                'runtime_version': config['runtime_version'], 'counts': counts, 'timings': timings or {},
                'results': [result.as_dict() for result in results]}
    (root / 'results.json').write_text(json.dumps(document, indent=2) + '\n')
    lines = [f'# KickSide smoke: {tier}', '',
             f"{counts['passed']} passed; {counts['failed']} failed; {counts['skipped']} skipped.", '',
             '| Engine | Scenario | Status | Seconds |', '| --- | --- | --- | ---: |']
    for result in results:
        lines.append(f'| {result.engine} | {result.scenario} | {result.status} | {result.duration:.2f} |')
    if timings:
        lines += ['', '## Timings', '', '```json', json.dumps(timings, indent=2), '```']
    failed = [result for result in results if result.error]
    if failed:
        lines += ['', '## Findings', '']
        for result in failed:
            lines += [f'### {result.engine}: {result.scenario}', '', '```text', result.error, '```', '']
    (root / 'summary.md').write_text('\n'.join(lines) + '\n')
    return counts


def execute_scenario(config, engine, scenario, ctx, outcomes, activate):
    inst = ctx.inst
    started = time.monotonic()
    inst.evidence.label = config.get('evidence_prefix', '') + scenario.name
    path_offset = len(inst.evidence.paths)
    original_browser = ctx.browser
    error_offset = len(original_browser.errors) if original_browser else 0
    status, error = 'passed', ''
    blocked, roots = [], []
    try:
        if scenario.model and not config['model']:
            status = 'skipped: no model configured'
        else:
            blocked = [name for name in scenario.requires if outcomes[name].status != 'passed']
            if blocked:
                roots = sorted({root for name in blocked for root in (outcomes[name].failure_roots or [name])})
                raise RuntimeError('Prerequisite fails: ' + '; '.join(
                    name + ': ' + (outcomes[name].error or outcomes[name].status) for name in blocked))
            inst.boot()
            ctx.resume_browser()
            activate()
            if scenario.navigation:
                ctx.navigate(scenario.navigation)
            scenario.run(ctx)
            if scenario.capture_navigation:
                key, = scenario.capture_navigation
                ctx.state[key] = ctx.browser.current_session()
    except Exception as failure:
        status = 'failed'
        roots = roots or [scenario.name]
        error = inst.redactor.text(f'{type(failure).__name__}: {failure}')
        inst.evidence.save('failure', {'error': error, 'traceback': traceback.format_exc()})
    finally:
        cleanup_errors = inst.cleanup.run(scope='scenario')
        if cleanup_errors:
            status = 'failed'
            error += ('\n' if error else '') + inst.redactor.text('\n'.join(cleanup_errors))
        if ctx.browser and not blocked:
            if ctx.browser is not original_browser:
                error_offset = 0
            try:
                ctx.browser.settle()
            except Exception as failure:
                status = 'failed'
                error += ('\n' if error else '') + inst.redactor.text(f'{type(failure).__name__}: {failure}')
            try:
                ctx.browser.screenshot('screen')
                ctx.browser.clean(error_offset)
            except Exception as failure:
                status = 'failed'
                error += ('\n' if error else '') + inst.redactor.text(f'{type(failure).__name__}: {failure}')
        if ctx.browser:
            try:
                if ctx.browser.crashes:
                    ctx.close_browser()
                else:
                    ctx.suspend_browser()
            except Exception as failure:
                status = 'failed'
                error += ('\n' if error else '') + inst.redactor.text(f'{type(failure).__name__}: {failure}')
        if parallel_resources(scenario) and ctx.browser_session is not None:
            try:
                ctx.browser_session.close()
            except Exception as failure:
                status = 'failed'
                diagnostic = inst.redactor.text(f'{type(failure).__name__}: {failure}')
                error += ('\n' if error else '') + diagnostic
                inst.evidence.save('browser-session-cleanup-failure', {'error': diagnostic})
    result = Result(scenario.name, engine, status, round(time.monotonic() - started, 3),
                    error, inst.evidence.paths[path_offset:], scenario.features,
                    scenario.owner, blocked, roots or ([scenario.name] if status == 'failed' else []))
    return result


def run_engine(config, engine, root, selected, results, tier):
    root.mkdir(parents=True)
    pool = RuntimePool(config, engine, root)
    inst = None
    import tempfile
    previous_tempdir, previous_env_temp = tempfile.tempdir, os.environ.get('TMPDIR')
    outcomes = {}
    interrupted = None
    try:
        for scenario in selected:
            ctx = pool.context(scenario.owner)
            inst = ctx.inst
            os.environ['TMPDIR'] = inst.env['TMPDIR']
            tempfile.tempdir = None
            result = execute_scenario(config, engine, scenario, ctx, outcomes,
                                      lambda: pool.activate(scenario.owner))
            results.append(result)
            outcomes[scenario.name] = result
            print(f'{engine} {scenario.name}: {result.status} ({result.duration:.1f}s)', flush=True)
            write_results(root.parent, results, tier, config)
    except BaseException as failure:
        interrupted = failure
        results.append(Result('interrupted', engine, 'failed', 0, str(failure) if inst is None else inst.redactor.text(f'{type(failure).__name__}: {failure}')))
    finally:
        started = time.monotonic()
        errors = pool.cleanup()
        if inst is not None:
            errors = [inst.redactor.text(error) for error in errors]
        tempfile.tempdir = previous_tempdir
        if previous_env_temp is None:
            os.environ.pop('TMPDIR', None)
        else:
            os.environ['TMPDIR'] = previous_env_temp
        results.append(Result('cleanup', engine, 'failed' if errors else 'passed',
                              round(time.monotonic() - started, 3), '\n'.join(errors), [str(ctx.inst.root / 'runtime.log') for ctx in pool.contexts.values()]))
        write_results(root.parent, results, tier, config)
    if interrupted:
        raise interrupted


class EngineRunner:
    """Retain contexts, fixtures, prerequisites, and thread-owned browser drivers."""
    def __init__(self, config, engine, root):
        self.config, self.engine, self.root = config, engine, root
        self.pool = RuntimePool(config, engine, root / ('instances-' + uuid.uuid4().hex[:8]))
        self.outcomes, self.executors, self.sessions, self.contexts = {}, {}, {}, {}
        self.native_root_contexts = set()
        self.setup_attempts = set()
        self.restart_reasons = []
        self.context_lock = threading.RLock()
        self.snapshot = SourceSnapshot(config, engine)

    @staticmethod
    def native_root_only(scenario):
        """Focused native guards need scheduler capacity, not browser affinity."""
        claims = parallel_resources(scenario)
        return bool(claims) and all(claim.startswith('native-root:') for claim in claims)

    def context(self, scenario):
        with self.context_lock:
            from browser import BrowserSession
            from scenarios import Context
            key = scenario.name if parallel_resources(scenario) else scenario.owner
            owner = self.pool.context(scenario.owner)
            if key not in self.contexts:
                session = self.sessions[key] = BrowserSession()
                ctx = Context(owner.inst, session) if parallel_resources(scenario) else owner
                ctx.browser_session = session
                ctx.restart_runtime = self.restart_instance
                ctx.pause_runtime = self.pause_instance
                self.contexts[key] = ctx
                if self.native_root_only(scenario):
                    self.native_root_contexts.add(key)
                else:
                    self.executors[key] = ThreadPoolExecutor(max_workers=1)
                if ctx is not owner:
                    ctx.inst.cleanup.add(key + ' fixtures', ctx.fixtures.stop)
            ctx = self.contexts[key]
            if ctx is not owner:
                ctx.state.update(owner.state)
            main = self.pool.contexts.get('scenarios')
            if main is not None and main is not ctx and ctx.inst is main.inst:
                for name, value in main.state.items():
                    ctx.state.setdefault(name, value)
            return key, ctx, owner

    def pause_instance(self, ctx, hard=False):
        from browser import Browser
        contexts = [(key, context) for key, context in self.contexts.items() if context.inst is ctx.inst]
        def dispatch(context, operation):
            if context is ctx:
                return operation(context)
            key = next(key for key, candidate in contexts if candidate is context)
            if key in getattr(self, 'native_root_contexts', ()):
                return operation(context)
            return self.executors[key].submit(operation, context).result()
        return Browser.paused(ctx.inst, [context for _, context in contexts], dispatch, hard=hard)

    def restart_instance(self, ctx, hard=False):
        with self.pause_instance(ctx, hard=hard):
            pass
        return ctx.browser

    def run(self, tier, names, workers, completed=None):
        import tempfile
        requested = requested_scenarios(REGISTRY, tier, names)
        retry_selection = select_attached(REGISTRY, tier, names, self.outcomes)
        setups = [s for s in retry_selection if s.instance_setup and s.name in self.setup_attempts]
        self.restart_reasons = ['instance setup rerun: ' + s.name + ' (' + instance_area(s.owner) + ')' for s in setups]
        if setups:
            self.restart(self.config, {instance_area(s.owner) for s in setups})
        temporary = self.root / 'temp'
        temporary.mkdir(parents=True, exist_ok=True)
        previous_tempdir, previous_env_temp = tempfile.tempdir, os.environ.get('TMPDIR')
        os.environ['TMPDIR'] = str(temporary)
        tempfile.tempdir = str(temporary)
        invalidate_outcomes(REGISTRY, self.outcomes, requested)
        selected = select_attached(REGISTRY, tier, names, self.outcomes)
        def run_one(scenario):
            key, ctx, owner = self.context(scenario)
            def execute():
                if ctx is not owner:
                    ctx.state.clear()
                    ctx.state.update(owner.state)
                main = self.pool.contexts.get('scenarios')
                if main is not None and main is not ctx and ctx.inst is main.inst:
                    for name, value in main.state.items():
                        ctx.state.setdefault(name, value)
                if scenario.instance_setup and (not scenario.model or self.config['model']) and all(
                        self.outcomes[name].status == 'passed' for name in scenario.requires):
                    with self.context_lock:
                        self.setup_attempts.add(scenario.name)
                before = dict(ctx.state)
                def activate():
                    if scenario.owner in self.pool.browser_areas and ctx.browser is None:
                        ctx.browser_check().login()
                    # Existing declared parallel scenarios retain their
                    # activation browser. Focused native guards explicitly
                    # claim only native module roots and require no browser.
                    claims = parallel_resources(scenario)
                    if (claims and not self.native_root_only(scenario)
                            and ctx.browser is None):
                        ctx.browser_check()
                result = execute_scenario(self.config, self.engine, scenario, ctx, self.outcomes, activate)
                if ctx is not owner and result.status == 'passed':
                    with self.context_lock:
                        owner.state.update({name: value for name, value in ctx.state.items()
                                            if name not in before or value != before[name]})
                        for name in before.keys() - ctx.state.keys():
                            owner.state.pop(name, None)
                return result
            if self.native_root_only(scenario):
                return execute()
            return self.executors[key].submit(execute).result()
        try:
            return schedule(selected, run_one, self.outcomes, workers, completed)
        finally:
            tempfile.tempdir = previous_tempdir
            if previous_env_temp is None:
                os.environ.pop('TMPDIR', None)
            else:
                os.environ['TMPDIR'] = previous_env_temp

    def synchronize(self, config):
        after = SourceSnapshot(config, self.engine)
        changes = self.snapshot.changes(after)
        if not changes['restart'] and changes['edits']:
            for inst in self.pool.instances.values():
                if inst.prepared:
                    inst.boot()
                    edits = inst.loaded_edits(changes['edits'])
                    if edits and not inst.live_reload(edits):
                        changes['restart'].append('Keeper live-edit tools unavailable')
                        break
        if changes['restart']:
            self.restart(config)
        else:
            for inst in self.pool.instances.values():
                if inst.prepared:
                    inst.sync_assets(changes['assets'])
            self.snapshot = after
        return changes

    def restart(self, config, areas=None):
        result = self.close(areas)
        if result.status != 'passed':
            raise RuntimeError(result.error)
        if areas is None:
            self.__init__(config, self.engine, self.root)
        else:
            invalid = [s.name for s in REGISTRY if instance_area(s.owner) in areas]
            invalidate_outcomes(REGISTRY, self.outcomes, invalid)
            self.setup_attempts.difference_update(invalid)
            for owner in list(self.pool.contexts):
                if instance_area(owner) in areas:
                    del self.pool.contexts[owner]
            for area in areas:
                self.pool.instances.pop(area, None)

    def close(self, areas=None):
        started = time.monotonic()
        errors = []
        instances = {self.pool.instances[area] for area in areas if area in self.pool.instances} if areas is not None else set()
        for key, ctx in list(self.contexts.items()):
            if areas is not None and ctx.inst not in instances:
                continue
            def close_context():
                failures = []
                try:
                    ctx.close_browser()
                except Exception as failure:
                    failures.append(ctx.inst.redactor.text(f'{key} browser: {failure}'))
                try:
                    self.sessions[key].close()
                except Exception as failure:
                    failures.append(ctx.inst.redactor.text(f'{key} session: {failure}'))
                return failures
            if key in getattr(self, 'native_root_contexts', ()):
                errors.extend(close_context())
                self.native_root_contexts.remove(key)
            else:
                executor = self.executors.pop(key)
                errors.extend(executor.submit(close_context).result())
                executor.shutdown(wait=True)
            del self.contexts[key], self.sessions[key]
        errors.extend(self.pool.cleanup() if areas is None else self.pool.cleanup(areas))
        temporary = self.root / 'temp'
        if areas is None and temporary.exists():
            shutil.rmtree(temporary)
        return Result('cleanup', self.engine, 'failed' if errors else 'passed',
                      round(time.monotonic() - started, 3), '\n'.join(errors))


def private_json(path, value):
    with path.open('w') as output:
        os.chmod(path, 0o600)
        json.dump(value, output)


CONTROL_MESSAGE_LIMIT = 64 * 1024


def send_message(connection, root, message):
    if not isinstance(message, dict):
        raise TypeError('Control messages must be JSON objects')
    payload = json.dumps(message).encode()
    if len(payload) > CONTROL_MESSAGE_LIMIT:
        filename = 'control-' + uuid.uuid4().hex + '.json'
        private_json(root / filename, message)
        payload = json.dumps({'payload_file': filename}).encode()
    connection.send_bytes(payload)


def receive_message(connection, root):
    packet = json.loads(connection.recv_bytes(CONTROL_MESSAGE_LIMIT))
    if isinstance(packet, dict) and set(packet) == {'payload_file'}:
        filename = packet['payload_file']
        if not isinstance(filename, str) or not re.fullmatch(r'control-[0-9a-f]{32}\.json', filename):
            raise ValueError('Invalid control payload filename')
        path = root / filename
        if path.resolve().parent != root.resolve():
            raise ValueError('Control payload leaves its run root')
        packet = json.loads(path.read_text())
    if not isinstance(packet, dict):
        raise ValueError('Control messages must be JSON objects')
    return packet


def accept_authenticated(listener, authkey):
    while True:
        connection = listener.accept()
        try:
            deliver_challenge(connection, authkey)
            answer_challenge(connection, authkey)
            return connection
        except (AuthenticationError, EOFError, OSError) as failure:
            connection.close()
            if isinstance(failure, OSError) and not isinstance(failure, ConnectionError) and str(failure) != 'bad message length':
                raise
            print('Attached worker rejects authentication: ' + type(failure).__name__ + ': ' + str(failure),
                  file=sys.stderr, flush=True)


def harness_fingerprint(directory=None):
    directory = directory or Path(__file__).resolve().parent
    files = sorted(directory.glob('*.py'))
    return hashlib.sha256(b''.join(path.read_bytes() for path in files)).hexdigest()


def serve(root):
    """Accept authenticated JSON commands on a loopback socket."""
    startup = root / 'startup.json'
    data = json.loads(startup.read_text())
    startup.unlink()
    runner = EngineRunner(data['config'], data['engine'], root)
    connection = None
    def interrupt(signum, frame):
        raise KeyboardInterrupt('Signal ' + str(signum))
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, interrupt)
    authkey = bytes.fromhex(data['authkey'])
    listener = Listener(('127.0.0.1', 0))
    private_json(root / 'worker.json', {'address': listener.address, 'authkey': data['authkey'],
                                      'pid': os.getpid(), 'harness': harness_fingerprint()})
    try:
        while True:
            connection = accept_authenticated(listener, authkey)
            command = receive_message(connection, root)
            if command['action'] == 'shutdown':
                result = runner.close()
                private_json(root / 'cleanup.json', result.as_dict())
                send_message(connection, root, {'results': [result.as_dict()], 'done': True})
                runner = None
                break
            started = time.monotonic()
            boots_before = {inst: getattr(inst, 'boot_seconds', 0) for inst in runner.pool.instances.values()}
            try:
                changes = runner.synchronize(command['config'])
                runner.config['evidence_prefix'] = command['run'] + '/'
                def completed(result):
                    private_json(root / 'state.json', {'satisfied': sorted(
                        name for name, outcome in runner.outcomes.items() if outcome.status == 'passed')})
                    send_message(connection, root, {'result': result.as_dict()})
                results = runner.run(command['tier'], command['names'], command['workers'], completed)
                changes['restart'].extend(runner.restart_reasons)
                send_message(connection, root, {'done': True, 'timings': {
                    'mode': 'attached', 'wall_seconds': round(time.monotonic() - started, 3),
                    'workers': command['workers'], 'reload': {
                        'restart': changes['restart'], 'changed': changes['changed'],
                        'entries': [edit['id'] for edit in changes['edits']], 'assets': changes['assets']},
                    'cold_boot_seconds': sum(getattr(inst, 'boot_seconds', 0) for inst in runner.pool.instances.values()),
                    'boot_seconds': max(0, sum(getattr(inst, 'boot_seconds', 0) for inst in runner.pool.instances.values()) - sum(boots_before.get(inst, 0) for inst in runner.pool.instances.values()))}})
            except Exception as failure:
                error = str(failure)
                for inst in runner.pool.instances.values():
                    error = inst.redactor.text(error)
                send_message(connection, root, {'done': True, 'result': Result('worker', data['engine'], 'failed',
                    round(time.monotonic() - started, 3), error).as_dict(),
                    'timings': {'mode': 'attached', 'wall_seconds': round(time.monotonic() - started, 3)}})
            connection.close()
            connection = None
    finally:
        if runner is not None:
            private_json(root / 'cleanup.json', runner.close().as_dict())
        listener.close()
        private_json(root / 'state.json', {'satisfied': [], 'stopped': True})
        (root / 'worker.json').unlink(missing_ok=True)
        if connection is not None:
            connection.close()


def attached(config, engine, run, tier, names, workers, shutdown=False):
    root = config['run_root'] / ('.attached-' + engine)
    root.mkdir(parents=True, exist_ok=True)
    os.chmod(root, 0o700)
    with (root / 'lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        descriptor = root / 'worker.json'
        if descriptor.exists() and not shutdown:
            data = json.loads(descriptor.read_text())
            if data.get('harness') != harness_fingerprint():
                print(engine + ' restarts attached worker for changed harness/scenarios', flush=True)
                with Client(tuple(data['address']), authkey=bytes.fromhex(data['authkey'])) as old:
                    send_message(old, root, {'action': 'shutdown'})
                    response = receive_message(old, root)
                    if aggregate([Result(**row) for row in response['results']])['exit_code']:
                        raise RuntimeError('Attached worker cleanup fails: ' + str(response['results']))
                deadline = time.monotonic() + 35
                while descriptor.exists():
                    if time.monotonic() >= deadline:
                        raise RuntimeError('Attached worker shutdown timeout after 35 seconds')
                    time.sleep(.1)
        if not descriptor.exists():
            if shutdown:
                return [], {'mode': 'shutdown', 'already_stopped': True}
            data = {'config': {**config, 'run_root': str(config['run_root'])}, 'engine': engine,
                    'authkey': secrets.token_hex(32)}
            private_json(root / 'startup.json', data)
            with (root / 'worker.log').open('a') as output:
                process = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '--_serve', str(root)],
                                           stdout=output, stderr=subprocess.STDOUT, start_new_session=True)
            deadline = time.monotonic() + 35
            while not descriptor.exists():
                if process.poll() is not None:
                    raise RuntimeError('Attached worker exits; see ' + str(root / 'worker.log'))
                if time.monotonic() >= deadline:
                    process.terminate()
                    process.wait(timeout=10)
                    raise RuntimeError('Attached worker readiness timeout after 35 seconds')
                time.sleep(.1)
        data = json.loads(descriptor.read_text())
        connection = Client(tuple(data['address']), authkey=bytes.fromhex(data['authkey']))
        try:
            send_message(connection, root, {'action': 'shutdown' if shutdown else 'run',
                'config': {**config, 'run_root': str(config['run_root'])}, 'tier': tier,
                'names': names, 'workers': workers, 'run': run.name})
            results = []
            while True:
                if not connection.poll(30):
                    print(engine + ' attached scenarios remain active', flush=True)
                    continue
                response = receive_message(connection, root)
                if 'result' in response:
                    result = Result(**response['result'])
                    results.append(result)
                    print(f'{engine} {result.scenario}: {result.status} ({result.duration:.1f}s)', flush=True)
                if response.get('done'):
                    results.extend(Result(**row) for row in response.get('results', []))
                    return results, response.get('timings', {'mode': 'shutdown'})
        finally:
            connection.close()


def engine_process(config, engine, root, selected_names, tier, workers, connection):
    def interrupt(signum, frame):
        raise KeyboardInterrupt('Signal ' + str(signum))
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, interrupt)
    results = []
    started = time.monotonic()
    runner = None
    try:
        root.mkdir(parents=True, exist_ok=True)
        runner = EngineRunner(config, engine, root)
        selected = select_scenarios(REGISTRY, tier, selected_names)
        areas = {scenario.name: instance_area(scenario.owner) for scenario in selected}
        remaining = Counter(areas.values())
        owners = {scenario.name: scenario.owner for scenario in selected
                  if not parallel_resources(scenario)}
        remaining_owners = Counter(owners.values())
        isolated = {instance_area(owner) for owner in RuntimePool.isolated}
        def completed(result):
            results.append(result)
            owner = owners.get(result.scenario)
            if owner is not None:
                remaining_owners[owner] -= 1
                if remaining_owners[owner] == 0:
                    runner.executors[owner].submit(runner.sessions[owner].close).result()
            area = areas[result.scenario]
            remaining[area] -= 1
            if area in isolated and remaining[area] == 0:
                instance = runner.pool.instances.get(area)
                if instance is not None:
                    instance.stop()
            print(f'{engine} {result.scenario}: {result.status} ({result.duration:.1f}s)', flush=True)
            write_results(root, results, tier, config)
        runner.run(tier, selected_names, workers, completed)
    except BaseException as failure:
        redactor = Redactor()
        redactor.collect(config)
        redactor.add(config.get('model', {}).get('key'))
        error = redactor.text(failure)
        trace = redactor.text(traceback.format_exc())
        if runner:
            for inst in runner.pool.instances.values():
                error = inst.redactor.text(error)
                trace = inst.redactor.text(trace)
        diagnostic = root / 'engine-error.json'
        private_json(diagnostic, {'kind': type(failure).__name__, 'message': error,
                                 'details': {'traceback': trace}})
        results.append(Result('engine', engine, 'failed', 0, error, [str(diagnostic)]))
    finally:
        if runner is not None:
            results.append(runner.close())
        timing = {'mode': 'fresh', 'workers': workers,
                        'cold_boot_seconds': sum(getattr(inst, 'boot_seconds', 0) for inst in runner.pool.instances.values()) if runner else 0,
                        'wall_seconds': round(time.monotonic() - started, 3)}
        write_results(root, results, tier, config, timing)
        send_message(connection, root, {'results_file': str(root / 'results.json'), 'timings': timing})
        connection.close()


def finish_worker(process, engine, root, config, results):
    if not process.is_alive():
        return
    process.terminate()
    process.join(timeout=30)
    if not process.is_alive():
        return
    worker_root = root / engine
    record = json.loads((worker_root / 'worker-process.json').read_text())
    if record['pid'] != process.pid:
        raise RuntimeError('Worker ownership record does not match the spawned process')
    diagnostic = worker_root / 'worker-cleanup-timeout.json'
    message = 'Worker cleanup exceeds 30 seconds'
    private_json(diagnostic, {'error': message, 'process': record})
    receipt = stop_owned_tree(record, grace_seconds=0)
    process.join(timeout=10)
    if process.is_alive():
        raise RuntimeError('Owned worker does not exit after forced shutdown')
    databases = reap_orphan_databases(worker_root, lambda sql: psql(config['pg'], os.environ, sql))
    private_json(diagnostic, {'error': message, 'shutdown': receipt,
                             'owned_databases_dropped': databases})
    results.append(Result('worker', engine, 'failed', 0, message, [str(diagnostic)]))


def main(argv=None):
    args = parser().parse_args(argv)
    if args._serve:
        serve(args._serve)
        return 0
    names = [name for item in args.scenario for name in item.split(',')]
    try:
        validate_args(args)
        selected = select_scenarios(REGISTRY, args.tier, names)
        if args.list:
            for scenario in selected:
                print(f'{scenario.name:26} {scenario.tier:5} model={str(scenario.model).lower()} requires={",".join(scenario.requires)}')
            return 0
        if args.shutdown:
            run_root = args.run_root or Path(os.environ.get('SMOKE_RUN_ROOT', ''))
            if not args.run_root and not os.environ.get('SMOKE_RUN_ROOT'):
                raise ValueError('Required environment variable: SMOKE_RUN_ROOT')
            config = {'run_root': validate_run_root(run_root), 'published': '', 'source': '', 'runtime_version': ''}
        elif args.chat_target:
            from chat_target import configuration as target_configuration
            config = target_configuration(args)
        else:
            config = configuration(args)
        if config.get('source'):
            from source_profile import build as build_source_profile
            profile = build_source_profile(config['source'], config['replace'], selected)
            config['replace'] = profile['replacements']
            config['source_checkouts'] = profile['checkouts']
        if any(scenario.tier == 'chat' for scenario in selected) and not config.get('model') and not args.shutdown:
            raise ValueError('Explicit chat scenarios require real model configuration')
    except (ValueError, subprocess.SubprocessError) as error:
        print('Configuration error: ' + str(error), file=sys.stderr)
        return 2
    root = config['run_root'] / (datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8])
    root.mkdir(parents=True)
    os.chmod(root, 0o700)
    config['resolution_cache'] = str(root / 'resolution')
    print('Run directory: ' + str(root), flush=True)
    results, timings, processes = [], {}, []
    started = time.monotonic()
    engines = ('sqlite', 'postgres') if args.engine == 'both' else (args.engine,)
    if 'postgres' in engines and config.get('pg'):
        for name in reap_orphan_databases(config['run_root'], lambda sql: psql(config['pg'], os.environ, sql)):
            print('Dropped scratch database of a terminated run: ' + name, flush=True)
    def interrupt(signum, frame):
        raise KeyboardInterrupt('Signal ' + str(signum))
    previous = {sig: signal.signal(sig, interrupt) for sig in (signal.SIGINT, signal.SIGTERM)}
    try:
        if args.chat_target:
            from chat_target import run_target
            results.extend(run_target(config, args.engine, root, selected))
        elif args.attach or args.shutdown:
            for engine in engines:
                rows, timing = attached(config, engine, root, args.tier, names, args.workers, args.shutdown)
                results.extend(rows)
                timings[engine] = timing
        else:
            context = multiprocessing.get_context('spawn')
            for engine in engines:
                receive, send = context.Pipe(duplex=False)
                process = context.Process(target=engine_process, args=(config, engine, root / engine,
                                          names, args.tier, args.workers, send))
                process.start()
                (root / engine).mkdir(exist_ok=True)
                private_json(root / engine / 'worker-process.json', owned_process(process.pid))
                send.close()
                processes.append((engine, process, receive))
            for engine, process, receive in processes:
                while not receive.poll(30):
                    if not process.is_alive():
                        raise RuntimeError(engine + ' worker exits without results')
                    print(engine + ' fresh scenarios remain active', flush=True)
                response = receive_message(receive, root / engine)
                result_path, timing = response['results_file'], response['timings']
                results.extend(Result(**row) for row in json.loads(Path(result_path).read_text())['results'])
                timings[engine] = timing
                process.join(timeout=10)
                if process.is_alive() or process.exitcode != 0:
                    raise RuntimeError(engine + ' worker fails to exit cleanly')
                receive.close()
                write_results(root, results, args.tier, config, timings)
    except (KeyboardInterrupt, Exception) as failure:
        results.append(Result('interrupted' if isinstance(failure, KeyboardInterrupt) else 'worker',
                              args.engine, 'failed', 0, str(failure)))
    finally:
        for engine, process, receive in processes:
            finish_worker(process, engine, root, config, results)
            if not receive.closed:
                if receive.poll():
                    try:
                        response = receive_message(receive, root / engine)
                        result_path, timing = response['results_file'], response['timings']
                        results.extend(Result(**row) for row in json.loads(Path(result_path).read_text())['results'])
                        timings[engine] = timing
                    except EOFError:
                        results.append(Result('worker', engine, 'failed', 0, 'Worker closes without cleanup results'))
                receive.close()
        for sig, handler in previous.items():
            signal.signal(sig, handler)
    timings['wall_seconds'] = round(time.monotonic() - started, 3)
    counts = write_results(root, results, args.tier, config, timings)
    print(f"{counts['passed']} passed; {counts['failed']} failed; {counts['skipped']} skipped. {root / 'summary.md'}", flush=True)
    return counts['exit_code']


if __name__ == '__main__':
    sys.exit(main())
