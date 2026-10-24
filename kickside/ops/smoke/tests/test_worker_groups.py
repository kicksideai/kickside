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
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = 'http://127.0.0.1:' + str(cls.server.server_address[1])

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

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
        self.assertTrue(all(not self.browser.group_closed(request) for request in pending))
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
        self.assertTrue(any(event['kind'] == 'worker-network-bound' and event['url'].endswith('/fast-child.js')
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
        self.assertTrue(self.browser.worker_groups)
        self.browser.reset_context()
        self.assertFalse(self.browser.worker_groups)
        self.assertFalse(self.browser.worker_phases)
        self.assertFalse(self.browser.worker_targets)


class WorkerGroupUnitTests(unittest.TestCase):
    def test_finished_requests_are_not_retained(self):
        browser = Browser.__new__(Browser)
        request = object()
        browser.pending = {request: 'asset'}
        browser.request_groups = {request: ('scope', 'GET', 'asset')}
        browser.request_finished(request)
        self.assertFalse(browser.pending)
        self.assertFalse(browser.request_groups)

    def test_target_destruction_requires_a_known_dedicated_worker(self):
        browser = Browser.__new__(Browser)
        browser.worker_targets = {}
        browser.worker_phases = {}
        browser.worker_groups = {}
        browser.worker_target_destroyed({'targetId': 'page-target'})
        self.assertFalse(browser.worker_groups)

    def test_cdp_non_success_response_latches_a_worker_phase_failure(self):
        browser = Browser.__new__(Browser)
        key, phase = (1, 'GET', 'http://asset/worker.js'), (1, 'worker-target')
        browser.worker_groups = {key: Browser.new_group()}
        browser.worker_groups[key]['phases'].add(phase)
        browser.worker_phases = {phase: (key, phase)}
        browser.cdp_response(1, {'requestId': 'worker-target', 'response': {'status': 404}})
        self.assertTrue(browser.worker_groups[key]['failed'])

    def test_page_watch_failure_detaches_the_half_registered_cdp_session(self):
        browser = Browser.__new__(Browser)
        cdp, context, page = Mock(), Mock(), Mock()
        context.new_cdp_session.return_value = cdp
        page.context = context
        cdp.on.side_effect = RuntimeError('listener failure')
        browser.context = context
        browser.next_page_scope = 0
        browser.page_scopes, browser.context_scopes, browser.page_cdps = {}, {}, {}
        browser.worker_groups, browser.worker_targets, browser.worker_phases = {}, {}, {}
        browser.pending, browser.request_groups = {}, {}
        with self.assertRaisesRegex(RuntimeError, 'listener failure'):
            browser.watch(page)
        cdp.detach.assert_called_once_with()
        self.assertFalse(browser.page_scopes)
        self.assertFalse(browser.page_cdps)

    def test_reused_cdp_request_id_marks_both_redirect_phases_uncertain(self):
        browser = Browser.__new__(Browser)
        browser.worker_groups, browser.worker_phases = {}, {}
        browser.worker_targets = {'worker-target': {'destroyed': False, 'phase': None, 'url': None}}
        first = {'type': 'Script', 'requestId': 'worker-target',
                 'request': {'method': 'GET', 'url': 'http://asset/first.js'}}
        browser.cdp_request(1, first)
        first_key = (1, 'GET', 'http://asset/first.js')
        browser.worker_groups[first_key]['high'] = 1
        browser.cdp_request(1, {**first, 'request': {'method': 'GET', 'url': 'http://asset/second.js'}})
        self.assertTrue(browser.worker_groups[first_key]['uncertain'])
        self.assertTrue(browser.worker_groups[(1, 'GET', 'http://asset/second.js')]['uncertain'])

    def test_native_worker_network_finishes_only_its_bound_request(self):
        browser = Browser.__new__(Browser)
        request = object()
        key = (1, 'GET', 'http://asset/child.js')
        browser.worker_groups, browser.request_groups = {}, {}
        browser.unbound_worker_requests = {request: {'scope': 1, 'method': 'GET', 'url': key[2]}}
        browser.worker_network = {('worker', 'native'): {
            'scope': 1, 'target': 'worker', 'request_id': 'native', 'method': 'GET', 'url': key[2],
            'terminal': True, 'failed': False, 'request': None}}
        browser.page_script_starts = {}
        browser.bind_worker_network()
        self.assertTrue(browser.group_closed(request))

    def test_same_url_native_workers_remain_unbound(self):
        browser = Browser.__new__(Browser)
        request = object()
        browser.worker_groups, browser.request_groups = {}, {}
        browser.unbound_worker_requests = {request: {'scope': 1, 'method': 'GET', 'url': 'http://asset/child.js'}}
        browser.worker_network = {
            ('one', 'native'): {'scope': 1, 'target': 'one', 'request_id': 'native', 'method': 'GET',
                                'url': 'http://asset/child.js', 'terminal': True, 'failed': False, 'request': None},
            ('two', 'native'): {'scope': 1, 'target': 'two', 'request_id': 'native', 'method': 'GET',
                                'url': 'http://asset/child.js', 'terminal': True, 'failed': False, 'request': None},
        }
        browser.page_script_starts = {}
        browser.bind_worker_network()
        self.assertNotIn(request, browser.request_groups)

    def test_page_cdp_script_start_after_native_binding_keeps_the_group_pending(self):
        browser = Browser.__new__(Browser)
        request = object()
        key = (1, 'GET', 'http://asset/child.js')
        browser.inst, browser.worker_events = _Instance(), []
        browser.worker_groups, browser.request_groups, browser.worker_targets = {}, {}, {}
        browser.unbound_worker_requests = {request: {'scope': 1, 'method': 'GET', 'url': key[2]}}
        browser.worker_network = {('worker', 'native'): {
            'scope': 1, 'target': 'worker', 'request_id': 'native', 'method': 'GET', 'url': key[2],
            'terminal': True, 'failed': False, 'request': None}}
        browser.worker_phases, browser.page_script_starts = {}, {}
        browser.bind_worker_network()
        browser.cdp_request(1, {'type': 'Script', 'requestId': 'page-script',
                                'request': {'method': 'GET', 'url': key[2]}})
        self.assertTrue(browser.worker_groups[key]['uncertain'])
        self.assertFalse(browser.group_closed(request))
