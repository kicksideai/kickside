local time = require("time")
local uuid = require("uuid")
local store = require("store")
local writable_module = require("run_writable")
local writable = writable_module
local run_identity = require("run_identity")
local admission = require("admission")
local funcs = require("funcs")
local security = require("security")
local automation = require("automation")
local json = require("json")

local M = {}
local RACE_ACTOR = "workflow-race-owner"

local function as_actor(actor_id: string, target: string, args: any): any
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then error("race actor: " .. tostring(actor_err), 0) end
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("race policy: " .. tostring(policy_err), 0) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("race scope: " .. tostring(scope_err), 0) end
    local result, call_err = funcs.new():with_actor(actor):with_scope(scope):call(target, args)
    if call_err then error("race actor call: " .. tostring(call_err), 0) end
    return result
end

local function as_owner(target: string, args: any): any
    return as_actor(RACE_ACTOR, target, args)
end

function M.fixture_install(_args: any): any
    return { source = { source_kind = "none" }, state = {},
        metadata = { title = "Admission race fixture" } }
end

function M.install_automation(_args: any): any
    local installed, err = automation.install_type("app:admission_race_type", {})
    if err or not installed then error("race automation install: " .. tostring(err), 0) end
    local runtime, runtime_err = automation.get_runtime({ id = installed.id })
    if runtime_err or not runtime or type(runtime.execution_identity) ~= "table"
        or runtime.execution_identity.version ~= 2 then
        error("race automation has no stored v2 identity: " .. tostring(runtime_err), 0)
    end
    return { id = installed.id }
end

function M.identity_probe(args: any): any
    local identity, err = run_identity.load(args.id)
    return { identity = identity, error = err }
end

local function wait_ready(db: any)
    for _ = 1, 200 do
        local rows, err = db:query("SELECT 1 FROM workflow_runs LIMIT 1")
        local components, component_err = db:query("SELECT position, identity_hash FROM kickside_components LIMIT 1")
        local ancestors, ancestor_err = db:query("SELECT 1 FROM kickside_component_ancestor LIMIT 1")
        if not err and rows ~= nil and not component_err and components ~= nil
            and not ancestor_err and ancestors ~= nil then return end
        time.sleep("100ms")
    end
    error("workflow and component schemas not ready after boot", 0)
end

function M.init()
    local db, open_err = store.open_db()
    if open_err or not db then error(tostring(open_err or "db open failed"), 0) end
    wait_ready(db)

    local _, cfg_err = db:execute([[
        CREATE TABLE IF NOT EXISTS workflow_race_config (
            k TEXT PRIMARY KEY,
            v TEXT NOT NULL
        )
    ]])
    if cfg_err then db:release(); error(tostring(cfg_err), 0) end

    local _, barrier_err = db:execute([[
        CREATE TABLE IF NOT EXISTS workflow_race_barrier (
            racer_id TEXT PRIMARY KEY,
            arrived_at TEXT NOT NULL
        )
    ]])
    if barrier_err then db:release(); error(tostring(barrier_err), 0) end

    local _, res_err = db:execute([[
        CREATE TABLE IF NOT EXISTS workflow_race_results (
            racer_id TEXT PRIMARY KEY,
            success BOOLEAN NOT NULL,
            run_id TEXT,
            error_code TEXT,
            error_scope TEXT,
            error_message TEXT,
            retriable BOOLEAN,
            retry_after_ms INTEGER,
            completed_at TEXT NOT NULL
        )
    ]])
    if res_err then db:release(); error(tostring(res_err), 0) end

    local _, v_err = db:execute([[
        CREATE TABLE IF NOT EXISTS workflow_race_verification (
            status TEXT NOT NULL,
            detail TEXT
        )
    ]])
    if v_err then db:release(); error(tostring(v_err), 0) end

    db:execute("DELETE FROM workflow_race_config")
    db:execute("DELETE FROM workflow_race_barrier")
    db:execute("DELETE FROM workflow_race_results")
    db:execute("DELETE FROM workflow_race_verification")

    db:release()

    local user_repo = require("user_repo")
    local owner, owner_err = user_repo.create_passwordless({
        user_id = RACE_ACTOR,
        email = "workflow-race-owner@test.local",
        full_name = "Workflow Race Owner",
        status = "active",
    })
    if owner_err or not owner then error("race owner user: " .. tostring(owner_err), 0) end

    local installed = as_owner("app:admission_race_install_automation", {})
    local trigger_id = installed.id
    local selected = as_owner("app:admission_race_identity_probe", { id = trigger_id })
    if selected.error or type(selected.identity) ~= "table"
        or selected.identity.version ~= 2
        or selected.identity.principal.id ~= RACE_ACTOR then
        error("real identity loader refused the installed automation: " .. tostring(selected.error), 0)
    end
    local wrong_actor = as_actor("workflow-race-stranger", "app:admission_race_identity_probe", { id = trigger_id })
    if wrong_actor.identity ~= nil or type(wrong_actor.error) ~= "string"
        or not wrong_actor.error:find("invoking actor differs", 1, true) then
        error("real identity loader accepted a different ambient actor", 0)
    end
    local missing = as_owner("app:admission_race_identity_probe", { id = "missing-automation" })
    if missing.identity ~= nil or missing.error == nil then
        error("real identity loader accepted a missing automation", 0)
    end
    local flow_id = "flow-race-" .. uuid.v4()

    db, open_err = store.open_db()
    if open_err or not db then error(tostring(open_err or "db open failed"), 0) end

    db:execute("INSERT INTO workflow_race_config (k, v) VALUES ('trigger_id', $1), ('flow_id', $2), ('limit', '25')",
        { trigger_id, flow_id })

    db:execute("DELETE FROM workflow_runs WHERE trigger_id=$1", { trigger_id })
    db:execute("DELETE FROM workflow_admission_gate WHERE trigger_id=$1", { trigger_id })
    for index = 1, 24 do
        local _, seed_err = db:execute([[
            INSERT INTO workflow_runs
                (run_id,workflow_id,version,dataflow_id,trigger_kind,trigger_id,origin,status,started_at,binding_id,binding_revision)
            VALUES ($1,$2,1,$3,'binding',$4,'automation','pending',$5,$4,1)
        ]], { uuid.v4(), flow_id, uuid.v4(), trigger_id, admission.now() })
        if seed_err then db:release(); error("race capacity seed: " .. tostring(seed_err), 0) end
    end
    db:release()
