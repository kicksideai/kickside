local test = require("test")
local api = require("api")
local http = require("http")
local M = {}
M.run = test.run_cases(function()
    test.describe("component public read transport", function()
        for _, authenticated in ipairs({false, true}) do
            test.it("retains authorized get semantics/" .. tostring(authenticated), function()
                local body: any = nil
                local status: any = nil
                local calls = 0
                local source = {success = true, component_id = "component", deleting_at = "marked",
                    deletion_job_id = "job", deletion_job = {status = "dead", attempts = 1, last_error = "refused"}}
                local handler = api.new({
                    http = {CONTENT = http.CONTENT, STATUS = http.STATUS,
                        request = function() return {param = function() return "component" end} end,
                        response = function() return {
                            set_content_type = function() end, set_header = function() end,
                            set_status = function(_, value) status = value end,
                            write_json = function(_, value) body = value end,
                        } end},
                    security = {actor = function() return authenticated and {} or nil end},
                    component = {get_service = function() return {get = function(_, request)
                        calls = calls + 1; test.eq(request.component_id, "component"); return source
                    end} end},
                })
                handler.handler()
                test.eq(status, authenticated and http.STATUS.OK or http.STATUS.UNAUTHORIZED)
                test.eq(calls, authenticated and 1 or 0)
                if authenticated then test.eq(body, source) else test.is_false(body.success) end
            end)
        end
    end)
end)
return M
