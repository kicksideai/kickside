"""OIDC identity fixture with RSA signatures and PKCE verification."""
import base64
import hashlib
import json
import secrets
import time
from urllib.parse import urlencode
from .fixture import Fixture

def b64(value):
    return base64.urlsafe_b64encode(value).decode().rstrip('=')

class OIDC(Fixture):
    name = 'oidc'
    def __init__(self, *args):
        super().__init__(*args)
        from cryptography.hazmat.primitives.asymmetric import rsa
        self.key = rsa.generate_private_key(public_exponent=65537,key_size=2048)
        self.codes = {}
    def dispatch(self, method, path, query, body, headers):
        if method == 'GET' and path == '/.well-known/openid-configuration':
            return 200, {}, {'issuer':self.base,'authorization_endpoint':self.base+'/authorize','token_endpoint':self.base+'/token','userinfo_endpoint':self.base+'/userinfo','jwks_uri':self.base+'/jwks','response_types_supported':['code'],'subject_types_supported':['public'],'id_token_signing_alg_values_supported':['RS256'],'code_challenge_methods_supported':['S256']}
        if method == 'GET' and path == '/jwks':
            n = self.key.public_key().public_numbers()
            integer = lambda x: b64(x.to_bytes((x.bit_length()+7)//8,'big'))
            return 200, {}, {'keys':[{'kty':'RSA','kid':'northwind-key','use':'sig','alg':'RS256','n':integer(n.n),'e':integer(n.e)}]}
        if method == 'GET' and path == '/authorize':
            fields = {k:v[0] for k,v in query.items()}
            if fields.get('client_id') != 'northwind-client' or fields.get('code_challenge_method') != 'S256':
                return 400, {}, {'error':'invalid authorization request'}
            code = secrets.token_urlsafe(24)
            self.codes[code] = fields
            return 302, {'Location':fields['redirect_uri']+'?'+urlencode({'code':code,'state':fields['state']})}, None
        if method == 'POST' and path == '/token':
            fields = self.codes.pop(body.get('code'),None)
            if not fields or b64(hashlib.sha256(body.get('code_verifier','').encode()).digest()) != fields['code_challenge']:
                return 400, {}, {'error':'invalid_grant'}
            if body.get('client_id') != 'northwind-client' or body.get('client_secret') != 'fictional-oidc-secret' or body.get('redirect_uri') != fields['redirect_uri']:
                return 400, {}, {'error':'invalid_client'}
            claims = {'iss':self.base,'aud':'northwind-client','sub':'northwind-operator','email':'operator@northwind.example.invalid','email_verified':True,'name':'Northwind Operator','nonce':fields['nonce'],'exp':int(time.time())+300,'iat':int(time.time())}
            parts = [b64(json.dumps({'alg':'RS256','kid':'northwind-key','typ':'JWT'}).encode()), b64(json.dumps(claims).encode())]
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.asymmetric import padding
            signature = self.key.sign('.'.join(parts).encode(),padding.PKCS1v15(),hashes.SHA256())
            return 200, {}, {'access_token':'fictional-oidc-access','token_type':'Bearer','expires_in':300,'id_token':'.'.join(parts+[b64(signature)])}
        if method == 'GET' and path == '/userinfo' and headers.get('Authorization') == 'Bearer fictional-oidc-access':
            return 200, {}, {'sub':'northwind-operator','email':'operator@northwind.example.invalid','email_verified':True,'name':'Northwind Operator'}
        return 404, {}, {'error':'unknown OIDC route'}
