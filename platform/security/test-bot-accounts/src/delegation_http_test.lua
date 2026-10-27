local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local registry = require("registry")
local http_client = require("http_client")
local json = require("json")
local users = require("users")
local groups = require("groups")
local lifecycle = require("lifecycle")
local session_index = require("session_index")
local identity = require("execution_identity")
local reconcile = require("trigger_reconcile")
local PASSWORD = "Delegation-fixture-123!"
local accounts, tokens, roots
local target, root

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:execute(statement, args or {})
    db:release()
    test.is_nil(err)
    return result
end

local function query(statement, args)
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args or {})
    db:release()
    test.is_nil(err)
    return rows
end

local function account(group_ids, bot)
    local id = uuid.v4()
    test.not_nil((users.create({user_id = id, email = id .. "@test.local", password = PASSWORD, status = "active"})))
    accounts[#accounts + 1] = id
    for _, group in ipairs(group_ids or {}) do test.not_nil((groups.assign_user_to_group(id, group))) end
    if bot then execute("INSERT INTO app_user_bot_accounts (user_id,created_by,created_at) VALUES ($1,$2,$3)",
        {id, "deleted-creator", "2026-10-09T00:00:00Z"}) end
    return id
end

local function gateway()
    return "http://127.0.0.1:" .. assert(tostring(assert(registry.get("app:gateway")).data.addr):match(":(%d+)$"))
end

local function request(method: string, path: string, token: string?, body: any?): (any, any)
    local options = {headers = {["Content-Type"] = "application/json"}}
    if token then options.headers.Authorization = "Bearer " .. token end
    if body then options.body = type(body) == "string" and body or assert(json.encode(body)) end
    local response, err = http_client.request(method, gateway() .. path, options)
    test.is_nil(err)
    test.not_nil(response)
    return response, assert(json.decode(response.body))
end

local function login(group_ids, metadata)
    local id = account(group_ids)
    local response, payload = request("POST", "/api/public/user/token", nil,
        {email = id .. "@test.local", password = PASSWORD, metadata = metadata})
    test.eq(response.status_code, 200, response.body)
    test.eq(payload.actor.id, id)
    test.eq(payload.actor.metadata.user_id, id)
    tokens[#tokens + 1] = payload.token
    return payload.token, id
end

local function args(extra)
    local result = {principal = {kind = "user", id = target}, root = root,
        groups = {"app.security:operators"}}
    for key, value in pairs(extra or {}) do result[key] = value end
    return result
end

local function unchanged(input)
    test.is_nil((registry.get(identity.delegation_policy_id("user", target, root))))
end


local function save(token, input)
    local response, payload = request("POST", "/api/security/delegations", token, input)
    test.eq(response.status_code, 200, response.body)
    test.eq(payload.success, true)
    return payload
end

return {run = test.run_cases(function()
    test.describe("authenticated Security delegation HTTP", function()
        test.before_each(function()
            accounts, tokens, roots = {}, {}, {}
            target = account(nil, true)
            root = uuid.v4()
            roots[#roots + 1] = root
            execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {root, "app:http_fixture_root"})
        end)
        test.after_each(function()
            for _, token in ipairs(tokens) do test.not_nil((session_index.discard_minted(token))) end
            local changes = assert(registry.snapshot()):changes()
            local changed = false
            for _, entry in ipairs(assert(registry.find({["meta.intent"] = "execution_delegation"}))) do
                if entry.meta.target_id == target then changes:delete(tostring(entry.id)); changed = true end
            end
            if changed then test.is_nil(select(2, changes:apply())) end
            test.not_nil((reconcile.trigger()))
            for _, id in ipairs(roots) do execute("DELETE FROM kickside_components WHERE component_id=$1", {id}) end
            for _, id in ipairs(accounts) do
                execute("DELETE FROM app_user_bot_accounts WHERE user_id=$1", {id})
                test.not_nil((lifecycle.delete(id)))
            end
        end)
        test.it("RA-H07 real password login grants native delegation and records the authenticated admin as grantor", function()
            local token, admin = login({"app.security:admin"})
            local input = args({grantor = "forged-admin", credential_id = "secret-marker"})
            local result = save(token, input)
            test.eq(registry.get(result.policy_id).meta.grantor, admin)
            test.eq(assert(security.named_scope("app.security:operators")):evaluate(security.new_actor("operator"),
                "security.actor.delegate", result.resource), "allow")
        end)
        test.it("RA-H06 narrow endpoint and native policy writers use the production callback without direct host grants", function()
            local token = login({"app.security:security_admin", "app.security:policy_writer"})
            save(token, args())
        end)
        for _, group in ipairs({"app.security:user", "app.security:users_manager", "app.security:component_admin",
            "app.security:security_admin", "app.security:policy_writer"}) do
            test.it("RA-H06 " .. group .. " alone cannot create delegation through HTTP", function()
                local token = login({group})
                local input = args()
                local response = request("POST", "/api/security/delegations", token, input)
                test.eq(response.status_code, 403, response.body)
                unchanged(input)
            end)
        end
        for _, method in ipairs({"GET", "POST", "DELETE"}) do
            test.it("RA-H06 anonymous " .. method .. " is refused before delegation dispatch", function()
                local input = args()
                local response = request(method, "/api/security/delegations", nil, input)
                test.eq(response.status_code, 401, response.body)
                unchanged(input)
            end)
        end
        test.it("RA-H31 forged password-login identity metadata cannot become the grantor", function()
            local token, admin = login({"app.security:admin"}, {user_id = target,
                principal = {kind = "user", id = target}, authorized_by = {kind = "user", id = target},
                _execution_identity = {principal = {kind = "user", id = target}}})
            local input = args()
            local result = save(token, input)
            test.eq(registry.get(result.policy_id).meta.grantor, admin)
        end)
        test.it("RA-H51 list protects provenance and excludes bearer values", function()
            local token, admin = login({"app.security:admin"})
            local result = save(token, args())
            local response, payload = request("GET", "/api/security/delegations", token)
            test.eq(response.status_code, 200, response.body)
            local found
            for _, row in ipairs(payload.delegations) do if row.policy_id == result.policy_id then found = row end end
            test.not_nil(found)
            test.eq(found.grantor, admin)
            test.eq(found.principal.id, target)
            test.is_nil(found.request)
            test.is_nil((response.body:find(token, 1, true)))
            local ungranted = login({"app.security:user"})
            local denied = request("GET", "/api/security/delegations", ungranted)
            test.eq(denied.status_code, 403, denied.body)
        end)
        test.it("RA-H51 list names each component root the viewer can read by its title", function()
            local token, admin = login({"app.security:admin"})
            local function titled(id, title, readable)
                if id ~= root then
                    roots[#roots + 1] = id
                    execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {id, "app:http_fixture_root"})
                end
                if title then
                    execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,$3,$4)",
                        {uuid.v4(), id, "title", title})
                end
                if readable then
                    execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_type,subject_id,access_mask) VALUES ($1,$2,$3,$4,$5,$6)",
                        {uuid.v4(), id, id, "user", admin, 1})
                end
            end
            titled(root, "Nightly digest", true)
            local exact = save(token, args())
            local untitled = uuid.v4()
            titled(untitled, nil, true)
            local plain = save(token, args({root = untitled}))
            local hidden = uuid.v4()
            titled(hidden, "Private digest", false)
            local unreadable = save(token, args({root = hidden}))
            local every = save(token, args({root = "*"}))
            local response, payload = request("GET", "/api/security/delegations", token)
            test.eq(response.status_code, 200, response.body)
            local rows = {}
            for _, row in ipairs(payload.delegations) do rows[row.policy_id] = row end
            test.eq(rows[exact.policy_id].root, root)
            test.eq(rows[exact.policy_id].root_label, "Nightly digest")
            test.eq(rows[plain.policy_id].root, untitled)
            test.is_nil(rows[plain.policy_id].root_label)
            test.eq(rows[unreadable.policy_id].root, hidden)
            test.is_nil(rows[unreadable.policy_id].root_label)
            test.eq(rows[every.policy_id].root, "*")
            test.is_nil(rows[every.policy_id].root_label)
        end)
        test.it("RA-H51 the root catalog lists only components the caller administers", function()
            local token, admin = login({"app.security:admin"})
            local managed = uuid.v4()
            roots[#roots + 1] = managed
            execute("INSERT INTO kickside_components (component_id,impl_id) VALUES ($1,$2)", {managed, "app:http_fixture_root"})
            execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,$3,$4)",
                {uuid.v4(), managed, "title", "Support bot"})
            execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_type,subject_id,access_mask) VALUES ($1,$2,$3,$4,$5,$6)",
                {uuid.v4(), managed, managed, "user", admin, 15})
            local response, payload = request("GET", "/api/security/delegations/roots", token)
            test.eq(response.status_code, 200, response.body)
            test.eq(payload.success, true)
            local listed = {}
            for _, item in ipairs(payload.items) do listed[item.id] = item end
            test.not_nil(listed[managed])
            test.eq(listed[managed].label, "Support bot")
            test.is_nil(listed[root])
            local ungranted = login({"app.security:user"})
            local denied = request("GET", "/api/security/delegations/roots", ungranted)
            test.eq(denied.status_code, 403, denied.body)
        end)
        test.it("RA-H50 DELETE retains canonical ID and removes native selection authority", function()
            local token = login({"app.security:admin"})
            local result = save(token, args())
            local revoke = args()
            local response, payload = request("DELETE", "/api/security/delegations", token, revoke)
            test.eq(response.status_code, 200, response.body)
            test.eq(payload.policy_id, result.policy_id)
            test.eq(assert(registry.get(result.policy_id)).meta.active, false)
            test.is_false(assert(security.named_scope("app.security:operators")):evaluate(security.new_actor("operator"),
                "security.actor.delegate", result.resource) == "allow")
        end)
        test.it("RA-H06 malformed JSON and invalid groups leave no native mutation", function()
            local token = login({"app.security:admin"})
            local malformed = request("POST", "/api/security/delegations", token, "{")
            test.eq(malformed.status_code, 400, malformed.body)
            local input = args({groups = {"app.security:unknown"}})
            local denied = request("POST", "/api/security/delegations", token, input)
            test.eq(denied.status_code, 403, denied.body)
            unchanged(input)
        end)
        test.it("RA-H06 an inactive target and nonexistent root refuse HTTP grants", function()
            local token = login({"app.security:admin"})
            local input = args({root = uuid.v4()})
            local missing = request("POST", "/api/security/delegations", token, input)
            test.eq(missing.status_code, 400, missing.body)
            unchanged(input)
            execute("UPDATE app_users SET status='inactive' WHERE user_id=$1", {target})
            input = args()
            local inactive = request("POST", "/api/security/delegations", token, input)
            test.eq(inactive.status_code, 403, inactive.body)
            unchanged(input)
        end)
        test.it("RA-H26 admin-group bot with valid stored password fails actual HTTP login", function()
            test.not_nil((groups.assign_user_to_group(target, "app.security:admin")))
            local response, payload = request("POST", "/api/public/user/token", nil,
                {email = target .. "@test.local", password = PASSWORD})
            test.eq(response.status_code, 401, response.body)
            test.is_nil(payload.token)
            test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_user_sessions WHERE user_id=$1", {target})[1].n), 0)
        end)

        test.it("RA-H45 a live Users outage fails HTTP save and still permits authority reduction", function()
            local token = login({"app.security:admin"})
            local result = save(token, args())
            local lookup = assert(registry.get("kickside.users.binding:subject_lookup"))
            local data = {}
            for key, value in pairs(lookup.data) do data[key] = value end
            data.imports = {}
            for key, value in pairs(lookup.data.imports) do data.imports[key] = value end
            data.imports.user_groups_repo = "app:unavailable_subject_directory"
            local changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(lookup.id), kind = lookup.kind, meta = lookup.meta, data = data})
            test.is_nil(select(2, changes:apply()))
            local input = args()
            local response: any, payload: any
            local ok, call_err = pcall(function()
                response, payload = request("POST", "/api/security/delegations", token, input)
            end)
            local revoke = args()
            local reduction_ok, reduced = pcall(request, "DELETE", "/api/security/delegations", token, revoke)
            changes = assert(registry.snapshot()):changes()
            changes:update({id = tostring(lookup.id), kind = lookup.kind, meta = lookup.meta, data = lookup.data})
            test.is_nil(select(2, changes:apply()))
            test.is_true(ok, tostring(call_err))
            test.eq(response.status_code, 500, response.body)
            test.eq(payload.success, false)
            test.eq(payload.retryable, true)
            test.is_true(reduction_ok, tostring(reduced))
            test.eq(reduced.status_code, 200, reduced.body)
            test.eq(assert(registry.get(result.policy_id)).meta.active, false)
        end)
    end)
end)}
