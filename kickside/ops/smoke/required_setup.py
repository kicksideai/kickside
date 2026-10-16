"""Module-owned setup dispatch, readiness, and administrator boundaries."""
from browser import Browser
from harness import require


def required_setup(ctx):
    import uuid
    import yaml

    inst = ctx.inst
    Browser.release(ctx)
    fixture = inst.app / 'src' / 'required-setup-smoke'
    fixture.mkdir(exist_ok=True)
    (fixture / 'setup.lua').write_text('''local sql = require("sql")
local M = {}
local function database()
    local db, err = sql.get("app:db")
    if err then return nil, tostring(err) end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS smoke_required_setup (id TEXT PRIMARY KEY)")
    if create_err then db:release(); return nil, tostring(create_err) end
    return db
end
function M.status(args)
    local db, err = database()
    if not db then return nil, err end
    local rows, query_err = db:query("SELECT id FROM smoke_required_setup WHERE id = 'ready'")
    db:release()
    if query_err then return nil, tostring(query_err) end
    local ready = #rows == 1
    return { contract = args.contract, ready = ready, status = ready and "ready" or "missing" }
end
function M.apply(args)
    local db, err = database()
    if not db then return nil, err end
    local _, write_err = db:execute("INSERT INTO smoke_required_setup (id) VALUES ('ready') ON CONFLICT (id) DO NOTHING")
    db:release()
    if write_err then return nil, tostring(write_err) end
    return M.status(args)
end
return M
''')
    namespace = 'app.smoke.required_setup'
    entries = [
        {'name': action, 'kind': 'function.lua', 'source': 'file://setup.lua',
         'method': action, 'modules': ['sql']} for action in ('status', 'apply')]
    entries += [
        {'name': 'descriptor', 'kind': 'registry.entry',
         'meta': {'type': 'kickside.hub.required_setup', 'version': '1', 'title': 'Prepare test module'},
         'contract': 'smoke-setup:v1', 'status_func': namespace + ':status', 'apply_func': namespace + ':apply'},
        {'name': 'invalid', 'kind': 'registry.entry',
         'meta': {'type': 'kickside.hub.required_setup', 'version': '1'},
         'contract': 'smoke-setup:v1', 'status_func': 'app:status', 'apply_func': namespace + ':apply'},
    ]
    (fixture / '_index.yaml').write_text(yaml.safe_dump({
        'version': '1.0', 'namespace': namespace, 'entries': entries}, sort_keys=False))
    ctx.restart()
    route = '/api/v1/hub/required-setup'
    descriptor = namespace + ':descriptor'
    status = inst.request('GET', route + '?descriptor=' + descriptor, label='setup-missing')
    require(status['success'] and status['status'] == 'missing' and not status['ready'], 'Fresh setup claims readiness')
    ready = inst.request('POST', route, {'descriptor': descriptor}, label='setup-apply')
    require(ready['success'] and ready['ready'] and ready['status'] == 'ready', 'Required setup does not complete')
    verified = inst.request('GET', route + '?descriptor=' + descriptor, label='setup-ready')
    require(verified['ready'] and verified['contract'] == 'smoke-setup:v1', 'Setup readiness does not persist')
    invalid = inst.request('POST', route, {'descriptor': namespace + ':invalid'}, expect=(400,), label='setup-invalid')
    require(invalid['code'] == 'INVALID_SETUP_DESCRIPTOR', 'Setup allows cross-namespace dispatch')
    missing = inst.request('GET', route + '?descriptor=' + namespace + ':absent', expect=(404,), label='setup-absent')
    require(missing['code'] == 'SETUP_DESCRIPTOR_NOT_FOUND', 'Missing setup lacks actionable error')
    email = 'setup-member-' + uuid.uuid4().hex[:8] + '@example.com'
    user = inst.request('POST', '/api/v1/users', {'email': email, 'password': inst.password,
                        'full_name': 'Setup Member'}, expect=(201,), label='setup-member')['user']['user_id']
    inst.cleanup.add('setup member', lambda: inst.request('DELETE', '/api/v1/users/' + user, expect=(202,), label='setup-member-delete'))
    inst.request('PUT', '/api/v1/users/' + user + '/groups', {'groups': ['app.security:members']}, label='setup-member-groups')
    token = inst.request('POST', '/api/public/user/token', {'email': email, 'password': inst.password}, label='setup-member-token')['token']
    inst.redactor.add(token)
    for method in ('GET', 'POST'):
        path = route + '?descriptor=' + descriptor if method == 'GET' else route
        denied = inst.request(method, path, None if method == 'GET' else {'descriptor': descriptor},
                              auth=token, expect=(403,), label='setup-member-denied-' + method)
        require(denied.get('error'), 'Member setup denial lacks an error')
