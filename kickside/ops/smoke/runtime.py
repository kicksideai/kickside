"""Disposable published/source runtime, product API, and database lifecycle."""
import json
import fcntl
import hashlib
import os
import re
from pathlib import Path
import secrets
import shutil
import signal
import socket
import subprocess
import threading
import time
from urllib.parse import quote
import urllib.error
import urllib.request
import uuid

from harness import instance_area, Cleanup, Evidence, Failure, Redactor, require, ISOLATED_AREAS


SERVER_CONNECTIONS_PER_RUNTIME = 4
MAX_STALE_INSTALL_ATTEMPTS = 3


def psql(pg, env, sql):
    done = subprocess.run(['psql', '-h', pg['host'], '-p', pg['port'], '-U', pg['user'],
                           '-d', pg['maintenance'], '-v', 'ON_ERROR_STOP=1', '-Atqc', sql],
                          env=dict(env, PGPASSWORD=pg['password']), capture_output=True, text=True, timeout=35)
    require(done.returncode == 0, 'psql: ' + done.stderr.replace(pg['password'], '[redacted]'))
    return done.stdout.strip()


def drop_database(name, execute):
    execute(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='{name}' AND pid<>pg_backend_pid()")
    execute(f'DROP DATABASE IF EXISTS "{name}"')


def process_identity(pid):
    try:
        stat = Path(f'/proc/{pid}/stat').read_text()
    except OSError:
        return None
    return stat.rsplit(')', 1)[1].split()[19]


def reap_orphan_databases(run_root, execute):
    """Drop scratch databases recorded under run_root by processes that no longer exist."""
    reaped = []
    for record in sorted(Path(run_root).glob('**/database.json')):
        try:
            owner = json.loads(record.read_text())
        except FileNotFoundError:
            # Another runner can finish its own cleanup after glob has yielded
            # this descriptor. Only that vanished descriptor is benign; all
            # ownership and database checks below stay strict.
            continue
        if process_identity(owner['pid']) == owner['identity']:
            continue
        drop_database(owner['db'], execute)
        record.unlink()
        reaped.append(owner['db'])
    return reaped


def source_directory(root):
    import yaml
    manifest = root / 'wippy.yaml'
    if not manifest.exists():
        return '.'
    document = yaml.safe_load(manifest.read_text()) or {}
    return str(document.get('directories', {}).get('src') or ('src' if (root / 'src').is_dir() else '.'))


def write_dependency_roots(app, dependencies):
    import yaml
    directory = app / 'src' / 'runtime-dependencies'
    components = set()
    lock = app / 'wippy.lock'
    if lock.exists():
        from ops.compat.fetch_baselines import read_pack
        for module in yaml.safe_load(lock.read_text()).get('modules', []):
            if module.get('root'):
                archive = app / '.wippy' / 'vendor' / (module['name'] + '-' + module['version'] + '.wapp')
                components.update(entry['Data']['component'] for entry in read_pack(archive).values()
                                  if entry['Kind'] == 'ns.dependency')
    for index in (app / 'src').rglob('*.yaml'):
        if index.is_relative_to(directory):
            continue
        document = yaml.safe_load(index.read_text()) or {}
        components.update(entry['component'] for entry in document.get('entries', [])
                          if entry.get('kind') == 'ns.dependency')
    namespaces = {}
    for dependency in dependencies:
        if not dependency['is_root'] or dependency['component'] in components:
            continue
        namespaces.setdefault(dependency['namespace'], []).append({
            'name': dependency['name'], 'kind': 'ns.dependency',
            'component': dependency['component'], 'version': '*',
            'parameters': dependency['parameters']})
        components.add(dependency['component'])
    desired = {}
    for namespace, entries in sorted(namespaces.items()):
        target = directory / hashlib.sha256(namespace.encode()).hexdigest()[:16] / '_index.yaml'
        desired[target] = yaml.safe_dump({'version': '1.0', 'namespace': namespace,
            'entries': sorted(entries, key=lambda row: row['name'])}, sort_keys=False)
    current = {path: path.read_text() for path in directory.rglob('_index.yaml')} if directory.exists() else {}
    if current == desired:
        return False
    if directory.exists():
        shutil.rmtree(directory)
    for path, text in desired.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    return True


def _dependency_action(inst, action, modules=()):
    command = [inst.config['binary'], '--config', '.wippy.yaml', action]
    if action == 'update':
        if not inst.config.get('published'):
            command.extend(('--src-dir', source_directory(inst.app)))
        command.extend(modules)
    completed = subprocess.run(command,
                               cwd=inst.app, env=inst.env, capture_output=True, text=True, timeout=300)
    inst.evidence.save(action, {'code': completed.returncode, 'output': completed.stdout, 'error': completed.stderr})
    require(completed.returncode == 0, f'{action} exits {completed.returncode}: {completed.stderr}')



class SourceSnapshot:
    """Track source bytes separately from boot configuration and declarations."""
    def __init__(self, config, engine=None):
        import yaml
        keys = ('binary', 'host', 'pg', 'model', 'source', 'published', 'replace', 'database_prefix', 'public_api_url')
        identity = {key: config.get(key) for key in keys}
        if engine == 'sqlite':
            identity['pg'] = {}
        binary = Path(config['binary'])
        identity['binary_stat'] = (binary.stat().st_size, binary.stat().st_mtime_ns)
        self.identity = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()
        self.files, self.entries, self.assets = {}, {}, {}
        roots = ([Path(config['source']) / 'app'] if config.get('source') else [])
        roots += [Path(path) for path in config.get('replace', {}).values()]
        for root in roots:
            for asset in sorted((root / 'static').rglob('*')):
                if asset.is_file():
                    self.assets[str(asset)] = hashlib.sha256(asset.read_bytes()).hexdigest()
            for name in ('.wippy.yaml', 'wippy.yaml', 'wippy.lock'):
                path = root / name
                if path.is_file():
                    self.files[str(path)] = path.read_bytes()
            src = root / 'src'
            if not src.exists():
                continue
            for path in sorted(src.rglob('*')):
                if path.is_file() and '__pycache__' not in path.parts:
                    self.files[str(path)] = path.read_bytes()
            for index in sorted(src.rglob('_index.yaml')):
                document = yaml.safe_load(index.read_text()) or {}
                for entry in document.get('entries', []) or []:
                    source = entry.get('source', '')
                    if isinstance(source, str) and source.startswith('file://'):
                        path = str((index.parent / source[7:]).resolve())
                        self.entries.setdefault(path, []).append({
                            'id': document['namespace'] + ':' + entry['name'], 'kind': entry['kind']})

    def changes(self, after):
        changed = sorted(path for path in self.files.keys() | after.files.keys()
                         if self.files.get(path) != after.files.get(path))
        reasons, edits = [], []
        if self.identity != after.identity:
            reasons.append('runtime configuration or replacement mapping')
        for path in changed:
            entries = self.entries.get(path, [])
            if (path not in self.files or path not in after.files or not entries
                    or entries != after.entries.get(path) or any('migration' in e['kind'] for e in entries)):
                reasons.append(path)
                continue
            for entry in entries:
                edits.append({'id': entry['id'], 'path': path,
                              'old': self.files[path].decode(), 'new': after.files[path].decode()})
        assets = sorted(path for path in self.assets.keys() | after.assets.keys()
                        if self.assets.get(path) != after.assets.get(path))
        return {'restart': reasons, 'edits': edits, 'changed': changed, 'assets': assets}


class Instance:
    def __init__(self, config, engine, root):
        self.config, self.engine, self.root = config, engine, root
        self.app = root / 'runtime'
        self.host = config['host']
        with socket.socket() as sock:
            sock.bind((self.host, 0))
            self.port = sock.getsockname()[1]
        self.base = f'http://{self.host}:{self.port}'
        self.email = config['email']
        self.password = config['password']
        self.token = ''
        prefix = config.get('database_prefix', 'smoke')
        require(re.fullmatch(r'[a-z][a-z0-9_]{0,29}', prefix), 'Invalid scratch database prefix: ' + prefix)
        self.db = prefix + '_' + uuid.uuid4().hex
        self.db_created = False
        self.prepared = False
        self.dependencies_pending = False
        self.process = None
        self.log_thread = None
        self.boot_lock = threading.RLock()
        self.keeper_token = ''
        self.keeper_session = ''
        self.env = os.environ.copy()
        self.env['ENCRYPTION_KEY'] = secrets.token_hex(32)
        self.env['TMPDIR'] = str(self.root / 'temp')
        self.redactor = Redactor([self.password, self.env['ENCRYPTION_KEY'],
                                 config.get('pg', {}).get('password', ''), config['model'].get('key', '')],
                                [config['model']['base']] if config['model'] else [])
        self.evidence = Evidence(root, self.redactor)
        self.cleanup = Cleanup()
        self.fixture_state = {}
        self.cleanup.add('runtime directories', self.remove_runtime)
        self.cleanup.add('database', self.drop_db)
        self.cleanup.add('runtime process', self.stop)

    def remove_runtime(self):
        for path in [self.app, self.root / 'temp', self.root / 'data']:
            if path.exists():
                shutil.rmtree(path)

    def boot(self):
        # Parallel focused native guards share one runtime only after this
        # lifecycle transition; prepare/start are not themselves concurrent.
        with self.boot_lock:
            started = time.monotonic()
            if not self.prepared:
                self.prepare()
            if self.process is None or self.process.poll() is not None:
                self.start()
                self.manifest()
                self.boot_seconds = getattr(self, 'boot_seconds', 0) + time.monotonic() - started

    def prepare(self):
        self.root.mkdir(parents=True, exist_ok=True)
        (self.root / 'temp').mkdir()
        (self.root / 'data').mkdir()
        if self.config['source']:
            self.prepare_source()
        else:
            import yaml
            self.app.mkdir()
            runtime_config = {'version': '1.0', 'workspace': {'include_host_dependencies': True}}
            if self.config['replace']:
                runtime_config['workspace']['replacements'] = self.config['replace']
            (self.app / '.wippy.yaml').write_text(yaml.safe_dump(runtime_config, sort_keys=False))
        if self.engine == 'postgres':
            pg = self.config['pg']
            self.env.update(PGPASSWORD=pg['password'], KICKSIDE_PG_HOST=pg['host'],
                            KICKSIDE_PG_PORT=pg['port'], KICKSIDE_PG_USERNAME=pg['user'],
                            KICKSIDE_PG_PASSWORD=pg['password'], KICKSIDE_PG_DATABASE=self.db)
            self.create_database()

        self.prepared = True

    def prepare_source(self, *, dependencies=()):
        import yaml
        source = Path(self.config['source']).resolve()
        app = source / 'app'
        require(app.is_dir(), 'Source checkout has no app directory')
        shutil.copytree(app, self.app, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns('.git', '.wippy', 'wippy.lock', 'node_modules', '.env', '*.db', '__pycache__'))
        (self.app / 'wippy.lock').unlink(missing_ok=True)
        write_dependency_roots(self.app, dependencies)
        config = yaml.safe_load((self.app / '.wippy.yaml').read_text())
        config.pop('workspace', None)
        for profile in config.get('profiles', {}).values():
            profile.pop('workspace', None)
        if self.config['replace']:
            config['workspace'] = {'replacements': self.config['replace']}
        (self.app / '.wippy.yaml').write_text(yaml.safe_dump(config, sort_keys=False))
        if self.config.get("resolution_cache"):
            self._resolve_source_dependencies()
        else:
            self.resolve_dependencies()

    def preserve_dependencies(self):
        dependencies = self.request('GET', '/api/v1/keeper/hub/dependencies?entries=0')['dependencies']
        self.evidence.save('restart-dependency-roots', dependencies)
        if write_dependency_roots(self.app, dependencies):
            self.dependencies_pending = True

    def _resolve_source_dependencies(self):
        cache = Path(self.config['resolution_cache'])
        digest = hashlib.sha256(self.config['binary'].encode())
        roots = [('app', self.app), *sorted(self.config['replace'].items())]
        for name, directory in roots:
            directory = Path(directory)
            digest.update(name.encode())
            paths = [directory / '.wippy.yaml', directory / 'wippy.yaml']
            source = directory / source_directory(directory)
            paths += sorted(source.rglob('*.yaml'))
            for path in paths:
                if path.is_file() and not any(part in {'.wippy', 'node_modules'} for part in path.relative_to(directory).parts):
                    digest.update(str(path.relative_to(directory)).encode())
                    digest.update(path.read_bytes())
        cache.mkdir(parents=True, exist_ok=True)
        key = digest.hexdigest()
        cached_lock = cache / (key + '.yaml')
        with (cache / (key + '.lock')).open('a+') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            if cached_lock.exists():
                shutil.copyfile(cached_lock, self.app / 'wippy.lock')
                _dependency_action(self, 'install')
                self.evidence.save('dependency-resolution-reuse', {'key': key})
            else:
                self.resolve_dependencies()
                shutil.copyfile(self.app / 'wippy.lock', cached_lock)

    def resolve_dependencies(self, *, modules=()):
        for action in ('update', 'install'):
            _dependency_action(self, action, modules)
        self.dependencies_pending = False

    def pg(self, sql):
        return psql(self.config['pg'], self.env, sql)

    def create_database(self):
        pool = int(self.config['pg']['pool_max_open'])
        capacity, reserved, used = (int(value) for value in self.pg(
            "SELECT current_setting('max_connections'), current_setting('superuser_reserved_connections'), "
            "count(*) FILTER (WHERE backend_type = 'client backend') FROM pg_stat_activity").split('|'))
        headroom = capacity - reserved - used
        require(headroom >= pool + SERVER_CONNECTIONS_PER_RUNTIME,
                f'PostgreSQL connection headroom {headroom} is below the {pool + SERVER_CONNECTIONS_PER_RUNTIME} this runtime may hold')
        self.root.mkdir(parents=True, exist_ok=True)
        (self.root / 'database.json').write_text(json.dumps(
            {'db': self.db, 'pid': os.getpid(), 'identity': process_identity(os.getpid())}))
        self.db_created = True
        self.pg(f'CREATE DATABASE "{self.db}" TEMPLATE template0')

    def drop_db(self):
        if self.db_created:
            drop_database(self.db, self.pg)
            (self.root / 'database.json').unlink(missing_ok=True)
            self.db_created = False

    def command(self):
        command = [self.config['binary'], '--config', '.wippy.yaml', 'run']
        if os.environ.get('SMOKE_RUNTIME_VERBOSE') == '1':
            command.insert(1, '--verbose')
        if self.config['published']:
            version = self.config['published']
            command.append('kickside/kickside' if version == 'latest' else 'kickside/kickside@' + version)
        command += ['--profile', 'quickstart', '--profile', self.engine]
        values = {'vars.local_port': self.port, 'vars.local_public_api_url': self.config.get('public_api_url') or self.base,
                  'vars.quickstart_admin_email': self.email, 'vars.quickstart_admin_password': self.password,
                  'vars.instance_data_dir': str(self.root / 'data'),
                  'vars.local_sqlite_file': str(self.root / 'data' / 'app.db'),
                  'registry.history_path': str(self.root / 'data' / 'registry.db')}
        if self.engine == 'postgres':
            pg = self.config['pg']
            values.update({'vars.postgres_host': pg['host'], 'vars.postgres_port': pg['port'],
                           'vars.postgres_database': self.db, 'vars.postgres_username': pg['user'],
                           'vars.postgres_password': pg['password'], 'vars.postgres_sslmode': pg['sslmode'],
                           'vars.postgres_history_schema': 'smoke_registry',
                           'vars.postgres_history_dsn': f"postgres://{quote(pg['user'], safe='')}:{quote(pg['password'], safe='')}@{pg['host']}:{pg['port']}/{self.db}?sslmode={pg['sslmode']}"})
        for key, value in values.items():
            command.extend(['--set', f'{key}={value}'])
        if self.engine == 'postgres':
            for key, value in (('pool.max_open', pg['pool_max_open']), ('pool.max_idle', pg['pool_max_idle'])):
                command.extend(['-o', f'app:db:{key}={value}'])
        return command

    def start(self):
        # CLI resolution replaces vendor files and requires a stopped runtime.
        if self.dependencies_pending:
            self.resolve_dependencies()
        log_path = self.root / 'runtime.log'
        self.boot_log_offset = log_path.stat().st_size if log_path.exists() else 0
        self.process = subprocess.Popen(self.command(), cwd=self.app, env=self.env,
                                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, start_new_session=True)
        def log():
            with (self.root / 'runtime.log').open('a') as output:
                for raw in iter(self.process.stdout.readline, b''):
                    output.write(self.redactor.text(raw.decode(errors='replace')))
                    output.flush()
        self.log_thread = threading.Thread(target=log, daemon=True)
        self.log_thread.start()
        last = ''
        deadline = time.monotonic() + 120
        while time.monotonic() < deadline:
            if self.process.poll() is not None:
                raise Failure(f'boot exits {self.process.returncode}; see {self.root / "runtime.log"}')
            try:
                self.login()
                return
            except (Failure, urllib.error.URLError, TimeoutError) as error:
                last = self.redactor.text(error)
                time.sleep(1)
        raise Failure('boot/login timeout after 120 seconds: ' + last)

    def stop(self, hard=False):
        if self.process and self.process.poll() is None:
            os.killpg(self.process.pid, signal.SIGKILL if hard else signal.SIGTERM)
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(self.process.pid, signal.SIGKILL)
                self.process.wait(timeout=5)
        if self.log_thread:
            self.log_thread.join(timeout=10)
            require(not self.log_thread.is_alive(), 'Runtime log reader does not stop')
        if self.process and self.process.stdout:
            self.process.stdout.close()

    def login(self):
        def ready():
            result = self.request('POST', '/api/public/user/token', {'email': self.email, 'password': self.password},
                                  expect=(200, 500), label='login-authority-readiness')
            if result.get('token'):
                return result
            require(result.get('kind') == 'Unavailable' and result.get('retryable') is True,
                    'Login fails: ' + str(result))
            return None
        result = self.wait(ready, 'Authentication authority is ready')
        self.token = result['token']
        self.redactor.add(self.token)

    def request(self, method, path, body=None, label=None, expect=(200,), auth=None, timeout=35, raw=None, headers=None, response_headers=None):
        token = self.token if auth is None else auth
        hs = {'Accept': 'application/json'}
        if token:
            hs['Authorization'] = 'Bearer ' + token
        data = raw
        if body is not None:
            data = json.dumps(body).encode()
            hs['Content-Type'] = 'application/json'
        hs.update(headers or {})
        request = urllib.request.Request(self.base + path, method=method, data=data, headers=hs)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                status, payload = response.status, response.read()
                if response_headers is not None:
                    response_headers.update(response.headers)
        except urllib.error.HTTPError as error:
            status, payload = error.code, error.read()
            if response_headers is not None:
                response_headers.update(error.headers)
        text = payload.decode(errors='replace')
        try:
            result = json.loads(text) if text else {}
        except json.JSONDecodeError:
            if text.startswith('event:') or text.startswith('data:'):
                messages = [json.loads(line[6:]) for line in text.splitlines() if line.startswith('data: ')]
                require(messages, 'MCP returns an empty event stream')
                result = messages[-1]
            else:
                raise Failure(f'{method} {path}: HTTP {status}: invalid JSON: {text[:1000]}')
        sanitized = self.redactor.value(result)
        if label:
            self.evidence.save(label, {'method': method, 'path': path, 'status': status, 'response': sanitized})
        require(status in expect, f'{method} {path}: HTTP {status}: {sanitized}')
        if status < 400:
            require(result.get('success') is not False, f'{method} {path}: product error: {sanitized}')
        return result

    def keeper_rpc(self, method, params):
        headers = {'Mcp-Session-Id': self.keeper_session} if self.keeper_session else {}
        received = {}
        result = self.request('POST', '/keeper-mcp/', {
            'jsonrpc': '2.0', 'id': uuid.uuid4().hex, 'method': method, 'params': params},
            auth=self.keeper_token, timeout=120, headers=headers, response_headers=received)
        require('error' not in result, 'Keeper RPC: ' + str(result.get('error')))
        require('result' in result, 'Keeper RPC returns no result: ' + str(result))
        if method == 'initialize':
            session = next((value for key, value in received.items() if key.lower() == 'mcp-session-id'), '')
            require(session, 'Keeper initialize returns no session ID')
            self.keeper_session = session
        return result['result']

    def keeper_call(self, name, arguments):
        result = self.keeper_rpc('tools/call', {'name': name, 'arguments': arguments})
        require(not result.get('isError'), 'Keeper ' + name + ': ' + str(result))
        return result

    def live_reload(self, edits):
        if not self.keeper_token:
            minted = self.request('POST', '/api/v1/keeper/mcp/tokens',
                                  {'label': 'Smoke attached reload', 'scopes': ['mcp.root']})
            self.keeper_token = minted['token']['token']
            self.redactor.add(self.keeper_token)
            self.keeper_rpc('initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
                            'clientInfo': {'name': 'KickSide smoke loop', 'version': '1'}})
            self.keeper_call('use_trait', {'ids': ['keeper.agents.traits.wippy:operator']})
        tools = {row['name'] for row in self.keeper_rpc('tools/list', {})['tools']}
        if 'call_tool' not in tools:
            return False
        catalog = self.keeper_call('list_tools', {'namespace': 'keeper.state.tools'})
        catalog = json.loads(next(block['text'] for block in catalog['content'] if block['type'] == 'text'))
        available = {row['id'] for row in catalog['tools']}
        if not {'keeper.state.tools:branch', 'keeper.state.tools:edit', 'keeper.state.tools:push'}.issubset(available):
            return False
        self.await_keeper()
        namespaces = set(self.request('GET', '/api/v1/keeper/sync/config')['managed_namespaces'])
        namespaces.update(edit['id'].split(':', 1)[0] for edit in edits)
        self.request('PUT', '/api/v1/keeper/sync/config', {'managed_namespaces': sorted(namespaces)})
        branch = 'smoke-reload-' + uuid.uuid4().hex[:12]
        def call(tool, arguments):
            return self.keeper_call('call_tool', {'id': 'keeper.state.tools:' + tool, 'arguments': arguments})
        call('branch', {'action': 'set', 'branch': branch})
        for edit in edits:
            call('edit', {
                'command': 'str_replace', 'path': edit['id'], 'old_str': edit['old'], 'new_str': edit['new']})
        call('push', {'branch': branch, 'message': 'Reload smoke source'})
        for edit in edits:
            source = Path(edit['path'])
            if self.config['source'] and source.is_relative_to(Path(self.config['source']) / 'app'):
                target = self.app / source.relative_to(Path(self.config['source']) / 'app')
                target.write_text(edit['new'])
        self.evidence.save('live-reload', {'entries': [e['id'] for e in edits]})
        return True

    def await_keeper(self):
        def ready():
            state = self.request('GET', '/api/v1/keeper/pm/stats')
            sources = {process['source'] for host in state['processes'] for process in host['processes']}
            return ('keeper.state.service:orchestrator' in sources
                    and not {'keeper.state.service:reconcile', 'keeper.state.service:sync',
                             'keeper.state.service:sync_branch'}.intersection(sources))
        return self.wait(ready, 'Keeper state reconciliation', seconds=120)

    def loaded_edits(self, edits):
        import yaml
        installed = {row['name'] for row in yaml.safe_load((self.app / 'wippy.lock').read_text())['modules']}
        result = []
        for edit in edits:
            modules = [module for module, root in self.config['replace'].items()
                       if Path(edit['path']).is_relative_to(Path(root))]
            if not modules or all(module in installed for module in modules):
                result.append(edit)
        return result

    def sync_assets(self, paths):
        if not self.config['source']:
            return
        source = Path(self.config['source']) / 'app'
        for path in map(Path, paths):
            if path.is_relative_to(source):
                target = self.app / path.relative_to(source)
                if path.exists():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(path, target)
                else:
                    target.unlink(missing_ok=True)

    def upload(self, path, label):
        import mimetypes
        boundary = 'smoke_' + uuid.uuid4().hex
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        raw = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{path.name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
               + path.read_bytes() + f'\r\n--{boundary}--\r\n'.encode())
        return self.request('POST', '/api/v1/uploads', label=label, raw=raw,
                            headers={'Content-Type': 'multipart/form-data; boundary=' + boundary}, timeout=120)

    def wait(self, condition, label, seconds=35, pump=None):
        deadline = time.monotonic() + seconds
        last = None
        while time.monotonic() < deadline:
            last = condition()
            if last:
                return last
            if pump:
                pump(250)
            else:
                time.sleep(0.25)
        raise Failure(f'{label}: timeout after {seconds} seconds; last={self.redactor.value(last)}')

    def manifest(self):
        import yaml
        lock = yaml.safe_load((self.app / 'wippy.lock').read_text())
        config = yaml.safe_load((self.app / '.wippy.yaml').read_text())
        if self.config['published']:
            app = next(m for m in lock['modules'] if m['name'] == 'kickside/kickside')
            require(app.get('root') is True, 'Published KickSide is not the deployment root')
            if self.config['published'] != 'latest':
                require(app['version'] == self.config['published'], 'Published root version differs: ' + str(app))
            expected_workspace = {'include_host_dependencies': True}
            if self.config['replace']:
                expected_workspace['replacements'] = self.config['replace']
            require((config.get('workspace') or {}) == expected_workspace,
                    'Published root workspace differs from its installed host dependencies and declared replacements')
        self.evidence.save('manifest', {'modules': lock['modules'], 'replacements': self.config['replace'], 'engine': self.engine})

    def install(self, component, parameters=None, *, version=None):
        dependencies = self.request('GET', '/api/v1/keeper/hub/dependencies?entries=0&migrations=1')['dependencies']
        if any(row.get('component') == component for row in dependencies):
            return
        label = component.replace('/', '-')
        plan_args = {'component': component, 'run_migrations': True}
        if version is not None:
            plan_args['version'] = version
        if parameters is not None:
            plan_args['parameters'] = parameters

        def registry_moved(conflict):
            """Identify the Hub's optimistic-lock response, not every 409."""
            if type(conflict) != dict:
                return False
            details = conflict.get('details')
            plan_version = details.get('plan_version') if type(details) == dict else None
            current_version = details.get('current_version') if type(details) == dict else None
            return (conflict.get('code') == 'Conflict'
                    and conflict.get('success') is False
                    and conflict.get('error') == 'registry moved since the plan was computed'
                    and type(plan_version) is int and type(current_version) is int
                    and current_version > plan_version)

        # The security projection commits after each install.  That may move the
        # registry after a plan is issued but before its payload is accepted; in
        # that one case obtain and validate a completely fresh plan.
        plan_attempt = 0
        install_attempt = 0
        def planned():
            nonlocal plan_attempt
            plan_attempt += 1
            plan = self.request('POST', '/api/v1/keeper/hub/dependencies/plan',
                                plan_args, label=label + '-plan-' + str(plan_attempt), expect=(200, 409), timeout=120)
            if 'install_payload' in plan:
                return plan
            require(registry_moved(plan),
                    'Hub ' + component + ': plan refused: ' + str(plan))
            return None
        while True:
            plan = self.wait(planned, 'Hub ' + component + ' plan', seconds=120)
            unresolved = [row.get('parameter_name') or row.get('full_id') or row.get('name')
                          for row in plan.get('requirements', []) if row.get('missing') or row.get('invalid')]
            require(not unresolved, 'Hub ' + component + ': unresolved requirements: ' + ', '.join(map(str, unresolved)))
            body = dict(plan['install_payload'])
            if version is None:
                body.pop('version', None)
            if parameters is not None:
                resolved = {row['name']: row for row in body.get('parameters', [])}
                resolved.update({row['name']: row for row in parameters})
                body['parameters'] = list(resolved.values())
            body['run_migrations'] = True
            install_attempt += 1
            installed = self.request('POST', '/api/v1/keeper/hub/dependencies/install', body,
                                     label=label + '-install-' + str(plan_attempt), expect=(200, 409), timeout=300)
            if registry_moved(installed):
                require(install_attempt < MAX_STALE_INSTALL_ATTEMPTS,
                        'Hub ' + component + ' registry continued moving after '
                        + str(MAX_STALE_INSTALL_ATTEMPTS) + ' install attempts: ' + str(installed))
                continue
            require(installed.get('success') is not False and 'error' not in installed and 'code' not in installed
                    and type(installed.get('execution')) is list,
                    'Hub ' + component + ' installation refused: ' + str(installed))
            failed = [row for row in installed.get('execution', []) if row.get('status') in ('failed', 'rollback_failed')]
            require(not failed, 'Hub ' + component + ' installation fails: ' + str(failed))
            self.await_keeper()
            return


