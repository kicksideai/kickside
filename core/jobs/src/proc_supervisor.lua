-- Shared process supervision for jobs and projection workers. It waits for
-- lifecycle messages, committed lease controls, and actual deadlines; it never
-- rereads liveness on a repeating timer.

local time = require("time")
local clock = require("clock")
local channel = require("channel")
local process = require("process")
local funcs = require("funcs")
local error_envelope = require("error_envelope")

local M = {}

local function outcome_error(kind: string, message: string, code: string, primary: error?): error
    local err = errors.new({kind = kind, message = message, retryable = false, details = {code = code}})
    if primary then return error_envelope.wrap_secondary(err, primary, message) end
    return err
end

-- A name already registered to this process is claimed: an in-place upgrade
-- keeps the PID, and with it every name the previous code registered.
function M.claim_or_owner(name: string, dependencies: any?): (boolean, string?, error?)
    local deps = dependencies or {}
    local proc = deps.process or process
    local names = deps.registry or proc.registry
    while true do
        local claimed, claim_err = names.register(name, nil, process.registry.CONSISTENT)
        if claimed and not claim_err then return true, nil, nil end
        if not claim_err then
            return false, nil, (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "singleton registration returns no claim: " .. name }) :: error)
        end
        if not errors.is(claim_err, errors.ALREADY_EXISTS) then return false, nil, claim_err end
        local owner, owner_err = names.lookup(name, process.registry.CONSISTENT)
        if owner_err and not errors.is(owner_err, errors.NOT_FOUND) then return false, nil, owner_err end
        if owner then
            if tostring(owner) == tostring(proc.pid()) then return true, nil, nil end
            return false, tostring(owner), nil
        end
    end
end

function M.claim_singleton(name: string, events_ch: any, dependencies: any?): (boolean, boolean, error?, string?)
    local deps = dependencies or {}
    local proc = deps.process or process
    local select = deps.channel or channel
    while true do
        local claimed, owner, claim_err = M.claim_or_owner(name, deps)
        if claim_err then return false, false, claim_err end
        if claimed then return true, false, nil end
        if owner then
            local monitored, monitor_err = proc.monitor(tostring(owner))
            if monitor_err then return false, false, monitor_err end
            if not monitored then
                return false, false, (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                    message = "singleton owner monitor returns no acknowledgement: " .. name }) :: error)
            end
            while true do
                local selected = select.select({ events_ch:case_receive() })
                local event = selected.value
                if selected.ok == false then return false, true, nil, nil end
                if type(event) == "table" and (event.kind == proc.event.CANCEL or event.kind == proc.event.OUTDATED) then
                    return false, true, nil, event.kind :: string
                end
                if type(event) == "table" and tostring(event.from) == tostring(owner)
                    and (event.kind == proc.event.EXIT or event.kind == proc.event.LINK_DOWN) then break end
            end
        end
    end
end

local CONTROL_TOPIC = "kickside.core.jobs:execution_control"
local EXECUTION_SIGNAL = "kickside.core.jobs:execution_signal"
local CONTROL_KINDS: { [string]: boolean } = { revoked = true, lease_renewed = true }
local NAME_PREFIX = "kickside.core.jobs.execution:"
local CHILD_PREFIX = "kickside.core.jobs.execution_child:"
local DEFAULT_TERMINATE_GRACE_MS = 2000
local FENCE_ATTEMPTS = 4
local FENCE_RETRY_MS = { 50, 150, 350 }

M.CONTROL_TOPIC = CONTROL_TOPIC
M.TERMINATE_GRACE_MS = DEFAULT_TERMINATE_GRACE_MS

function M.execution_name(job_id: string, lease_token: string): string
    return NAME_PREFIX .. job_id .. ":" .. lease_token
end

-- The execution child registers this name before its start fence. The runtime
-- drops it only when the child process completes, so its absence proves that
-- no child of the execution runs.
function M.child_name(job_id: string, lease_token: string): string
    return CHILD_PREFIX .. job_id .. ":" .. lease_token
