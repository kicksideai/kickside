"""Headless browser evidence and strict console/network checks."""
from contextlib import contextmanager
import json
import re
from urllib.parse import quote, urlparse
import time

from harness import Failure, require


ASSISTANT_TEXT = """el => {
    const parts=[];
    function walk(node) {
        if(node.shadowRoot) walk(node.shadowRoot);
        for(const child of node.childNodes) {
            if(child.nodeType===3 && child.textContent.trim()) parts.push(child.textContent.trim());
            else if(child.nodeType===1 && !['SCRIPT','STYLE'].includes(child.tagName)) walk(child);
        }
    }
    function find(root) {
        for(const body of root.querySelectorAll('.chat-message:not(.chat-message--user) .chat-message__body')) walk(body);
        for(const node of root.querySelectorAll('*')) if(node.shadowRoot) find(node.shadowRoot);
    }
    find(el.shadowRoot || el);
    return parts.join('\\n');
}"""
CHAT_STATE = "el => ({text:(" + ASSISTANT_TEXT + ")(el),busy:!!el.shadowRoot.querySelector('.chat-input__stop-button'),enabled:!el.shadowRoot.querySelector('textarea').disabled})"


def assert_image_content(locator, image_bytes):
    import hashlib
    import io
    from PIL import Image
    with Image.open(io.BytesIO(image_bytes)) as image:
        expected = hashlib.sha256(image.convert('RGBA').tobytes()).hexdigest()
    actual = locator.evaluate("""async el => {
        const canvas = document.createElement('canvas');
        canvas.width = el.naturalWidth; canvas.height = el.naturalHeight;
        const context = canvas.getContext('2d'); context.drawImage(el, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const digest = await crypto.subtle.digest('SHA-256', pixels);
        return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
    }""")
    require(actual == expected, 'Visible image pixels differ from the uploaded image')



# Web Host 1.0.63 races the default Iconify mirrors and cancels the losing
# requests; the cancellation is not a page failure (upstream report:
# scratchpad/fixes/facade-shims/WEB-HOST-ICON-ABORT.md).
ICONIFY_MIRRORS = frozenset({'api.iconify.design', 'api.simplesvg.com', 'api.unisvg.com'})

class BrowserSession:
    """A Playwright driver and Chromium process owned by one scenario thread."""
    def __init__(self):
        self.playwright = None
        self.browser = None

    def start(self):
        if self.playwright is None:
            from playwright.sync_api import sync_playwright
            self.playwright = sync_playwright().start()
            try:
                self.browser = self.playwright.chromium.launch(headless=True, args=['--no-sandbox'])
            except Exception:
                self.close()
                raise
        return self.browser

    def close(self):
        errors = []
        for name, method in (('browser', 'close'), ('playwright', 'stop')):
            resource = getattr(self, name)
            if resource is not None:
                try:
                    getattr(resource, method)()
                except Exception as error:
                    errors.append(str(error))
                finally:
                    setattr(self, name, None)
        require(not errors, 'Browser session cleanup: ' + '; '.join(errors))


