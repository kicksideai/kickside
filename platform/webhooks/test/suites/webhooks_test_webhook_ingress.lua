local test = require("test")
local hash = require("hash")
local sql = require("sql")
local json = require("json")
local time = require("time")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local http_client = require("http_client")
local validator = require("validator")
local ingress = require("ingress")
local consts = require("consts")
local repo = require("repo")
local security_core = require("security_core")
local registry = require("registry")

-- The harness gateway's configured port (a per-run var).
local function gateway_url(path: string): string
    local entry = registry.get("app:gateway")
    local addr = entry and ((entry :: any).data and (entry :: any).data.addr or (entry :: any).addr) or nil
    local port = tostring(addr or ""):match(":(%d+)$")
    if not port then error("harness gateway address unavailable: " .. tostring(addr)) end
    return "http://localhost:" .. port .. path
end

local function component_path(db: any, component_id: string): string
    if db:type() == sql.type.POSTGRES then
        return component_id:gsub("%-", "")
    end
    return "/" .. component_id .. "/"
end

-- A stub repo: resolve returns the seeded record; append_event records the payload.
local function make_repo(record, appended)
    return {
        resolve = function(id)
            if not record or record.webhook_id ~= id then return nil, "webhook not found" end
            return record, nil
        end,
        append_event = function(rec, payload)
            appended[#appended + 1] = { rec = rec, payload = payload }
            return true, nil
        end,
        touch_last_used = function() end,
    }
end

local function active_record(secret, schema)
    return {
        webhook_id = "wh-1",
        actor_id = "user-1",
        secret_hash = hash.sha256(secret),
        schema = schema or {},
        status = consts.STATUS.ACTIVE,
    }
end

local function seed_public_ingress(webhook_id: string, actor_id: string, secret: string)
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local _, schema_err = d:execute("CREATE TABLE IF NOT EXISTS webhook_test_principals (id TEXT PRIMARY KEY, active INTEGER NOT NULL)")
    if schema_err then d:release(); error(tostring(schema_err)) end
    local _, principal_err = d:execute("INSERT INTO webhook_test_principals (id, active) VALUES ($1, 1) ON CONFLICT (id) DO UPDATE SET active=1", {actor_id})
    if principal_err then d:release(); error(tostring(principal_err)) end
    d:execute("DELETE FROM kickside_event WHERE thread_id = $1", { webhook_id })
    d:execute("DELETE FROM " .. consts.TABLES.WEBHOOKS .. " WHERE webhook_id = $1", { webhook_id })
    d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { webhook_id })
    d:execute("DELETE FROM kickside_components WHERE component_id = $1", { webhook_id })
    d:execute("DELETE FROM kickside_thread WHERE id = $1", { webhook_id })

    local _, component_err = sql.builder.insert("kickside_components")
        :set_map({
            component_id = webhook_id,
            impl_id = "kickside.webhooks:webhook_kind",
            private_context = "{}",
            path = component_path(d, webhook_id),
        })
        :run_with(d):exec()
    if component_err then d:release(); error("component seed failed: " .. tostring(component_err)) end

    local _, access_err = sql.builder.insert("kickside_component_access")
        :set_map({
            access_id = uuid.v4(),
            subject_id = actor_id,
            subject_type = "user",
            component_id = webhook_id,
            source_component_id = webhook_id,
            access_mask = 15,
            inherited = 0,
        })
        :run_with(d):exec()
    if access_err then d:release(); error("access seed failed: " .. tostring(access_err)) end

    local _, thread_err = sql.builder.insert("kickside_thread")
        :set_map({
            id = webhook_id,
            thread_class = consts.THREAD_CLASS,
            attrs = "{}",
            component_id = webhook_id,
        })
        :run_with(d):exec()
    if thread_err then d:release(); error("thread seed failed: " .. tostring(thread_err)) end

    local ts = time.now():unix()
    local _, webhook_err = sql.builder.insert(consts.TABLES.WEBHOOKS)
        :set_map({
            webhook_id = webhook_id,
            secret_hash = hash.sha256(secret),
            secret_prefix = "kshook_public",
            actor_id = actor_id,
            schema_json = json.encode({ type = "object", required = { "event" }, properties = { event = { type = "string" } } }),
            label = "public ingress",
            status = consts.STATUS.ACTIVE,
            created_at = ts,
            updated_at = ts,
        })
        :run_with(d):exec()
    d:release()
    if webhook_err then error("webhook seed failed: " .. tostring(webhook_err)) end
end

