"""Combined-run ownership and evidence disclosure regressions."""
from harness import Cleanup
import os
from pathlib import Path
import tempfile
import unittest
import threading
from unittest.mock import Mock, patch

from harness import load_registry, Scenario
from browser import Browser
from runtime import Instance


class LifecycleTests(unittest.TestCase):
    def test_api_fixture_restart_does_not_create_a_browser(self):
        from runtime import RuntimePool
        from scenarios import Context
        pool = RuntimePool({}, 'postgres', Path(os.environ['TMPDIR']))
        ctx = Context(Mock(cleanup=Cleanup()))
        ctx.browser_check = Mock()
        pool.contexts = {'scenarios_crm_events': ctx}
        self.assertIsNone(pool.restart(ctx))
        ctx.browser_check.assert_not_called()
        ctx.inst.stop.assert_called_once_with(hard=False)
        ctx.inst.start.assert_called_once_with()

    def test_crm_event_setup_restarts_through_shared_context_lifecycle(self):
        import scenarios_crm_events as events
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            inst = Mock(app=Path(directory))
            inst.request.return_value = {'component_id': 'jira-connection'}
            ctx = SimpleNamespace(inst=inst, browser=None, state={}, fixtures=Mock(), restart=Mock())
            ctx.fixtures.start.return_value = 'http://127.0.0.1:12345'
            (inst.app / 'src').mkdir()
            events.setup(ctx)
            ctx.restart.assert_called_once_with()
            inst.stop.assert_not_called()
            inst.start.assert_not_called()

    def test_restart_releases_all_shared_browsers_before_stopping_runtime(self):
        from runtime import RuntimePool
        from scenarios import Context
        pool = RuntimePool({}, 'postgres', Path(os.environ['TMPDIR']))
        shared, isolated = Mock(cleanup=Cleanup()), Mock(cleanup=Cleanup())
        active, other, separate = Context(shared), Context(shared), Context(isolated)
        pool.contexts = {'scenarios_automation': active, 'scenarios_access': other,
                         'scenarios_core': separate}
        active.browser, other.browser, separate.browser = Mock(), Mock(), Mock()
        events = []
        def release(ctx):
            events.append(ctx)
            ctx.browser = None
        shared.stop.side_effect = lambda **kw: events.append('stop')
        shared.start.side_effect = lambda: events.append('start')
        replacement = Mock()
        other.browser_check = Mock(side_effect=lambda: setattr(other, "browser", Mock()) or other.browser)
        active.browser_check = Mock(side_effect=lambda: setattr(active, "browser", replacement) or replacement)
        with patch.object(Browser, 'release', side_effect=release):
            self.assertIs(pool.restart(active, hard=True), replacement)
        self.assertEqual(events, [active, other, 'stop', 'start'])
        shared.stop.assert_called_once_with(hard=True)
        replacement.restore.assert_called_once()
        self.assertTrue(other.browser.restore.called)
        self.assertIsNotNone(other.browser)
        self.assertIsNotNone(separate.browser)
        isolated.stop.assert_not_called()

    def test_areas_use_unique_runtime_roots_and_share_one_browser_session(self):
        from runtime import RuntimePool
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            config = {'host': '127.0.0.1', 'email': 'owner@example.invalid', 'password': 'secret', 'model': {}}
            pool = RuntimePool(config, 'sqlite', Path(directory))
            main = pool.context('scenarios')
            ai = pool.context('scenarios_ai')
            core = pool.context('scenarios_core')
            providers = pool.context('scenarios_providers')
            self.assertEqual(len({ctx.inst.root for ctx in (main, ai, core, providers)}), 4)
            self.assertEqual(len({ctx.inst.db for ctx in (main, ai, core, providers)}), 4)
            for owner in ('scenarios_access', 'scenarios_automation', 'scenarios_crm_chestor'):
                area = pool.context(owner)
                self.assertIs(area.inst, main.inst)
                self.assertIsNot(area, main)
                self.assertIsNone(area.browser)
            self.assertTrue(all(ctx.browser_session is main.browser_session for ctx in (ai, core, providers)))
            for ctx in (main, ai, core, providers):
                self.assertEqual(ctx.inst.env['TMPDIR'], str(ctx.inst.root / 'temp'))
            self.assertEqual(pool.cleanup(), [])

    def test_boot_prepares_once_and_does_not_restart_a_live_instance(self):
        inst = Instance.__new__(Instance)
        inst.boot_lock = threading.RLock()
        inst.prepared = False
        inst.process = None
        def prepare():
            inst.prepared = True
        def start():
            inst.process = Mock()
            inst.process.poll.return_value = None
        inst.prepare = Mock(side_effect=prepare)
        inst.start = Mock(side_effect=start)
        inst.manifest = Mock()
        inst.boot()
        inst.boot()
        inst.prepare.assert_called_once_with()
        inst.start.assert_called_once_with()
        inst.manifest.assert_called_once_with()

    def test_concurrent_boot_serializes_the_initial_prepare_and_start(self):
        inst = Instance.__new__(Instance)
        inst.boot_lock = threading.RLock()
        inst.prepared = False
        inst.process = None
        entered = threading.Event()
        release = threading.Event()

        def prepare():
            entered.set()
            self.assertTrue(release.wait(timeout=3))
            inst.prepared = True

        def start():
            inst.process = Mock()
            inst.process.poll.return_value = None

        inst.prepare = Mock(side_effect=prepare)
        inst.start = Mock(side_effect=start)
        inst.manifest = Mock()
        workers = [threading.Thread(target=inst.boot) for _ in range(2)]
        workers[0].start()
        self.assertTrue(entered.wait(timeout=3))
        workers[1].start()
        self.assertEqual(inst.prepare.call_count, 1)
        release.set()
        for worker in workers:
            worker.join(timeout=5)
        self.assertTrue(all(not worker.is_alive() for worker in workers))
        inst.prepare.assert_called_once_with()
        inst.start.assert_called_once_with()
        inst.manifest.assert_called_once_with()

    def test_closing_one_context_keeps_other_context_and_driver_alive(self):
        from browser import BrowserSession
        with patch('playwright.sync_api.sync_playwright') as factory:
            driver = factory.return_value.start.return_value
            session = BrowserSession()
            first = Browser(Mock(), session=session)
            second = Browser(Mock(), session=session)
            first.close()
            driver.stop.assert_not_called()
            driver.chromium.launch.return_value.close.assert_not_called()
            second.page.title()
            factory.return_value.start.assert_called_once_with()
            session.close()
            driver.stop.assert_called_once_with()

    def test_area_roots_do_not_depend_on_another_areas_boot(self):
        registry = {s.name: s for s in load_registry(Path(__file__).resolve().parents[1])}
        for name in ('ai_boot', 'core_ready', 'providers_boot'):
            self.assertEqual(registry[name].requires, ())
            self.assertTrue(registry[name].owner.startswith('scenarios_'))
        for name in ('core_threads', 'core_thread_messages', 'core_hub_auth_status', 'core_documentation'):
            self.assertEqual(registry[name].requires, ('core_ready',))

    def test_prerequisite_errors_record_first_real_roots_and_independent_case_runs(self):
        import smoke
        from scenarios import Context
        inst = Mock(cleanup=Cleanup())
        inst.redactor.text.side_effect = str
        inst.evidence.paths = []
        inst.env = {'TMPDIR': os.environ['TMPDIR']}
        ctx = Context(inst)
        pool = Mock()
        pool.context.return_value = ctx
        pool.cleanup.return_value = []
        pool.contexts = {}
        ran = []
        def failure(ctx):
            raise RuntimeError('real product failure')
        selected = [Scenario('a', 'full', failure), Scenario('b', 'full', lambda ctx: None, ('a',)),
                    Scenario('c', 'full', lambda ctx: None, ('b',)),
                    Scenario('independent', 'full', lambda ctx: ran.append(True))]
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            results = []
            with patch.object(smoke, 'RuntimePool', return_value=pool), patch.object(smoke, 'write_results'):
                smoke.run_engine({}, 'sqlite', Path(directory) / 'sqlite', selected, results, 'full')
            self.assertEqual(results[0].failure_roots, ['a'])
            self.assertEqual(results[2].failure_roots, ['a'])
            self.assertEqual(results[2].blocked_by, ['b'])
            self.assertEqual(results[3].status, 'passed')
            self.assertEqual(ran, [True])


