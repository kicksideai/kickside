local test = require("test")
local registry = require("registry")
local harness = require("automation_test_engine")
local uuid = require("uuid")
local drive = require("drive")
local cf = require("control_fixture")

type Map = { [string]: any }

local NAMES = { "status", "health", "pause", "resume", "reconfigure", "resync", "replay", "run_now", "set_execution_identity" }

local function entry(actions: { string }, reconfigurable: boolean?): Map
    local methods: Map = {}
    local declarations: { Map } = {}
    for _, name in ipairs(actions) do
        methods[name] = "test:kind_" .. name
        declarations[#declarations + 1] = { name = name }
    end
    return {
        id = "test:kind",
        kind = "contract.binding",
        meta = { type = "kickside.automation", actions = declarations, reconfigurable = reconfigurable == true },
        data = { contracts = { { contract = "test:kind_iface", methods = methods } } },
    }
end

local function define_tests(): ()
    test.describe("reserved generic automation actions", function()
        test.it("removes the unused sink dispatch facade", function()
            test.is_nil(harness.new({}).dispatch_to_sink)
        end)

        test.it("removes the unproduced trigger dropped event", function()
            local entries, err = registry.find({ [".namespace"] = "kickside.automation.events", [".name"] = "trigger.dropped" })
            test.is_nil(err, tostring(err))
            test.eq(#entries, 0)
        end)

        test.it("requires caller request ids for replay and resync", function()
            local engine = harness.new({})
            local replay, replay_err = engine.generic_action("auto-1", "replay", {})
            local resync, resync_err = engine.generic_action("auto-1", "resync", {})
            test.is_nil(replay)
            test.is_nil(resync)
            test.not_nil(replay_err)
            test.not_nil(resync_err)
        end)

        test.it("accepts UI-shaped resync and replay action bodies and replays their recorded results", function()
            local id = uuid.v7()
            cf.seed_drive(id, "main")
            local spy: cf.ComponentSpy = { sets = {}, access = {} }
            local component = cf.component_stub(spy, { [id] = 15 }, { query = function(): (any, any)
                return { { component_id = id, impl_id = "test:kind" } }, nil
            end })
            local engine = cf.engine_with("owner-1", component, {
                registry = { find = function(): (any, any) return { entry({ "resync", "replay" }) }, nil end },
            })
            for _, method in ipairs({ "resync", "replay" }) do
                -- The manager POSTs only request_id for these generic actions.
                local body = { request_id = uuid.v7() }
                local first, err = engine.call_action(id, method, body)
                test.is_nil(err, tostring(err))
                test.eq(first.method, method)
                test.eq(first.result.state, "succeeded")
                test.eq(first.result.request_id, body.request_id)
                test.eq((cf.op(id, body.request_id) :: Map).state, "succeeded")
                local again, retry_err = engine.call_action(id, method, body)
                test.is_nil(retry_err, tostring(retry_err))
                test.eq(again.result.request_id, body.request_id)
                test.eq(again.result.generation, first.result.generation)
            end
            local db = cf.open_db()
            local main, read_err = drive.get(db, id, "main")
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq((main :: Map).rewind_generation, 1)
            test.eq(#spy.access, 4)
        end)

        test.it("preserves selected drive and arguments for catalog controls", function()
            local engine = harness.new({})
            local received: Map? = nil
            engine.control = function(_id: string, args: Map): (Map, any)
                received = args
                return { state = "succeeded" }, nil
            end
            for _, method in ipairs({ "run_now", "replay", "resync", "discard" }) do
                local result, err = engine.generic_action("auto-1", method, {
                    drive_key = "secondary", request_id = "control-1", keys = { "item-1" }, from = 42,
                })
                test.is_nil(err, tostring(err))
                test.eq(result.state, "succeeded")
                test.eq((received :: Map).control, method)
                test.eq((received :: Map).drive_key, "secondary")
                test.eq((received :: Map).request_id, "control-1")
                test.eq((received :: Map).keys[1], "item-1")
                test.eq((received :: Map).from, 42)
            end
        end)

        test.it("pauses every drive through one fenced command", function()
            local requests: { Map } = {}
            local updates: { string } = {}
            local receipts: { Map } = {}
            local engine = harness.new({
                automation_db = { in_tx = function(work: (any) -> (any, any)): (any, any)
                    return work({})
                end },
                canonical_json = { hash = function(): (string, any) return "digest", nil end },
                uuid = { v7 = function(): string return "request-1" end },
                security = cf.actor_frame("operator"),
                component = {
                    ACCESS = { WRITE = 2 },
                    validate_access = function(): (any, any) return nil, nil end,
                },
                drive = {
                    PHASE = { PAUSED = "paused", BLOCKED_SOURCE_DELETED = "source_deleted" },
                    keys = function(): ({ string }, any) return { "main", "timer" }, nil end,
                    update_cas_tx = function(_tx: any, _id: string, key: string, _fence: any, _fields: Map): (boolean, any)
                        updates[#updates + 1] = key
                        return true, nil
                    end,
                },
                command = { record_receipt_tx = function(_tx: any, id: string, request_id: string,
                    generation: integer, digest: string, step: string, receipt: Map): any
                    receipts[#receipts + 1] = {id = id, request_id = request_id, generation = generation,
                        digest = digest, step = step, receipt = receipt}
                    return nil
                end, run_tx = function(tx: any, request: Map, apply: (any, any) -> (any, any)): (any, any)
                    requests[#requests + 1] = request
                    local drives = {
                        main = { automation_id = "auto-1", drive_key = "main", phase = "active", enabled = true, command_generation = 1 },
                        timer = { automation_id = "auto-1", drive_key = "timer", phase = "active", enabled = true, command_generation = 1 },
                    }
                    local outcome, err = apply(tx, drives)
                    if err then return nil, err end
                    return { request_id = request.request_id, generation = 1, state = "succeeded", outcome = outcome }, nil
                end },
            })

            local result, err = engine.generic_action("auto-1", "pause", { request_id = "pause-1" })
            test.is_nil(err, tostring(err))
            test.eq(#requests, 1)
            test.eq(requests[1].request_id, "pause-1")
            test.eq(#requests[1].drive_keys, 2)
            test.eq(requests[1].drive_keys[1], "main")
            test.eq(requests[1].drive_keys[2], "timer")
            test.eq(#updates, 2)
            test.eq(#receipts, 1)
            test.eq(receipts[1].id, "auto-1")
            test.eq(receipts[1].request_id, "pause-1")
            test.eq(receipts[1].generation, 1)
            test.eq(receipts[1].digest, "digest")
            test.eq(receipts[1].step, "initiation")
            test.eq(receipts[1].receipt.actor_id, "operator")
            test.eq(result.state, "succeeded")
        end)

        test.it("routes all nine generic names to the engine with their frozen access levels", function()
            local binding = entry(NAMES)
            local accesses: { integer } = {}
            local opened = false
            local engine = harness.new({
                registry = { find = function() return { binding }, nil end },
                component = {
                    ACCESS = { READ = 1, WRITE = 2, ADMIN = 4 },
                    query = function(query: Map): (any, any)
                        accesses[#accesses + 1] = query.access_mask
                        return { { component_id = "auto-1", impl_id = "test:kind" } }, nil
                    end,
                    open = function() opened = true; return nil, "kind action must not win" end,
                },
            })
            local routed: { string } = {}
            engine.generic_action = function(_id: string, method: string, _args: any): (any, any)
                routed[#routed + 1] = method
                return { handled_by = "generic", method = method }, nil
            end

            for _, name in ipairs(NAMES) do
                local result, err = engine.call_action("auto-1", name, {})
                test.is_nil(err, tostring(err))
                test.eq(result.method, name)
                test.eq(result.result.handled_by, "generic")
            end

            test.eq(#routed, #NAMES)
            test.is_false(opened, "reserved names never open the kind action")
            for i, name in ipairs(NAMES) do
                test.eq(routed[i], name)
                local expected = (name == "status" or name == "health") and 1
                    or (name == "set_execution_identity" and 4 or 2)
                test.eq(accesses[i], expected, name .. " access")
            end
            test.eq(#engine.collect_actions(binding), 0, "reserved names are absent from the kind action surface")
        end)

        test.it("uses the kind reconfigure action only inside the generic route without nesting results", function()
            local binding = entry({ "reconfigure" }, true)
            local opens = 0
            local received: any = nil
            local engine = harness.new({
                registry = { find = function() return { binding }, nil end },
                component = {
                    ACCESS = { READ = 1, WRITE = 2, ADMIN = 4 },
                    query = function(): (any, any)
                        return { { component_id = "auto-1", impl_id = "test:kind", meta = { reconfigurable = true } } }, nil
                    end,
                    open = function(_id: string, _access: integer, contract: string): (any, any)
                        opens = opens + 1
                        test.eq(contract, "test:kind_iface")
                        return { reconfigure = function(_self: any, declaration: any): (any, any)
                            received = declaration
                            return { success = true }, nil
                        end }, nil
                    end,
                },
            })

            local via_action, action_err = engine.call_action("auto-1", "reconfigure", { declaration = { title = "one" } })
            test.is_nil(action_err, tostring(action_err))
            test.is_true(via_action.result.success)
            test.eq(received.title, "one")
            test.eq(opens, 1)

            local via_http, http_err = engine.reconfigure("auto-1", { title = "two" })
            test.is_nil(http_err, tostring(http_err))
            test.is_true(via_http.result.success)
            test.eq(received.title, "two")
            test.eq(opens, 2)
        end)
    end)
end

return test.run_cases(define_tests)
