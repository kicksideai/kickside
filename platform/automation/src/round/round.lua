-- The automation round (design v5 §4.1, §4.2, §4.4): the worker every drive
-- slot runs (kickside.automation:round, A21). One attempt:
--
--   1. recover  -- the drive's pending command step runs first (recover_drive);
--                  a drive still pending holds its stamp until the step's next
--                  attempt; a removed drive cancels its slot;
--   2. stamp    -- claim.stamp_tx: occupancy, pause/block, schedule due time and
--                  the persisted timer occurrence;
--   3. acquire  -- redelivery of due ledger items first, then one bounded page
--                  from the source, both under the live execution identity.
--                  A round whose acquisition is not due only redelivers
--                  (A28.3), and so does a round whose acquisition fails: it
--                  delivers the due items, keeps its position and records the
--                  failure on the drive. A drive whose unresolved items reach
--                  round.max_unresolved pulls nothing and shows backpressure
--                  until redelivery drains it (§4.11); a collection's scheduled pass ends after
--                  round.max_pages pages or round.max_items items and resumes
--                  from its cursor at the next due time (§8);
--   4. deliver  -- the kind's round consumer, or a schedule drive's declared
--                  action, under the same identity;
--   5. commit   -- the fenced automation-DB commit, then the retention pin
--                  raise, then the slot completion that rearms or parks it.
--                  The position advances past the whole page: an item the
--                  round did not deliver retries from the ledger in its
--                  record's order and never holds the items after it.
--
-- No transaction spans a provider call. The stamp holds the drive for
-- round.timeout, or until the job's execution ceiling when that is nearer;
-- the round token and that deadline are checked again before delivery. The
-- pull and the delivery run under a work deadline round.commit_reserve before
-- it, so the round commits its own outcome before the ceiling ends it. A deterministic declaration, access or identity
-- failure blocks the drive visibly and parks the slot; any other failure keeps
-- the drive degraded and rearms the slot with capped jitter, without a terminal
-- limit. The slot is completed here (self_completed), with the lease the
-- attempt was dispatched with.

local sql = require("sql")
local json = require("json")
local time = require("time")
local automation_db = require("automation_db")
local with_db, in_tx = automation_db.with_db, automation_db.in_tx
local drive = require("drive")
local registry = require("registry")
local jobs = require("jobs")
local slot = require("slot")
local execution_identity = require("execution_identity")
local provenance = require("round_provenance")
local automations_lib = require("automations_lib")
local runtime_policy = require("runtime_policy")
local claim = require("round_claim")
local ledger = require("round_ledger")
local outcome = require("round_outcome")
local position = require("round_position")
local reconcile = require("round_reconcile")
local commit = require("round_commit")
local component = require("component")

local M = {}

type Map = { [string]: any }

local ROUND_CONSUMER = "kickside.trigger:round_consumer"

-- The trusted owner entry the round resolves stored identities as (IDENTITY-1
-- deferred resolution): the drive slot worker.
M.OWNER = "kickside.automation:round"
local ACQUIRE = "kickside.automation:round_acquire"
local DELIVER = "kickside.automation:round_deliver"


M.backoff_ms = outcome.backoff_ms
local classify = outcome.classify

-- after_ms(timestamp, ms) -> the canonical timestamp ms after `timestamp`.
local function after_ms(timestamp: string, ms: integer): string
    local parsed = time.parse(time.RFC3339, timestamp)
    return (parsed :: any):utc():add(ms * time.MILLISECOND):format(time.RFC3339)
end

local function earliest(a: string?, b: string?): string?
    if a == nil then return b end
    if b == nil then return a end
    return a < b and a or b
end

-- The automation's implementation and stored execution identity, or
-- get_runtime's typed failure: a missing automation blocks the drive on its
-- declaration, an infrastructure failure stays retriable.
local function automation_of(automation_id: string): (Map?, any)
    local runtime, err = automations_lib.get_runtime({ id = automation_id })
    if err then return nil, err end
    return { impl_id = (runtime :: Map).type, identity = (runtime :: Map).execution_identity }, nil
