-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

-- Seams for the kb_ingest fetch_url fixture: the HTTP origin, the KB access
-- gate and the extraction model. Each case installs its own behaviour.
local M = {}

M.ACCESS = { READ = "read", WRITE = "write" }

function M.get(): (any?, string?)
    return nil, "fetch stub was not configured"
end

function M.open(): (any?, string?)
    return {}, nil
end

function M.generate(): (any?, string?)
    return nil, "extraction stub was not configured"
end

return M
