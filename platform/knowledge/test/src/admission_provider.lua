-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function get_content()
    return { success = true, content = "The reference describes accessible travel.", content_type = "text/plain", title = "Reference" }
end
local function structured_output()
    return { success = true, result = { data = { items = {}, lessons = {}, plans = {} } }, tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 }, finish_reason = "stop" }
end
local function refuse()
    return { success = false, error = "content admission refused" }
end
return { get_content = get_content, structured_output = structured_output, refuse = refuse }
