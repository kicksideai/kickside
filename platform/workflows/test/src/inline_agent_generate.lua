-- Deterministic local LLM fixture for the inline-agent dataflow proof. It only
-- returns a typed Finish call when the compiler-lowered arena prompt reaches the
-- model conversation, so the harness verifies instructions rather than merely
-- accepting a successful agent run.

local function message_text(message: any): string
    local content = type(message) == "table" and message.content or nil
    if type(content) == "string" then return content end
    local parts = type(content) == "table" and content or {}
    local out = {}
    for _, part in ipairs(parts) do
        if type(part) == "table" and type(part.text) == "string" then
            out[#out + 1] = part.text
        elseif type(part) == "string" then
            out[#out + 1] = part
        end
    end
    return table.concat(out, "\n")
end

local function handler(args: any): any
    local seen = false
    for _, message in ipairs(type(args) == "table" and args.messages or {}) do
        if message_text(message):find("INLINE_AGENT_INSTRUCTIONS", 1, true) then
            seen = true
            break
        end
    end
    return {
        success = true,
        result = {
            content = "inline agent fixture",
            tool_calls = {
                {
                    id = "inline-agent-finish",
                    name = "finish",
                    arguments = { greeting = seen and "instructions honored" or "instructions missing" },
                },
            },
            finish_reason = "tool_call",
            tokens = { prompt_tokens = 1, completion_tokens = 1, thinking_tokens = 0, total_tokens = 2 },
            metadata = {},
        },
    }
end

return { handler = handler }
