local test = require("test")
local export_automation = require("export_automation")
local import_automation = require("import_automation")

local function actor(): any
    return { id = function(): string return "artifact-tester" end }
end

local function define_tests()
    test.describe("automation portable artifacts", function()
        test.it("exports the engine artifact unchanged", function()
            local expected = {
                apiVersion = "kickside.automation/v1",
                kind = "Automation",
                spec = {
                    type = "kickside.sync:sync",
                    input = { transform = { kind = "expr", expr = "payload" } },
                },
            }
            local status, body = export_automation.response_for(actor(), "sync-1", {
                export_artifact = function(id: string): (any?, any)
                    test.eq(id, "sync-1")
                    return expected, nil
                end,
            })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.artifact, expected)
        end)

        test.it("imports an artifact with destination placement kept outside it", function()
            local artifact = {
                apiVersion = "kickside.automation/v1",
                kind = "Automation",
                spec = { type = "kickside.sync:sync", input = {} },
            }
            local status, body = import_automation.response_for(actor(), {
                artifact = artifact,
                parent_id = "workspace-2",
            }, {
                import_artifact = function(value: any, parent_id: string?, input_overrides: any?): (any?, any)
                    test.eq(value, artifact)
                    test.eq(parent_id, "workspace-2")
                    test.is_nil(input_overrides)
                    return { id = "sync-2", type = "kickside.sync:sync", created = true }, nil
                end,
            })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.id, "sync-2")
            test.eq(body.type, "kickside.sync:sync")
            test.is_true(body.created)
        end)

        test.it("passes explicit environment bindings as input overrides", function()
            local artifact = {
                apiVersion = "kickside.automation/v1",
                kind = "Automation",
                spec = { type = "kickside.sync:sync", input = {} },
            }
            local overrides = {
                trigger = { config = { connection_id = "connection-target" } },
                sink_config = { crm_id = "crm-target" },
            }
            local status, body = import_automation.response_for(actor(), {
                artifact = artifact,
                input_overrides = overrides,
            }, {
                import_artifact = function(value: any, parent_id: string?, received: any): (any?, any)
                    test.eq(value, artifact)
                    test.is_nil(parent_id)
                    test.eq(received, overrides)
                    return { id = "sync-3", type = "kickside.sync:sync", created = true }, nil
                end,
            })
            test.eq(status, 200)
            test.is_true(body.success)
            test.eq(body.id, "sync-3")
        end)

        test.it("rejects undeclared import request fields", function()
            local status, body = import_automation.response_for(actor(), {
                artifact = {
                    apiVersion = "kickside.automation/v1",
                    kind = "Automation",
                    spec = { type = "kickside.sync:sync", input = {} },
                },
                runtime_state = {},
            }, {})
            test.eq(status, 400)
            test.eq(body.error.code, "invalid_input")
            test.contains(body.error.message, "runtime_state")
        end)

        test.it("rejects unauthenticated export and import", function()
            local export_status = export_automation.response_for(nil, "sync-1", {})
            local import_status = import_automation.response_for(nil, {}, {})
            test.eq(export_status, 401)
            test.eq(import_status, 401)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
