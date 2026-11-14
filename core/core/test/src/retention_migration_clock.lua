-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
return {now=function(dialect)
    return dialect == sql.type.POSTGRES and "2026-01-01T00:00:00.500000Z" or "2026-01-01 00:00:00.500000"
end}
