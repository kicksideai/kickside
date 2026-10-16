import unittest

from mocks.jira_regressions import DiscordIngress
from mocks.origins import Google
from mocks.jira_network import jira_endpoints


class JiraFixtures(unittest.TestCase):
    def test_network_fixture_routes_only_declared_provider_hosts(self):
        endpoints = jira_endpoints({'fireflies': 'http://127.0.0.1:1001',
            'discord': 'http://127.0.0.1:1002', 'google': 'http://127.0.0.1:1003'})
        self.assertEqual(endpoints['kickside.fireflies:endpoint_api'], 'http://127.0.0.1:1001/graphql')
        self.assertEqual(endpoints['kickside.discord:endpoint_api'], 'http://127.0.0.1:1002/api/v10')
        self.assertTrue(all(value.startswith('http://127.0.0.1:') for value in endpoints.values()))
        self.assertTrue(all(key.startswith(('kickside.fireflies:', 'kickside.discord:', 'kickside.google:')) for key in endpoints))

    def test_google_refresh_rotates_access_and_preserves_refresh_token(self):
        service = Google('http://127.0.0.1:1')
        service.initial_expires_in = 3
        service.codes['code'] = {'client_id': 'northwind-client'}
        status, _, issued = service.dispatch('POST', '/token', {}, {
            'code': 'code', 'client_secret': 'fictional-oidc-secret'}, {})
        self.assertEqual(status, 200)
        self.assertEqual(issued['expires_in'], 3)
        service.api_rejections = 1
        self.assertEqual(service.dispatch('GET', '/gmail/v1/users/me/messages', {}, {},
            {'Authorization': 'Bearer fictional-google-access'})[0], 401)
        status, _, refreshed = service.dispatch('POST', '/token', {}, {
            'grant_type': 'refresh_token', 'refresh_token': issued['refresh_token'],
            'client_id': 'northwind-client', 'client_secret': 'fictional-oidc-secret'}, {})
        self.assertEqual(status, 200)
        self.assertNotEqual(refreshed['access_token'], issued['access_token'])
        self.assertNotIn('refresh_token', refreshed)
        self.assertEqual(service.dispatch('GET', '/gmail/v1/users/me/messages', {}, {},
            {'Authorization': 'Bearer ' + refreshed['access_token']})[0], 200)

    def test_google_rejects_wrong_refresh_token(self):
        service = Google('http://127.0.0.1:1')
        self.assertEqual(service.dispatch('POST', '/token', {}, {
            'grant_type': 'refresh_token', 'refresh_token': 'wrong',
            'client_id': 'northwind-client', 'client_secret': 'fictional-oidc-secret'}, {})[0], 400)

    def test_discord_mention_is_a_guild_message_from_a_user(self):
        event = DiscordIngress.mention('731', 'Reply with EE2-2439-READY')
        self.assertEqual(event['mentions'][0]['id'], 'NW')
        self.assertFalse(event['author']['bot'])
        self.assertEqual(event['channel_id'], 'NW')
        self.assertEqual(event['guild_id'], 'NW')
        self.assertIn('<@NW>', event['content'])
