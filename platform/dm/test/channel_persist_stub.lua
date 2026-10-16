local test_state = require("test_state")

local M = {}

function M.clear(db_id: string, table_name: string, provider: string, external_id: string,
    admission: any?): (string?, any?)
    test_state.set_clear({ db_id = db_id, table_name = table_name, provider = provider,
        external_id = external_id, admission = admission })
    if test_state.clear_error() then return nil, test_state.clear_error() end
    return "rotated-session", nil
end

return M
