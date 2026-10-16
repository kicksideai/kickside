-- Persistence + lifecycle for webhooks. A webhook is a thread-backed component
-- (class kickside.webhooks) plus a side row holding its hashed secret and declared
-- input schema. mint reserves the row and creates the caller-owned thread at the same
-- preallocated id, compensating either failed half before it returns; resolve
-- recovers a webhook by id for the public endpoint (no actor needed, system db read);
-- append_event lands a validated payload on the thread AS the actor; list/revoke/delete
-- drive the management API. The secret is hashed at rest and returned once.

local sql = require("sql")
local hash = require("hash")
local crypto = require("crypto")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local contract = require("contract")
local security = require("security")
local component = require("component")
local component_read_port = require("component_read_port")
local component_query = require("component_query")
local implementation_access = require("implementation_access")
local consts = require("webhook_consts")
local webhook_types = require("webhook_types")
local webhook_security = require("webhook_security")

local M = {}

type Map = { [string]: any }

-- The canonical threads seam: the kickside.core:threads contract, never its private
-- *_method function-ids. Matches thread_bridge.lua and the rest of the core reads.
local THREADS_CONTRACT = "kickside.core:threads"
local COMPONENT_SERVICE_CONTRACT = "kickside.component:component_service"

local function generate_secret(): (string, string)
    local raw = consts.SECRET.PREFIX .. crypto.random.string(consts.SECRET.RANDOM_LEN)
    return raw, raw:sub(1, consts.SECRET.PREFIX_DISPLAY_LEN)
end

local function now_unix(): integer
    return time.now():unix() :: integer
end

local function db_open(): (any?, string?)
    local db, err = sql.get(webhook_types.db_id())
    if err or not db then return nil, "webhooks db unavailable: " .. tostring(err) end
    return db, nil
end

local function decode_schema(raw: any): Map
    if type(raw) ~= "string" or raw == "" then return {} end
    local decoded, derr = json.decode(raw)
    if derr or type(decoded) ~= "table" then return {} end
    return decoded :: Map
end

local function count_subscribers(db: any, webhook_id: string): (integer?, string?)
    local rows, q_err = sql.builder.select("COUNT(*) AS count")
        :from("kickside_projection")
        :where("thread_id = ?", webhook_id)
        :where("state != ?", "invalid")
        :run_with(db):query()
    if q_err then return nil, "webhook subscriber count failed: " .. tostring(q_err) end
    if not rows or #rows == 0 then return 0, nil end
    local n = tonumber((rows[1] :: any).count)
    if not n then return 0, nil end
    return math.floor(n) :: integer, nil
end

