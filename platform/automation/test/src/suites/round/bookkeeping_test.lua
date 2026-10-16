-- Bookkeeping rows a round writes per delivered item (Design A, 2026-10-03),
-- counted by row triggers on the automation ledger, receipt and prepared
-- tables: a new destination writes its one receipt, a change to a mapped
-- destination writes nothing, replay-unsafe output adds its prepared insert
-- and settlement, an item that fails once writes its ledger row and its
-- resolution, and a round holding an unresolved item writes only that item's
-- row whatever the port's terminal history. Runs on SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local sql = require("sql")
local h = require("round_harness")

type Map = { [string]: any }

local PAST = h.PAST
local PORT = "kickside.automation.round.fixture:records"
local STORE = "kickside.automation.round.fixture:store"
local TABLES = { "kickside_trigger_item_ledger", "kickside_automation_receipt", "kickside_automation_prepared" }
local OPS = { "INSERT", "UPDATE", "DELETE" }
local exec, query = h.exec, h.query
local new_drive, set_drive = h.new_drive, h.set_drive

local function on_postgres(): boolean
    local d = h.db()
    local kind = tostring(d:type())
    d:release()
    return kind == sql.type.POSTGRES
end

-- install_counters creates one counter row per table and operation and a row
-- trigger per table that counts every insert, update and delete.
local function install_counters(): ()
    exec("CREATE TABLE IF NOT EXISTS round_write_count (tbl TEXT NOT NULL, op TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (tbl, op))")
    local postgres = on_postgres()
    if postgres then
        exec([[CREATE OR REPLACE FUNCTION round_count_write() RETURNS trigger AS $body$
            BEGIN UPDATE round_write_count SET n = n + 1 WHERE tbl = TG_TABLE_NAME AND op = TG_OP; RETURN NULL; END
            $body$ LANGUAGE plpgsql]])
    end
    for _, tbl in ipairs(TABLES) do
        for _, op in ipairs(OPS) do
            exec("INSERT INTO round_write_count (tbl, op, n) VALUES ($1, $2, 0) ON CONFLICT (tbl, op) DO NOTHING", { tbl, op })
            if not postgres then
                exec("CREATE TRIGGER IF NOT EXISTS round_count_" .. tbl .. "_" .. op .. " AFTER " .. op .. " ON " .. tbl
                    .. " BEGIN UPDATE round_write_count SET n = n + 1 WHERE tbl = '" .. tbl .. "' AND op = '" .. op .. "'; END")
            end
        end
        if postgres then
            exec("DROP TRIGGER IF EXISTS round_count_" .. tbl .. " ON " .. tbl)
            exec("CREATE TRIGGER round_count_" .. tbl .. " AFTER INSERT OR UPDATE OR DELETE ON " .. tbl
                .. " FOR EACH ROW EXECUTE FUNCTION round_count_write()")
        end
    end
end

local function remove_counters(): ()
    local postgres = on_postgres()
    for _, tbl in ipairs(TABLES) do
        if postgres then
            exec("DROP TRIGGER IF EXISTS round_count_" .. tbl .. " ON " .. tbl)
        else
            for _, op in ipairs(OPS) do exec("DROP TRIGGER IF EXISTS round_count_" .. tbl .. "_" .. op) end
        end
    end
    if postgres then exec("DROP FUNCTION IF EXISTS round_count_write()") end
    exec("DROP TABLE IF EXISTS round_write_count")
end

-- counted(fn) -> { [short table] = { INSERT, UPDATE, DELETE } } of the
-- rows fn wrote.
local function counted(fn: () -> ()): Map
    exec("UPDATE round_write_count SET n = 0")
    fn()
    local out: Map = {}
    for _, row in ipairs(query("SELECT tbl, op, n FROM round_write_count")) do
        local short = tostring(row.tbl):gsub("^kickside_trigger_item_", ""):gsub("^kickside_automation_", "")
        local entry = out[short] or { INSERT = 0, UPDATE = 0, DELETE = 0 }
        entry[row.op] = math.floor(tonumber(row.n) or 0)
        out[short] = entry
    end
    return out
end

