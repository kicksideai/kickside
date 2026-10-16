local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local fixture = require("fixture")
local invoke = require("invoke")
local claim = require("claim")
local contract = require("contract")
local security = require("security")

local function define_tests()
    test.describe("projection returned append authorization", function()
        for _, case in ipairs({
            { name = "owner domain output", allowed = true, event = "kickside.test.threads:changed" },
            { name = "producer stranger target", allowed = true, stranger = true, event = "kickside.test.threads:changed" },
            { name = "producer revoked target WRITE", allowed = true, stranger = true, revoked = true, event = "kickside.test.threads:changed" },
            { name = "producer system-only output", allowed = true, event = "kickside.test.threads:attested" },
            { name = "stranger without producer capability", no_cap = true, stranger = true, event = "kickside.test.threads:changed" },
            { name = "revoked WRITE without producer capability", no_cap = true, stranger = true, revoked = true, event = "kickside.test.threads:changed" },
            { name = "system-only without producer capability", no_cap = true, event = "kickside.test.threads:attested" },
            { name = "registered undeclared output", event = "app:threads_cross_output" },
            { name = "disabled deferred principal", subject_status = "disabled", event = "kickside.test.threads:changed" },
            { name = "deleted deferred principal", subject_status = "deleted", event = "kickside.test.threads:changed" },
            { name = "invalid persisted identity", invalid_identity = true, invalid = true, event = "kickside.test.threads:changed" },
            { name = "non-string returned JSON", bad_json = true, invalid = true, event = "kickside.test.threads:changed" },
            { name = "named returned write", named_write = true, invalid = true, event = "kickside.test.threads:changed" },
            { name = "named returned event", named_event = true, invalid = true, event = "kickside.test.threads:changed" },
        }) do
            test.it(case.name .. " uses the persisted identity before fold or cursor commit", function()
                local f = fixture.new()
                if case.subject_status or case.no_cap then
                    f.owner = "transition-" .. f.owner
                    f.as_owner = function(method, args) return f.run_as(f.owner, method, args) end
                end
                local source, target = uuid.v4(), uuid.v4()
                local _, source_err = f.as_owner("create", { id = source, impl_id = "kickside.test.threads:thread_kind" })
                test.is_nil(source_err)
                local _, target_err = f.run_as(case.stranger and f.stranger or f.owner, "create", {
                    id = target, impl_id = "kickside.test.threads:thread_kind" })
                test.is_nil(target_err)
                local function target_access(method)
                    local actor = security.new_actor(f.stranger, { security_groups = {} })
                    local definition = contract.get("kickside.component:component_service")
                    local service = definition:with_actor(actor):with_scope(f.test_scope()):open()
                    local result, err = service[method](service, { root_component_id = target,
                        subject = { subject_type = "user", subject_id = f.owner }, access_mask = 2 })
                    test.is_nil(err)
                    test.is_true(result.success, tostring(result.error))
                end
                if case.revoked then target_access("grant_subtree") end
                local registered, register_err = f.as_owner("register_projection", { thread_id = source,
                    kind = "returned-authorization", worker_ref = "func://app:test_count_worker",
                    worker_input_mode = "prefetch_events", events = { input = { { type = "kickside.test.threads:trigger" } } },
                    worker_config = { bad_append_json = case.bad_json, named_append_write = case.named_write, named_append_event = case.named_event,
                        append_test_event = { thread_id = target, when_to_seq = 1, event_type = case.event } },
                })
                test.is_nil(register_err)
                local appended, append_err = f.as_owner("append_event", { thread_id = source,
                    event = { type = "kickside.test.threads:trigger", body = {} } })
                test.is_nil(append_err)
                test.eq(appended.inserted, 1)
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                if not db then error("projection test database is unavailable") end
                local rows, read_err = db:query("SELECT id,job_id FROM kickside_projection_cursor WHERE thread_id=$1", { source })
                test.is_nil(read_err)
                test.eq(#rows, 1)
                local jobs, claim_err = claim.claim_batch(db, tostring(db:type()), 16, nil, nil)
                test.is_nil(claim_err)
                local selected = nil
                for _, job in ipairs(jobs) do if job.id == rows[1].job_id then selected = job end end
                test.not_nil(selected)
                if case.subject_status then
                    local _, state_err = db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,$3,$4)",
                        { uuid.v4(), source, "core_test.principal_state", case.subject_status })
                    test.is_nil(state_err)
                elseif case.no_cap then
                    local _, scope_err = db:execute("INSERT INTO kickside_component_meta (meta_id,component_id,key,value) VALUES ($1,$2,$3,$4)",
                        { uuid.v4(), source, "core_test.scope_name", "app:threads_test_user_append_scope" })
                    test.is_nil(scope_err)
                elseif case.invalid_identity then
                    local _, identity_err = db:execute("UPDATE kickside_projection_cursor SET execution_identity_json=$1 WHERE id=$2",
                        { "{", rows[1].id })
                    test.is_nil(identity_err)
                end
                db:release()
                if case.revoked then target_access("revoke_subtree") end
                local result, err = invoke.run({ job = selected, payload = { cursor_id = rows[1].id } })
                if case.allowed then
                    test.is_nil(err, tostring(err))
                    test.eq(result.last_seq, 1)
                    test.eq(f.event_type_count(target, case.event), 1)
                else
                    test.is_nil(result)
                    test.not_nil(err)
                    if case.subject_status then
                        test.is_true(errors.is(err, case.subject_status == "deleted" and errors.NOT_FOUND or errors.PERMISSION_DENIED), tostring(err))
                        test.is_true(string.find(tostring(err), "deferred principal is " .. case.subject_status, 1, true) ~= nil)
                    end
                    test.is_true((case.invalid and errors.is(err, errors.INVALID)) or (not case.invalid
                        and (errors.is(err, errors.PERMISSION_DENIED) or errors.is(err, errors.NOT_FOUND))), tostring(err))
                    test.eq(f.event_type_count(target, case.event), 0)
                    local check, check_err = sql.get("app:db")
                    test.is_nil(check_err)
                    if not check then error("projection test database is unavailable") end
                    local cursors, cursor_err = check:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", { rows[1].id })
                    test.is_nil(cursor_err)
                    test.eq(tonumber(cursors[1].last_seq), 0)
                    check:release()
                    local body = f.projection_body_of(source, "returned-authorization")
                    test.is_nil(body.stats)
                end
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