-- subscriber_count(webhook_id) -> (n, err). Active data-flow subscriptions bound to
-- the webhook's thread. A webhook backing >0 subscriptions is in use; the delete gate
-- reads this so removing it never silently strands a running flow.
function M.subscriber_count(webhook_id: any): (integer?, string?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return nil, "missing webhook id" end
    local db, db_err = db_open()
    if not db then return nil, db_err end
    local n, count_err = count_subscribers(db, webhook_id)
    db:release()
    if count_err then return nil, count_err end
    return n, nil
end

local function display_title(label: string?): string
    if type(label) == "string" and label ~= "" then return label end
    return "Webhook"
end

local function sync_component_meta(webhook_id: string, label: string?): string?
    local ok, err = component.set_meta(webhook_id, {
        title = display_title(label),
        icon = "tabler:webhook",
    })
    if not ok then return "webhook meta update failed: " .. tostring(err) end
    return nil
end

local function rollback_webhook_row(webhook_id: string): string?
    local db, db_err = db_open()
    if not db then return tostring(db_err) end
    local _, delete_err = sql.builder.delete(consts.TABLES.WEBHOOKS)
        :where("webhook_id = ?", webhook_id)
        :run_with(db):exec()
    db:release()
    if delete_err then return tostring(delete_err) end
    return nil
end

-- mint(args) -> ({ webhook_id, secret, secret_prefix, schema, label }, err). Reserves
-- the secret/schema row under a preallocated id, then creates the actor-owned thread
-- at that same id. A thread failure removes the reservation before returning.
-- args: { schema?: object, label?: string }.
function M.mint(args: any): (Map?, string?)
    args = type(args) == "table" and args or {}
    local actor = security.actor()
    if not actor then return nil, "no authenticated actor" end
    local actor_id = actor:id()
    if type(actor_id) ~= "string" or actor_id == "" then return nil, "invalid actor id" end

    local schema = type(args.schema) == "table" and (args.schema :: Map) or {}
    local label = type(args.label) == "string" and (args.label :: string) or ""

    local schema_json, schema_err = json.encode(schema)
    if schema_err or type(schema_json) ~= "string" then
        return nil, "webhook schema encode failed: " .. tostring(schema_err or "invalid schema")
    end

    local def, def_err = contract.get(THREADS_CONTRACT)
    if def_err or not def then return nil, "threads contract unavailable: " .. tostring(def_err) end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(security.scope()):open()
    if open_err or not inst then return nil, "threads open failed: " .. tostring(open_err) end

    local thread_id = uuid.v4()
    local raw, prefix = generate_secret()
    local ts = now_unix()
    local db, db_err = db_open()
    if not db then return nil, db_err end
    local _, ins_err = sql.builder.insert(consts.TABLES.WEBHOOKS)
        :set_map({
            webhook_id = thread_id,
            secret_hash = hash.sha256(raw),
            secret_prefix = prefix,
            actor_id = actor_id,
            schema_json = schema_json,
            label = label,
            status = consts.STATUS.ACTIVE,
            created_at = ts,
            updated_at = ts,
        })
        :run_with(db):exec()
    db:release()
    if ins_err then
        return nil, "webhook insert failed: " .. tostring(ins_err)
    end

    local res, terr = (inst :: any):upsert({
        thread_id = thread_id,
        impl_id = "kickside.webhooks:webhook_kind",
        thread_class = consts.THREAD_CLASS,
        title = display_title(label),
        icon = "tabler:webhook",
        attrs = { managed_by = "kickside.webhooks", role = "webhook", label = label, title = display_title(label) },
    })
    if terr or type(res) ~= "table" or tostring((res :: Map).thread_id or "") ~= thread_id then
        local rollback_err = rollback_webhook_row(thread_id)
        local create_err = terr and tostring(terr) or "thread create returned the wrong id"
        if rollback_err then
            return nil, "thread create failed: " .. create_err .. "; webhook row rollback failed: " .. rollback_err
        end
        return nil, "thread create failed: " .. create_err
    end

    return {
        webhook_id = thread_id,
        thread_id = thread_id,
        secret = raw,
        secret_prefix = prefix,
        actor_id = actor_id,
        schema = schema,
        label = label,
        status = consts.STATUS.ACTIVE,
        created_at = ts,
    }, nil
end

-- resolve(webhook_id) -> (record, err). The public endpoint's only reader. No actor:
-- this runs under the endpoint's system db policy. schema is decoded; secret_hash is
-- carried for verification and never returned to clients elsewhere.
function M.resolve(webhook_id: any): (Map?, string?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return nil, "missing webhook id" end
    local db, db_err = db_open()
    if not db then return nil, db_err end
    local rows, q_err = sql.builder.select(
        "webhook_id", "secret_hash", "actor_id", "schema_json", "status"
    )
        :from(consts.TABLES.WEBHOOKS)
        :where("webhook_id = ?", webhook_id)
        :limit(1)
        :run_with(db):query()
    if q_err then db:release(); return nil, "webhook lookup failed: " .. tostring(q_err) end
    if not rows or #rows == 0 then db:release(); return nil, "webhook not found" end
    local row: any = rows[1]
    db:release()

    local schema: any = decode_schema(row.schema_json)
    return {
        webhook_id = row.webhook_id,
        secret_hash = row.secret_hash,
        actor_id = row.actor_id,
        schema = schema,
        status = row.status,
    }, nil
end

function M.instance_schema(webhook_id: any): (Map?, any)
    if type(webhook_id) ~= "string" or webhook_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "missing webhook id", retryable = false })
    end
    local _, access_err = component.validate_access(webhook_id, component.ACCESS.READ)
    if access_err then return nil, access_err end
    local record, err = M.resolve(webhook_id)
    if err or not record then return nil, err end
    return record.schema :: Map, nil
end

