-- Shared harness of the round suites: a real installed round fixture
-- automation owned by a test
-- user, a real source thread, direct drive/ledger/receipt reads, and a round
-- runner constructed with dependencies that mirror the real wrappers: slot
-- completion (the captured jobs.complete) and run_as (the target called
-- in-process under the owner's actor, as execution_identity.run_as does after
-- resolving it).

local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local drive = require("drive")
local round = require("round_runner")
local runtime_policy = require("runtime_policy")
local logger = require("logger")
local process = require("process")
local channel = require("channel")
local jobs = require("jobs")
local jobs_config = require("jobs_config")
local migration_runner = require("migration_runner")

type Map = { [string]: any }

local M = {}

function M.encoded(value: any): string
    local encoded,err=json.encode(value)
    if err then error(tostring(err)) end
    return assert(encoded)
end

M.DB = "app:db"
M.PAST = "2000-01-01T00:00:00Z"
M.EVENT_TYPE = "kickside.automation.round.fixture.events:source.received"
M.OUTPUT_EVENT_TYPE = "kickside.automation.round.fixture.events:source.changed"
M.FIXTURE_KIND = "kickside.automation.round.fixture:kind"
M.NON_ROUND_KIND = "kickside.automation.agent.fixture:automation_type"
local PROC_SCOPE = "wippy.security:process"
local MANAGE_TOOL = "kickside.automation.agent:automations_manage"

function M.await_migrations(): ()
    local runner = migration_runner.setup(M.DB)
    local deadline = time.after("15s")
    while true do
        local status = runner:status()
        if status.status == "error" then error("fixture migrations: " .. tostring(status.error)) end
        if type(status.pending_migrations) ~= "number" then error("fixture migrations return no pending count") end
        if status.pending_migrations == 0 then return end
        local ready = channel.select({ deadline:case_receive(), time.after("10ms"):case_receive() })
        if ready.channel == deadline then error("fixture migrations do not complete before live setup") end
    end
end

function M.listen_round(automation_id: string, drive_key: string): Map
    local topic = "round.logged." .. uuid.v7()
    local signal = process.listen(topic, { message = true })
    M.exec("INSERT INTO round_fixture_listener (automation_id, drive_key, pid, topic) VALUES ($1, $2, $3, $4)",
        { automation_id, drive_key, tostring(process.pid()), topic })
    return { topic = topic, signal = signal, automation_id = automation_id, drive_key = drive_key }
end

function M.close_round(listener: Map): ()
    M.exec("DELETE FROM round_fixture_listener WHERE automation_id=$1 AND drive_key=$2",
        { listener.automation_id, listener.drive_key })
    process.unlisten(listener.signal)
end

