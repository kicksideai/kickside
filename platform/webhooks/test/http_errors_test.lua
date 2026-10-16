local test = require("test")
local update_api = require("update_api")
local revoke_api = require("revoke_api")
local delete_api = require("delete_api")
local list_api = require("list_api")

return test.run_cases(function()
    test.describe("Webhook management HTTP errors", function()
        test.it("forwards native list controls and returns continuation in the existing envelope", function()
            local captured: any = {}
            local endpoint = list_api.new({
                security = { actor = function() return {} end },
                http = {
                    CONTENT = { JSON = "application/json" }, STATUS = { OK = 200 },
                    request = function() return { query = function(_self: any, key: string)
                        return ({ limit = "7", cursor = "previous" })[key]
                    end } end,
                    response = function() return {
                        set_content_type = function() end, set_status = function() end,
                        write_json = function(_self: any, body: any) captured.body = body end,
                    } end,
                },
                repo = { list = function(options: any)
                    captured.options = options
                    return { { webhook_id = "id" } }, nil, "next"
                end },
            })
            endpoint.handler()
            test.eq(captured.options.limit, "7")
            test.eq(captured.options.cursor, "previous")
            test.eq(captured.body.next_cursor, "next")
            test.eq(captured.body.webhooks[1].webhook_id, "id")
        end)
        for _, operation in ipairs({ "update", "revoke", "delete", "list" }) do
            for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 },
                { errors.NOT_FOUND, 404 }, { errors.CONFLICT, 409 }, { errors.UNAVAILABLE, 503 },
                { errors.INTERNAL, 500 } }) do
                test.it(operation .. " classifies " .. row[1] .. " from its repository", function()
                    local failure = errors.new({ kind = row[1], message = "opaque",
                        details = { code = "webhook_in_use", subscriber_count = 2 } })
                    local captured: any = {}
                    local calls = 0
                    local repository = {}
                    repository[operation] = function()
                        calls = calls + 1
                        return nil, failure
                    end
                    local endpoints = { update = update_api, revoke = revoke_api, delete = delete_api, list = list_api }
                    local api = endpoints[operation].new({
                        http = {
                            CONTENT = { JSON = "application/json" },
                            STATUS = { OK = 200, UNAUTHORIZED = 401, BAD_REQUEST = 400 },
                            request = function() return { query = function() return nil end, param = function() return "webhook" end,
                                body = function() return "{}" end } end,
                            response = function() return {
                                set_content_type = function() end,
                                set_status = function(_self: any, status: any) captured.status = status end,
                                write_json = function(_self: any, body: any) captured.body = body end,
                            } end,
                        },
                        security = { actor = function() return {} end },
                        repo = repository,
                    })
                    api.handler()
                    test.eq(calls, 1)
                    test.eq(captured.status, row[2])
                    test.eq(captured.body.success, false)
                    test.eq(captured.body.error, tostring(failure))
                    if operation == "delete" and row[1] == errors.CONFLICT then
                        test.eq(captured.body.code, "webhook_in_use")
                        test.eq(captured.body.subscriber_count, 2)
                    end
                end)
            end
        end
    end)
end)
