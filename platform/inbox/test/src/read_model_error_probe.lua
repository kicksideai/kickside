local events = require("events_subject")
local context = require("context")
local function run(input: any): any
    context.mode = input.mode
    context.failure = errors.new({ kind = errors.UNAVAILABLE, message = "read-model unavailable", retryable = true })
    local _, err = events.reduce()
    return { typed = errors.is(err, errors.UNAVAILABLE), same = err == context.failure }
end
return { run = run }
