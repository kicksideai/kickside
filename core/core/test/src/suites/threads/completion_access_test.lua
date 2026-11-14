-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local fixture = require("fixture")
local retention = require("retention_repo")

local function define_tests()
    test.describe("Thread completion authorization", function()
        local f = fixture.new()
        for _, actor in ipairs({"system:knowledge.injection", "system:unlisted"}) do
            for _, path in ipairs({"missing retention", "existing retention", "pending natural key"}) do
                for _, claimed_audit in ipairs({false, true}) do
                    test.it("refuses " .. actor .. " before completing " .. path
                        .. (claimed_audit and " with a caller audit flag" or ""), function()
                        local class, ref = "completion_" .. uuid.v4(), uuid.v4()
                        local id: string
                        if path == "pending natural key" then
                            local created, err = f.as_owner("upsert", {thread_class = class, external_ref = ref,
                                impl_id = "app:provision_test_decl"})
                            test.is_nil(err)
                            id = created.thread_id :: string
                        else
                            id = f.register_bare_component(f.owner, uuid.v4(), "app:provision_test_decl", {}) :: string
                        end
                        local db = assert(sql.get("app:db"))
                        local rows = assert(db:query("SELECT id FROM kickside_thread WHERE id = $1", {id}))
                        db:release()
                        if #rows == 0 then f.insert_orphan_thread(id, class) end
                        db = assert(sql.get("app:db"))
                        local function execute(q, args)
                            local _, err = db:execute(q, args or {id})
                            test.is_nil(err)
                        end
                        execute("DELETE FROM kickside_projection WHERE thread_id = $1")
                        execute("DELETE FROM kickside_job WHERE owner_kind = 'thread' AND owner_id = $1")
                        execute("DELETE FROM kickside_retention_policy WHERE thread_id = $1")
                        execute("DELETE FROM kickside_component_meta WHERE component_id = $1 AND key IN ('type','thread_class')")
                        for key, value in pairs({type = "kickside.execution.maintenance_actor", actor_id = actor}) do
                            execute([[INSERT INTO kickside_component_meta (meta_id,component_id,key,value)
                                VALUES ($1,$2,$3,$4) ON CONFLICT (component_id,key) DO UPDATE SET value = excluded.value]],
                                {uuid.v4(),id,key,value})
                        end
                        execute([[INSERT INTO kickside_component_access
                            (access_id,component_id,source_component_id,subject_type,subject_id,access_mask,inherited,created_at)
                            VALUES ($1,$2,$3,'user',$4,1,0,'2026-01-01T00:00:00Z')]], {uuid.v4(),id,id,actor})
                        if path == "existing retention" then
                            local _, err = retention.upsert(db, id, {event_hot_retention_days = 37})
                            test.is_nil(err)
                        elseif path == "pending natural key" then
                            execute("UPDATE kickside_thread_natural_key SET ready = $1 WHERE thread_id = $2",
                                {db:type() == sql.type.POSTGRES and false or 0,id})
                        end
                        db:release()
                        local function snapshot()
                            local d = assert(sql.get("app:db"))
                            local policy, err = retention.find_by_thread(d, id)
                            test.is_nil(err)
                            local jobs = assert(d:query("SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind = 'thread' AND owner_id = $1", {id}))
                            d:release()
                            return {days = policy and policy.event_hot_retention_days,
                                projections = f.projection_count(id), jobs = tonumber(jobs[1].n),
                                marker = f.component_meta(id).type}
                        end
                        local before = snapshot()
                        local target = path == "pending natural key" and "upsert" or "ensure_thread"
                        local args = {component_id = id, impl_id = "app:provision_test_decl",
                            thread_class = class, external_ref = ref, trusted_audit = claimed_audit}
                        local denied, denied_err = f.run_as(actor, target, args)
                        local after = snapshot()
                        test.eq(after.days, before.days, "retention changed after refusal")
                        test.eq(after.projections, before.projections, "projections changed after refusal")
                        test.eq(after.jobs, before.jobs, "jobs changed after refusal")
                        test.eq(after.marker, before.marker, "public markers changed after refusal")
                        test.is_nil(denied)
                        test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED), tostring(denied_err))
                        local completed, err = f.as_owner(target, args)
                        test.is_nil(err)
                        test.not_nil(completed)
                        local ready = snapshot()
                        test.eq(ready.days, path == "existing retention" and 37 or 7)
                        test.eq(ready.projections, 1)
                        test.eq(ready.jobs, 1)
                        test.eq(ready.marker, "thread")
                    end)
                end
            end
        end
    end)
end
return {run = test.run_cases(define_tests)}
