-- The authoritative latest classification of each delivery identity. Initial
-- skips and deliveries remain observable without changing admission semantics.
-- Active identities persist for deduplication; retention reclaims orphaned
-- owners and legacy expiring settlements, never active classification evidence.

local json = require("json")
local time = require("time")
local sql = require("sql")
local row_limit = require("row_limit")
local canonical_json = require("canonical_json")

local identity = require("delivery_identity")
local history = require("round_history")
local failure_classification = require("failure_classification")

local drive = require("drive")

local M = {}

type Map = { [string]: any }

M.TABLE = "kickside_trigger_item_ledger"

M.STATE = {
    RETRYING = "retrying",
    WAITING = "waiting",
    UNCERTAIN = "uncertain",
    PARKED = "parked",
    DEAD = "dead",
    RESOLVED = "resolved",
}

local UNRESOLVED: { [string]: boolean } = { retrying = true, waiting = true, uncertain = true, parked = true }

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- receipt_port(d) -> the source port a drive's destinations are receipted
-- under: its source port (a reconcile drive reconciles its source's receipts),
-- or its timer scope.
function M.receipt_port(d: Map): string
    local action = type(d.action) == "table" and d.action or {}
    if d.source_kind == "timer" or type(action.source_ref) ~= "string" or action.source_ref == "" then
        return "timer:" .. tostring(d.drive_key)
    end
    return tostring(action.source_ref)
end

-- source_port(d) -> the ledger scope of a drive: its receipt port, apart for
-- a reconcile drive so its deletes never mix with its source's deliveries.
function M.source_port(d: Map): string
    if d.source_kind == "reconcile" then return "reconcile:" .. M.receipt_port(d) end
    return M.receipt_port(d)
end

-- due_tx(executor, owner_id, source_port, now, limit) -> the retrying and
-- waiting record fronts whose next attempt is due, earliest deadline first.
function M.due_tx(executor: any, owner_id: string, source_port: string, now: string, limit: integer): ({ Map }?, error?)
    local now_expr, now_err = drive.time_sql(executor, "$3")
    if now_err then return nil, now_err end
    local rows, err = executor:query("SELECT item_key, dedup_key, envelope_json, attempts, identity_key, delivery_order FROM " .. M.TABLE
        .. " WHERE owner_id=$1 AND source_port=$2 AND eligible_at IS NOT NULL AND eligible_at <= " .. now_expr
        .. " ORDER BY eligible_at,delivery_order,item_key,identity_key LIMIT $4", {owner_id,source_port,now,limit})
    if err then return nil, internal("failed to scan due ledger items", err) end
    local items: { Map } = {}
    for _, row in ipairs(rows :: { Map }) do
        local item, decode_err = json.decode(tostring(row.envelope_json))
        if decode_err or type(item) ~= "table" then return nil, internal("ledger item " .. tostring(row.item_key) .. " is not JSON", decode_err) end
        local it = item :: Map
        it.delivery_key = row.identity_key
        it.delivery_order = tonumber(row.delivery_order)
        it.attempts = math.floor(tonumber(row.attempts) or 0)
        items[#items + 1] = it
    end
    return items, nil
end

-- Exact delivery reads never traverse the retained versions of an item.
local function read_identities(executor: any, owner: string, port: string, items: {Map}, lock: boolean): ({Map}?,error?)
    local ordered: {Map}={}
    local seen: Map={}
    for _,item in ipairs(items) do
        local key=item.item_key .. "\n" .. item.delivery_key
        if not seen[key] then seen[key]=true;ordered[#ordered+1]=item end
    end
    table.sort(ordered,function(a: Map,b: Map): boolean
        if a.item_key ~= b.item_key then return a.item_key < b.item_key end
        return a.delivery_key < b.delivery_key
    end)
    local rows: {Map}={}
    for first=1,#ordered,200 do
        local params: {any}={owner,port}
        local matches: {string}={}
        for index=first,math.min(#ordered,first+199) do
            params[#params+1]=ordered[index].item_key
            params[#params+1]=ordered[index].delivery_key
            matches[#matches+1]="($" .. tostring(#params-1) .. ",$" .. tostring(#params) .. ")"
        end
        local page,err=executor:query("WITH scope(owner_id,source_port) AS (VALUES ($1,$2)), requested(item_key,identity_key) AS (VALUES "
            .. table.concat(matches,",") .. ") SELECT l.item_key,l.identity_key,l.state,l.attempts,l.first_failed_at,l.envelope_json,"
            .. "l.next_attempt_at,l.delivery_order,l.identity_parked,l.classification FROM scope CROSS JOIN requested r CROSS JOIN " .. M.TABLE .. " l"
            .. " WHERE l.owner_id=scope.owner_id AND l.source_port=scope.source_port AND l.item_key=r.item_key AND l.identity_key=r.identity_key"
            .. " ORDER BY l.owner_id, l.source_port, l.item_key, l.identity_key" .. (lock and " FOR UPDATE OF l" or ""),params)
        if err then return nil,internal("failed to read ledger identities",err) end
        for _,row in ipairs(page :: {Map}) do rows[#rows+1]=row end
    end
    return rows,nil
end

-- admit(executor, owner, port, items, round_seq) -> { items, fronts }: the
-- page's items still to deliver, each with its recorded attempts and delivery
-- order (a new item's order follows this round's sequence), and per record
-- the earliest undelivered change every later change of it waits behind. A
-- change the ledger holds as resolved or dead is not delivered again.
function M.admit(executor: any, owner: string, port: string, items: { Map }, round_seq: integer): (Map?, error?)
    local observed, observe_err = read_identities(executor, owner, port, items, false)
    if observe_err or not observed then return nil, observe_err end
    local by_delivery: Map = {}
    local fronts: Map = {}
    for _, row in ipairs(observed) do
        by_delivery[row.identity_key] = row
    end
    local seen: Map={}
    for _,item in ipairs(items) do
        if not seen[item.item_key] then
            seen[item.item_key]=true
            local head,head_err=executor:query("SELECT item_key,identity_key,state,delivery_order FROM " .. M.TABLE
                .. " WHERE owner_id=$1 AND source_port=$2 AND item_key=$3"
                .. " AND state IN ('retrying','waiting','uncertain','parked')"
                .. " ORDER BY delivery_order,identity_key LIMIT 1",{owner,port,item.item_key})
            if head_err then return nil,internal("failed to read ledger front",head_err) end
            fronts[item.item_key]=(head :: {Map})[1]
        end
    end
    local pending: { Map } = {}
    for index, item in ipairs(items) do
        local prior = by_delivery[item.delivery_key]
        if prior then item.attempts = tonumber(prior.attempts) or 0 end
        item.delivery_order = prior and tonumber(prior.delivery_order) or (round_seq * 1000000 + index)
        if not prior or ((prior.state ~= M.STATE.RESOLVED or prior.classification == "skipped" or prior.classification == "delivered") and prior.state ~= M.STATE.DEAD
            and prior.identity_parked ~= true and prior.identity_parked ~= 1) then
            pending[#pending + 1] = item
        end
    end
    return { items = pending, fronts = fronts }, nil
end

-- next_attempt(executor, owner_id, source_port, decision_at?) -> the earliest
-- pending redelivery time, or nil. Deadline-free work is due at the caller's
-- captured decision time, even when the query crosses a clock boundary.
function M.next_attempt(executor: any, owner_id: string, source_port: string, decision_at: string?): (string?, error?)
    local rows, err = executor:query("SELECT COALESCE(next_attempt_at,$1) AS next_at FROM " .. M.TABLE
        .. " WHERE owner_id=$2 AND source_port=$3 AND eligible_at IS NOT NULL"
        .. " ORDER BY eligible_at,delivery_order,item_key,identity_key LIMIT 1",
        {decision_at or time.now():utc():format(time.RFC3339),owner_id,source_port})
    if err then return nil, internal("failed to read the next ledger attempt", err) end
    local row = (rows :: { Map })[1]
    if not row or row.next_at == nil then return nil, nil end
    return tostring(row.next_at), nil
end

local function dialect(tx: any): (string?, error?)
    local dbtype, err = tx:db_type()
    if err then return nil, internal("failed to resolve ledger dialect", err) end
    if dbtype ~= sql.type.POSTGRES and dbtype ~= sql.type.SQLITE then
        return nil, internal("unsupported ledger dialect", dbtype)
    end
    return dbtype, nil
end

local function prior_states(tx: any, owner_id: string, source_port: string, outcomes: { Map }, dbtype: string): ({ [string]: Map }?, error?)
    local items: {Map}={}
    for _,outcome in ipairs(outcomes) do items[#items+1]=outcome.item end
    local rows,err=read_identities(tx,owner_id,source_port,items,dbtype == sql.type.POSTGRES)
    if err or not rows then return nil,err end
    local out: {[string]: Map}={}
    for _,row in ipairs(rows) do out[row.item_key .. "\n" .. row.identity_key]=row end
    return out,nil
end

local BATCH = 49 -- 20 per-item binds and two shared binds stay below SQLite's 999-variable floor.

local function resolve_rows(tx: any, owner_id: string, source_port: string, rows: { Map },
        now: string): error?
    table.sort(rows, function(a: Map, b: Map): boolean
        if a.key ~= b.key then return a.key < b.key end
        return a.identity < b.identity
    end)
    for first = 1, #rows, BATCH do
        local params: { any } = { now, owner_id, source_port }
        local matches: { string } = {}
        for index = first, math.min(#rows, first + BATCH - 1) do
            local row = rows[index]
            params[#params + 1] = row.key
            params[#params + 1] = row.identity
            matches[#matches + 1] = "(item_key = $" .. tostring(#params - 1)
                .. " AND identity_key = $" .. tostring(#params) .. ")"
        end
        local _, err = tx:execute("UPDATE " .. M.TABLE .. " SET state='resolved', next_attempt_at=NULL,"
            .. " resolved_at=$1, expires_at=NULL, updated_at=$1 WHERE owner_id=$2 AND source_port=$3 AND ("
            .. table.concat(matches, " OR ") .. ")", params)
        if err then return internal("failed to resolve ledger items", err) end
    end
    return nil
end

local function upsert_rows(tx: any, rows: { { any } }, dbtype: string): error?
    table.sort(rows, function(a: { any }, b: { any }): boolean
        if a[1] ~= b[1] then return a[1] < b[1] end
        if a[2] ~= b[2] then return a[2] < b[2] end
        if a[3] ~= b[3] then return a[3] < b[3] end
        return a[5] < b[5]
    end)
    for first = 1, #rows, BATCH do
        local params: { any } = {rows[first][1],rows[first][2]}
        local values: { string } = {}
        for index = first, math.min(#rows, first + BATCH - 1) do
            local marks: { string } = {}
            for position = 3,#rows[index] do
                local value=rows[index][position]
                params[#params + 1] = value
                local mark = "$" .. tostring(#params)
                if dbtype == sql.type.POSTGRES then
                    if position == 19 then mark = "CAST(" .. mark .. " AS BIGINT)" end
                    if position == 8 then mark = "CAST(" .. mark .. " AS INTEGER)" end
                    if position == 14 or position == 15 or position == 21 then mark = "CAST(" .. mark .. " AS BOOLEAN)" end
                end
                marks[#marks + 1] = mark
            end
            values[#values + 1] = "(" .. table.concat(marks, ",") .. ")"
        end
        local columns="item_key,dedup_key,identity_key,envelope_json,state,attempts,first_failed_at,last_failed_at,"
            .. "next_attempt_at,error_code,error_message,retriable,terminal,created_at,updated_at,expires_at,delivery_order,execution_identity_json,identity_parked,classification"
        local _, err = tx:execute("WITH shared(owner_id,source_port) AS (VALUES ($1,$2)), input(" .. columns
            .. ") AS (VALUES " .. table.concat(values,",") .. ") INSERT INTO " .. M.TABLE
            .. " (owner_id,source_port," .. columns .. ") SELECT shared.owner_id,shared.source_port,input.* FROM shared CROSS JOIN input"
            .. " WHERE true ORDER BY 1, 2, 3, 5"
            .. " ON CONFLICT (owner_id, source_port, item_key, identity_key) DO UPDATE SET"
            .. " envelope_json=excluded.envelope_json, state=excluded.state, attempts=excluded.attempts,"
            .. " last_failed_at=excluded.last_failed_at, next_attempt_at=excluded.next_attempt_at,"
            .. " error_code=excluded.error_code, error_message=excluded.error_message,"
            .. " retriable=excluded.retriable, terminal=excluded.terminal,"
            .. " resolved_at=NULL, expires_at=excluded.expires_at, updated_at=excluded.updated_at,delivery_order=excluded.delivery_order,"
            .. " execution_identity_json=COALESCE(" .. M.TABLE .. ".execution_identity_json,excluded.execution_identity_json),identity_parked=excluded.identity_parked,classification=excluded.classification", params)
        if err then return internal("failed to record ledger items", err) end
    end
    return nil
end

-- record_tx keeps the drive's ledger count and all item writes in the caller's
-- fenced transaction. Reads use bounded key lists; writes use bounded batches.
function M.record_tx(tx: any, owner_id: string, source_port: string, outcomes: { Map }, now: string, resolved_expires_at: string): (integer?, error?, boolean?, Map?)
    local dbtype, type_err = dialect(tx)
    if type_err or not dbtype then return nil, type_err end
    for _, o in ipairs(outcomes) do identity.bind({ automation_id = owner_id, source_port = source_port }, o.item) end
    local prior, prior_err = prior_states(tx, owner_id, source_port, outcomes, dbtype)
    if prior_err or not prior then return nil, prior_err end
    local delta = 0
    local resolves: { Map } = {}
    local upserts: { { any } } = {}
    local terminal_work = false
    for _, o in ipairs(outcomes) do
        local item = o.item :: Map
        local identity = tostring(item.delivery_key)
        local existing = prior[tostring(item.item_key) .. "\n" .. identity]
        local was_unresolved = existing ~= nil and UNRESOLVED[tostring(existing.state)] == true
        if o.state == M.STATE.RESOLVED then
            if existing == nil then
                local envelope,encode_err=json.encode(item)
                if encode_err then return nil,internal("failed to encode a classified item",encode_err) end
                local bound_err=row_limit.check(envelope,"ledger_row",owner_id)
                if bound_err then return nil,bound_err end
                upserts[#upserts+1]={owner_id,source_port,item.item_key,item.dedup_key,identity,envelope,
                    M.STATE.RESOLVED,0,now,now,sql.NULL,"unknown",sql.NULL,false,false,now,now,
                    sql.NULL,item.delivery_order or 0,o.execution_identity_json or sql.NULL,false,o.classification or "skipped"}
            elseif existing.state ~= M.STATE.RESOLVED then
                resolves[#resolves + 1] = { key = item.item_key, identity = identity }
                if was_unresolved then delta = delta - 1 end
            elseif existing.classification ~= nil and o.classification ~= nil and existing.classification ~= o.classification then
                local _,classify_err=tx:execute("UPDATE " .. M.TABLE .. " SET classification=$1,updated_at=$2"
                    .. " WHERE owner_id=$3 AND source_port=$4 AND item_key=$5 AND identity_key=$6",
                    {o.classification,now,owner_id,source_port,item.item_key,identity})
                if classify_err then return nil,internal("failed to update item classification",classify_err) end
            end
        else
            local stored: Map = {}
            for k, v in pairs(item) do if k ~= "attempts" then stored[k] = v end end
            if existing then
                local prior_item, decode_err = json.decode(tostring(existing.envelope_json))
                if decode_err then return nil, internal("failed to decode prior ledger item", decode_err) end
                if stored.reservation == nil and type(prior_item) == "table" and prior_item.reservation ~= nil then stored.reservation = prior_item.reservation end
            end
            local envelope, enc_err = json.encode(stored)
            if enc_err then return nil, internal("failed to encode a ledger item", enc_err) end
            local row_body, body_err = canonical_json.encode({ owner_id = owner_id,
                source_port = source_port, item_key = item.item_key,
                identity_key = identity, envelope_json = envelope,
                state = o.state, next_attempt_at = o.next_attempt_at, error = o.error })
            if body_err then return nil, internal("failed to encode a ledger row", body_err) end
            local row_err = row_limit.check(row_body, "ledger_row", owner_id)
            if row_err then return nil, row_err end
            local e = type(o.error) == "table" and o.error or {}
            local counts_attempt = o.state ~= M.STATE.WAITING
            local attempts = (existing and math.floor(tonumber(existing.attempts) or 0) or 0) + (counts_attempt and 1 or 0)
            upserts[#upserts + 1] = { owner_id, source_port, item.item_key, item.dedup_key, identity, envelope, o.state, attempts,
                existing and existing.first_failed_at or now, now,
                o.next_attempt_at == nil and sql.NULL or o.next_attempt_at,
                tostring(e.code or e.kind or "unknown"), e.message and tostring(e.message) or sql.NULL,
                e.retriable ~= false, o.state == M.STATE.DEAD, now, now,
                sql.NULL,
                item.delivery_order or 0, o.execution_identity_json or sql.NULL, o.identity_parked == true, sql.NULL }
            if o.state == M.STATE.DEAD then terminal_work = true end
            local is_unresolved = UNRESOLVED[tostring(o.state)] == true
            if is_unresolved and not was_unresolved then delta = delta + 1 end
            if was_unresolved and not is_unresolved then delta = delta - 1 end
        end
    end
    local resolve_err = resolve_rows(tx, owner_id, source_port, resolves, now)
    if resolve_err then return nil, resolve_err end
    local upsert_err = upsert_rows(tx, upserts, dbtype)
    if upsert_err then return nil, upsert_err end
    return delta, nil, terminal_work or #resolves > 0, prior
end

-- Drive and ledger locks keep the reservation and the drive's unresolved
-- count atomic. The SQL conflict predicate is the send gate even
-- when another reservation won after the initial read.
function M.reserve_uncertain_tx(tx: any, owner: string, port: string, item: Map,
        reservation: Map, now: string, execution_identity_json: string?): (Map?, integer?, error?)
    identity.bind({ automation_id = owner, source_port = port }, item)
    local function read(): (Map?, error?)
        local rows, err = tx:query("SELECT state,envelope_json,error_code FROM " .. M.TABLE
            .. " WHERE owner_id=$1 AND source_port=$2 AND item_key=$3 AND identity_key=$4",
            { owner, port, item.item_key, item.delivery_key })
        if err then return nil, internal("failed to read pre-send reservation", err) end
        return (rows :: { Map })[1], nil
    end
    local function existing(prior: Map): (Map?, error?)
        if prior.state == M.STATE.RESOLVED and prior.error_code == "discarded" then
            return { send = false, state = "delivered" }, nil
        end
        if prior.state ~= M.STATE.UNCERTAIN then return nil, nil end
        local stored, decode_err = json.decode(tostring(prior.envelope_json))
        if decode_err then return nil, internal("failed to decode pre-send reservation", decode_err) end
        local bound = (stored :: Map).reservation
        if type(bound) == "table" and (bound.key ~= reservation.key or bound.op ~= reservation.op or bound.hash ~= reservation.hash) then
            return nil, (errors.new({ kind = errors.CONFLICT, retryable = false,
                message = "pre-send reservation is bound to another operation or payload",
                details = { reason = "idempotency_conflict" } }) :: error)
        end
        return { send = false, state = "uncertain" }, nil
    end
    local prior, read_err = read()
    if read_err then return nil, nil, read_err end
    if prior then
        local decision, decision_err = existing(prior)
        if decision_err then return nil, nil, decision_err end
        if decision then return decision, 0, nil end
    end
    local stored: Map = {}
    for k, v in pairs(item) do if k ~= "attempts" then stored[k] = v end end
    stored.reservation = reservation
    local envelope, encode_err = json.encode(stored)
    if encode_err then return nil, nil, internal("failed to encode pre-send reservation", encode_err) end
    local row_body, body_err = canonical_json.encode({ owner_id = owner, source_port = port,
        item_key = item.item_key, identity_key = item.dedup_key, envelope_json = envelope,
        state = M.STATE.UNCERTAIN, error = { code = "uncertain", retriable = false } })
    if body_err then return nil, nil, body_err end
    local row_err = row_limit.check(row_body, "ledger_row", owner)
    if row_err then return nil, nil, row_err end
    local changed, cas_err = tx:execute("INSERT INTO " .. M.TABLE
        .. " (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,attempts,"
        .. " first_failed_at,last_failed_at,error_code,retriable,terminal,created_at,updated_at,delivery_order,execution_identity_json)"
        .. " VALUES ($1,$2,$3,$4,$5,$6,'uncertain',1,$7,$7,'uncertain',false,false,$7,$7,$8,$9)"
        .. " ON CONFLICT(owner_id,source_port,item_key,identity_key) DO UPDATE SET"
        .. " envelope_json=excluded.envelope_json,state='uncertain',classification=NULL,attempts=" .. M.TABLE .. ".attempts+1,"
        .. " last_failed_at=excluded.last_failed_at,next_attempt_at=NULL,error_code='uncertain',"
        .. " error_message=NULL,retriable=false,terminal=false,resolved_at=NULL,expires_at=NULL,updated_at=excluded.updated_at,execution_identity_json=COALESCE(" .. M.TABLE .. ".execution_identity_json,excluded.execution_identity_json)"
        .. " WHERE " .. M.TABLE .. ".state<>'uncertain' AND NOT (" .. M.TABLE
        .. ".state='resolved' AND " .. M.TABLE .. ".error_code='discarded')",
        { owner, port, item.item_key, item.dedup_key, item.delivery_key, envelope, now, item.delivery_order or 0, execution_identity_json or sql.NULL })
    if cas_err or not changed or tonumber(changed.rows_affected) == nil then
        return nil, nil, internal("failed to reserve pre-send uncertainty", cas_err or "missing affected-row count")
    end
    if tonumber(changed.rows_affected) == 0 then
        local winner, winner_err = read()
        if winner_err then return nil, nil, winner_err end
        if not winner then return nil, nil, internal("reservation CAS lost without a winner", item.dedup_key) end
        local decision, decision_err = existing(winner)
        if decision_err then return nil, nil, decision_err end
        if not decision then return nil, nil, internal("reservation CAS winner has invalid state", winner.state) end
        return decision, 0, nil
    end
    return { send = true }, prior and UNRESOLVED[tostring(prior.state)] and 0 or 1, nil
end

-- Outcomes that can return without a sink effect: a deterministic refusal
-- (dead, parked) and a capacity wait. A retriable failure or an uncertain
-- send may have reached the sink.
local REFUSED: { [string]: boolean } = { dead = true, parked = true, waiting = true }

-- refusal(outcome) -> whether a recorded outcome proves its attempt left no
-- sink effect: a refusal raised by the sink as an error or before its call.
-- A failure answered with receipts wrote destinations, and an unacknowledged
-- answer may have been applied.
local function refusal(outcome: Map): boolean
    if not REFUSED[tostring(outcome.state)] then return false end
    local failure = type(outcome.error) == "table" and (outcome.error :: Map) or {}
    return failure.sink_effect ~= true and failure.code ~= failure_classification.UNACKNOWLEDGED
end

-- unsent(executor, d, delivery_key) -> whether the retained item now under
-- delivery_key provably never reached its sink: the delivery history holds an
-- outcome for every attempt the ledger counts across the item's delivery keys
-- (each replay's attempt generation), and every outcome is a refusal. The
-- ledger keeps only the last failure, so pruned history proves nothing.
function M.unsent(executor: any, d: Map, delivery_key: string): (boolean?, error?)
    local owner = tostring(d.automation_id)
    local port = tostring(d.ledger_port or d.source_port)
    local rows, err = executor:query("SELECT item_key,attempts,envelope_json FROM " .. M.TABLE
        .. " WHERE owner_id=$1 AND source_port=$2 AND identity_key=$3", { owner, port, delivery_key })
    if err then return nil, internal("failed to read the retained delivery", err) end
    local row = (rows :: { Map })[1]
    if not row then return false, nil end
    local envelope, decode_err = json.decode(tostring(row.envelope_json))
    if decode_err or type(envelope) ~= "table" then return nil, internal("retained delivery is not JSON", decode_err) end
    local item: Map = {}
    for k, v in pairs(envelope :: Map) do item[k] = v end
    local outcomes, outcomes_err, complete = history.attempts(executor, owner, port, tostring(row.item_key), identity.family(d,item))
    if outcomes_err or not outcomes then return nil, outcomes_err end
    if complete == false or #outcomes == 0 then return false,nil end
    local attempts = 0
    for _, outcome in ipairs(outcomes) do
        if not refusal(outcome) then return false, nil end
        if outcome.state ~= M.STATE.WAITING then attempts = attempts + 1 end
    end
    return attempts == math.floor(tonumber(row.attempts) or 0), nil
end

-- Bounded maintenance expires resolved tombstones. Dead evidence remains
-- until its owner is removed, regardless of a stored expiry timestamp.
local function prune_page(tx: any, cutoff: string, limit: integer, orphan: boolean): (integer?, error?)
    local predicate = orphan and [[updated_at <= $1 AND state IN ('resolved','dead')
        AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=l.owner_id)
        AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c
                        WHERE c.automation_id=l.owner_id AND c.pending_request_id IS NOT NULL)]]
        or "expires_at <= $1 AND state='resolved'"
    -- Retain delivery proof until its prepared output has been reclaimed, even
    -- when bounded passes visit the two tables in different key orders.
    local prepared_guard = [[ AND NOT EXISTS (SELECT 1 FROM kickside_automation_prepared p
        WHERE p.automation_id=l.owner_id AND p.idempotency_key=l.identity_key)]]
    local rows, read_err = tx:query("SELECT owner_id,source_port,item_key,identity_key FROM " .. M.TABLE
        .. " l WHERE " .. predicate .. prepared_guard .. " ORDER BY owner_id,source_port,item_key,identity_key LIMIT $2",
        { cutoff, limit })
    if read_err or type(rows) ~= "table" then return nil, internal("ledger prune page read failed", read_err or "missing result") end
    local count = 0
    local orphan_guard = orphan and [[ AND NOT EXISTS
        (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=l.owner_id)
        AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c
                        WHERE c.automation_id=l.owner_id AND c.pending_request_id IS NOT NULL)]] or ""
    local cutoff_field = orphan and "updated_at" or "expires_at"
    local states = orphan and "state IN ('resolved','dead')" or "state='resolved'"
    for _, row in ipairs(rows) do
        local deleted, delete_err = tx:execute("DELETE FROM " .. M.TABLE .. " AS l"
            .. " WHERE owner_id=$1 AND source_port=$2 AND item_key=$3 AND identity_key=$4"
            .. " AND " .. states .. " AND " .. cutoff_field .. "<=$5" .. orphan_guard .. prepared_guard,
            { row.owner_id, row.source_port, row.item_key, row.identity_key, cutoff })
        if delete_err or not deleted or tonumber(deleted.rows_affected) == nil then
            return nil, internal("ledger prune delete failed", delete_err or "missing affected-row count")
        end
        if tonumber(deleted.rows_affected) == 1 then count = count + 1 end
    end
    return count, nil
end

function M.prune_tx(tx: any, now: string, limit: integer): (integer?, error?)
    return prune_page(tx, now, limit, false)
end

-- Once an automation has neither a drive nor a pending command that can install
-- one, unresolved rows have no recovery owner. Keep a retention window for a
-- racing handoff, then reclaim them in indexed batches on the dispatcher slot.
function M.prune_orphans_tx(tx: any, cutoff: string, limit: integer): (integer?, error?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil, (errors.new({ message = "ledger orphan retention cutoff and limit 1..1000 required",
            kind = errors.INVALID }) :: error)
    end
    return prune_page(tx, cutoff, limit, true)
end

return M
