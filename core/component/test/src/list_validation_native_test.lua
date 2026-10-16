local test = require("test")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local envelope = require("envelope")

local function define_tests()
    test.describe("native Component list validation", function()
        local cases = {
            {field = "filters", request = {filters = "invalid"}},
            {field = "pagination", request = {pagination = "invalid"}},
            {field = "ordering", request = {ordering = "invalid"}},
            {field = "pagination.limit", request = {pagination = {limit = 0}}},
            {field = "pagination.limit", request = {pagination = {limit = 101}}},
            {field = "pagination.limit", request = {pagination = {limit = "50"}}},
            {field = "pagination.offset", request = {pagination = {offset = -1}}},
            {field = "pagination.offset", request = {pagination = {offset = "0"}}},
            {field = "ordering.field", request = {ordering = {field = "component_id"}}},
            {field = "ordering.field", request = {ordering = {field = {}}}},
            {field = "ordering.direction", request = {ordering = {direction = "asc"}}},
            {field = "ordering.direction", request = {ordering = {direction = 1}}},
            {field = "filters.impl_ids[1]", request = {filters = {impl_ids = {""}}}},
            {field = "filters.impl_ids[2]", request = {filters = {impl_ids = {"valid:impl", 1}}}},
            {field = "filters.access_mask", request = {filters = {access_mask = 1.5}}},
        }
        local function scope()
            local policy, err = security.policy("app:test_scope_policy")
            test.is_nil(err)
            test.not_nil(policy)
            return security.new_scope({policy})
        end
        local actor = security.new_actor("native-list-validation", {security_groups = {}})
        local function call(boundary, request)
            if boundary == "funcs" then
                return funcs.new():with_actor(actor):with_scope(scope()):call("kickside.component.binding:list_components_func", request)
            end
            local definition, get_err = contract.get("kickside.component:component_service")
            test.is_nil(get_err)
            test.not_nil(definition)
            local service, open_err = definition:with_actor(actor):with_scope(scope()):open()
            test.is_nil(open_err)
            test.not_nil(service)
            return service:list(request)
        end
        for _, boundary in ipairs({"funcs", "contract"}) do
            for index, case in ipairs(cases) do
                test.it(boundary .. " preserves refusal metadata " .. index, function()
                    local result, call_err = call(boundary, case.request)
                    test.is_nil(call_err)
                    test.is_false(result.success)
                    local err = envelope.error_of(result, "list")
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "component_list_invalid")
                    test.eq(err:details().field, case.field)
                end)
            end
            test.it(boundary .. " retains optional/default listing behavior", function()
                for _, request in ipairs({{}, {pagination = {limit = 1, offset = 0}},
                    {ordering = {field = "updated_at", direction = "ASC"}}}) do
                    local result, err = call(boundary, request)
                    test.is_nil(err)
                    test.is_true(result.success)
                    test.eq(result.total_count, 0)
                    test.eq(#result.components, 0)
                    test.is_false(result.has_more)
                end
            end)
        end
        test.it("funcs rejects a non-table request with native metadata", function()
            local result, call_err = call("funcs", "invalid")
            test.is_nil(call_err)
            local err = envelope.error_of(result, "list")
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "component_list_invalid")
            test.eq(err:details().field, "request")
        end)
    end)
end

return {run = test.run_cases(define_tests)}
