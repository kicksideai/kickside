local test = require("test")
local fixture = require("fixture")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
return { run = test.run_cases(function()
    test.describe("Thread bounded delete", function()
        test.it("accepts one page and completes through durable owner retention", function()
            local f = fixture.new()
            local thread, create_err = f.as_owner("create", { thread_class = "bounded-delete" })
            test.is_nil(create_err, tostring(create_err))
            local id = thread.thread_id or thread.id
            test.not_nil(id)
            local db, open_err = sql.get("app:db")
            test.is_nil(open_err)
            for i = 1, 305 do
                local _, err = db:execute("INSERT INTO kickside_projection (id,thread_id,kind,projection_key,body,state,last_event_seq,created_at,updated_at)"
                    .. " VALUES ($1,$2,$3,'default','{}','valid',0,$4,$4)",
                    { uuid.v4(), id, "bounded-" .. tostring(i), "2026-01-01T00:00:00Z" })
                test.is_nil(err, tostring(err))
            end
            local result, err = f.as_owner("delete", { thread_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(result.in_progress)
            test.is_false(result.deleted)
            test.is_true(result.cleanup_pending)
            test.is_true(result.details.needs_continue)
            local discarded = result.details.discarded
            local removed = 0
            for _, table_name in ipairs({ "kickside_event", "kickside_thread_subject", "kickside_projection_cursor",
                "kickside_retention_policy", "kickside_retention_pin", "kickside_retention_pin_tombstone",
                "kickside_projection", "kickside_thread_edge" }) do
                removed = removed + (discarded[table_name] or 0)
            end
            test.eq(removed, 100, "one request consumes exactly one bounded dependent-row page")
            test.eq(f.projection_count(id), 305 - (discarded.kickside_projection or 0))
            local rows, read_err = db:query("SELECT component_id FROM kickside_component_thread_reap WHERE component_id=$1", { id })
            test.is_nil(read_err)
            test.eq(#rows, 1)
            for i = 1, 4 do
                local tick, tick_err = funcs.new():call("kickside.component:retention", {})
                test.is_nil(tick_err, tostring(tick_err))
                test.is_true(tick.success, tostring(tick.error))
                if i < 3 then test.is_true(tick.needs_continue) end
            end
            rows, read_err = db:query("SELECT id FROM kickside_thread WHERE id=$1", { id })
            test.is_nil(read_err)
            test.eq(#rows, 0)
            test.eq(f.projection_count(id), 0)
            rows, read_err = db:query("SELECT component_id FROM kickside_component_thread_reap WHERE component_id=$1", { id })
            test.is_nil(read_err)
            test.eq(#rows, 0)
            db:release()
        end)
    end)
end) }
