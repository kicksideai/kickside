-- Run-plane fixtures against the migrated schema. The dataflow client and status reader
-- are seams so the read model, dedup, and idempotent completion logic are
-- exercised without a live engine. Launch loads a published version, remints, records the
-- run row, and (stub) creates+starts the dataflow.

local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local security = require("security")
local funcs = require("funcs")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local runs = require("runs").new()
local exec_api = require("exec_api")
local types = require("types")
local store = require("store")
local repo = require("workflow_repo")
local maintenance = require("maintenance")
local blocks = require("block_catalog")
local dedup_scaffold = require("dedup_scaffold")

type Map = { [string]: any }

local sc = dedup_scaffold.new({
    test = test,
    uuid = uuid,
    json = json,
    security = security,
    funcs = funcs,
    workflow = workflow,
    version_publish = version_publish,
    version_read = version_read,
    runs = runs,
    exec_api = exec_api,
    types = types,
    store = store,
    maintenance = maintenance,
    blocks = blocks,
})
local wid = sc.wid
local publishable = sc.publishable
local count_runs = sc.count_runs
local suite_scope = sc.suite_scope
local function define_tests()


    test.describe("Workflow run dedup", function()


        test.it("rejects incomplete or malformed public dedup envelopes", function()
            local id = wid()
            publishable(id)

            for _, request in ipairs({
                { version = 1, dedup_key = "event-1" },
                { version = 1, trigger_id = 42, dedup_key = "event-1" },
                { version = 1, trigger_id = "manual:client-1", dedup_key = "bad key" },
                { version = 1, trigger_id = "manual:client-1", dedup_key = string.rep("a", 129) },
            }) do
                local result, err = exec_api.run_request(id, request)
                test.is_nil(result)
                test.eq(type(err), "table")
                test.eq((err :: Map).code, "run_dedup_invalid")
            end
            test.eq(count_runs(id), 0)
        end)

        test.it("validates dedup fields at the shared launch boundary", function()
            local id = wid()
            publishable(id)
            for _, opts in ipairs({
                { version = 1, dedup_key = "event-1" },
                { version = 1, trigger_id = 42, dedup_key = "event-1" },
                { version = 1, trigger_id = "bad key", dedup_key = "event-1" },
                { version = 1, trigger_id = "trigger-1", dedup_key = string.rep("a", 129) },
            }) do
                local result, err = runs.launch(id, opts)
                test.is_nil(result)
                test.eq(type(err), "table")
                test.eq((err :: Map).code, "run_dedup_invalid")
            end
            test.eq(count_runs(id), 0)
        end)

        test.it("maps structured run errors to HTTP statuses", function()
            test.eq(exec_api.error_status(runs.launch_error("not_published", "missing version")), 409)
            test.eq(exec_api.error_status(runs.launch_error("compile_failed", "invalid graph")), 422)
            test.eq(exec_api.error_status(runs.launch_error("run_not_found", "missing run")), 404)
            test.eq(exec_api.error_status(runs.launch_error("access_denied", "denied")), 403)
        end)
    end)





end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_run_dedup_3_actor_run", options or {})
    if err then error("runs suite: " .. tostring(err)) end
    return result
end

local function actor_run(options)
    return run_cases(options)
end

local function seam(args: any): any
    local a = type(args) == "table" and (args :: Map) or {}
    if a.op == "create" then
        local r, err = repo.create(a.title)
        return { id = r and (r :: Map).id or nil, error = err }
    elseif a.op == "simulate" then
        local access_err = repo.require_access(tostring(a.id or ""), repo.ACCESS.WRITE :: number)
        if access_err then return { success = false, error = "access denied" } end
        local res, err = runs.simulate(tostring(a.id or ""), a.opts or {})
        if err then return { success = false, error = tostring(err) } end
        if type(res) ~= "table" or (res :: Map).ok ~= true then
            return { success = false, error = tostring((res :: Map).error or "simulate failed") }
        end
        return { success = true, run_id = (res :: Map).run_id }
    end
    return { success = false, error = "unknown op" }
end

return { run = run, actor_run = actor_run, seam = seam }