class RuntimePool:
    """Own the engine's main instance and areas requiring isolated product state."""
    isolated = ISOLATED_AREAS
    browser_areas = {'scenarios_access', 'scenarios_automation', 'scenarios_jira'}

    def __init__(self, config, engine, root):
        from browser import BrowserSession
        self.config, self.engine, self.root = config, engine, root
        self.browser_session = BrowserSession()
        self.contexts = {}
        self.instances = {}

    def context(self, owner):
        from scenarios import Context
        area = instance_area(owner)
        if area not in self.instances:
            self.instances[area] = Instance(self.config, self.engine, self.root / area)
        if owner not in self.contexts:
            ctx = Context(self.instances[area], self.browser_session)
            ctx.restart_runtime = self.restart
            ctx.pause_runtime = self.pause
            main = self.contexts.get('scenarios')
            if area == 'main' and main is not None:
                ctx.state.update(main.state)
            self.contexts[owner] = ctx
            ctx.inst.cleanup.add(owner + ' fixtures', ctx.fixtures.stop)
        return self.contexts[owner]

    def activate(self, owner):
        ctx = self.context(owner)
        if owner in self.browser_areas and ctx.browser is None:
            ctx.browser_check().login()

    def pause(self, ctx, hard=False):
        from browser import Browser
        return Browser.paused(ctx.inst, [c for c in self.contexts.values() if c.inst is ctx.inst],
                              lambda context, operation: operation(context), hard=hard)

    def restart(self, ctx, hard=False):
        with self.pause(ctx, hard=hard):
            pass
        return ctx.browser

    def cleanup(self, areas=None):
        errors = []
        for area, inst in reversed(list(self.instances.items())):
            if areas is not None and area not in areas:
                continue
            errors.extend(area + ': ' + inst.redactor.text(error) for error in inst.cleanup.run())
        if areas is None:
            try:
                self.browser_session.close()
            except Exception as error:
                errors.append(f'browser session: {type(error).__name__}: {error}')
        return errors
