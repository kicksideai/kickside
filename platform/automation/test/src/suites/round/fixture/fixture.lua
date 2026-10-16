-- Test-only automation kind driven by rounds. Its round consumer records every
-- delivered item in round_fixture_log and answers each item by the directive
-- the item carries (payload.text for thread events, payload.directive for
-- collection items): fail_retry (a retriable failure until a redelivery),
-- fail_dead, wait, uncertain, skip, observe_lease (delivers and records the
-- drive's round deadline in a second log row), observe_identity (records the
-- drive's principal and operator), fail_always (a retriable failure on every
-- attempt), duplicate and foreign (answers that break the round
-- consumer contract); anything else delivers. Timer items record their persisted
-- occurrence. Its pullable pages through config.items
-- by an integer cursor (an item's op defaults to upsert); config.fail = "unavailable" fails the pull retriably
-- and config.lapse = { automation_id, drive_key } lapses that drive's round
-- deadline during the pull.
local sql = require("sql")
local json = require("json")
local ctx = require("ctx")
local process = require("process")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local round_write = require("round_write")
local automations_lib = require("automations_lib")

local M = {}

type Map = { [string]: any }

local DB = "app:db"

local function log(automation_id: string, drive_key: string, item_key: string, attempts: integer, detail: any): ()
    local db, err = sql.get(DB)
    if err or not db then error("fixture db: " .. tostring(err)) end
    local encoded = json.encode(detail or {})
    local _, insert_err = db:execute("INSERT INTO round_fixture_log (automation_id, drive_key, item_key, attempts, detail_json) VALUES ($1, $2, $3, $4, $5)",
        { automation_id, drive_key, item_key, attempts, encoded })
    local listeners, lookup_err = db:query("SELECT pid, topic FROM round_fixture_listener WHERE automation_id=$1 AND drive_key=$2",
        { automation_id, drive_key })
    local listener = listeners and listeners[1]
    local claim_err: any = nil
    if listener then
        local claimed: any
        claimed, claim_err = db:execute("DELETE FROM round_fixture_listener WHERE automation_id=$1 AND drive_key=$2",
            { automation_id, drive_key })
        if not claim_err and tonumber(claimed and claimed.rows_affected) ~= 1 then listener = nil end
    end
    local runs: any = nil
    local run_err: any = nil
    if listener then
        runs, run_err = db:query("SELECT r.started_at, r.execution_seq, r.job_id FROM kickside_job_run r"
            .. " JOIN kickside_automation_drive d ON d.job_id=r.job_id"
            .. " WHERE d.automation_id=$1 AND d.drive_key=$2 ORDER BY r.execution_seq DESC LIMIT 1",
            { automation_id, drive_key })
    end
    db:release()
    if insert_err then error("fixture log: " .. tostring(insert_err)) end
    if lookup_err then error("fixture listener lookup: " .. tostring(lookup_err)) end
    if claim_err then error("fixture listener claim: " .. tostring(claim_err)) end
    if run_err then error("fixture claim lookup: " .. tostring(run_err)) end
    -- The test process publishes a route only while it awaits a live round. A direct
    -- process message is acknowledged before this round child returns.
    if listener then
        local run = runs and runs[1]
        if not run then error("fixture log has no live job run") end
        local ack_topic = "round.fixture.ack." .. uuid.v7()
        local ack = process.listen(ack_topic, { message = true })
        local _, signal_err = process.send(listener.pid, listener.topic, { automation_id = automation_id,
            drive_key = drive_key, item_key = item_key, attempts = attempts,
            started_at = run.started_at, execution_seq = run.execution_seq, job_id = run.job_id,
            sender_pid = tostring(process.pid()), ack_topic = ack_topic })
        if signal_err then process.unlisten(ack); error("fixture log message: " .. tostring(signal_err)) end
        local received = channel.select({ ack:case_receive(), time.after("10s"):case_receive() })
        process.unlisten(ack)
        if received.channel ~= ack then error("fixture log message was not acknowledged") end
        local reply = received.value
        local ack_data = reply:payload():data()
        if reply:topic() ~= ack_topic or type(ack_data) ~= "table" or ack_data.item_key ~= item_key then
            error("fixture log acknowledgment mismatched")
        end
    end
end

function M.install(_input: any): (any, any)
    return { source = { source_kind = "none" }, state = { fixture = true }, metadata = { title = "Round fixture" } }, nil
end

-- event_source is the main source the event fixture declares for its input:
-- the named thread's events from the named start, with the input's page_size
-- as the declaration's round override.
local function event_source(input: any): Map
    local thread_id = type(input) == "table" and tostring((input :: Map).thread_id or "") or ""
    local start = type(input) == "table" and tostring((input :: Map).start or "all") or "all"
    local source: Map = { source_kind = "event", source_ref = "fixture:events", source_thread_id = thread_id,
        event_type = "kickside.automation.round.fixture.events:source.received", start = start }
    if type(input) == "table" and (input :: Map).page_size ~= nil then source.round = { page_size = (input :: Map).page_size } end
    return source
end

-- install_collection declares a collection main source over the fixture
-- records with reconciliation through the port's pull_keys.
-- An input enabled = false installs it disabled.
local function collection_source(input: any): Map
    local items = type(input) == "table" and type((input :: Map).items) == "table" and (input :: Map).items or {}
    return { source_kind = "collection", source_ref = "kickside.automation.round.fixture:records",
        config = { items = items }, schedule = { type = "interval", expression = "30m" },
        reconcile = { pull_keys = "kickside.automation.round.fixture:record_keys" } }
end

function M.install_collection(input: any): (any, any)
    local result: Map = { source = collection_source(input),
        state = { fixture = true }, metadata = { title = "Round collection fixture" } }
    if type(input) == "table" and (input :: Map).enabled == false then result.enabled = false end
    return result, nil
end

function M.reconfigure_collection(input: any): (any, any)
    local id = tostring(ctx.get("component_id") or "")
    return automations_lib.update_portable_input(id, { items = input.items }, { source = collection_source(input) })
end

local function timer_source(input: Map): Map
    if input.remove == true then return { source_kind = "none" } end
    return { source_kind = "timer", schedule = { type = "interval", expression = input.cadence } }
end

function M.install_scheduled(input: any): (any, any)
    return { source = timer_source(input :: Map), state = { fixture = true },
        metadata = { title = "Timer fixture" } }, nil
end

function M.reconfigure_scheduled(input: any): (any, any)
    local id = tostring(ctx.get("component_id") or "")
    return automations_lib.update_portable_input(id, input, { source = timer_source(input :: Map) })
end

function M.install_event(input: any): (any, any)
    return { source = event_source(input), state = { fixture = true }, metadata = { title = "Round event fixture" } }, nil
end

-- reconfigure_event re-declares the fixture with its new input and main source
-- through the automation's declaration command.
function M.reconfigure_event(input: any): (any, any)
    local id = tostring(ctx.get("component_id") or "")
    return automations_lib.update_portable_input(id, { thread_id = input.thread_id, start = input.start, page_size = input.page_size },
        { source = event_source(input) })
end

local function directive(item: Map): string
    local payload = type(item.payload) == "table" and item.payload or {}
    if type(payload.directive) == "string" then return payload.directive end
    return tostring(payload.text or "")
end

-- classify_write files one classified write outcome in the answer lists.
local function classify_write(out: Map, key: string, outcome: Map, receipts: { Map }, prepared_key: string?): ()
    local entry: Map = { key = key }
    if outcome.state == "delivered" then
        entry.receipts = receipts
        entry.prepared_key = prepared_key
        table.insert(out.delivered_items, entry)
    elseif outcome.state == "waiting" then
        entry.retry_after_ms = outcome.retry_after_ms
        table.insert(out.waiting_items, entry)
    elseif outcome.state == "uncertain" then
        table.insert(out.uncertain_items, entry)
    else
        entry.error = outcome.error
        entry.receipts = receipts
        table.insert(out.failed_items, entry)
    end
end

-- deliver_to_sink writes each item through R's preparation/write library to
-- the sink the drive's applied declaration names: identity and idempotency
-- keys, the destinations the receipts already map, prepared output for a
-- replay-unsafe transform (every transform unless config.replay_safe),
-- normalization and the classified write. A delete item removes every
-- destination slot its receipts name.
local function deliver_to_sink(r: Map, d: Map, config: Map): Map
    local out: Map = { delivered_items = {}, skipped_items = {}, waiting_items = {}, uncertain_items = {}, failed_items = {} }
    local sink, sink_err = round_write.describe_sink(tostring(config.sink_port))
    if sink_err or not sink then error("fixture sink: " .. tostring(sink_err)) end
    local port = tostring(d.source_port or d.source_ref)
    local keys: { string } = {}
    for _, item in ipairs((r.items or {}) :: { Map }) do keys[#keys + 1] = tostring(item.item_key) end
    local page_receipts, page_err = round_write.receipts(tostring(d.automation_id), port, keys)
    if page_err then error("fixture receipts: " .. tostring(page_err)) end
    for record, slots in pairs(d.prepared_receipts or {}) do (page_receipts :: Map)[record] = slots end
    local preparations: { Map } = {}
    for _, item in ipairs((r.items or {}) :: { Map }) do
        if item.op ~= "delete" then
            local source_item = item
            local identity = round_write.keys(d, source_item, nil)
            preparations[#preparations + 1] = {
                drive = d, prepared = config.replay_safe ~= true, key = identity.idempotency_key,
                hash = tostring(source_item.item_key) .. ":" .. directive(source_item),
                compute = function(): (any?, any)
                    log(tostring(d.automation_id), "transform", tostring(source_item.item_key), 0,
                        { directive = directive(source_item) })
                    return { directive = directive(source_item), principal_id = source_item.payload.principal_id, error_kind = source_item.payload.error_kind, title = "record " .. tostring(source_item.item_key),
                        content = "record " .. tostring(source_item.item_key) }, nil
                end,
            }
        end
    end
    local prepared: Map = {}
    for _, spec in ipairs(preparations) do
        local value, prepare_err = round_write.prepare(spec, spec.compute)
        prepared[spec.key] = { value = value, error = prepare_err }
    end
    for _, item in ipairs((r.items or {}) :: { Map }) do
        local keys = round_write.keys(d, item, nil)
        local known = (page_receipts :: Map)[tostring(item.item_key)] or {}
        if item.op == "delete" then
            local removed: { Map } = {}
            local last: Map = { state = "delivered" }
            for _, slot in ipairs(known :: { Map }) do
                last = round_write.write(sink, { config = {}, sink_op = "delete", input = { item_key = item.item_key },
                    identity_key = slot.identity_key, idempotency_key = keys.idempotency_key, map_slot = slot.map_slot,
                    dest_ref = slot.dest_ref }, d, item)
                if last.state ~= "delivered" then break end
                for _, rc in ipairs(last.receipts :: { Map }) do removed[#removed + 1] = rc end
            end
            classify_write(out, item.delivery_key, last, removed, nil)
        else
            local prepared_item = (prepared :: Map)[keys.idempotency_key]
            local transformed, prepare_err = prepared_item.value, prepared_item.error
            if prepare_err then
                table.insert(out.failed_items, { key = item.delivery_key, error = prepare_err })
            else
                -- The fixture's transform yields a record carrying content, the
                -- input both its record and content sinks take.
                local input = transformed :: Map
                local unslotted: Map? = nil
                for _, slot in ipairs(known :: { Map }) do if slot.map_slot == "" then unslotted = slot end end
                local outcome = round_write.write(sink, {
                    config = {}, sink_op = "upsert", input = input,
                    identity_key = keys.identity_key, idempotency_key = keys.idempotency_key,
                    dest_ref = unslotted and unslotted.dest_ref or nil,
                }, d, item)
                classify_write(out, item.delivery_key, outcome, outcome.receipts or {}, keys.idempotency_key)
            end
        end
    end
    return out
end

function M.deliver(request: any): (any, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local d = type(r.drive) == "table" and (r.drive :: Map) or {}
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    if type(config.sink_port) == "string" then return deliver_to_sink(r, d, config), nil end
    local actor = require("security").actor()
    local out: Map = { delivered_items = {}, skipped_items = {}, waiting_items = {}, uncertain_items = {}, failed_items = {} }
    for _, item in ipairs((r.items or {}) :: { Map }) do
        local attempts = math.floor(tonumber(item.attempts) or 0)
        log(tostring(d.automation_id), tostring(d.drive_key), tostring(item.item_key), attempts,
            { directive = directive(item), fired_at = type(item.payload) == "table" and item.payload.fired_at or nil,
                principal = d.principal, operator = d.operator, actor_id = actor:id() })
        local what = directive(item)
        local key = item.delivery_key
        if what == "observe_lease" then
            local db, db_err = sql.get(DB)
            if db_err or not db then error("fixture db: " .. tostring(db_err)) end
            local rows = db:query("SELECT round_until FROM kickside_automation_drive WHERE automation_id = $1 AND drive_key = $2",
                { d.automation_id, d.drive_key })
            db:release()
            log(tostring(d.automation_id), tostring(d.drive_key), tostring(item.item_key), attempts, { directive = what, round_until = rows and rows[1] and rows[1].round_until })
            table.insert(out.delivered_items, { key = key })
        elseif what == "observe_identity" then
            log(tostring(d.automation_id), tostring(d.drive_key), tostring(item.item_key), attempts, { directive = what, principal = d.principal, operator = d.operator })
            table.insert(out.delivered_items, { key = key })
        elseif what == "duplicate" then
            table.insert(out.delivered_items, { key = key })
            table.insert(out.skipped_items, { key = key })
        elseif what == "foreign" then
            table.insert(out.delivered_items, { key = key })
            table.insert(out.delivered_items, { key = "foreign:" .. tostring(key) })
        elseif what == "item_key" then
            table.insert(out.waiting_items, { key = tostring(item.item_key) })
        elseif what == "fail_retry" and attempts == 0 then
            table.insert(out.failed_items, { key = key, error = { kind = "Unavailable", message = "provider down", retriable = true } })
        elseif what == "fail_always" then
            table.insert(out.failed_items, { key = key, error = { kind = "Unavailable", message = "provider still down", retriable = true } })
        elseif what == "fail_dead" then
            table.insert(out.failed_items, { key = key, error = { kind = "Invalid", message = "bad record", retriable = false } })
        elseif what == "wait" then
            table.insert(out.waiting_items, { key = key, retry_after_ms = 60000 })
        elseif what == "uncertain" then
            table.insert(out.uncertain_items, { key = key })
        elseif what == "skip" then
            table.insert(out.skipped_items, { key = key, reason = "filtered" })
        else
            table.insert(out.delivered_items, { key = key })
        end
    end
    return out, nil
end


-- write is the fixture store's kickside.data:writable.write: it records the
-- write and answers a delete as deleted, else by the input's directive: slots
-- (two destination slots a and b), capacity (a capacity wait),
-- timeout (an ambiguous failure), invalid (a deterministic failure), conflict
-- (idempotency_conflict); anything else commits with a destination ref.
function M.write(request: any): (any, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local input = type(r.input) == "table" and (r.input :: Map) or {}
    local actor = require("security").actor()
    log(tostring(ctx.get("sink_owner") or "sink"), "sink", tostring(r.identity_key), 0,
        { idempotency_key = r.idempotency_key, dest_ref = r.dest_ref, directive = input.directive,
            automation_ref = r.automation_ref, origin = r.origin, deadline = ctx.get("deadline"), actor_id = actor:id() })
    local what = tostring(input.directive or "")
    if r.sink_op == "delete" and type(r.dest_ref) == "table" and r.dest_ref.revoke_authority then
        what = "revoke_authority"
        input.principal_id = r.dest_ref.revoke_authority
        input.error_kind = "access"
    end
    if what == "revoke_authority" then
        local db, db_err = sql.get(DB)
        if db_err or not db then return nil, db_err end
        local _, err = db:execute("INSERT INTO round_authority_revocation (principal_id,error_kind) VALUES ($1,$2)",
            {input.principal_id, input.error_kind})
        db:release()
        if err then return nil, err end
    end
    if r.sink_op == "delete" then
        if type(r.dest_ref) == "table" and (r.dest_ref :: Map).id == "fail-delete" then
            return { success = false, error = { code = "provider_unavailable", retriable = true,
                message = "destination deletion has no acknowledgment" } }, nil
        end
        return { success = true, result = "deleted" }, nil
    elseif what == "slots" then
        return { success = true, dest_refs = {
            a = { dest_ref = { id = "rec:" .. tostring(r.identity_key) .. ":a" }, dest_version = "v1" },
            b = { dest_ref = { id = "rec:" .. tostring(r.identity_key) .. ":b" }, dest_version = "v1" },
        } }, nil
    elseif what == "too_many_slots" then
        local refs: Map = {}
        for i = 1, 17 do
            local slot = "slot-" .. tostring(i)
            refs[slot] = { dest_ref = { id = "rec:" .. tostring(r.identity_key) .. ":" .. slot }, dest_version = "v1" }
        end
        return { success = true, dest_refs = refs }, nil
    elseif what == "capacity" then
        return { success = false, error = { code = "rate_limited", scope = "capacity", retry_after_ms = 30000, retriable = true, message = "busy" } }, nil
    elseif what == "timeout" then
        return { success = false, error = { code = "provider_unavailable", retriable = true, message = "timed out" } }, nil
    elseif what == "invalid" then
        return { success = false, error = { code = "invalid_request", retriable = false, message = "bad record" } }, nil
    elseif what == "conflict" then
        return { success = false, error = { code = "idempotency_conflict", retriable = false, message = "hash differs" } }, nil
    end
    return { success = true, dest_ref = { id = "rec:" .. tostring(r.identity_key) }, dest_version = "v1" }, nil
end

function M.pull(request: any): (any, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    local all = type(config.items) == "table" and (config.items :: { Map }) or {}
    if config.fail == "unavailable" then
        return { success = false, error = { kind = "Unavailable", message = "records provider down", retriable = true } }, nil
    end
    if type(config.lapse) == "table" then
        local db, db_err = sql.get(DB)
        if db_err or not db then error("fixture db: " .. tostring(db_err)) end
        local _, lapse_err = db:execute("UPDATE kickside_automation_drive SET round_until = $1 WHERE automation_id = $2 AND drive_key = $3",
            { "2000-01-01T00:00:00Z", config.lapse.automation_id, config.lapse.drive_key })
        db:release()
        if lapse_err then error("fixture lapse: " .. tostring(lapse_err)) end
    end
    local from = math.floor(tonumber(r.cursor) or 0)
    local limit = math.floor(tonumber(r.limit) or 1)
    local items: { Map } = {}
    for i = from + 1, math.min(#all, from + limit) do
        local it = all[i]
        if not it then error("fixture cursor is outside the item page") end
        items[#items + 1] = { item_key = it.key, dedup_key = it.dedup_key or it.key, op = it.op or "upsert", payload = { directive = it.directive, principal_id = it.principal_id, error_kind = it.error_kind } }
    end
    local next_cursor = from + #items
    return { success = true, items = items, next_cursor = next_cursor, has_more = config.continuing == true or next_cursor < #all, retry_after_ms = config.retry_after_ms }, nil
end

-- record_keys is the fixture records port's reconcile.pull_keys: the keys of
-- config.items paged by an integer cursor.
function M.record_keys(request: any): (any, any)
    local r = type(request) == "table" and (request :: Map) or {}
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    local all = type(config.items) == "table" and (config.items :: { Map }) or {}
    local from = math.floor(tonumber(r.cursor) or 0)
    local limit = math.floor(tonumber(r.limit) or 1)
    local keys: { string } = {}
    for i = from + 1, math.min(#all, from + limit) do
        local item = all[i]
        if not item then error("fixture cursor is outside the key page") end
        keys[#keys + 1] = item.key
    end
    local next_cursor = from + #keys
    return { success = true, keys = keys, next_cursor = next_cursor, has_more = next_cursor < #all }, nil
end


return M
