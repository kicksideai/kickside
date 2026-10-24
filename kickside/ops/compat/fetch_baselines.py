"""Resolve and verify Hub artifacts; only Hub HTTP endpoints are contacted."""
import hashlib
import json
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request

import yaml

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from ops.compat.wapp import read_pack

sys.path.insert(0, str(ROOT / '.github/scripts'))
from release_content import credentials, content_digest, module_url


class HubOnly(urllib.request.HTTPRedirectHandler):
    def __init__(self, artifact=False):
        self.artifact = artifact

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target = urllib.parse.urlsplit(newurl)
        same_origin = target.netloc == urllib.parse.urlsplit(req.full_url).netloc
        hub_storage = self.artifact and target.hostname == 'wippy-hub-bucket-prod-gen2.s3.dualstack.us-east-1.amazonaws.com'
        if target.scheme != 'https' or target.username or target.password or not (same_origin or hub_storage):
            raise ValueError('Hub download redirects outside the configured Hub')
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None and not same_origin:
            redirected.remove_header('Authorization')
        return redirected


class HubRequestError(ValueError):
    def __init__(self, message, status=None):
        super().__init__(message)
        self.status = status


class Hub:
    def __init__(self):
        self.url, self.token = credentials()
        parsed = urllib.parse.urlsplit(self.url)
        if parsed.scheme != 'https' or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError('Hub URL must be HTTPS without credentials, query or fragment')

    def request(self, url, binary=False):
        headers = {'Accept': 'application/octet-stream' if binary else 'application/json'}
        if self.token:
            headers['Authorization'] = 'Bearer ' + self.token
        try:
            with urllib.request.build_opener(HubOnly(artifact=binary)).open(urllib.request.Request(url, headers=headers), timeout=60) as response:
                data = response.read()
        except urllib.error.HTTPError as error:
            raise HubRequestError(f'Hub request fails (HTTP {error.code})', error.code) from None
        except urllib.error.URLError:
            raise HubRequestError('Hub request fails (transport)') from None
        return data if binary else json.loads(data)

    def baseline(self, identity, work, locked=None, released=True):
        """Use the published surface, or an empty baseline for a first release."""
        if locked:
            return self.fetch(identity, work, locked)
        try:
            latest = self.request(module_url(self.url, identity))['latest_version']
        except HubRequestError as error:
            if error.status != 404:
                raise
            latest = None
        if latest:
            if not released:
                raise ValueError(f'{identity}: release manifest declares it unreleased but the Hub publishes {latest}')
            return self.fetch(identity, work)
        return {'version': 'unreleased', 'sha256': None, 'entries': {}}

    def fetch(self, identity, work, locked=None):
        url = module_url(self.url, identity)
        version = locked['version'] if locked else self.request(url)['latest_version']
        if not version:
            raise ValueError(f'{identity}: Hub has no published baseline')
        details = self.request(url + '/versions/' + urllib.parse.quote(version, safe=''))
        digest = details['digest'].removeprefix('sha256:')
        if details.get('yanked'):
            raise ValueError(f'{identity}: baseline is yanked')
        if locked and locked.get('hash', '').removeprefix('sha256:') != digest:
            raise ValueError(f'{identity}: app lock and Hub digests differ')
        raw = self.request(url + '/versions/' + urllib.parse.quote(version, safe='') + '/download', binary=True)
        if hashlib.sha256(raw).hexdigest() != digest:
            raise ValueError(f'{identity}: Hub artifact digest mismatch')
        path = work / 'baseline.wapp'
        path.write_bytes(raw)
        content_digest(path)
        return {'version': version, 'sha256': digest, 'entries': read_pack(path)}


def app_lock(path, identities):
    rows = yaml.safe_load(path.read_text())['modules']
    result = {}
    for row in rows:
        if row['name'] in result:
            raise ValueError('duplicate app lock module')
        result[row['name']] = row
    missing = sorted(set(identities) - set(result))
    if missing:
        raise ValueError('app lock omits local modules: ' + ', '.join(missing))
    return {identity: result[identity] for identity in identities}
