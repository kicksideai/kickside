local test = require("test")
local registry = require("registry")
local sql = require("sql")
local process = require("process")
local channel = require("channel")
local time = require("time")
local owner_hooks = require("owner_hooks")
local runner = require("retention_runner")

local TABLE = "kickside_test_retention_owner_probe"
local FIRST = "kickside.core.retention.pin_tests:owner_probe_first"
local SECOND = "kickside.core.retention.pin_tests:owner_probe_second"

local function exec(statement: string, params: { any }?): ()
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, params or {})
    db:release()
    test.is_nil(err, tostring(err))
end

local function arm(first_mode: string, second_mode: string): ()
    exec("CREATE TABLE IF NOT EXISTS " .. TABLE
        .. " (owner TEXT PRIMARY KEY, mode TEXT NOT NULL, calls INTEGER NOT NULL)")
    exec("DELETE FROM " .. TABLE)
    exec("INSERT INTO " .. TABLE .. " (owner,mode,calls) VALUES ('first',$1,0),('second',$2,0)",
        { first_mode, second_mode })
end

local function calls(owner: string): integer
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT calls FROM " .. TABLE .. " WHERE owner=$1", { owner })
    db:release()
    test.is_nil(err, tostring(err))
    return tonumber((rows :: { table })[1].calls) :: integer
end

local function failure_of(failures: { table }, owner: string): table?
    for _, failed in ipairs(failures) do
        if failed.owner == owner then return failed end
    end
    return nil
end

