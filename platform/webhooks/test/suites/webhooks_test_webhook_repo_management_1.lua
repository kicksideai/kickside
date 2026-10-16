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


    -- The security-critical public read path against the real migrated table: seed a
    -- row directly (mint drives the component service, covered by e2e) and prove
    -- resolve returns the stored secret hash + decoded schema, and misses on unknown.

    test.describe("webhook repo management", function()
        local id = uuid.v4()
        local actor_id = "owner-1"

        local function seed(include_component: boolean?)
            local d, derr = sql.get("app:db")
            if derr or not d then error("db: " .. tostring(derr)) end
            d:execute("DELETE FROM kickside_projection WHERE thread_id = $1", { id })
            d:execute("DELETE FROM " .. consts.TABLES.WEBHOOKS .. " WHERE webhook_id = $1", { id })
            d:execute("DELETE FROM kickside_thread WHERE id = $1", { id })
            d:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { id })
            d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { id })
            d:execute("DELETE FROM kickside_components WHERE component_id = $1", { id })
            local ts = time.now():unix()
            if include_component ~= false then
                local _, cerr = sql.builder.insert("kickside_components")
                    :set_map({
                        component_id = id,
                        impl_id = "kickside.core:thread",
                        private_context = "{}",
                        path = component_path(d, id),
                    })
                    :run_with(d):exec()
                if cerr then d:release(); error("component seed failed: " .. tostring(cerr)) end
                local _, aerr = sql.builder.insert("kickside_component_access")
                    :set_map({
                        access_id = uuid.v4(),
                        subject_id = actor_id,
                        subject_type = "user",
                        component_id = id,
                        source_component_id = id,
                        access_mask = 15,
                        inherited = 0,
                    })
                    :run_with(d):exec()
                if aerr then d:release(); error("access seed failed: " .. tostring(aerr)) end
                for key, value in pairs({ title = "seed", icon = "tabler:webhook" }) do
                    local _, merr = sql.builder.insert("kickside_component_meta")
                        :set_map({
                            meta_id = uuid.v4(),
                            component_id = id,
                            key = key,
                            value = value,
                        })
                        :run_with(d):exec()
                    if merr then d:release(); error("component meta seed failed: " .. tostring(merr)) end
                end
            end
            local _, terr = sql.builder.insert("kickside_thread")
                :set_map({
                    id = id,
                    thread_class = consts.THREAD_CLASS,
                    attrs = "{}",
                    component_id = id,
                })
                :run_with(d):exec()
            if terr then d:release(); error("thread seed failed: " .. tostring(terr)) end
            local _, werr = sql.builder.insert(consts.TABLES.WEBHOOKS)
                :set_map({
                    webhook_id = id,
                    secret_hash = hash.sha256("topsecret"),
                    secret_prefix = "kshook_prefix",
                    actor_id = actor_id,
                    schema_json = json.encode({ type = "object", properties = { old = { type = "string" } } }),
                    label = "seed",
                    status = consts.STATUS.ACTIVE,
                    created_at = ts,
                    updated_at = ts,
                })
                :run_with(d):exec()
            if werr then d:release(); error("webhook seed failed: " .. tostring(werr)) end
            local _, perr = sql.builder.insert("kickside_projection")
                :set_map({
                    id = uuid.v4(),
                    thread_id = id,
                    kind = "kickside.automation.poller",
                    projection_key = "subscriber",
                    body = "{}",
                    state = "valid",
                    last_event_seq = 0,
                })
                :run_with(d):exec()
            d:release()
            if perr then error("projection seed failed: " .. tostring(perr)) end
        end

        test.it("lists decoded schemas, subscriber counts, and no secret", function()
            seed()
            local out, err = call_repo_as(actor_id, { method = "list" })
            test.is_nil(err)
            test.not_nil(out)
            local rows: any = out
            test.eq(#rows, 1)
            test.eq(rows[1].webhook_id, id)
            test.eq(rows[1].schema.properties.old.type, "string")
            test.eq(rows[1].subscriber_count, 1)
            test.is_nil(rows[1].secret_hash)
        end)

        test.it("does not list a stale side row without a backing component", function()
            seed(false)
            local out, err = call_repo_as(actor_id, { method = "list" })
            test.is_nil(err)
            test.not_nil(out)
            local rows: any = out
            test.eq(#rows, 0)
        end)

        test.it("lists a webhook for a granted reader and hides it after revocation", function()
            seed()
            local d, derr = sql.get("app:db")
            if derr or not d then error("db: " .. tostring(derr)) end
            local _, grant_err = sql.builder.insert("kickside_component_access")
                :set_map({ access_id = uuid.v4(), subject_id = "shared-reader", subject_type = "user",
                    component_id = id, source_component_id = id, access_mask = 1, inherited = 0 })
                :run_with(d):exec()
            d:release()
            if grant_err then error("grant: " .. tostring(grant_err)) end
            local rows, read_err = call_repo_as("shared-reader", { method = "list" })
            test.is_nil(read_err)
            test.eq(#rows, 1)
            test.eq(rows[1].webhook_id, id)
            test.is_nil(rows[1].secret_hash)
            test.is_nil(rows[1].secret)
            d, derr = sql.get("app:db")
            if derr or not d then error("db: " .. tostring(derr)) end
            local _, revoke_err = sql.builder.delete("kickside_component_access")
                :where("component_id = ?", id):where("subject_id = ?", "shared-reader"):run_with(d):exec()
            d:release()
            if revoke_err then error("revoke: " .. tostring(revoke_err)) end
            rows, read_err = call_repo_as("shared-reader", { method = "list" })
            test.is_nil(read_err)
            test.eq(#rows, 0)
        end)

        test.it("allows a granted writer to update a webhook schema and rejects a reader", function()
            seed()
            local d, derr = sql.get("app:db")
            if derr or not d then error("db: " .. tostring(derr)) end
            for subject, mask in pairs({ ["shared-writer"] = 3, ["shared-reader"] = 1 }) do
                local _, grant_err = sql.builder.insert("kickside_component_access")
                    :set_map({ access_id = uuid.v4(), subject_id = subject, subject_type = "user",
                        component_id = id, source_component_id = id, access_mask = mask, inherited = 0 })
                    :run_with(d):exec()
                if grant_err then d:release(); error("grant: " .. tostring(grant_err)) end
            end
            d:release()
            local out, call_err = call_update_repo_as("shared-writer", id, { schema = { type = "object", required = { "marker" } } })
            test.is_nil(call_err)
            test.is_nil(out.error)
            test.eq(out.row.schema.required[1], "marker")
            test.eq(webhook_row(id).actor_id, actor_id)
            out, call_err = call_update_repo_as("shared-reader", id, { schema = { type = "string" } })
            test.is_nil(call_err)
            test.is_nil(out.row)
            test.not_nil(out.error)
            test.eq(out.error_kind, errors.PERMISSION_DENIED)
            local refused, revoke_err = call_repo_as("shared-reader", { method = "revoke", webhook_id = id })
            test.is_nil(revoke_err)
            test.is_false(refused.ok)
            test.is_true(refused.denied)
            refused, revoke_err = call_repo_as("shared-reader", { method = "delete", webhook_id = id })
            test.is_nil(revoke_err)
            test.is_false(refused.ok)
            test.is_true(refused.denied)
            test.eq((json.decode(webhook_row(id).schema_json) :: any).type, "object")
        end)

        test.it("returns typed invalid errors for management ids", function()
            local _, update_err = repo.update("", {})
            test.is_true(errors.is(update_err, errors.INVALID))
            local _, revoke_err = repo.revoke("")
            test.is_true(errors.is(revoke_err, errors.INVALID))
            local _, delete_err = repo.delete("")
            test.is_true(errors.is(delete_err, errors.INVALID))
        end)

        test.it("counts the active data-flow subscribers backing a webhook", function()
            seed()
            local n, err = repo.subscriber_count(id)
            test.is_nil(err)
            test.eq(n, 1)
        end)










    end)
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
        if err then assert(errors.is(err, errors.PERMISSION_DENIED), "update returns an untyped access error") end
        return { row = row, error = err, error_kind = err and errors.PERMISSION_DENIED or nil }
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
