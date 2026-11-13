-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function run(input: table): table
    local body = input.projection.body
    body.count = (tonumber(body.count) or 0) + #input.events
    local events = {}
    for _, event in ipairs(input.events) do
        events[#events + 1] = {type = "app:threads_note", role = "system", body = {n = event.seq}}
    end
    return {body = body, last_seq = input.range.to_seq,
        append_events = {{thread_id = input.thread_id, events = events}}}
end
return {run = run}
