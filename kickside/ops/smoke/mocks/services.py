"""Deterministic Northwind REST fixtures for the provider's supported surface."""

import base64
import copy
import re
import threading
from urllib.parse import unquote, urlencode

JIRA_EMAIL = 'northwind@example.invalid'
JIRA_TOKEN = 'fictional-jira-token'
GITLAB_TOKEN = 'fictional-gitlab-token'
STAMP = '2026-01-03T00:00:00.000+0000'


class BadRequest(ValueError):
    pass


def integer(value, default, minimum=1, maximum=100):
    try:
        result = int(value if value is not None else default)
    except (ValueError, TypeError) as error:
        raise BadRequest('pagination value must be an integer') from error
    if result < minimum or result > maximum:
        raise BadRequest(f'pagination value must be {minimum}..{maximum}')
    return result


def adf(value):
    if not isinstance(value, dict) or value.get('type') != 'doc' or value.get('version') != 1 or not isinstance(value.get('content'), list):
        raise BadRequest('Cloud rich text requires an ADF document')
    return value


class Service:
    def __init__(self, base, base_path):
        self.base = base
        self.base_path = base_path
        self.lock = threading.RLock()
        self.records = []

    def path(self, path):
        if not path.startswith(self.base_path + '/'):
            return ''
        return unquote(path[len(self.base_path):])

    def missing(self):
        return 404, {}, {'message': 'mock endpoint or resource not found'}


