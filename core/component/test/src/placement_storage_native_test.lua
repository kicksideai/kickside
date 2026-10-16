local test = require("test")
local placement = require("placement")
local fixture = require("fixture")
local sql = require("sql")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local routes = {
    {name = "read", call = function() return placement.read_node(fixture, "component", true) end},
    {name = "sibling", call = function() return placement.max_sibling_position(fixture, "parent") end},
    {name = "root sibling", call = function() return placement.max_sibling_position(fixture, nil) end},
    {name = "tree lock", call = function() return nil, placement.lock_tree(fixture) end},
}
local function native(source: error, value: any, err: error?)
    test.is_nil(value); test.not_nil(err)
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "placement storage guard requires failure"})) end
    test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable())
    test.eq(err:details().code, "placement_storage_dependency"); test.eq(err:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native placement storage primitives", function()
        for _, route in ipairs(routes) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.name .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "placement storage refuses",
                            details = {code = "placement_storage_dependency", nested = {marker = "kept"}}})
                        fixture.reset(source, sql.type.POSTGRES); local value, err = route.call(); native(source, value, err)
                    end)
                end
            end
        end
        for _, name in ipairs({"read", "tree lock"}) do
            test.it(name .. "/dialect failure", function()
                local source = errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "dialect refuses", details = {code = "placement_storage_dependency", nested = {marker = "kept"}}})
                fixture.reset(nil, sql.type.POSTGRES); fixture.dialect_error = source
                local value, err
                if name == "read" then value, err = placement.read_node(fixture, "component", true)
                else err = placement.lock_tree(fixture) end
                native(source, value, err); test.eq(fixture.calls, 0)
            end)
        end
        test.it("returns stored node and sibling position", function()
            fixture.reset(nil, sql.type.SQLITE); fixture.rows = {{component_id = "component", impl_id = "implementation", position = "rank"}}
            local node, err = placement.read_node(fixture, "component", false)
            test.is_nil(err); test.eq(node.component_id, "component")
            local position, sibling_err = placement.max_sibling_position(fixture, "parent")
            test.is_nil(sibling_err); test.eq(position, "rank")
        end)
        test.it("empty reads preserve absent values", function()
            fixture.reset(nil, sql.type.SQLITE)
            local node, err = placement.read_node(fixture, "component"); test.is_nil(node); test.is_nil(err)
            local position, sibling_err = placement.max_sibling_position(fixture, nil); test.is_nil(position); test.is_nil(sibling_err)
            test.is_nil(placement.lock_tree(fixture)); test.eq(fixture.calls, 0)
        end)
    end)
end)}
