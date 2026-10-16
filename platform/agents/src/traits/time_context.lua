local time = require("time")

-- Injects the current date and time so the agent can reason about "now", relative
-- dates, and recency. Rounded to the hour so the system prompt stays stable within
-- the LLM prompt-cache window instead of changing on every request.
local function handler(): string
    return "Current date and time: " .. time.now():format("Monday, January 2, 2006, 15:00 MST")
end

return { handler = handler }
