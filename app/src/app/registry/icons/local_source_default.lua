local sql = require("sql")

-- KickSide serves icons from its own server by default (EE2-2845). wippy/cdn keeps the public
-- Iconify API as the source until a source choice is saved, so this boot step saves "This server"
-- for the Iconify adapter. It never replaces a saved choice, so an administrator can still switch
-- back to the Internet. The table is the source preference store documented by wippy/cdn.
local DATABASE = "app:db"
local MODULE_ID = "wippy.cdn.iconify"

local M = {}

function M.run()
    local db, err = sql.get(DATABASE)
    if err or not db then
        return { status = "error", message = "icon source default skipped: " .. tostring(err) }
    end
    local _, create_err = db:execute([[
        CREATE TABLE IF NOT EXISTS app_cdn_source_preferences (
            module_id TEXT PRIMARY KEY NOT NULL,
            selection TEXT NOT NULL
        )
    ]], {})
    if create_err then
        db:release()
        return { status = "error", message = "icon source default skipped: " .. tostring(create_err) }
    end
    local _, insert_err = db:execute(
        "INSERT INTO app_cdn_source_preferences (module_id, selection) VALUES ($1, $2)"
            .. " ON CONFLICT (module_id) DO NOTHING",
        { MODULE_ID, "this_server" })
    db:release()
    if insert_err then
        return { status = "error", message = "icon source default skipped: " .. tostring(insert_err) }
    end
    return { status = "success", message = "icon source default is this server unless a choice was saved" }
end

return M
