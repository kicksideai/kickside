local expand_flow = require("expand_flow")
local test = require("test")

type Map = { [string]: any }

local function define_tests()
    test.describe("native nested Flow expansion", function()
        test.it("loads and remints one exact published Flow into child DAG commands", function()
            local old_get, old_validate, old_remint, old_context = expand_flow._get_version, expand_flow._validate_input, expand_flow._remint, expand_flow._run_context
            local captured: Map = {}
            expand_flow._get_version = function(id: string, version: number): (Map?, string?)
                test.eq(id, "wf-child")
                test.eq(version, 3)
                return { input_schema = { type = "object" }, compiled_commands = { { type = "CREATE_NODE" } } }, nil
            end
            expand_flow._validate_input = function(schema: any, input: any): string?
                captured.schema = schema
                captured.input = input
                return nil
            end
            expand_flow._remint = function(commands: any, input: any, opts: Map): any
                captured.commands = commands
                captured.remint_input = input
                captured.opts = opts
                return { { type = "CREATE_NODE", payload = { metadata = { def_node_id = "work" } } } }
            end
            expand_flow._run_context = function(): Map return {} end

            local result, err = expand_flow.run({
                flow_ref = { kind = "flow", id = "wf-child", version = 3 },
                input = { lead_id = "lead-1" },
            })
            expand_flow._get_version, expand_flow._validate_input, expand_flow._remint, expand_flow._run_context = old_get, old_validate, old_remint, old_context

            test.is_nil(err)
            local commands = (((result :: Map)._control :: Map).commands :: { Map })
            test.eq(#commands, 1)
            test.eq((((captured.input :: Map).lead_id)), "lead-1")
            test.eq((((captured.remint_input :: Map).lead_id)), "lead-1")
            test.eq(tonumber((captured.opts :: Map).version), 3)
            test.eq(tonumber((captured.opts :: Map).depth), 1)
            test.eq((((captured.opts :: Map).workflow_stack :: { any })[1]), "wf-child")
        end)

        test.it("rejects recursive exact Flow composition at the Dataflow context seam", function()
            local old_context = expand_flow._run_context
            expand_flow._run_context = function(): Map
                return { workflow_stack = { "wf-root", "wf-child" }, depth = 2 }
            end
            local result, err = expand_flow.run({
                flow_ref = { kind = "flow", id = "wf-child", version = 3 },
                input = {},
            })
            expand_flow._run_context = old_context
            test.is_nil(result)
            test.contains(tostring(err), "recursive Flow composition")
        end)

        test.it("requires an exact Flow id and version", function()
            for _, ref in ipairs({ {}, { kind = "flow", id = "wf" }, { kind = "flow", version = 1 },
                { kind = "flow", id = "wf", version = "1" } }) do
                local result, err = expand_flow.run({ flow_ref = ref, input = {} })
                test.is_nil(result)
                test.contains(tostring(err), "exact flow_ref")
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
