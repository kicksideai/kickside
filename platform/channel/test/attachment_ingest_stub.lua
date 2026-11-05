local M = {}
local test_state = require("test_state")

function M.ingest(attachment)
    test_state.state.attachment_ingest_calls[#test_state.state.attachment_ingest_calls + 1] = attachment
    if test_state.state.attachment_ingest_error then return nil, test_state.state.attachment_ingest_error end
    if type(attachment) == "table" and type(attachment.upload_id) == "string" and attachment.upload_id ~= "" then
        return { uuid = attachment.upload_id }, nil
    end
    return nil, "attachment ingest disabled in channel bridge tests"
end

return M
