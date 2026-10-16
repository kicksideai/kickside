-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ledger = require("ledger")
local drive = require("drive")

return require("migration").define(function()
    migration("13 record delete replay", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(tx)
                    local after_owner, after_drive = "", ""
                    local op = dialect == "postgres" and "envelope_json::jsonb ->> 'op'"
                        or "json_extract(envelope_json, '$.op')"
                    while true do
                        local drives, scan_err = tx:query([[SELECT automation_id,drive_key
                            FROM kickside_automation_drive WHERE sink_port=$1
                            AND (automation_id>$2 OR (automation_id=$2 AND drive_key>$3))
                            ORDER BY automation_id,drive_key LIMIT 100]],
                            { "kickside.crm.sink:crm_records", after_owner, after_drive })
                        if scan_err then error(scan_err) end
                        if #drives == 0 then return end
                        for _, address in ipairs(drives) do
                            local d, read_err = drive.get(tx, address.automation_id, address.drive_key)
                            if read_err then error(read_err) end
                            local reopened = 0
                            while true do
                                local rows, query_err = tx:query("SELECT item_key,identity_key,envelope_json FROM " .. ledger.TABLE
                                    .. " WHERE owner_id=$1 AND source_port=$2 AND state='dead'"
                                    .. " AND error_code='invalid_request' AND error_message LIKE '%input.kind is required%'"
                                    .. " AND " .. op .. "='delete' ORDER BY item_key,identity_key LIMIT 200",
                                    { d.automation_id, ledger.source_port(d) })
                                if query_err then error(query_err) end
                                if #rows == 0 then break end
                                local result, replay_err = ledger.replay_tx(tx, d, rows, drive.utc_now())
                                if replay_err then error(replay_err) end
                                local count = tonumber(result and result.replayed)
                                if count == nil then error("ledger replay returns no count") end
                                reopened = reopened + count
                            end
                            if reopened > 0 then
                                local updated, update_err = drive.update_cas_tx(tx, d.automation_id, d.drive_key, {},
                                    { wake_generation = d.wake_generation + 1 })
                                if update_err then error(update_err) end
                                if not updated then error("replayed drive is missing") end
                            end
                        end
                        local last = drives[#drives]
                        after_owner, after_drive = last.automation_id, last.drive_key
                    end
                end)
            end)
        end
    end)
end)
