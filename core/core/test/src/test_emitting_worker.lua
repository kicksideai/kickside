-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local uuid = require("uuid")
local writer = require("writer")

local function run(input: table): table
    local body = input.projection.body
    body.count = (tonumber(body.count) or 0) + #input.events
    local config = body.worker_config or {}
    local events = {}
    for _, event in ipairs(input.events) do
        local emitted: any = {type = "app:threads_note", role = "system", body = {n = event.seq}}
        if config.explicit_identity then
            emitted.id = assert(uuid.v5(input.projection.id, event.id))
        end
        events[#events + 1] = emitted
        if config.concurrent_input_id and event.seq == 1 then
            local db = assert(sql.get("app:db"))
            local _, err = writer.append_system(db, input.thread_id, {{id = config.concurrent_input_id,
                type = "app:threads_skip", role = "system", body_json = "{}"}})
            local _, release_err = db:release()
            assert(not err, tostring(err))
            assert(not release_err, tostring(release_err))
        end
    end
    return {body = body, last_seq = input.range.to_seq,
        append_events = {{thread_id = input.thread_id, events = events}}}
end
return {run = run}
