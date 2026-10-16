-- Native Data Sync Automation on the round (design v5 §3.2, §4, A22, A33).
-- The sync declares; the automation runtime drives:
--
--   install      -- validates the declaration and answers the main drive's
--                   source: an events port is an event source on its source
--                   thread from its history boundary (backfill all or none),
--                   a collection port a collection source with its pull config
--                   (the source config, its connection and the frozen
--                   backfill_since), its poll schedule, the declaration's round
--                   and delivery overrides and, when declared, its reconcile
--                   over the source's pull_keys. A sync installed disabled
--                   starts paused.
--   reconfigure  -- carries the new declaration and main source through the
--                   automation's declaration command, then follows the
--                   declared enabled state with the generic pause or resume.
--
-- Items are delivered by the sync's round consumer (round/consumer.lua).
-- Pause, resume, resync, replay and status are the engine's generic controls.

local production_automations = require("automations_lib")
local destination_map = require("destination_map")
local round_plan = require("round_plan")
local transform_gate = require("transform_gate")
local ctx = require("ctx")
local errors = require("errors")
local time = require("time")

local function construct(dependencies: any): any
local automations_lib = dependencies.automations_lib
local M = {}

type Map = { [string]: any }

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function copy(value: any): Map
    local out: Map = {}
    for k, v in pairs(type(value) == "table" and (value :: Map) or {}) do out[k] = v end
    return out
end

local function invalid(message: string, field: string?): error
    return (errors.new({ kind = errors.INVALID, message = message, retryable = false,
        details = { error_kind = "declaration", code = "sync_declaration_invalid", field = field } }) :: error)
end

-- normalize_input(input) -> the sync's product state: title, source (port,
-- config, connection_id?, thread_id?), sink (port, config), transform,
-- output_schema, enabled and whether it reconciles.
local function normalize_input(input: any): (Map?, error?)
    local i = (type(input) == "table" and input or {}) :: Map
    if type(i.trigger) ~= "table" then return nil, invalid("trigger is required", "trigger") end
    local trigger = i.trigger :: Map
    local source_port = trim(trigger.source)
    if source_port == "" then return nil, invalid("a data sync requires trigger.source", "trigger.source") end
    local sink_port = trim(i.sink_port)
    if sink_port == "" then return nil, invalid("sink_port is required", "sink_port") end
    local trigger_config = type(trigger.config) == "table" and (trigger.config :: Map) or {}
    local source: Map = { port = source_port, config = {} }
    for k, v in pairs(trigger_config) do
        if k ~= "connection_id" and k ~= "thread_id" then (source.config :: Map)[k] = v end
    end
    if trim(trigger_config.connection_id) ~= "" then source.connection_id = trim(trigger_config.connection_id) end
    if trim(trigger_config.thread_id) ~= "" then source.thread_id = trim(trigger_config.thread_id) end
    if type(i.transform) ~= "table" then return nil, invalid("transform is required", "transform") end
    if trim((i.transform :: Map).kind) == "" then return nil, invalid("transform.kind is required", "transform.kind") end
    if type(i.enabled) ~= "boolean" then return nil, invalid("enabled is required", "enabled") end
    if i.reconcile ~= nil and i.reconcile ~= true then return nil, invalid("reconcile must be true when deletion reconciliation is enabled", "reconcile") end
    return {
        title = trim(i.title) ~= "" and i.title or "Data Sync",
        source = source,
        sink = { port = sink_port, config = type(i.sink_config) == "table" and i.sink_config or {} },
        transform = i.transform,
        output_schema = type(i.output_schema) == "table" and i.output_schema or nil,
        enabled = i.enabled,
        reconcile = i.reconcile == true,
    }, nil
end

M.passthrough_gap = destination_map.passthrough_gap

local CADENCE_UNITS: { [string]: { string } } = {
    s = { "sec", "sec" },
    m = { "min", "min" },
    h = { "hour", "hours" },
    d = { "day", "days" },
}

-- when_label(trigger, source_title) -> the user-facing reading of a declared
-- trigger: an events source reads as what it waits for ("On upload completed"),
-- a cadence in words ("Every 15 min").
function M.when_label(trigger: any, source_title: string): string
    local spec = type(trigger) == "table" and (trigger :: Map) or {}
    local schedule = type(spec.schedule) == "table" and (spec.schedule :: Map) or nil
    if schedule == nil then return "On " .. string.lower(trim(source_title)) end
    local expression = trim(schedule.expression)
    if schedule.type == "cron" then return "On schedule (" .. expression .. ")" end
    local amount, unit = expression:match("^(%d+)([smhd])$")
    local names = unit and CADENCE_UNITS[unit] or nil
    if not amount or not names then return "Every " .. expression end
    return "Every " .. amount .. " " .. (tonumber(amount) == 1 and names[1] or names[2])
end