end

local function get_config(db: any): (string, string, number)
    local rows, err = db:query("SELECT k, v FROM workflow_race_config")
    if err or not rows then error("workflow_race_config unreadable: " .. tostring(err), 0) end
    local cfg: { [string]: string } = {}
    for _, r in ipairs(rows) do
        cfg[r.k] = r.v
    end
    local trigger_id = cfg["trigger_id"] or error("missing trigger_id in config", 0)
    local flow_id = cfg["flow_id"] or error("missing flow_id in config", 0)
    local limit = tonumber(cfg["limit"] or "1") or 1
    return trigger_id, flow_id, limit
end

local function do_race(racer_id: string)

    local db, open_err = store.open_db()
    if open_err or not db then error(tostring(open_err or "db open failed"), 0) end
    local trigger_id, flow_id = get_config(db)

    local _, insert_barrier_err = db:execute(
        "INSERT INTO workflow_race_barrier (racer_id, arrived_at) VALUES ($1, $2) ON CONFLICT(racer_id) DO UPDATE SET arrived_at=$2",
        { racer_id, admission.now() })
    if insert_barrier_err then db:release(); error(tostring(insert_barrier_err), 0) end

    local deadline = time.now():add(25 * time.SECOND)
    local ready = false
    while time.now():before(deadline) do
        local rows, query_err = db:query("SELECT COUNT(*) AS n FROM workflow_race_barrier WHERE racer_id IN ('racer-a', 'racer-b')")
        if not query_err and rows and rows[1] and tonumber(rows[1].n) >= 2 then
            ready = true
            break
        end
        time.sleep("10ms")
    end

    if not ready then
        db:release()
        error("Peer racer did not arrive at barrier in time", 0)
    end

    if racer_id == "racer-b" then
        db:execute("INSERT INTO workflow_race_config (k, v) VALUES ('go', '1') ON CONFLICT(k) DO NOTHING")
    else
        while time.now():before(deadline) do
            local go_rows = db:query("SELECT v FROM workflow_race_config WHERE k='go'")
            if go_rows and #go_rows > 0 then break end
            time.sleep("5ms")
        end
    end
    db:release()

    local result = as_owner("app:admission_race_write", {
        racer_id = racer_id, trigger_id = trigger_id, flow_id = flow_id,
    })

    local res_db, res_open_err = store.open_db()
    if res_open_err or not res_db then error(tostring(res_open_err or "res db open failed"), 0) end

    local success = result.success == true
    local run_id = success and result.dest_ref and result.dest_ref.run_id or nil
    local err = result.error or {}

    local _, record_err = res_db:execute([[
        INSERT INTO workflow_race_results
        (racer_id, success, run_id, error_code, error_scope, error_message, retriable, retry_after_ms, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT(racer_id) DO UPDATE SET
            success=$2, run_id=$3, error_code=$4, error_scope=$5, error_message=$6, retriable=$7, retry_after_ms=$8, completed_at=$9
    ]], {
        racer_id,
        success,
        run_id,
        tostring(err.code or ""),
        tostring(err.scope or ""),
        tostring(err.message or ""),
        err.retriable == true,
        tonumber(result.retry_after_ms or err.retry_after_ms) or 0,
        admission.now(),
    })
    res_db:release()
    if record_err then error(tostring(record_err), 0) end
end

function M.write_as_owner(args: any): any
    local flows: { [string]: string } = {}
    local cli = {
        get_status = function(_self: any, id: string)
            return flows[id], flows[id] == nil and "Workflow not found or access denied" or nil
        end,
        create_workflow = function(_self: any, _commands: any, opts: any)
            if flows[opts.dataflow_id] then return nil, "duplicate dataflow id" end
            flows[opts.dataflow_id] = "pending"
            return opts.dataflow_id, nil
        end,
        start = function(_self: any, id: string)
            flows[id] = "running"; return id, nil
        end,
        execute = function() error("unexpected synchronous execution") end,
        output = function() return {}, nil end,
    }
    writable = writable_module.new({
        client_new = function() return cli, nil end,
        repo = { ACCESS = { READ = 1 }, require_access = function() return nil end },
        version_read = { get = function() return { compiled_commands = {}, input_schema = { type = "object" } }, nil end },
        compiler = { remint = function() return {}, {}, nil end },
        admission = { find = admission.find, reserve = admission.reserve,
            merge = admission.merge, creation_payload = admission.creation_payload },
    })

    local request = {
        config = { flow_ref = { kind = "flow", id = args.flow_id, version = 1 } },
        sink_op = "create",
        identity_key = args.racer_id,
        idempotency_key = "delivery:" .. args.racer_id,
        origin = args.trigger_id,
        automation_ref = { kind = "automation", id = args.trigger_id, revision = 1 },
        input = { value = args.racer_id },
    }
    return writable.write(request)
end

function M.race_a()
    do_race("racer-a")
end

function M.race_b()
    do_race("racer-b")
end

function M.verify()
    local db, open_err = store.open_db()
    if open_err or not db then error(tostring(open_err or "db open failed"), 0) end

    local trigger_id, _, limit = get_config(db)

    local results, res_err = db:query("SELECT racer_id, success, run_id, error_code, error_scope, retriable, retry_after_ms FROM workflow_race_results ORDER BY racer_id")
    if res_err then db:release(); error(tostring(res_err), 0) end
    if not results or #results ~= 2 then
        db:release()
        error("Expected 2 racer results, got " .. tostring(results and #results or 0), 0)
    end

    local winners: { any } = {}
    local losers: { any } = {}
    for _, r in ipairs(results) do
        if r.success == true or r.success == 1 or r.success == "t" then
            winners[#winners + 1] = r
        else
            losers[#losers + 1] = r
        end
    end

    if #winners ~= 1 then
        db:release()
        error("RACE VIOLATION: expected exactly 1 winner, got " .. tostring(#winners) .. " (double admission detected!)", 0)
    end
    if #losers ~= 1 then
        db:release()
        error("RACE VIOLATION: expected exactly 1 loser, got " .. tostring(#losers), 0)
    end

    local winner = winners[1]
    local loser = losers[1]

    if type(winner.run_id) ~= "string" or winner.run_id == "" then
        db:release()
        error("Winner missing run_id: " .. tostring(winner.run_id), 0)
    end

    if loser.error_scope ~= "capacity" then
        db:release()
        error("Loser expected error_scope 'capacity', got '" .. tostring(loser.error_scope) .. "'", 0)
    end
    if loser.error_code ~= "rate_limited" then
        db:release()
        error("Loser expected error_code 'rate_limited', got '" .. tostring(loser.error_code) .. "'", 0)
    end
    if loser.retriable ~= true and loser.retriable ~= 1 and loser.retriable ~= "t" then
        db:release()
        error("Loser expected retriable=true, got " .. tostring(loser.retriable), 0)
    end
    if tonumber(loser.retry_after_ms) ~= 2000 then
        db:release()
        error("Loser expected retry_after_ms 2000, got " .. tostring(loser.retry_after_ms), 0)
    end

    local runs, runs_err = db:query("SELECT run_id, dedup_key, status, admission_state, execution_identity_json FROM workflow_runs WHERE trigger_id=$1 AND superseded_by IS NULL", { trigger_id })
    db:release()
    if runs_err then error(tostring(runs_err), 0) end
    if not runs or #runs ~= limit then
        error("DOUBLE ADMISSION VIOLATION: expected " .. tostring(limit) .. " admitted run in DB, got " .. tostring(runs and #runs or 0), 0)
    end

    local winner_run: any = nil
    for _, run in ipairs(runs) do
        if tostring(run.run_id) == tostring(winner.run_id) then winner_run = run end
    end
    if not winner_run then
        error("Winner run was not in the workflow_runs capacity cohort", 0)
    end
    if winner_run.dedup_key ~= "delivery:" .. tostring(winner.racer_id) then
        error("Admitted dedup key " .. tostring(winner_run.dedup_key)
            .. " does not match winner racer " .. tostring(winner.racer_id), 0)
    end
    local identity, identity_err = json.decode(tostring(winner_run.execution_identity_json or ""))
    if identity_err or type(identity) ~= "table" or identity.version ~= 2
        or type(identity.principal) ~= "table" or identity.principal.id ~= RACE_ACTOR then
        error("Admitted run did not persist the installed automation's v2 identity: " .. tostring(identity_err), 0)
    end

    local pass_db, pass_open_err = store.open_db()
    if not pass_open_err and pass_db then
        pass_db:execute("INSERT INTO workflow_race_verification (status, detail) VALUES ('PASS', '1 winner, 1 loser with capacity refusal, 0 double admission')")
        pass_db:release()
    end
end

return M