-- touch_last_used(webhook_id) -> (). Best-effort last-used stamp for the ingress
-- accept path; a blind UPDATE that never fails the request (mirrors
-- kickside.mcp's credential record_usage).
function M.touch_last_used(webhook_id: any): ()
    if type(webhook_id) ~= "string" or webhook_id == "" then return end
    local db, db_err = db_open()
    if not db then return end
    sql.builder.update(consts.TABLES.WEBHOOKS)
        :set("last_used_at", now_unix())
        :where("webhook_id = ?", webhook_id)
        :run_with(db):exec()
    db:release()
end

-- append_event(record, payload) -> (ok, err). Lands the validated payload on the
-- webhook's thread AS its actor. Runs from the public endpoint with no session, so it
-- synthesizes the actor + a control-plane-denied scope.
function M.append_event(record: any, payload: any, idempotency_key: string?): (boolean, any)
    local r = type(record) == "table" and (record :: Map) or {}
    local thread_id = tostring(r.webhook_id or "")
    local actor_id = tostring(r.actor_id or "")
    if thread_id == "" or actor_id == "" then return false, "webhook record incomplete" end

    local event: Map = {
        type = consts.EVENT.INBOUND,
        role = "user",
        body = payload,
        content = { content_type = "application/json", content_mode = "inline" },
    }
    if type(idempotency_key) == "string" and idempotency_key ~= "" then
        event.external = {
            external_source = "webhook", external_id = idempotency_key, external_version = "1",
        }
    end
    local res, call_err = webhook_security.dispatch_append_as_actor(actor_id, {
        thread_id = thread_id,
        event = event,
    })
    if call_err then return false, call_err end
    if type(res) ~= "table" then return false, "webhook append returned no result" end
    if (res :: Map).success ~= true then return false, tostring((res :: Map).error or "append failed") end
    return true, nil
end

-- list({ limit?, cursor? }) -> (rows, err, next_cursor). Access and the exclusive
-- (created_at, webhook_id) cursor apply before the SQL page bound.
function M.list(options: any?): ({ Map }?, error?, string?)
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local args = options or {}
    if type(args) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "list options must be an object" })
    end
    local limit = args.limit == nil and 25 or tonumber(args.limit)
    if not limit or limit ~= limit or limit < 1 or limit == math.huge then
        return nil, errors.new({ kind = errors.INVALID, message = "limit must be positive" })
    end
    limit = math.min(100, math.floor(limit))
    local cursor: Map? = nil
    if args.cursor ~= nil and args.cursor ~= "" then
        if type(args.cursor) ~= "string" then
            return nil, errors.new({ kind = errors.INVALID, message = "invalid webhook cursor" })
        end
        local decoded, decode_err = json.decode(args.cursor)
        if decode_err or type(decoded) ~= "table" or type(decoded.created_at) ~= "number"
            or decoded.created_at ~= math.floor(decoded.created_at) or type(decoded.webhook_id) ~= "string"
            or decoded.webhook_id == "" then
            return nil, errors.new({ kind = errors.INVALID, message = "invalid webhook cursor" })
        end
        cursor = decoded
    end

    local reader, reader_err = component_read_port.build({ access_mask = component.ACCESS.READ })
    if reader_err then return nil, reader_err end
    local join = consts.TABLES.WEBHOOKS .. " w ON w.webhook_id = CAST(c.component_id AS TEXT)"
    local query = component_query.filtered_query(reader, {
        "w.webhook_id", "w.secret_prefix", "w.label", "w.status", "w.schema_json", "w.created_at", "w.updated_at", "w.last_used_at",
    }):inner_join(join)
    local candidates = component_query.implementation_candidates(reader):inner_join(join)
    local db, db_err = db_open()
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(db_err) }) end
    local narrowed, narrow_err = implementation_access.narrow(db, query, candidates)
    if narrow_err then db:release(); return nil, narrow_err end
    query = narrowed
    if cursor then
        query = query:where("(w.created_at < ? OR (w.created_at = ? AND w.webhook_id < ?))",
            cursor.created_at, cursor.created_at, cursor.webhook_id)
    end
    local rows, q_err = query:order_by("w.created_at DESC, w.webhook_id DESC"):limit(limit + 1):run_with(db):query()
    if q_err then db:release(); return nil, errors.new({ kind = errors.INTERNAL, message = "webhook list failed: " .. tostring(q_err) }) end
    rows = rows or {}
    local next_cursor: string? = nil
    if #rows > limit then
        table.remove(rows)
        local last = rows[#rows]
        local encoded, encode_err = json.encode({ created_at = tonumber(last.created_at), webhook_id = last.webhook_id })
        if encode_err then db:release(); return nil, encode_err end
        next_cursor = encoded
    end
    local ids, marks = {}, {}
    for _, row in ipairs(rows) do
        ids[#ids + 1] = tostring(row.webhook_id)
        marks[#marks + 1] = "?"
    end
    local visible: { [string]: boolean } = {}
    local counts: { [string]: integer } = {}
    if #ids > 0 then
        -- Retain the contract's authority check with page-bounded component IDs.
        local components, access_err = component.query({ component_ids = ids, access_mask = component.ACCESS.READ, limit = #ids })
        if access_err then db:release(); return nil, access_err end
        for _, item in ipairs(components or {}) do visible[item.component_id] = true end
        local subscribers, sub_err = sql.builder.select("thread_id", "COUNT(*) AS count")
            :from("kickside_projection"):where("thread_id IN (" .. table.concat(marks, ",") .. ")", unpack(ids))
            :where("state != ?", "invalid"):group_by("thread_id"):run_with(db):query()
        if sub_err then db:release(); return nil, errors.new({ kind = errors.INTERNAL, message = "webhook subscriber count failed: " .. tostring(sub_err) }) end
        for _, row in ipairs(subscribers or {}) do
            local count = tonumber(row.count)
            if not count then
                db:release()
                return nil, errors.new({ kind = errors.INTERNAL, message = "invalid webhook subscriber count" })
            end
            counts[row.thread_id] = math.floor(count)
        end
    end
    local out: { Map } = {}
    for _, row in ipairs(rows) do
        if visible[row.webhook_id] then
            row.schema = decode_schema(row.schema_json)
            row.schema_json = nil
            row.subscriber_count = counts[row.webhook_id] or 0
            out[#out + 1] = row
        end
    end
    db:release()
    return out, nil, next_cursor
end

-- update(webhook_id, patch) -> (record, err). Management API update for fields
-- users can change after minting: label and validation schema. Secrets stay immutable.
function M.update(webhook_id: any, patch: any): (Map?, error?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "missing webhook id" }) end
    local actor = security.actor()
    if not actor then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local _, access_err = component.validate_access(webhook_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local p = type(patch) == "table" and (patch :: Map) or {}
    local label = type(p.label) == "string" and (p.label :: string) or nil
    local has_schema = type(p.schema) == "table"
    if label == nil and not has_schema then return nil, errors.new({ kind = errors.INVALID, message = "nothing to update" }) end

    local schema_json: string? = nil
    if has_schema then
        local encoded, encode_err = json.encode(p.schema)
        if encode_err or type(encoded) ~= "string" then
            return nil, errors.new({ kind = errors.INVALID, message = "webhook schema encode failed: " .. tostring(encode_err or "invalid schema") })
        end
        schema_json = encoded
    end

    local db, db_err = db_open()
    if not db then return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(db_err) }) end
    local ts = now_unix()
    local existing_rows, existing_err = sql.builder.select(
        "webhook_id", "secret_hash", "secret_prefix", "actor_id", "schema_json", "label", "status", "created_at", "updated_at", "last_used_at"
    )
        :from(consts.TABLES.WEBHOOKS)
        :where("webhook_id = ?", webhook_id)
        :limit(1)
        :run_with(db):query()
    if existing_err then db:release(); return nil, errors.new({ kind = errors.INTERNAL, message = "webhook update lookup failed: " .. tostring(existing_err) }) end
    local existing: Map? = existing_rows and existing_rows[1] and (existing_rows[1] :: Map) or nil
    if not existing then db:release(); return nil, errors.new({ kind = errors.NOT_FOUND, message = "webhook not found" }) end

    local subscribers, sub_err = count_subscribers(db, webhook_id)
    if sub_err then db:release(); return nil, errors.new({ kind = errors.INTERNAL, message = tostring(sub_err) }) end
    db:release()

    local old_label = tostring(existing.label or "")
    local next_label = label ~= nil and label or old_label
    local meta_changed = label ~= nil and next_label ~= old_label
    if meta_changed then
        local meta_err = sync_component_meta(webhook_id, next_label)
        if meta_err then return nil, errors.new({ kind = errors.INTERNAL, message = meta_err }) end
    end

    local write_db, write_db_err = db_open()
    if not write_db then
        if meta_changed then
            local restore_err = sync_component_meta(webhook_id, old_label)
            if restore_err then
                return nil, errors.new({ kind = errors.INTERNAL, message = tostring(write_db_err) .. "; component metadata rollback failed: " .. restore_err })
            end
        end
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(write_db_err) })
    end

    local function fail_after_meta(message: string): (nil, error)
        write_db:release()
        if meta_changed then
            local restore_err = sync_component_meta(webhook_id, old_label)
            if restore_err then
                return nil, errors.new({ kind = errors.INTERNAL, message = message .. "; component metadata rollback failed: " .. restore_err })
            end
        end
        return nil, errors.new({ kind = errors.INTERNAL, message = message })
    end

    local tx, tx_err = write_db:begin()
    if tx_err or not tx then
        return fail_after_meta("webhook update transaction failed: " .. tostring(tx_err))
    end

    local update = sql.builder.update(consts.TABLES.WEBHOOKS)
        :set("updated_at", ts)
        :where("webhook_id = ?", webhook_id)
    if label ~= nil then update = update:set("label", next_label) end
    if schema_json ~= nil then update = update:set("schema_json", schema_json) end
    local update_result, update_err = update:run_with(tx):exec()
    if update_err then
        tx:rollback()
        return fail_after_meta("webhook update failed: " .. tostring(update_err))
    end
    if not update_result or tonumber((update_result :: any).rows_affected) ~= 1 then
        tx:rollback()
        return fail_after_meta("webhook update lost ownership or target disappeared")
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        return fail_after_meta("webhook update commit failed: " .. tostring(commit_err))
    end

    local row: Map = {
        webhook_id = existing.webhook_id,
        secret_prefix = existing.secret_prefix,
        label = next_label,
        status = existing.status,
        schema_json = schema_json or existing.schema_json,
        created_at = existing.created_at,
        updated_at = ts,
        last_used_at = existing.last_used_at,
    }
    row.schema = decode_schema(row.schema_json)
    row.schema_json = nil
    row.subscriber_count = subscribers
    write_db:release()
    return row, nil
end

-- revoke(webhook_id) -> (ok, err). A status flip, actor-scoped. The thread component
-- is removed separately via the component delete path.
function M.revoke(webhook_id: any): (boolean, error?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return false, errors.new({ kind = errors.INVALID, message = "missing webhook id" }) end
    local actor = security.actor()
    if not actor then return false, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local _, access_err = component.validate_access(webhook_id, component.ACCESS.WRITE)
    if access_err then return false, access_err end
    local db, db_err = db_open()
    if not db then return false, errors.new({ kind = errors.UNAVAILABLE, message = tostring(db_err) }) end
    local result, u_err = sql.builder.update(consts.TABLES.WEBHOOKS)
        :set("status", consts.STATUS.REVOKED)
        :set("updated_at", now_unix())
        :where("webhook_id = ?", webhook_id)
        :run_with(db):exec()
    db:release()
    if u_err then return false, errors.new({ kind = errors.INTERNAL, message = "webhook revoke failed: " .. tostring(u_err) }) end
    if not result or tonumber(result.rows_affected) ~= 1 then
        return false, errors.new({ kind = errors.NOT_FOUND, message = "webhook not found" })
    end
    return true, nil
end

function M.delete_row(webhook_id: any): (boolean, string?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return false, "missing webhook id" end
    local db, db_err = db_open()
    if not db then return false, db_err end
    local _, del_err = sql.builder.delete(consts.TABLES.WEBHOOKS)
        :where("webhook_id = ?", webhook_id)
        :run_with(db):exec()
    db:release()
    if del_err then return false, "webhook row delete failed: " .. tostring(del_err) end
    return true, nil
end

-- delete(webhook_id) -> (ok, err). The request path delegates to the component
-- service so DELETE access, deletable cleanup, thread purge, and unregister all run
-- through the canonical component teardown.
function M.delete(webhook_id: any): (boolean, error?)
    if type(webhook_id) ~= "string" or webhook_id == "" then return false, errors.new({ kind = errors.INVALID, message = "missing webhook id" }) end
    local actor = security.actor()
    if not actor then return false, errors.new({ kind = errors.PERMISSION_DENIED, message = "no authenticated actor" }) end
    local _, access_err = component.validate_access(webhook_id, component.ACCESS.DELETE)
    if access_err then return false, access_err end
    local subscribers, sub_err = M.subscriber_count(webhook_id)
    if sub_err then return false, errors.new({ kind = errors.INTERNAL, message = tostring(sub_err) }) end
    if subscribers and subscribers > 0 then
        return false, errors.new({ kind = errors.CONFLICT, message = "webhook is in use by " .. tostring(subscribers) ..
            " data flow" .. (subscribers == 1 and "" or "s") .. "; remove those subscriptions first",
            details = { code = "webhook_in_use", subscriber_count = subscribers } })
    end
    local def, def_err = contract.get(COMPONENT_SERVICE_CONTRACT)
    if def_err or not def then return false, errors.new({ kind = errors.UNAVAILABLE, message = "component contract unavailable: " .. tostring(def_err) }) end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(security.scope()):open()
    if open_err or not inst then return false, errors.new({ kind = errors.INTERNAL, message = "component open failed: " .. tostring(open_err) }) end
    local res, del_err = (inst :: any):delete({ component_id = webhook_id })
    if del_err then return false, del_err end
    if type(res) ~= "table" or (res :: Map).success ~= true then
        return false, errors.new({ kind = errors.INTERNAL, message = tostring(type(res) == "table" and (res :: Map).error or "component delete failed") })
    end
    return true, nil
end

return M