-- backfill_since(backfill, now) -> the boundary a collection source is pulled
-- from: "none" is everything from now on, since / last_days one instant, "all"
-- unbounded history (nil).
local function backfill_since(backfill: any, now: any): (string?, error?)
    if backfill == "all" then return nil, nil end
    if backfill == "none" then return (now :: any):utc():format(time.RFC3339), nil end
    if type(backfill) == "table" then
        local bf = backfill :: Map
        if trim(bf.since) ~= "" then return trim(bf.since), nil end
        local days = tonumber(bf.last_days)
        if days and days > 0 and days == math.floor(days) then
            return time.unix((now :: any):unix() - math.floor(days) * 86400, 0):utc():format(time.RFC3339), nil
        end
    end
    return nil, invalid("a collection source requires backfill all, none, { since } or { last_days }", "trigger.backfill")
end

-- source_thread(endpoint, thread_id) -> the thread an events source reads: the
-- selected one, or the installing actor's one instance of a picker-less
-- per-user source.
local function source_thread(endpoint: Map, thread_id: string?): (string?, error?)
    if thread_id and thread_id ~= "" then return thread_id, nil end
    for _, field in pairs(type(endpoint.config_schema) == "table" and (endpoint.config_schema :: Map) or {}) do
        local picker = type(field) == "table" and (field :: Map).picker or nil
        if type(picker) == "string" and picker ~= "" and picker ~= "wc-schema-form" then
            return nil, invalid("the events source " .. tostring(endpoint.id) .. " requires a selected thread_id", "trigger.config.thread_id")
        end
    end
    local resolved, err = automations_lib.component_id_for_actor(trim(endpoint.class))
    if err then return nil, (errors.wrap(err, "the events source " .. tostring(endpoint.id) .. " has no instance") :: error) end
    if not resolved or trim(resolved) == "" then
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "the events source " .. tostring(endpoint.id) .. " has no instance",
            details = {code = "source_identity_missing", field = "trigger.config.thread_id"}}) :: error)
    end
    return trim(resolved), nil
end

-- main_source(endpoint, trigger, state, now) -> the main drive source (A22).
local function main_source(endpoint: Map, trigger: Map, state: Map, now: any): (Map?, error?)
    local port = tostring(endpoint.id or "")
    local round, delivery = automations_lib.trigger_overrides(trigger)
    local source: Map
    if endpoint.surface == "events" then
        if trigger.schedule ~= nil then return nil, invalid("the events source " .. port .. " runs on each event; schedule does not apply", "trigger.schedule") end
        if trigger.backfill ~= "all" and trigger.backfill ~= "none" then
            return nil, invalid("the events source " .. port .. " requires backfill all (its history) or none (only new)", "trigger.backfill")
        end
        local thread_id, thread_err = source_thread(endpoint, (state.source :: Map).thread_id)
        if thread_err then return nil, thread_err end
        source = { source_kind = "event", source_ref = port, source_thread_id = thread_id,
            start = trigger.backfill == "all" and "all" or "new", event_type = endpoint.event }
    elseif endpoint.surface == "collection" then
        local schedule = type(trigger.schedule) == "table" and (trigger.schedule :: Map) or nil
        if not schedule then return nil, invalid("the collection source " .. port .. " requires schedule.type and schedule.expression", "trigger.schedule") end
        local since, since_err = backfill_since(trigger.backfill, now)
        if since_err then return nil, since_err end
        local config = copy((state.source :: Map).config)
        if (state.source :: Map).connection_id then config.connection_id = (state.source :: Map).connection_id end
        if since then config.backfill_since = since end
        source = { source_kind = "collection", source_ref = port, config = config,
            schedule = { type = schedule.type, expression = schedule.expression } }
        if state.reconcile then
            local reconcile = type(endpoint.reconcile) == "table" and (endpoint.reconcile :: Map) or {}
            source.reconcile = { pull_keys = reconcile.pull_keys }
        end
    else
        return nil, invalid("source port " .. port .. " is neither an events nor a collection port", "trigger.source")
    end
    if round then source.round = round end
    if delivery then source.delivery = delivery end
    return source, nil
end

