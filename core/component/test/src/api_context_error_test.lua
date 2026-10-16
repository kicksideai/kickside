local test = require("test")
local access_model = require("access_model")
local list_access = require("list_access")
local share_component = require("share_component")
local adopt_component = require("adopt_component")

local function without_http_context()
    return {
        response = function() return nil end,
        request = function() return nil end,
    }
end

local function assert_context_error(adapter)
    local _, err = adapter.new({ http = without_http_context() }).handler()
    test.is_true(errors.is(err, errors.INTERNAL))
    test.eq(err:message(), "no http context")
    test.eq(err:retryable(), false)
    test.eq(err:details().code, "HTTP_CONTEXT_UNAVAILABLE")
end

local function share_response(raw: string): (integer?, any?)
    local status, body
    local instance = share_component.new({
        http = {
            request = function() return {
                param = function() return "component-id" end,
                body = function() return raw end,
            } end,
            response = function() return {
                set_content_type = function() end,
                set_status = function(_, value) status = value end,
                write_json = function(_, value) body = value end,
            } end,
            CONTENT = { JSON = "application/json" },
            STATUS = { BAD_REQUEST = 400 },
        },
        security = { actor = function() return { id = function() return "user-id" end } end },
    })
    instance.handler()
    return status, body
end

return { run = test.run_cases(function()
    test.describe("component HTTP context", function()
        test.it("returns a non-retryable native error when a handler has no HTTP context", function()
            for _, adapter in ipairs({ access_model, list_access, share_component, adopt_component }) do
                assert_context_error(adapter)
            end
        end)
        test.it("keeps native access-policy validation messages in the HTTP response shape", function()
            local missing_type_status, missing_type = share_response('{"subject_id":"user-id"}')
            test.eq(missing_type_status, 400)
            test.eq(missing_type.error, "subject_type is required: one of user, group, service")
            test.eq(missing_type.kind, errors.INVALID)
            test.is_false(missing_type.retryable)
            test.eq(missing_type.details.code, "component_access_invalid")

            local mask_status, mask = share_response('{"subject_id":"user-id","subject_type":"user","access_mask":"1"}')
            test.eq(mask_status, 400)
            test.eq(mask.error, "access_mask must be an integer between 0 and 15")
            test.eq(mask.kind, errors.INVALID)
            test.is_false(mask.retryable)
            test.eq(mask.details.code, "component_access_invalid")
        end)
    end)
end) }
