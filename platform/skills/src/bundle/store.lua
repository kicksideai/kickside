local fs = require("fs")
local hash = require("hash")
local errors = require("errors")
local skill_storage = require("skill_storage")
local pio = require("portable_io")

local M = {}

local function dir_for(skill_id: string): (string?, error?)
    if type(skill_id) ~= "string" or not skill_id:match("^[%w_-]+$") then
        return nil, errors.new({kind = errors.INVALID, message = "invalid skill_id"})
    end
    return "skill-bundle/" .. skill_id, nil
end

function M.valid_sha256(sha256: any): boolean
    return type(sha256) == "string" and #sha256 == 64 and sha256:match("^[0-9a-f]+$") ~= nil
end

local function storage(): (any?, error?)
    local id, id_err = skill_storage.id()
    if id_err or not id then return nil, id_err end
    local handle, err = fs.get(id)
    if err or not handle then return nil, errors.wrap(err or errors.new({kind = errors.UNAVAILABLE, message = "filesystem missing"}), "skill bundle storage") end
    return handle, nil
end

function M.put(skill_id: string, bytes: string): (string?, error?)
    local dir, dir_err = dir_for(skill_id)
    if dir_err or not dir then return nil, dir_err end
    local handle, storage_err = storage()
    if storage_err or not handle then return nil, storage_err end
    local ok, dir_error = pio.ensure_dir(handle, dir)
    if dir_error or not ok then return nil, dir_error end
    local sha256, hash_err = hash.sha256(bytes)
    if hash_err or not sha256 then return nil, errors.wrap(hash_err or errors.new({kind = errors.INTERNAL, message = "digest missing"}), "hash bundle bytes") end
    local written, write_err = handle:writefile(dir .. "/" .. sha256, bytes)
    if write_err or not written then return nil, errors.wrap(write_err or errors.new({kind = errors.INTERNAL, message = "write fails"}), "write bundle bytes") end
    return sha256, nil
end

function M.read(skill_id: string, sha256: string): (string?, error?)
    local dir, dir_err = dir_for(skill_id)
    if dir_err or not dir then return nil, dir_err end
    if not M.valid_sha256(sha256) then return nil, errors.new({kind = errors.INVALID, message = "invalid file sha256"}) end
    local handle, storage_err = storage()
    if storage_err or not handle then return nil, storage_err end
    local bytes, read_err = handle:readfile(dir .. "/" .. sha256)
    if read_err or type(bytes) ~= "string" then return nil, errors.wrap(read_err or errors.new({kind = errors.INTERNAL, message = "expected bytes"}), "read bundle bytes") end
    local digest, hash_err = hash.sha256(bytes)
    if hash_err then return nil, errors.wrap(hash_err, "hash bundle bytes") end
    if digest ~= sha256 then return nil, errors.new({kind = errors.INTERNAL, message = "bundle bytes differ from sha256"}) end
    return bytes, nil
end

function M.remove(skill_id: string): error?
    local dir, dir_err = dir_for(skill_id)
    if dir_err or not dir then return dir_err end
    local handle, storage_err = storage()
    if storage_err or not handle then return storage_err end
    local exists, exists_err = handle:exists(dir)
    if exists_err then return exists_err end
    if not exists then return nil end
    local iter, iter_state = handle:readdir(dir)
    if not iter then return errors.wrap(iter_state, "list bundle") end
    local names: {string} = {}
    for item in iter, iter_state do names[#names + 1] = item.name end
    for _, name in ipairs(names) do
        local ok, remove_err = handle:remove(dir .. "/" .. name)
        if remove_err or not ok then return remove_err or errors.new({kind = errors.INTERNAL, message = "remove bundle bytes fails"}) end
    end
    local ok, remove_err = handle:remove(dir)
    if remove_err or not ok then return remove_err or errors.new({kind = errors.INTERNAL, message = "remove bundle directory fails"}) end
    return nil
end

return M
