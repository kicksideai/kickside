local test = require("test")
local component = require("component")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "component list guard requires JSON proof"})) end
    return data
end
local function instance(result: any, failure: error?): any
    local definition = {with_actor = function(self) return self end, with_scope = function(self) return self end,
        open = function() return {list = function() return result, failure end}, nil end}
    return component.new({contract = {get = function() return definition, nil end},
        security = {actor = function() return {} end, scope = function() return {} end}})
end
return {run = test.run_cases(function()
    test.describe("native thread component listing proof", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, boundary in ipairs({"transport", "envelope"}) do
                    test.it(boundary .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                            details = {code = "component_list_dependency", nested = {marker = "kept"}}})
                        local result = {success = false, error = source:message(), kind = source:kind(), retryable = source:retryable(), details = source:details()}
                        local failure: error? = nil
                        if boundary == "transport" then failure = source; result = {success = true, components = {}, has_more = false} end
                        local ids, err, display, page = instance(result, failure).list_thread_components(nil, 1, 2, 0)
                        test.is_nil(ids); test.not_nil(err); test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, "kept")
                        if boundary == "transport" then test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.is_nil(display); test.is_nil(page)
                    end)
                end
            end
        end
        local malformed = {
            {}, {value = true}, {value = {success = true}}, {value = {components = true, has_more = false}},
            {value = {components = {}, has_more = true}}, {value = {components = {}}},
            {value = {components = {{component_id = "a"},{component_id = "b"},{component_id = "c"}}, has_more = false}},
            {value = {components = {{component_id = "a"},{}}, has_more = false}},
            {value = {components = {[2] = {component_id = "a"}}, has_more = false}},
            {value = {components = {bad = {component_id = "a"}}, has_more = false}},
            {value = {components = {true}, has_more = false}},
            {value = {components = {{component_id = ""}}, has_more = false}},
        }
        for index, item in ipairs(malformed) do
            test.it("malformed page/" .. tostring(index), function()
                local ids, err, display, page = instance(item.value, nil).list_thread_components(nil, 1, 2, 0)
                test.is_nil(ids); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code)
                test.is_nil(display); test.is_nil(page)
            end)
        end
        for _, limit in ipairs({0, -1}) do
            test.it("invalid pagination/" .. tostring(limit), function()
                local ids, err = instance({components = {}, has_more = false}, nil).list_thread_components(nil, 1, limit, 0)
                test.is_nil(ids); test.eq(err:kind(), errors.INVALID); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        test.it("later missing page cannot return partial authority ids", function()
            local calls = 0
            local definition = {with_actor = function(self) return self end, with_scope = function(self) return self end,
                open = function() return {list = function()
                    calls = calls + 1
                    if calls == 1 then return {components = {{component_id = "a"}}, has_more = true}, nil end
                    return nil, nil
                end}, nil end}
            local api = component.new({contract = {get = function() return definition, nil end},
                security = {actor = function() return {} end, scope = function() return {} end}})
            local ids, err = api.list_thread_components(nil, 1, 2, 0)
            test.is_nil(ids); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable()); test.not_nil(err:details().code); test.eq(calls, 2)
        end)
        test.it("healthy published tuple and optional display fields remain", function()
            local ids, err, display, page = instance({components = {{component_id = "a", meta = {title = "title", icon = "icon"}}, {component_id = "b"}}, has_more = true}, nil).list_thread_components(nil, 1, 2, 5)
            test.is_nil(err); test.eq(encoded(ids), '["a","b"]'); test.eq(display.a.title, "title"); test.eq(display.a.icon, "icon"); test.eq(display.b.title, ""); test.eq(display.b.icon, "")
            test.is_true(page.has_more); test.eq(page.next_offset, 7)
        end)
        test.it("healthy empty authority scope remains empty", function()
            local ids, err, display, page = instance({components = {}, has_more = false}, nil).list_thread_components(nil, 1, 2, 5)
            test.is_nil(err); test.eq(#ids, 0); test.eq(encoded(display), "[]"); test.is_false(page.has_more); test.eq(page.next_offset, 5)
        end)
    end)
end)}
