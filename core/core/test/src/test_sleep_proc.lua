-- Test-only proc:// projection worker that sleeps a configurable interval before
-- returning a body patch. A short sleep exits cleanly (legitimate long work); a
-- long sleep lets the supervisor reap it on the max_execution ceiling / cancel /
-- lease loss, proving a hung projection worker can never pin a runner.

local time = require("time")

local function run(input: any): any
    input = type(input) == "table" and input or {}
    local sleep_ms = math.floor(tonumber(input.sleep_ms) or 0)
    if sleep_ms > 0 then
        time.sleep(tostring(sleep_ms) .. "ms")
    end
    return { body = { slept = true, sleep_ms = sleep_ms } }
end

return { run = run }
