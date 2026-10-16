-- Isolated cost probes over the seeded LOD database. These are lower bounds
-- for round stages, not replacements for the end-to-end round measurements.
local sql = require("sql")
local time = require("time")
local process = require("process")
local channel = require("channel")
local automations_lib = require("automations_lib")
local execution_identity = require("execution_identity")

local M = {}
local DB = "app:db"

local function fail(message: string): never
    error("lane LOD breakdown: " .. message)
end

local function ns(): number
    return time.now():unix_nano()
end

local function p95(samples: { number }): string
    table.sort(samples)
    local index = math.max(1, math.ceil(#samples * 0.95))
    return string.format("%.3f", samples[index])
end

local function metric(db: any, name: string, samples: { number }, detail: string): ()
    local _, err = db:execute([[INSERT INTO kickside_lod_metric(metric,target,measured,status,detail)
        VALUES($1,'diagnostic',$2,'MEASURED',$3)
        ON CONFLICT(metric) DO UPDATE SET measured=excluded.measured,status=excluded.status,detail=excluded.detail]],
        { name, p95(samples), detail })
    if err then fail("metric write failed: " .. tostring(err)) end
end

function M.run(): ()
    local db, db_err = sql.get(DB)
    if db_err or not db then fail("database unavailable: " .. tostring(db_err)) end
    local state, state_err = db:query("SELECT value FROM kickside_lod_state WHERE key='automation_id'")
    if state_err or not state or not state[1] then fail("automation id unavailable: " .. tostring(state_err)) end
    local automation_id = tostring(state[1].value)

    local runtime, runtime_err = automations_lib.get_runtime({ id = automation_id })
    if runtime_err or not runtime then fail("runtime unavailable: " .. tostring(runtime_err)) end
    local identity = (runtime :: any).execution_identity
    local identity_samples: { number } = {}
    for _ = 1, 100 do
        local started = ns()
        local resolved, resolve_err = execution_identity.resolve(identity,
            { deferred_owner = "kickside.automation:round" })
        if resolve_err or not resolved then fail("identity resolution failed: " .. tostring(resolve_err)) end
        identity_samples[#identity_samples + 1] = (ns() - started) / 1000000
    end
    metric(db, "identity resolve p95", identity_samples,
        "100 live kickside.execution:resolve calls for the seeded automation")

    local _, seed_err = db:execute([[INSERT INTO kickside_lod_state(key,value) VALUES('boundary_probe','0')
        ON CONFLICT(key) DO UPDATE SET value=excluded.value]])
    if seed_err then fail("boundary probe setup failed: " .. tostring(seed_err)) end
    local begin_samples: { number } = {}
    local write_samples: { number } = {}
    local commit_samples: { number } = {}
    for i = 1, 100 do
        local started = ns()
        local tx, begin_err = db:begin()
        if begin_err or not tx then fail("transaction begin failed: " .. tostring(begin_err)) end
        begin_samples[#begin_samples + 1] = (ns() - started) / 1000000
        started = ns()
        local _, write_err = tx:execute("UPDATE kickside_lod_state SET value=$1 WHERE key='boundary_probe'", { tostring(i) })
        if write_err then tx:rollback(); fail("durable write failed: " .. tostring(write_err)) end
        write_samples[#write_samples + 1] = (ns() - started) / 1000000
        started = ns()
        local _, commit_err = tx:commit()
        if commit_err then fail("transaction commit failed: " .. tostring(commit_err)) end
        commit_samples[#commit_samples + 1] = (ns() - started) / 1000000
    end
    metric(db, "durable begin p95", begin_samples, "100 one-row durable transaction starts; boundary lower bound")
    metric(db, "durable write p95", write_samples, "100 one-row durable updates; boundary lower bound")
    metric(db, "durable commit p95", commit_samples, "100 one-row durable commits; boundary lower bound")

    local events = process.events()
    local spawn_samples: { number } = {}
    local supervise_samples: { number } = {}
    for _ = 1, 100 do
        local started = ns()
        local child, spawn_err = process.spawn_monitored("kickside.load:noop_child", "app:processes", {})
        if spawn_err or not child then fail("child spawn failed: " .. tostring(spawn_err)) end
        local pid = tostring(child)
        local spawned = ns()
        spawn_samples[#spawn_samples + 1] = (spawned - started) / 1000000
        local deadline = time.after("10s")
        while true do
            local selected = channel.select({ events:case_receive(), deadline:case_receive() })
            if selected.channel ~= events then
                process.terminate(pid)
                fail("child supervision deadline exceeded")
            end
            local event = selected.value
            if type(event) == "table" and tostring(event.from) == pid then
                if event.kind ~= process.event.EXIT or (event.result and event.result.error) then
                    fail("child failed: " .. tostring(event.result and event.result.error))
                end
                break
            end
        end
        supervise_samples[#supervise_samples + 1] = (ns() - spawned) / 1000000
    end
    metric(db, "child spawn p95", spawn_samples, "100 monitored no-op child starts; excludes job work")
    metric(db, "child supervise p95", supervise_samples, "100 no-op child EXIT waits with deadline; excludes job work")
    db:release()
end

return M
