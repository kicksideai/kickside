-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local threads_writer = require("threads_writer")
local retention_pin = require("retention_pin")

return require("migration").define(function()
    migration("12 blocked projection pins", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, checkpoint)
                    local page, page_err = tx:query("SELECT id,thread_id FROM kickside_projection_cursor "
                        .. (checkpoint and "WHERE id > $1 " or "") .. "ORDER BY id LIMIT 200",
                        checkpoint and {checkpoint} or {})
                    if page_err then error(page_err) end
                    if #page == 0 then return nil end
                    local ids, threads, marks = {}, {}, {}
                    for index, row in ipairs(page) do
                        ids[#ids + 1] = row.id
                        threads[#threads + 1] = row.thread_id
                        marks[#marks + 1] = "$" .. tostring(index)
                    end
                    local locked, lock_err = threads_writer.lock_thread_rows_tx(tx,
                        dialect == "postgres" and sql.type.POSTGRES or sql.type.SQLITE, threads)
                    if lock_err then error(lock_err) end
                    local rows, read_err = tx:query([[SELECT c.id,c.thread_id,c.last_seq,c.generation
                        FROM kickside_projection_cursor c
                        LEFT JOIN kickside_retention_pin p ON p.thread_id=c.thread_id AND p.consumer_key='projection:' || c.id
                        WHERE c.id IN (]] .. table.concat(marks, ",") .. ") AND c.status='invalid' AND p.consumer_key IS NULL ORDER BY c.id", ids)
                    if read_err then error(read_err) end
                    for _, row in ipairs(rows) do
                        local thread = locked[tostring(row.thread_id)]
                        if thread and thread.deleting_at == nil then
                            -- Retain the surviving tail without advancing a cursor past lost input.
                            local target = math.max(tonumber(row.last_seq) :: number, tonumber(thread.max_pruned_seq) :: number)
                            local _, pin_err = retention_pin.lower_tx(tx, {thread_id = row.thread_id,
                                consumer_key = "projection:" .. tostring(row.id),
                                command_id = tostring(row.id) .. ":" .. tostring(row.generation),
                                command_generation = tonumber(row.generation), target_cursor = target})
                            if pin_err then error(pin_err) end
                        end
                    end
                    if #page < 200 then return nil end
                    return tostring(page[#page].id)
                end, "batch")
            end)
        end
    end)
end)