class CapturePolicyTests(unittest.TestCase):
    def test_masks_short_secrets_labels_fields_urls_and_every_frame(self):
        browser = Browser.__new__(Browser)
        browser.page = Mock()
        browser.page.frames = [Mock(), Mock()]
        browser.inst = Mock(cleanup=Cleanup())
        browser.inst.root = Path(os.environ['TMPDIR'])
        browser.inst.evidence.label = 'capture-policy'
        browser.inst.redactor.secrets = {'abc', 'long-secret'}
        browser.inst.email = 'owner@example.invalid'
        browser.settle = Mock()
        for frame in browser.page.frames:
            field = Mock()
            field.is_visible.return_value = True
            field.evaluate_all.return_value = [{'value': 'short-client', 'identity': 'OAuth client ID'}]
            frame.locator.return_value.all.return_value = [field]
        with patch.object(Path, 'mkdir'):
            browser.screenshot('masked', full_page=False, mask_color='#17191c')
        browser.settle.assert_called_once_with()
        for frame in browser.page.frames:
            frame.locator.assert_any_call('input, textarea')
            patterns = [call.args[0] for call in frame.get_by_text.call_args_list]
            self.assertTrue(any(hasattr(p, 'search') and p.search('abc') for p in patterns))
            self.assertTrue(any(hasattr(p, 'search') and p.search('https://private.example/path') for p in patterns))
            self.assertTrue(frame.get_by_label.called)
            field = frame.locator.return_value.all.return_value[0]
            self.assertIn(field, browser.page.screenshot.call_args.kwargs['mask'])
        self.assertFalse(browser.page.screenshot.call_args.kwargs['full_page'])
        self.assertEqual(browser.page.screenshot.call_args.kwargs['mask_color'], '#17191c')
        browser.inst.evidence.paths.append.assert_called_once()

    def test_area_modules_have_no_browser_subclasses_or_capture_policies(self):
        import ast
        directory = Path(__file__).resolve().parents[1]
        for path in directory.glob('scenarios*.py'):
            tree = ast.parse(path.read_text())
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom) and node.module == 'mocks':
                    self.assertFalse(any(name.name in ('start', 'stop', 'requests') for name in node.names), str(path))
                if isinstance(node, ast.ClassDef):
                    self.assertFalse(any(isinstance(base, ast.Name) and base.id == 'Browser' for base in node.bases), str(path))
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                    self.assertNotIn(node.func.attr, ('new_context', 'new_page'), str(path))
                    if node.func.attr == 'screenshot':
                        self.assertFalse(any(k.arg in ('mask', 'path') for k in node.keywords), str(path))


