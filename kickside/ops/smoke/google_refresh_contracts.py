"""OAuth renewal across the real callback, encrypted store, and Google tool."""
import json
import time
import uuid
from urllib.request import Request, urlopen

from harness import require


def google_oauth_refresh(ctx):
    from scenarios_providers import oauth_origin_connect, probe_value

    def configure(**options):
        request = Request(ctx.state['provider_bases']['google'] + '/_fixture/oauth',
                          data=json.dumps(options).encode(), headers={'Content-Type': 'application/json'})
        with urlopen(request, timeout=5) as response:
            require(json.load(response).get('success'), 'OAuth fixture configuration fails')

    def requests():
        return ctx.fixtures.requests('google')

    def refreshes():
        return [r for r in requests() if r['path'] == '/token' and r['body'].get('grant_type') == 'refresh_token']

    def read(label, *, expect_error=False):
        return probe_value(ctx, tool='kickside.google.traits:drive_read_tool',
                           trait='kickside.google.traits:drive_reader', connection=cid,
                           arguments={'action': 'list_files'}, label=label, expect_error=expect_error)

    def connected():
        rows = ctx.inst.request('GET', '/api/v1/connections', label='refresh-connection-state')['connections']
        return next(row for row in rows if row['component_id'] == cid)

    configure(initial_expires_in=1, api_rejections=0, refresh_error='')
    start = len(refreshes())
    cid = oauth_origin_connect(ctx, 'google', 'Northwind refresh ' + uuid.uuid4().hex[:8])
    authorize = next(r for r in reversed(requests()) if r['path'] == '/authorize')
    require(authorize['query'].get('access_type') == ['offline'], 'Google consent does not request offline access')
    require(authorize['query'].get('prompt') == ['consent'], 'Google consent does not request a renewable grant')
    expires = time.time() + 1
    ctx.inst.wait(lambda: time.time() >= expires, 'initial OAuth expiry')
    value = read('google-expiry-read')
    require('Northwind' in str(value) and not str(value).startswith('Error:'), 'Expired Google grant does not recover: ' + str(value))
    ctx.inst.wait(lambda: len(refreshes()) > start, 'Google expiry renewal')
    metadata = ctx.inst.request('GET', '/api/v1/oauth/connections/' + cid,
                                label='google-renewed-metadata')['connection']
    require(metadata['connection_state'] == 'connected' and int(metadata['expires_at']) > time.time(),
            'Renewed expiry does not persist: ' + str(metadata))
    configure(initial_expires_in=3600)
    latest = refreshes()[-1]
    require(latest['status'] == 200 and 'refresh_token' not in latest['response'], 'Renewal fixture rotates the refresh token')

    start = len(requests())
    configure(api_rejections=1)
    value = read('google-401-retry')
    require('Northwind' in str(value) and not str(value).startswith('Error:'), 'A single 401 does not recover: ' + str(value))
    trace = requests()[start:]
    require([r['status'] for r in trace if r['path'] == '/drive/v3/files'] == [401, 200], 'Google does not retry the rejected read exactly once')
    renewals = [r for r in trace if r['path'] == '/token']
    require(len(renewals) == 1 and renewals[0]['body']['refresh_token'] == 'fictional-google-refresh', 'The omitted refresh token is not retained')

    start = len(requests())
    configure(api_rejections=2)
    value = read('google-second-401')
    require(value.get('success') is False and value.get('error') == 'Google access token rejected',
            'A second 401 has no visible failure: ' + str(value))
    trace = requests()[start:]
    require([r['status'] for r in trace if r['path'] == '/drive/v3/files'] == [401, 401], 'Google replays the API more than once')
    require(len([r for r in trace if r['path'] == '/token']) == 1, 'Google refreshes repeatedly after a second 401')

    start = len(requests())
    configure(api_rejections=1, refresh_error='temporarily_unavailable')
    value = read('google-transient-refresh', expect_error=True)
    require(value.get('isError') is True and 'temporarily_unavailable' in value['content'][0]['text'],
            'Transient refresh does not return its typed failure: ' + str(value))
    trace = requests()[start:]
    require([r['status'] for r in trace if r['path'] == '/drive/v3/files'] == [401],
            'Google replays an API call after a failed refresh')
    require([r['status'] for r in trace if r['path'] == '/token'] == [503],
            'Transient refresh does not have the asserted provider failure')
    row = connected()
    require(row['connection_state'] == 'connected' and not row.get('reauth_reason'), 'Transient refresh changes the stored connection state: ' + str(row))
    configure(api_rejections=1, refresh_error='')
    require('Northwind' in str(read('google-recovery')), 'A transient failure destroys the reusable grant')

    configure(api_rejections=1, refresh_error='invalid_grant')
    value = read('google-invalid-grant', expect_error=True)
    require(value.get('isError') is True and 'invalid_grant' in value['content'][0]['text'],
            'Invalid grant does not return its typed failure: ' + str(value))
    row = connected()
    require(row['connection_state'] == 'needs_reauth' and 'invalid_grant' in row.get('reauth_reason', ''),
            'Invalid grant has no visible reauthorization reason: ' + str(row))
    ctx.inst.evidence.save('google-refresh-trace', requests())
    configure(api_rejections=0, refresh_error='')
