-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local consts = require("user_consts")
local support = require("user_repo_support")
local M = {}

-- Records a nonce once. Returns true when it was unused, false when it was already used.
function M.claim(nonce: string, expires_at: number, now: number)
    local db, err = support.get_db()
    if err then return nil, err end
    local _, purge_err = db:execute("DELETE FROM app_user_handoff_nonces WHERE expires_at < $1", {now})
    if purge_err then
        db:release()
        return nil, consts.propagate_error(purge_err, consts.ERROR_CODE.DB_OPERATION_FAILED, "handoff nonce purge failed")
    end
    local result, insert_err = db:execute(
        "INSERT INTO app_user_handoff_nonces (nonce, expires_at) VALUES ($1, $2) ON CONFLICT (nonce) DO NOTHING",
        {nonce, expires_at})
    db:release()
    if insert_err then
        return nil, consts.propagate_error(insert_err, consts.ERROR_CODE.DB_OPERATION_FAILED, "handoff nonce write failed")
    end
    return tonumber(result and result.rows_affected) == 1
end

return M
