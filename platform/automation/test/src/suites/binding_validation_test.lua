-- Port-shape validation (contract §3 rules 1-6): the entry-level checks that
-- replace the old binding-local port-array validation. validate_bindings resolves a port entry's
-- binding + event references from the input list first (self-contained fixtures),
-- so each case declares only what it exercises.

local test = require("test")
local binding_validation = require("binding_validation")

type Map = { [string]: any }

local EVENT_META = "kickside.core.threads.event"
local PORT_META = "kickside.automation.port"

local function writable_binding(id: string): Map
    return {
        id = id,
        kind = "contract.binding",
        meta = { title = "Sink" },
        data = { contracts = { { contract = "kickside.data:writable", methods = { write = id .. ":write" } } } },
    }
end

local function pullable_binding(id: string): Map
    return {
        id = id,
        kind = "contract.binding",
        meta = { title = "Source" },
        data = { contracts = { { contract = "kickside.data:pullable", methods = { pull = id .. ":pull" } } } },
    }
end

local function events_binding(id: string, output: { string }): Map
    local out: { any } = {}
    for _, t in ipairs(output) do out[#out + 1] = { type = t } end
    return {
        id = id,
        kind = "contract.binding",
        meta = { title = "Component", class = { "kickside.test" }, events = { output = out } },
        data = { contracts = {} },
    }
end

local function event_entry(id: string, with_schema: boolean): Map
    local e: Map = { id = id, kind = "registry.entry", meta = { type = EVENT_META } }
    if with_schema then e.schema = { type = "object", properties = { id = { type = "string" } } } end
    return e
end

local function port(fields: Map): Map
    local p: Map = { kind = "registry.entry", meta = { type = PORT_META, title = fields.title or "Port" } }
    p.id = fields.id or "ns:port"
    if fields.no_title then p.meta.title = nil end
    for _, k in ipairs({ "binding", "event", "operations", "input_schema", "output_schema", "config_schema", "reconcile", "input_mode" }) do
        if fields[k] ~= nil then p[k] = fields[k] end
    end
    for k, v in pairs(fields.extra or {}) do p[k] = v end
    return p
end

local function has(failures: { string }, needle: string): boolean
    for _, f in ipairs(failures) do
        if f:find(needle, 1, true) ~= nil then return true end
    end
    return false
end

local EVENTS_OUT = "kickside.test.events:item.created"

local function define_tests()
    test.describe("port validation (contract §3)", function()

        test.it("accepts well-formed events, store, and collection ports", function()
            local failures = binding_validation.validate_bindings({
                events_binding("ns:evt_binding", { EVENTS_OUT }),
                event_entry(EVENTS_OUT, true),
                writable_binding("ns:store_binding"),
                pullable_binding("ns:coll_binding"),
                port({ id = "ns:evt_port", title = "Event", binding = "ns:evt_binding", event = EVENTS_OUT }),
                port({ id = "ns:store_port", title = "Store", binding = "ns:store_binding",
                    operations = { upsert = {} }, input_schema = { type = "object" } }),
                port({ id = "ns:payload_port", title = "Payload", binding = "ns:store_binding",
                    operations = { upsert = {} }, input_mode = "source_payload", input_schema = { type = "object" } }),
                port({ id = "ns:coll_port", title = "Collection", binding = "ns:coll_binding",
                    output_schema = { type = "object" }, reconcile = { pull_keys = "ns:keys" } }),
            })
            test.eq(#failures, 0, table.concat(failures, "; "))
        end)

        -- Rule 1
        test.it("rejects a port whose binding does not exist", function()
            local failures = binding_validation.validate_bindings({
                port({ id = "ns:p", binding = "ns:missing", operations = { upsert = {} }, input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "binding not found"), table.concat(failures, "; "))
        end)

        test.it("rejects a port whose binding implements no backing", function()
            local failures = binding_validation.validate_bindings({
                { id = "ns:hollow", kind = "contract.binding", meta = { title = "Hollow" }, data = { contracts = {} } },
                port({ id = "ns:p", binding = "ns:hollow", operations = { upsert = {} }, input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "implements no backing"), table.concat(failures, "; "))
        end)

        -- Rule 2
        test.it("rejects a port declaring both event and operations markers", function()
            local failures = binding_validation.validate_bindings({
                events_binding("ns:b", { EVENTS_OUT }),
                event_entry(EVENTS_OUT, true),
                port({ id = "ns:p", binding = "ns:b", event = EVENTS_OUT, operations = { upsert = {} } }),
            })
            test.is_true(has(failures, "declares both event and operations"), table.concat(failures, "; "))
        end)

        test.it("rejects an events port whose event does not resolve", function()
            local failures = binding_validation.validate_bindings({
                events_binding("ns:b", { "ns.test.events:ghost.created" }),
                port({ id = "ns:p", binding = "ns:b", event = "ns.test.events:ghost.created" }),
            })
            test.is_true(has(failures, "event does not resolve"), table.concat(failures, "; "))
        end)

        test.it("rejects an events port whose event is not in the binding's events.output", function()
            local failures = binding_validation.validate_bindings({
                events_binding("ns:b", { "kickside.test.events:other.created" }),
                event_entry(EVENTS_OUT, true),
                port({ id = "ns:p", binding = "ns:b", event = EVENTS_OUT }),
            })
            test.is_true(has(failures, "missing from the binding's events.output"), table.concat(failures, "; "))
        end)

        test.it("rejects a store port declaring an operation outside the writable ABI", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", operations = { upsert = {}, frobnicate = {} }, input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "unknown operation frobnicate"), table.concat(failures, "; "))
        end)

        test.it("rejects an array-form operations encoding (map form only)", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", operations = { "upsert", "delete" }, input_schema = { type = "object" } }),
            })
            -- The integer keys of an array are not writable ABI operation names,
            -- so the array encoding is rejected, not silently recognized.
            test.is_true(has(failures, "unknown operation"), table.concat(failures, "; "))
        end)

        test.it("rejects list_keys without a delete operation or a function", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", operations = { upsert = {}, list_keys = {} }, input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "list_keys requires a delete operation"), table.concat(failures, "; "))
            test.is_true(has(failures, "list_keys is missing function"), table.concat(failures, "; "))
        end)

        test.it("rejects an operation declaring a per-op input_schema (§3: write shape IS the root input_schema)", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b",
                    operations = { upsert = {}, delete = { requires_dest_ref = true, input_schema = { type = "object" } } },
                    input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "operation delete declares unknown field input_schema"), table.concat(failures, "; "))
        end)

        test.it("rejects an operation declaring a per-op output_schema", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b",
                    operations = { upsert = {}, delete = {}, list_keys = { ["function"] = "ns:keys", output_schema = { type = "object" } } },
                    input_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "operation list_keys declares unknown field output_schema"), table.concat(failures, "; "))
        end)

        test.it("accepts operations declaring only ABI params (function, requires_dest_ref)", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b",
                    operations = { upsert = {}, delete = { requires_dest_ref = true }, list_keys = { ["function"] = "ns:keys" } },
                    input_schema = { type = "object" } }),
            })
            test.eq(#failures, 0, table.concat(failures, "; "))
        end)

        -- Rule 3
        test.it("rejects a store port with no input_schema", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", operations = { upsert = {} } }),
            })
            test.is_true(has(failures, "store port is missing input_schema"), table.concat(failures, "; "))
        end)

        test.it("rejects a collection port with no output_schema", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b" }),
            })
            test.is_true(has(failures, "collection port is missing output_schema"), table.concat(failures, "; "))
        end)

        test.it("rejects an events port whose event entry carries no schema", function()
            local failures = binding_validation.validate_bindings({
                events_binding("ns:b", { EVENTS_OUT }),
                event_entry(EVENTS_OUT, false),
                port({ id = "ns:p", binding = "ns:b", event = EVENTS_OUT }),
            })
            test.is_true(has(failures, "has no schema"), table.concat(failures, "; "))
        end)

        -- Rule 4
        test.it("rejects more than one picker field in config_schema", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", output_schema = { type = "object" },
                    config_schema = {
                        a = { picker = "wc-x" },
                        b = { picker = "wc-y" },
                    } }),
            })
            test.is_true(has(failures, "more than one picker field"), table.concat(failures, "; "))
        end)

        test.it("rejects role:primary when it does not name the picker field", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", output_schema = { type = "object" },
                    config_schema = { a = { role = "primary", title = "A" } } }),
            })
            test.is_true(has(failures, "role:primary field has no picker"), table.concat(failures, "; "))
        end)

        test.it("rejects multiple role:primary fields", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", output_schema = { type = "object" },
                    config_schema = {
                        a = { picker = "wc-a", role = "primary" },
                        b = { picker = "wc-b", role = "primary" },
                    } }),
            })
            test.is_true(has(failures, "more than one role:primary field"), table.concat(failures, "; "))
        end)

        -- Rule 5
        test.it("rejects a port with no meta.title", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", no_title = true, binding = "ns:b", output_schema = { type = "object" } }),
            })
            test.is_true(has(failures, "missing meta.title"), table.concat(failures, "; "))
        end)

        -- Rule 6
        test.it("rejects an unknown declaration field", function()
            local failures = binding_validation.validate_bindings({
                pullable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", output_schema = { type = "object" }, extra = { mode = "poll" } }),
            })
            test.is_true(has(failures, "unknown field mode"), table.concat(failures, "; "))
        end)

        test.it("rejects reconcile on a non-collection port and reconcile missing pull_keys", function()
            local both = binding_validation.validate_bindings({
                writable_binding("ns:sb"),
                port({ id = "ns:sp", binding = "ns:sb", operations = { upsert = {} }, input_schema = { type = "object" }, reconcile = { pull_keys = "x" } }),
                pullable_binding("ns:cb"),
                port({ id = "ns:cp", binding = "ns:cb", output_schema = { type = "object" }, reconcile = {} }),
            })
            test.is_true(has(both, "reconcile but is not a collection port"), table.concat(both, "; "))
            test.is_true(has(both, "reconcile is missing pull_keys"), table.concat(both, "; "))
        end)

        test.it("rejects unsupported or non-store input modes", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:store"),
                pullable_binding("ns:collection"),
                port({ id = "ns:unknown", binding = "ns:store", operations = { upsert = {} }, input_schema = { type = "object" }, input_mode = "content" }),
                port({ id = "ns:collection", binding = "ns:collection", output_schema = { type = "object" }, input_mode = "source_payload" }),
            })
            test.is_true(has(failures, "input_mode is unsupported"), table.concat(failures, "; "))
            test.is_true(has(failures, "input_mode is only valid for a store"), table.concat(failures, "; "))
        end)

        test.it("accepts both declared store input modes", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:store"),
                port({ id = "ns:raw", binding = "ns:store", operations = { upsert = {} }, input_schema = { type = "object" }, input_mode = "source_payload" }),
                port({ id = "ns:typed", binding = "ns:store", operations = { upsert = {} }, input_schema = { type = "object" }, input_mode = "transform_output" }),
            })
            test.is_false(has(failures, "input_mode"), table.concat(failures, "; "))
        end)

        test.it("rejects bare schema properties that declare no type or description", function()
            local failures = binding_validation.validate_bindings({
                writable_binding("ns:b"),
                port({ id = "ns:p", binding = "ns:b", operations = { upsert = {} },
                    input_schema = { type = "object", properties = { payload = {} } } }),
            })
            test.is_true(has(failures, "is bare; add a type or description"), table.concat(failures, "; "))
        end)

        -- Binding-level (kept): events.output canonical form.
        test.it("rejects a non-canonical events.output value", function()
            local failures = binding_validation.validate_bindings({
                { id = "ns:bad", kind = "contract.binding", meta = { events = { output = { { type = "bad:event" } } } }, data = { contracts = {} } },
            })
            test.is_true(has(failures, "is not <module>.events:<noun>.<verb>"), table.concat(failures, "; "))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
