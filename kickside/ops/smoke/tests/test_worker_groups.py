import http.server
import socket
import socketserver
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import Mock

from browser import Browser, BrowserSession
from harness import Cleanup, Failure, Redactor


class _Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


class _Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *_):
        pass

    def html(self, script):
        body = ('<!doctype html><iframe srcdoc="<script>' + script.replace('"', '&quot;') +
                '</script>"></iframe>').encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/cross-origin-iframe':
            body = ('<!doctype html><iframe src="' + self.cross_origin_base +
                    '/cross-origin-fetch"></iframe>').encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/cross-origin-fetch':
            self.html("fetch('/stalled-fetch')")
            return
        if self.path == '/crossframe-child':
            body = ("<!doctype html><iframe srcdoc=\"<script>new Worker('/parent-worker.js',{type:'module'})</script>\"></iframe>"
                    "<iframe srcdoc=\"<script>new Worker('/parent-worker.js',{type:'module'})</script>\"></iframe>").encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/ordinary-and-child':
            body = ("<!doctype html><script async src=\"/slow-child.js\"></script><iframe srcdoc=\"<script>"
                    "new Worker('/parent-worker.js',{type:'module'})</script>\"></iframe>").encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/ordinary-missing':
            self.html("<script async src=/missing-worker.js><\\/script>")
            return
        if self.path == '/ordinary-and-worker':
            body = ("<!doctype html><script async src=\"/terminated-worker.js\"></script>"
                    "<iframe srcdoc=\"<script>const w=new Worker('/terminated-worker.js',{type:'module'});"
                    "setTimeout(()=>w.terminate(),1)</script>\"></iframe>").encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/crossframe':
            body = ("<!doctype html><iframe srcdoc=\"<script>const w=new Worker('/stalled-worker.js',{type:'module'});"
                    "setTimeout(()=>w.terminate(),1)</script>\"></iframe><iframe srcdoc=\"<script>"
                    "new Worker('/stalled-worker.js',{type:'module'})</script>\"></iframe>").encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/missing-worker.js':
            self.send_error(404)
            return
        if self.path == '/redirect-worker.js':
            self.send_response(302)
            self.send_header('Location', '/redirect-target.js')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return
        if self.path == '/redirect-target.js':
            body = b"postMessage('redirected');\n"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/disconnect-worker.js':
            self.connection.shutdown(socket.SHUT_RDWR)
            self.connection.close()
            return
        if self.path in ('/terminated-worker.js', '/stalled-worker.js', '/slow-child.js', '/stalled-fetch'):
            body = b"postMessage('ready');\n" if self.path != '/stalled-fetch' else b'partial'
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body) * 1000))
            self.end_headers()
            try:
                self.wfile.write(body)
                self.wfile.flush()
            except BrokenPipeError:
                return
            time.sleep(3)
            return
        if self.path == '/fast-child.js':
            body = b"export const ready = true;\n"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/parent-worker.js':
            body = b"import './slow-child.js'; postMessage('ready')"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/complete-worker.js':
            body = b"import './fast-child.js'; setInterval(() => {}, 1000)"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/progress-worker.js':
            body = b"postMessage('progress'); import('./slow-child.js')"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/failing-child-worker.js':
            body = b"import './missing-worker.js'"
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path == '/ordinary-stalled':
            self.html("document.write('<script src=/stalled-worker.js><\\/script>')")
            return
        mode = self.path.removeprefix('/') or 'terminated'
        if mode in ('terminated', 'terminated0', 'terminated1', 'terminated50'):
            delay = {'terminated': 1, 'terminated0': 0, 'terminated1': 1, 'terminated50': 50}[mode]
            script = "const w=new Worker('/terminated-worker.js',{type:'module'});setTimeout(()=>w.terminate()," + str(delay) + ')'
        elif mode == 'slow-child':
            script = "new Worker('/parent-worker.js',{type:'module'})"
        elif mode == 'complete-child':
            script = "new Worker('/complete-worker.js',{type:'module'})"
        elif mode == 'progress-child':
            script = "new Worker('/progress-worker.js',{type:'module'})"
        elif mode == 'failing-child':
            script = "new Worker('/failing-child-worker.js',{type:'module'})"
        elif mode == 'stalled':
            script = "new Worker('/stalled-worker.js',{type:'module'})"
        elif mode == 'missing':
            script = "new Worker('/missing-worker.js',{type:'module'})"
        elif mode == 'disconnect':
            script = "new Worker('/disconnect-worker.js',{type:'module'})"
        elif mode == 'dns':
            script = "new Worker('http://worker-name-does-not-resolve.invalid/bootstrap.js',{type:'module'})"
        elif mode == 'redirect':
            script = "const w=new Worker('/redirect-worker.js',{type:'module'});setTimeout(()=>w.terminate(),50)"
        elif mode == 'two':
            script = ("const first=new Worker('/stalled-worker.js',{type:'module'});"
                      "new Worker('/stalled-worker.js',{type:'module'});setTimeout(()=>first.terminate(),1)")
        else:
            script = ''
        self.html(script)