class BrowserOwnershipTests(unittest.TestCase):
    def test_release_removes_only_its_context_cleanup(self):
        from scenarios import Context
        ctx = Context(Mock(cleanup=Cleanup()))
        browser = ctx.browser = Mock(errors=[])
        other = Mock()
        ctx.inst.cleanup.add('browser', browser.close)
        ctx.inst.cleanup.add('other', other)
        Browser.release(ctx)
        browser.settle.assert_called_once_with()
        browser.clean.assert_called_once_with(0)
        browser.close.assert_called_once_with()
        self.assertEqual(ctx.inst.cleanup.callbacks, [('other', other)])
        self.assertIsNone(ctx.browser)

    def test_replaced_browser_checks_errors_from_its_own_beginning(self):
        import smoke
        from scenarios import Context
        inst = Mock(cleanup=Cleanup())
        inst.redactor.text.side_effect = str
        inst.env = {'TMPDIR': os.environ['TMPDIR']}
        inst.evidence.paths = []
        ctx = Context(inst)
        ctx.browser = Mock(errors=['old handled error'])
        replacement = Mock(errors=['new browser error'])
        replacement.clean.side_effect = lambda start: (_ for _ in ()).throw(RuntimeError('new browser error')) if start == 0 else None
        pool = Mock()
        pool.context.return_value = ctx
        pool.cleanup.return_value = []
        pool.contexts = {}
        def replace(ctx):
            ctx.browser = replacement
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            results = []
            with patch.object(smoke, 'RuntimePool', return_value=pool), patch.object(smoke, 'write_results'):
                smoke.run_engine({}, 'sqlite', Path(directory) / 'sqlite', [Scenario('replace', 'full', replace)], results, 'full')
        self.assertEqual(results[0].status, 'failed')
        replacement.clean.assert_called_once_with(0)
        self.assertEqual(results[0].failure_roots, ['replace'])

    def test_real_playwright_context_release_keeps_sibling_page_usable(self):
        from browser import BrowserSession
        session = BrowserSession()
        first = second = None
        try:
            first = Browser(Mock(), session=session)
            second = Browser(Mock(), session=session)
            second.page.set_content('<title>Northwind sibling</title>')
            first.close()
            self.assertEqual(second.page.title(), 'Northwind sibling')
        finally:
            if second:
                second.close()
            if first:
                first.close()
            session.close()


