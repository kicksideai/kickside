-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local scope_store = require("scope_store")
local M = {}
function M.lookup(args)
    local row, err = scope_store.get("source_epoch_scope")
    if err then return nil, err end
    if not row then return nil, errors.new({kind = errors.NOT_FOUND, message = "scope unavailable"}) end
    return {subject_id = args.subject_id, groups = {}, policies = row.policies, meta = args.actor_meta}
end
return M
