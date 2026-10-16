local test = require("test")
local uuid = require("uuid")
local store = require("store")
local maintenance = require("maintenance")

local function define_tests()
    test.describe("workflow run retention", function()
        test.it("removes aged published terminal runs and protects unfinished publication and live runs", function()
            local db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local flow = uuid.v4()
            local ids = {}
            for _, spec in ipairs({
                { name = "old", status = "completed", finished = "2000-01-01T00:00:00Z", pending = false },
                { name = "unpublished", status = "failed", finished = "2000-01-01T00:00:00Z", pending = true },
                { name = "live", status = "running", finished = "2000-01-01T00:00:00Z", pending = false },
                { name = "recent", status = "completed", finished = "2999-01-01T00:00:00Z", pending = false },
            }) do
                local id = uuid.v4()
                ids[spec.name] = id
                local _, insert_err = db:execute([[INSERT INTO workflow_runs
                    (run_id,workflow_id,version,trigger_kind,status,started_at,finished_at,
                     terminal_event_pending)
                    VALUES ($1,$2,1,'manual',$3,$4,$4,$5)]],
                    { id, flow, spec.status, spec.finished, spec.pending })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local removed, prune_err = maintenance.prune_terminal(10)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(removed, 1)
            db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local rows, query_err = db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { flow })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 3)
            local found = {}
            for _, row in ipairs(rows) do found[row.run_id] = true end
            test.is_nil(found[ids.old])
            test.is_true(found[ids.unpublished])
            test.is_true(found[ids.live])
            test.is_true(found[ids.recent])
        end)

        test.it("purging a workflow removes its retained runs", function()
            local flow, run_id = uuid.v4(), uuid.v4()
            local db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local _, run_err = db:execute([[INSERT INTO workflow_runs
                (run_id,workflow_id,version,trigger_kind,status,started_at,finished_at)
                VALUES ($1,$2,1,'manual','completed','2000-01-01T00:00:00Z','2000-01-01T00:00:00Z')]],
                { run_id, flow })
            test.is_nil(run_err, tostring(run_err))

            db:release()
            local purged, purge_err = store.purge(flow)
            test.is_nil(purge_err, tostring(purge_err))
            test.is_true(purged)
            db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local rows, query_err = db:query("SELECT run_id FROM workflow_runs WHERE run_id=$1", { run_id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 0)
        end)

        test.it("removes terminal runs from a deleted trigger and orphan gates while preserving live gates", function()
            local flow = uuid.v4()
            local orphan, old, live = uuid.v4(), uuid.v4(), uuid.v4()
            local db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            for _, trigger in ipairs({ orphan, old, live }) do
                local _, gate_err = db:execute("INSERT INTO workflow_admission_gate(trigger_id) VALUES ($1)",
                    { trigger })
                test.is_nil(gate_err, tostring(gate_err))
            end
            for _, spec in ipairs({
                { trigger = old, kind = "binding", binding_id = old, binding_revision = 1,
                    status = "completed", finished = "2000-01-01T00:00:00Z" },
                { trigger = live, kind = "manual", status = "running", finished = "2000-01-01T00:00:00Z" },
            }) do
                local _, run_err = db:execute([[INSERT INTO workflow_runs
                    (run_id,workflow_id,version,trigger_kind,trigger_id,binding_id,binding_revision,
                     status,started_at,finished_at)
                    VALUES ($1,$2,1,$3,$4,$5,$6,$7,$8,$8)]],
                    { uuid.v4(), flow, spec.kind, spec.trigger, spec.binding_id, spec.binding_revision,
                      spec.status, spec.finished })
                test.is_nil(run_err, tostring(run_err))
            end
            db:release()
            local removed, prune_err = maintenance.prune_terminal(10)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(removed, 1)
            local next_page, next_err = maintenance.prune_terminal(10)
            test.is_nil(next_err, tostring(next_err))
            test.eq(next_page, 0)
            db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local rows, query_err = db:query("SELECT trigger_id FROM workflow_admission_gate WHERE trigger_id IN ($1,$2,$3)",
                { orphan, old, live })
            local old_runs, old_run_err = db:query("SELECT run_id FROM workflow_runs WHERE trigger_id=$1", { old })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.is_nil(old_run_err, tostring(old_run_err))
            test.eq(#old_runs, 0, "a removed binding cannot retain terminal run history")
            test.eq(#rows, 1)
            test.eq(rows[1].trigger_id, live)
        end)

        test.it("reclaims a gate held only by superseded history", function()
            local trigger, flow = uuid.v4(), uuid.v4()
            local db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local _, gate_err = db:execute("INSERT INTO workflow_admission_gate(trigger_id) VALUES ($1)", { trigger })
            test.is_nil(gate_err, tostring(gate_err))
            local _, run_err = db:execute([[INSERT INTO workflow_runs
                (run_id,workflow_id,version,trigger_kind,trigger_id,status,started_at,finished_at,superseded_by)
                VALUES ($1,$2,1,'manual',$3,'failed','2999-01-01T00:00:00Z',
                    '2999-01-01T00:00:00Z','replacement')]], { uuid.v4(), flow, trigger })
            test.is_nil(run_err, tostring(run_err))
            db:release()
            local removed, prune_err = maintenance.prune_terminal(10)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(removed, 0)
            db, open_err = store.open_db()
            test.is_nil(open_err, tostring(open_err))
            local gates, read_err = db:query("SELECT trigger_id FROM workflow_admission_gate WHERE trigger_id=$1", { trigger })
            local runs, run_read_err = db:query("SELECT run_id FROM workflow_runs WHERE trigger_id=$1", { trigger })
            local dbtype, type_err = db:type()
            test.is_nil(type_err, tostring(type_err))
            local plan_tx, begin_err = db:begin()
            test.is_nil(begin_err, tostring(begin_err))
            if tostring(dbtype) == "postgres" then
                local _, config_err = plan_tx:execute("SET LOCAL enable_seqscan=off")
                test.is_nil(config_err, tostring(config_err))
            end
            local explain = tostring(dbtype) == "postgres" and "EXPLAIN " or "EXPLAIN QUERY PLAN "
            local plan, plan_err = plan_tx:query(explain .. [[SELECT 1 FROM workflow_runs
                WHERE trigger_id=$1 AND superseded_by IS NULL LIMIT 1]], { trigger })
            plan_tx:rollback()
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(run_read_err, tostring(run_read_err))
            test.is_nil(plan_err, tostring(plan_err))
            local plan_text = ""
            for _, row in ipairs(plan) do
                for _, value in pairs(row) do plan_text = plan_text .. " " .. tostring(value) end
            end
            test.is_true(plan_text:find("idx_workflow_admission_count", 1, true) ~= nil, plan_text)
            test.eq(#gates, 0, "superseded history cannot retain its admission lock")
            test.eq(#runs, 1, "history itself remains until its retention window")
        end)
    end)
end

return test.run_cases(define_tests)
