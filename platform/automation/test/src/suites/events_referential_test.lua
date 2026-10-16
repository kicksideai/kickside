local test = require("test")
local registry = require("registry")

local EVENT_META_TYPE = "kickside.core.threads.event"

local function entry_meta(entry: any): any
    if type(entry) ~= "table" then return {} end
    if type((entry :: any).meta) == "table" then return (entry :: any).meta end
    if type((entry :: any).data) == "table" and type((entry :: any).data.meta) == "table" then
        return (entry :: any).data.meta
    end
    return {}
end

-- Collect every distinct event-type id referenced by a binding's meta.events
-- (output and input), each tagged with the declaring binding id for the failure
-- message.
local function collect_event_refs(): ({ [string]: { string } }, integer)
    local refs: { [string]: { string } } = {}
    local binding_count = 0
    local bindings, err = registry.find({ [".kind"] = "contract.binding" })
    assert(not err, "registry.find(contract.binding): " .. tostring(err))
    for _, entry in ipairs((bindings or {}) :: { any }) do
        local meta = entry_meta(entry)
        local events = type(meta.events) == "table" and (meta.events :: any) or nil
        if events then
            binding_count = binding_count + 1
            local binding_id = tostring((entry :: any).id or "")
            for _, dir in ipairs({ "output", "input" }) do
                local list = type(events[dir]) == "table" and (events[dir] :: { any }) or {}
                for _, raw in ipairs(list) do
                    local typ = type(raw) == "table" and (raw :: any).type or nil
                    if type(typ) == "string" and typ ~= "" then
                        local holders = refs[typ] or {}
                        holders[#holders + 1] = binding_id
                        refs[typ] = holders
                    end
                end
            end
        end
    end
    return refs, binding_count
end

local function define_tests()
    test.describe("event-type referential integrity", function()
        -- Every value in a contract.binding's meta.events.output/input must resolve
        -- to a declared registry entry carrying meta.type = kickside.core.threads.event.
        -- This is the gate migration-delta 0 turns on: an events-block value that
        -- lacks a declared event-type entry is a dangling reference.
        test.it("every meta.events value resolves to a declared event-type entry", function()
            local refs, binding_count = collect_event_refs()
            test.is_true(binding_count > 0, "expected at least one binding declaring meta.events")

            local failures: { string } = {}
            for event_id, holders in pairs(refs) do
                local entry, get_err = registry.get(event_id)
                if get_err or not entry then
                    failures[#failures + 1] = event_id
                        .. " does not resolve (referenced by "
                        .. table.concat(holders, ", ")
                        .. ")"
                else
                    local meta = entry_meta(entry)
                    if meta.type ~= EVENT_META_TYPE then
                        failures[#failures + 1] = event_id
                            .. " resolves but meta.type is '"
                            .. tostring(meta.type)
                            .. "' (expected " .. EVENT_META_TYPE .. ")"
                    elseif entry.schema == nil and (type((entry :: any).data) ~= "table" or (entry :: any).data.schema == nil) then
                        failures[#failures + 1] = event_id .. " has no schema"
                    end
                end
            end

            test.eq(#failures, 0, "dangling event-type references:\n  " .. table.concat(failures, "\n  "))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local function run(options: any): any
    return run_cases(options)
end

return { run = run }
