local http = require("http")
local security = require("security")
local registry = require("registry")
local cloudstorage = require("cloudstorage")
local uuid = require("uuid")
local backend = require("backend")
local env = require("env")
local contract = require("contract")
local funcs = require("funcs")
local policy = require("policy")
local resources = require("uploads_resources")
local M = {}

function M.configure(): any
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "HTTP context required" end
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.settings.api:put_settings.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        return res:write_json({ success = false, error = "Settings administrator access required" })
    end
    local reset = req:method() == "DELETE"
    local body, body_err
    if not reset then body, body_err = req:body_json() end
    local checked = reset and { valid = true } or policy.validate({ value = body })
    if body_err or not checked.valid then
        res:set_status(http.STATUS.BAD_REQUEST)
        return res:write_json({ success = false, error = checked.error or "Storage policy required" })
    end
    local definition, contract_err = contract.get("kickside.settings:settings")
    if contract_err or not definition then return nil, contract_err or "Settings unavailable" end
    local settings, open_err = definition:open()
    if open_err or not settings then return nil, open_err or "Settings unavailable" end
    local args = { namespace = "kickside.uploads.storage", key = "policy", value = body }
    local saved, save_err
    if reset then saved, save_err = settings:unset(args) else saved, save_err = settings:set(args) end
    if save_err or not saved or saved.success ~= true then
        res:set_status(http.STATUS.BAD_REQUEST)
        return res:write_json({ success = false, error = "Storage settings could not be saved" })
    end
    local applied, apply_err = funcs.call("kickside.uploads.storage.service:request", {})
    if apply_err or not applied or applied.success ~= true then
        res:set_status(503)
        return res:write_json({ success = false, saved = true, error = "Settings were saved, but the storage service could not apply them yet" })
    end
    return res:write_json({ success = true })
end

function M.handle(): any
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "HTTP context required" end
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.settings.api:put_settings.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        return res:write_json({ success = false, error = "Settings administrator access required" })
    end
    if req:method() == "GET" then
        local configured = env.get("kickside.uploads.env:storage_s3")
        local entry, find_err
        if configured and configured ~= "" then entry, find_err = registry.get(configured) end
        local entries = entry and entry.kind == "cloudstorage.s3" and { entry } or {}
        if find_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            return res:write_json({ success = false, error = "Could not discover storage resources" })
        end
        local choices = {}
        for _, entry in ipairs(entries or {}) do
            choices[#choices + 1] = { id = entry.id, title = type(entry.meta) == "table" and entry.meta.title or entry.id }
        end
        table.sort(choices, function(a, b) return a.id < b.id end)
        return res:write_json({ success = true, resources = choices })
    end
    local body, body_err = req:body_json()
    local checked = policy.validate({ value = body })
    if body_err or not checked.valid or body.mode ~= "s3" then
        res:set_status(http.STATUS.BAD_REQUEST)
        return res:write_json({ success = false, error = checked.error or "S3 policy required" })
    end
    local cloud, cloud_err = cloudstorage.get(body.resource_id)
    if cloud_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        return res:write_json({ success = false, error = "Could not open storage resource" })
    end
    local key = body.prefix .. "/.connection-test-" .. uuid.v4()
    local content = "Kickside private storage check " .. uuid.v4()
    local _, upload_err = cloud:upload_object(key, content, { content_type = "text/plain" })
    local staging, path, staging_err = backend.staging(resources.get_storage_id())
    local file, file_err
    if staging then file, file_err = staging:open(path, "wx") end
    local test_err = upload_err or staging_err or file_err
    if not test_err and file then
        local _, download_err = cloud:download_object(key, file)
        local _, close_err = file:close()
        file = nil
        local actual, read_err = staging:readfile(path)
        test_err = download_err or close_err or read_err or (actual ~= content and "Content verification failed" or nil)
    end
    if file then
        local _, close_err = file:close()
        test_err = test_err or close_err
    end
    if staging and path then
        local _, remove_err = staging:remove(path)
        if remove_err and not errors.is(remove_err, errors.NOT_FOUND) then test_err = test_err or remove_err end
    end
    local _, delete_err = cloud:delete_objects({ key })
    cloud:release()
    if test_err or delete_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        return res:write_json({ success = false, error = delete_err and "Storage cleanup failed; check bucket delete permissions" or "Storage upload/download verification failed" })
    end
    return res:write_json({ success = true })
end

return M
