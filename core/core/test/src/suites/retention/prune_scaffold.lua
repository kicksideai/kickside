-- Shared prune-case helpers: dialect-shaped fixtures, boundary reads, and
-- the lock-wait probe. Stateless; both prune suites require this module.
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local pin = require("pin")
local prune = require("prune")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("prune test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function exec(statement: string, params: { any }): ()
    local db = open_db()
    local _, err = db:execute(statement, params)
    db:release()
    if err then error(tostring(err)) end
end

local function query(statement: string, params: { any }): { table }
    local db = open_db()
    local rows, err = db:query(statement, params)
    db:release()
    if err then error(tostring(err)) end
    return rows :: { table }
end

local function dialect(): string
    local db = open_db()
    local dbtype = tostring(db:type())
    db:release()
    return dbtype
end

-- A timestamp offset_days from now in the dialect's textual shape.
local function ts(offset_days: number): string
    local at = time.now():add(offset_days * 24 * time.HOUR):utc()
    if dialect() == sql.type.SQLITE then
        return at:format("2006-01-02 15:04:05.000000") :: string
    end
    return at:format(time.RFC3339) :: string
end

local function make_thread(): string
    local id = uuid.v7()
    exec("INSERT INTO kickside_thread (id, thread_class, component_id, event_count) VALUES ($1, $2, $3, 0)",
        { id, "prune_test", id })
    return id
end

-- Insert events at the given sequences, each created age_days ago.
local function add_events(thread_id: string, seqs: { integer }, age_days: number): ()
    local created_at = ts(-age_days)
    for _, seq in ipairs(seqs) do
        local event_id = uuid.v7()
        exec("INSERT INTO kickside_event (id, thread_id, type, role, body, seq, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            { event_id, thread_id, "kickside.threads:message.created", "user", "{}", seq, created_at })
        exec("UPDATE kickside_thread SET event_count=$1 WHERE id=$2 AND event_count<$1", { seq, thread_id })
    end
end

local function add_bulk_events(thread_id: string, count: integer): ()
    local created_at = ts(-10)
    if dialect() == sql.type.POSTGRES then
        exec([[INSERT INTO kickside_event (id,thread_id,type,role,body,seq,created_at)
            SELECT md5($1::text || ':' || n::text)::uuid,$2::uuid,'test.bulk','user','{}',n,$3
            FROM generate_series(1,]] .. tostring(count) .. [[) AS n]], { thread_id, thread_id, created_at })
    else
        exec([[WITH RECURSIVE numbered(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbered WHERE n<]]
            .. tostring(count) .. [[)
            INSERT INTO kickside_event (id,thread_id,type,role,body,seq,created_at)
            SELECT lower(hex(randomblob(16))),$1,'test.bulk','user','{}',n,$2 FROM numbered]],
            { thread_id, created_at })
    end
    exec("UPDATE kickside_thread SET event_count=$1 WHERE id=$2", { count, thread_id })
end

local function range(from: integer, to: integer): { integer }
    local out: { integer } = {}
    for seq = from, to do out[#out + 1] = seq end
    return out
end

local function seqs_of(thread_id: string): { integer }
    local out: { integer } = {}
    for _, row in ipairs(query("SELECT seq FROM kickside_event WHERE thread_id = $1 ORDER BY seq", { thread_id })) do
        out[#out + 1] = math.floor(tonumber(row.seq) :: number)
    end
    return out
end

local function boundary_of(thread_id: string): integer
    local rows = query("SELECT max_pruned_seq FROM kickside_thread WHERE id = $1", { thread_id })
    return math.floor(tonumber(rows[1].max_pruned_seq) :: number)
end

local function run_prune(thread_id: string, batch_size: integer?): (any?, error?)
    local db = open_db()
    local result, err = prune.prune_thread(db, thread_id, { cutoff = ts(-1), batch_size = batch_size })
    db:release()
    return result, err
end

local function missing_delete_executor(): any
    return {
        db_type = function(): (string, any) return sql.type.SQLITE, nil end,
        query = function(_self: any, statement: string): (any, any)
            if statement:find("SELECT max_pruned_seq", 1, true) then
                return { { max_pruned_seq = 0 } }, nil
            end
            return { { value = 1 } }, nil
        end,
        execute = function(_self: any, statement: string): (any, any)
            if statement:find("DELETE FROM kickside_event WHERE", 1, true) then return nil, nil end
            return { rows_affected = 1 }, nil
        end,
    }
end

local function lower(thread_id: string, command_generation: integer, target: integer): (any?, error?)
    local db = open_db()
    local receipt, err = pin.pin_lower(db, { thread_id = thread_id, consumer_key = "drive:a",
        command_id = "cmd-" .. tostring(command_generation), command_generation = command_generation, target_cursor = target })
    db:release()
    return receipt, err
end

-- Block until another PostgreSQL backend waits on a row lock. SQLite runs the
-- second writer only after the first releases its single connection.
local function await_lock_waiter(dbtype: string): ()
    if dbtype ~= sql.type.POSTGRES then return end
    local db = open_db()
    for _ = 1, 500 do
        local rows, err = db:query("SELECT count(*) AS n FROM pg_stat_activity"
            .. " WHERE datname = current_database() AND wait_event_type = 'Lock'")
        if err then db:release(); error("lock probe failed: " .. tostring(err)) end
        if (tonumber(rows and rows[1] and (rows[1] :: any).n) or 0) > 0 then db:release(); return end
        time.sleep("10ms")
    end
    db:release()
    error("the racing writer never waited on the thread lock")
end

return {
    open_db = open_db,
    exec = exec,
    query = query,
    dialect = dialect,
    ts = ts,
    make_thread = make_thread,
    add_events = add_events,
    add_bulk_events = add_bulk_events,
    range = range,
    seqs_of = seqs_of,
    boundary_of = boundary_of,
    run_prune = run_prune,
    missing_delete_executor = missing_delete_executor,
    lower = lower,
    await_lock_waiter = await_lock_waiter,
}
