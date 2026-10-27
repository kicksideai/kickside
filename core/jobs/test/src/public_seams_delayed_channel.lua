local channel = require("channel")
local selects = 0

-- Exercise the public seam test under the legal schedule where the wake is
-- still in transit at the second nonblocking select. A bounded receive can
-- observe delivery; an immediate default cannot establish delivery failure.
local function select(cases: table): any
    selects = selects + 1
    if selects == 2 and cases.default then return { default = true } end
    return channel.select(cases)
end

return { select = select }