class Jira(Service):
    name = 'jira'

    def __init__(self, base, base_path):
        super().__init__(base, base_path)
        self.user = {'accountId': 'northwind-operator', 'displayName': 'Northwind Operator', 'active': True}
        self.projects = [
            {'id': '10001', 'key': 'NW', 'name': 'Northwind Orders', 'projectTypeKey': 'software', 'lead': self.user},
            {'id': '10002', 'key': 'OPS', 'name': 'Northwind Operations', 'projectTypeKey': 'business', 'lead': self.user},
        ]
        self.issues = {}
        for index, summary in enumerate(('Check Northwind order', 'Pack Northwind order', 'Ship Northwind order'), 1):
            self.issues[f'NW-{index}'] = self.issue(index, {
                'project': {'key': 'NW'}, 'summary': summary,
                'description': {'type': 'doc', 'version': 1, 'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': 'Fictional Northwind order ' + str(index)}]}]},
            })
        for index in range(41, 91):
            summary = 'Northwind reporter ticket ' + str(index) + ': confirm the fictional dispatch and returns record'
            self.issues[f'EE2-{index}'] = self.issue(index, {
                'project': {'key': 'EE2'}, 'summary': summary,
                'description': {'type': 'doc', 'version': 1, 'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': 'Fictional Northwind EE2 detail ' + str(index)}]}]},
            })
        self.next_issue = 4
        self.comments = {}

    def authorized(self, headers):
        expected = 'Basic ' + base64.b64encode(f'{JIRA_EMAIL}:{JIRA_TOKEN}'.encode()).decode()
        return headers.get('Authorization') == expected

    def issue(self, index, fields):
        project = fields['project']['key']
        key = f'{project}-{index}'
        defaults = {
            'status': {'name': 'Open'}, 'issuetype': {'name': 'Task'},
            'priority': {'name': 'Medium'}, 'reporter': self.user, 'assignee': self.user,
            'created': '2026-01-01T00:00:00.000+0000',
            'updated': f'2026-01-{min(index, 28):02d}T00:00:00.000+0000',
        }
        defaults.update(copy.deepcopy(fields))
        return {'id': str(11000 + index), 'key': key, 'self': self.base + '/rest/api/3/issue/' + key, 'fields': defaults}

    def search(self, body):
        jql = body.get('jql', 'order by updated DESC')
        if not isinstance(jql, str):
            raise BadRequest('jql must be a string')
        # Only the fixture's scoped project and updated-watermark queries apply.
        project = re.search(r'project\s*=\s*"?([A-Za-z][A-Za-z0-9_-]*)"?', jql, re.I)
        creator = re.search(r'creator\s*=\s*currentUser\(\)', jql, re.I)
        watermark = re.search(r'updated\s*(>=|>)\s*"([^"]+)"', jql, re.I)
        ordering = re.search(r'order\s+by\s+(updated|created)\s+(asc|desc)', jql, re.I)
        remaining = re.sub(r'project\s*=\s*"?[A-Za-z][A-Za-z0-9_-]*"?', '', jql, flags=re.I)
        remaining = re.sub(r'creator\s*=\s*currentUser\(\)', '', remaining, flags=re.I)
        remaining = re.sub(r'updated\s*(>=|>)\s*"[^"]+"', '', remaining, flags=re.I)
        remaining = re.sub(r'issuekey is not EMPTY|order\s+by\s+(updated|created)\s+(ASC|DESC)|\bAND\b|[()\s]', '', remaining, flags=re.I)
        if remaining:
            raise BadRequest('unsupported fixture JQL: ' + jql)
        rows = [row for row in self.issues.values() if not project or row['fields']['project']['key'] == project[1]]
        if creator:
            rows = [row for row in rows if row['fields'].get('reporter', {}).get('accountId') == self.user['accountId']]
        if watermark:
            rows = [row for row in rows if row['fields']['updated'] >= watermark[2]] if watermark[1] == '>=' else [row for row in rows if row['fields']['updated'] > watermark[2]]
        order_field = ordering.group(1).lower() if ordering else 'updated'
        rows.sort(key=lambda row: (row['fields'][order_field], row['key']),
                  reverse=bool(ordering and ordering.group(2).lower() == 'desc'))
        limit = integer(body.get('maxResults'), 50)
        token = body.get('nextPageToken')
        offset = 0
        if token is not None:
            if not isinstance(token, str) or not re.fullmatch(r'northwind-page-[0-9]+', token):
                raise BadRequest('invalid nextPageToken')
            offset = int(token.rsplit('-', 1)[1])
        result = {'issues': copy.deepcopy(rows[offset:offset + limit]), 'isLast': offset + limit >= len(rows)}
        if not result['isLast']:
            result['nextPageToken'] = f'northwind-page-{offset + limit}'
        return 200, {}, result

    def dispatch(self, method, path, query, body):
        path = self.path(path)
        if path == '/wiki/rest/api/space' and method == 'GET':
            return 200, {}, {'results': [], 'start': 0, 'limit': integer(query.get('limit', [None])[0], 100), 'size': 0}
        root = '/rest/api/3'
        if not path.startswith(root + '/'):
            return self.missing()
        path = path[len(root):]
        if path == '/myself' and method == 'GET':
            return 200, {}, self.user
        if path == '/project/search' and method == 'GET':
            limit = integer(query.get('maxResults', [None])[0], 50)
            start = integer(query.get('startAt', [None])[0], 0, 0, 10000)
            return 200, {}, {'values': self.projects[start:start + limit], 'total': len(self.projects), 'startAt': start, 'maxResults': limit, 'isLast': start + limit >= len(self.projects)}
        if path.startswith('/project/') and method == 'GET':
            for project in self.projects:
                if path[9:] in (project['key'], project['id']):
                    return 200, {}, project
            return self.missing()
        if path == '/search/jql' and method == 'POST':
            return self.search(body)
        if path == '/issue' and method == 'POST':
            fields = body.get('fields')
            if not isinstance(fields, dict) or not fields.get('summary') or not isinstance(fields.get('project'), dict):
                raise BadRequest('fields.project and fields.summary are required')
            if fields['project'].get('key') not in ('NW', 'OPS'):
                raise BadRequest('unknown project')
            if 'description' in fields:
                adf(fields['description'])
            issue = self.issue(self.next_issue, fields)
            self.next_issue += 1
            self.issues[issue['key']] = issue
            return 201, {}, {key: issue[key] for key in ('id', 'key', 'self')}
        detail = re.fullmatch(r'/issue/([^/]+)/comment/([^/]+)', path)
        if detail and method == 'GET':
            for comment in self.comments.get(detail[1], []):
                if comment['id'] == detail[2]:
                    return 200, {}, copy.deepcopy(comment)
            return self.missing()
        match = re.fullmatch(r'/issue/([^/]+)(?:/(comment|transitions|assignee|worklog))?', path)
        if not match or match[1] not in self.issues:
            return self.missing()
        key, suffix = match.groups()
        issue = self.issues[key]
        if suffix is None:
            if method == 'GET':
                return 200, {}, issue
            if method == 'PUT':
                fields = body.get('fields')
                if not isinstance(fields, dict):
                    raise BadRequest('fields must be an object')
                if 'description' in fields:
                    adf(fields['description'])
                issue['fields'].update(copy.deepcopy(fields))
                return 204, {}, None
            if method == 'DELETE':
                del self.issues[key]
                self.comments.pop(key, None)
                return 204, {}, None
        if suffix == 'comment':
            comments = self.comments.setdefault(key, [])
            if method == 'GET':
                return 200, {}, {'comments': comments, 'total': len(comments), 'startAt': 0, 'maxResults': 50}
            if method == 'POST':
                comment = {'id': str(12001 + len(comments)), 'body': adf(body.get('body')), 'author': self.user, 'created': STAMP}
                comments.append(copy.deepcopy(comment))
                return 201, {}, comment
        if suffix == 'transitions':
            if method == 'GET':
                return 200, {}, {'transitions': [{'id': '31', 'name': 'Done', 'to': {'name': 'Done'}}]}
            if method == 'POST':
                if body.get('transition') != {'id': '31'}:
                    raise BadRequest('unknown transition')
                issue['fields']['status'] = {'name': 'Done'}
                return 204, {}, None
        if suffix == 'assignee' and method == 'PUT':
            if body.get('accountId') not in ('northwind-operator', None):
                raise BadRequest('unknown accountId')
            issue['fields']['assignee'] = self.user if body.get('accountId') else None
            return 204, {}, None
        if suffix == 'worklog' and method == 'POST':
            seconds = integer(body.get('timeSpentSeconds'), 0, 1, 86400)
            if 'comment' in body:
                adf(body['comment'])
            return 201, {}, {'id': '13001', 'timeSpentSeconds': seconds, 'comment': body.get('comment')}
        return self.missing()


