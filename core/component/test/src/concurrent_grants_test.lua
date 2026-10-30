-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local ops = require("access_ops")

local function database()
    return assert(sql.get("app:db"))
end

return {run = test.run_cases(function()
    test.describe("concurrent direct grants", function()
        test.it("upserts one subject atomically and preserves the original row identity", function()
            local db = database()
            local id, subject = uuid.v7(), uuid.v7()
            test.is_nil(select(2, db:execute([[INSERT INTO kickside_components
                (component_id,impl_id,private_context,position) VALUES ($1,'kickside.test:acl','{}','n')]], {id})))
            local tx = assert(db:begin())
            local command = {type = "GRANT_ACCESS", payload = {component_id = id, subject_id = subject, subject_type = "user", access_mask = 1}}
            local first, first_err = ops.grant_access(tx, db, command)
            test.is_nil(first_err, tostring(first_err))
            test.is_true(first.changes_made)
            local original = assert(tx:query("SELECT access_id, created_at FROM kickside_component_access WHERE component_id=$1", {id}))
            local done = channel.new(1)
            coroutine.spawn(function()
                local second_db = database()
                local second_tx = assert(second_db:begin())
                command.payload.access_mask = 9
                local _, err = ops.grant_access(second_tx, second_db, command)
                if err then second_tx:rollback() else
                    local _, commit_err = second_tx:commit()
                    err = commit_err
                end
                second_db:release()
                done:send(err and tostring(err) or "")
            end)
            if tostring(db:type()) == sql.type.POSTGRES then
                local observer = database()
                local waiting = false
                for _ = 1, 500 do
                    local rows = assert(observer:query([[SELECT count(*) AS n FROM pg_stat_activity
                        WHERE datname=current_database() AND wait_event_type='Lock']]))
                    if tonumber(rows[1].n) > 0 then waiting = true; break end
                    time.sleep("10ms")
                end
                observer:release()
                if not waiting then
                    tx:rollback(); db:release()
                    error("concurrent grant never waits for the first writer")
                end
            end
            test.is_nil(select(2, tx:commit()))
            test.eq(done:receive(), "")
            local rows = assert(db:query("SELECT access_id, created_at, access_mask FROM kickside_component_access WHERE component_id=$1", {id}))
            db:release()
            test.eq(#rows, 1)
            test.eq(rows[1].access_id, original[1].access_id)
            test.eq(rows[1].created_at, original[1].created_at)
            test.eq(tonumber(rows[1].access_mask), 9)
        end)
    end)
end)}
