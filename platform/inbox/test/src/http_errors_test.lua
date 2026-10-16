local test = require("test")
local context = require("context")
local mutation = require("mutation")
local delete = require("delete_handler")
local resolve = require("resolve_handler")
return { run = test.run_cases(function()
    test.describe("Inbox typed HTTP failures", function()
        for _, handler in ipairs({ { name = "delete", subject = delete }, { name = "resolve", subject = resolve } }) do
            for _, case in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 },
                { errors.NOT_FOUND, 404 }, { errors.CONFLICT, 409 }, { errors.UNAVAILABLE, 503 },
                { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.INTERNAL, 500 } }) do
                test.it(handler.name .. " answers typed " .. case[1], function()
                    mutation.failure = errors.new({ message = "injected typed failure", kind = case[1], retryable = false })
                    context.status, context.output = nil, nil
                    handler.subject.handler()
                    test.eq(context.status, case[2])
                    test.is_false(context.output.success)
                    test.contains(context.output.error, "injected typed failure")
                end)
            end
        end
    end)
end) }
