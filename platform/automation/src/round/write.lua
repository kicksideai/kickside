-- The round's preparation/write library (design v5 §3.2, §4.6; CONTRACTS §11,
-- A25). A kind's round consumer calls it for each item it writes; the round
-- itself owns the ledger, the cursor and the fenced commit, which records the
-- receipts delivered items carry and deletes their prepared output.
--
--   keys(drive, item, map_slot?)      -- identity_key names the destination record
--                                        across deliveries; idempotency_key names
--                                        one delivery and moves with the drive's
--                                        delivery_revision
--   describe_sink(port_id)            -- the sink binding and its declared delivery
--                                        and input_shape; a sink missing either
--                                        is refused
--   receipts(owner, port, item_keys)  -- the destinations previous deliveries of a
--                                        page's items recorded, one per slot, for
--                                        in-place updates and deletes, in one read
--   prepare(spec, compute)    -- replay-unsafe output persisted under the
--                                        round's fence before the write and reused
--                                        by every retry under the same key and hash
--   write(sink, request, d, item)     -- the classified outcome: delivered with the
--                                        receipts of every destination slot it
--                                        wrote (a delete's slot as removed),
--                                        waiting on capacity, uncertain for an
--                                        ambiguous at-most-once send, failed
--
-- Every function answers (value, err); prepare's conflict is the writable
-- idempotency_conflict DataError. No transaction spans a provider call.

local funcs = require("funcs")
local json = require("json")
local canonical_json = require("canonical_json")
local sql = require("sql")
local registry = require("registry")
local automation_db = require("automation_db")
local with_db, in_tx = automation_db.with_db, automation_db.in_tx
local drive = require("drive")
local failure_classification = require("failure_classification")
local capacity = require("connection_capacity").new()
local automations_lib = require("automations_lib")
local ledger = require("round_ledger")
local commit = require("round_commit")
local jobs = require("jobs")
local prepared_output = require("round_prepared")
local runtime_policy = require("runtime_policy")

local identity = require("delivery_identity")

local M = {}

type Map = { [string]: any }

M.DELIVERY = { EXACTLY_ONCE = "exactly_once", AT_LEAST_ONCE = "at_least_once", AT_MOST_ONCE = "at_most_once" }
M.INPUT_SHAPE = { RECORD = "record", CONTENT = "content" }

function M.destination_slots(): (integer?, error?)
    local policy, err = runtime_policy.policy()
    if err or not policy then return nil, err end
    return policy.destination_slots_per_item, nil
end

local DELIVERIES: { [string]: boolean } = { exactly_once = true, at_least_once = true, at_most_once = true }
local SHAPES: { [string]: boolean } = { record = true, content = true }

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false, details = { error_kind = "declaration" } }) :: error)
end

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- keys(drive, item, map_slot?) -> { identity_key, idempotency_key }.
function M.keys(d: Map, item: Map, map_slot: string?): Map
    return identity.keys(d, item, map_slot)
end

-- describe_sink(port_id) -> { port, binding, delivery, input_shape }.
function M.describe_sink(port_id: string): (Map?, error?)
    local port, port_err = automations_lib.resolve_sink(port_id)
    if port_err then return nil, port_err end
    if not port then return nil, invalid("sink " .. tostring(port_id) .. " is missing") end
    local binding = tostring((port :: Map).binding or "")
    local entry, entry_err = registry.get(binding)
    if entry_err then return nil, internal("sink binding registry unavailable", entry_err) end
    local meta = type(entry) == "table" and type((entry :: Map).meta) == "table" and (entry :: Map).meta or {}
    if not DELIVERIES[tostring(meta.delivery)] then
        return nil, invalid("sink binding " .. binding .. " declares no delivery (exactly_once, at_least_once or at_most_once)")
    end
    if not SHAPES[tostring(meta.input_shape)] then
        return nil, invalid("sink binding " .. binding .. " declares no input_shape (record or content)")
    end
    return { port = port_id, binding = binding, delivery = meta.delivery, input_shape = meta.input_shape }, nil
end

