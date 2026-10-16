local M: any = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.owner_updates, M.owner_inserts, M.grants, M.identity_writes, M.audits = stage, source, 0, 0, 0, 0, 0
    M.owner_missing, M.missing_encoding = false, false
end
function M.query(...) return {}, M.stage == "grants" and M.source or nil end
function M.lock_and_read_identity_tx(...) return {context = {}, generation = 2}, nil end
function M.owner(...) return nil, nil end
function M.grant_access(...) M.grants = M.grants + 1; return {}, nil end
function M.canonical_identity(...) return "identity-hash" end
function M.check_row(...) return nil end
function M.write_identity_tx(...) M.identity_writes = M.identity_writes + 1; return true, nil end
function M.audit_row_tx(...) M.audits = M.audits + 1; return nil end
return M
