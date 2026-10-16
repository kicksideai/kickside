local test = require("test")
local reader = require("reader")
local fixture = require("fixture")
local function invoke(route: string, include: boolean): (any, error?)
    local instance = reader.new():with_user("user-1"):include_options({private_context = include})
    if route == "all" then return instance:all() end
    return instance:one()
end
return {run = test.run_cases(function()
    test.describe("component reader persisted context", function()
        for _, route in ipairs({"all", "one"}) do
            for _, raw in ipairs({"{", "", "false", "null", "12", false, 12}) do
                test.it(route .. "/corrupt/" .. type(raw) .. "/" .. tostring(raw), function()
                    fixture.reset(route, "", nil); fixture.context = raw
                    local result, err = invoke(route, true)
                    test.is_nil(result); test.eq(type(err), "userdata"); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                    test.eq(err:details().code, "persisted_data"); test.eq(err:details().field, "component.private_context")
                    test.eq(fixture.releases, 1)
                    if raw == "{" then
                        local cause = err:details().cause
                        test.eq(type(cause), "table"); test.eq(type(cause.kind), "string"); test.eq(type(cause.message), "string")
                    end
                end)
            end
            for _, raw in ipairs({"{}", "{\"nested\":{\"kept\":true}}", {nested = {kept = true}}}) do
                test.it(route .. "/healthy/" .. type(raw) .. "/" .. tostring(raw), function()
                    fixture.reset(route, "", nil); fixture.context = raw
                    local result, err = invoke(route, true); test.is_nil(err); test.eq(fixture.releases, 1)
                    local component = route == "all" and result[1] or result
                    test.eq(type(component.private_context), "table"); test.eq(component.context_revision, 9)
                    if raw ~= "{}" then test.is_true(component.private_context.nested.kept) end
                end)
            end
            test.it(route .. "/absent", function()
                fixture.reset(route, "", nil); local result, err = invoke(route, true); test.is_nil(err)
                local component = route == "all" and result[1] or result
                test.is_nil(component.private_context); test.eq(component.context_revision, 9); test.eq(fixture.releases, 1)
            end)
            test.it(route .. "/excluded", function()
                fixture.reset(route, "", nil); fixture.context = "{"
                local result, err = invoke(route, false); test.is_nil(err)
                local component = route == "all" and result[1] or result
                test.eq(component.private_context, "{"); test.eq(fixture.releases, 1)
            end)
        end
    end)
end)}
