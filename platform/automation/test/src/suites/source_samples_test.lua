local test = require("test")
local harness = require("engine_harness")

type Map = { [string]: any }

local function fixture(surface: string, result: any, failure: any): (any, Map)
    local seen: Map = {}
    local binding = { id = "fixture:source", kind = "contract.binding", meta = { class = { "fixture" } },
        data = { contracts = { { contract = "kickside.data:pullable", methods = { pull = "fixture:pull" } } } } }
    local port = { id = "fixture:port", meta = { type = "kickside.automation.port" }, data = {
        binding = binding.id, event = surface == "events" and "fixture:received" or nil } }
    local registry = {
        find = function(q: any): (any, any)
            return q[".kind"] == "contract.binding" and { binding } or { port }, nil
        end,
        get = function(id: string): (any, any)
            return id == binding.id and binding or { data = { schema = { type = "object" } } }, nil
        end,
    }
    local funcs = { new = function(): any return { call = function(_self: any, target: string, input: any): (any, any)
        seen.target, seen.input = target, input
        return result, failure
    end } end }
    return harness.new({ registry = registry, funcs = funcs }), seen
end

return { run = test.run_cases(function()
    test.describe("real source samples", function()
        for _, surface in ipairs({ "events", "collection" }) do
            test.it("reads a bounded " .. surface .. " page without advancing a drive", function()
                local payload = { title = "Source record", nested = { active = true } }
                local engine, seen = fixture(surface, { success = true, items = {
                    { op = "upsert", payload = payload }, { op = "delete", payload = {} } } }, nil)
                local result, err = engine.source_samples("fixture:port", { thread_id = "selected", scope = "shared" }, 2)
                test.is_nil(err, tostring(err))
                test.eq(#result.samples, 1)
                test.eq(result.samples[1], payload)
                test.eq(seen.target, "kickside.automation:round_acquire")
                test.eq(seen.input.limit, 2)
                test.eq(type(seen.input.idempotency_key), "string")
                test.eq(seen.input.source_kind, surface == "events" and "event" or "collection")
                test.is_nil(seen.input.automation_id)
                test.is_nil(seen.input.cursor)
                if surface == "events" then
                    test.eq(seen.input.source_thread_id, "selected")
                    test.eq(seen.input.event_type, "fixture:received")
                else
                    test.eq(seen.input.config.scope, "shared")
                end
            end)
        end
        test.it("returns no invented sample for an empty source", function()
            local engine = fixture("collection", { success = true, items = {} }, nil)
            local result, err = engine.source_samples("fixture:port", {}, 1)
            test.is_nil(err, tostring(err))
            test.eq(#result.samples, 0)
        end)
        test.it("propagates acquisition permission failures", function()
            local engine = fixture("collection", { success = false, error = {
                kind = errors.PERMISSION_DENIED, message = "read denied", retriable = false } }, nil)
            local result, err = engine.source_samples("fixture:port", {}, 1)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        test.it("rejects unbounded and fractional requests before acquiring", function()
            for _, limit in ipairs({ 0, -1, 1.5, 101 }) do
                local engine, seen = fixture("collection", nil, nil)
                local result, err = engine.source_samples("fixture:port", {}, limit)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_nil(seen.target)
            end
        end)
    end)
end) }
