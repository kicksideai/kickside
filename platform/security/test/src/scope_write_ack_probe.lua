local scopes = require("scopes")
local function run(args)
    if not args.reader_failure then return scopes.upsert(args, "native-ack-actor") end
    local original = scopes.get
    scopes.get = function()
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "acknowledgement reader unavailable", details = {code = "ack_reader", nested = {marker = "retained"}, cause = {marker = "original cause"}}})
    end
    local ok, row, err = pcall(scopes.upsert, args, "native-ack-actor")
    scopes.get = original
    if not ok then error(row) end
    return row, err
end
return {run = run}
