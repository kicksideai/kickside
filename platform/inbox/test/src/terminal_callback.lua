-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local writer = require("inbox_writer")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local time = require("time")

local function run(input: any): (any?, any?)
    local item = input.item
    if item.metadata.race then
        local db = assert(sql.get("app:db"))
        assert(db:execute("INSERT INTO inbox_resolution_callbacks (resolution_id, resolver) VALUES ($1, $2)",
            { input.resolution_id, security.actor():id() }))
        db:release()
        local arrived = false
        for _ = 1, 1000 do
            db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT COUNT(*) AS n FROM inbox_resolution_callbacks WHERE resolution_id=$1", { input.resolution_id }))
            db:release()
            if tonumber(rows[1].n) == 2 then arrived = true; break end
            time.sleep("10ms")
        end
        assert(arrived, "both humans must reach the callback before either commits")
    elseif item.metadata.sender_write then
        local params = { item_type = item.item_type, recipient = item.recipient,
            source_id = item.source_id, aggregate_key = item.aggregate_key,
            idempotency_key = item.id .. ":callback", title = "Sender snapshot",
            metadata = item.metadata }
        local result, err
        if item.metadata.sender_write == "close" then result, err = writer.resolve_aggregate(params)
        else result, err = writer.create(params) end
        if err then return nil, err end
        assert(result.id == item.id)
        if item.metadata.catchup then
            local _, catchup_err = funcs.call("app:inbox_catchup_probe", {})
            if catchup_err then return nil, catchup_err end
        end
    end
    return { ok = true }, nil
end
return { run = run }
