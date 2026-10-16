-- Defect: user_agents.create read the duplicate-name list with the error dropped
-- to `_`, then trusted `existing` for the dedup decision. On a transient list read
-- failure `existing` is nil, so the guard fell through to registration and admitted
-- a duplicate agent name. Correct behavior: a list read failure ABORTS create; a
-- successful read that finds a match is a conflict. Both are driven here through the
-- constructed component-service dependency, with a register spy proving create never
-- reaches registration in either case.

local test = require("test")
local user_agents = require("user_agents")
local agent_types = require("agent_types")

type ServiceSpy = {
    calls: { list: integer, register: integer },
    list: (self: any, args: any) -> (any, any),
    register: (self: any, args: any) -> (any, any),
}

local function fake_service(list_result: any, list_err: any): ServiceSpy
    local calls = { list = 0, register = 0 }
    local svc: ServiceSpy = {
        calls = calls,
        list = function(_self: any, _args: any): (any, any)
            calls.list = calls.list + 1
            return list_result, list_err
        end,
        register = function(_self: any, _args: any): (any, any)
            calls.register = calls.register + 1
            return { success = true, component_id = "must-not-be-created" }, nil
        end,
    }
    return svc
end

local function with_service(svc: ServiceSpy): any
    return user_agents.new(function() return svc, nil end)
end

local function define_tests()
    test.describe("user_agents.create duplicate-name guard", function()
        test.it("aborts without registering when the uniqueness read fails", function()
            local svc = fake_service(nil, "transient db error")
            local instance = with_service(svc)
                local res, failure = instance.create({ title = "Nova", model = "claude-4-5-sonnet" })
                test.is_nil(res)
                test.is_true(errors.is(failure, errors.UNKNOWN))
                test.is_true((tostring(failure or "")):find("uniqueness") ~= nil,
                    "the failure must surface the uniqueness read error")
                -- A dropped read error must never fall through to registration.
                test.eq(svc.calls.register, 0)
        end)

        test.it("rejects a duplicate title as a conflict without registering", function()
            local svc = fake_service({ success = true, components = { { component_id = "existing" } } }, nil)
            local instance = with_service(svc)
                local res, failure = instance.create({ title = "Nova", model = "claude-4-5-sonnet" })
                test.is_nil(res)
                test.is_true(errors.is(failure, errors.CONFLICT))
                test.eq(svc.calls.register, 0)
        end)

        test.it("rejects internal and malformed explicit capabilities before registering", function()
            local cases = {
                { traits = { "app:internal_trait_probe" }, expected = "not public" },
                { traits = { "app:public_tool_probe" }, expected = "invalid registry shape" },
                { tools = { "app:private_tool_probe" }, expected = "not public" },
                { tools = { "app:wrong_kind_tool_probe" }, expected = "invalid registry shape" },
                { tools = { "keeper.hub.tools:dependencies" }, expected = "not found" },
            }

            for _, case in ipairs(cases) do
                local svc = fake_service({ success = true, components = {} }, nil)
                local instance = with_service(svc)
                    local args = {
                        title = "Rejected " .. tostring(case.expected),
                        model = "class:fast",
                        traits = case.traits,
                        tools = case.tools,
                    }
                    local res, failure = instance.create(args)
                    test.is_nil(res)
                    test.is_true(errors.is(failure, errors.INVALID))
                    test.ok(tostring(failure):find(case.expected, 1, true), tostring(failure))
                    test.eq(svc.calls.register, 0)
            end
        end)

        test.it("uses the agents model default when creation omits model", function()
            local captured: any = nil
            local svc = fake_service({ success = true, components = {} }, nil)
            svc.register = function(_self: any, args: any): (any, any)
                captured = args
                return { success = true, component_id = "default-model-agent" }, nil
            end
            local res = with_service(svc).create({ title = "Default model", traits = {} })
            test.is_true(res.success, tostring(res.error))
            test.not_nil(captured)
            test.eq(captured.private_context.model, agent_types.DEFAULT_MODEL)
        end)

        test.it("accepts canonical public trait and tool references", function()
            local svc = fake_service({ success = true, components = {} }, nil)
            local instance = with_service(svc)
                local res, failure = instance.create({
                    title = "Public capability agent",
                    model = "class:fast",
                    traits = { "app:public_trait_probe" },
                    tools = { "app:public_tool_probe" },
                })
                test.is_true(res.success, tostring(res.error))
                test.eq(svc.calls.register, 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options: any): any return run_cases(options) end }
