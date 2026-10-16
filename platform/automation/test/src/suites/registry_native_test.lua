local test = require("test")
local harness = require("engine_harness")
local funcs = require("funcs")
local M = {}

local function fixture()
    local state = {finds = 0, versions = 0, invoked = 0, token = "first", revision = "first"}
    local binding = {id = "fixture:binding", kind = "contract.binding", meta = {
        type = "kickside.automation", actions = {"inspect"}, class = {"fixture"}},
        data = {contracts = {
            {contract = "fixture:actions", methods = {inspect = "fixture:inspect"}},
            {contract = "kickside.data:pullable", methods = {read = "fixture:read"}},
        }}}
    local registry = {
        current_version = function()
            state.versions = state.versions + 1
            if state.version_failure == state.versions then return nil, state.failure end
            if state.missing_version then return nil, nil end
            if state.missing_token then return {id = function() return nil end}, nil end
            return {id = function() return state.token end}, nil
        end,
        find = function(query)
            state.finds = state.finds + 1
            if state.find_failure == state.finds then return nil, state.failure end
            if query[".kind"] == "contract.binding" then
                if state.race then state.token = "third" end
                return {binding}, nil
            end
            if state.removed then return {}, nil end
            if state.reversed then
                return {
                    {id = "fixture:source", data = {binding = binding.id, operations = {upsert = {}}}},
                    {id = "fixture:sink", data = {binding = binding.id}},
                }, nil
            end
            return {
                {id = "fixture:source", meta = {title = state.revision}, data = {
                    binding = binding.id, output_schema = {type = "object"}}},
                {id = "fixture:sink", meta = {title = state.revision}, data = {
                    binding = binding.id, operations = {upsert = {}}}},
            }, nil
        end,
    }
    local component = {
        ACCESS = {READ = 1, WRITE = 2},
        query = function() return {{impl_id = binding.id}}, nil end,
        open = function() return {inspect = function()
            state.invoked = state.invoked + 1
            return "inspected", nil
        end}, nil end,
    }
    return harness.new({registry = registry, component = component}), state, registry
end

local function invoke(engine, method)
    if method == "resolve_source" then return engine.resolve_source("fixture:source") end
    if method == "resolve_sink" then return engine.resolve_sink("fixture:sink") end
    if method == "call_action" then return engine.call_action("fixture:instance", "inspect", {}) end
    return engine[method]()
end

local function native_failure(kind, policy)
    local spec = {kind = kind, message = "dependency refusal", details = {
        code = "registry_probe_refusal", context = {operation = "registry"}}}
    if policy == "false" then spec.retryable = false end
    if policy == "true" then spec.retryable = true end
    return errors.new(spec)
end

local function assert_preserved(result, err, original)
    test.is_nil(result)
    test.not_nil(err)
    test.is_true(errors.is(err, original:kind()))
    test.eq(err:retryable(), original:retryable())
    test.eq(err:details().code, original:details().code)
    test.eq(err:details().context.operation, "registry")
end

function M.probe(input)
    local engine, state = fixture()
    state.failure = native_failure(input.kind, input.policy)
    if input.stage == "ports" then state.find_failure = 1
    elseif input.stage == "bindings" then state.find_failure = 2
    elseif input.stage == "before" then state.version_failure = 1
    else state.version_failure = input.method == "call_action" and 3 or 2 end
    local result, err = invoke(engine, input.method)
    if err then return nil, err end
    return result
end

