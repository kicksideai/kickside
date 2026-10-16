import base64
import json
import socket
import unittest
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import mocks


class MockTests(unittest.TestCase):
    def setUp(self):
        self.fixtures = mocks.Fixtures()

    def tearDown(self):
        self.fixtures.stop()

    def call(self, base, path, method='GET', body=None, headers=None):
        data = None if body is None else json.dumps(body).encode()
        request = Request(base + path, data=data, method=method, headers=headers or {})
        try:
            response = urlopen(request, timeout=5)
        except HTTPError as error:
            response = error
        with response:
            raw = response.read()
            return response.status, dict(response.headers), json.loads(raw) if raw else None

    def jira_headers(self):
        return {'Authorization': 'Basic ' + base64.b64encode(b'northwind@example.invalid:fictional-jira-token').decode(),
                'Accept': 'application/json', 'Content-Type': 'application/json'}

    def jira(self, path, method='GET', body=None):
        return self.call(self.base, '/rest/api/3' + path, method, body, self.jira_headers())

    def test_lifecycle_and_configurable_port(self):
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        base = self.fixtures.start('jira', port=port)
        self.assertEqual(int(base.rsplit(':', 1)[1]), port)
        with self.assertRaises(ValueError):
            self.fixtures.start('jira')
        self.fixtures.stop('jira')
        with self.assertRaises(URLError):
            self.call(base, '/rest/api/3/myself')
        self.fixtures.stop('jira')
        with self.assertRaises(ValueError):
            self.fixtures.start('unknown')

    def test_auth_and_recording_are_isolated_and_redacted(self):
        self.base = self.fixtures.start('jira')
        self.assertEqual(self.jira('/myself')[2]['displayName'], 'Northwind Operator')
        status, _, _ = self.call(self.base, '/rest/api/3/myself', headers={'Authorization': 'Bearer real-secret-never-record'})
        self.assertEqual(status, 401)
        rows = self.fixtures.requests('jira')
        self.assertEqual([r['auth_ok'] for r in rows], [True, False])
        self.assertEqual([r['status'] for r in rows], [200, 401])
        self.assertNotIn('real-secret', json.dumps(rows))
        self.assertNotIn('fictional-jira-token', json.dumps(rows))
        rows[0]['path'] = 'changed'
        self.assertEqual(self.fixtures.requests()[0]['path'], '/rest/api/3/myself')
        self.fixtures.start('gitlab')
        self.assertEqual(self.fixtures.requests('gitlab'), [])

    def test_jira_projects_and_confluence_probe(self):
        self.base = self.fixtures.start('jira')
        status, _, data = self.jira('/project/search?maxResults=1')
        self.assertEqual(status, 200)
        self.assertEqual(data['values'][0]['key'], 'NW')
        self.assertFalse(data['isLast'])
        self.assertEqual(self.jira('/project/search?startAt=1&maxResults=1')[2]['values'][0]['key'], 'OPS')
        self.assertEqual(self.jira('/project/NW')[2]['name'], 'Northwind Orders')
        self.assertEqual(self.call(self.base, '/wiki/rest/api/space?limit=1', headers=self.jira_headers())[2]['results'], [])

    def test_cloud_search_uses_tokens_and_has_no_offset_total(self):
        self.base = self.fixtures.start('jira')
        query = {'jql': 'project = NW ORDER BY updated ASC', 'maxResults': 1,
                 'fields': ['summary', 'updated'], 'startAt': 0}
        status, _, first = self.jira('/search/jql', 'POST', query)
        self.assertEqual(status, 200)
        self.assertEqual(first['issues'][0]['key'], 'NW-1')
        self.assertFalse(first['isLast'])
        self.assertNotIn('total', first)
        query['startAt'] = 1
        self.assertEqual(self.jira('/search/jql', 'POST', query)[2]['issues'][0]['key'], 'NW-1')
        query['nextPageToken'] = first['nextPageToken']
        second = self.jira('/search/jql', 'POST', query)[2]
        self.assertEqual(second['issues'][0]['key'], 'NW-2')
        query['nextPageToken'] = second['nextPageToken']
        last = self.jira('/search/jql', 'POST', query)[2]
        self.assertEqual(last['issues'][0]['key'], 'NW-3')
        self.assertTrue(last['isLast'])
        self.assertNotIn('nextPageToken', last)
        query['nextPageToken'] = 'invalid'
        self.assertEqual(self.jira('/search/jql', 'POST', query)[0], 400)
        self.assertEqual(self.jira('/search/jql', 'POST', {'jql': 'unsupported function()'})[0], 400)
        empty = self.jira('/search/jql', 'POST', {'jql': 'project = NW AND updated > "2026-01-03T00:00:00.000+0000" ORDER BY updated ASC'})[2]
        self.assertEqual(empty['issues'], [])

    def test_jira_writes_persist_and_require_adf(self):
        self.base = self.fixtures.start('jira')
        adf = {'type': 'doc', 'version': 1, 'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': 'Northwind note'}]}]}
        status, _, created = self.jira('/issue', 'POST', {'fields': {'project': {'key': 'NW'}, 'summary': 'New order', 'issuetype': {'name': 'Task'}, 'description': adf}})
        self.assertEqual(status, 201)
        key = created['key']
        self.assertEqual(key, 'NW-4')
        self.assertEqual(self.jira('/issue/' + key, 'PUT', {'fields': {'summary': 'Updated order', 'description': adf}})[0], 204)
        self.assertEqual(self.jira('/issue/' + key)[2]['fields']['summary'], 'Updated order')
        self.assertEqual(self.jira('/issue/' + key + '/comment', 'POST', {'body': 'plain'})[0], 400)
        self.assertEqual(self.jira('/issue/' + key + '/comment', 'POST', {'body': adf})[0], 201)
        self.assertEqual(self.jira('/issue/' + key + '/comment')[2]['comments'][0]['body'], adf)
        self.assertEqual(self.jira('/issue/' + key + '/transitions')[2]['transitions'][0]['id'], '31')
        self.assertEqual(self.jira('/issue/' + key + '/transitions', 'POST', {'transition': {'id': '31'}})[0], 204)
        self.assertEqual(self.jira('/issue/' + key)[2]['fields']['status']['name'], 'Done')
        self.assertEqual(self.jira('/issue/' + key + '/assignee', 'PUT', {'accountId': 'northwind-operator'})[0], 204)
        self.assertEqual(self.jira('/issue/' + key)[2]['fields']['assignee']['accountId'], 'northwind-operator')
        self.assertEqual(self.jira('/issue/' + key + '/worklog', 'POST', {'timeSpentSeconds': 60, 'comment': adf})[0], 201)
        self.assertEqual(self.jira('/issue/' + key + '?deleteSubtasks=true', 'DELETE')[0], 204)
        self.assertEqual(self.jira('/issue/' + key)[0], 404)
        self.assertEqual(self.jira('/issue', 'POST', {'fields': {'summary': 'missing project'}})[0], 400)

    def test_gitlab_auth_projects_pagination_search_and_subpath(self):
        base = self.fixtures.start('gitlab', base_path='/northwind')
        headers = {'PRIVATE-TOKEN': 'fictional-gitlab-token', 'Accept': 'application/json'}
        self.assertEqual(self.call(base, '/api/v4/user', headers=headers)[2]['username'], 'northwind-operator')
        status, response_headers, first = self.call(base, '/api/v4/projects?membership=true&simple=true&order_by=path&sort=asc&page=1&per_page=1', headers=headers)
        self.assertEqual(status, 200)
        self.assertEqual(first[0]['path_with_namespace'], 'northwind/catalog')
        self.assertEqual(response_headers['X-Next-Page'], '2')
        self.assertIn('rel="next"', response_headers['Link'])
        _, last_headers, last = self.call(base, '/api/v4/projects?page=2&per_page=1', headers=headers)
        self.assertEqual(last[0]['path_with_namespace'], 'northwind/orders')
        self.assertEqual(last_headers['X-Next-Page'], '')
        self.assertEqual(self.call(base, '/api/v4/projects?search=orders', headers=headers)[2][0]['id'], 102)
        self.assertEqual(self.call(base, '/api/v4/user', headers={'PRIVATE-TOKEN': 'wrong'})[0], 401)
        self.assertEqual(self.call(base, '/api/v4/projects?page=0', headers=headers)[0], 400)
        self.assertEqual(self.call(base, '/api/v4/projects/102/issues', headers=headers)[0], 404)

    def test_invalid_json_and_unknown_paths_fail(self):
        self.base = self.fixtures.start('jira')
        request = Request(self.base + '/rest/api/3/search/jql', data=b'{', headers=self.jira_headers(), method='POST')
        with self.assertRaises(HTTPError) as caught:
            urlopen(request, timeout=5)
        self.assertEqual(caught.exception.code, 400)
        caught.exception.close()
        self.assertEqual(self.jira('/unimplemented')[0], 404)
        self.assertEqual(self.jira('/search/jql', 'POST', {'jql': 'project = NW', 'maxResults': 0})[0], 400)

    def test_restart_resets_data_and_requests(self):
        self.base = self.fixtures.start('jira')
        self.jira('/issue/NW-1', 'PUT', {'fields': {'summary': 'Changed'}})
        self.fixtures.stop()
        self.base = self.fixtures.start('jira')
        self.assertEqual(self.fixtures.requests(), [])
        self.assertEqual(self.jira('/issue/NW-1')[2]['fields']['summary'], 'Check Northwind order')

class ResponseEvidenceTests(MockTests):
    def test_response_evidence_is_a_snapshot(self):
        self.base = self.fixtures.start('jira')
        self.jira('/issue/NW-1')
        self.jira('/issue/NW-1', 'PUT', {'fields': {'summary': 'Changed after read'}})
        rows = self.fixtures.requests('jira')
        self.assertEqual(rows[0]['response']['fields']['summary'], 'Check Northwind order')
        self.jira('/search/jql', 'POST', {'jql': 'project = NW ORDER BY updated ASC', 'maxResults': 1})
        search = self.fixtures.requests('jira')[-1]['response']
        self.assertFalse(search['isLast'])
        self.assertIn('nextPageToken', search)
        self.assertNotIn('total', search)


if __name__ == '__main__':
    unittest.main()