end

local function implements(impl_id: string, contract_id: string): boolean
    local entry = registry.get(impl_id)
    local data = type(entry) == "table" and (entry :: Map).data or nil
    for _, c in ipairs(type(data) == "table" and type(data.contracts) == "table" and data.contracts or {}) do
        if type(c) == "table" and c.contract == contract_id then return true end
    end
    return false
end

-- run_as(ctx.deps, identity, target, args) -> the envelope a round function answered,
-- or the failure (resolution or call) with its error_kind.
local function run_as(deps: Map, identity: any, target: string, args: Map): (Map?, Map?, string?)
    local answer, err = deps.run_as(identity, target, args, { deferred_owner = M.OWNER })
    if err ~= nil then
        local failure, error_kind = classify(err)
        return nil, failure, error_kind
    end
    if type(answer) ~= "table" then return nil, classify("round function " .. target .. " answered nothing") end
    if (answer :: Map).success ~= true then
        local failure = type((answer :: Map).error) == "table" and (answer :: Map).error or classify((answer :: Map).error)
        return nil, failure :: Map, nil
    end
    return answer :: Map, nil, nil
end

local function logger(deps: Map): any
    return deps.logger:named("automation.round")
end

-- complete(ctx, rearm?, parked?) completes the slot attempt: rearmed at
-- `rearm`, parked (wake_enabled off until a control wake) or left pending
-- for wake demand.
local function complete(ctx: Map, rearm: string?, parked: boolean?, error_text: string?): (Map?, error?)
    local job = ctx.job :: Map
    local options: Map = { rearm = rearm }
    if parked then options.record = { status = "parked", error = error_text } end
    local result, err = ctx.deps.jobs.complete(job.id, { token = job.lease_token, execution_seq = job.execution_seq }, options)
    if err then return nil, err end
    return { self_completed = true, completion = result }, nil
end

-- A component notification is a wakeup to read canonical committed status.
-- Keep drive state out of public meta and never notify inside the transaction.
local function notify_status(ctx: Map, automation_id: string): error?
    local _, err = ctx.deps.notify_access(automation_id, nil, {
        event = "component.meta.changed", component_id = automation_id, meta = {}, deleted = {},
    })
    return err
end

-- A round fence blocks receipt retention. Once its transaction releases that
-- fence, a dispatcher pass which overlapped the round must run again: it saw
-- the blocker and could not safely retire an otherwise-aged receipt.
local function wake_dispatcher_after_release(committed: Map?): error?
    if not committed or not committed.committed then return nil end
    local _, err = slot.wake_dispatcher()
    return err
end

-- round_failure(failure, error_kind, prior_attempts, rp) -> the failure a
-- round records on its drive: the phase it leaves and, unless it parks, the
-- capped jittered retry time.
local function round_failure(failure: Map, error_kind: string?, prior_attempts: integer, rp: Map): Map
    local phase, parks = outcome.failure_phase(failure, error_kind)
    local attempts = prior_attempts + 1
    return { phase = phase, error = failure, error_kind = error_kind, attempts = attempts,
        next_run_at = not parks and outcome.retry_at(failure, attempts, rp) or nil }
end

local function settle(ctx: Map, round: Map, failure: Map, error_kind: string?, prior_attempts: integer, rp: Map): (Map?, error?)
    local recorded = round_failure(failure, error_kind, prior_attempts, rp)
    local settled, settle_err = in_tx(function(tx: any): (any?, error?)
        return commit.settle_tx(tx, round, recorded)
    end)
    if settle_err then return nil, settle_err end
    logger(ctx.deps):warn("round failed", { automation_id = round.automation_id, drive_key = round.drive_key, phase = recorded.phase,
        error = failure.message, fenced = not (settled :: Map).committed })
    if not (settled :: Map).committed then return complete(ctx, drive.utc_now()) end
    local wake_err = wake_dispatcher_after_release(settled :: Map)
    if wake_err then return nil, wake_err end
    local notify_err = notify_status(ctx, round.automation_id)
    if notify_err then return nil, notify_err end
    local parks = recorded.next_run_at == nil
    return complete(ctx, recorded.next_run_at, parks, parks and tostring(failure.message) or nil)