-- The most keys one receipt statement names.
local RECEIPT_CHUNK = 200

-- receipts(owner_id, source_port, item_keys) -> { [item_key] = [{ map_slot,
-- identity_key, dest_ref, dest_version }] } the receipts previous deliveries
-- recorded for a page's items, each item's slots in order, read in one
-- statement per RECEIPT_CHUNK keys. An item without receipts is absent.
function M.receipts(owner_id: string, source_port: string, item_keys: { string }): ({ [string]: { Map } }?, error?)
    local out: { [string]: { Map } } = {}
    for first = 1, #item_keys, RECEIPT_CHUNK do
        local params: { any } = { owner_id, source_port }
        local marks: { string } = {}
        for index = first, math.min(#item_keys, first + RECEIPT_CHUNK - 1) do
            params[#params + 1] = item_keys[index]
            marks[#marks + 1] = "$" .. tostring(#params)
        end
        local rows, err = with_db(function(db: any): (any?, any)
            return db:query("SELECT item_key, map_slot, identity_key, dest_ref_json, dest_version FROM kickside_automation_receipt"
                .. " WHERE owner_id = $1 AND source_port = $2 AND item_key IN (" .. table.concat(marks, ", ") .. ")"
                .. " ORDER BY item_key, map_slot", params)
        end)
        if err then return nil, internal("failed to read receipts", err) end
        for _, row in ipairs(rows :: { Map }) do
            local dest_ref: any = nil
            if row.dest_ref_json ~= nil then
                local decoded, decode_err = json.decode(tostring(row.dest_ref_json))
                if decode_err then return nil, internal("receipt " .. tostring(row.item_key) .. " holds a destination that is not JSON", decode_err) end
                dest_ref = decoded
            end
            local key = tostring(row.item_key)
            local slots = out[key] or {}
            slots[#slots + 1] = { map_slot = tostring(row.map_slot or ""), identity_key = row.identity_key,
                dest_ref = dest_ref, dest_version = row.dest_version }
            out[key] = slots
        end
    end
    return out, nil
end

-- hold_fence_tx(tx, d) -> the locked drive while the round that handed the
-- consumer its drive block d = { automation_id, drive_key, fence } still
-- holds it; a moved fence (a control, another attempt) is a retriable
-- CONFLICT, so no pre-effect persistence and no effect follow it.
local function hold_fence_tx(tx: any, d: any): (Map?, error?)
    if type(d) ~= "table" or type((d :: Map).fence) ~= "table" then
        return nil, invalid("a round-owned write names its round's drive and fence")
    end
    local held, err = commit.fence_tx(tx, tostring(d.automation_id), tostring(d.drive_key), (d :: Map).fence :: Map)
    if err then return nil, err end
    if not held then
        return nil, (errors.new({ message = "drive " .. tostring(d.automation_id) .. "/" .. tostring(d.drive_key)
            .. " moved past this round's fence", kind = errors.CONFLICT, retryable = true }) :: error)
    end
    return held, nil
end

-- check_fence(d) reads whether the round that handed the consumer its drive
-- block still holds its fence, immediately before a provider call: the drive
-- fence (commit.holds) and the live lease of the job the round runs under. A
-- moved or expired fence is the same retriable CONFLICT hold_fence_tx answers.
function M.check_fence(d: any): error?
    if type(d) ~= "table" or type((d :: Map).fence) ~= "table" or type(((d :: Map).fence :: Map).job) ~= "table" then
        return invalid("a round-owned write names its round's drive, fence and job lease")
    end
    local fence = (d :: Map).fence :: Map
    local function moved(what: string): error
        return (errors.new({ message = "drive " .. tostring(d.automation_id) .. "/" .. tostring(d.drive_key)
            .. " " .. what, kind = errors.CONFLICT, retryable = true }) :: error)
    end
    local current, read_err = with_db(function(db: any): (any?, any)
        return drive.get_fence(db, tostring(d.automation_id), tostring(d.drive_key))
    end)
    if read_err then return read_err end
    if not commit.holds(current :: Map?, fence) then return moved("moved past this round's fence") end
    local leased, lease_err = jobs.lease_valid(tostring((fence.job :: Map).id), {
        token = (fence.job :: Map).lease_token,
        execution_seq = (fence.job :: Map).execution_seq,
    })
    if lease_err then return lease_err end
    if not leased then return moved("lost the job lease this round runs under") end
    return nil
end

-- Read one page of prepared rows with bounded bind lists. A caller can
-- distinguish a missing row from a stored JSON null through the row map.
local function prepared_rows(owner_id: string, keys: { string }): (Map?, error?)
    return with_db(function(db: any): (any?, any)
        local found: Map = {}
        for first = 1, #keys, 100 do
            local params: { any } = { owner_id }
            local marks: { string } = {}
            for index = first, math.min(#keys, first + 99) do
                params[#params + 1] = keys[index]
                marks[#marks + 1] = "$" .. tostring(#params)
            end
            local rows, err = db:query("SELECT idempotency_key,payload_hash,prepared_json FROM kickside_automation_prepared"
                .. " WHERE automation_id=$1 AND idempotency_key IN (" .. table.concat(marks, ",") .. ")", params)
            if err then return nil, internal("failed to read prepared page", err) end
            for _, row in ipairs(rows :: { Map }) do found[tostring(row.idempotency_key)] = row end
        end
        return found, nil
    end)
end

-- prepare(spec, compute) runs compute under the round's live fence. A
-- replay-unsafe spec (prepared = true) persists its output under the delivery
-- key before the write and every retry under that key and hash reuses it.
function M.prepare(spec: Map, compute: () -> (any?, any)): (any?, any)
    if type(spec) ~= "table" or type(spec.drive) ~= "table" or type(compute) ~= "function" then
        return nil, invalid("preparation requires a spec with its round drive and a compute function")
    end
    if type(spec.key) ~= "string" or spec.key == "" then
        return nil, invalid("preparation requires its delivery key")
    end
    local d = spec.drive :: Map
    local fence_err = M.check_fence(d)
    if fence_err then return nil, fence_err end
    local allowed, authority_err = funcs.call("kickside.automation:round_authority", {drive=d,key=spec.key,prepared_lookup=true})
    if authority_err or not allowed then return nil, authority_err end
    local function compute_effect(): (any?, any)
        if type(spec.effect) == "table" then
            return funcs.call("kickside.automation:round_authority_compute",{drive=d,key=spec.key,target=spec.effect.target,args=spec.effect.args})
        end
        return compute()
    end
    if spec.prepared ~= true then return compute_effect() end
    local original_key=type(allowed) == "table" and allowed.prepared_key or spec.key
    local stored, stored_err = prepared_rows(tostring(d.automation_id), { tostring(original_key),tostring(spec.key) })
    if stored_err or not stored then return nil, stored_err end
    local prior = (stored :: Map)[tostring(original_key)] or (stored :: Map)[tostring(spec.key)]
    if prior then
        if prior.payload_hash ~= spec.hash then return nil, prepared_output.conflict(tostring(spec.key)) end
        local value, decode_err = json.decode(tostring(prior.prepared_json))
        if decode_err then return nil, internal("stored prepared output is not JSON", decode_err) end
        return value, nil
    end
    local value, compute_err = compute_effect()
    if compute_err ~= nil then return nil, compute_err end
    local encoded, encode_err = json.encode(value)
    if encode_err or type(encoded) ~= "string" then
        return nil, invalid("prepared output must be JSON serializable")
    end
    local results, materialize_err = prepared_output.materialize_many(d,
        { { key = tostring(spec.key), hash = tostring(spec.hash), encoded = encoded } })
    if materialize_err or not results then return nil, materialize_err end
    local answer = (results :: Map)[tostring(spec.key)]
    return answer.value, answer.error
end

-- reserve_uncertain persists the uncertain ledger row of an at-most-once item
-- before its request (design v5 §4.6) and counts it on the drive in the same
-- transaction under the round's fence (§14 round order: drive, then ledger),
-- so a crash after the send leaves the item visible and counted, and a
-- fenced round sends nothing. The round's commit resolves it.
local function reserve_uncertain(d: Map, item: Map, request: Map, admission_key: string): (Map?, error?)
    local owner = tostring(d.automation_id)
    local payload_hash, hash_err = canonical_json.hash({ config = request.config or {}, input = request.input,
        dest_ref = request.dest_ref, dest_version = request.dest_version })
    if hash_err then return nil, hash_err end
    return in_tx(function(tx: any): (any?, any)
        local held, fence_err = hold_fence_tx(tx, d)
        if fence_err or not held then return nil, fence_err end
        local evidence=type(held.admission) == "table" and held.admission[admission_key] or nil
        local evidence_json,evidence_err=json.encode(evidence)
        if evidence_err then return nil,internal("pre-send admission encoding fails",evidence_err) end
        if evidence == nil then return nil,internal("pre-send admission is missing",admission_key) end
        identity.bind(d, item)
        local decision, delta, record_err = ledger.reserve_uncertain_tx(tx, owner, tostring(d.ledger_port), item,
            { key = request.idempotency_key, op = request.sink_op, hash = payload_hash }, drive.utc_now(),evidence_json)
        if record_err then return nil, record_err end
        if delta ~= 0 then
            local _, count_err = drive.update_cas_tx(tx, owner, tostring(d.drive_key), {},
                { unresolved_count = math.max(0, ((held :: Map).unresolved_count :: integer) + (delta :: integer)) })
            if count_err then return nil, count_err end
        end
        return decision, nil
    end)
end

-- slot_receipts(request, result) -> the receipts of the destination slots a
-- delivered write answered: a delete removes its slot; a dest_refs map names
-- each slot it wrote, which for a write to a known slot is that slot alone; a
-- single dest_ref names the request's slot; an answer without a reference
-- records nothing.
local function slot_receipts(request: Map, r: Map, max_slots: integer): ({ Map }?, string?)
    local slot = type(request.map_slot) == "string" and request.map_slot or ""
    local function receipt(map_slot: string, dest_ref: any, dest_version: any): Map
        return { map_slot = map_slot, identity_key = request.identity_key, idempotency_key = request.idempotency_key,
            dest_ref = dest_ref, dest_version = dest_version }
    end
    if request.sink_op == "delete" then
        local removed = receipt(slot, nil, nil)
        removed.removed = true
        return { removed }, nil
    end
    if type(r.dest_refs) == "table" then
        local slots: { string } = {}
        for k in pairs(r.dest_refs :: Map) do slots[#slots + 1] = tostring(k) end
        table.sort(slots)
        if #slots > max_slots then return nil, "the sink exceeded the declared destination-slot bound" end
        if slot ~= "" and (#slots ~= 1 or slots[1] ~= slot) then
            return nil, "the sink answered destination slots " .. table.concat(slots, ",") .. " for a write to slot " .. slot
        end
        local out: { Map } = {}
        for _, k in ipairs(slots) do
            local row = (r.dest_refs :: Map)[k]
            if type(row) ~= "table" or type((row :: Map).dest_ref) ~= "table" then
                return nil, "dest_refs[" .. k .. "] carries no dest_ref object"
            end
            out[#out + 1] = receipt(k, (row :: Map).dest_ref, (row :: Map).dest_version)
        end
        return out, nil
    end
    if r.dest_ref ~= nil then return { receipt(slot, r.dest_ref, r.dest_version) }, nil end
    return {}, nil
end

-- write(sink, request, d, item) -> { state, receipts?, retry_after_ms?,
-- error? }. request = { config, sink_op, input, identity_key, idempotency_key,
-- map_slot?, dest_ref?, dest_version? }. d is the round's drive block
-- { automation_id, automation_revision, drive_key, source_port, ledger_port,
-- fence } and item the delivered item: an at-most-once sink reserves its
-- ledger row as uncertain under the round's fence before sending. Every write
-- names the invoking automation (automation_ref) and its writing origin, the
-- automation id a sink keys its receipts by, apart from the sink input.
function M.write(sink: Map, request: Map, d: Map, item: Map): Map
    if type(request.sink_op) ~= "string" or request.sink_op == "" then
        return { state = "failed", error = failure_classification.classify({ kind = errors.INVALID, retriable = false,
            message = "a write names its sink operation" }) }
    end
    local policy, policy_err = runtime_policy.policy()
    if policy_err or not policy then
        return { state = "failed", error = failure_classification.classify(policy_err) }
    end
    local max_slots = request.max_destination_slots or policy.destination_slots_per_item
    if type(max_slots) ~= "number" or max_slots ~= math.floor(max_slots) or max_slots < 1
        or max_slots > policy.destination_slots_per_item then
        return { state = "failed", error = failure_classification.classify(invalid(
            "a write requires a finite destination-slot bound within policy")) }
    end
    -- Every provider write is preceded by the round's fence check (§4.2),
    -- immediately before the send: an at-most-once write after its uncertain
    -- reservation (itself taken under the fence). A moved or expired fence
    -- sends nothing.
    local connection_id = type(request.config) == "table" and request.config.connection_id or nil
    if type(connection_id) == "string" and connection_id ~= "" then
        local _, capacity_err = capacity.check(connection_id)
        if capacity_err then
            local failure = failure_classification.classify(capacity_err)
            return {state = failure_classification.capacity_floor(failure) ~= nil and "waiting" or "failed",
                error = failure, retry_after_ms = failure.retry_after_ms}
        end
    end
    local admission_key=item.delivery_key or request.idempotency_key
    local allowed,authority_err=funcs.call("kickside.automation:round_authority",{drive=d,key=request.idempotency_key,delivery_key=admission_key})
    if authority_err or not allowed then return {state="failed",error=failure_classification.classify(authority_err)} end
    if sink.delivery == M.DELIVERY.AT_MOST_ONCE then
        local decision, reserve_err = reserve_uncertain(d, item, request,admission_key)
        if reserve_err then return { state = "failed", error = failure_classification.classify(reserve_err) } end
        if not decision.send then return { state = decision.state, receipts = {} } end
    end
    local body: Map = {
        config = request.config or {}, sink_op = request.sink_op, input = request.input,
        identity_key = request.identity_key, idempotency_key = request.idempotency_key,
        dest_ref = request.dest_ref, dest_version = request.dest_version,
        origin = tostring(d.automation_id),
        automation_ref = { kind = "automation", id = tostring(d.automation_id),
            revision = math.floor(tonumber(d.automation_revision) or 1) },
    }
    if type(request.map_slot) == "string" and request.map_slot ~= "" then body.map_slot = request.map_slot end
    local packet,send_err=funcs.call("kickside.automation:round_authority_write",{
        drive=d,key=request.idempotency_key,delivery_key=admission_key,binding=sink.binding,config=type(request.config) == "table" and request.config or {},body=body})
    if send_err or not packet then return {state="failed",error=failure_classification.classify(send_err)} end
    local result,message,envelope=packet.result,packet.message,packet.envelope
    if result ~= nil then
        local receipts, violation = slot_receipts(request, result :: Map, math.floor(max_slots))
        if violation then
            -- The provider already answered success. Preserve uncertainty so a
            -- receipt shape or slot-bound violation cannot advance the cursor.
            return { state = "uncertain", error = errors.new({ kind = errors.CONFLICT,
                retryable = false, message = "sink " .. tostring(sink.port) .. ": " .. violation,
                details = { reason = "destination_receipt_uncertain", scope = tostring(d.automation_id) } }) }
        end
        return { state = "delivered", receipts = receipts }
    end
    local e: Map = type(envelope) == "table" and (envelope :: Map) or {}
    local classified = failure_classification.classify(next(e) ~= nil and e or message)
    if classified.kind == errors.RATE_LIMITED and classified.scope == "capacity" then
        return { state = "waiting", retry_after_ms = classified.retry_after_ms, error = classified }
    end
    if classified.retriable ~= false and sink.delivery == M.DELIVERY.AT_MOST_ONCE then
        return { state = "uncertain", error = classified }
    end
    return { state = "failed", error = classified }
end

return M