class _Instance:
    def __init__(self):
        self.cleanup = Cleanup()
        self.redactor = Redactor()
        self.root = Path('/tmp')
        self.base = 'http://127.0.0.1'
        self.evidence = type('Evidence', (), {'label': 'worker-settle', 'paths': [], 'save': lambda *_: None})()


class WorkerSettleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = _Server(('127.0.0.1', 0), _Handler)
        cls.cross_origin_server = _Server(('127.0.0.1', 0), _Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.cross_origin_thread = threading.Thread(target=cls.cross_origin_server.serve_forever, daemon=True)
        cls.thread.start()
        cls.cross_origin_thread.start()
        cls.base = 'http://127.0.0.1:' + str(cls.server.server_address[1])
        _Handler.cross_origin_base = 'http://localhost:' + str(cls.cross_origin_server.server_address[1])

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.cross_origin_server.shutdown()
        cls.cross_origin_server.server_close()

    def setUp(self):
        self.session = BrowserSession()
        self.browser = Browser(_Instance(), session=self.session)

    def tearDown(self):
        try:
            self.browser.close()
        finally:
            self.session.close()

    def _open(self, path):
        self.browser.page.goto(self.base + path, wait_until='domcontentloaded')
        self.browser.page.wait_for_timeout(200)

    def _fresh_browser(self):
        self.browser.close()
        self.browser = Browser(_Instance(), session=self.session)

    def _assert_pending_blocks_settle(self, url_part):
        pending = [request for request, url in self.browser.pending.items() if url_part in url]
        self.assertTrue(pending, 'negative control does not start ' + url_part)
        self.browser.settle_seconds = .5
        with self.assertRaisesRegex(Failure, 'Browser requests do not settle'):
            self.browser.settle()
        self.assertTrue(any(url_part in url for url in self.browser.pending.values()))

    def test_canceled_worker_bootstrap_settles_at_zero_one_and_fifty_milliseconds(self):
        for mode in ('terminated0', 'terminated1', 'terminated50'):
            with self.subTest(mode=mode):
                self._open('/' + mode)
                self.browser.settle()
                self.assertFalse(self.browser.pending)

    def test_worker_constructor_keeps_its_native_new_requirement(self):
        self.assertTrue(self.browser.page.evaluate("""() => {
            try { Worker('/stalled-worker.js'); return false; }
            catch (error) { return error instanceof TypeError; }
        }"""))

    def test_live_worker_remains_pending(self):
        self._open('/stalled')
        self._assert_pending_blocks_settle('/stalled-worker.js')

    def test_slow_child_remains_pending(self):
        self._open('/slow-child')
        self.assertTrue(self.browser.pending)
        self.assertTrue(any(event['kind'] == 'worker-network-requestWillBeSent'
                            for event in self.browser.worker_events))
        self.browser.settle_seconds = .5
        with self.assertRaisesRegex(Failure, 'Browser requests do not settle'):
            self.browser.settle()
        self.assertTrue(self.browser.pending)

    def test_completed_worker_child_uses_native_target_network_completion(self):
        self._open('/complete-child')
        self.browser.settle()
        self.assertFalse(self.browser.pending)
        self.assertTrue(any(event['kind'] == 'worker-network-loadingFinished' and event['url'].endswith('/fast-child.js')
                            for event in self.browser.worker_events))

    def test_worker_progress_message_does_not_settle_a_stalled_child(self):
        self._open('/progress-child')
        self._assert_pending_blocks_settle('/slow-child.js')

    def test_same_child_url_in_two_frames_remains_ambiguous(self):
        self._open('/crossframe-child')
        self._assert_pending_blocks_settle('/slow-child.js')

    def test_ordinary_script_with_a_matching_worker_child_remains_pending(self):
        self._open('/ordinary-and-child')
        self._assert_pending_blocks_settle('/slow-child.js')

    def test_worker_child_network_failure_remains_an_error(self):
        self._open('/failing-child')
        with self.assertRaisesRegex(Failure, 'browser console/network errors'):
            self.browser.clean(0)

    def test_ordinary_script_failure_remains_an_error(self):
        self._open('/ordinary-missing')
        with self.assertRaisesRegex(Failure, 'browser console/network errors'):
            self.browser.clean(0)

    def test_ordinary_script_and_fetch_stalls_remain_pending(self):
        self._open('/ordinary-stalled')
        self._assert_pending_blocks_settle('/stalled-worker.js')
        self._fresh_browser()
        self._open('/')
        self.browser.page.evaluate("fetch('/stalled-fetch')")
        self.browser.page.wait_for_timeout(100)
        self.assertTrue(any('/stalled-fetch' in url for url in self.browser.pending.values()))
        self._assert_pending_blocks_settle('/stalled-fetch')

    def test_cross_origin_oopif_fetch_stall_is_not_pruned_as_page_idle(self):
        self.browser.close()
        self.session.browser.close()
        self.session.browser = self.session.playwright.chromium.launch(
            headless=True, args=['--no-sandbox', '--site-per-process'],
            ignore_default_args=['--disable-site-isolation-trials'])
        self.browser = Browser(_Instance(), session=self.session)
        self._open('/cross-origin-iframe')
        self.browser.page.wait_for_timeout(200)
        targets = self.browser.browser_cdp.send('Target.getTargets')['targetInfos']
        self.assertTrue(any(target['type'] == 'iframe' and
                            target['url'] == _Handler.cross_origin_base + '/cross-origin-fetch'
                            for target in targets), 'negative control requires an out-of-process iframe')
        self._assert_pending_blocks_settle('/stalled-fetch')

    def test_real_failures_are_not_swallowed(self):
        for mode in ('missing', 'disconnect', 'dns'):
            with self.subTest(mode=mode):
                if mode == 'dns':
                    def abort(route):
                        route.abort('namenotresolved')
                    self.browser.page.route('http://worker-name-does-not-resolve.invalid/**', abort)
                self._open('/' + mode)
                with self.assertRaises(Failure):
                    self.browser.clean(0)
                if mode == 'dns':
                    self.browser.page.unroute('http://worker-name-does-not-resolve.invalid/**', abort)
                self._fresh_browser()

    def test_same_url_live_worker_blocks_a_canceled_sibling(self):
        self._open('/two')
        self._assert_pending_blocks_settle('/stalled-worker.js')

    def test_same_url_workers_in_distinct_iframes_remain_ambiguous(self):
        self._open('/crossframe')
        self._assert_pending_blocks_settle('/stalled-worker.js')

    def test_redirected_worker_script_remains_an_ordinary_successful_load(self):
        self._open('/redirect')
        self.browser.settle()
        self.assertFalse(self.browser.pending)
        self.browser.clean(0)

    def test_ordinary_script_with_worker_url_blocks_canceled_worker_accounting(self):
        self._open('/ordinary-and-worker')
        self._assert_pending_blocks_settle('/terminated-worker.js')

    def test_context_reset_discards_old_worker_accounting(self):
        self._open('/terminated1')
        self.browser.settle()
        self.assertTrue(self.browser.worker_events)
        self.browser.reset_context()
        self.assertFalse(self.browser.worker_targets)
        self.assertFalse(self.browser.native_network)

    def test_closing_a_sibling_page_does_not_drop_a_bound_worker_stall(self):
        first = self.browser.page
        second = self.browser.open_page()
        second.goto(self.base + '/slow-child', wait_until='domcontentloaded')
        second.wait_for_timeout(200)
        self.browser.page = second
        self.assertTrue(any('/slow-child.js' in url for url in self.browser.pending.values()))
        first.close()
        self._assert_pending_blocks_settle('/slow-child.js')


class WorkerGroupUnitTests(unittest.TestCase):
    def test_unbound_worker_keeps_its_remaining_page_candidate_until_all_close(self):
        browser = Browser.__new__(Browser)
        browser.page_cdps, browser.pending, browser.page_scopes = {}, {}, {}
        browser.browser_context_scopes = {}
        browser.worker_targets = {'worker': {'scope': None, 'candidate_scopes': {1, 2},
                                             'destroyed': False, 'url': None}}
        browser.worker_sessions, browser.worker_session_cdps = {'session': 'worker'}, {'session': Mock()}
        browser.worker_network_urls = {('worker', 'child'): 'http://asset/child.js'}
        browser.worker_parsed_urls = {'worker': {'http://asset/root.js'}}
        browser.native_unscoped_workers = {'worker': {1, 2}}
        browser.native_network = {(2, 'worker', 'child'): {'method': 'GET',
                                  'url': 'http://asset/child.js', 'failed': False}}

        browser.forget_page(1)
        self.assertIn('worker', browser.worker_targets)
        self.assertEqual(browser.worker_targets['worker']['candidate_scopes'], {2})
        self.assertEqual(browser.native_unscoped_workers, {'worker': {2}})
        self.assertIn('session', browser.worker_sessions)
        self.assertIn((2, 'worker', 'child'), browser.native_network)

        browser.forget_page(2)
        self.assertFalse(browser.worker_targets)
        self.assertFalse(browser.native_unscoped_workers)
        self.assertFalse(browser.worker_sessions)
        self.assertFalse(browser.worker_session_cdps)
        self.assertFalse(browser.worker_network_urls)
        self.assertFalse(browser.worker_parsed_urls)
        self.assertFalse(browser.native_network)

    def test_native_ledger_uses_target_identity_not_url_or_playwright_request(self):
        browser = Browser.__new__(Browser)
        browser.inst, browser.worker_events = _Instance(), []
        browser.native_network, browser.native_unscoped_workers = {}, {}
        first = {'requestId': 'same', 'request': {'method': 'GET', 'url': 'http://asset/child.js'}}
        browser.native_started(1, 'worker-one', first)
        browser.native_started(1, 'worker-two', first)
        self.assertFalse(browser.native_scope_idle(1))
        browser.native_finished(1, 'worker-one', {'requestId': 'same'})
        self.assertFalse(browser.native_scope_idle(1))
        browser.native_finished(1, 'worker-two', {'requestId': 'same'})
        self.assertTrue(browser.native_scope_idle(1))

    def test_worker_bootstrap_terminal_closes_its_page_target_ledger_entry(self):
        browser = Browser.__new__(Browser)
        browser.inst, browser.worker_events = _Instance(), []
        browser.native_network, browser.native_unscoped_workers = {}, {}
        browser.worker_network_urls = {}
        browser.worker_sessions = {'session': 'worker'}
        browser.worker_targets = {'worker': {'scope': 1, 'destroyed': False, 'url': None}}
        browser.native_started(1, 'page:1', {'requestId': 'worker',
                                             'request': {'method': 'GET', 'url': 'http://asset/worker.js'}})
        browser.worker_message_received({'sessionId': 'session', 'message':
            '{"method":"Network.loadingFinished","params":{"requestId":"worker"}}'})
        self.assertTrue(browser.native_scope_idle(1))

    def test_finished_requests_are_not_retained(self):
        browser = Browser.__new__(Browser)
        request = object()
        browser.pending = {request: 'asset'}
        browser.request_finished(request)
        self.assertFalse(browser.pending)

    def test_target_destruction_requires_a_known_dedicated_worker(self):
        browser = Browser.__new__(Browser)
        browser.worker_targets = {}
        browser.worker_target_destroyed({'targetId': 'page-target'})
        self.assertFalse(browser.worker_targets)

    def test_native_worker_failure_is_not_silently_erased(self):
        browser = Browser.__new__(Browser)
        browser.inst, browser.worker_events, browser.errors = _Instance(), [], []
        browser.native_network = {}
        browser.native_started(1, 'worker-target', {'requestId': 'child',
                              'request': {'method': 'GET', 'url': 'http://asset/child.js'}})
        browser.native_response(1, 'worker-target', {'requestId': 'child', 'response': {'status': 404}})
        browser.native_finished(1, 'worker-target', {'requestId': 'child'})
        self.assertTrue(any('Worker network failure' in error for error in browser.errors))

    def test_page_watch_failure_detaches_the_half_registered_cdp_session(self):
        browser = Browser.__new__(Browser)
        cdp, context, page = Mock(), Mock(), Mock()
        context.new_cdp_session.return_value = cdp
        page.context = context
        cdp.on.side_effect = RuntimeError('listener failure')
        browser.context = context
        browser.next_page_scope = 0
        browser.page_scopes, browser.context_scopes, browser.page_cdps = {}, {}, {}
        browser.browser_context_scopes, browser.worker_targets = {}, {}
        browser.pending = {}
        with self.assertRaisesRegex(RuntimeError, 'listener failure'):
            browser.watch(page)
        cdp.detach.assert_called_once_with()
        self.assertFalse(browser.page_scopes)
        self.assertFalse(browser.page_cdps)

    def test_debugger_parse_must_match_the_root_bootstrap_url(self):
        browser = Browser.__new__(Browser)
        browser.inst, browser.worker_events, browser.errors = _Instance(), [], []
        browser.native_network, browser.native_unscoped_workers = {}, {}
        browser.worker_network_urls, browser.worker_parsed_urls = {}, {}
        browser.worker_sessions = {'session': 'worker'}
        browser.worker_targets = {'worker': {'scope': 1, 'bootstrap_url': 'http://asset/root.js',
                                              'destroyed': False, 'url': 'http://asset/root.js'}}
        browser.native_started(1, 'page:1', {'requestId': 'worker',
                                             'request': {'method': 'GET', 'url': 'http://asset/root.js'}})
        browser.worker_message_received({'sessionId': 'session', 'message':
            '{"method":"Debugger.scriptParsed","params":{"url":"http://asset/child.js"}}'})
        self.assertFalse(browser.native_scope_idle(1))
        browser.worker_message_received({'sessionId': 'session', 'message':
            '{"method":"Debugger.scriptParsed","params":{"url":"http://asset/root.js"}}'})
        self.assertTrue(browser.native_scope_idle(1))

    def test_autoattached_non_worker_is_resumed(self):
        browser = Browser.__new__(Browser)
        browser.worker_cdp_send = Mock()
        browser.page_worker_attached(1, Mock(), {'sessionId': 'frame-session',
                                                   'targetInfo': {'type': 'iframe', 'targetId': 'frame'}})
        browser.worker_cdp_send.assert_called_once_with('frame-session', 'Runtime.runIfWaitingForDebugger', cdp=unittest.mock.ANY)

    def test_foreign_browser_context_worker_is_ignored(self):
        browser = Browser.__new__(Browser)
        browser.browser_context_scopes, browser.worker_targets = {'ours': {1}}, {}
        browser.native_unscoped_workers = {}
        browser.worker_event = Mock()
        browser.worker_target_created({'targetInfo': {'type': 'worker', 'targetId': 'foreign',
                                                       'browserContextId': 'theirs', 'url': 'http://asset/a.js'}})
        self.assertFalse(browser.worker_targets)
        self.assertFalse(browser.native_unscoped_workers)

    def test_delayed_cdp_start_cannot_drop_an_ordinary_playwright_request(self):
        browser = Browser.__new__(Browser)
        page, request = Mock(), Mock()
        request.frame.page = page
        browser.inst, browser.worker_events, browser.errors = _Instance(), [], []
        browser.pending = {request: 'http://asset/ordinary.js'}
        browser.page_scopes = {id(page): 1}
        browser.native_network, browser.native_unscoped_workers = {}, {}
        browser.worker_targets, browser.worker_parsed_urls = {}, {}
        browser.crashes, browser.settle_seconds, browser.page = (), .25, page
        calls = 0
        def pump(_):
            nonlocal calls
            calls += 1
            if calls == 1:
                browser.cdp_request(1, {'requestId': 'ordinary', 'type': 'Script',
                                        'request': {'method': 'GET', 'url': 'http://asset/ordinary.js'}})
            time.sleep(.1)
        page.wait_for_timeout.side_effect = pump
        with self.assertRaisesRegex(Failure, 'Browser requests do not settle'):
            browser.settle()
        self.assertIn(request, browser.pending)
