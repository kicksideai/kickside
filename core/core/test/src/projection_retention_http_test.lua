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
        query = function(_, key) return key == "limit" and "1" or nil end,
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
local projection = require("projection")
local retention = require("retention")
local thread_access = require("thread_access")
local projection_read = require("projection_read")
local retention_read = require("retention_read")
local function exercise(adapter, dep_name, failure, status, db_failure)
    local runtime, _, captured = context('{}')
    local released = 0
    local deps = { http = runtime, sql = { get = function()
        if db_failure then return nil, failure end
        return { release = function() released = released + 1; return true, nil end } end },
        thread_access = { WRITE = 2, gate_thread_access = function() return true end } }
    deps[dep_name] = { pause = function() return nil, failure end, upsert = function() return nil, failure end,
        find_by_thread = function() return nil, failure end, list_projections = function() return nil, failure end }
    adapter.new(deps).handler()
    test.eq(captured.status, status)
    test.eq(encode(captured.body), encode({ success = false, error = db_failure and ("db unavailable: " .. tostring(failure)) or tostring(failure),
        kind = type(failure) == "userdata" and failure:kind() or errors.UNKNOWN,
        retryable = type(failure) == "userdata" and failure:retryable() or nil,
        details = type(failure) == "userdata" and failure:details() or nil }))
    test.eq(released, db_failure and 0 or 1)
end
return test.run_cases(function()
    test.describe("Core projection and retention returned failures", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
{ errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
{ errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
{ errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves typed failure " .. row[1], function()
                local failure = errors.new({ kind = row[1], message = "opaque" })
                exercise(projection, "writer", failure, row[2])
                exercise(retention, "repo", failure, row[2])
                exercise(projection_read, "reader", failure, row[2])
                exercise(retention_read, "repo", failure, row[2])
                exercise(projection, "writer", failure, row[2], true)
                exercise(retention, "repo", failure, row[2], true)
                local gate = thread_access.new({ reader = { get_component_id = function() return "component", nil end },
                    component = { has_access = function() return nil, failure end } })
                local allowed, status, message = gate.gate_thread_access({}, "018fa746-bd62-7000-a000-000000000001", 1)
                test.is_false(allowed)
                test.eq(status, row[2])
                test.eq(message, tostring(failure))
            end)
        end
        test.it("renders plain strings without calling error methods", function()
            exercise(projection, "writer", "not_found", 500)
            exercise(retention, "repo", "bad_request", 500)
        end)
    end)
end)
