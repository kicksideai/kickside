-- The sole registry-overlay writer. Durable settings and destination records
-- are authoritative; native resource instances are reconstructed at cold boot.
local registry = require("registry")
local hash = require("hash")
local policy = require("policy")
local locations = require("locations")
local resources = require("uploads_resources")
local canonical = require("canonical_json")
local M = {}
local OWNER = "kickside.uploads.storage.service:controller"
local RUNTIME_NS = "kickside.uploads.storage.runtime"

function M.reconcile(): (any?, any?)
    local configured, policy_err = policy.get()
    if policy_err then return nil, policy_err end
    local effective = { mode = configured.mode, resource_id = "", prefix = configured.prefix }
    local db_id = resources.get_db_id()
    if configured.mode == "s3" then
        local source, source_err = registry.get(configured.resource_id)
        if source_err or not source or source.kind ~= "cloudstorage.s3" then return nil, source_err or "S3 source unavailable" end
        local data = source.data
        if type(data) ~= "table" or type(data.config) ~= "string" or type(data.bucket) ~= "string" then
            return nil, "Native S3 source has no bucket/config"
        end
        -- Destination identity includes its bucket, endpoint, and credential
        -- provider reference. Editing the host source creates a new destination;
        -- existing files retain the resource generation that owns their bytes.
        local native = { bucket = data.bucket, config = data.config, endpoint = data.endpoint or "" }
        local encoded, encode_err = canonical.encode(native)
        if encode_err then return nil, encode_err end
        local digest, digest_err = hash.sha256(encoded)
        if digest_err then return nil, digest_err end
        local id = RUNTIME_NS .. ":s3_" .. digest
        local _, save_err = locations.remember_destination(db_id, id, native)
        if save_err then return nil, save_err end
        effective.resource_id = id
    end
    local destinations, destinations_err = locations.destinations(db_id)
    if destinations_err then return nil, destinations_err end
    local desired = {}
    for _, row in ipairs(destinations) do
        desired[row.resource_id] = {
            id = row.resource_id, kind = "cloudstorage.s3",
            meta = { private = true },
            data = { bucket = row.bucket, config = row.config_id, endpoint = row.endpoint },
        }
    end
    local policy_id = RUNTIME_NS .. ":policy"
    desired[policy_id] = { id = policy_id, kind = "registry.entry", meta = { private = true }, data = effective }

    local overlay, open_err = registry.overlay(OWNER)
    if open_err then return nil, open_err end
    local entries, list_err = overlay:entries()
    if list_err then return nil, list_err end
    local existing = {}
    for _, entry in ipairs(entries) do existing[tostring(entry.id)] = entry end
    local changes = overlay:changes()
    local count = 0
    for id, entry in pairs(desired) do
        local previous = existing[id]
        if not previous then
            changes:create(entry)
            count = count + 1
        else
            local before, before_err = canonical.encode({ kind = previous.kind, meta = previous.meta, data = previous.data })
            local after, after_err = canonical.encode({ kind = entry.kind, meta = entry.meta, data = entry.data })
            if before_err or after_err then return nil, before_err or after_err end
            if before ~= after then changes:update(entry); count = count + 1 end
        end
    end
    if count > 0 then
        local _, apply_err = changes:apply()
        if apply_err then return nil, apply_err end
    end
    return { success = true, resources = #destinations, changed = count }, nil
end

return M
