"""Boot failures stop server mode and prevent a healthy readiness response."""
from contextlib import contextmanager
from pathlib import Path
import json
import shutil
import signal
import socket
import subprocess
import time
import urllib.error
import urllib.request
import uuid

import yaml

from harness import Scenario, require


@contextmanager
def boot_fixture(ctx, *, failure):
    inst = ctx.inst
    root = Path(inst.root) / ('boot-readiness-' + uuid.uuid4().hex[:12])
    source = root / 'src'
    source.mkdir(parents=True)
    health = Path(inst.config['source']) / 'app/src/app/health'
    shutil.copytree(health, source / 'health')
    (root / 'wippy.lock').write_text('directories:\n  src: ./src\n  modules: .wippy\n')
    (root / 'wippy.yaml').write_text('version: "1.0"\nshutdown:\n  timeout: 5s\n')
    database = 'readiness_' + uuid.uuid4().hex[:16]
    db = {'name': 'db', 'kind': 'db.sql.sqlite', 'file': ':memory:'}
    if inst.engine == 'postgres':
        pg = inst.config['pg']
        db = {'name': 'db', 'kind': 'db.sql.postgres', 'host': pg['host'],
              'port': int(pg['port']), 'database': database, 'username': pg['user'],
              'password': pg['password'], 'options': {'sslmode': 'disable'}}
    with socket.socket() as reserved:
        reserved.bind(('127.0.0.1', 0))
        port = reserved.getsockname()[1]
    entries = [db,
        {'name': 'workers', 'kind': 'process.host', 'host': {'workers': 2},
         'lifecycle': {'auto_start': True}},
        {'name': 'gateway', 'kind': 'http.service', 'addr': '127.0.0.1:' + str(port),
         'lifecycle': {'auto_start': True}},
        {'name': 'api.public', 'kind': 'http.router', 'meta': {'server': 'app:gateway'},
         'prefix': '/api/public'}]
    (source / '_index.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': 'app', 'entries': entries}, sort_keys=False))
    body = '''local sql = require("sql")
local time = require("time")
return { main = function()
    time.sleep("250ms")
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, create_err = db:execute("CREATE TABLE readiness_fixture (id INTEGER PRIMARY KEY)")
    if create_err then db:release(); error(tostring(create_err)) end
    local _, query_err = db:query(QUERY)
    db:release()
    if query_err then
        print("INITIALIZATION_FAILED: " .. tostring(query_err))
        return nil, tostring(query_err)
    end
    print("INITIALIZATION_SUCCEEDED")
end }
'''.replace('QUERY', json.dumps('SELECT missing_column FROM readiness_fixture' if failure else 'SELECT 1'))
    boot = [
        {'name': 'bootloader', 'kind': 'process.lua', 'method': 'main',
         'modules': ['sql', 'time'], 'source': body},
        {'name': 'bootloader.service', 'kind': 'process.service',
         'process': 'wippy.bootloader:bootloader', 'host': 'app:workers',
         'lifecycle': {'auto_start': True, 'startup': 'complete', 'requires': ['app:db'],
                       'security': {'actor': {'id': 'wippy.bootloader:bootloader'},
                                    'policies': ['app.health:db_access']}}}]
    (source / 'boot.yaml').write_text(yaml.safe_dump(
        {'version': '1.0', 'namespace': 'wippy.bootloader', 'entries': boot}, sort_keys=False))
    created = False
    child = None
    logfile = root / 'runtime.log'
    try:
        if inst.engine == 'postgres':
            inst.pg('CREATE DATABASE "' + database + '"')
            created = True
        with logfile.open('w') as output:
            child = subprocess.Popen([inst.config['binary'], 'run', '-c'], cwd=root,
                                     env=inst.env, stdout=output, stderr=subprocess.STDOUT)
            marker = 'INITIALIZATION_FAILED:' if failure else 'INITIALIZATION_SUCCEEDED'
            deadline = time.monotonic() + 15
            while marker not in logfile.read_text():
                require(child.poll() is None, 'Runtime exits before initialization: ' + logfile.read_text())
                require(time.monotonic() < deadline, 'Initialization does not finish: ' + logfile.read_text())
                time.sleep(0.05)
            yield child, 'http://127.0.0.1:' + str(port) + '/api/public/health', logfile
    finally:
        if child is not None and child.poll() is None:
            child.send_signal(signal.SIGTERM)
            child.wait(timeout=15)
        if logfile.exists():
            inst.evidence.save('boot-readiness-' + ('failure' if failure else 'success'),
                               {'engine': inst.engine, 'log': logfile.read_text(),
                                'exit_code': child.returncode if child is not None else None})
        if created:
            inst.pg('DROP DATABASE "' + database + '"')
        shutil.rmtree(root)


def server_boot_failure(ctx):
    with boot_fixture(ctx, failure=True) as (child, _, logfile):
        try:
            code = child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            require(False, 'Server remains alive after initialization fails: ' + logfile.read_text())
        require(code == 1, 'Boot failure does not exit with status 1: ' + logfile.read_text())


def health_initialization_failure(ctx):
    for failure in (False, True):
        with boot_fixture(ctx, failure=failure) as (child, url, logfile):
            if child.poll() is not None:
                require(failure and child.returncode == 1,
                        'Health fixture exits unexpectedly: ' + logfile.read_text())
                ctx.inst.evidence.save('health-initialization-failed-exit', {'exit_code': child.returncode})
                continue
            try:
                response = urllib.request.urlopen(url, timeout=5)
            except urllib.error.HTTPError as error:
                response = error
            except urllib.error.URLError:
                require(failure, 'Healthy initialization does not serve the health endpoint')
                code = child.wait(timeout=5)
                require(code == 1, 'Unavailable health does not follow a failed boot: ' + logfile.read_text())
                ctx.inst.evidence.save('health-initialization-failed-exit', {'exit_code': code})
                continue
            with response:
                status, body = response.status, json.load(response)
            ctx.inst.evidence.save('health-initialization-' + str(failure).lower(),
                                   {'status': status, 'body': body})
            require(status == (503 if failure else 200),
                    'Health does not reflect initialization: ' + str((status, body)))
            require(body == {'status': 'unhealthy' if failure else 'healthy'},
                    'Health response shape changes: ' + str(body))


REGISTRY = [
    Scenario('server_boot_failure', 'regression', server_boot_failure,
             issues=('RUNTIME-SERVER-BOOT-FAILURE',)),
    Scenario('health_initialization_failure', 'regression', health_initialization_failure,
             issues=('APP-HEALTH-INITIALIZATION-FAILURE',)),
]