class GitLab(Service):
    name = 'gitlab'

    def __init__(self, base, base_path):
        super().__init__(base, base_path)
        self.projects = [{
            'id': index, 'name': name.title(), 'path_with_namespace': 'northwind/' + name,
            'description': 'Fictional Northwind ' + name, 'web_url': base + '/northwind/' + name,
            'namespace': {'full_path': 'northwind'}, 'visibility': 'private',
            'default_branch': 'main', 'last_activity_at': '2026-01-03T00:00:00Z',
        } for index, name in ((101, 'catalog'), (102, 'orders'))]

    def authorized(self, headers):
        return headers.get('PRIVATE-TOKEN') == GITLAB_TOKEN

    def dispatch(self, method, path, query, body):
        path = self.path(path)
        if method != 'GET':
            return self.missing()
        if path == '/api/v4/user':
            return 200, {}, {'id': 100, 'username': 'northwind-operator', 'name': 'Northwind Operator', 'state': 'active'}
        if path != '/api/v4/projects':
            return self.missing()
        page = integer(query.get('page', [None])[0], 1, 1, 10000)
        limit = integer(query.get('per_page', [None])[0], 100)
        search = query.get('search', [''])[0].lower()
        rows = [row for row in self.projects if search in row['path_with_namespace'].lower()]
        start = (page - 1) * limit
        next_page = str(page + 1) if start + limit < len(rows) else ''
        headers = {'X-Next-Page': next_page, 'X-Page': str(page), 'X-Per-Page': str(limit), 'X-Total': str(len(rows))}
        if next_page:
            next_query = {key: values[0] for key, values in query.items()}
            next_query.update(page=next_page, per_page=limit)
            headers['Link'] = '<' + self.base + '/api/v4/projects?' + urlencode(next_query) + '>; rel="next"'
        return 200, headers, rows[start:start + limit]
