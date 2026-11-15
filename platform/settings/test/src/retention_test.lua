-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local security = require("security")
local sql = require("sql")
local time = require("time")
local process = require("process")
local channel = require("channel")
local writer = require("settings_writer")
local changes = require("settings_changes")

local NS = "kickside.settings.test"

local function settings(): any
    return assert(assert(contract.get("kickside.settings:settings"))
        :with_actor(security.new_actor("admin", {}))
        :with_scope(security.new_scope({ assert(security.policy("app:settings_admin_policy")) })):open())
end

local function execute(statement: string, params: { any }?): ()
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, params or {})
    db:release()
    assert(not err, tostring(err))
end

local function probe(): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT * FROM settings_retention_probe WHERE id=1")
    db:release()
    assert(not err, tostring(err))
    return rows[1]
end

local function await_probe(predicate: (any) -> boolean): any
    local limit = time.now():unix_nano() + 5 * time.SECOND
    repeat
        local row = probe()
        if predicate(row) then return row end
        time.sleep("20ms")
    until time.now():unix_nano() >= limit
    error("retention did not apply the committed setting within 5s")
end

local function define_tests()
    test.describe("Committed settings wake Core retention", function()
        local pid: string? = nil
        local events: any = nil
        local initial_calls: number = 0

        test.before_all(function()
            execute([[CREATE TABLE settings_retention_probe (id INTEGER PRIMARY KEY,
                retained INTEGER NOT NULL, created_ms BIGINT NOT NULL, calls INTEGER NOT NULL,
                observed_days INTEGER NOT NULL, revision BIGINT NOT NULL)]])
        end)
        test.before_each(function()
            test.is_true(settings():set({ namespace = NS, key = "retention_days", value = 30 }).success)
            -- Drain the existing keeper publication before starting the owned sweeper.
            time.sleep("300ms")
            execute("INSERT INTO settings_retention_probe VALUES (1,1,$1,0,-1,-1)",
                { math.floor(time.now():unix_nano() / 1000000) - 86400000 })
            events = process.events()
            pid = assert(process.spawn_monitored("kickside.core.retention.service:sweeper_process", "app:processes"))
            await_probe(function(row) return tonumber(row.calls) > 0 end)
            time.sleep("300ms")
            test.eq(tonumber(probe().observed_days), 30)
            test.eq(tonumber(probe().retained), 1)
            initial_calls = assert(tonumber(probe().calls))
        end)
        test.after_each(function()
            if pid then
                process.cancel(pid)
                local timeout = time.after("5s")
                while true do
                    local result = channel.select({ events:case_receive(), timeout:case_receive() })
                    assert(result.channel == events, "owned retention sweeper did not stop")
                    if result.value.kind == process.event.EXIT and tostring(result.value.from) == tostring(pid) then
                        test.is_nil(result.value.result.error)
                        break
                    end
                end
                pid = nil
            end
            execute("DELETE FROM settings_retention_probe")
            settings():unset({ namespace = NS, key = "retention_days" })
        end)

        local function applied(): ()
            local row = await_probe(function(row) return tonumber(row.retained) == 0 end)
            test.eq(tonumber(row.observed_days), 0)
            test.eq(tonumber(row.revision), writer.stored_revision(), "owner sees the committed cache revision")
            local calls = tonumber(row.calls)
            test.eq(calls, initial_calls + 1, "one committed revision wakes the owner once")
            assert(changes.publish(writer.stored_revision()))
            test.is_true(settings():get({ namespace = NS, key = "retention_days" }).success)
            time.sleep("300ms")
            test.eq(tonumber(probe().calls), calls, "duplicate publication and reads do not wake retention")
        end

        test.it("applies a setting-only commit while the owner has a distant deadline", function()
            test.is_true(settings():set({ namespace = NS, key = "retention_days", value = 0 }).success)
            applied()
        end)
        test.it("applies the default after an unset-only commit", function()
            test.is_true(settings():unset({ namespace = NS, key = "retention_days" }).success)
            applied()
        end)
        test.it("reloads a remotely committed policy before waking retention", function()
            local db = assert(sql.get("app:db"))
            local tx = assert(db:begin())
            assert(tx:execute("UPDATE kickside_settings SET value='0' WHERE namespace=$1 AND key='retention_days'", { NS }))
            assert(tx:execute("UPDATE kickside_settings_revision SET revision=revision+1 WHERE id=1"))
            assert(tx:commit())
            db:release()
            assert(changes.publish(writer.stored_revision()))
            applied()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