-- plan(input) -> { state, source, source_endpoint } for a declaration, or its
-- refusal.
local function plan(input: Map): (Map?, error?)
    local state, normalize_err = normalize_input(input)
    if normalize_err then return nil, normalize_err end
    local s = state :: Map
    local endpoint, eerr = automations_lib.resolve_source(tostring((s.source :: Map).port))
    if eerr then return nil, (errors.wrap(eerr, "source resolve") :: error) end
    if not endpoint then return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
        message = "source resolution returns no endpoint", details = {code = "sync_endpoint_missing", field = "trigger.source"}}) :: error) end
    local sink_endpoint, serr = automations_lib.resolve_sink(tostring((s.sink :: Map).port))
    if serr then return nil, (errors.wrap(serr, "sink resolve") :: error) end
    if not sink_endpoint then return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
        message = "sink resolution returns no endpoint", details = {code = "sync_endpoint_missing", field = "sink_port"}}) :: error) end
    local source, source_err = main_source(endpoint :: Map, input.trigger :: Map, s, time.now())
    if source_err then return nil, source_err end
    local schema_config = copy((s.source :: Map).config)
    if source.source_thread_id then schema_config.thread_id = source.source_thread_id end
    local source_schema, schema_err = automations_lib.source_schema(tostring(endpoint.id), schema_config)
    if schema_err then return nil, schema_err end
    local selected_endpoint = copy(endpoint)
    selected_endpoint.output_schema = source_schema
    local gap = destination_map.passthrough_gap(selected_endpoint, sink_endpoint, s.transform, (s.sink :: Map).config)
    if gap then return nil, invalid(gap) end
    local valid, failures = transform_gate.validate_install(s.transform, source_schema, sink_endpoint.input_schema,
        { input_shape = sink_endpoint.input_shape, configured_content = (s.sink :: Map).config.content })
    if not valid then return nil, invalid("binding mapping output: " .. table.concat(failures, "; ")) end
    local _, references_err = round_plan.references(s.transform :: Map)
    if references_err then return nil, references_err end
    if s.reconcile then
        if (endpoint :: Map).surface ~= "collection" then return nil, invalid("reconcile requires a poll source") end
        local reconcile = type((endpoint :: Map).reconcile) == "table" and ((endpoint :: Map).reconcile :: Map) or {}
        if trim(reconcile.pull_keys) == "" then return nil, invalid("source does not declare reconcile pull_keys") end
        local operations = type((sink_endpoint :: Map).operations) == "table" and ((sink_endpoint :: Map).operations :: Map) or {}
        if operations.delete == nil then return nil, invalid("destination does not declare delete operation") end
    end
    return { state = s, source = source, source_endpoint = endpoint, sink_endpoint = sink_endpoint }, nil
end

local function public_state(p: Map, trigger: Map): Map
    local s = p.state :: Map
    local schedule = type(trigger.schedule) == "table" and (trigger.schedule :: Map) or nil
    local out: Map = {
        enabled = s.enabled,
        status = s.enabled and "idle" or "paused",
        when = M.when_label(trigger, tostring((p.source_endpoint :: Map).title or "")),
        sync_mode = schedule and "continuous" or "trigger",
        schedule_type = schedule and schedule.type or "trigger",
        schedule_expression = schedule and schedule.expression or "on event",
    }
    if s.reconcile then out.reconcile_enabled = true end
    if type(s.output_schema) == "table" then out.output_schema = s.output_schema end
    return out
end

function M.install(input: any): (any, any)
    local i = (type(input) == "table" and input or {}) :: Map
    local p, err = plan(i)
    if err or not p then return nil, err end
    local s = p.state :: Map
    local schedule = type((i.trigger :: Map).schedule) == "table" and ((i.trigger :: Map).schedule :: Map) or nil
    local source_title = tostring((p.source_endpoint :: Map).title or (s.source :: Map).port)
    local sink_title = tostring((p.sink_endpoint :: Map).title or (s.sink :: Map).port)
    return {
        source = p.source,
        enabled = s.enabled,
        state = { title = s.title, source = s.source, sink = s.sink, transform = s.transform,
            output_schema = s.output_schema, enabled = s.enabled, reconcile = s.reconcile },
        public_state = public_state(p, i.trigger :: Map),
        metadata = {
            title = s.title,
            icon = "tabler:arrows-exchange",
            description = source_title .. " -> " .. sink_title .. " "
                .. (schedule and ("every " .. tostring(schedule.expression)) or "on each event"),
        },
    }, nil
end

-- reconfigure(args) re-declares the sync in place: the declaration and its
-- main source, product state, public meta and enabled drives through one
-- declaration command. The destination and reconcile choice are fixed at install.
function M.reconfigure(args: any): (Map?, any)
    local input = type(args) == "table" and (args :: Map) or {}
    local id = trim(ctx.get("component_id"))
    if id == "" then return nil, invalid("component_id not in scope") end
    if trim(input.component_id) ~= "" and trim(input.component_id) ~= id then
        return nil, invalid("component_id does not match scope")
    end
    local current, read_err = automations_lib.read_state(id)
    if read_err or type(current) ~= "table" then return nil, read_err or invalid("automation state not found") end
    local p, plan_err = plan(input)
    if plan_err or not p then return nil, plan_err end
    local s = p.state :: Map
    local cur = current :: Map
    local cur_sink = type(cur.sink) == "table" and (cur.sink :: Map) or {}
    if cur_sink.port ~= (s.sink :: Map).port then return nil, invalid("destination changes require reinstalling the data sync") end
    if cur.reconcile ~= s.reconcile then return nil, invalid("reconcile changes require reinstalling the data sync") end
    local declaration = copy(input)
    declaration.component_id = nil
    local meta = public_state(p, input.trigger :: Map)
    meta.title = s.title
    local applied, apply_err = automations_lib.update_portable_input(id, declaration, {
        source = p.source,
        enabled = s.enabled,
        state = { title = s.title, source = s.source, sink = s.sink,
            transform = s.transform, output_schema = s.output_schema, enabled = s.enabled,
            reconcile = s.reconcile },
        public_meta = meta,
    })
    if apply_err or not applied then return nil, apply_err end
    return { success = true, id = id, input = input }, nil
end

M.new = construct
return M
end
return construct({automations_lib = production_automations})
