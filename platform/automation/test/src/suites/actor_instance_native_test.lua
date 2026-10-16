local test = require("test")
local harness = require("engine_harness")
local autoinit = require("autoinit")
local funcs = require("funcs")

local M = {}

function M.probe(input)
    local calls = 0
    local engine = harness.new({
        security = {actor = function()
            if not input.authenticated then return nil end
            return {id = function() return input.actor_id end}
        end},
        autoinit = {component_id = function(actor_id, class)
            calls = calls + 1
            return autoinit.component_id(actor_id, class)
        end},
    })
    local id, err = engine.component_id_for_actor(input.class)
    if err then
        test.eq(calls, 0)
        return nil, err
    end
    test.eq(calls, 1)
    return id
end

local function define_tests()
    test.describe("native actor source identity failures", function()
        local cases = {
            {input = {authenticated = true, actor_id = "native_actor"}, kind = errors.INVALID, code = "source_class_required", field = "class"},
            {input = {authenticated = true, actor_id = "native_actor", class = ""}, kind = errors.INVALID, code = "source_class_required", field = "class"},
            {input = {authenticated = true, actor_id = "native_actor", class = false}, kind = errors.INVALID, code = "source_class_required", field = "class"},
            {input = {authenticated = true, actor_id = "native_actor", class = {}}, kind = errors.INVALID, code = "source_class_required", field = "class"},
            {input = {class = "app.fixture:events"}, kind = errors.PERMISSION_DENIED, code = "authentication_required", field = "actor"},
            {input = {authenticated = true, class = "app.fixture:events"}, kind = errors.INTERNAL, code = "actor_identity_unavailable", field = "actor.id"},
            {input = {authenticated = true, actor_id = "", class = "app.fixture:events"}, kind = errors.INTERNAL, code = "actor_identity_unavailable", field = "actor.id"},
            {input = {authenticated = true, actor_id = false, class = "app.fixture:events"}, kind = errors.INTERNAL, code = "actor_identity_unavailable", field = "actor.id"},
            {input = {authenticated = true, actor_id = {}, class = "app.fixture:events"}, kind = errors.INTERNAL, code = "actor_identity_unavailable", field = "actor.id"},
        }
        for index, case in ipairs(cases) do
            for _, boundary in ipairs({"library", "funcs"}) do
                test.it("classifies actor-source refusal " .. index .. " at " .. boundary, function()
                    local id, err
                    if boundary == "library" then id, err = M.probe(case.input)
                    else id, err = funcs.call("kickside.automation:actor_instance_native_probe", case.input) end
                    test.is_nil(id)
                    test.is_true(errors.is(err, case.kind))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, case.code)
                    test.eq(err:details().field, case.field)
                end)
            end
        end
        for _, boundary in ipairs({"library", "funcs"}) do
            test.it("retains the deterministic actor/class identity at " .. boundary, function()
                local input = {authenticated = true, actor_id = "native_actor", class = "app.fixture:events"}
                local id, err
                if boundary == "library" then id, err = M.probe(input)
                else id, err = funcs.call("kickside.automation:actor_instance_native_probe", input) end
                test.is_nil(err)
                test.eq(id, autoinit.component_id(input.actor_id, input.class))
            end)
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