end

local function prior_attempts(d: Map): integer
    local raw = d.last_error_json
    if type(raw) ~= "string" or raw == "" then return 0 end
    local decoded = json.decode(raw)
    return type(decoded) == "table" and math.floor(tonumber((decoded :: Map).attempts) or 0) or 0
end

-- The rearm of a slot after a committed round: at once when it continues,
-- else the earlier of its next due time and its next ledger redelivery.
local function rearm_after(round: Map, continues: boolean, next_due: string?, unresolved_count: integer): (string?, error?)
    if continues then next_due = next_due or round.now end
    -- The fenced commit's durable count includes this page's ledger writes.
    -- With no unresolved item, no retrying/waiting row can schedule a wake.
    if unresolved_count == 0 then return next_due, nil end
    local ledger_next, ledger_err = with_db(function(db: any): (any?, error?)
        return ledger.next_attempt(db, round.automation_id, round.source_port, round.now)
    end)
    if ledger_err then return nil, ledger_err end
    return earliest(next_due, ledger_next :: string?), nil
end

-- run(deps, input) -> the worker output. input = { job = { id, lease_token,
-- execution_seq, lease_until }, payload = { automation_id, drive_key } }.
local function run(deps: Map, input: any): (Map?, error?)
    local job = type(input) == "table" and type((input :: Map).job) == "table" and (input :: Map).job or {}
    local ctx: Map = { deps = deps, job = job }
    local payload = type(input) == "table" and type((input :: Map).payload) == "table" and (input :: Map).payload or {}
    local automation_id, drive_key = tostring(payload.automation_id or ""), tostring(payload.drive_key or "")
    if automation_id == "" or drive_key == "" then
        return nil, errors.new({ message = "a round slot names its automation and drive", kind = errors.INVALID })
    end
    if type(job.deadline) ~= "string" or job.deadline == "" then
        return nil, errors.new({ message = "a round runs under its job's execution deadline", kind = errors.INVALID })
    end
    local policy, policy_err = deps.policy()
    if policy_err or not policy then return nil, policy_err end
    local p = policy :: Map

    -- The locked stamp read already tells us whether this drive has a pending
    -- command. A normal round needs no separate recovery read/transaction.
    -- When a command is pending, the first stamp parks without writing; run
    -- its step outside the transaction, then stamp the resulting drive.
    local s: Map = {}
    local now = drive.utc_now()
    for attempt = 1, 2 do
        if attempt > 1 then now = drive.utc_now() end
        local stamped, stamp_err = in_tx(function(tx: any): (any?, error?)
            return claim.stamp_tx(tx, automation_id, drive_key, { token = job.lease_token, deadline = job.deadline }, now)
        end)
        if stamp_err then
            local failure = classify(stamp_err)
            local _, parks = outcome.failure_phase(failure)
            if not parks then return nil, stamp_err end
            return complete(ctx, nil, true, tostring(failure.message))
        end
        s = stamped :: Map
        local observed = type(s.drive) == "table" and (s.drive :: Map) or nil
        if observed and observed.pin_advance_cursor ~= nil then
            local _, pin_err = automations_lib.advance_pin(automation_id, drive_key)
            if pin_err then return nil, pin_err end
        end
        if attempt == 1 and observed and observed.pending_command_id ~= nil then
            local recovered, recover_err = (deps.recover_drive or automations_lib.recover_drive)(automation_id, drive_key)
            if recover_err then
                if errors.is(recover_err, errors.NOT_FOUND) then return complete(ctx, nil, true, "drive removed") end
                return nil, recover_err
            end
            local rec = recovered :: Map
            if rec.state == "removed" then return complete(ctx, nil, true, "drive removed") end
            if not rec.stamp then
                return complete(ctx, rec.next_attempt_at or drive.utc_after(p.round_retry_after_ms))
            end
        else
            break
        end
    end
    if s.state == claim.STATE.MISSING then return complete(ctx, nil, true, "drive removed") end
    if s.state == claim.STATE.OCCUPIED then
        -- rearm = max(now, the holder's deadline) + the round retry (design v5 §4.2).
        local base = s.rearm_after > now and s.rearm_after or now
        return complete(ctx, after_ms(base, p.round_retry_after_ms))
    end
    if s.state == claim.STATE.PARKED then return complete(ctx, nil, true, s.reason or ("drive " .. tostring((s.drive :: Map).phase))) end
    if s.state == claim.STATE.IDLE then
        local notify_err = notify_status(ctx, automation_id)
        if notify_err then return nil, notify_err end
        return complete(ctx, s.rearm)
    end

    local d = s.drive :: Map
    local action = type(d.action) == "table" and d.action or {}
    -- The drive policy its declaration applied (design v5 §8): round limits,
    -- pacing and item delivery retry.
    local applied = d.applied :: Map
    local rp, dlv = (applied.policy :: Map).round :: Map, (applied.policy :: Map).delivery :: Map
    -- The round's fence: the drive fields the stamp captured and the lease of
    -- the job the round runs under, both checked before every provider send.
    local captured = s.captured :: Map
    captured.job = { id = job.id, lease_token = job.lease_token, execution_seq = job.execution_seq }
    -- Provider work ends by the work deadline; the reserve after it is the commit's.
    local work_deadline = after_ms(tostring(captured.round_until), -(p.round_commit_reserve_ms :: integer))
    local round: Map = {
        automation_id = automation_id, drive_key = drive_key, captured = captured,
        source_port = ledger.source_port(d), receipt_port = ledger.receipt_port(d), now = now,
        resolved_expires_at = drive.utc_after(p.ledger_resolved_ms),
    }
    local attempts = prior_attempts(d)

    local auto, auto_err = automation_of(automation_id)
    if auto_err or not auto then
        local failure, kind = classify(auto_err)
        return settle(ctx, round, failure, kind, attempts, rp)
    end
    if not implements(tostring((auto :: Map).impl_id), ROUND_CONSUMER) then
        -- The kind has no round consumer: its items are delivered elsewhere.
        local released, release_err = in_tx(function(tx: any): (any?, error?)
            return commit.release_tx(tx, round)
        end)
        if release_err then return nil, release_err end
        local wake_err = wake_dispatcher_after_release(released :: Map?)
        if wake_err then return nil, wake_err end
        return complete(ctx, nil, true, "kind implements no round consumer")
    end
    local identity = (auto :: Map).identity

    local redelivery, due_err = with_db(function(db: any): (any?, error?)
        return ledger.due_tx(db, automation_id, round.source_port, now, rp.redelivery_per_round)
    end)
    if due_err then return settle(ctx, round, classify(due_err), nil, attempts, rp) end

    local collection = d.source_kind == drive.SOURCE_KIND.COLLECTION
    local reconciling = d.source_kind == drive.SOURCE_KIND.RECONCILE
    local manual = d.source_kind == drive.SOURCE_KIND.MANUAL
    local backpressure = (d.unresolved_count :: integer) >= rp.max_unresolved
    local limit = rp.page_size
    if collection and rp.max_items > 0 then limit = math.min(limit, rp.max_items - (d.pass_items :: integer)) end
    local occurrence: Map? = nil
    if d.occurrence_seq ~= nil then
        occurrence = { occurrence_seq = d.occurrence_seq, occurrence_due_at = d.occurrence_due_at,
            occurrence_key = d.occurrence_key, occurrence_payload_json = d.occurrence_payload_json }
    end
    -- A round acquires when its acquisition is due and the drive is not in
    -- backpressure; otherwise it only redelivers due ledger items.
    local acquiring = s.acquire == true and not backpressure
    local pulls = acquiring and limit > 0 and ((d.source_kind ~= drive.SOURCE_KIND.TIMER and not manual) or occurrence ~= nil)
        and not (reconciling and d.sweep_pending)
    -- acquire() -> the page the round acquired and a reconcile sweep's stale
    -- receipt count, or the acquisition failure and its error_kind. A reconcile
    -- drive's sweep hands the stale receipts to its consumer as delete items (A33).
    local function acquire(): (Map?, integer?, Map?, string?)
        if acquiring and reconciling and d.sweep_pending then
            local stale, stale_err = with_db(function(db: any): (any?, error?)
                return reconcile.stale(db, round, d, limit)
            end)
            if stale_err then return nil, nil, classify(stale_err) end
            return { items = reconcile.delete_items(stale :: { string }), has_more = false }, #(stale :: { string }), nil, nil
        end
        if not pulls then return { items = {}, has_more = false }, nil, nil, nil end
        local cursor: any = nil
        if type(d.cursor) == "string" and d.cursor ~= "" then
            local decoded, decode_err = json.decode(d.cursor)
            if decode_err then
                return nil, nil, outcome.declaration_failure("the drive cursor is not JSON: " .. tostring(decode_err)), "declaration"
            end
            cursor = decoded
        end
        local acquired, pull_failure, pull_kind = run_as(ctx.deps, identity, ACQUIRE, {
            automation_id = automation_id, drive_key = drive_key, source_kind = d.source_kind,
            fence = round.captured,
            source_ref = action.source_ref, source_thread_id = d.source_thread_id, event_type = action.event_type,
            config = action.config, cursor = cursor, event_seq = d.event_seq, occurrence = occurrence, pull_keys = action.pull_keys,
            limit = limit, deadline = work_deadline,
            idempotency_key = occurrence and occurrence.occurrence_key or ("round:" .. automation_id .. ":" .. drive_key .. ":" .. tostring(d.round_seq)),
        })
        if pull_failure then return nil, nil, pull_failure, pull_kind end
        if (acquired :: Map).source_gap ~= nil then
            return nil, nil, outcome.declaration_failure("the source pruned events past this drive's position; resync the automation"), "declaration"
        end
        return acquired, nil, nil, nil
    end
    local acquired_page, stale_count, acquire_failure, acquire_kind = acquire()
    -- Due redelivery does not depend on the source: a failed acquisition
    -- delivers the due ledger items like a drain-only round, keeps the
    -- position, occurrence and pass, and records the failure on the drive.
    if acquire_failure then acquiring = false end
    local page: Map = acquired_page or { items = {}, has_more = false }
    local items = outcome.merge_items({ automation_id = automation_id, drive_key = drive_key, source_port = round.receipt_port, delivery_revision = d.delivery_revision }, redelivery :: { Map }, page.items :: { Map })

    local admitted, admit_err = with_db(function(db: any): (any?, error?)
        return ledger.admit(db, automation_id, round.source_port, items, d.round_seq)
    end)
    if admit_err then return settle(ctx, round, classify(admit_err), nil, attempts, rp) end
    items = (admitted :: Map).items
    local fronts = (admitted :: Map).fronts

    -- Only an external send needs a read before it starts. An empty round has
    -- no effect to authorize here; commit_tx rechecks the captured fence under
    -- the drive lock before writing its position or completion.
    if #items > 0 then
        local still_ours: any, check_err: any
        if type(ctx.deps.check_before_send) == "function" then
            still_ours, check_err = ctx.deps.check_before_send(round, job)
        else
            still_ours, check_err = with_db(function(db: any): (any?, error?)
                local current, read_err = drive.get(db, automation_id, drive_key)
                if read_err then return nil, read_err end
                return current ~= nil and (current :: Map).round_token == job.lease_token
                    and tostring((current :: Map).round_until) > drive.utc_now(), nil
            end)
        end
        if check_err then return settle(ctx, round, classify(check_err), nil, attempts, rp) end
        if not still_ours then return complete(ctx, drive.utc_now()) end
    end

    local interrupted: Map? = nil
    local answered: Map = { delivered = {}, skipped = {}, waiting = {}, uncertain = {}, failed = {} }
    if #items > 0 then
        local effect_drive: Map = { automation_id=automation_id,automation_revision=d.command_generation,
            drive_key=drive_key,source_kind=d.source_kind,source_ref=action.source_ref,
            source_port=round.receipt_port,ledger_port=round.source_port,delivery_revision=d.delivery_revision,
            fence=round.captured,deadline=work_deadline }
        local keys: {string} = {}
        for _,item in ipairs(items) do keys[#keys+1]=item.delivery_key end
        local admissions,admission_err=provenance.admit(effect_drive,keys)
        if admission_err or not admissions then return settle(ctx,round,classify(admission_err),nil,attempts,rp) end
        local groups: {Map} = {}
        for _,item in ipairs(items) do
            local evidence=admissions.deliveries[item.delivery_key]
            local prior=groups[#groups]
            if not prior or prior.evidence.generation ~= evidence.generation
                or prior.evidence.unresolved ~= evidence.unresolved or prior.evidence.unavailable ~= evidence.unavailable then
                prior={evidence=evidence,items={}}
                groups[#groups+1]=prior
            end
            prior.items[#prior.items+1]=item
        end
        for _,group in ipairs(groups) do
            local stored,identity_err=provenance.identity(group.evidence)
            local historical=group.evidence.generation ~= admissions.identity_generation or group.evidence.unresolved == true
            local answer,deliver_failure,deliver_kind
            if interrupted then
                deliver_failure=interrupted
            elseif identity_err then
                deliver_failure,deliver_kind=classify(identity_err)
            else
                effect_drive.principal=stored.principal
                effect_drive.operator=stored.authorized_by
                answer,deliver_failure,deliver_kind=run_as(ctx.deps,stored,DELIVER,{
                    drive=effect_drive,items=group.items,config=applied.declaration,fronts=fronts,now=now })
            end
            if deliver_failure then
                if deliver_failure.kind ~= errors.PERMISSION_DENIED then
                    return settle(ctx,round,deliver_failure,deliver_kind,attempts,rp)
                end
                if not historical then interrupted=deliver_failure end
                for _,item in ipairs(group.items) do
                    answered.failed[#answered.failed+1]={key=item.delivery_key,error=deliver_failure,identity_parked=historical}
                end
            else
                for _,list in ipairs({"delivered","skipped","waiting","uncertain","failed"}) do
                    for _,entry in ipairs(answer.outcomes[list]) do
                        if historical and list == "failed" then entry.identity_parked=true end
                        answered[list][#answered[list]+1]=entry
                    end
                end
                if answer.interrupted and not historical then interrupted=answer.interrupted end
            end
        end
    end
    local ledger_outcomes, receipts = outcome.ledger_outcomes(items, answered, dlv)

    local result: Map = { outcomes = ledger_outcomes, receipts = receipts, backpressure = backpressure, acquired = acquiring }
    local continues = false
    local next_due: string? = nil
    if not acquiring then
        -- Nothing was pulled: the position, occurrence and due time stay, and
        -- a drain-only round rearms for the drive's next acquisition.
        if not backpressure then next_due = reconciling and d.reconcile_next_at or d.next_run_at end
    elseif reconciling then
        local spec: Map
        spec, continues = reconcile.after(d, page, stale_count, now,
            drive.utc_after((((applied.policy :: Map).reconcile :: Map).interval_ms) :: integer))
        result.reconcile = spec
        if spec.keys ~= nil and not spec.sweep then result.cursor = spec.cursor end
        next_due = spec.next_at
    elseif d.source_kind == drive.SOURCE_KIND.EVENT then
        local seq, position_failure = position.event_position(page, d)
        if position_failure then return settle(ctx, round, position_failure, "declaration", attempts, rp) end
        -- The events pullable returns the current cursor for an empty page.
        -- An unchanged position needs neither a drive position write nor a
        -- retention-pin transaction after commit.
        if page.next_cursor ~= nil and seq ~= d.event_seq then result.event_seq = seq end
        continues = page.has_more == true
    elseif collection or d.source_kind == drive.SOURCE_KIND.TIMER or manual then
        if collection then
            if page.next_cursor ~= nil then result.cursor = page.next_cursor end
            result.pass, continues = position.pass_after(d, page, pulls, rp)
        else
            result.consume_occurrence = occurrence ~= nil
            continues = page.has_more == true
        end
        if manual then
            continues = occurrence ~= nil and occurrence.occurrence_seq < d.event_seq
            if continues then next_due = now end
        elseif continues then
            next_due = now
        else
            local due, due_err = claim.next_due(d, now)
            if due_err then return settle(ctx, round, classify(due_err), "declaration", attempts, rp) end
            next_due = due
        end
    end
    if acquiring and page.has_more and tonumber(page.retry_after_ms) and page.retry_after_ms > 0 then
        local floor = drive.utc_after(math.floor(page.retry_after_ms))
        if next_due == nil or next_due < floor then next_due = floor end
        if result.reconcile then result.reconcile.next_at = next_due end
    end
    if acquiring and not reconciling then result.next_run_at = next_due end

    if interrupted then
        local failure, kind = classify(interrupted)
        if kind == nil and failure.kind == errors.PERMISSION_DENIED then kind="access" end
        result.failure = round_failure(failure, kind, attempts, rp)
    elseif acquire_failure then
        result.failure = round_failure(acquire_failure, acquire_kind, attempts, rp)
    end
    local committed, commit_err = in_tx(function(tx: any): (any?, error?)
        return commit.commit_tx(tx, round, result)
    end)
    if commit_err then return settle(ctx, round, classify(commit_err), nil, attempts, rp) end
    if not (committed :: Map).committed then return complete(ctx, drive.utc_now()) end
    local wake_err = wake_dispatcher_after_release(committed :: Map)
    if wake_err then return nil, wake_err end
    local notify_err = notify_status(ctx, automation_id)
    if notify_err then return nil, notify_err end
    for _, item_outcome in ipairs(ledger_outcomes) do
        if item_outcome.state == ledger.STATE.DEAD then
            logger(ctx.deps):warn("delivery failed permanently", { automation_id = automation_id,
                drive_key = drive_key, item_key = item_outcome.item.item_key,
                delivery_key = item_outcome.item.delivery_key, code = item_outcome.error.code,
                message = item_outcome.error.message })
        end
    end
    if result.event_seq ~= nil and d.pin_generation ~= nil then
        local _, pin_err = automations_lib.advance_pin(automation_id, drive_key)
        if pin_err then return nil, pin_err end
    end

    if result.failure then
        return complete(ctx,result.failure.next_run_at,result.failure.next_run_at == nil,
            tostring(result.failure.error.message))
    end

    -- A drained backpressured drive resumes pulling at once.
    if backpressure and ((committed :: Map).unresolved_count :: integer) < rp.max_unresolved then continues = true end
    local rearm, rearm_err = rearm_after(round, continues, next_due,
        (committed :: Map).unresolved_count :: integer)
    if rearm_err then return nil, rearm_err end
    return complete(ctx, rearm)
end

-- new(deps) -> a round runner { run(input) } over explicit dependencies:
-- deps = { jobs (slot completion), run_as (execution_identity.run_as),
-- policy (runtime_policy.policy), logger, notify_access (component notifier), recover_drive? (command recovery seam) }.
function M.new(deps: Map): (Map?, error?)
    for _, name in ipairs({ "jobs", "run_as", "policy", "logger", "notify_access" }) do
        if deps[name] == nil then
            return nil, (errors.new({ message = "round runner dependency " .. name .. " is required", kind = errors.INVALID }) :: error)
        end
    end
    return { run = function(input: any): (Map?, error?) return run(deps, input) end }, nil
end

-- production() -> the runner the drive slot worker runs.
function M.production(): (Map?, error?)
    return M.new({ jobs = jobs, run_as = execution_identity.run_as, policy = runtime_policy.policy,
        logger = require("logger"), notify_access = component.notify_access })
end

return M
