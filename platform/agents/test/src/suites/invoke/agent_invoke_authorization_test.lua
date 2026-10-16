local test = require("test")
local agent_invoke = require("agent_invoke")

-- The writing automation every direct write names as its origin.
local ORIGIN = "agent-invoke-test-automation"

local function refuse_flow(): any
    return { create = function() error("authorization must precede the flow") end }
end

local function write(agent_id: string, deps: any): any
    deps.flow = refuse_flow()
    return agent_invoke.write({ origin = ORIGIN, config = { agent_id = agent_id }, input = { content = "Run." } }, deps)
end

local function run(): ()
    test.describe("agent authorization failure classification", function()
        test.it("retries component lookup and access infrastructure failures", function()
            local unavailable = errors.new({ message = "component service down", kind = errors.UNAVAILABLE })
            local internal = errors.new({ message = "component read failed", kind = errors.INTERNAL })
            local found = { success = true, impl_id = "kickside.agents:user_agent" }
            local cases = {
                { service = { get = function() return nil, unavailable end }, code = "provider_unavailable" },
                { service = { get = function() return { success = false, kind = errors.INTERNAL, error = "read failed" } end }, code = "provider_error" },
                { service = { get = function() return { success = false, error = "read failed" } end }, code = "provider_error" },
                { service = { get = function() return found end,
                    get_access_context = function() return nil, internal end }, code = "provider_error" },
                { service = { get = function() return found end,
                    get_access_context = function() return { success = false, kind = errors.UNAVAILABLE, error = "read failed" } end }, code = "provider_unavailable" },
            }
            for _, case in ipairs(cases) do
                local result = write("user_agent:target", { agent_service = case.service })
                test.is_false(result.success)
                test.eq(result.error.code, case.code)
                test.is_true(result.error.retriable)
            end
        end)

        test.it("retries a typed registry lookup failure", function()
            local result = write("app:agent", {
                get_entry = function() return nil, errors.new({ message = "registry down", kind = errors.UNAVAILABLE }) end,
            })
            test.eq(result.error.code, "provider_unavailable")
            test.is_true(result.error.retriable)
        end)
    end)
end

return { run = test.run_cases(run) }
