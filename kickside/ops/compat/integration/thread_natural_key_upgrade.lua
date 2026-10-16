local http = require("http")
local json = require("json")
local contract = require("contract")
local security = require("security")

local function handler()
    local req,res = http.request(),http.response()
    res:set_content_type(http.CONTENT.JSON)
    local args,decode_err = json.decode(req:body())
    if decode_err then res:set_status(400); res:write_json({error=tostring(decode_err)}); return end
    local threads,load_err = contract.get("kickside.core:threads")
    if load_err then res:set_status(500); res:write_json({error=tostring(load_err)}); return end
    local instance,open_err = threads:with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err then res:set_status(500); res:write_json({error=tostring(open_err)}); return end
    local result,err = instance:upsert(args)
    if err then res:set_status(500); res:write_json({error=tostring(err)}); return end
    res:write_json(result)
end

return {handler=handler}
