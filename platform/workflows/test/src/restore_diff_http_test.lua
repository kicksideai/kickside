local test = require("test")
local http = require("http")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
local function context(body: string): (any, any, any)
    local captured = {}
    local request = {
        param = function(_, key) return key == "n" and "1" or "addressed-id" end,
        query = function() return "1" end,
        body = function() return body end,
        body_json = function() return { upload_id = "upload", filename = "file", size = 1 } end,
        is_content_type = function() return true end,
        parse_multipart = function() return { values = {}, files = { file = { {
            name = function() return "file" end, header = function() return "text/plain" end,
            size = function() return 1 end, stream = function() return {} end,
        } } } } end,
    }
    local response = {
        set_content_type = function() end,
        set_status = function(_, value) captured.status = value end,
        write_json = function(_, value) captured.body = value end,
    }
    return { request = function() return request end, response = function() return response end,
        STATUS = http.STATUS, CONTENT = http.CONTENT },
        { actor = function() return { id = function() return "actor" end } end }, captured
end
local exec_api = require("exec_api")
local restore = require("restore")
local repo = require("repo")
local runs_read = require("runs_read")
local runs_launch = require("runs_launch")
local runs_state = require("runs_state")
local definitions_api = require("definitions_api")
local function exercise(adapter, method, failure, status, access)
    local runtime, security, captured = context('{}')
    local deps = { http = runtime, security = security,
        workflow_repo = { ACCESS = { READ = 1, WRITE = 2 }, require_access = function() return access and failure or nil end },
        definitions_api = { restore_version = function() return nil, failure end },
        version_read = { diff = function() return nil, failure end },
    }
    local api = adapter.new(deps)
    api[method]()
    test.eq(captured.status, status)
    local expected = { success = false, error = tostring(failure) }
    if method == "diff_versions" then expected.code = "workflow_failed" end
    test.eq(encode(captured.body), encode(expected))
end
return test.run_cases(function()
    test.describe("Workflow restore, diff and access runtime failures", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
{ errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
{ errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
{ errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves original failure " .. row[1], function()
                local failure = errors.new({ kind = row[1], message = "opaque" })
                exercise(restore, "handler", failure, row[2], false)
                exercise(restore, "handler", failure, row[2], true)
                exercise(exec_api, "diff_versions", failure, row[2], false)
                exercise(exec_api, "diff_versions", failure, row[2], true)
                local original = repo._validate_access
                repo._validate_access = function() return nil, failure end
                local returned = repo.require_access("workflow", 1)
                repo._validate_access = original
                test.eq(returned, failure)
            end)
        end
        test.it("keeps misleading prose internal", function()
            exercise(restore, "handler", "not found", 500, false)
            exercise(exec_api, "diff_versions", "permission denied", 500, false)
        end)
        test.it("preserves launch lookup and draft compilation runtime failures", function()
            local failure = errors.new({ kind = errors.TIMEOUT, message = "opaque", retryable = false })
            local api, private = runs_read.new({
                version_read = { get = function() return nil, failure end },
                version_publish = { compile_working = function() return nil, failure end },
            })
            runs_launch.attach(api, private)
            local _, err = api.launch("workflow", { version = 1 })
            test.eq(err, failure)
            local _, draft_err = api.simulate("workflow", {})
            test.eq(draft_err, failure)
        end)
        test.it("preserves thread dispatch runtime failures", function()
            local failure = errors.new({ kind = errors.RATE_LIMITED, message = "opaque" })
            local _, private = runs_state.new({ security_actor = function() return { id = function() return "actor" end } end,
                security_scope = function() return {} end, threads_contract = function() return nil, failure end })
            local _, err = private.append_event("workflow", {})
            test.eq(err, failure)
        end)
        test.it("classifies export runtime refusals without scanning prose", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "opaque" })
            local runtime, security, captured = context('{}')
            definitions_api.new({ http = runtime, security = security, repo = {
                ACCESS = { READ = 1 }, require_access = function() return failure end,
            } }).export_handler()
            test.eq(captured.status, 503)
            test.eq(encode(captured.body), encode({ success = false, error = "opaque" }))
        end)
    end)
end)
