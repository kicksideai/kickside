"""Discord gateway payload for the declared inbound receive seam."""
import json
from urllib.request import Request, urlopen

from harness import require
from .origins import STAMP


class DiscordGatewayFixture:
    def __init__(self, origin):
        self.origin, self.token, self.bot_id = origin, 'fictional-discord-token', 'NW'

    def request(self, path, body=None):
        request = Request(self.origin + '/_fixture/' + path,
            data=json.dumps(body).encode() if body is not None else None,
            headers={'Content-Type': 'application/json', 'Authorization': 'Bot ' + self.token})
        with urlopen(request, timeout=5) as response:
            return json.load(response)

    def new_identity(self):
        identity = self.request('identities', {})
        self.token, self.bot_id = identity['token'], identity['bot_id']

    def send(self, event):
        require(self.request('message', event)['delivered'] == 1,
                'Inbound fixture has no unique ready Discord gateway')


class DiscordIngress:
    @staticmethod
    def direct_message(message_id, text, sender):
        return {'id': message_id, 'content': text, 'channel_id': 'NW', 'timestamp': STAMP,
                'author': {'id': sender, 'username': 'qa', 'bot': False}, 'attachments': []}

    @staticmethod
    def mention(message_id, text, bot_id='NW'):
        return {'id': message_id, 'content': '<@' + bot_id + '> ' + text,
                'channel_id': 'NW', 'guild_id': 'NW', 'timestamp': STAMP,
                'author': {'id': 'QA', 'username': 'qa', 'bot': False},
                'mentions': [{'id': bot_id, 'username': 'Northwind Bot', 'bot': True}],
                'attachments': []}
