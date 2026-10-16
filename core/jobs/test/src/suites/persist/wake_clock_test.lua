local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local wake = require("wake")

local function define_tests()
    test.describe("jobs wake timestamps", function()
        test.it("ensures due and running jobs dispatch without rewriting their schedule or retry state", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local dbtype = tostring(db:type())
            for _, status in ipairs({ "pending", "running" }) do
                local id = uuid.v7()
                local _, insert_err = sql.builder.insert("kickside_job"):set_map({
                    id = id, job_identity = "7:oneshot" .. #id .. ":" .. id .. #id .. ":" .. id,
                    job_type = "test.wake_clock", owner_kind = "test", owner_id = "wake_clock_test",
                    status = status, attempts = 3, wake_enabled = true, wake_control_pending = false,
                    scheduled_at = "2000-01-01T00:00:00Z", execution_seq = 7,
                }):run_with(db):exec()
                test.is_nil(insert_err)
                local before, before_err = db:query("SELECT scheduled_at,attempts,wake_control_pending,execution_seq FROM kickside_job WHERE id=$1", { id })
                test.is_nil(before_err)
                local result, err = wake.wake_job(db, id, { control = true, ensure_due = true }, dbtype)
                local after, after_err = db:query("SELECT scheduled_at,attempts,wake_control_pending,execution_seq FROM kickside_job WHERE id=$1", { id })
                test.is_nil(err)
                test.is_true(result.woken)
                test.is_true(result.already_due)
                test.is_nil(after_err)
                test.eq(after[1].scheduled_at, before[1].scheduled_at)
                test.eq(after[1].attempts, before[1].attempts)
                test.eq(after[1].wake_control_pending, before[1].wake_control_pending)
                test.eq(after[1].execution_seq, before[1].execution_seq)
                local _, cleanup_err = db:execute("DELETE FROM kickside_job WHERE id=$1", { id })
                test.is_nil(cleanup_err)
            end
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)

        test.it("still control-wakes parked, disabled, and future jobs when ensuring dispatch", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.not_nil(db)
            local dbtype = tostring(db:type())
            for _, shape in ipairs({
                { scheduled_at = "2099-01-01T00:00:00Z", enabled = true },
                { scheduled_at = "2000-01-01T00:00:00Z", enabled = false },
                { enabled = true },
            }) do
                local id = uuid.v7()
                local _, insert_err = sql.builder.insert("kickside_job"):set_map({
                    id = id, job_identity = "7:oneshot" .. #id .. ":" .. id .. #id .. ":" .. id,
                    job_type = "test.wake_clock", owner_kind = "test", owner_id = "wake_clock_test",
                    status = "pending", attempts = 3, wake_enabled = shape.enabled,
                    scheduled_at = shape.scheduled_at,
                }):run_with(db):exec()
                test.is_nil(insert_err)
                if shape.scheduled_at == nil then
                    test.is_nil(select(2, db:execute("UPDATE kickside_job SET scheduled_at=NULL WHERE id=$1", { id })))
                end
                local result, err = wake.wake_job(db, id, { control = true, ensure_due = true }, dbtype)
                local rows, read_err = db:query("SELECT scheduled_at,attempts,wake_enabled FROM kickside_job WHERE id=$1", { id })
                test.is_nil(err)
                test.is_true(result.woken)
                test.is_nil(result.already_due)
                test.is_nil(read_err)
                test.not_nil(rows[1].scheduled_at)
                test.eq(tonumber(rows[1].attempts), 0)
                test.is_true(rows[1].wake_enabled == true or tonumber(rows[1].wake_enabled) == 1)
                local _, cleanup_err = db:execute("DELETE FROM kickside_job WHERE id=$1", { id })
                test.is_nil(cleanup_err)
            end
            local missing, missing_err = wake.wake_job(db, uuid.v7(), { control = true, ensure_due = true }, dbtype)
            test.is_nil(missing_err)
            test.is_false(missing.woken)
            local _, invalid_err = wake.wake_job(db, uuid.v7(), { ensure_due = true }, dbtype)
            test.is_true(errors.is(invalid_err, errors.INVALID))
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)

        test.it("uses an absolute UTC instant for a control wake", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            test.not_nil(db)
            local dbtype = tostring(db:type())
            local id = uuid.v7()
            local identity = "7:oneshot" .. #id .. ":" .. id .. #id .. ":" .. id
            local _, insert_err = sql.builder.insert("kickside_job")
                :set_map({ id = id, job_identity = identity, job_type = "test.wake_clock",
                    owner_kind = "test", owner_id = "wake_clock_test",
                    wake_enabled = false })
                :run_with(db):exec()
            test.is_nil(insert_err)
            local _, park_err = sql.builder.update("kickside_job")
                :set("scheduled_at", nil)
                :where(sql.builder.eq({ id = id }))
                :run_with(db):exec()
            test.is_nil(park_err)

            if dbtype == sql.type.POSTGRES then
                local _, zone_err = db:execute("SET TIME ZONE 'America/New_York'")
                test.is_nil(zone_err)
            end
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local woken, wake_err = wake.wake_job(tx, id, { control = true }, dbtype)
            local rows, query_err
            if dbtype == sql.type.POSTGRES then
                rows, query_err = tx:query("SELECT ABS(EXTRACT(EPOCH FROM (scheduled_at - NOW()))) AS drift FROM kickside_job WHERE id = '" .. id .. "'")
            else
                rows, query_err = sql.builder.select("scheduled_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = id }))
                    :run_with(tx):query()
            end
            local _, cleanup_err = sql.builder.update("kickside_job")
                :set("status", "cancelled")
                :where(sql.builder.eq({ id = id }))
                :run_with(tx):exec()
            local _, commit_err = tx:commit()
            if dbtype == sql.type.POSTGRES then
                db:execute("SET TIME ZONE 'UTC'")
            end
            db:release()
            test.is_nil(wake_err)
            test.is_true(woken and woken.woken)
            test.is_nil(query_err)
            test.is_nil(cleanup_err)
            test.is_nil(commit_err)
            if dbtype == sql.type.POSTGRES then
                test.is_true(tonumber(rows[1].drift) < 5)
            else
                test.not_nil(rows[1].scheduled_at)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local function run(options)
    return run_cases(options)
end
return { run = run }
