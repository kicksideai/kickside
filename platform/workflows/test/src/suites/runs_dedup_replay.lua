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
local client = require("client")
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
local stub_client = sc.stub_client
local count_runs = sc.count_runs
local suite_scope = sc.suite_scope
local function define_tests()


    test.describe("Workflow run dedup", function()
        test.it("dedups a repeated envelope by (trigger_id, dedup_key) to one run", function()
            local id = wid()
            publishable(id)
            local sink: Map = { created = 0, started = 0 }
            runs._client_new = function() return stub_client(sink) end
            runs._update_public_meta = function(_c, _p) end

            local first, ferr = runs.launch(id, { version = 1, trigger_kind = "watch", trigger_id = "trg-1", dedup_key = "evt-1", input = {} })
            test.is_nil(ferr, tostring(ferr))
            test.not_nil(first)
            local second, serr = runs.launch(id, { version = 1, trigger_kind = "watch", trigger_id = "trg-1", dedup_key = "evt-1", input = {} })
            test.is_nil(serr, tostring(serr))
            test.not_nil(second)
            test.eq((second :: Map).deduped, true)
            test.eq((first :: Map).run_id, (second :: Map).run_id)
            test.eq(count_runs(id), 1)
            test.eq(sink.created, 1)
        end)

        test.it("dedups repeated public run envelopes to the existing run", function()
            local id = wid()
            publishable(id)
            local sink: Map = { created = 0, started = 0 }
            runs._client_new = function()
                local live, client_err = client.new()
                if client_err then return nil, client_err end
                -- The live client with create/start counted: every other
                -- method the launch path calls reaches the real engine.
                return {
                    create_workflow = function(_self: any, commands: any, options: any)
                        sink.created = sink.created + 1
                        return live:create_workflow(commands, options)
                    end,
                    start = function(_self: any, dataflow_id: any, options: any)
                        sink.started = sink.started + 1
                        return live:start(dataflow_id, options)
                    end,
                    execute = function(_self: any, dataflow_id: any, options: any) return live:execute(dataflow_id, options) end,
                    get_status = function(_self: any, dataflow_id: any) return live:get_status(dataflow_id) end,
                    output = function(_self: any, dataflow_id: any) return live:output(dataflow_id) end,
                }, nil
            end
            runs._update_public_meta = function(_c, _p) end
            local api = exec_api.new({ runs_launch = runs })
            local request = {
                version = 1,
                input = { source = "public-api" },
                trigger_id = "manual:client-1",
                dedup_key = "event/2026-07-09_001",
            }

            local first, ferr = api.run_request(id, request)
            test.is_nil(ferr, tostring(ferr))
            test.eq(first.success, true)
            test.eq(first.deduped, false)

            local second, serr = api.run_request(id, request)
            test.is_nil(serr, tostring(serr))
            test.eq(second.success, true)
            test.eq(second.deduped, true)
            test.eq(second.run_id, first.run_id)
            test.eq(second.dataflow_id, first.dataflow_id)
            test.eq(count_runs(id), 1)
            test.eq(sink.created, 1)
            local persisted = select(1, require("dataflow_repo").get(first.dataflow_id))
            test.not_nil(persisted)
        end)



    end)





end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_run_dedup_2_actor_run", options or {})
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
