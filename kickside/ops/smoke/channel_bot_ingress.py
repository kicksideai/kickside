"""Provider wire clients for the common responder identity qualification."""
import json
import uuid
from urllib.request import Request, urlopen

from harness import require
from mocks.jira_regressions import DiscordGatewayFixture, DiscordIngress


class DiscordChannel:
    provider = 'discord'
    title = 'Discord'
    service = 'discord'
    impl = 'kickside.discord.connection:discord_connection'

    def __init__(self, ctx):
        self.ctx = ctx
        self.origin = ctx.fixtures.start(self.service)
        self.client = DiscordGatewayFixture(self.origin)
        self.client.new_identity()
        ctx.inst.redactor.add(self.client.token)
        self.endpoints = {'kickside.discord:endpoint_api': self.origin + '/api/v10',
                          'kickside.discord:endpoint_gateway': self.client.request('gateway')['url']}
        self.private_context = {'bot_token': self.client.token}

    def ready(self):
        return self.client.request('gateway')['connections'] == 1

    def authentication(self):
        proof = self.client.request('gateway')
        identifies = proof['identifies']
        require(identifies and identifies[-1]['bot_id'] == self.client.bot_id and identifies[-1]['intents'] == 37377,
                'Discord fixture bypasses authenticated gateway identity or subscribed message intents')
        return proof

    def event(self, text):
        event = DiscordIngress.mention(str(uuid.uuid4().int), text, self.client.bot_id)
        return event, event['id']

    def send(self, event):
        self.client.send(event)

    def acknowledgement(self):
        return self.client.request('gateway')

    def posts(self):
        return [row for row in self.ctx.fixtures.requests(self.service) if row['method'] == 'POST'
                and row['path'] == '/api/v10/channels/NW/messages']

    def assert_reply(self, row):
        require(row['status'] == 200 and row['body'].get('content', '').strip(),
                'Discord has no successful nonempty admitted reply')

    def reply_reference(self, row):
        reference = row['response']['id']
        require(reference, 'Discord reply has no provider message reference')
        return str(reference)


class SlackChannel:
    provider = 'slack'
    title = 'Slack'
    service = 'slack-socket'
    impl = 'kickside.slack.connection:slack_connection'

    def __init__(self, ctx):
        self.ctx = ctx
        self.origin = ctx.fixtures.start(self.service)
        self.app_token = 'fictional-slack-app'
        self.bot_token = 'fictional-slack-token'
        ctx.inst.redactor.add(self.app_token)
        ctx.inst.redactor.add(self.bot_token)
        self.endpoints = {'kickside.slack:endpoint_api': self.origin + '/api',
                          'kickside.slack:endpoint_socket': self.origin + '/api/apps.connections.open'}
        self.private_context = {'bot_token': self.bot_token, 'app_token': self.app_token}
        self.deliveries = []

    def request(self, path, body=None):
        with urlopen(Request(self.origin + path, data=json.dumps(body).encode() if body is not None else None,
            headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + self.app_token}), timeout=5) as response:
            return json.load(response)

    def ready(self):
        return self.request('/_fixture/socket')['connections'] == 1

    def authentication(self):
        opens = [row for row in self.ctx.fixtures.requests(self.service)
                 if row['method'] == 'POST' and row['path'] == '/api/apps.connections.open']
        require(opens and opens[-1]['response'].get('ok') and self.ready(),
                'Slack fixture bypasses app-authenticated Socket Mode opening')
        return {'opens': opens, 'socket': self.request('/_fixture/socket')}

    def event(self, text):
        external_id = str(uuid.uuid4().int) + '.000001'
        return {'type': 'message', 'user': 'NW-human', 'channel': 'NW', 'channel_type': 'channel',
                'ts': external_id, 'text': '<@NW> ' + text}, external_id

    def send(self, event):
        delivery = self.request('/_fixture/event', {'event': event})
        require(delivery['delivered'] == 1, 'Slack has no unique authenticated socket subscription')
        self.deliveries.append(delivery['envelope_id'])

    def acknowledgement(self):
        audit = self.request('/_fixture/socket?wait_ack=' + self.deliveries[-1])
        require(all(envelope in audit['acks'] for envelope in self.deliveries),
                'Slack worker does not acknowledge the real Events API deliveries')
        return audit

    def posts(self):
        return [row for row in self.ctx.fixtures.requests(self.service)
                if row['method'] == 'POST' and row['path'] == '/api/chat.postMessage']

    def assert_reply(self, row):
        require(row['status'] == 200 and row['response'].get('ok') and row['body'].get('text', '').strip()
                and row['body'].get('channel') == 'NW', 'Slack reply misses its admitted conversation')

    def reply_reference(self, row):
        reference = row['response']['ts']
        require(reference, 'Slack reply has no provider message reference')
        return str(reference)
