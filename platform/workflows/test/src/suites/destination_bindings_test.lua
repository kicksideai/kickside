local test = require("test")
local registry = require("registry")
local destination_bindings = require("destination_bindings")

type Map = { [string]: any }

local function with_teardown(handler: any, fn: any)
    local real_open = destination_bindings._open
    destination_bindings._open = function(): (any?, string?)
        return { teardown_owner = handler }, nil
    end
    local ok, err = pcall(fn)
    destination_bindings._open = real_open
    if not ok then error(err) end
end

local function define_tests()
    test.describe("Workflow destination teardown", function()
        test.it("asks Automation to release every automation addressed at the removed Workflow", function()
            local calls: { Map } = {}
            with_teardown(function(_self: any, args: any): (any?, any)
                calls[#calls + 1] = args :: Map
                return { found = true, owner_ids = { "bind-a", "bind-b" } }, nil
            end, function()
                local released, err = destination_bindings.release("wf-1")
                test.is_nil(err, tostring(err))
                test.is_true(released)
                test.eq(#calls, 1)
                test.eq(calls[1].resource_kind, "flow")
                test.eq(calls[1].resource_id, "wf-1")
            end)
        end)

        test.it("reports a partial teardown instead of letting the Workflow delete continue", function()
            with_teardown(function(_self: any, _args: any): (any?, any)
                return { found = true, owner_ids = { "bind-a" }, error = "bind-a: binding delete failed" }, nil
            end, function()
                local released, err = destination_bindings.release("wf-1")
                test.is_false(released)
                test.contains(tostring(err), "binding delete failed")
            end)
        end)

        test.it("succeeds when no automation addresses the Workflow", function()
            with_teardown(function(_self: any, _args: any): (any?, any)
                return { found = false, owner_ids = {} }, nil
            end, function()
                local released, err = destination_bindings.release("wf-1")
                test.is_nil(err, tostring(err))
                test.is_true(released)
            end)
        end)

        test.it("requires a workflow id", function()
            local released, err = destination_bindings.release("")
            test.is_false(released)
            test.contains(tostring(err), "workflow id required")
        end)

        test.it("wires the release into the Workflow component's deletable teardown", function()
            local entry, entry_err = registry.get("kickside.workflows.binding:delete_workflow_func")
            test.is_nil(entry_err, tostring(entry_err))
            test.not_nil(entry)
            local data = type(entry) == "table" and type((entry :: Map).data) == "table"
                and ((entry :: Map).data :: Map) or (entry :: Map)
            local imports = type(data.imports) == "table" and (data.imports :: Map) or {}
            test.eq(imports.destination_bindings, "kickside.workflows.binding:destination_bindings")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
