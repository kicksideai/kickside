local M = {}

M.source_error = errors.new({ kind = errors.UNAVAILABLE, message = "source catalog unavailable" })
M.sink_error = errors.new({ kind = errors.UNAVAILABLE, message = "sink catalog unavailable" })

function M.list_sources() return nil, M.source_error end
function M.list_sinks() return nil, M.sink_error end

function M.health()
    return {
        degraded_drives = 7,
        uncertain_items = 3,
        delivery_failures = {
            { automation_id = "example:bravo", count = 2, last_error = { code = "DELIVERY_FAILED", message = string.rep("b", 4096) } },
            { automation_id = "example:alpha", count = 4, last_error = { code = "DELIVERY_FAILED", message = string.rep("a", 4096) } },
        },
    }
end

function M.status()
    return {
        drives = { { drive_key = "main", phase = "running" } },
        commands = { generation = 8 },
        ledger_counts = { unresolved = 1, uncertain = 2 },
        delivery_failures = { count = 4, last_error = { code = "DELIVERY_FAILED", message = string.rep("s", 4096) } },
        next_page_token = "next-drives",
        extension = { provider = { nested = { value = "preserved" } } },
    }
end

return M