class Browser:
    crashes = ()
    frame_refusals = ()

    def __init__(self, inst, session=None, **presentation):
        self.inst = inst
        self.errors, self.frames, self.uploads = [], [], []
        self.frame_sockets = []
        self.pending = {}
        self.expected_http = []
        self.navigation_urls = {}
        self.session = session or BrowserSession()
        self.owns_session = session is None
        self.browser = self.session.start()
        self.context = self.page = None
        try:
            self.reset_context(**presentation)
        except Exception:
            self.close()
            raise

    @staticmethod
    def release(ctx):
        browser = ctx.browser
        if browser is None:
            return
        try:
            browser.ensure_alive()
            browser.settle()
            browser.clean(0)
        finally:
            ctx.close_browser()

    @staticmethod
    @contextmanager
    def paused(inst, contexts, dispatch, *, hard=False):
        inst.preserve_dependencies()
        navigation = {}
        for context in contexts:
            if context.browser is not None:
                try:
                    navigation[context] = dispatch(context, lambda c: c.browser.navigation())
                except Exception:
                    dispatch(context, lambda c: c.close_browser())
                    raise
                dispatch(context, Browser.release)
        errors = inst.cleanup.run(scope='scenario')
        require(not errors, 'Runtime resource cleanup: ' + '; '.join(errors))
        inst.stop(hard=hard)
        try:
            yield
        finally:
            inst.start()
            for context, state in navigation.items():
                dispatch(context, lambda c, saved=state: c.browser_check().restore(saved))

    def navigation(self):
        self.ensure_alive()
        url = self.page.url
        if url == 'about:blank':
            url = self.navigation_urls.get(self.page, url)
        return {'url': url, 'storage_state': self.context.storage_state()}

    def restore(self, navigation):
        self.reset_context(storage_state=navigation['storage_state'])
        if navigation['url'] == 'about:blank':
            return
        if navigation['url'].endswith('/login'):
            self.page.goto(navigation['url'], wait_until='domcontentloaded', timeout=30000)
            self.page.get_by_role('button', name='Sign In', exact=True).wait_for(timeout=30000)
            self.settle()
            return
        self.page.goto(self.inst.base + '/', wait_until='domcontentloaded', timeout=30000)
        self.frame.locator('.sidebar').wait_for(timeout=30000)
        self.settle()
        self.goto_route(navigation['url'])
        self.settle()

    def reload(self):
        self.settle()
        self.page.reload(wait_until='domcontentloaded', timeout=30000)

    def goto_route(self, url):
        self.page.evaluate("url => { history.pushState({}, '', url); dispatchEvent(new PopStateEvent('popstate')); }",
                           url)

    @staticmethod
    def pick_channel(picker, connection, containers, channel):
        nodes = [('connection', connection)] + [('container', name) for name in containers] + [('channel', channel)]
        for kind, name in nodes:
            row = picker.get_by_role('button', name=name, exact=True).and_(picker.locator('.cp-' + kind))
            row.wait_for(timeout=30000)
            row.click()

    def current_session(self):
        from playwright.sync_api import expect
        chat = self.frame.locator('wippy-chat')
        expect(chat).to_have_attribute('session-id', re.compile('.+'), timeout=30000)
        session = chat.get_attribute('session-id')
        require(session, 'Chat does not expose its durable session ID')
        return session

    def open_chat(self, agent_id, session_id=None):
        if session_id:
            self.goto_route('/sessions/' + quote(session_id, safe=''))
            self.frame.locator('wippy-chat').get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)
            return
        detail = self.inst.request('GET', '/api/v1/user-agents/' + agent_id)['agent']
        from scenarios import nav
        from types import SimpleNamespace
        nav(SimpleNamespace(browser=self, inst=self.inst), 'Agents')
        panel = self.frame.locator('kickside-agents')
        panel.wait_for(timeout=30000)
        panel.locator('.kx-card').filter(has=self.frame.get_by_text(detail['title'], exact=True)).get_by_role(
            'button', name='Chat', exact=True).click()
        self.frame.locator('wippy-chat').get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)

    def open_page(self):
        page = self.context.new_page()
        self.watch(page)
        return page

    def reset_context(self, **presentation):
        if self.context is not None:
            self.settle()
            self.context.close()
        self.navigation_urls = {}
        self.context = self.browser.new_context(**{
            'viewport': {'width': 1440, 'height': 1000}, **presentation})
        self.watch_requests(self.context)
        self.page = self.open_page()

    @contextmanager
    def presentation(self, **options):
        previous_context, previous_page = self.context, self.page
        start = len(self.errors)
        context = self.browser.new_context(storage_state=previous_context.storage_state(), **options)
        self.watch_requests(context)
        self.context = context
        try:
            self.page = self.open_page()
            yield
        finally:
            try:
                self.settle()
                errors = self.errors[start:]
                self.inst.evidence.save('presentation-context-errors', errors)
                require(not errors, 'Presentation browser console/network errors: ' + str(errors))
            finally:
                context.close()
                self.navigation_urls.pop(self.page, None)
                self.context, self.page = previous_context, previous_page

    @property
    def frame(self):
        return self.page.frame_locator('iframe[name="wippy:page:app.views:main"]')

    def watch(self, page):
        page.on('crash', self.page_crashed)
        def navigated(frame):
            if frame == page.main_frame and frame.url != 'about:blank':
                self.navigation_urls[page] = frame.url
        page.on('framenavigated', navigated)
        page.on('console', lambda message: self.console_received(message, page))
        page.on('pageerror', lambda error: self.errors.append(self.inst.redactor.text(error)))
        def frame(raw):
            data = json.loads(raw)
            self.inst.redactor.collect(data)
            self.frames.append(data)
        def socket(ws):
            sender = object()
            def received(raw):
                self.frame_sockets.append(sender)
                frame(raw)
            ws.on('framereceived', received)
        page.on('websocket', socket)

    def watch_requests(self, context):
        context.on('request', lambda request: self.pending.update({request: self.inst.redactor.text(request.url)}))
        context.on('requestfinished', lambda request: self.pending.pop(request, None))
        context.on('requestfailed', self.request_failed)
        context.on('response', self.response_received)

    def delivered_once(self, start, match):
        """Frames after `start` accepted by `match`, one per websocket; every socket that receives it receives it exactly once."""
        by_socket = {}
        for frame, socket in zip(self.frames[start:], self.frame_sockets[start:]):
            if match(frame):
                by_socket.setdefault(socket, []).append(frame)
        require(by_socket and all(len(frames) == 1 for frames in by_socket.values()),
                'Frame is not delivered exactly once per websocket: ' + str([len(frames) for frames in by_socket.values()]))
        return [frames[0] for frames in by_socket.values()]

    def page_crashed(self, page):
        crash = {'url': self.inst.redactor.text(self.navigation_urls.get(page) or page.url),
                 'pending': sorted(self.pending.values())}
        self.crashes += (crash,)
        self.errors.append('Page crashed: ' + crash['url'])
        self.inst.evidence.save('browser-page-crash', {'crashes': list(self.crashes)})

    def ensure_alive(self):
        require(not self.crashes, 'Browser page crashed: ' + json.dumps(self.crashes))

    def response_received(self, response):
        matched = [item for item in self.expected_http if item['method'] == response.request.method
                   and item['url'] == response.url and item['status'] == response.status
                   and ('fulfilled' not in item or item['fulfilled'] > item['observed'])]
        if matched:
            matched[0]['observed'] += 1
            self.inst.evidence.save('expected-http-rejection', {k: v for k, v in matched[0].items()})
        elif response.status >= 400:
            self.errors.append(self.inst.redactor.text(f'HTTP {response.status}: {response.url}'))
            if response.url.startswith(self.inst.base + '/api/'):
                receipt = {'method': response.request.method,
                           'url': self.inst.redactor.text(response.url), 'status': response.status}
                try:
                    receipt['body'] = self.inst.redactor.value(response.json())
                except Exception as error:
                    receipt['body_error'] = self.inst.redactor.text(str(error))
                self.inst.evidence.save('unexpected-http-response-' + str(len(self.errors)), receipt)
        if '/api/v1/uploads' in response.url and response.request.method == 'POST' and response.status == 200:
            self.uploads.append(response.json())

    def console_received(self, message, page=None):
        if message.type != 'error':
            return
        for item in self.frame_refusals:
            if ((message.location.get('url') == item['url'] or (page is not None and page is item.get('page'))) and
                (("frame-ancestors 'none'" in message.text and 'blocked' in message.text) or
                 ('X-Frame-Options' in message.text and 'deny' in message.text))):
                item['console'].append(message.text)
                return
        matched = [item for item in self.expected_http if item['observed'] == 1
                   and item['url'] == message.location.get('url')
                   and re.fullmatch(r'Failed to load resource: the server responded with a status of '
                                    + str(item['status']) + r' \([^)]+\)', message.text)]
        if matched:
            self.inst.evidence.save('expected-rejection-console', {'text': message.text, 'url': message.location['url']})
        else:
            self.errors.append(self.inst.redactor.text(message.text))

    @contextmanager
    def rejection(self, method, path, status):
        require(400 <= status <= 499, 'A deliberate UI rejection must name its client-error status')
        item = {'method': method, 'url': self.inst.base + path, 'status': status, 'observed': 0}
        with self._expected_response(item) as response:
            yield response

    @contextmanager
    def server_failure(self, method, path, status):
        require(500 <= status <= 599, 'A deliberate server failure must name its server-error status')
        item = {'method': method, 'url': self.inst.base + path, 'status': status, 'observed': 0}
        with self._expected_response(item) as response:
            yield response

    @contextmanager
    def successful_response(self, method, path, label, timeout=300000):
        """Capture one API response and require a successful status."""
        url = self.inst.base + path
        with self.page.expect_response(lambda response: response.request.method == method and response.url == url,
                                       timeout=timeout) as response:
            yield response
        observed = response.value
        receipt = {'method': method, 'url': self.inst.redactor.text(observed.url), 'status': observed.status,
                   'body': self.inst.redactor.value(observed.json())}
        self.inst.evidence.save(label, receipt)
        self.settle()
        require(200 <= observed.status <= 299,
                method + ' ' + receipt['url'] + ' returns HTTP ' + str(observed.status) + ': ' +
                json.dumps(receipt['body'], default=str))

    @contextmanager
    def _expected_response(self, item):
        self.expected_http.append(item)
        try:
            with self.page.expect_response(lambda r: r.request.method == item['method'] and r.url == item['url']) as response:
                yield response
            self.settle()
            require(response.value.status == item['status'] and item['observed'] == 1,
                    'UI rejection does not return exactly one expected response: ' + str(item))
        finally:
            self.expected_http.remove(item)

    @contextmanager
    def failure_response(self, method, path, status, payload):
        require(400 <= status <= 599, 'A controlled failure response must name its error status')
        item = {'method': method, 'url': self.inst.base + path, 'status': status,
                'observed': 0, 'fulfilled': 0}
        body = json.dumps(payload)
        def fulfill(route):
            if route.request.method != method:
                route.continue_()
                return
            item['fulfilled'] += 1
            route.fulfill(status=status, content_type='application/json', body=body)
        self.page.route(item['url'], fulfill)
        try:
            with self._expected_response(item) as response:
                yield response
            require(item['fulfilled'] == 1, 'Controlled failure response is not fulfilled exactly once')
        finally:
            self.page.unroute(item['url'], fulfill)

    def request_failed(self, request):
        self.pending.pop(request, None)
        if request.failure == 'net::ERR_ABORTED' and urlparse(request.url).hostname in ICONIFY_MIRRORS:
            return
        for item in self.frame_refusals:
            if request.method == 'GET' and request.url == item['url'] and request.failure == 'net::ERR_BLOCKED_BY_RESPONSE':
                item['requests'].append({'url': request.url, 'error': request.failure})
                return
        self.errors.append(self.inst.redactor.text(f'{request.method} {request.url}: {request.failure}'))

    @contextmanager
    def embedding_refusal(self, path):
        previous = self.page
        page = self.open_page()
        item = {'url': self.inst.base + path, 'console': [], 'requests': [], 'page': page}
        self.frame_refusals += (item,)
        start = len(self.errors)
        self.page = page
        try:
            yield page
            self.settle()
            require(item['console'], 'Browser does not report the expected frame refusal')
            self.clean(start)
        finally:
            try:
                self.inst.evidence.save('browser-frame-refusal', {k: v for k, v in item.items() if k != 'page'})
            finally:
                self.frame_refusals = tuple(row for row in self.frame_refusals if row is not item)
                try:
                    page.close()
                finally:
                    self.navigation_urls.pop(page, None)
                    self.page = previous

    def settle(self):
        deadline = time.monotonic() + 30
        quiet_since = None
        while time.monotonic() < deadline:
            self.ensure_alive()
            self.page.wait_for_timeout(100)
            if self.pending:
                quiet_since = None
            elif quiet_since is None:
                quiet_since = time.monotonic()
            elif time.monotonic() - quiet_since >= 0.5:
                return
        require(False, 'Browser requests do not settle within 30 seconds: ' + str(list(self.pending.values())))

    def clean(self, start):
        errors = self.errors[start:]
        require(not errors, 'browser console/network errors: ' + json.dumps(errors))

    def login(self, email=None, password=None):
        self.settle()
        self.page.goto(self.inst.base + '/login', wait_until='domcontentloaded', timeout=30000)
        self.page.evaluate('document.fonts.ready')
        self.page.get_by_label('Email').fill(email or self.inst.email)
        self.page.get_by_label('Password').fill(password or self.inst.password)
        with self.page.expect_response(lambda r: '/api/public/user/token' in r.url and r.request.method == 'POST') as response:
            self.page.get_by_role('button', name='Sign In', exact=True).click()
        if response.value.status != 200:
            raise Failure('Browser login fails: HTTP ' + str(response.value.status) + ': ' + self.inst.redactor.text(response.value.text()))
        self.page.wait_for_url(self.inst.base + '/', timeout=30000)

    def screenshot(self, label, *, full_page=True, mask_color='#FF00FF'):
        self.settle()
        masks = []
        secrets = sorted(self.inst.redactor.secrets, key=len, reverse=True)
        sensitive = re.compile(r'password|token|secret|api.?key|client|base.?url|endpoint|issuer', re.I)
        for frame in self.page.frames:
            masks.append(frame.locator('input, textarea').filter(visible=True))
            masks.append(frame.get_by_label(sensitive).filter(visible=True))
            masks.append(frame.get_by_text(re.compile(r'https?://|localhost|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b(?:[\w-]+\.)+(?:com|net|org|ai|test|example|internal|local)\b|/home/|^/[A-Za-z]')).filter(visible=True))
            masks.append(frame.get_by_text(self.inst.email, exact=True).filter(visible=True))
            masks.append(frame.locator('kickside-webhooks .kx-card-desc, .kx-connect-url, .kx-card-desc code, .kx-token').filter(visible=True))
            for field in frame.locator('input, textarea').all():
                if not field.is_visible():
                    continue
                snapshots = field.evaluate_all("""elements => elements.map(el => ({
                    value: el.value,
                    identity: ['id', 'name', 'aria-label', 'placeholder', 'type']
                        .map(key => el.getAttribute(key) || '').join(' ') + ' ' +
                        (el.previousElementSibling?.textContent || el.closest('label')?.textContent || '')
                }))""")
                for snapshot in snapshots:
                    value, identity = snapshot['value'], snapshot['identity']
                    if value and (sensitive.search(identity) or value in self.inst.redactor.secrets or re.search(r'https?://|127\.0\.0\.1', value)):
                        masks.append(field)
            if secrets:
                masks.append(frame.get_by_text(re.compile('|'.join(re.escape(s) for s in secrets))).filter(visible=True))
        path = self.inst.root / self.inst.evidence.label / (label + '.png')
        path.parent.mkdir(parents=True, exist_ok=True)
        self.page.screenshot(path=str(path), full_page=full_page, mask=masks, mask_color=mask_color)
        self.inst.evidence.paths.append(str(path))
        return str(path)

    def stream(self, prompt, marker, label):
        from harness import Failure
        chat = self.frame.locator('wippy-chat')
        before = len(self.frames)
        box = chat.get_by_placeholder('Type a message', exact=True)
        box.fill(prompt)
        box.press('Enter')
        chat.get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)
        samples = []
        deadline = time.monotonic() + 180
        while time.monotonic() < deadline:
            self.page.wait_for_timeout(16)
            state = chat.evaluate(CHAT_STATE)
            if not samples or samples[-1]['text'] != state['text']:
                samples.append({'at': round(time.monotonic(), 3), **state})
            updates = len({s['text'] for s in samples if s['text']})
            if state['enabled'] and not state['busy'] and marker in state['text'] and updates >= 3:
                break
        else:
            self.inst.evidence.save(label + '-samples', samples)
            self.inst.evidence.save(label + '-websocket', self.frames[before:])
            raise Failure(f'{label}: stream lacks three incremental assistant updates or completion within 180 seconds; observed {updates} updates')
        frames = self.frames[before:]
        self.inst.evidence.save(label + '-samples', samples)
        self.inst.evidence.save(label + '-websocket', frames)
        require(any((f.get('data') or {}).get('type') in ('chunk', 'content') for f in frames if isinstance(f.get('data'), dict)),
                label + ': no websocket chunk/content events')
        require(not chat.locator('[role=alert]').all_text_contents(), label + ': chat reports an error')
        return {'updates': updates, 'marker': marker}

    def open_session(self, session_id):
        self.frame.locator('.sidebar').get_by_text('Sessions', exact=True).click()
        sessions = self.inst.request('GET', '/api/v1/sessions?limit=100')['sessions']
        session = next(item for item in sessions if item['session_id'] == session_id)
        self.frame.locator('kickside-sessions').first.locator('.kx-row-main').filter(
            has=self.frame.locator('.kx-name').get_by_text(session['title'].strip() or 'Untitled chat', exact=True)).click()
        self.frame.locator('wippy-chat').get_by_placeholder('Type a message', exact=True).wait_for(timeout=30000)

    def tool_error(self, prompt, diagnostic, label):
        from jira_contracts import assert_tool_turn
        chat = self.frame.locator('wippy-chat')
        before = len(self.frames)
        box = chat.get_by_placeholder('Type a message', exact=True)
        box.fill(prompt)
        box.press('Enter')

        def invocation_ids():
            return {f['data']['id'] for f in self.frames[before:]
                    if f.get('data', {}).get('type') == 'tool_call'}

        def ended():
            require(chat.locator('.chat-tool-group__badge').count() <= 4, 'Tool-error turn exceeds four calls')
            require(len(invocation_ids()) <= 4, 'Tool-error turn exceeds four distinct invocation IDs')
            state = chat.evaluate(CHAT_STATE)
            return state if state['enabled'] and not state['busy'] and state['text'].strip() and chat.locator('.chat-tool-group__badge--error').count() else None

        self.inst.wait(ended, 'Tool error is visible and the turn ends', seconds=180, pump=self.page.wait_for_timeout)
        self.inst.evidence.save(label + '-frames', self.frames[before:])
        calls = chat.locator('.chat-tool-group__badge').count()
        require(1 <= calls <= 4, 'Tool error has unbounded calls or never exercises the tool: ' + str(calls))
        require(1 <= len(invocation_ids()) <= 4, 'Tool error has no bounded observable invocations')
        assert_tool_turn(chat.evaluate(CHAT_STATE), invocation_ids(), calls, chat.locator('.chat-tool-group__badge--error').count())
        chat.locator('.chat-tool-group__badge--error').last.click()
        self.inst.wait(lambda: diagnostic in chat.evaluate('el => el.shadowRoot.textContent'),
            'Tool error details expose the actual diagnostic: ' + diagnostic,
            seconds=30, pump=self.page.wait_for_timeout)
        self.screenshot(label + '-visible')
        return chat

    def close(self):
        errors = []
        if self.context is not None:
            try:
                self.context.close()
            except Exception as error:
                errors.append(str(error))
            finally:
                self.context = self.page = None
        if self.owns_session:
            try:
                self.session.close()
            except Exception as error:
                errors.append(str(error))
        self.navigation_urls = {}
        require(not errors, 'Browser cleanup: ' + '; '.join(errors))