local function shape(counts: Map): string
    local parts: { string } = {}
    for _, name in ipairs({ "ledger", "receipt", "prepared" }) do
        local c = counts[name] :: Map
        parts[#parts + 1] = name .. "=" .. tostring(c.INSERT) .. "/" .. tostring(c.UPDATE) .. "/" .. tostring(c.DELETE)
    end
    return table.concat(parts, " ")
end

local function define_tests()
    test.describe("automation round: bookkeeping rows per delivered item", function()
        local automation_id = ""
        local run: (string, string, any?, any?, any?) -> (Map?, any) = function(_: string, _k: string): (Map?, any) return nil, nil end

        test.before_each(function()
            local env = h.setup("round_bookkeeping")
            automation_id, run = env.automation_id, env.run
            install_counters()
        end)
        test.after_each(function() remove_counters() end)

        local function sink_drive(key: string, items: { Map }, replay_safe: boolean): ()
            new_drive({ automation_id = automation_id, drive_key = key, source_kind = "collection",
                applied = { sink_port = STORE, replay_safe = replay_safe },
                action = { source_ref = PORT, config = { items = items }, schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, key, "next_run_at=$1", { PAST })
        end

        local function round(key: string): ()
            local _, err = run(automation_id, key)
            test.is_nil(err, tostring(err))
        end

        test.it("writes one receipt for a new destination and nothing for a change to it", function()
            local items: { Map } = { { key = "rec-1" } }
            sink_drive("replay_safe", items, true)
            local created = counted(function() round("replay_safe") end)
            test.eq(shape(created), "ledger=0/0/0 receipt=1/0/0 prepared=0/0/0", "new record")
            items[1] = { key = "rec-1", dedup_key = "rec-1:revision-2" }
            set_drive(automation_id, "replay_safe", "action_json=$1, cursor=NULL, next_run_at=$2", { json.encode({
                source_ref = PORT, config = { items = items }, schedule = { type = "interval", expression = "1h" } }), PAST })
            local changed = counted(function() round("replay_safe") end)
            test.eq(shape(changed), "ledger=0/0/0 receipt=0/0/0 prepared=0/0/0", "change to a mapped record")
        end)

        test.it("adds the prepared insert and settlement for replay-unsafe output", function()
            sink_drive("replay_unsafe", { { key = "rec-u" } }, false)
            local created = counted(function() round("replay_unsafe") end)
            test.eq(shape(created), "ledger=0/0/0 receipt=1/0/0 prepared=1/0/1", "new record, replay-unsafe transform")
        end)

        test.it("writes the ledger row of an item that fails once and its resolution", function()
            new_drive({ automation_id = automation_id, drive_key = "fails_once", source_kind = "collection",
                action = { source_ref = PORT, config = { items = { { key = "f-1", directive = "fail_retry" } } },
                    schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, "fails_once", "next_run_at=$1", { PAST })
            local failed = counted(function() round("fails_once") end)
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2", { PAST, automation_id })
            local resolved = counted(function() round("fails_once") end)
            test.eq(shape(failed), "ledger=1/0/0 receipt=0/0/0 prepared=0/0/0", "the failed attempt")
            test.eq(shape(resolved), "ledger=0/1/0 receipt=0/0/0 prepared=0/0/0", "the delivered retry")
        end)

        test.it("writes only the held item's row in a round over a port with terminal history", function()
            local items: { Map } = {}
            for i = 1, 20 do items[i] = { key = "dead-" .. tostring(i), directive = "fail_dead" } end
            items[21] = { key = "held", directive = "fail_always" }
            new_drive({ automation_id = automation_id, drive_key = "held_round", source_kind = "collection",
                action = { source_ref = PORT, config = { items = items }, schedule = { type = "interval", expression = "1h" } } })
            set_drive(automation_id, "held_round", "next_run_at=$1", { PAST })
            round("held_round")
            exec("UPDATE kickside_trigger_item_ledger SET next_attempt_at=$1 WHERE owner_id=$2 AND item_key='held'", { PAST, automation_id })
            local retried = counted(function() round("held_round") end)
            test.eq(shape(retried), "ledger=0/1/0 receipt=0/0/0 prepared=0/0/0", "a redelivery round holding one item")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return {
    run = function(options: any): any return run_cases(options) end,
}
