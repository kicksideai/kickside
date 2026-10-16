import json
import threading
import time
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, Mock

from browser import Browser
from harness import Evidence, Redactor
from tests.test_browser_crash import Pages, instance


class FrameReleaseTests(unittest.TestCase):
    def test_frames_during_release_and_close_do_not_wait_for_redaction(self):
        for operation in ('release', 'close'):
            with self.subTest(operation=operation):
                pages = Pages()
                inst = instance()
                blocked = threading.Event()
                inst.redactor.value.side_effect = lambda value: blocked.wait(2)
                browser = Browser(inst, session=pages.session)
                handlers = {}
                socket = Mock()
                socket.on.side_effect = lambda event, callback: handlers.update({event: callback})
                pages.pages[0].handlers['websocket'](socket)
                frame = json.dumps({'topic': 'updates', 'data': {'type': 'chunk'}})
                browser.context.close.side_effect = lambda: handlers['framereceived'](frame)
                browser.settle = lambda: handlers['framereceived'](frame)
                context = SimpleNamespace(browser=browser, close_browser=browser.close)
                action = (lambda: Browser.release(context)) if operation == 'release' else browser.close
                failures = []
                def run():
                    try:
                        action()
                    except Exception as error:
                        failures.append(error)
                child = threading.Thread(target=run)
                started = time.monotonic()
                child.start()
                child.join(1)
                completed = not child.is_alive()
                blocked.set()
                child.join(3)
                self.assertTrue(completed, 'Frame redaction blocks browser ' + operation)
                self.assertLess(time.monotonic() - started, 1)
                self.assertEqual(failures, [])
                inst.redactor.value.assert_not_called()
                self.assertIsNone(browser.context)
                self.assertEqual(len(browser.frames), 2 if operation == 'release' else 1)
                self.assertEqual(len(browser.frames), len(browser.frame_sockets))

    def test_frame_data_and_socket_identity_survive_until_evidence_redaction(self):
        pages = Pages()
        inst = instance()
        inst.redactor = Redactor()
        browser = Browser(inst, session=pages.session)
        sockets = []
        for _ in range(2):
            handlers = {}
            socket = Mock()
            socket.on.side_effect = lambda event, callback, handlers=handlers: handlers.update({event: callback})
            pages.pages[0].handlers['websocket'](socket)
            sockets.append(handlers)
        data = {'topic': 'updates', 'data': {'type': 'chunk', 'secret': 'frame-credential',
                                         'message': 'frame-credential'}}
        for handlers in sockets:
            handlers['framereceived'](json.dumps(data))
        self.assertEqual(browser.delivered_once(0, lambda frame: frame['topic'] == 'updates'), [data, data])
        self.assertNotEqual(browser.frame_sockets[0], browser.frame_sockets[1])
        self.assertEqual(inst.redactor.text('frame-credential'), '[redacted]')
        evidence = Evidence(MagicMock(), inst.redactor)
        path = evidence.save('frames', browser.frames)
        rendered = json.loads(path.write_text.call_args.args[0])
        self.assertNotIn('frame-credential', json.dumps(rendered))
        self.assertEqual(rendered[0]['data']['message'], '[redacted]')


class RedactionGrowthTests(unittest.TestCase):
    def test_replacements_do_not_redact_their_own_output(self):
        redactor = Redactor(('r', 'e', 'd', 'a', 'c', 't', 'red'))
        self.assertEqual(redactor.text('red cat'), '[redacted] [redacted][redacted][redacted]')
