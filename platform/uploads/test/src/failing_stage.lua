local M = {}

function M.process(params)
    local meta = type(params) == "table" and type(params.metadata) == "table" and params.metadata or {}
    if meta.fail_stage_test == true then
        return nil, "test unavailable resource: app:failing_stage"
    end
    return { success = true, metadata = meta.stage_metadata }
end

return M
