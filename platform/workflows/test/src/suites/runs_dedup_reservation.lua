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
local admission = require("admission")
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
local suite_scope = sc.suite_scope
local function define_tests()


    test.describe("Workflow run dedup", function()
        test.it("resolves a same-key reservation to one admitted insertion path", function()
            local id = wid()
            local run_id, dataflow_id = uuid_v4(), uuid_v4()
            local creation_json = select(1, json.encode({ version = 1, input = {}, commands = {},
                options = { dataflow_id = dataflow_id, metadata = { run_id = run_id } },
                start_options = {} }))
            local args = { run_id = run_id, dataflow_id = dataflow_id,
                creation_payload_json = creation_json,
                workflow_id = id, version = 1, trigger_kind = "watch",
                trigger_id = "trigger", dedup_key = "event", origin = "published",
                execution_identity_json = "fixture-identity" }
            local first, first_err = admission.reserve(args)
            local second, second_err = admission.reserve(args)
            test.is_nil(first_err)
            test.is_nil(second_err)
            test.eq((second :: Map).existing, true)
            test.eq(((first :: Map).row :: Map).run_id, ((second :: Map).row :: Map).run_id)
            test.eq(type(((second :: Map).row :: Map).completion_check_at), "string")
            local db = select(1, store.open_db())
            ;(db :: any):execute("DELETE FROM workflow_runs WHERE run_id = $1", { ((first :: Map).row :: Map).run_id })
            ;(db :: any):release()
        end)




    end)





end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_run_dedup_1_actor_run", options or {})
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
