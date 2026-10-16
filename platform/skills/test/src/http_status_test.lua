local test = require("test")
local create_api = require("create_api")
local refine_api = require("refine_api")
local delete_api = require("delete_api")
local get_api = require("get_api")
local versions_api = require("versions_api")
local list_api = require("list_api")
local file_api = require("file_api")
local http = require("http_fixture")
local security = require("security_fixture")
local funcs = require("funcs_fixture")

local function configure(dependencies: any)
    http.configure(dependencies.http)
    security.configure(dependencies.security)
    funcs.configure(dependencies.funcs)
end

return { run = test.run_cases(function()
    test.describe("Skill file HTTP reads", function()
        test.it("dispatches the versioned file read and preserves its bytes and metadata", function()
            local captured: any = {}
            local file = { path = "assets/image.png", encoding = "base64", content = "AP8=", mime_type = "image/png" }
            configure({
                http = {
                    CONTENT = { JSON = "application/json" }, STATUS = { OK = 200 },
                    request = function() return {
                        param = function() return "skill" end,
                        query = function(_, key) return ({ path = file.path, version = "2", format = "base64", max_bytes = "16" })[key] end,
                    } end,
                    response = function() return {
                        set_content_type = function() end,
                        set_status = function(_, value) captured.status = value end,
                        write_json = function(_, value) captured.body = value end,
                    } end,
                },
                security = { actor = function() return {} end },
                funcs = { call = function(id, args)
                    test.eq(id, "kickside.skills:skill_read_file")
                    test.eq(args.skill_id, "skill")
                    test.eq(args.path, file.path)
                    test.eq(args.version, "2")
                    test.eq(args.format, "base64")
                    test.eq(args.max_bytes, 16)
                    return file
                end },
            })
            file_api.handler()
            test.eq(captured.status, 200)
            test.eq(captured.body.success, true)
            test.eq(captured.body.file, file)
        end)
    end)
    test.describe("Skills HTTP error kinds", function()
        for _, api in ipairs({ create_api, refine_api, delete_api, get_api, versions_api, list_api, file_api }) do
            for _, row in ipairs({ { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
                { errors.INVALID, 400 }, { errors.UNAVAILABLE, 503 }, { errors.INTERNAL, 500 } }) do
                test.it("maps function failure " .. row[1] .. " to " .. tostring(row[2]), function()
                    local captured: any = {}
                    local failure = errors.new({ kind = row[1], message = "opaque failure" })
                    configure({
                        http = {
                            CONTENT = { JSON = "application/json" },
                            STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401 },
                            request = function() return {
                                param = function() return "skill" end,
                                query = function() return nil end,
                                body = function() return '{"description":"changed"}' end,
                            } end,
                            response = function() return {
                                set_content_type = function() end,
                                set_status = function(_, status) captured.status = status end,
                                write_json = function(_, body) captured.body = body end,
                            } end,
                        },
                        security = { actor = function() return {} end },
                        funcs = { call = function() return nil, failure end },
                    })
                    api.handler()
                    test.eq(captured.status, row[2])
                    test.eq(captured.body.success, false)
                    test.eq(captured.body.error, tostring(failure))
                end)
            end
        end
    end)
end) }
