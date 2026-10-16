-- Lane LOD load gates. Large data sets are inserted by the set-based SQL files;
-- this entry only creates the automation fixture and measures real operations.
local sql = require("sql")
local time = require("time")
local process = require("process")
local channel = require("channel")
local M = {}

type Map = { [string]: any }
type SqlParam = string | number | boolean
type Threads = {
    upsert: (Threads, Map) -> (Map?, any),
    append_event: (Threads, Map) -> (any, any),
}

local DB = "app:db"
local EVENT_TYPE = "kickside.load:event"
local EVENT_KIND = "kickside.load:event_kind"
local TIMER_KIND = "kickside.load:timer_kind"
local THREAD_KIND = "kickside.load:source_thread"
local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local PROC_SCOPE = "wippy.security:process"

local db_acquire_waits: { number } = {}
M.DB = DB
M.EVENT_TYPE = EVENT_TYPE
M.EVENT_KIND = EVENT_KIND
M.TIMER_KIND = TIMER_KIND
M.THREAD_KIND = THREAD_KIND
M.MANAGE_TOOL = MANAGE_TOOL
M.PROC_SCOPE = PROC_SCOPE
M.db_acquire_waits = db_acquire_waits

local function fail(message: string): never
    error("lane LOD: " .. message)
end

local function open_db(): sql.DB
    local started = time.now():unix_nano()
    local db, err = sql.get(DB)
    db_acquire_waits[#db_acquire_waits + 1] = (time.now():unix_nano() - started) / 1000000
    if err or not db then fail("database unavailable: " .. tostring(err)) end
    return db
end

local function exec(statement: string, params: { SqlParam }?): any
    local db = open_db()
    local result, err = db:execute(statement, params or {})
    db:release()
    if err then fail(tostring(err)) end
    return result
end

local function query(statement: string, params: { SqlParam }?): { Map }
    local db = open_db()
    local rows, err = db:query(statement, params or {})
    db:release()
    if err then fail(tostring(err)) end
    return (rows or {}) :: { Map }
end

local function scalar(statement: string, params: { SqlParam }?, name: string): any
    local rows = query(statement, params)
    if not rows[1] then fail("query returned no row: " .. name) end
    return rows[1][name]
end

local function state_get(key: string): string
    local rows = query("SELECT value FROM kickside_lod_state WHERE key=$1", { key })
    return rows[1] and tostring(rows[1].value) or ""
end

local function state_set(key: string, value: any): ()
    exec([[INSERT INTO kickside_lod_state(key,value) VALUES($1,$2)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value]], { key, tostring(value) })
end

local function metric(name: string, target: string, measured: any, status: string, detail: string?): ()
    exec([[INSERT INTO kickside_lod_metric(metric,target,measured,status,detail)
        VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(metric) DO UPDATE SET target=excluded.target,measured=excluded.measured,
            status=excluded.status,detail=excluded.detail]],
        { name, target, tostring(measured), status, detail or "" })
end

local function percentile(values: { number }, p: number): number?
    if #values == 0 then return nil end
    table.sort(values)
    return values[math.max(1, math.ceil(#values * p))]
end

local function fmt(value: number?): string
    if value == nil then return "N/A (no samples)" end
    return string.format("%.3f", value)
end

local function status_for(value: number?, target: number): string
    if value == nil then return "FAIL" end
    return value <= target and "PASS" or "FAIL"
end

local function await_exit(events: any, pid: string, timeout: string, label: string): any
    local timer = time.after(timeout)
    local exited = false
    local exit_kind: any = nil
    local exit_result: any = nil
    while not exited do
        local selected = channel.select({ events:case_receive(), timer:case_receive() })
        if selected.channel ~= events then
            process.terminate(pid)
            fail(label .. " timed out: " .. pid)
        end
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == pid then
            exited = true
            exit_kind = event.kind
            exit_result = event.result
        end
    end
    if exit_kind ~= process.event.EXIT then fail(label .. " did not exit: " .. pid) end
    if type(exit_result) ~= "table" then return nil end
    if exit_result.error then fail(label .. " failed: " .. tostring(exit_result.error)) end
    return exit_result.value
end

local function dbtype(): string
    local db = open_db()
    local value, err = db:type()
    db:release()
    if err then fail("database type lookup failed: " .. tostring(err)) end
    return tostring(value)
end

local function actor_and_threads(): (any, Threads)
    local security = require("security")
    local contract = require("contract")
    local actor = security.new_actor("lane_lod_owner", { security_groups = { "wippy.security:process" } })
    local scope = security.named_scope(PROC_SCOPE)
    local definition, def_err = contract.get("kickside.core:threads")
    if def_err or not definition then fail("thread contract unavailable: " .. tostring(def_err)) end
    local threads, open_err = definition:with_actor(actor):with_scope(scope):open()
    if open_err or not threads then fail("thread contract open failed: " .. tostring(open_err)) end
    return actor, threads :: Threads
end

local function create_thread(label: string): string
    local uuid = require("uuid")
    local _actor, threads = actor_and_threads()
    local result, err = threads:upsert({ thread_class = "kickside.load", impl_id = THREAD_KIND,
        external_ref = "lane-lod:" .. label .. ":" .. uuid.v4(), title = "Lane LOD " .. label })
    if err or type(result) ~= "table" or type((result :: Map).thread_id) ~= "string" then
        fail("thread creation failed: " .. tostring(err))
    end
    return tostring((result :: Map).thread_id)
end

local function append_one(threads: any, thread_id: string, text: string): ()
    local _, err = threads:append_event({ thread_id = thread_id,
        event = { type = EVENT_TYPE, role = "user", body = { text = text } } })
    if err then fail("event append failed: " .. tostring(err)) end
end

local function head(thread_id: string): integer
    local rows = query("SELECT event_count FROM kickside_thread WHERE id=$1", { thread_id })
    if not rows[1] then fail("thread missing: " .. thread_id) end
    return math.floor(tonumber(rows[1].event_count) or 0)
end


M.fail = fail
M.open_db = open_db
M.exec = exec
M.query = query
M.scalar = scalar
M.state_get = state_get
M.state_set = state_set
M.metric = metric
M.percentile = percentile
M.fmt = fmt
M.status_for = status_for
M.await_exit = await_exit
M.dbtype = dbtype
M.actor_and_threads = actor_and_threads
M.create_thread = create_thread
M.append_one = append_one
M.head = head

return M
