local component = require("component")

local function run(input: any): (any?, any?)
    local component_id = type(input.thread_id) == "string" and input.thread_id or ""
    if component_id == "" then return {}, nil end
    local counts = input.counts
    local fields: { [string]: any } = {
        status = counts.pending_count > 0 and "processing" or "ready",
        file_count = counts.file_count,
        pending_count = counts.pending_count,
        total_bytes = counts.total_bytes,
        last_completed_at = counts.last_completed_at,
        last_upload_id = counts.last_upload_id,
    }
    local seq = type(input.range) == "table" and tonumber(input.range.to_seq) or nil
    if seq then fields.last_event_seq = seq end
    local component_api = type(input.component) == "table" and input.component or component
    local ok, err = component_api.set_meta(component_id, fields, { trusted_runtime = true })
    if not ok then
        return nil, err or errors.new({ message = "component metadata write returns no result", kind = errors.INTERNAL })
    end
    return {}, nil
end

return { run = run }
