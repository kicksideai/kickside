local http = require("http")
local sql = require("sql")
local uuid = require("uuid")

local M = {}

local function respond(value)
    local res = assert(http.response())
    res:set_content_type(http.CONTENT.JSON)
    res:write_json(value)
end

function M.seed()
    local db = assert(sql.get("app:db"))
    local slug = "native_catalog_" .. uuid.v7():gsub("-", "")
    local raw = assert(http.request()):query("policies")
    local _, err = db:execute([[INSERT INTO kickside_security_scopes
        (slug,label,description,policies,target,internal,enabled,created_at,updated_at)
        VALUES ($1,'','',$2,'','0','1','before','before')]], {slug, raw})
    db:release()
    if err then return nil, err end
    respond({success = true, slug = slug})
end

function M.read()
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT policies,updated_at FROM kickside_security_scopes WHERE slug=$1",
        {assert(http.request()):query("slug")})
    db:release()
    if err then return nil, err end
    respond({success = true, rows = rows})
end

function M.clear()
    local db = assert(sql.get("app:db"))
    local _, err = db:execute("DELETE FROM kickside_security_scopes WHERE slug=$1",
        {assert(http.request()):query("slug")})
    db:release()
    if err then return nil, err end
    respond({success = true})
end

return M
