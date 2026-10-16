-- A job carries no execution identity; its worker_ref target runs under the
-- jobs worker frame unless it binds the owner's identity. Resources created
-- from that unattributed frame must be refused, never owned by the jobs
-- service actor.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local security = require("security")
local job_fixture = require("job_fixture")

local JOBS_ACTOR = "system:kickside.jobs"
local JOBS_SCOPE = "wippy.security:process"

local function with_db(fn)
    local db, err = sql.get("app:db")
    if err or not db then error("db connect failed: " .. tostring(err)) end
    local result = fn(db)
    db:release()
    return result
end

local function owned_by(db, subject_id: string, thread_class: string): integer
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_component_access a"
        .. " JOIN kickside_thread t ON t.component_id = CAST(a.component_id AS TEXT)"
        .. " WHERE a.subject_id = $1 AND t.thread_class = $2", { subject_id, thread_class })
    if err then error(tostring(err)) end
    return math.floor(tonumber(rows[1].n) or 0)
end

local function dispatch_in_jobs_frame(job: table): table
    local actor = security.new_actor(JOBS_ACTOR, {})
    local scope, scope_err = security.named_scope(JOBS_SCOPE)
    if scope_err or not scope then error("jobs scope: " .. tostring(scope_err)) end
    local result, call_err = funcs.new():with_actor(actor):with_scope(scope)
        :call("app:jobs_frame_dispatch_probe", job)
    if call_err then error("dispatch probe: " .. tostring(call_err)) end
    return result
end

local function define_tests()
    test.describe("unattributed job resource ownership", function()
        test.it("refuses a resource created by an unattributed job target", function()
            local thread_class = "unattributed_" .. uuid.v7()
            local job = with_db(function(db)
                local dbtype = tostring(db:type())
                local leased, lease_err = job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.unattributed.create",
                    worker_ref = "func://app:unattributed_thread_target",
                    payload = { thread_class = thread_class },
                    job_identity = { namespace = "test", scope = "unattributed-resource", key = thread_class },
                })
                if lease_err or not leased then error("lease: " .. tostring(lease_err)) end
                return leased
            end)

            if not job then error("leased job missing") end
            local result = dispatch_in_jobs_frame(job)
            test.eq(result.ok, false, "unattributed creation must be refused")
            test.eq(result.kind, errors.PERMISSION_DENIED, tostring(result.message))
            with_db(function(db)
                test.eq(owned_by(db, JOBS_ACTOR, thread_class), 0)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
