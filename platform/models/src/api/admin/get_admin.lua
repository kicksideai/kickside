local http = require("http")
local models_repo = require("models_repo")
local provider_read_model = require("provider_read_model")
local model_catalog = require("model_catalog")

local function handler()
    local res = http.response()
    if not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")
    -- Rebuild the snapshot from the DB on every admin load so the surface always
    -- reflects current rows -- including out-of-band edits made straight in the
    -- database (the store.memory cache is otherwise only refreshed by the app's
    -- own writes or at boot).
    local _, reload_err = models_repo.reload()
    if reload_err then return nil, reload_err end
    local profiles, profile_err = models_repo.list_profiles_public()
    if profile_err then return nil, profile_err end
    local models, model_err = model_catalog.get_all_public()
    if model_err then return nil, model_err end
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        adapters = provider_read_model.adapters(),
        presets = provider_read_model.presets(),
        profiles = profiles,
        models = models,
    })
end

return { handler = handler }
