"""Northwind page server with deterministic links and readable text."""
from .fixture import Fixture

class Webscout(Fixture):
    name = 'webscout'
    def dispatch(self, method, path, query, body, headers):
        if method == 'GET' and path == '/northwind':
            return 200, {'Content-Type': 'text/html; charset=utf-8'}, '<html><head><title>Northwind shipping desk</title></head><body><h1>Northwind autumn dispatch</h1><p>NORTHWIND-PAGE-731: The fictional dispatch desk packs 24 orders before 16:00.</p><a href="/orders">Orders</a><a href="/suppliers">Suppliers</a><a href="/orders">Orders again</a><a href="#top">Top</a></body></html>'
        if method == 'GET' and path in ('/orders','/suppliers'):
            return 200, {'Content-Type': 'text/plain'}, 'Northwind fictional ' + path[1:]
        return 404, {}, {'error': 'unknown Northwind page'}
