import json
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from websockets.sync.client import connect
from websockets.exceptions import ConnectionClosedError
from mocks import Fixtures


class SlackSocketFixtureTests(unittest.TestCase):
    def setUp(self):
        self.fixtures = Fixtures()
        self.base = self.fixtures.start('slack-socket')

    def tearDown(self):
        self.fixtures.stop()

    def request(self, path, body=None, token='fictional-slack-app'):
        with urlopen(Request(self.base + path, data=json.dumps(body).encode() if body is not None else None,
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}), timeout=5) as response:
            return json.load(response)

    def test_app_token_opens_one_authenticated_socket_and_bot_token_does_not(self):
        denied = self.request('/api/apps.connections.open', {}, token='fictional-slack-token')
        self.assertFalse(denied['ok'])
        self.assertNotIn('url', denied)
        opened = self.request('/api/apps.connections.open', {})
        self.assertTrue(opened['ok'])
        with connect(opened['url'], open_timeout=5) as ws:
            self.assertEqual(json.loads(ws.recv(timeout=5))['type'], 'hello')
            self.assertEqual(self.request('/_fixture/socket')['connections'], 1)
            self.assertNotIn('fictional-slack-app', json.dumps(self.request('/_fixture/socket')))

    def test_socket_url_is_single_use(self):
        url = self.request('/api/apps.connections.open', {})['url']
        with connect(url, open_timeout=5) as first:
            self.assertEqual(json.loads(first.recv(timeout=5))['type'], 'hello')
            with connect(url, open_timeout=5) as replay:
                with self.assertRaises(ConnectionClosedError): replay.recv(timeout=5)
            self.assertEqual(self.request('/_fixture/socket')['connections'], 1)

    def test_events_api_delivers_exact_payload_and_records_real_ack(self):
        url = self.request('/api/apps.connections.open', {})['url']
        with connect(url, open_timeout=5) as ws:
            self.assertEqual(json.loads(ws.recv(timeout=5))['type'], 'hello')
            event = {'type': 'app_mention', 'user': 'NW-human', 'channel': 'NW', 'ts': '733.000001', 'text': '<@NW> Respond'}
            delivered = self.request('/_fixture/event', {'event': event})
            self.assertEqual(delivered['delivered'], 1)
            frame = json.loads(ws.recv(timeout=5))
            self.assertEqual(frame['type'], 'events_api')
            self.assertEqual(frame['payload']['event'], event)
            self.assertEqual(self.request('/_fixture/socket')['acks'], [])
            ws.send(json.dumps({'envelope_id': frame['envelope_id']}))
            audit = self.request('/_fixture/socket?wait_ack=' + frame['envelope_id'])
            self.assertEqual(audit['acks'], [frame['envelope_id']])

    def test_unauthenticated_ingress_cannot_deliver_a_fixture_event(self):
        with self.assertRaises(HTTPError) as denied:
            self.request('/_fixture/event', {'event': {'text': 'forged'}}, token='wrong')
        self.assertEqual(denied.exception.code, 401)
