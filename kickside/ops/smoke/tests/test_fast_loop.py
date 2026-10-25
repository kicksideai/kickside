from harness import Cleanup
import os
import json
from pathlib import Path
from dataclasses import replace
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import Mock, patch

from harness import Scenario, Result
import harness
import runtime
import smoke


class SelectionTests(unittest.TestCase):
    def test_attached_rerun_uses_only_passed_prerequisites(self):
        registry = [Scenario('boot', 'quick', None), Scenario('setup', 'quick', None, ('boot',)),
                    Scenario('check', 'full', None, ('setup',))]
        satisfied = {s.name: Result(s.name, 'sqlite', 'passed', 1) for s in registry}
        self.assertEqual([s.name for s in harness.select_attached(registry, 'full', ['check'], satisfied)], ['check'])
        satisfied['setup'].status = 'failed'
        self.assertEqual([s.name for s in harness.select_attached(registry, 'full', ['check'], satisfied)], ['setup', 'check'])

    def test_explicit_prerequisite_rerun_invalidates_its_descendants(self):
        registry = [Scenario('a', 'full', None), Scenario('b', 'full', None, ('a',)),
                    Scenario('c', 'full', None, ('b',))]
        outcomes = {s.name: Result(s.name, 'sqlite', 'passed', 0) for s in registry}
        harness.invalidate_outcomes(registry, outcomes, ['a'])
        self.assertEqual(outcomes, {})

    def test_default_gate_stays_both_attach_defaults_to_sqlite(self):
        self.assertEqual(smoke.parser().parse_args([]).engine, 'both')
        args = smoke.parser().parse_args(['--attach', '--source', '.'])
        smoke.validate_args(args)
        self.assertEqual(args.engine, 'sqlite')
        self.assertEqual(args.workers, 1)

    def test_workers_must_be_positive(self):
        with self.assertRaises(ValueError):
            smoke.validate_args(smoke.parser().parse_args(['--list', '--workers', '0']))