class FixtureOwnershipTests(unittest.TestCase):
    def test_access_crm_and_providers_use_independent_jira_servers(self):
        from mocks import Fixtures
        from urllib.request import Request, urlopen
        import base64
        pools = [Fixtures() for _ in range(3)]
        try:
            bases = [pool.start('jira') for pool in pools]
            self.assertEqual(len(set(bases)), 3)
            auth = 'Basic ' + base64.b64encode(b'northwind@example.invalid:fictional-jira-token').decode()
            with urlopen(Request(bases[0] + '/rest/api/3/myself', headers={'Authorization': auth}), timeout=5) as response:
                self.assertEqual(response.status, 200)
            self.assertEqual(len(pools[0].requests('jira')), 1)
            self.assertEqual(pools[1].requests('jira'), [])
            self.assertEqual(pools[2].requests('jira'), [])
            pools[0].stop()
            with urlopen(Request(bases[2] + '/rest/api/3/myself', headers={'Authorization': auth}), timeout=5) as response:
                self.assertEqual(response.status, 200)
            with self.assertRaisesRegex(ValueError, 'already running'):
                pools[2].start('jira')
        finally:
            for pool in pools:
                pool.stop()

    def test_each_area_keeps_its_own_fixture_registry_on_a_shared_instance(self):
        from runtime import RuntimePool
        with tempfile.TemporaryDirectory(dir=os.environ['TMPDIR']) as directory:
            config = {'host': '127.0.0.1', 'email': 'owner@example.invalid', 'password': 'secret', 'model': {}}
            pool = RuntimePool(config, 'sqlite', Path(directory))
            access, crm, providers = [pool.context(owner) for owner in ('scenarios_access', 'scenarios_crm_events', 'scenarios_providers')]
            self.assertIs(access.inst, crm.inst)
            self.assertEqual(len({id(ctx.fixtures) for ctx in (access, crm, providers)}), 3)
            self.assertEqual(len({ctx.fixtures.start('jira') for ctx in (access, crm, providers)}), 3)
            self.assertEqual(pool.cleanup(), [])
            self.assertTrue(all(ctx.fixtures.requests() == [] for ctx in (access, crm, providers)))
