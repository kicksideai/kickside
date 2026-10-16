import json
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from websockets.sync.client import connect
from mocks import Fixtures
from mocks.jira_regressions import DiscordGatewayFixture as GatewayClient, DiscordIngress


class DiscordGatewayFixture(unittest.TestCase):
    def test_shared_ingress_delivers_a_dm_through_its_fresh_bot_identity(self):
        gateway = GatewayClient(self.base)
        gateway.new_identity()
        url = gateway.request('gateway')['url']
        with connect(url, open_timeout=5) as ws:
            self.assertEqual(json.loads(ws.recv(timeout=5))['op'], 10)
            ws.send(json.dumps({'op': 2, 'd': {'token': gateway.token, 'intents': 37377}}))
            self.assertEqual(json.loads(ws.recv(timeout=5))['d']['user']['id'], gateway.bot_id)
            event = DiscordIngress.direct_message('private-message', 'Northwind question', 'linked-user')
            gateway.send(event)
            delivered = json.loads(ws.recv(timeout=5))['d']
            self.assertNotIn('guild_id', delivered)
            self.assertEqual(delivered['author']['id'], 'linked-user')
            self.assertEqual(delivered, event)

    def setUp(self):
        self.fixtures = Fixtures()
        self.base = self.fixtures.start('discord')

    def tearDown(self):
        self.fixtures.stop()

    def request(self, path, body=None):
        with urlopen(Request(self.base + path, data=json.dumps(body).encode() if body is not None else None,
                             headers={'Content-Type': 'application/json', 'Authorization': 'Bot fictional-discord-token'}),
                     timeout=5) as response:
            return json.load(response)

    def test_gateway_identify_heartbeat_and_message_dispatch(self):
        url = self.request('/_fixture/gateway')['url']
        with connect(url, open_timeout=5) as ws:
            self.assertEqual(json.loads(ws.recv(timeout=5))['op'], 10)
            ws.send(json.dumps({'op': 2, 'd': {'token': 'fictional-discord-token', 'intents': 37377}}))
            self.assertEqual(json.loads(ws.recv(timeout=5))['t'], 'READY')
            ws.send(json.dumps({'op': 1, 'd': 1}))
            self.assertEqual(json.loads(ws.recv(timeout=5))['op'], 11)
            event = {'id': '733', 'guild_id': 'NW', 'channel_id': 'NW',
                     'author': {'id': 'NW-human'}, 'content': '<@NW-bot> Northwind question'}
            self.assertEqual(self.request('/_fixture/message', event)['delivered'], 1)
            frame = json.loads(ws.recv(timeout=5))
            self.assertEqual(frame['t'], 'MESSAGE_CREATE')
            self.assertEqual(frame['d'], event)
            audit = self.request('/_fixture/gateway')
            self.assertEqual(audit['identifies'][0]['intents'], 37377)
            self.assertNotIn('fictional-discord-token', json.dumps(audit))

    def test_preconditions_and_permission_failures_are_visible(self):
        self.assertEqual(self.request('/api/v10/oauth2/applications/@me')['flags'], 524288)
        self.request('/_fixture/config', {'flags': 0, 'read_status': 403, 'write_status': 403})
        self.assertEqual(self.request('/api/v10/oauth2/applications/@me')['flags'], 0)
        for path, body in [('/api/v10/channels/NW/messages', None),
                           ('/api/v10/channels/NW/messages', {'content': 'Northwind reply'})]:
            with self.assertRaises(HTTPError) as denied:
                self.request(path, body)
            self.assertEqual(denied.exception.code, 403)
            self.assertEqual(json.load(denied.exception)['message'], 'Missing Permissions')

    def test_distinct_bot_identity_routes_only_to_its_ready_subscription(self):
        created = self.request('/_fixture/identities', {})
        token, bot = created['token'], created['bot_id']
        def own(path, body=None):
            with urlopen(Request(self.base + path, data=json.dumps(body).encode() if body is not None else None,
                         headers={'Content-Type': 'application/json', 'Authorization': 'Bot ' + token}), timeout=5) as response:
                return json.load(response)
        url = self.request('/_fixture/gateway')['url']
        with connect(url, open_timeout=5) as old, connect(url, open_timeout=5) as current:
            for ws, credential in ((old, 'fictional-discord-token'), (current, token)):
                self.assertEqual(json.loads(ws.recv(timeout=5))['op'], 10)
                ws.send(json.dumps({'op': 2, 'd': {'token': credential, 'intents': 37377}}))
                self.assertEqual(json.loads(ws.recv(timeout=5))['t'], 'READY')
            audit = own('/_fixture/gateway')
            self.assertEqual(audit['connections'], 1)
            self.assertEqual(audit['identifies'][-1]['bot_id'], bot)
            self.assertEqual(own('/api/v10/users/@me')['id'], bot)
            event = {'id': 'identity-message', 'channel_id': 'NW', 'content': 'Own message'}
            self.assertEqual(own('/_fixture/message', event)['delivered'], 1)
            self.assertEqual(json.loads(current.recv(timeout=5))['d'], event)
            old.send(json.dumps({'op': 1, 'd': 1}))
            self.assertEqual(json.loads(old.recv(timeout=5))['op'], 11)

    def test_identity_permission_configuration_does_not_change_other_connections(self):
        created = self.request('/_fixture/identities', {})
        token = created['token']
        def own(path, body=None):
            with urlopen(Request(self.base + path, data=json.dumps(body).encode() if body is not None else None,
                         headers={'Content-Type': 'application/json', 'Authorization': 'Bot ' + token}), timeout=5) as response:
                return json.load(response)
        own('/_fixture/config', {'flags': 0, 'read_status': 403, 'write_status': 403})
        self.assertEqual(own('/api/v10/oauth2/applications/@me')['flags'], 0)
        self.assertEqual(self.request('/api/v10/oauth2/applications/@me')['flags'], 524288)
        self.assertTrue(self.request('/api/v10/channels/NW/messages'))
        with self.assertRaises(HTTPError) as failure:
            own('/api/v10/channels/NW/messages')
        self.assertEqual(failure.exception.code, 403)