local function define_tests()
    test.describe("native registry failures and coherent snapshots", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({"absent", "false", "true"}) do
                for _, stage in ipairs({"ports", "bindings"}) do
                    for _, method in ipairs({"resolve_source", "resolve_sink"}) do
                        test.it("retains " .. kind .. "/" .. policy .. " at " .. stage .. "/" .. method, function()
                            local engine, state = fixture()
                            state.failure = native_failure(kind, policy)
                            state.find_failure = stage == "ports" and 1 or 2
                            local result, err = invoke(engine, method)
                            assert_preserved(result, err, state.failure)
                            test.eq(state.finds, state.find_failure)
                        end)
                    end
                end
            end
        end
        for _, method in ipairs({"list_sources", "list_sinks", "resolve_source", "resolve_sink", "rebuild_type_composition", "call_action"}) do
            for _, stage in ipairs({"before", "after"}) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.UNKNOWN}) do
                    test.it("stops " .. method .. " on " .. stage .. " version " .. kind, function()
                        local engine, state = fixture()
                        state.failure = native_failure(kind, "false")
                        state.version_failure = stage == "before" and 1 or (method == "call_action" and 3 or 2)
                        local result, err = invoke(engine, method)
                        assert_preserved(result, err, state.failure)
                        test.eq(state.invoked, 0)
                        test.eq(state.finds, stage == "before" and 0 or ((method == "rebuild_type_composition" or method == "call_action") and 1 or 2))
                    end)
                end
            end
        end
        for _, method in ipairs({"list_sources", "resolve_source", "call_action", "rebuild_type_composition"}) do
            test.it("stops warm " .. method .. " on version failure", function()
                local engine, state = fixture()
                local _, initial = invoke(engine, method)
                test.is_nil(initial)
                local finds, invoked = state.finds, state.invoked
                state.failure = native_failure(errors.PERMISSION_DENIED, "false")
                state.version_failure = state.versions + 1
                local result, err = invoke(engine, method)
                assert_preserved(result, err, state.failure)
                test.eq(state.finds, finds)
                test.eq(state.invoked, invoked)
            end)
            for _, missing in ipairs({"missing_version", "missing_token"}) do
                test.it("refuses absent supported " .. missing .. " at " .. method, function()
                    local engine, state = fixture()
                    state[missing] = true
                    local result, err = invoke(engine, method)
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "registry_version_missing")
                    test.eq(state.finds, 0)
                    test.eq(state.invoked, 0)
                end)
            end
        end
        for _, method in ipairs({"resolve_source", "resolve_sink"}) do
            test.it("uses the current build during a racing version at " .. method, function()
                local engine, state = fixture()
                local first, err = invoke(engine, method)
                test.is_nil(err)
                test.eq(first.title, "first")
                state.token = "second"
                state.revision = "second"
                state.race = true
                local current, current_err = invoke(engine, method)
                test.is_nil(current_err)
                test.eq(current.title, "second")
                test.eq(state.finds, 4)
                state.race = false
                local stable, stable_err = invoke(engine, method)
                test.is_nil(stable_err)
                test.eq(stable.title, "second")
                test.eq(state.finds, 6)
                invoke(engine, method)
                test.eq(state.finds, 6)
            end)
        end
        for _, method in ipairs({"resolve_source", "resolve_sink"}) do
            for _, change in ipairs({"removed", "reversed"}) do
                test.it("refuses " .. change .. " ports during a racing version at " .. method, function()
                    local engine, state = fixture()
                    local first, initial = invoke(engine, method)
                    test.is_nil(initial)
                    test.not_nil(first)
                    state.token = "second"
                    state.race = true
                    state[change] = true
                    local result, err = invoke(engine, method)
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(state.finds, 4)
                end)
            end
        end
        for _, method in ipairs({"resolve_source", "resolve_sink", "list_sources", "call_action"}) do
            test.it("builds per call without version capability at " .. method, function()
                local engine, state, registry = fixture()
                registry.current_version = nil
                for _ = 1, 2 do
                    local result, err = invoke(engine, method)
                    test.is_nil(err)
                    test.not_nil(result)
                end
                test.eq(state.finds, method == "call_action" and 2 or 4)
            end)
        end
        for _, input in ipairs({
            {method = "resolve_source", stage = "ports", kind = errors.INVALID, policy = "false"},
            {method = "resolve_sink", stage = "bindings", kind = errors.RATE_LIMITED, policy = "true"},
            {method = "list_sources", stage = "before", kind = errors.PERMISSION_DENIED, policy = "false"},
            {method = "rebuild_type_composition", stage = "after", kind = errors.UNAVAILABLE, policy = "false"},
            {method = "call_action", stage = "after", kind = errors.PERMISSION_DENIED, policy = "false"},
        }) do
            test.it("retains fields through funcs " .. input.method .. "/" .. input.stage, function()
                local result, err = funcs.call("kickside.automation:registry_native_probe", input)
                assert_preserved(result, err, native_failure(input.kind, input.policy))
            end)
        end
    end)
end
M.run = test.run_cases(define_tests)
return M
