local test = require("test")
local reader = require("reader")
local get_api = require("get_api")
local http = require("http_fixture")
local security = require("security_fixture")
local funcs = require("funcs_fixture")
local component = require("component_fixture")
local http_errors = require("http_errors")

-- The component service envelope for a component its deletion job removed after
-- the access gate admitted the read.
local GONE = { success = false, error = "Component not found or access denied", kind = errors.PERMISSION_DENIED }

return { run = test.run_cases(function()
    test.describe("Skill read of a component removed after the access gate", function()
        test.it("keeps the component service refusal kind", function()
            component.configure({ get = function(request)
                test.eq(request.component_id, "skill")
                return GONE, nil
            end })
            local result, err = reader.get({ skill_id = "skill" })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.eq((http_errors.classify(err)), 403)
        end)

        test.it("answers GET /skills/{id} with 403", function()
            local captured: any = {}
            component.configure({ get = function() return GONE, nil end })
            http.configure({
                request = function() return {
                    param = function() return "skill" end,
                    query = function() return nil end,
                } end,
                response = function() return {
                    set_content_type = function() end,
                    set_status = function(_, status) captured.status = status end,
                    write_json = function(_, body) captured.body = body end,
                } end,
            })
            security.configure({ actor = function() return {} end })
            funcs.configure({ call = function(id, args)
                test.eq(id, "kickside.skills:skill_get")
                return reader.get(args)
            end })
            get_api.handler()
            test.eq(captured.status, 403)
            test.is_false(captured.body.success)
        end)
    end)
end) }
