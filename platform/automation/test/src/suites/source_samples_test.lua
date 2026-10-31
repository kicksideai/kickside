local test = require("test")
local harness = require("engine_harness")

type Map = { [string]: any }

local function fixture(surface: string, result: any, failure: any, options: Map?): (any, Map)
    local seen: Map = {}
    options = options or {}
    local binding = { id = "fixture:source", kind = "contract.binding", meta = { class = { "fixture" } },
        data = { contracts = { { contract = "kickside.data:pullable", methods = { pull = "fixture:pull" } } } } }
    local port = { id = "fixture:port", meta = { type = "kickside.automation.port" }, data = {
        binding = binding.id, event = surface == "events" and "fixture:received" or nil,
        config_schema = {thread_id = {picker = "wc-component-picker"}} } }
    local registry = {
        find = function(q: any): (any, any)
            return q[".kind"] == "contract.binding" and { binding } or { port }, nil
        end,
        get = function(id: string): (any, any)
            if id ~= binding.id and options.registry_error then return nil, options.registry_error end
            return id == binding.id and binding or {meta = {output_kind = options.shared and binding.id or nil},
                data = { schema = { type = "object" } } }, nil
        end,
    }
    local funcs = { new = function(): any return { call = function(_self: any, target: string, input: any): (any, any)
        seen.target, seen.input = target, input
        return result, failure
    end } end }
    return harness.new({ registry = registry, funcs = funcs, component = { ACCESS = { READ = 1 }, query = function(args)
        return { { component_id = args.component_ids[1], impl_id = options.impl_id or binding.id,
            meta = {thread_class = options.thread_class or "fixture"} } }, nil
    end } }), seen
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
        test.it("reads a shared output kind from a different component implementation", function()
            local engine = fixture("events", {success = true, items = {}}, nil,
                {shared = true, impl_id = "fixture:engine"})
            local descriptor, resolve_err = engine.resolve_source("fixture:port")
            test.is_nil(resolve_err)
            test.is_nil(descriptor.config_schema.thread_id.impl_id)
            test.eq(descriptor.config_schema.thread_id.class, "fixture")
            local result, err = engine.source_samples("fixture:port", {thread_id = "selected"}, 2)
            test.is_nil(err, tostring(err))
            test.eq(#result.samples, 0)
        end)
        test.it("preserves binding-owned sources without thread-class metadata", function()
            local engine = fixture("events", {success = true, items = {}}, nil,
                {shared = true, thread_class = ""})
            local result, err = engine.source_samples("fixture:port", {thread_id = "selected"}, 2)
            test.is_nil(err, tostring(err))
            test.eq(#result.samples, 0)
        end)
        test.it("rejects another thread class for a shared output kind", function()
            local engine = fixture("events", {success = true, items = {}}, nil,
                {shared = true, impl_id = "fixture:engine", thread_class = "other"})
            local result, err = engine.source_samples("fixture:port", {thread_id = "selected"}, 2)
            test.is_nil(result)
            test.eq(err:details().code, "source_kind_mismatch")
        end)
        test.it("keeps ordinary event ports restricted to their declared implementation", function()
            local engine = fixture("events", {success = true, items = {}}, nil, {impl_id = "fixture:other"})
            local result, err = engine.source_samples("fixture:port", {thread_id = "selected"}, 2)
            test.is_nil(result)
            test.eq(err:details().code, "source_kind_mismatch")
        end)
        test.it("preserves event declaration lookup failures", function()
            local failure = errors.new({kind = errors.PERMISSION_DENIED, message = "event declaration denied"})
            local engine = fixture("events", {success = true, items = {}}, nil, {registry_error = failure})
            local descriptor, err = engine.resolve_source("fixture:port")
            test.is_nil(descriptor)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
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
