local base = require("base")
local component = require("component")
local funcs = require("funcs")
local automation = require("automation")

local round_write = require("round_write")
local capacity_http = require("capacity_http")
local sql = require("sql")

local M = {}

function M.run(args: any): (any?, error?)
    if args.operation == "metadata" then
        return component.set_meta(args.component_id, { ["kickside.connection.capacity.retry_at_ms"] = args.value })
    end
    if args.operation == "source" or args.operation == "keys" then
        return funcs.call("kickside.automation:round_acquire", {
            source_kind = args.operation == "keys" and "reconcile" or "collection",
            source_ref = "app:capacity_source_port", pull_keys = "app:capacity_keys",
            config = { connection_id = args.component_id, limited = args.limited, retry_at_ms = args.retry_at_ms },
            limit = 1,
        })
    end
    if args.operation == "round_sink" then
        return round_write.write({ binding = "app:capacity_sink_binding", delivery = "at_most_once" },
            { config = { connection_id = args.component_id }, sink_op = "upsert", input = {},
                identity_key = "capacity-item", idempotency_key = "capacity-delivery" },
            { automation_id = args.component_id, drive_key = "main", ledger_port = "capacity", fence = {} },
            { item_key = "capacity-item", dedup_key = "capacity-delivery" })
    end
    if args.operation == "sink" then
        local config = { connection_id = args.component_id, limited = args.limited, retry_at_ms = args.retry_at_ms }
        local writer, open_err = automation.open_sink_writer("app:capacity_sink_binding", config)
        if open_err then return nil, open_err end
        local result, _, envelope = writer:write({ config = config, input = {} })
        if envelope then return { success = false, error = envelope }, nil end
        return result, nil
    end
    if args.operation == "http_selector" then
        local request = capacity_http.wrap(function()
            local db = assert(sql.get("app:db"))
            local _, err = db:execute("INSERT INTO connection_capacity_calls (connection_id,method) VALUES ($1,'selector')", {args.component_id})
            db:release()
            if err then return nil, err end
            return {success = true}
        end, function(connection) return connection.identity, nil end)
        return request({identity = args.component_id})
    end
    local owner = (base :: any).capacity({ now_ms = function() return args.now_ms end })
    if args.operation == "http" then
        return capacity_http.new({owner = owner, now_ms = function() return args.now_ms end}).invoke(args.component_id, function()
            local db, db_err = sql.get("app:db")
            if db_err then return nil, db_err end
            local _, write_err = db:execute("INSERT INTO connection_capacity_calls (connection_id,method) VALUES ($1,'http')", {args.component_id})
            db:release()
            if write_err then return nil, write_err end
            if args.limited then return {success = false, status_code = args.status_code or 429, error_kind = args.error_kind, error = "paced", retry_after_ms = args.retry_after_ms} end
            return {success = true}
        end)
    end
    if args.operation == "check" then return owner.check(args.component_id) end
    if args.operation == "floor" then return owner.floor(args.component_id) end
    if args.operation == "credentials" then
        return component.update(args.component_id, {
            { type = "SET_CONTEXT", payload = { private_context = { token = "replacement" } } },
        })
    end
    return owner.record(args.component_id, errors.new({
        kind = args.kind or errors.RATE_LIMITED, retryable = true, message = "provider capacity",
        details = { code = "provider_capacity", scope = args.scope or "capacity",
            retry_at_ms = args.retry_at_ms, retry_after_ms = args.retry_after_ms },
    }))
end

return M
