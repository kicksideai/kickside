"""Northwind Confluence Cloud content, space discovery and versioned writes."""
import copy
import re
from .services import Jira
from .fixture import Fixture

class Confluence(Fixture):
    name = 'confluence'
    def __init__(self, *args):
        super().__init__(*args)
        self.jira = Jira(self.base,'')
        self.pages = {'731': {'id': '731', 'type': 'page', 'title': 'Northwind shipping handbook', 'space': {'key': 'NW'}, 'version': {'number': 1}, 'body': {'storage': {'value': '<p>NORTHWIND-CONFLUENCE-731: Pack 24 fictional orders.</p>', 'representation': 'storage'}}, '_links': {'webui': '/wiki/spaces/NW/pages/731'}}}
    def dispatch(self, method, path, query, body, headers):
        if not self.jira.authorized(headers):
            return 401, {}, {'message': 'fictional credential required'}
        if not path.startswith('/wiki/'):
            return self.jira.dispatch(method,path,query,body)
        if path == '/wiki/rest/api/space' and method == 'GET':
            return 200, {}, {'results': [{'id': '73', 'key': 'NW', 'name': 'Northwind operations'}], 'size': 1, 'start': 0, 'limit': 100, '_links': {}}
        if path in ('/wiki/rest/api/content','/wiki/rest/api/content/search') and method == 'GET':
            rows = list(copy.deepcopy(self.pages).values())
            cql = query.get('cql',[''])[0]
            title = re.search(r'title\s*=\s*"([^"]*)"',cql)
            if title:
                rows = [row for row in rows if row['title']==title.group(1)]
            if 'status = trashed' in cql or 'status = \"trashed\"' in cql:
                rows = []
            return 200, {}, {'results': rows, 'size': len(rows), 'start': 0, 'limit': 100, '_links': {}}
        if path == '/wiki/rest/api/content' and method == 'POST':
            key = str(732 + len(self.pages)-1)
            self.pages[key] = dict(copy.deepcopy(body), id=key, version={'number': 1}, _links={'webui':'/wiki/spaces/NW/pages/'+key})
            return 200, {}, copy.deepcopy(self.pages[key])
        key = path.removeprefix('/wiki/rest/api/content/')
        if key in self.pages:
            if method == 'PUT':
                if body.get('version',{}).get('number') != self.pages[key]['version']['number']+1:
                    return 409, {}, {'message':'version conflict'}
                self.pages[key].update(copy.deepcopy(body))
            if method in ('GET','PUT'):
                return 200, {}, copy.deepcopy(self.pages[key])
            if method == 'DELETE':
                del self.pages[key]
                return 204, {}, None
        return 404, {}, {'message':'unknown Confluence route'}
