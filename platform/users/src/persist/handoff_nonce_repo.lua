-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local consts = require("user_consts")
local support = require("user_repo_support")
local M = {}

-- The caller owns the transaction when issuing a session. Recheck the link's
-- deadline after acquiring the unique nonce, since a database lock can wait.
function M.claim_in(db, nonce: string, expires_at: number)
    local now = time.now():unix()
    if expires_at <= now then return false end
    local _, purge_err = db:execute([[DELETE FROM app_user_handoff_nonces WHERE nonce IN (
        SELECT nonce FROM app_user_handoff_nonces WHERE expires_at <= $1 ORDER BY expires_at LIMIT 64
    )]], {now})
    if purge_err then
        return nil, consts.propagate_error(purge_err, consts.ERROR_CODE.DB_OPERATION_FAILED, "handoff nonce purge failed")
    end
    local result, err = db:execute(
        "INSERT INTO app_user_handoff_nonces (nonce, expires_at) VALUES ($1, $2) ON CONFLICT (nonce) DO NOTHING",
        {nonce, expires_at})
    if err then
        return nil, consts.propagate_error(err, consts.ERROR_CODE.DB_OPERATION_FAILED, "handoff nonce write failed")
    end
    return tonumber(result and result.rows_affected) == 1 and expires_at > time.now():unix()
end

-- Signed links for ineligible accounts are spent even though no session is issued.
function M.claim(nonce: string, expires_at: number)
    local db, err = support.get_db()
    if err then return nil, err end
    local fresh, claim_err = M.claim_in(db, nonce, expires_at)
    db:release()
    return fresh, claim_err
end

return M
