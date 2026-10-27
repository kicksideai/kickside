local sql = require("sql")
local env = require("env")
local cloudstorage = require("cloudstorage")
local backend = require("storage_backend")
local registry = require("registry")

local ENV = table.freeze({
    DATABASE = "kickside.uploads.env:database_resource",
    STORAGE = "kickside.uploads.env:storage_id",
    STORAGE_S3 = "kickside.uploads.env:storage_s3",
})

local resources = {}

function resources.get_db_id(): string
    return select(1, env.get(ENV.DATABASE)) :: string
end

function resources.get_db(): (sql.DB?, string?)
    local id = resources.get_db_id()
    local db, err = sql.get(id)
    if err then
        return nil, "Failed to connect to database: " .. err
    end
    return db
end

function resources.get_storage_id(storage_id)
    if storage_id and storage_id ~= "" then
        return storage_id
    end

    return select(1, env.get(ENV.STORAGE)) :: string
end

function resources.get_storage(storage_id: string?, query_db: any?)
    local resolved_id = resources.get_storage_id(storage_id)
    return backend.get(resolved_id, resources.get_db_id(), resources.get_storage_id(),
        select(1, env.get(ENV.STORAGE_S3)), query_db)
end

function resources.storage_entry(storage_id: string): (any?, any?)
    if storage_id == "uploads.s3" then
        storage_id = select(1, env.get(ENV.STORAGE_S3)) :: string
    end
    return registry.get(storage_id)
end

function resources.get_s3_id()
    return select(1, env.get(ENV.STORAGE_S3))
end

function resources.get_s3()
    local id = resources.get_s3_id()
    if not id or id == "" then
        return nil, "S3 storage is not configured"
    end
    local s3, err = cloudstorage.get(id)
    if err then
        return nil, "Failed to get S3 storage: " .. err
    end
    return s3
end

return resources
