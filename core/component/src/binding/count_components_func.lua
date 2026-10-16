-- count_components: the access-filtered count read-port. Shares read_port's
-- scope/gate logic with query_components; ordering/limit are irrelevant to a
-- count so only the filter half is applied.

local read_port = require("read_port")
local envelope = require("envelope")

local function handle(filter)
    local reader, build_err = read_port.build(filter)
    if build_err then
        return envelope.from_error(build_err)
    end

    local count, count_err = reader:count()
    if count_err then
        return envelope.from_error(count_err)
    end

    return { success = true, count = count or 0 }
end

return { handle = handle }