class SourceTests(unittest.TestCase):
    def test_reload_waits_for_keeper_reconciliation(self):
        inst = runtime.Instance.__new__(runtime.Instance)
        orchestrator = {'source': 'keeper.state.service:orchestrator'}
        reconcile = {'source': 'keeper.state.service:reconcile'}
        sync = {'source': 'keeper.state.service:sync'}
        inst.request = Mock(side_effect=[{'processes': [{'processes': [orchestrator, reconcile]}]},
                                         {'processes': [{'processes': [orchestrator, sync]}]},
                                         {'processes': [{'processes': [orchestrator]}]}])
        self.assertTrue(inst.await_keeper())
        self.assertEqual(inst.request.call_count, 3)

    def test_uninstalled_replacements_do_not_receive_registry_edits(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            (root / 'wippy.lock').write_text('modules:\n  - {name: kickside/core}\n')
            inst = runtime.Instance.__new__(runtime.Instance)
            inst.app = root
            inst.config = {'replace': {'kickside/core': str(root / 'core'), 'kickside/crm': str(root / 'crm')}}
            edits = [{'id': 'core:entry', 'path': str(root / 'core/src/code.lua')},
                     {'id': 'crm:entry', 'path': str(root / 'crm/src/code.lua')},
                     {'id': 'app:entry', 'path': str(root / 'src/code.lua')}]
            self.assertEqual(inst.loaded_edits(edits), [edits[0], edits[2]])

    def test_static_assets_sync_without_registry_restart(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            source = root / 'checkout/app/static'
            source.mkdir(parents=True)
            asset = source / 'index.js'
            asset.write_text('before')
            config = {'source': str(root / 'checkout'), 'replace': {}, 'binary': '/bin/true'}
            before = runtime.SourceSnapshot(config)
            asset.write_text('after')
            changes = before.changes(runtime.SourceSnapshot(config))
            self.assertFalse(changes['restart'])
            self.assertEqual(changes['assets'], [str(asset)])
            inst = runtime.Instance.__new__(runtime.Instance)
            inst.config, inst.app = config, root / 'runtime'
            inst.sync_assets(changes['assets'])
            self.assertEqual((inst.app / 'static/index.js').read_text(), 'after')

    def test_sqlite_snapshot_ignores_postgres_settings(self):
        config = {'source': '', 'replace': {}, 'binary': '/bin/true', 'pg': {}}
        before = runtime.SourceSnapshot(config, 'sqlite')
        after = runtime.SourceSnapshot({**config, 'pg': {'host': 'db-host'}}, 'sqlite')
        self.assertFalse(before.changes(after)['restart'])

    def test_source_edit_maps_every_entry_sharing_file_and_migration_restarts(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            src = root / 'app/src/part'
            src.mkdir(parents=True)
            (root / 'app/.wippy.yaml').write_text('version: "1.0"\n')
            (src / '_index.yaml').write_text('namespace: app.part\nentries:\n  - {name: one, kind: function.lua, source: "file://code.lua"}\n  - {name: two, kind: library.lua, source: "file://code.lua"}\n')
            code = src / 'code.lua'
            code.write_text('return 1\n')
            config = {'source': str(root), 'replace': {}, 'binary': '/bin/true'}
            before = runtime.SourceSnapshot(config)
            code.write_text('return 2\n')
            after = runtime.SourceSnapshot(config)
            changes = before.changes(after)
            self.assertFalse(changes['restart'])
            self.assertEqual([e['id'] for e in changes['edits']], ['app.part:one', 'app.part:two'])
            (src / '_index.yaml').write_text('namespace: app.part\nentries:\n  - {name: migrate, kind: db.sql.migration, source: "file://code.lua"}\n')
            self.assertTrue(after.changes(runtime.SourceSnapshot(config))['restart'])

    def test_keeper_rpc_errors_remain_errors(self):
        inst = runtime.Instance.__new__(runtime.Instance)
        inst.request = Mock(return_value={'error': {'message': 'rejected source'}})
        inst.keeper_token = 'secret'
        inst.keeper_session = ''
        with self.assertRaisesRegex(RuntimeError, 'rejected source'):
            inst.keeper_call('edit', {})

    def test_keeper_session_header_carries_from_initialize_to_tools(self):
        inst = runtime.Instance.__new__(runtime.Instance)
        inst.keeper_token, inst.keeper_session = 'secret', ''
        def request(method, path, body, **kwargs):
            if body['method'] == 'initialize':
                kwargs['response_headers']['Mcp-Session-Id'] = 'session-id'
            return {'result': {}}
        inst.request = Mock(side_effect=request)
        inst.keeper_rpc('initialize', {})
        inst.keeper_rpc('tools/list', {})
        self.assertEqual(inst.request.call_args.kwargs['headers']['Mcp-Session-Id'], 'session-id')

    def test_reload_requires_branch_before_edit_and_preserves_push_errors(self):
        inst = runtime.Instance.__new__(runtime.Instance)
        inst.keeper_token = 'secret'
        inst.keeper_rpc = Mock(return_value={'tools': [{'name': 'call_tool'}]})
        inst.request = Mock(return_value={'managed_namespaces': ['app']})
        inst.await_keeper = Mock(return_value=True)
        calls = []
        def call(name, args):
            if name == 'list_tools':
                return {'content': [{'type': 'text', 'text': '{"tools": [{"id": "keeper.state.tools:branch"}, {"id": "keeper.state.tools:edit"}, {"id": "keeper.state.tools:push"}]}'}]}
            self.assertEqual(name, 'call_tool')
            calls.append(args['id'])
            if args['id'] == 'keeper.state.tools:push':
                raise RuntimeError('governance rejects syntax')
        inst.keeper_call = Mock(side_effect=call)
        with self.assertRaisesRegex(RuntimeError, 'governance rejects syntax'):
            inst.live_reload([{'id': 'test.module:entry', 'old': 'return 1', 'new': 'return 2', 'path': 'source'}])
        self.assertEqual(calls, ['keeper.state.tools:branch', 'keeper.state.tools:edit', 'keeper.state.tools:push'])
        self.assertEqual(inst.request.call_args_list[-1].args[0], 'PUT')
        self.assertEqual(inst.request.call_args_list[-1].args[2]['managed_namespaces'], ['app', 'test.module'])
        inst.await_keeper.assert_called_once_with()


class AttachedStateTests(unittest.TestCase):
    def test_explicit_onboarding_rerun_starts_with_fresh_instance_state(self):
        from scenarios import Context
        from harness import require
        pools = []
        def make_pool(*args):
            inst = Mock()
            inst.evidence.paths = []
            inst.redactor.text.side_effect = str
            inst.cleanup = harness.Cleanup()
            pool = runtime.RuntimePool.__new__(runtime.RuntimePool)
            if args:
                pool.config, pool.engine, pool.root = args
            pool.instances = {'ai': inst}
            pool.contexts = {'scenarios_ai': Context(inst)}
            pool.browser_session = Mock()
            pools.append(pool)
            return pool
        def onboarding(ctx):
            require('onboarded' not in ctx.state, 'Name your workspace heading is absent')
            ctx.state['onboarded'] = True
        def check(ctx):
            self.assertTrue(ctx.state['onboarded'])
        actual = {s.name: s for s in smoke.REGISTRY}
        registry = [replace(actual['ai_boot'], run=lambda ctx: None),
                    replace(actual['ai_ready'], run=onboarding, model=False),
                    replace(actual['ai_gemma_multiturn'], run=check, model=False)]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'RuntimePool', side_effect=make_pool), patch.object(runtime, 'Instance', side_effect=lambda *args: make_pool().instances['ai']):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                try:
                    self.assertEqual([r.status for r in runner.run('full', ['ai_gemma_multiturn'], 1)], ['passed'] * 3)
                    rows = runner.run('full', [s.name for s in registry], 1)
                    self.assertEqual([r.status for r in rows], ['passed'] * 3, [r.error for r in rows])
                    self.assertTrue(runner.restart_reasons)
                    self.assertEqual([r.scenario for r in runner.run('full', ['ai_gemma_multiturn'], 1)], ['ai_gemma_multiturn'])
                    self.assertEqual(runner.restart_reasons, [])
                finally:
                    runner.close()

    def test_setup_restart_cleans_shared_instance_and_retains_isolated_instance(self):
        instances, calls = [], []
        def instance(*args):
            inst = Mock()
            inst.evidence.paths = []
            inst.redactor.text.side_effect = str
            inst.cleanup = harness.Cleanup()
            inst.cleanup.add('owned resources', lambda: calls.append(inst))
            instances.append(inst)
            return inst
        def setup(ctx):
            harness.require('setup' not in ctx.state, 'Setup requires a fresh instance')
            ctx.state['setup'] = True
        registry = [Scenario('prepare', 'full', setup, instance_setup=True),
                    Scenario('shared', 'full', lambda ctx: None, ('prepare',), owner='shared_owner'),
                    Scenario('isolated', 'full', lambda ctx: None, owner='scenarios_ai')]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(runtime, 'Instance', side_effect=instance):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                try:
                    runner.run('full', [], 1)
                    old_main, isolated = runner.pool.instances['main'], runner.pool.instances['ai']
                    isolated_context = runner.pool.contexts['scenarios_ai']
                    isolated_outcome = runner.outcomes['isolated']
                    shared_context = runner.pool.contexts['shared_owner']
                    runner.run('full', ['prepare'], 1)
                    self.assertEqual(calls, [old_main])
                    self.assertIsNot(runner.pool.instances['main'], old_main)
                    self.assertIs(runner.pool.instances['ai'], isolated)
                    self.assertIs(runner.pool.contexts['scenarios_ai'], isolated_context)
                    self.assertIs(runner.outcomes['isolated'], isolated_outcome)
                    self.assertNotIn('shared_owner', runner.pool.contexts)
                    self.assertNotIn('shared', runner.outcomes)
                    rows = runner.run('full', ['shared'], 1)
                    self.assertEqual([r.scenario for r in rows], ['shared'])
                    self.assertIsNot(runner.pool.contexts['shared_owner'], shared_context)
                    self.assertEqual(runner.restart_reasons, [])
                finally:
                    runner.close()

    def test_failed_setup_retry_rebuilds_but_skipped_and_blocked_setup_do_not(self):
        created = []
        def instance(*args):
            inst = Mock()
            inst.evidence.paths = []
            inst.redactor.text.side_effect = str
            inst.cleanup = harness.Cleanup()
            created.append(inst)
            return inst
        def fail(ctx):
            ctx.state['partial'] = True
            raise harness.Failure('Setup stops after changing state')
        registry = [Scenario('partial', 'full', fail, instance_setup=True),
                    Scenario('blocked', 'full', lambda ctx: None, ('partial',), instance_setup=True),
                    Scenario('skipped', 'full', lambda ctx: None, model=True, instance_setup=True)]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(runtime, 'Instance', side_effect=instance):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                try:
                    runner.run('full', [], 1)
                    self.assertEqual(runner.setup_attempts, {'partial'})
                    runner.run('full', ['skipped'], 1)
                    self.assertEqual(runner.restart_reasons, [])
                    self.assertEqual(len(created), 1)
                    harness.invalidate_outcomes(registry, runner.outcomes, ['partial'])
                    runner.run('full', ['partial'], 1)
                    self.assertEqual(len(created), 2)
                    self.assertEqual(runner.restart_reasons, ['instance setup rerun: partial (main)'])
                finally:
                    runner.close()

    def test_retrying_a_check_rebuilds_its_failed_setup_prerequisite(self):
        created, attempts = [], []
        def instance(*args):
            inst = Mock()
            inst.evidence.paths = []
            inst.redactor.text.side_effect = str
            inst.cleanup = harness.Cleanup()
            created.append(inst)
            return inst
        def setup(ctx):
            harness.require('partial' not in ctx.state, 'Setup requires a fresh instance')
            ctx.state['partial'] = True
            attempts.append(ctx.inst)
            if len(attempts) == 1:
                raise harness.Failure('Setup stops after changing state')
        registry = [Scenario('prepare', 'full', setup, instance_setup=True),
                    Scenario('check', 'full', lambda ctx: None, ('prepare',))]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(runtime, 'Instance', side_effect=instance):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'postgres', Path(directory))
                try:
                    first = runner.run('full', ['check'], 1)
                    self.assertEqual(first[0].status, 'failed')
                    self.assertEqual(first[1].blocked_by, ['prepare'])
                    retry = runner.run('full', ['check'], 1)
                    self.assertEqual([result.status for result in retry], ['passed', 'passed'])
                    self.assertEqual(len(created), 2)
                    self.assertIsNot(attempts[0], attempts[1])
                    self.assertEqual(runner.restart_reasons, ['instance setup rerun: prepare (main)'])
                finally:
                    runner.close()

    def test_parallel_reruns_merge_only_their_changed_state(self):
        from scenarios import Context
        inst = Mock(cleanup=Cleanup())
        inst.redactor.text.side_effect = str
        inst.evidence.paths = []
        owner = Context(inst)
        owner.state.update(a='old-a', b='old-b')
        pool = Mock(contexts={'scenarios': owner}, browser_areas=set())
        pool.context.return_value = owner
        pool.cleanup.return_value = []
        barrier = threading.Barrier(2)
        def update(name):
            def operation(ctx):
                barrier.wait(timeout=3)
                ctx.state[name] = 'new-' + name
            return operation
        registry = [Scenario(name, 'full', update(name), parallel=(name,)) for name in ('a', 'b')]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'RuntimePool', return_value=pool), patch.object(Context, 'browser_check'):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                for _ in range(2):
                    owner.state.update(a='old-a', b='old-b')
                    self.assertEqual([r.status for r in runner.run('full', [], 2)], ['passed', 'passed'])
                    self.assertEqual(owner.state, {'a': 'new-a', 'b': 'new-b'})
                self.assertEqual(runner.close().status, 'passed')

    def test_native_root_guards_use_only_bounded_scheduler_workers(self):
        from scenarios import Context
        inst = Mock(cleanup=Cleanup())
        inst.evidence.paths = []
        inst.redactor.text.side_effect = str
        owner = Context(inst)
        owner.state['preserved'] = 'owner-state'
        pool = Mock(contexts={'scenarios': owner}, browser_areas=set())
        pool.context.return_value = owner
        pool.cleanup.return_value = []
        barrier = threading.Barrier(3)
        threads, calls = set(), []
        def guard(name):
            def run(ctx):
                barrier.wait(timeout=3)
                threads.add(threading.get_ident())
                calls.append(name)
                ctx.state[name] = 'completed'
            return run
        registry = [Scenario('native-' + str(index), 'full', guard('native-' + str(index)),
                             parallel=('native-root:module-' + str(index),))
                    for index in range(3)]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'RuntimePool', return_value=pool):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                baseline = set(threading.enumerate())
                for _ in range(2):
                    threads.clear()
                    rows = runner.run('full', [], 3)
                    self.assertEqual([row.status for row in rows], ['passed'] * 3, [row.error for row in rows])
                    self.assertEqual(runner.executors, {})
                    self.assertLessEqual(len(threads), 3)
                    self.assertFalse(set(threading.enumerate()) - baseline)
                self.assertEqual(owner.state, {'preserved': 'owner-state', **{name: 'completed' for name in calls}})
                self.assertEqual(len(calls), 6)
                self.assertEqual(runner.close().status, 'passed')
                self.assertFalse(set(threading.enumerate()) - baseline)

    def test_future_areas_do_not_allocate_ports_before_their_scenarios(self):
        from scenarios import Context
        pool = Mock()
        pool.contexts, pool.browser_areas = {}, set()
        pool.cleanup.return_value = []
        def context(owner):
            if owner not in pool.contexts:
                inst = Mock(cleanup=Cleanup())
                inst.evidence.paths = []
                inst.redactor.text.side_effect = str
                pool.contexts[owner] = Context(inst)
            return pool.contexts[owner]
        pool.context.side_effect = context
        def first(ctx):
            self.assertEqual(set(pool.contexts), {'first'})
        registry = [Scenario('first', 'full', first, owner='first'),
                    Scenario('later', 'full', lambda ctx: None, owner='later')]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'RuntimePool', return_value=pool):
                runner = smoke.EngineRunner({'source': '', 'binary': '/bin/true', 'replace': {}, 'model': {}}, 'sqlite', Path(directory))
                rows = runner.run('full', [], 1)
                runner.close()
        self.assertEqual([r.status for r in rows], ['passed', 'passed'])

    def test_harness_fingerprint_tracks_worker_code(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            for name in ('smoke.py', 'runtime.py', 'harness.py', 'browser.py'):
                (root / name).write_text('before')
            before = smoke.harness_fingerprint(root)
            (root / 'runtime.py').write_text('after')
            self.assertNotEqual(before, smoke.harness_fingerprint(root))

    def test_harness_fingerprint_tracks_imported_scenario_helpers(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            root = Path(directory)
            for name in ('smoke.py', 'runtime.py', 'harness.py', 'browser.py', 'renderer_math_mermaid.py'):
                (root / name).write_text('before')
            before = smoke.harness_fingerprint(root)
            (root / 'renderer_math_mermaid.py').write_text('after')
            self.assertNotEqual(before, smoke.harness_fingerprint(root))

    def test_state_survives_invocations_and_browser_cleanup_uses_owning_thread(self):
        inst = Mock(cleanup=Cleanup())
        inst.redactor.text.side_effect = str
        inst.evidence.paths = []
        from scenarios import Context
        ctx = Context(inst)
        pool = Mock()
        pool.context.return_value = ctx
        pool.contexts = {'scenarios': ctx}
        pool.browser_areas = set()
        pool.cleanup.return_value = []
        threads, calls = [], []
        def setup(ctx):
            calls.append('setup')
            ctx.state['component'] = 'durable-id'
            ctx.browser = Mock(errors=[])
            ctx.browser.close.side_effect = lambda: threads.append(threading.get_ident())
            inst.cleanup.add('browser', ctx.browser.close)
            threads.append(threading.get_ident())
        def check(ctx):
            self.assertEqual(ctx.state['component'], 'durable-id')
            calls.append('check')
        registry = [Scenario('setup', 'full', setup), Scenario('check', 'full', check, ('setup',))]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'RuntimePool', return_value=pool):
                runner = smoke.EngineRunner({'model': {}, 'source': '', 'binary': '/bin/true', 'replace': {}}, 'sqlite', Path(directory))
                runner.run('full', ['check'], 1)
                runner.run('full', ['check'], 1)
                self.assertEqual(calls, ['setup', 'check', 'check'])
                self.assertEqual(runner.close().status, 'passed')
                self.assertEqual(threads[0], threads[1])

    def test_runtime_restart_releases_each_shared_browser_on_its_owning_thread(self):
        from concurrent.futures import ThreadPoolExecutor
        from scenarios import Context
        runner = smoke.EngineRunner.__new__(smoke.EngineRunner)
        shared, isolated = Mock(cleanup=Cleanup()), Mock(cleanup=Cleanup())
        active, other, separate = Context(shared), Context(shared), Context(isolated)
        runner.contexts = {'active': active, 'other': other, 'separate': separate}
        runner.executors = {key: ThreadPoolExecutor(max_workers=1) for key in runner.contexts}
        events = []
        try:
            for key, ctx in runner.contexts.items():
                def create(ctx=ctx):
                    owner = threading.get_ident()
                    ctx.browser = Mock(errors=[])
                    def close():
                        self.assertEqual(threading.get_ident(), owner)
                        events.append(ctx)
                    ctx.browser.close.side_effect = close
                    ctx.inst.cleanup.callbacks = []
                runner.executors[key].submit(create).result()
            replacement = Mock()
            other.browser_check = Mock(side_effect=lambda: setattr(other, "browser", Mock()) or other.browser)
            active.browser_check = Mock(side_effect=lambda: setattr(active, "browser", replacement) or replacement)
            shared.stop.side_effect = lambda **kw: events.append('stop')
            shared.start.side_effect = lambda: events.append('start')
            result = runner.executors['active'].submit(runner.restart_instance, active, True).result()
            self.assertIs(result, replacement)
            self.assertEqual(events, [active, other, 'stop', 'start'])
            self.assertIsNotNone(other.browser)
            self.assertIsNotNone(separate.browser)
            replacement.restore.assert_called_once()
            self.assertTrue(other.browser.restore.called)
        finally:
            for executor in runner.executors.values():
                executor.shutdown(wait=True)

    def test_cleanup_failure_reaches_result(self):
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'RuntimePool') as factory:
                factory.return_value.cleanup.return_value = ['database drop fails']
                runner = smoke.EngineRunner({'source': '', 'binary': '/bin/true', 'replace': {}}, 'postgres', Path(directory))
                result = runner.close()
                self.assertEqual(result.status, 'failed')
                self.assertIn('database drop fails', result.error)

    def test_gate_worker_traps_termination_and_records_cleanup(self):
        runner = Mock()
        runner.pool.instances = {}
        runner.run.side_effect = KeyboardInterrupt('Signal termination')
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        connection = Mock()
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'EngineRunner', return_value=runner), patch.object(smoke.signal, 'signal') as handlers:
                smoke.engine_process({'source': '', 'published': '', 'runtime_version': 'unit'},
                                     'sqlite', Path(directory), [], 'full', 2, connection)
                self.assertEqual({call.args[0] for call in handlers.call_args_list}, {smoke.signal.SIGTERM, smoke.signal.SIGINT})
                callback = handlers.call_args_list[0].args[1]
                with self.assertRaises(KeyboardInterrupt):
                    callback(smoke.signal.SIGTERM, None)
                packet = json.loads(connection.send_bytes.call_args.args[0])
                result_path = packet['results_file']
                self.assertEqual([r['scenario'] for r in json.loads(Path(result_path).read_text())['results']], ['engine', 'cleanup'])
        runner.close.assert_called_once_with()

    def test_one_shot_stops_an_isolated_runtime_after_its_last_terminal_result(self):
        events = []
        def instance(name):
            value = Mock(boot_seconds=0)
            value.stop.side_effect = lambda: events.append(name)
            return value
        main, ai, core, providers = (instance(name) for name in ('main', 'ai', 'core', 'providers'))
        runner = Mock()
        runner.pool.instances = {'main': main, 'ai': ai, 'core': core, 'providers': providers}
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        registry = [
            Scenario('main-first', 'full', lambda ctx: None),
            Scenario('ai-first', 'full', lambda ctx: None, owner='scenarios_ai'),
            Scenario('core-failure', 'full', lambda ctx: None, owner='scenarios_core'),
            Scenario('provider-skip', 'full', lambda ctx: None, owner='scenarios_providers', model=True),
            Scenario('ai-last', 'full', lambda ctx: None, owner='scenarios_ai'),
            Scenario('main-last', 'full', lambda ctx: None),
        ]
        owners = {scenario.owner for scenario in registry}
        runner.sessions = {owner: Mock() for owner in owners}
        runner.executors = {owner: ThreadPoolExecutor(max_workers=1) for owner in owners}
        rows = [
            Result('main-first', 'sqlite', 'passed', 0),
            Result('ai-first', 'sqlite', 'passed', 0),
            Result('core-failure', 'sqlite', 'failed', 0),
            Result('provider-skip', 'sqlite', 'skipped: no model configured', 0),
            Result('ai-last', 'sqlite', 'passed', 0),
            Result('main-last', 'sqlite', 'passed', 0),
        ]
        def run(_tier, _names, _workers, completed):
            for row in rows:
                completed(row)
                if row.scenario == 'ai-first':
                    self.assertFalse(ai.stop.called)
                if row.scenario == 'main-last':
                    self.assertFalse(main.stop.called)
        runner.run.side_effect = run
        connection = Mock()
        config = {'source': '', 'published': '', 'runtime_version': 'unit', 'model': {}}
        try:
            with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'EngineRunner', return_value=runner), patch.object(smoke.signal, 'signal'):
                    smoke.engine_process(config, 'sqlite', Path(directory), [], 'full', 2, connection)
        finally:
            for executor in runner.executors.values():
                executor.shutdown(wait=True)
        self.assertEqual(events, ['core', 'providers', 'ai'])
        self.assertFalse(main.stop.called)
        runner.close.assert_called_once_with()

    def test_one_shot_retires_owner_sessions_after_their_last_terminal_result(self):
        class Session:
            def __init__(self):
                self.close_count, self.close_threads = 0, []

            def close(self):
                self.close_count += 1
                self.close_threads.append(threading.get_ident())

        registry = [
            Scenario('shared-first', 'full', lambda ctx: None, owner='shared_owner'),
            Scenario('shared-last', 'full', lambda ctx: None, owner='shared_owner'),
            Scenario('failed', 'full', lambda ctx: None, owner='failed_owner'),
            Scenario('skipped', 'full', lambda ctx: None, owner='skipped_owner'),
            Scenario('parallel', 'full', lambda ctx: None, owner='parallel_owner', parallel=('parallel',)),
        ]
        sessions = {owner: Session() for owner in
                    ('shared_owner', 'failed_owner', 'skipped_owner', 'parallel_owner')}
        executors = {owner: ThreadPoolExecutor(max_workers=1) for owner in
                     ('shared_owner', 'failed_owner', 'skipped_owner')}
        runner = Mock()
        runner.pool.instances = {}
        runner.sessions = sessions
        runner.executors = executors
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        executor_threads = {owner: executor.submit(threading.get_ident).result()
                            for owner, executor in executors.items()}
        rows = [
            Result('shared-first', 'sqlite', 'passed', 0),
            Result('failed', 'sqlite', 'failed', 0),
            Result('skipped', 'sqlite', 'skipped: no model configured', 0),
            Result('shared-last', 'sqlite', 'passed', 0),
            Result('parallel', 'sqlite', 'passed', 0),
        ]
        def run(_tier, _names, _workers, completed):
            for row in rows:
                completed(row)
                if row.scenario == 'shared-first':
                    self.assertEqual(sessions['shared_owner'].close_count, 0)
        runner.run.side_effect = run
        connection = Mock()
        config = {'source': '', 'published': '', 'runtime_version': 'unit', 'model': {}}
        try:
            with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                with patch.object(smoke, 'REGISTRY', registry), patch.object(smoke, 'EngineRunner', return_value=runner), patch.object(smoke.signal, 'signal'):
                    smoke.engine_process(config, 'sqlite', Path(directory), [], 'full', 2, connection)
        finally:
            for executor in executors.values():
                executor.shutdown(wait=True)
        for owner in ('shared_owner', 'failed_owner', 'skipped_owner'):
            self.assertEqual(sessions[owner].close_count, 1)
            self.assertEqual(sessions[owner].close_threads, [executor_threads[owner]])
        self.assertEqual(sessions['parallel_owner'].close_count, 0)
        runner.close.assert_called_once_with()

    def test_gate_constructor_failure_returns_owned_engine_receipt(self):
        for engine in ('sqlite', 'postgres'):
            with self.subTest(engine=engine), tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
                root = Path(directory) / engine
                connection = Mock()
                with patch.object(smoke, 'EngineRunner', side_effect=AssertionError()), patch.object(smoke.signal, 'signal'):
                    smoke.engine_process({'source': '', 'published': '', 'runtime_version': 'unit'},
                                         engine, root, [], 'regression', 1, connection)
                packet = json.loads(connection.send_bytes.call_args.args[0])
                document = json.loads(Path(packet['results_file']).read_text())
                self.assertEqual(document['counts']['failed'], 1)
                self.assertEqual(document['results'][0]['scenario'], 'engine')
                self.assertEqual(document['results'][0]['engine'], engine)
                diagnostic = json.loads(Path(document['results'][0]['evidence_paths'][0]).read_text())
                self.assertEqual(diagnostic['kind'], 'AssertionError')
                self.assertTrue(diagnostic['details']['traceback'])
                connection.close.assert_called_once_with()

    def test_gate_pipe_transmits_small_descriptor_for_large_errors(self):
        runner = Mock()
        runner.pool.instances = {}
        runner.run.side_effect = RuntimeError('large failure' * 100000)
        runner.close.return_value = Result('cleanup', 'sqlite', 'passed', 0)
        connection = Mock()
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            with patch.object(smoke, 'EngineRunner', return_value=runner):
                smoke.engine_process({'source': '', 'published': '', 'runtime_version': 'unit'},
                                     'sqlite', Path(directory), [], 'full', 2, connection)
            payload = connection.send_bytes.call_args.args[0]
            self.assertLess(len(payload), 4096)
            descriptor = json.loads(payload)
            rows = json.loads(Path(descriptor['results_file']).read_text())['results']
            self.assertEqual(rows[0]['error'], 'large failure' * 100000)