local function event_rows(webhook_id: string): { any }
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local rows, query_err = sql.builder.select("type", "role", "body")
        :from("kickside_event")
        :where("thread_id = ?", webhook_id)
        :order_by("seq ASC")
        :run_with(d):query()
    d:release()
    if query_err then error("event query failed: " .. tostring(query_err)) end
    return rows or {}
end

local function thread_event_count(webhook_id: string): integer
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local rows, query_err = sql.builder.select("event_count")
        :from("kickside_thread")
        :where("id = ?", webhook_id)
        :run_with(d):query()
    d:release()
    if query_err then error("thread query failed: " .. tostring(query_err)) end
    return math.floor(tonumber(((rows or {})[1] :: any).event_count) or 0)
end

local function suite_scope(): any
    local policy, policy_err = security.policy("app:webhooks_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function policy_decision(policy_id: string, action: string, resource: string): string
    local policy, policy_err = security.policy(policy_id)
    if policy_err or not policy then error("policy " .. policy_id .. ": " .. tostring(policy_err)) end
    local actor, actor_err = security.new_actor("webhook-policy-test", {})
    if actor_err or not actor then error("policy actor: " .. tostring(actor_err)) end
    local result = (policy :: any):evaluate(actor, action, resource, {})
    if result == "allow" or result == "deny" then return result end
    return "undefined"
end

local function call_repo_as(actor_id: string, args: any): (any, any?)
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then return nil, actor_err end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call("app:test_repo_call", args or {})
end

local function call_update_repo_as(actor_id: string, webhook_id: string, patch: any): (any, any?)
    local encoded, encode_err = json.encode(patch)
    if encode_err then return nil, encode_err end
    return call_repo_as(actor_id, {
        method = "update",
        webhook_id = webhook_id,
        patch_json = encoded,
    })
end

local function with_failure_trigger(
    name: string,
    table_name: string,
    event: string,
    condition: string,
    message: string,
    body: () -> ()
)
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local postgres = d:type() == sql.type.POSTGRES
    local function drop_trigger(db: any)
        local _, trigger_err
        if postgres then
            _, trigger_err = db:execute("DROP TRIGGER IF EXISTS " .. name .. " ON " .. table_name)
            local _, function_err = db:execute("DROP FUNCTION IF EXISTS " .. name .. "_fn()")
            return trigger_err or function_err
        else
            _, trigger_err = db:execute("DROP TRIGGER IF EXISTS " .. name)
            return trigger_err
        end
    end
    local drop_err = drop_trigger(d)
    if drop_err then d:release(); error("trigger reset failed: " .. tostring(drop_err)) end
    local trigger_err
    if postgres then
        local function_sql = "CREATE OR REPLACE FUNCTION " .. name .. "_fn() RETURNS trigger LANGUAGE plpgsql AS $$ " ..
            "BEGIN IF " .. condition .. " THEN RAISE EXCEPTION '" .. message .. "'; END IF; RETURN NEW; END; $$"
        local _, function_err = d:execute(function_sql)
        if function_err then
            drop_trigger(d)
            d:release()
            error("trigger function create failed: " .. tostring(function_err))
        end
        local _, create_err = d:execute("CREATE TRIGGER " .. name .. " BEFORE " .. event .. " ON " .. table_name ..
            " FOR EACH ROW EXECUTE FUNCTION " .. name .. "_fn()")
        trigger_err = create_err
    else
        local trigger_sql = "CREATE TRIGGER " .. name .. " BEFORE " .. event .. " ON " .. table_name ..
            " WHEN " .. condition .. " BEGIN SELECT RAISE(ABORT, '" .. message .. "'); END"
        local _, create_err = d:execute(trigger_sql)
        trigger_err = create_err
    end
    if trigger_err and postgres then drop_trigger(d) end
    d:release()
    if trigger_err then error("trigger create failed: " .. tostring(trigger_err)) end

    local ok, body_err = pcall(body)
    local cleanup_db, cleanup_db_err = sql.get("app:db")
    if cleanup_db_err or not cleanup_db then error("cleanup db: " .. tostring(cleanup_db_err)) end
    local cleanup_err = drop_trigger(cleanup_db)
    cleanup_db:release()
    if cleanup_err then error("trigger cleanup failed: " .. tostring(cleanup_err)) end
    if not ok then error(body_err) end
end

local function webhook_row(id: string): any?
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local rows, query_err = sql.builder.select(
        "webhook_id", "secret_hash", "secret_prefix", "actor_id", "schema_json", "label", "status", "created_at", "updated_at", "last_used_at"
    ):from(consts.TABLES.WEBHOOKS):where("webhook_id = ?", id):limit(1):run_with(d):query()
    d:release()
    if query_err then error("webhook row query failed: " .. tostring(query_err)) end
    return rows and rows[1] or nil
end

local function component_meta_value(id: string, key: string): string?
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local rows, query_err = sql.builder.select("value")
        :from("kickside_component_meta")
        :where("component_id = ?", id)
        :where("key = ?", key)
        :limit(1)
        :run_with(d):query()
    d:release()
    if query_err then error("component meta query failed: " .. tostring(query_err)) end
    return rows and rows[1] and tostring((rows[1] :: any).value) or nil
end

local function thread_count_for_label(label: string): integer
    local d, derr = sql.get("app:db")
    if derr or not d then error("db: " .. tostring(derr)) end
    local attrs_match = d:type() == sql.type.POSTGRES and "attrs::text LIKE ?" or "attrs LIKE ?"
    local rows, query_err = sql.builder.select("COUNT(*) AS count")
        :from("kickside_thread")
        :where(attrs_match, "%" .. label .. "%")
        :run_with(d):query()
    d:release()
    if query_err then error("thread count failed: " .. tostring(query_err)) end
    return math.floor(tonumber(rows and rows[1] and (rows[1] :: any).count) or 0)
end

local function define_tests()

    test.describe("webhook ingress", function()
        test.it("appends the validated payload and returns 202", function()
            local appended: { any } = {}
            local rec = active_record("s3cr3t", { type = "object", required = { "event" }, properties = { event = { type = "string" } } })
            local status, body = ingress.process("wh-1", "s3cr3t", { event = "ping" }, { repo = make_repo(rec, appended) })
            test.eq(status, 202)
            test.is_true(body.success)
            test.eq(#appended, 1)
            local first: any = appended[1]
            local payload: any = (first :: any).payload
            local rec_out: any = (first :: any).rec
            test.eq(payload.event, "ping")
            test.eq(rec_out.webhook_id, "wh-1")
        end)

        test.it("the actor-bound append function writes through the threads contract", function()
            local webhook_id = uuid.v4()
            local actor_id = "public-owner"
            seed_public_ingress(webhook_id, actor_id, "unused-secret")

            local result, call_err = security_core.dispatch_append_as_actor(actor_id, {
                thread_id = webhook_id,
                event = { type = consts.EVENT.INBOUND, role = "user", body = { event = "direct" } },
            })
            test.is_nil(call_err)
            test.not_nil(result)
            test.is_true((result :: any).success, tostring((result :: any).error))
            test.eq(thread_event_count(webhook_id), 1)
        end)

        test.it("refuses an inactive principal without appending an event", function()
            local id, owner = uuid.v4(), "webhook-owner-" .. uuid.v4()
            seed_public_ingress(id, owner, "live-secret")
            local function post(): any
                local response, request_err = http_client.post(gateway_url("/public/hooks/" .. id), {
                    headers = {["Content-Type"] = "application/json", [consts.SECRET_HEADER] = "live-secret"},
                    body = json.encode({event = "live"}),
                })
                test.is_nil(request_err, tostring(request_err))
                test.not_nil(response)
                return response
            end
            test.eq(post().status_code, 202)
            test.eq(#event_rows(id), 1)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, update_err = db:execute("UPDATE webhook_test_principals SET active=0 WHERE id=$1", {owner})
            db:release()
            test.is_nil(update_err)
            test.eq(post().status_code, 403)
            test.eq(#event_rows(id), 1)
            test.eq(thread_event_count(id), 1)
        end)

        test.it("refuses a missing principal and a removed write grant", function()
            for _, boundary in ipairs({"missing", "write"}) do
                local id, owner = uuid.v4(), "webhook-owner-" .. uuid.v4()
                seed_public_ingress(id, owner, "live-secret")
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local _, update_err
                if boundary == "missing" then
                    _, update_err = db:execute("DELETE FROM webhook_test_principals WHERE id=$1", {owner})
                else
                    _, update_err = db:execute("UPDATE kickside_component_access SET access_mask=1 WHERE component_id=$1", {id})
                end
                db:release()
                test.is_nil(update_err)
                local response, request_err = http_client.post(gateway_url("/public/hooks/" .. id), {
                    headers = {["Content-Type"] = "application/json", [consts.SECRET_HEADER] = "live-secret"},
                    body = json.encode({event = "live"}),
                })
                test.is_nil(request_err)
                test.eq(response.status_code, 403, tostring(response.body))
                test.eq(#event_rows(id), 0)
            end
        end)

        test.it("preserves a directory failure and appends no event", function()
            local id, owner = uuid.v4(), "webhook-owner-" .. uuid.v4()
            seed_public_ingress(id, owner, "live-secret")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, rename_err = db:execute("ALTER TABLE webhook_test_principals RENAME TO webhook_test_principals_held")
            test.is_nil(rename_err)
            local response, request_err = http_client.post(gateway_url("/public/hooks/" .. id), {
                headers = {["Content-Type"] = "application/json", [consts.SECRET_HEADER] = "live-secret"},
                body = json.encode({event = "live"}),
            })
            local _, restore_err = db:execute("ALTER TABLE webhook_test_principals_held RENAME TO webhook_test_principals")
            db:release()
            test.is_nil(restore_err)
            test.is_nil(request_err)
            test.eq(response.status_code, 500)
            local body = assert(json.decode(response.body))
            test.contains(body.error, "webhook_test_principals")
            test.eq(#event_rows(id), 0)
        end)

        test.it("preserves typed group and service owners", function()
            for _, kind in ipairs({"group", "service"}) do
                local id, owner = uuid.v4(), uuid.v4()
                local actor_id = "principal:" .. kind .. ":" .. owner
                seed_public_ingress(id, actor_id, "typed-secret")
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local _, update_err = db:execute("UPDATE kickside_component_access SET subject_type=$1, subject_id=$2 WHERE component_id=$3", {kind, owner, id})
                db:release()
                test.is_nil(update_err)
                local response, request_err = http_client.post(gateway_url("/public/hooks/" .. id), {
                    headers = {["Content-Type"] = "application/json", [consts.SECRET_HEADER] = "typed-secret"},
                    body = json.encode({event = "typed"}),
                })
                test.is_nil(request_err)
                test.eq(response.status_code, 202, tostring(response.body))
                test.eq(#event_rows(id), 1)
            end
        end)

        test.it("keeps the anonymous endpoint out of threads contract access", function()
            test.eq(policy_decision("kickside.webhooks.security:endpoint_verified_dispatch", "funcs.call", "kickside.webhooks.ingress:append_event"), "allow")
            test.eq(policy_decision("kickside.webhooks.security:endpoint_verified_dispatch", "funcs.call", "kickside.core:threads"), "undefined")
            test.eq(policy_decision("kickside.webhooks.security:endpoint_actor_binding", "funcs.security", "security"), "allow")
            test.eq(policy_decision("kickside.webhooks.security:endpoint_session_scope_read", "security.policy_group.get", "kickside.webhooks.security:session"), "allow")
            test.eq(policy_decision("kickside.webhooks.security:endpoint_session_scope_read", "security.policy_group.get", "kickside.core:threads"), "undefined")
        end)

        test.it("the public endpoint verifies the secret then dispatches the inbound event", function()
            local webhook_id = uuid.v4()
            local secret = "public-secret"
            seed_public_ingress(webhook_id, "public-owner", secret)

            local response, request_err = http_client.post(gateway_url("/public/hooks/" .. webhook_id), {
                headers = {
                    ["Content-Type"] = "application/json",
                    [consts.SECRET_HEADER] = secret,
                },
                body = json.encode({ event = "ping" }),
            })
            test.is_nil(request_err)
            test.not_nil(response)
            test.eq((response :: any).status_code, 202, "public ingress response: " .. tostring((response :: any).body))

            local body, body_err = json.decode((response :: any).body or "")
            test.is_nil(body_err)
            test.is_true((body :: any).success)

            local rows = event_rows(webhook_id)
            test.eq(thread_event_count(webhook_id), 1)
            test.eq(#rows, 1)
            local event: any = rows[1]
            test.eq(event.type, consts.EVENT.INBOUND)
            test.eq(event.role, "user")
            local payload, payload_err = json.decode(tostring(event.body or ""))
            test.is_nil(payload_err)
            test.eq((payload :: any).event, "ping")
        end)

        test.it("a direct caller cannot invoke the raw webhook append capability", function()
            local webhook_id = uuid.v4()
            seed_public_ingress(webhook_id, "public-owner", "public-secret")
            local actor, actor_err = security.new_actor("public-owner", { security_groups = {} })
            test.is_nil(actor_err)
            local allow, allow_err = security.policy("app:output_spoof_allow")
            test.is_nil(allow_err)
            local scope, scope_err = security.new_scope({ allow })
            test.is_nil(scope_err)

            local result, call_err = funcs.new():with_actor(actor):with_scope(scope)
                :call("kickside.webhooks.ingress:append_event", {
                    thread_id = webhook_id,
                    event = { type = consts.EVENT.INBOUND, role = "system",
                        external = { external_source = "webhook", external_id = "forged" },
                        body = { event = "forged" } },
                })
            test.is_nil(call_err)
            test.not_nil(result)
            test.is_false((result :: any).success)
            test.eq(thread_event_count(webhook_id), 0)
        end)

        test.it("delivers repeated idempotency keys once and keeps different keys distinct", function()
            local webhook_id = uuid.v4()
            seed_public_ingress(webhook_id, "public-owner", "public-secret")
            for _, key in ipairs({ "northwind-2048", "northwind-2048", "northwind-2049" }) do
                local response, request_err = http_client.post(gateway_url("/public/hooks/" .. webhook_id), {
                    headers = { ["Content-Type"] = "application/json", [consts.SECRET_HEADER] = "public-secret",
                        ["Idempotency-Key"] = key },
                    body = json.encode({ event = "ping" }),
                })
                test.is_nil(request_err, tostring(request_err))
                test.eq(response.status_code, 202, tostring(response.body))
            end
            test.eq(#event_rows(webhook_id), 2)
            test.eq(thread_event_count(webhook_id), 2)
        end)

        test.it("the public endpoint rejects a bad secret without dispatching", function()
            local webhook_id = uuid.v4()
            seed_public_ingress(webhook_id, "public-owner", "correct-secret")

            local response, request_err = http_client.post(gateway_url("/public/hooks/" .. webhook_id), {
                headers = {
                    ["Content-Type"] = "application/json",
                    [consts.SECRET_HEADER] = "wrong-secret",
                },
                body = json.encode({ event = "ping" }),
            })
            test.is_nil(request_err)
            test.not_nil(response)
            test.eq((response :: any).status_code, 401)

            local body, body_err = json.decode((response :: any).body or "")
            test.is_nil(body_err)
            test.eq((body :: any).error, "invalid secret")
            test.eq(#event_rows(webhook_id), 0)
        end)

        test.it("returns 404 for an unknown webhook", function()
            local status = ingress.process("nope", "s3cr3t", {}, { repo = make_repo(active_record("s3cr3t"), {}) })
            test.eq(status, 404)
        end)

        test.it("returns 404 for a revoked webhook (no existence leak)", function()
            local rec = active_record("s3cr3t")
            rec.status = consts.STATUS.REVOKED
            local status = ingress.process("wh-1", "s3cr3t", {}, { repo = make_repo(rec, {}) })
            test.eq(status, 404)
        end)

        test.it("returns 401 when the secret is missing", function()
            local status = ingress.process("wh-1", nil, {}, { repo = make_repo(active_record("s3cr3t"), {}) })
            test.eq(status, 401)
        end)

        test.it("returns 401 when the secret is wrong", function()
            local status = ingress.process("wh-1", "wrong", {}, { repo = make_repo(active_record("s3cr3t"), {}) })
            test.eq(status, 401)
        end)

        test.it("returns 400 when the body fails the schema", function()
            local appended = {}
            local rec = active_record("s3cr3t", { type = "object", required = { "event" }, properties = { event = { type = "string" } } })
            local status, body = ingress.process("wh-1", "s3cr3t", { wrong = 1 }, { repo = make_repo(rec, appended) })
            test.eq(status, 400)
            test.is_false(body.success)
            test.eq(#appended, 0)
        end)

        test.it("returns 400 when the body is not an object", function()
            local rec = active_record("s3cr3t")
            local status = ingress.process("wh-1", "s3cr3t", nil, { repo = make_repo(rec, {}) })
            test.eq(status, 400)
        end)

        test.it("fails closed when no webhook actor can be synthesized", function()
            local out, err = security_core.call_as_actor("", "kickside.webhooks:test_target", {})
            test.is_nil(out)
            test.contains(err, "webhook actor_id is required")
        end)
    end)

    -- The security-critical public read path against the real migrated table: seed a
    -- row directly (mint drives the component service, covered by e2e) and prove
    -- resolve returns the stored secret hash + decoded schema, and misses on unknown.

end

local run_cases = test.run_cases(define_tests)

local function repo_call(args: any)
    args = type(args) == "table" and args or {}
    if args.method == "list" then return repo.list() end
    if args.method == "mint" then
        local row, err = repo.mint({ label = args.label, schema = args.schema })
        return { row = row, error = err }
    end
    if args.method == "update" then
        local patch, decode_err = json.decode(tostring(args.patch_json or ""))
        if decode_err or type(patch) ~= "table" then return { error = "invalid patch fixture" } end
        local row, err = repo.update(args.webhook_id, patch)
        return { row = row, error = err }
    end
    if args.method == "delete" then
        local ok, err = repo.delete(args.webhook_id)
        return { ok = ok, error = err }
    end
    return nil, "unknown method"
end

local function run(options)
    return run_cases(options)
end

return { run = run, repo_call = repo_call }
