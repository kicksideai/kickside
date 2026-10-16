local test = require("test")
local funcs = require("funcs")
local security = require("security")

return { run = test.run_cases(function()
    test.describe("Uploads listing failures", function()
        local function exercise(stage: string, failure: any, status: integer, kind: string?): ()
            local actor = security.new_actor("upload-list-errors", { security_groups = { "app:uploads_test" } })
            local result, err = funcs.new():with_actor(actor):with_scope(security.named_scope("wippy.security:process"))
                :with_context({ listing_stage = stage, listing_failure = tostring(failure), listing_kind = kind }):call("app:upload_list_error_probe", {})
            test.is_nil(err)
            test.eq(result.status, status)
            test.eq(result.body.success, false)
            test.eq(result.body.error, stage == "count" and "Failed to count uploads" or "Failed to list uploads")
            test.eq(result.body.details, tostring(failure))
            test.is_nil(result.body.uploads)
            test.is_nil(result.body.meta)
            test.eq(result.list_called, stage == "list")
        end
        for _, stage in ipairs({ "count", "list" }) do
            for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
                { errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
                { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
                { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
                test.it(stage .. " preserves typed " .. row[1] .. " refusal", function()
                    exercise(stage, errors.new({ kind = row[1], message = "opaque listing failure" }), row[2], row[1])
                end)
            end
            test.it(stage .. " treats plain misleading failure text as internal", function()
                exercise(stage, "not_found permission denied", 500)
            end)
        end
    end)
end) }