function M.receive_logged(listener: Map, timeout: string?, diagnostic: (() -> string)?): Map
    local signal = listener.signal
    local deadline = time.after(timeout or "15s")
    local selected = channel.select({ signal:case_receive(), deadline:case_receive() })
    if selected.channel ~= signal then
        local logged = M.query("SELECT item_key FROM round_fixture_log WHERE automation_id=$1 AND drive_key=$2 ORDER BY id DESC LIMIT 3",
            { listener.automation_id, listener.drive_key })
        local drive_rows = M.query("SELECT job_id,event_seq,round_seq FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 AND drive_key=$2", { listener.automation_id, listener.drive_key })
        local details = "fixture_rows=" .. tostring(#logged)
        for _, row in ipairs(logged) do details = details .. " item=" .. tostring(row.item_key) end
        if #drive_rows == 1 then
            local drive = drive_rows[1]
            details = details .. " cursor=" .. tostring(drive.event_seq) .. " rounds=" .. tostring(drive.round_seq)
            local jobs_rows = M.query("SELECT status,scheduled_at,execution_seq,last_error FROM kickside_job WHERE id=$1",
                { drive.job_id })
            if #jobs_rows == 1 then
                local job = jobs_rows[1]
                details = details .. " job=" .. tostring(job.status) .. " scheduled=" .. tostring(job.scheduled_at)
                    .. " execution=" .. tostring(job.execution_seq) .. " error=" .. tostring(job.last_error)
            else
                details = details .. " job_rows=" .. tostring(#jobs_rows)
            end
        else
            details = details .. " drive_rows=" .. tostring(#drive_rows)
        end
        if diagnostic then details = details .. " " .. diagnostic() end
        error("timed out waiting for fixture log: " .. details)
    end
    if selected.ok == false then error("fixture log listener closed") end
    local message = selected.value
    if message:topic() ~= listener.topic then error("unexpected fixture log topic") end
    local data = message:payload():data()
    if type(data) ~= "table" or data.automation_id ~= listener.automation_id or data.drive_key ~= listener.drive_key then
        error("unexpected fixture log message")
    end
    local rows = M.query("SELECT id FROM round_fixture_log WHERE automation_id=$1 AND drive_key=$2 AND item_key=$3 ORDER BY id DESC LIMIT 1",
        { listener.automation_id, listener.drive_key, data.item_key })
    if #rows ~= 1 then error("fixture log message arrived without its committed row") end
    if type(data.sender_pid) ~= "string" or data.sender_pid == ""
        or type(data.ack_topic) ~= "string" or data.ack_topic == "" then
        error("fixture log message has no acknowledgment route")
    end
    local _, ack_err = process.send(data.sender_pid, data.ack_topic, { item_key = data.item_key })
    if ack_err then error("fixture log acknowledgment failed: " .. tostring(ack_err)) end
    return data :: Map
end

-- A probe sharing the round's concurrency key cannot run until that round's
-- claim has completed. Its direct reply is the completion barrier.
function M.await_worker_pass(concurrency_key: string, park_job_id: string?): ()
    local topic = "round.worker.probe." .. uuid.v7()
    local ready = process.listen(topic, { message = true })
    local queued, queue_err = jobs.enqueue({ namespace = "automation-live-test", scope = "process",
        key = uuid.v7(), job_type = "kickside.automation:round_live_probe", priority = -100000,
        owner_locator = { kind = "test", id = "automation-live-probe" },
        concurrency_key = concurrency_key,
        immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = topic,
            park_job_id = park_job_id, concurrency_key = concurrency_key } })
    if queue_err or not queued then error("worker probe enqueue failed: " .. tostring(queue_err)) end
    local got = channel.select({ ready:case_receive(), time.after("15s"):case_receive() })
    process.unlisten(ready)
    if got.channel ~= ready then error("live jobs loop did not claim probe") end
    local message = got.value
    local data = message:payload():data()
    if message:topic() ~= topic or data.job_id ~= queued.id then
        error("unexpected live jobs probe reply")
    end
    if data.error then error("live jobs probe failed: " .. tostring(data.error)) end
    if park_job_id and data.parked_job_id ~= park_job_id then error("live jobs probe parked the wrong slot") end
    local rows = M.query("SELECT status, execution_seq, concurrency_key FROM kickside_job WHERE id=$1",
        { queued.id })
    if #rows ~= 1 or tonumber(rows[1].execution_seq) ~= tonumber(data.execution_seq)
        or rows[1].concurrency_key ~= concurrency_key
        or (rows[1].status ~= "running" and rows[1].status ~= "done") then
        error("live jobs probe replied without its committed keyed claim")
    end
end

function M.probe_key_for(job_id: string): string
    local key = "round.probe." .. uuid.v7()
    M.exec("UPDATE kickside_job SET concurrency_key=$1 WHERE id=$2", { key, job_id })
    return key
end

function M.start_worker(): string
    local pid, err = process.spawn_monitored("kickside.automation:round_single_worker_pool", "app:processes")
    if err or not pid then error("live jobs worker spawn failed: " .. tostring(err)) end
    return tostring(pid)
end

-- stop_worker(pid) cancels a worker start_worker started and waits for it.
function M.stop_worker(pid: string): ()
    local events = process.events()
    process.cancel(pid, "5s")
    local deadline = time.after("10s")
    while true do
        local got = channel.select({ events:case_receive(), deadline:case_receive() })
        if got.channel ~= events then error("live jobs worker did not stop") end
        local event = got.value
        if type(event) == "table" and event.kind == process.event.EXIT and tostring(event.from) == pid then return end
    end
end

function M.db(): any
    local handle, err = sql.get(M.DB)
    if err or not handle then error("round harness db: " .. tostring(err)) end
    return handle
end

function M.exec(statement: string, params: { any }?): ()
    local d = M.db()
    local _, err = d:execute(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
end

function M.query(statement: string, params: { any }?): { Map }
    local d = M.db()
    local rows, err = d:query(statement, params or {})
    d:release()
    if err then error(tostring(err)) end
    return rows :: { Map }
end

-- execution_ceiling_ms() -> the jobs policy's proc.max_execution.
function M.execution_ceiling_ms(): integer
    local policy, err = jobs_config.policy()
    if err or not policy then error("jobs policy unavailable: " .. tostring(err)) end
    return (policy :: any).proc_max_execution_ms
end

-- running_job(lease_seconds?) -> the lease { id, lease_token, execution_seq,
-- lease_until } of a job row the jobs store holds as running under that live
-- lease, the job a round's fence names.
function M.running_job(lease_seconds: integer?): Map
    local job: Map = { id = uuid.v7(), lease_token = uuid.v7(), execution_seq = 1,
        lease_until = time.now():utc():add((lease_seconds or 60) * time.SECOND):format(time.RFC3339) }
    M.exec("INSERT INTO kickside_job (id, job_type, job_identity, status, lease_token, lease_until, execution_seq, owner_kind, owner_id)"
        .. " VALUES ($1, 'kickside.automation:round', $2, 'running', $3, $4, $5, 'test', $6)",
        { job.id, "test:" .. job.id, job.lease_token, job.lease_until, job.execution_seq, job.id })
    return job
end

function M.read_drive(automation_id: string, drive_key: string): Map
    local d = M.db()
    local row, err = drive.get(d, automation_id, drive_key)
    d:release()
    if err or not row then error("drive read: " .. tostring(err)) end
    return row :: Map
end

-- drive_policy(overrides) -> the registered drive policy resolved with no
-- declaration overrides, then `overrides` ({ round = {...}, delivery = {...} })
-- laid over it as the drive's stored applied policy.
function M.drive_policy(overrides: Map?): Map
    local resolved, err = runtime_policy.drive_policy({})
    if err or not resolved then error("drive policy: " .. tostring(err)) end
    for section, values in pairs(overrides or {}) do
        for k, v in pairs(values :: Map) do (resolved :: Map)[section][k] = v end
    end
    return resolved :: Map
end

-- new_drive inserts a drive with a placeholder slot id, so the command
-- dispatcher's slot repair leaves it to the suite. spec.applied is the
-- declaration the drive applied and spec.policy overrides its resolved
-- applied policy.
function M.new_drive(spec: Map): ()
    local full: Map = { automation_id = spec.automation_id, drive_key = spec.drive_key,
        source_kind = spec.source_kind, job_id = uuid.v7() }
    for k, v in pairs(spec) do if k ~= "policy" then full[k] = v end end
    full.applied = { declaration = spec.applied or {}, policy = M.drive_policy(spec.policy) }
    local d = M.db()
    local tx = d:begin()
    local _, err = drive.insert_tx(tx, full)
    if err then tx:rollback(); d:release(); error(tostring(err)) end
    tx:commit()
    d:release()
end

-- set_drive applies assignments whose placeholders are $1..$n over params; the
-- drive key placeholders follow them (SQLite binds in order of appearance).
function M.set_drive(automation_id: string, drive_key: string, assignments: string, params: { any }): ()
    local all: { any } = {}
    for _, p in ipairs(params) do all[#all + 1] = p end
    all[#all + 1] = automation_id
    all[#all + 1] = drive_key
    M.exec("UPDATE kickside_automation_drive SET " .. assignments .. " WHERE automation_id = $" .. tostring(#params + 1)
        .. " AND drive_key = $" .. tostring(#params + 2), all)
end

function M.log_rows(automation_id: string, drive_key: string): { Map }
    return M.query("SELECT item_key, attempts, detail_json FROM round_fixture_log WHERE automation_id = $1 AND drive_key = $2 ORDER BY id",
        { automation_id, drive_key })
end

function M.ledger_row(automation_id: string, item_key: string): Map?
    return M.query("SELECT state, attempts, next_attempt_at, expires_at FROM kickside_trigger_item_ledger WHERE owner_id = $1 AND item_key = $2",
        { automation_id, item_key })[1]
end

-- ensure_log creates the round fixture's log table.
function M.ensure_log(): ()
    local d = M.db()
    local dbtype = tostring(d:type())
    d:release()
    local id_column = dbtype == sql.type.SQLITE and "id INTEGER PRIMARY KEY AUTOINCREMENT" or "id BIGSERIAL PRIMARY KEY"
    M.exec("CREATE TABLE IF NOT EXISTS round_fixture_log (" .. id_column .. ", automation_id TEXT NOT NULL,"
        .. " drive_key TEXT NOT NULL, item_key TEXT NOT NULL, attempts INTEGER NOT NULL, detail_json TEXT NOT NULL)")
    M.exec("CREATE TABLE IF NOT EXISTS round_fixture_listener (automation_id TEXT NOT NULL, drive_key TEXT NOT NULL,"
        .. " pid TEXT NOT NULL, topic TEXT NOT NULL, PRIMARY KEY (automation_id, drive_key))")
end

-- setup(prefix) -> env: the owner's actor/scope/caller, the installed fixture
-- automation, the source thread with append(text), and run(), a
-- round attempt through a runner constructed with explicit dependencies
-- (env.completions records every slot completion).
function M.setup(prefix: string): Map
    local env: Map = { completions = {}, warnings = {}, notifications = {} }
    env.owner = prefix .. "_" .. uuid.v4():sub(1, 8)
    env.actor = security.new_actor(env.owner, { security_groups = { "automation_test" } })
    env.scope = security.named_scope(PROC_SCOPE)
    env.caller = funcs.new():with_actor(env.actor):with_scope(env.scope)
    M.ensure_log()
    local installed, install_err = env.caller:call(MANAGE_TOOL, { action = "install", type = M.FIXTURE_KIND, input = {} })
    if install_err or not installed or not installed.success then error("fixture install: " .. tostring(install_err or (installed and installed.error))) end
    env.automation_id = installed.id
    local def = contract.get("kickside.core:threads")
    env.threads = (def :: any):with_actor(env.actor):with_scope(env.scope):open()
    local created, cerr = env.threads:upsert({ thread_class = "kickside.test.round",
        impl_id = "kickside.automation.round.fixture:round_source_kind",
        external_ref = "round:" .. env.owner, title = "Round source" })
    if cerr or type(created) ~= "table" then error("thread: " .. tostring(cerr)) end
    env.thread_id = tostring(created.thread_id)
    env.append = function(text: string): ()
        -- Registry commits retire opened contract handles. Resolve a current
        -- handle for each append, including the post-commit wake fixture.
        local current_def, def_err = contract.get("kickside.core:threads")
        if def_err or not current_def then error("append contract: " .. tostring(def_err)) end
        local current, open_err = (current_def :: any):with_actor(env.actor):with_scope(env.scope):open()
        if open_err or not current then error("append open: " .. tostring(open_err)) end
        local result, err = current:append_event({ thread_id = env.thread_id,
            event = { type = M.EVENT_TYPE, role = "user", body = { text = text } } })
        if err or not result or result.success == false then
            error("append: " .. tostring(err or (result and result.error)))
        end
    end
    env.append_output = function(actor_id: string?): (any?, any?)
        local attacker, actor_err = security.new_actor(actor_id or env.owner, { security_groups = {} })
        if actor_err or not attacker then return nil, actor_err end
        local allow, allow_err = security.policy("app:thread_user_append")
        if allow_err or not allow then return nil, allow_err end
        local append_scope, scope_err = security.new_scope({ allow })
        if scope_err or not append_scope then return nil, scope_err end
        local current_def, def_err = contract.get("kickside.core:threads")
        if def_err or not current_def then return nil, def_err end
        local current, open_err = (current_def :: any):with_actor(attacker):with_scope(append_scope):open()
        if open_err or not current then return nil, open_err end
        return current:append_event({ thread_id = env.thread_id,
            event = { type = M.OUTPUT_EVENT_TYPE, role = "system", body = { forged = true } } })
    end

    -- The runner's explicit dependencies: slot completion captured, run_as
    -- calling its target in-process under the owner's actor as
    -- execution_identity.run_as does after resolving the identity.
    local jobs_seam = {
        complete = function(id: string, lease: Map, options: Map): (Map?, any)
            table.insert(env.completions, { id = id, lease = lease, options = options })
            return { status = options.rearm and "rearmed" or "parked", job_id = id }, nil
        end,
    }
    env.run_as = function(_identity: any, target: string, args: any, opts: any): (any?, any)
        if type(opts) ~= "table" or opts.deferred_owner ~= "kickside.automation:round" then
            error("round resolved an identity without its deferred owner")
        end
        return env.caller:call(target, args)
    end
    env.last_completion = function(): Map
        return env.completions[#env.completions]
    end
    -- run(automation_id, drive_key, run_as?) runs one round attempt; run_as,
    -- when given, stands in for the round's run_as on this attempt.
    env.run = function(automation_id: string, drive_key: string, run_as: any?, recover_drive: any?,
            check_before_send: any?): (Map?, any)
        local runner, runner_err = round.new({ jobs = jobs_seam, run_as = run_as or env.run_as,
            notify_access = function(id: string, topic: string?, data: Map): (Map?, error?)
                if env.notify_error then return nil, env.notify_error end
                env.notifications[#env.notifications + 1] = { id = id, topic = topic, data = data,
                    phase = M.read_drive(id, drive_key).phase, completions = #env.completions }
                return { success = true }, nil
            end,
            policy = runtime_policy.policy, logger = {
                named = function(_self: any, name: string): Map
                    local log = logger:named(name)
                    return { warn = function(_log: any, message: string, fields: Map): ()
                        env.warnings[#env.warnings + 1] = { message = message, fields = fields }
                        log:warn(message, fields)
                    end }
                end,
            }, recover_drive = recover_drive,
            check_before_send = check_before_send })
        if runner_err or not runner then error("round runner: " .. tostring(runner_err)) end
        -- Direct runner fixtures have no Jobs heartbeat. Keep their synthetic
        -- lease live for the configured round budget, as renewal does in a worker.
        local budget = M.drive_policy(nil).round.timeout_ms
        local job = M.running_job(math.ceil(budget / 1000) :: integer)
        -- Jobs tells every execution the instant its execution ceiling ends;
        -- env.job_deadline_ms stands in for a ceiling nearer than the policy's.
        job.deadline = time.now():utc():add((env.job_deadline_ms or M.execution_ceiling_ms())
            * time.MILLISECOND):format(time.RFC3339)
        env.last_job = job
        local result, err = (runner :: any).run({
            job = job,
            payload = { automation_id = automation_id, drive_key = drive_key },
        })
        -- The captured completion stands in for the jobs store's: the attempt's
        -- job row leaves running so it holds no worker capacity.
        M.exec("UPDATE kickside_job SET status = 'done', lease_token = NULL, lease_until = NULL WHERE id = $1", { job.id })
        return result, err
    end
    return env
end

return M
