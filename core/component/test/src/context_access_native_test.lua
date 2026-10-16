local test = require("test")
local context = require("context")
local fixture = require("fixture")
local envelope = require("envelope")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local routes = {
    {name = "service id", stages = {"mask", "actor", "actor_id"}, call = function()
        local result = context.get_access_context({component_id = "component", access_mask = 1})
        return result.success == true and result or nil, envelope.error_of(result, "context")
    end},
    {name = "service meta", stages = {"mask", "actor", "actor_id"}, call = function()
        local result = context.get_access_context_by_meta({meta = {title = "kept"}, access_mask = 1})
        return result.success == true and result or nil, envelope.error_of(result, "context")
    end},
    {name = "client mask", stages = {"mask"}, call = function() return context.normalize_required_access(1, nil) end},
    {name = "client validate", stages = {"mask", "actor", "scope"}, call = function()
        local value, err = context.validate_access("component", 1)
        if err then return nil, err end
        return value, nil
    end},
    {name = "client metadata", stages = {"mask", "actor", "scope"}, call = function() return context.get_context_by_meta({title = "kept"}, 1) end},
    {name = "client identity", stages = {"actor", "scope"}, call = function()
        local actor, scope, err = context.current_runtime_identity(); return actor, err
    end},
}
return {run = test.run_cases(function()
    test.describe("native access context validation and frame failures", function()
        for _, route in ipairs(routes) do
            for _, stage in ipairs(route.stages) do
                for _, kind in ipairs(kinds) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "access context dependency refuses",
                                details = {code = "context_access_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source); local value, err = route.call()
                            test.is_nil(value); test.not_nil(err)
                            if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "context access guard requires failure"})) end
                            test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "context_access_dependency"); test.eq(err:details().nested.marker, "kept")
                            test.eq(fixture.reads, 0); test.eq(fixture.opens, 0)
                        end)
                    end
                end
            end
        end
        for _, route in ipairs(routes) do
            test.it(route.name .. "/healthy", function()
                fixture.reset("", nil); local value, err = route.call(); test.is_nil(err); test.not_nil(value)
            end)
        end
        test.it("service validation and absent mask keep existing decisions", function()
            fixture.reset("", nil)
            for _, mask in ipairs({0, -1}) do
                local result = context.get_access_context({component_id = "component", access_mask = mask})
                test.is_false(result.success); test.eq(result.kind, errors.INVALID); test.eq(fixture.reads, 0)
            end
            local result = context.get_access_context({component_id = "component", include_context = true})
            test.is_true(result.success); test.eq(result.context.marker, "kept"); test.eq(result.context_revision, 9)
        end)
    end)
end)}