class SchedulerTests(unittest.TestCase):
    def test_isolated_runtime_areas_overlap_without_sharing_state(self):
        barrier = threading.Barrier(2)
        def run(scenario):
            barrier.wait(timeout=3)
            return Result(scenario.name, 'sqlite', 'passed', 0)
        selected = [Scenario('main', 'full', None),
                    Scenario('core', 'full', None, owner='scenarios_core')]
        self.assertEqual([r.status for r in harness.schedule(selected, run, {}, 2)], ['passed', 'passed'])

    def test_disjoint_components_overlap_and_dependencies_wait(self):
        barrier = threading.Barrier(2)
        calls = []
        def run(scenario):
            if scenario.name in ('a', 'b'):
                barrier.wait(timeout=3)
            calls.append(scenario.name)
            return Result(scenario.name, 'sqlite', 'passed', 0)
        selected = [Scenario('a', 'full', None, parallel=('user:a',)),
                    Scenario('b', 'full', None, parallel=('user:b',)),
                    Scenario('c', 'full', None, ('a',), parallel=('user:a',))]
        results = harness.schedule(selected, run, {}, 2)
        self.assertEqual(len(results), 3)
        self.assertLess(calls.index('a'), calls.index('c'))

    def test_native_root_claims_overlap_only_when_their_focused_roots_differ(self):
        started = threading.Barrier(2)
        release = threading.Barrier(2)
        calls = []
        lock = threading.Lock()

        def run(scenario):
            if scenario.name in ('core-first', 'component'):
                started.wait(timeout=3)
                release.wait(timeout=3)
            with lock:
                calls.append(scenario.name)
                if scenario.name == 'core-second':
                    self.assertIn('core-first', calls)
            return Result(scenario.name, 'sqlite', 'passed', 0)

        selected = [
            Scenario('core-first', 'full', None, parallel=('native-root:kickside/core',)),
            Scenario('component', 'full', None, parallel=('native-root:kickside/component',)),
            Scenario('core-second', 'full', None, parallel=('native-root:kickside/core',)),
        ]
        self.assertEqual([result.status for result in harness.schedule(selected, run, {}, 2)],
                         ['passed', 'passed', 'passed'])

    def test_shared_resources_and_default_cases_serialize(self):
        active, maximum = 0, 0
        lock = threading.Lock()
        def run(scenario):
            nonlocal active, maximum
            with lock:
                active += 1
                maximum = max(maximum, active)
            time.sleep(.02)
            with lock:
                active -= 1
            return Result(scenario.name, 'sqlite', 'passed', 0)
        selected = [Scenario('a', 'full', None, parallel=('component:shared',)),
                    Scenario('b', 'full', None, parallel=('component:shared',)),
                    Scenario('exclusive', 'full', None)]
        harness.schedule(selected, run, {}, 3)
        self.assertEqual(maximum, 1)

    def test_failure_blocks_dependents_but_independent_case_runs(self):
        outcomes = {}
        def run(scenario):
            status = 'failed' if scenario.name == 'a' or any(outcomes[n].status != 'passed' for n in scenario.requires) else 'passed'
            return Result(scenario.name, 'sqlite', status, 0)
        selected = [Scenario('a', 'full', None), Scenario('b', 'full', None, ('a',)),
                    Scenario('c', 'full', None)]
        self.assertEqual([r.status for r in harness.schedule(selected, run, outcomes, 2)], ['failed', 'failed', 'passed'])


if __name__ == '__main__':
    unittest.main()
