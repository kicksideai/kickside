-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local json = require("json")
local security = require("security")
local M = {}
function M.notify(input: any): any
    local db = assert(sql.get("app:db"))
    assert(db:execute("CREATE TABLE IF NOT EXISTS inbox_notifications (request TEXT NOT NULL, authorized TEXT NOT NULL)"))
    local authorized = input.topic ~= "inbox.changed" or security.can("realtime.notify", "kickside.realtime:notify") == true
    assert(db:execute("INSERT INTO inbox_notifications (request, authorized) VALUES ($1, $2)",
        { assert(json.encode(input)), authorized and "yes" or "no" }))
    db:release()
    if not authorized or tostring(input.user_id):match("^notify%-fail%-") then return { success = false } end
    return { success = true }
end
return M
