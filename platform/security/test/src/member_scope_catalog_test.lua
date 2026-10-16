local test = require("test")
local funcs = require("funcs")
local security = require("security")
local store = require("scope_store")

local LIST = "kickside.security.binding:list_scopes_func"

local function listed(result)
    local ids = {}
    for _, scope in ipairs(result.scopes) do ids[#ids + 1] = scope.id end
    table.sort(ids)
    return table.concat(ids, ",")
end

local function define_tests()
    test.describe("member scope catalog", function()
        test.it("lists the same assignable scopes for a member who cannot read the selected policies", function()
            local slug = "member_catalog_selection"
            test.not_nil((store.upsert({slug = slug, policies = {"app:module_access"}}, "tester")))
            local ok, failure = pcall(function()
                local member = assert(security.new_scope({assert(security.policy("app:member_catalog_caller"))}))
                local actor = security.new_actor("member-catalog-caller", {})
                test.eq(member:evaluate(actor, "registry.get", "app:module_access"), "undefined")

                local reference, reference_err = funcs.new():with_actor(actor):call(LIST, {})
                test.is_nil(reference_err)
                local result, err = funcs.new():with_actor(actor):with_scope(member):call(LIST, {})
                test.is_nil(err)
                test.not_nil(result)
                test.is_true(listed(result):find("kickside.security.scopes:" .. slug, 1, true) ~= nil)
                test.eq(listed(result), listed(reference))
            end)
            store.delete(slug)
            if not ok then error(failure) end
        end)
    end)
end

return {run = test.run_cases(define_tests)}
