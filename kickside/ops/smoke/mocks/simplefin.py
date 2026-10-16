"""Fictional SimpleFIN Bridge claim and bank feed."""
import base64
from .fixture import Fixture

class SimpleFIN(Fixture):
    name = 'simplefin'
    def dispatch(self, method, path, query, body, headers):
        if method == 'POST' and path in ('/simplefin/claim/northwind','/simplefin/claim/rotated'):
            return 200, {'Content-Type': 'text/plain'}, self.base.replace('://', '://northwind:fictional-bank@') + '/simplefin'
        if headers.get('Authorization') != 'Basic ' + base64.b64encode(b'northwind:fictional-bank').decode():
            return 401, {}, {'errors': ['fictional credential required']}
        if method == 'GET' and path == '/simplefin/accounts':
            return 200, {}, {'errors': [], 'accounts': [
                {'id': 'nw-checking', 'name': 'Northwind operating account', 'currency': 'USD', 'balance': '18425.50', 'available-balance': '18376.81', 'balance-date': 1791158400,
                 'org': {'name': 'Northwind Community Bank', 'domain': 'bank.example.invalid'},
                 'transactions': [{'id': 'nw-tx-731', 'posted': 1791072000, 'amount': '-48.69', 'description': 'Northwind packing materials', 'pending': False}, {'id': 'nw-tx-732', 'posted': 1791072001, 'amount': '1250.00', 'description': 'Northwind order settlement', 'pending': False}],
                 'holdings': [{'id': 'nw-holding-731', 'symbol': 'NWF', 'description': 'Northwind fictional fund', 'shares': '12.50', 'market-value': '625.00', 'purchase-price': '45.00'}]}
            ]}
        return 404, {}, {'error': 'unknown SimpleFIN route'}