end

function M.child_alive(job_id: string, lease_token: string): (boolean, error?)
    if lease_token == "" then return false, nil end
    local pid, lookup_err = process.registry.lookup(M.child_name(job_id, lease_token), process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, (errors.wrap(lookup_err, "job execution child lookup failed") :: error)
    end
    return pid ~= nil, nil
end

-- notify delivers one committed lease control (revocation or renewal) to the
-- token-qualified execution owner. Delivery runs in the execution_signal
-- function under the Jobs identity, so revoking and renewing principals need no
-- process messaging authority. Returns false when no owner is registered.
function M.notify(job_id: string, lease_token: string, execution_seq: number,
        kind: string, lease_until: string?): (boolean, error?)
    local sent, call_err = funcs.call(EXECUTION_SIGNAL, job_id, lease_token, execution_seq, kind, lease_until)
    if call_err then return false, call_err end
    return sent == true, nil
end

function M.signal_execution(job_id: string, lease_token: string, execution_seq: number,
        kind: string, lease_until: string?): (boolean, error?)
    if not CONTROL_KINDS[kind] then
        return false, (errors.new({ message = "unknown job execution control: " .. tostring(kind), kind = errors.INVALID }) :: error)
    end
    local name = M.execution_name(job_id, lease_token)
    local pid, lookup_err = process.registry.lookup(name, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, (errors.wrap(lookup_err, "job execution owner lookup failed") :: error)
    end
    if not pid then return false, nil end
    local sent, err = process.send(tostring(pid), CONTROL_TOPIC, {
        kind = kind,
        job_id = job_id,
        lease_token = lease_token,
        execution_seq = execution_seq,
        lease_until = lease_until,
    })
    if err then
        return false, (errors.wrap(err, "job execution notification failed") :: error)
    end
    return sent == true, nil
end

M.parse_deadline = clock.parse

local function remaining_ms(deadline: any): integer
    local ns = tonumber(deadline:sub(time.now()):nanoseconds()) or 0
    if ns <= 0 then return 0 end
    return math.ceil(ns / 1000000) :: integer
end

local function earlier(a: any?, b: any?): any?
    if a == nil then return b end
    if b == nil then return a end
    return a:before(b) and a or b
end

-- Wait for one matching child/process event, control message, or the nearest
-- max-execution, lease-expiry, or termination-grace deadline.
function M.wait_once(events_ch: any, deadline: any?, child_pid: string,
        heartbeat_pid: string?, control_ch: any?, lease_deadline: any?, grace_deadline: any?): table
    local chosen = earlier(earlier(deadline, lease_deadline), grace_deadline)
    if chosen and remaining_ms(chosen) == 0 then
        if grace_deadline and remaining_ms(grace_deadline) == 0 then return { kind = "grace_expired" } end
        if lease_deadline and remaining_ms(lease_deadline) == 0 then return { kind = "lease_expired" } end
        return { kind = "timeout" }
    end
    local cases = { events_ch:case_receive() }
    if control_ch then cases[#cases + 1] = control_ch:case_receive() end
    local timer: any = nil
    if chosen then
        timer = time.after(tostring(math.max(1, remaining_ms(chosen))) .. "ms")
        cases[#cases + 1] = timer:case_receive()
    end
    local result = channel.select(cases)
    if timer and result.channel == timer then
        if grace_deadline and remaining_ms(grace_deadline) == 0 then return { kind = "grace_expired" } end
        if lease_deadline and remaining_ms(lease_deadline) == 0 then return { kind = "lease_expired" } end
        return { kind = "timeout" }
    end
    if control_ch and result.channel == control_ch then
        return { kind = "control", message = result.value }
    end
    local event = result.value
    if type(event) ~= "table" then return { kind = "other" } end
    local kind = tostring((event :: any).kind or "")
    local from = tostring((event :: any).from or "")
    if heartbeat_pid and from == heartbeat_pid
        and (kind == process.event.EXIT or kind == process.event.LINK_DOWN) then
        return { kind = "heartbeat_lost" }
    end
    if kind == process.event.CANCEL then return { kind = "cancel" } end
    if kind == process.event.OUTDATED then return { kind = "outdated" } end
    if kind == process.event.EXIT and from == child_pid then
        local result = (event :: any).result
        return { kind = "exit", result = result, from = child_pid,
            link_pending = type(result) == "table" and result.error ~= nil }
    end
    if kind == process.event.LINK_DOWN and from == child_pid then
        return { kind = "peer_down", from = child_pid }
    end
    return { kind = "other" }
end

local function matching_exit(sig: any, child_pid: string): boolean
    if type(sig) ~= "table" then return false end
    local kind = tostring((sig :: any).kind or "")
    local from = (sig :: any).from
    return (kind == "exit" or kind == "crash") and (from == nil or tostring(from) == child_pid)
end

-- Use one absolute grace deadline. Unrelated events are ignored without
-- extending it. An error EXIT also consumes its linked notification before
-- the supervising execution restores its process options. An OUTDATED
-- supervisor keeps confirming the exit and records its retirement in `state`.
local function await_exit(hooks: table, child_pid: string, grace_ms: integer,
        initial_exit: table?, link_seen: boolean?, state: table?): (boolean, table?, table?)
    local deadline = time.now():add(math.max(0, grace_ms) * time.MILLISECOND)
    local terminal = initial_exit
    local linked = link_seen == true
    while true do
        if terminal and ((terminal :: any).link_pending ~= true or linked) then
            return true, nil, terminal
        end
        local sig = type((hooks :: any).wait_termination) == "function"
            and (hooks :: any).wait_termination(deadline)
            or (hooks :: any).wait(deadline)
        if matching_exit(sig, child_pid) then terminal = sig end
        local kind = type(sig) == "table" and tostring((sig :: any).kind or "") or ""
        if kind == "peer_down" and tostring((sig :: any).from) == child_pid then linked = true end
        if kind == "cancel" then return false, sig :: table, nil end
        if kind == "outdated" and state then (state :: any).retire = true end
        if kind == "grace_expired" or kind == "timeout" then return false, nil, terminal end
    end
end
M.await_exit = await_exit

-- Retry one failed fence mutation at bounded, named retry deadlines. The wait
-- hook observes cancellation while those retries are pending.
local function ensure_termination_fence(hooks: table, child_pid: string, opts: table): error?
    local prepare = (hooks :: any).prepare_termination
    if type(prepare) ~= "function" then return nil end
    for attempt = 1, FENCE_ATTEMPTS do
        local err = prepare(child_pid)
        if not err then return nil end
        if (opts :: any).on_fence_retry then (opts :: any).on_fence_retry(err, attempt) end
        if attempt == FENCE_ATTEMPTS then
            return errors.wrap(err, "termination fence recovery exhausted after " .. tostring(FENCE_ATTEMPTS) .. " attempts")
        end
        if attempt < FENCE_ATTEMPTS then
            local wait_retry = (hooks :: any).wait_retry
            local interrupted = false
            if type(wait_retry) == "function" then
                interrupted = wait_retry(FENCE_RETRY_MS[attempt]) == "cancel"
            else
                local retry_at = time.after(tostring(FENCE_RETRY_MS[attempt]) .. "ms")
                channel.select({ retry_at:case_receive() })
            end
            if interrupted then return err end
        end
    end
end
M.ensure_termination_fence = ensure_termination_fence

local function await_peer_exit(hooks: table, child_pid: string, opts: table, grace_ms: integer,
        state: table): (table?, error?, string?)
    local confirmed, interrupted, sig = await_exit(hooks, child_pid, grace_ms, nil, true, state)
    if interrupted then
        return nil, outcome_error(errors.CANCELED, tostring((opts :: any).cancel_message), "job_execution_cancelled", nil), "shutdown"
    end
    if not confirmed then
        return nil, outcome_error(errors.CONFLICT, "child link down without matching exit: " .. child_pid, "job_execution_unconfirmed", nil), nil
    end
    if (sig :: any).kind == "crash" then
        return nil, (errors.new({ message = tostring((opts :: any).crash_message) .. child_pid, kind = errors.INTERNAL }) :: error), nil
    end
    local out, err = (opts :: any).interpret_exit((sig :: any).result)
    return type(out) == "table" and out or nil, err, nil
end

local function terminate_child(hooks: table, child_pid: string, opts: table,
        reason: string, detail: error?, state: table): (table?, error?, string?)
    local fence_err = ensure_termination_fence(hooks, child_pid, opts)
    if fence_err and (opts :: any).on_fence_failure then (opts :: any).on_fence_failure(fence_err) end
    (hooks :: any).terminate(child_pid)
    local grace = math.floor(tonumber((opts :: any).terminate_grace_ms) or DEFAULT_TERMINATE_GRACE_MS)
    local confirmed, interrupted = await_exit(hooks, child_pid, grace, nil, nil, state)
    if interrupted then
        return nil, outcome_error(errors.CANCELED, tostring((opts :: any).cancel_message), "job_execution_cancelled", detail), "shutdown"
    end
    if not confirmed then
        return nil, outcome_error(errors.CONFLICT, "child termination unconfirmed: " .. child_pid, "job_execution_unconfirmed", detail), "termination_unconfirmed"
    end
    if reason == "cancelled" or reason == "heartbeat lost" then return nil, detail, "shutdown" end
    if reason == "revoked" then return nil, nil, "revoked" end
    return nil, detail or (errors.new({ message = reason, kind = errors.INTERNAL }) :: error), nil
end

local function handle_lease_expiry(hooks: table, child_pid: string, opts: table): (boolean, table?, error?, string?)
    local check = (hooks :: any).check_lease
    if type(check) ~= "function" then
        return false, nil, (errors.new({ message = "lease expiry has no authoritative check", kind = errors.INTERNAL }) :: error), "lease lost"
    end
    local active, lease_until, check_err = check()
    if check_err then return false, nil, check_err, "lease state unavailable" end
    if active and type(lease_until) == "string" and lease_until ~= "" then
        local renewed, parse_err = M.parse_deadline(lease_until)
        if parse_err or not renewed then return false, nil, parse_err, "lease deadline invalid" end
        if remaining_ms(renewed) > 0 then
            if type((hooks :: any).set_lease_deadline) == "function" then (hooks :: any).set_lease_deadline(renewed) end
            return true, renewed, nil, nil
        end
    elseif active and lease_until == nil then
        -- The execution's run row has settled; wait for its monitored EXIT or
        -- max_execution, with no lease timer remaining.
        if type((hooks :: any).set_lease_deadline) == "function" then (hooks :: any).set_lease_deadline(nil) end
        return true, nil, nil, nil
    end
    return false, nil, nil, "lease lost"
end

local function supervise(hooks: table, child_pid: string, opts: table, state: table): (table?, error?, string?)
    local grace = math.floor(tonumber((opts :: any).terminate_grace_ms) or DEFAULT_TERMINATE_GRACE_MS)
    while true do
        local sig = (hooks :: any).wait()
        local kind = type(sig) == "table" and tostring((sig :: any).kind or "") or ""
        if kind == "exit" then
            local out, err = (opts :: any).interpret_exit((sig :: any).result)
            if (sig :: any).link_pending == true then
                local confirmed, interrupted = await_exit(hooks, child_pid, grace, sig, nil, state)
                if interrupted then
                    return nil, outcome_error(errors.CANCELED, tostring((opts :: any).cancel_message), "job_execution_cancelled", err), "shutdown"
                end
                if not confirmed then
                    return nil, outcome_error(errors.CONFLICT, "child exit without matching link down: " .. child_pid,
                        "job_execution_unconfirmed", err), "termination_unconfirmed"
                end
            end
            return type(out) == "table" and out or nil, err, nil
        elseif kind == "crash" then
            return nil, (errors.new({ message = tostring((opts :: any).crash_message) .. child_pid, kind = errors.INTERNAL }) :: error), nil
        elseif kind == "timeout" then
            return terminate_child(hooks, child_pid, opts, "timeout", outcome_error(errors.TIMEOUT,
                tostring((opts :: any).timeout_message), "job_execution_timeout", nil), state)
        elseif kind == "cancel" or kind == "heartbeat_lost" then
            local reason = kind == "cancel" and "cancelled" or "heartbeat lost"
            local message = kind == "cancel" and (opts :: any).cancel_message or "worker heartbeat exited during execution"
            return terminate_child(hooks, child_pid, opts, reason, outcome_error(kind == "cancel" and errors.CANCELED or errors.UNAVAILABLE,
                tostring(message), kind == "cancel" and "job_execution_cancelled" or "job_execution_heartbeat_lost", nil), state)
        elseif kind == "outdated" then
            -- New code applies to the next execution: this one finishes under
            -- the code it started with, bounded by its own deadlines.
            state.retire = true
        elseif kind == "revoked" then
            return terminate_child(hooks, child_pid, opts, "revoked", nil, state)
        elseif kind == "lease_expired" then
            local active, _, lease_err, reason = handle_lease_expiry(hooks, child_pid, opts)
            if active then
                -- The live wait hook owns the refreshed exact deadline.
            else
                local message = reason == "lease lost" and tostring((opts :: any).lease_lost_message) or reason
                local detail = lease_err or (opts :: any).lease_lost_error
                if not detail then
                    detail = (errors.new({ message = tostring(message), kind = errors.UNAVAILABLE, retryable = true }) :: error)
                end
                return terminate_child(hooks, child_pid, opts, "lease lost", detail, state)
            end
        elseif kind == "peer_down" then
            return await_peer_exit(hooks, child_pid, opts, grace, state)
        elseif kind == "other" or kind == "lease_renewed" then
            -- Event noise and a committed extension are direct inputs. Neither
            -- changes the max-execution deadline.
        else
            return nil, (errors.new({ message = "proc supervise unknown signal: " .. kind, kind = errors.INTERNAL }) :: error), nil
        end
    end
end

-- Supervise one child to its settled end. The fourth result reports that the
-- supervising process's code became outdated during the execution, so the
-- supervisor retires once this execution settles.
function M.supervise_loop(hooks: table, child_pid: string, opts: table): (table?, error?, string?, boolean)
    local state = { retire = false }
    local output, err, control = supervise(hooks, child_pid, opts, state)
    return output, err, control, state.retire
end

function M.run(hooks: table, opts: table): (table?, error?, string?)
    local spawn = (hooks :: any).spawn
    if type(spawn) ~= "function" then
        return nil, (errors.new({ message = "proc supervisor requires a spawn hook", kind = errors.INTERNAL }) :: error), nil
    end
    local previous_options = process.get_options()
    local _, trap_err = process.set_options({ trap_links = true })
    if trap_err then return nil, trap_err, nil end
    local child_pid, spawn_err = spawn()
    local output: table? = nil
    local run_err: error? = nil
    local control: string? = nil
    if spawn_err or not child_pid then
        run_err = spawn_err or (errors.new({ message = "proc spawn returned no pid", kind = errors.INTERNAL }) :: error)
    else
        output, run_err, control = M.supervise_loop(hooks, tostring(child_pid), opts)
    end
    local _, restore_err = process.set_options(previous_options)
    if restore_err then
        if run_err then return nil, error_envelope.wrap_secondary(restore_err, run_err, "proc supervisor options restore failed"), control end
        return nil, errors.wrap(restore_err, "proc supervisor options restore failed"), control
    end
    return output, run_err, control
end

return M
