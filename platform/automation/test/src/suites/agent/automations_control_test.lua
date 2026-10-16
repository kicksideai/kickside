-- End-to-end execution-identity change and the status/health readers through the MCP
-- tools, under real user actors: the fixture automation is installed through
-- the engine's one install path, set_execution_identity runs through the command
-- stream and the component SET_EXECUTION_IDENTITY path, and status/health read
-- the resulting drive and command state.

local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")

local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local READ_TOOL = "kickside.automation.agent:automations_read"
local FIXTURE_TYPE = "kickside.automation.agent.fixture:automation_type"
local PROC_SCOPE = "wippy.security:process"

type Map = { [string]: any }

local function executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function call(exec: any, tool: string, args: Map): Map
    local result, err = exec:call(tool, args)
    test.is_nil(err, tool .. " returned a transport error: " .. tostring(err))
    return result :: Map
end

local function call_error(exec: any, tool: string, args: Map): any
    local result, err = exec:call(tool, args)
    test.is_nil(result)
    test.not_nil(err)
    return err
end

local function define_tests()
    test.describe("automation execution-identity change and status", function()
        local owner = "automations_control_owner_" .. uuid.v4():sub(1, 8)
        local stranger = "automations_control_stranger_" .. uuid.v4():sub(1, 8)
        local exec: any
        local id = ""

        test.before_all(function()
            exec = executor(owner)
            local installed = call(exec, MANAGE_TOOL, { action = "install", type = FIXTURE_TYPE, input = { title = "Control Fixture" } })
            test.is_true(installed.success, "fixture install failed: " .. tostring(installed.error))
            id = installed.id :: string
        end)

        test.after_all(function()
            if exec and id ~= "" then exec:call(MANAGE_TOOL, { action = "uninstall", id = id }) end
        end)

        test.it("selects the owner's own principal and reads the repeated request back", function()
            local args = { action = "set_execution_identity", id = id, principal = { kind = "user", id = owner },
                request_id = "set_execution_identity-self", expected_identity_generation = 0 }
            local selected = call(exec, MANAGE_TOOL, args)
            test.is_true(selected.success, "set_execution_identity failed: " .. tostring(selected.error))
            test.eq(selected.state, "succeeded")
            test.eq(selected.identity_generation, 1)
            local again = call(exec, MANAGE_TOOL, args)
            test.is_true(again.success, "repeat failed: " .. tostring(again.error))
            test.eq(again.identity_generation, 1)
            test.eq(again.generation, selected.generation)
        end)

        test.it("refuses a direct component SET on the automation-owned component", function()
            local direct = call(exec, "app:direct_identity_set", { component_id = id,
                principal = { kind = "user", id = owner }, request_id = "direct-set", expected_identity_generation = 1 })
            test.is_false(direct.success)
            test.eq(direct.kind, "PermissionDenied")
            test.contains(tostring(direct.error), "set_execution_identity")
        end)

        test.it("the harness resolver refuses every undeclared delegation", function()
            for _, kind in ipairs({ "user", "group", "service" }) do
                local refused = call_error(exec, "app:scope_resolver_stub", {
                    principal = { kind = kind, id = "selected_" .. uuid.v4():sub(1, 8) },
                    authorized_by = { kind = "user", id = owner },
                })
                test.is_true(errors.is(refused, errors.PERMISSION_DENIED))
                test.contains(tostring(refused), "may_act_as denied")
            end
        end)

        test.it("refuses a group principal the owner holds no delegation for", function()
            local refused = call_error(exec, MANAGE_TOOL, { action = "set_execution_identity", id = id,
                principal = { kind = "group", id = "eng" }, request_id = "set_execution_identity-group", expected_identity_generation = 1 })
            test.not_nil(refused)
            test.contains(tostring(refused), "may_act_as denied", tostring(refused))
        end)

        test.it("refuses a caller without ADMIN", function()
            local refused = call_error(executor(stranger), MANAGE_TOOL, { action = "set_execution_identity", id = id,
                principal = { kind = "user", id = stranger }, request_id = "set_execution_identity-stranger", expected_identity_generation = 1 })
            test.not_nil(refused)
        end)

        test.it("reports the drives and command state of the automation", function()
            local status = call(exec, READ_TOOL, { action = "status", id = id })
            test.is_true(status.success, "status failed: " .. tostring(status.error))
            test.eq(#(status.drives :: { any }), 1)
            test.eq((status.drives :: { Map })[1].drive_key, "main")
            test.is_nil((status.drives :: { Map })[1].pending_command_id)
            test.is_true(((status.commands :: Map).generation :: number) >= 2)
            test.is_nil((status.commands :: Map).pending)
            test.eq((status.ledger_counts :: Map).uncertain, 0)

            local hidden = call_error(executor(stranger), READ_TOOL, { action = "status", id = id })
            test.not_nil(hidden)
        end)


        test.it("reports the caller's automation health", function()
            local health = call(exec, READ_TOOL, { action = "health" })
            test.is_true(health.success, "health failed: " .. tostring(health.error))
            test.eq(type((health.health :: Map).degraded_drives), "number")
            test.eq(type((health.health :: Map).overdue_count), "number")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