local function define_tests()
    test.describe("Core retention owner isolation", function()
        test.after_each(function()
            exec("DELETE FROM " .. TABLE)
        end)

        test.it("reads migration identities without materializing timestamps and descriptions", function()
            arm("count", "count")
            local db = assert(sql.get("app:db"))
            local rows, read_err = owner_hooks.applied_ids(db)
            db:release()
            test.is_nil(read_err)
            if not rows then error("migration identities are absent") end
            test.is_true(#rows > 0)
            for _, row in ipairs(rows) do
                test.eq(type(row.id), "string")
                local fields = 0
                for _ in pairs(row) do fields = fields + 1 end
                test.eq(fields, 1)
            end
        end)

        test.it("discovers immutable owner declarations once per version while reading migration readiness on every pass", function()
            arm("count", "count")
            local original_ledger = owner_hooks.applied_ids
            local migration_reads = 0
            owner_hooks.applied_ids = function(db)
                migration_reads = migration_reads + 1
                return original_ledger(db)
            end
            local ok, failure = pcall(function()
                local first_entries, first_definitions, first_err = owner_hooks.declarations()
                local second_entries, second_definitions, second_err = owner_hooks.declarations()
                test.is_nil(first_err)
                test.is_nil(second_err)
                test.is_true(first_entries == second_entries)
                test.is_true(first_definitions == second_definitions)
                local first, first_err = owner_hooks.run()
                local initial_reads = migration_reads
                local second, second_err = owner_hooks.run()
                test.is_nil(first_err)
                test.is_nil(second_err)
                test.not_nil(first)
                test.not_nil(second)
                test.is_true(initial_reads > 0)
                test.eq(migration_reads, initial_reads * 2)
                test.eq(calls("first"), 2)
                test.eq(calls("second"), 2)
            end)
            owner_hooks.applied_ids = original_ledger
            if not ok then error(failure) end
        end)

        test.it("rediscovers owner declarations after registry publication and restoration", function()
            arm("count", "count")
            local version = assert(registry.current_version())
            local first, _, first_err = owner_hooks.declarations()
            test.is_nil(first_err)
            if not first then error("owner declarations are absent") end
            local entry = assert(registry.get(FIRST))
            local snapshot = assert(registry.snapshot())
            local changes = snapshot:changes()
            local meta: table = {}
            for key, value in pairs(entry.meta) do meta[key] = value end
            meta.type = "retention.test.inactive"
            changes:update({ id = entry.id, kind = entry.kind, meta = meta, data = entry.data })
            local _, apply_err = changes:apply()
            local changed, _, discovery_err = owner_hooks.declarations()
            local report, run_err = owner_hooks.run()
            local first_calls, second_calls = calls("first"), calls("second")
            local _, restore_err = registry.apply_version(version)
            local restored, _, restore_discovery_err = owner_hooks.declarations()
            test.is_nil(apply_err)
            test.is_nil(discovery_err)
            test.is_nil(run_err)
            test.not_nil(report)
            if not report then error("owner retention report is absent") end
            test.eq(first_calls, 0)
            test.eq(second_calls, 1)
            test.is_nil(restore_err)
            test.is_nil(restore_discovery_err)
            test.is_true(first ~= changed)
            test.eq(#changed, #first - 1)
            test.eq(#restored, #first)
        end)

        test.it("runs every owner after one owner refuses and reports the refusal", function()
            arm("fail", "count")
            local report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(report)
            if not report then error("owner retention report is absent") end
            test.eq(calls("first"), 1)
            test.eq(calls("second"), 1, "an owner after a failed owner still runs")
            test.is_true((report :: table).deleted >= 1, "the healthy owner's rows count")
            local failed = failure_of((report :: table).failures, FIRST)
            test.not_nil(failed, "the refusing owner is reported")
            test.contains(tostring((failed :: table).error), "probe owner first refused")
            test.is_nil(failure_of((report :: table).failures, SECOND))
        end)

        test.it("isolates an owner that raises", function()
            arm("count", "raise")
            local report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            if not report then error("owner retention report is absent") end
            test.eq(calls("first"), 1)
            test.eq(calls("second"), 1)
            local failed = failure_of((report :: table).failures, SECOND)
            test.not_nil(failed, "the raising owner is reported")
            test.contains(tostring((failed :: table).error), "probe owner second raised")
        end)

        test.it("continues a healthy owner's page after another owner fails and preserves the released owner", function()
            arm("fail", "continue")
            local mailbox = process.listen("kickside.core.retention.changed")
            local db = assert(sql.get("app:db"))
            local ok, failure = pcall(function()
                local pass, pass_err = runner.on_wake(db, tostring(process.pid()), {
                    kind = "owner_continuation_test", owner_locator = { kind = "component", id = "released-owner" } })
                test.is_nil(pass_err, tostring(pass_err))
                test.not_nil(pass)
                test.not_nil(failure_of((pass :: table).owner_failures, FIRST))
                test.is_true((pass :: table).stats.needs_continue)
                local more = channel.select({ mailbox:case_receive(), time.after(5 * time.SECOND):case_receive() })
                test.eq(more.channel, mailbox, "healthy owner page lost its continuation")
                test.eq(more.value.kind, "continue")
                test.eq(more.value.owner_locator.id, "released-owner")
            end)
            db:release()
            process.unlisten(mailbox)
            if not ok then error(failure) end
        end)

        test.it("reports typed blocked cleanup alongside a healthy owner without self-continuation", function()
            arm("blocked", "count")
            local mailbox = process.listen("kickside.core.retention.changed")
            local db = assert(sql.get("app:db"))
            local ok, failure = pcall(function()
                for _ = 1, 2 do
                    local pass, pass_err = runner.on_wake(db, tostring(process.pid()), { kind = "blocked_owner_test" })
                    test.is_nil(pass_err, tostring(pass_err))
                    test.is_true(pass.stats.needs_continue ~= true)
                    test.eq(#pass.owner_failures, 0)
                    test.eq(#pass.owner_blocked, 1)
                    test.eq(pass.owner_blocked[1].owner, FIRST)
                    test.eq(pass.owner_blocked[1].component_id, "blocked-component")
                    test.is_true(errors.is(pass.owner_blocked[1].error, errors.CONFLICT))
                    test.eq(pass.owner_blocked[1].error:details().wait_for, "eligibility")
                    test.is_true(channel.select({ mailbox:case_receive(), default = true }).default)
                end
                test.eq(calls("first"), 2)
                test.eq(calls("second"), 2)
            end)
            db:release()
            process.unlisten(mailbox)
            if not ok then error(failure) end
        end)

        test.it("isolates an owner with a malformed blocked report", function()
            arm("malformed_blocked", "count")
            local report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(failure_of(report.failures, FIRST))
            test.is_nil(failure_of(report.failures, SECOND))
            test.eq(calls("second"), 1)
        end)

        test.it("completes the Core pass and re-runs a failed owner on the next pass", function()
            arm("fail", "count")
            local db = assert(sql.get("app:db"))
            local pass, pass_err = runner.on_wake(db, "retention-owner-isolation", { kind = "owner_isolation_test" })
            test.is_nil(pass_err, tostring(pass_err))
            test.not_nil(pass)
            test.not_nil(failure_of((pass :: table).owner_failures, FIRST), "the pass reports the failed owner")
            exec("UPDATE " .. TABLE .. " SET mode='count' WHERE owner='first'")
            local next_pass, next_err = runner.on_wake(db, "retention-owner-isolation", { kind = "owner_isolation_test" })
            db:release()
            test.is_nil(next_err, tostring(next_err))
            test.eq(calls("first"), 2, "the failed owner runs again on the next pass")
            test.is_nil(failure_of((next_pass :: table).owner_failures, FIRST))
        end)
    end)
end

return test.run_cases(define_tests)
