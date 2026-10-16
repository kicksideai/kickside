local fs = require("fs")
local orchestrator = require("orchestrator")

local M = {}

local BUNDLE_MIME = "application/vnd.kickside.bundle"


local function filename(meta: any): string
    if type(meta) ~= "table" then return "" end
    return tostring(meta.filename or meta.original_name or "")
end

local function is_bundle(params: any, meta: any): boolean
    if type(meta) == "table" and meta.transfer_bundle == true then return true end
    local name = filename(meta):lower()
    if name:match("%.kxb$") then return true end
    return tostring(params.mime_type or "") == BUNDLE_MIME
end

local function parent_id(meta: any): string?
    if type(meta) ~= "table" then return nil end
    local target = meta.target_parent_id
    if type(target) == "string" and target ~= "" then return target end
    return nil
end

local function process(params: any, storage_provider: any, importer: any): any
    params = type(params) == "table" and params or {}
    local meta = type(params.metadata) == "table" and params.metadata or {}
    if meta.transfer_imported == true then
        return { success = true, skipped = "transfer_imported" }
    end
    if not is_bundle(params, meta) then return { success = true } end

    local storage_id = tostring(params.storage_id or "")
    local storage_path = tostring(params.storage_path or "")
    if storage_id == "" or storage_path == "" then
        return nil, "transfer import requires upload storage_id and storage_path"
    end

    local storage, serr = storage_provider(storage_id)
    if not storage then return nil, "transfer import storage: " .. tostring(serr) end

    local result, ierr = importer(storage, storage_path, {
        parent_id = parent_id(meta),
        storage_id = storage_id,
    })
    if not result or result.success ~= true then
        return {
            success = false,
            retriable = false,
            error = "transfer import failed: " .. tostring(ierr or (result and result.error) or "failed"),
        }
    end

    return {
        success = true,
        skipped = "transfer_imported",
        metadata = {
            transfer_imported = true,
            transfer_created = result.created or {},
            transfer_warnings = result.warnings or {},
        },
    }
end

function M.new(storage_provider: any, importer: any): { process: (any) -> any }
    return {
        process = function(params: any): any
            return process(params, storage_provider, importer)
        end,
    }
end

M.process = M.new(fs.get, orchestrator.import_file).process

return M
