-- Core migration 07 (retention pins, tombstones, max_pruned_seq) up, down and
-- up again on a scratch database built from the real core migrations, both
-- engines. Down removes exactly what up added and keeps every thread row.

local test = require("test")
local uuid = require("uuid")
local scratch = require("migration_scratch")

local PREFIX = "kickside.core.migrations:"
local BASE = { "00_encoding", "01_thread", "02_projection", "05_retention", "06_graph" }
local PINS = "07_retention_pins"

local query, exec = scratch.query, scratch.exec

local function migrate(name: string, direction: string)
    scratch.migrate(PREFIX .. name, direction)
end

local function has_table(name: string): boolean
    if scratch.postgres() then
        return #query("SELECT 1 AS one FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1", { name }) == 1
    end
    return #query("SELECT 1 AS one FROM sqlite_master WHERE type = 'table' AND name = $1", { name }) == 1
end

local function has_column(tbl: string, column: string): boolean
    if scratch.postgres() then
        return #query("SELECT 1 AS one FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2",
            { tbl, column }) == 1
    end
    for _, row in ipairs(query("PRAGMA table_info(" .. tbl .. ")")) do
        if row.name == column then return true end
    end
    return false
end

local function define_tests()
    test.describe("Core migration 07", function()
        test.it("adds pins, tombstones and the prune boundary, and down removes exactly them", function()
            scratch.reset()
            for _, name in ipairs(BASE) do migrate(name, "up") end
            local kept = uuid.v7()
            exec("INSERT INTO kickside_thread (id, thread_class, component_id) VALUES ($1, 'mig', $2)", { kept, kept })

            migrate(PINS, "up")
            test.is_true(has_table("kickside_retention_pin"))
            test.is_true(has_table("kickside_retention_pin_tombstone"))
            test.is_true(has_column("kickside_thread", "max_pruned_seq"))
            test.eq(tonumber(query("SELECT max_pruned_seq FROM kickside_thread WHERE id = $1", { kept })[1].max_pruned_seq), 0)

            exec("UPDATE kickside_thread SET max_pruned_seq = 4 WHERE id = $1", { kept })
            exec("INSERT INTO kickside_retention_pin (thread_id, consumer_key, cursor_seq, generation, command_id, command_generation)"
                .. " VALUES ($1, 'drive:a', 5, 1, 'cmd-1', 1)", { kept })
            exec("INSERT INTO kickside_retention_pin_tombstone (thread_id, consumer_key, command_id, command_generation, pin_generation, terminal_op_id, installed_at)"
                .. " VALUES ($1, 'drive:b', 'cmd-2', 2, 1, 'op-1', '2026-09-25T00:00:00Z')", { kept })

            migrate(PINS, "down")
            test.is_false(has_table("kickside_retention_pin"))
            test.is_false(has_table("kickside_retention_pin_tombstone"))
            test.is_true(has_column("kickside_thread", "max_pruned_seq"))
            test.eq(#query("SELECT id FROM kickside_thread WHERE id = $1", { kept }), 1)

            migrate(PINS, "up")
            test.is_true(has_table("kickside_retention_pin"))
            test.eq(tonumber(query("SELECT max_pruned_seq FROM kickside_thread WHERE id = $1", { kept })[1].max_pruned_seq), 4)
            test.eq(#query("SELECT 1 AS one FROM kickside_retention_pin"), 0)
            scratch.drop()
        end)
    end)
end

return test.run_cases(define_tests)
