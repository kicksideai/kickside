-- The transfer orchestrator. Moves whole components (shell + backing data) between
-- environments as one KXB1 bundle. It owns the bundle format, the scratch storage,
-- and the import lifecycle; it stays dumb about any impl's internal tables — the
-- generic shell rides through component_service.export_component/import_component, and
-- data-bearing impls move their own rows through the kickside.contract:portable
-- instance contract (export / import_into). Internal id remapping below the component
-- lives in each impl; the orchestrator only threads the top-level component id_map.

local contract = require("contract")
local security = require("security")
local fs = require("fs")
local uuid = require("uuid")
local component = require("component")
local bundle = require("bundle")
local consts = require("consts")
local pio = require("portable_io")

local M = {}

local SERVICE = "kickside.component:component_service"
local PORTABLE = consts.PORTABLE_CONTRACT

local function service()
    local def, err = contract.get(SERVICE)
    if err then return nil, err end
    if not def then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "component service unavailable" }) end
    return def:with_actor(security.actor()):with_scope(security.scope()):open()
end

local function rollback(svc, created)
    for i = #created, 1, -1 do
        local result, err = svc:delete({ component_id = created[i] })
        if err then return nil, err end
        if not result or result.success ~= true then
            return nil, result and result.error or errors.new({ kind = errors.INTERNAL, message = "component deletion returns no result" })
        end
    end
    return true, nil
end

local function rmtree(storage, files, dirs)
    local function remove(path)
        local present, lookup_err = storage:exists(path :: string)
        if lookup_err then return nil, lookup_err end
        if present == false then return true, nil end
        return storage:remove(path :: string)
    end
    for _, path in ipairs(files) do
        local _, err = remove(path)
        if err then return nil, err end
    end
    table.sort(dirs, function(a, b) return #a > #b end)
    for _, d in ipairs(dirs) do
        local _, err = remove(d)
        if err then return nil, err end
    end
    return true, nil
end

-- export(component_ids) -> (info, err). ADMIN on each component is enforced by
-- export_component; READ is enough to stream the impl's own data. Each component's
-- portable data is staged to scratch FILES, then STREAM-assembled into one bundle file
-- (256KB window, so any size packs without buffering the whole thing). Returns
-- info = { storage_id, path, size, files, dirs }; the caller streams `path` to the
-- client and then calls M.discard(info). Staging is kept here -- the bundle must
-- outlive this call to be streamed -- and removed only on error.
function M.export(component_ids)
    if type(component_ids) ~= "table" or #component_ids == 0 then
        return nil, "component_ids required"
    end

    local svc, serr = service()
    if not svc then return nil, serr end

    local storage_id = consts.scratch_storage()
    local storage, ferr = fs.get(storage_id)
    if ferr then return nil, ferr end
    if not storage then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "scratch storage unavailable" }) end
    local run = "transfer/export-" .. uuid.v7()

    local files = {}
    local dirs = { run }
    local function fail(msg: any)
        local _, cleanup_err = rmtree(storage, files, dirs)
        if cleanup_err then return nil, cleanup_err end
        return nil, msg
    end

    local components = {}
    for _, cid in ipairs(component_ids) do
        local shell_res, shell_err = svc:export({ component_id = cid })
        if shell_err then return fail(shell_err) end
        if not shell_res or not shell_res.success then
            return fail((shell_res and shell_res.error) or "component export fails")
        end

        local parts = {}
        if shell_res.has_portable then
            local inst, oerr = component.open(cid :: string, component.ACCESS.READ, PORTABLE)
            if not inst then return fail(oerr) end

            local path = run .. "/" .. cid
            dirs[#dirs + 1] = path
            dirs[#dirs + 1] = path .. "/data"
            local data_res, data_err = inst:export({ storage_id = storage_id, path = path })
            if data_err then return fail(data_err) end
            if not data_res or not data_res.success then
                return fail((data_res and data_res.error) or "data export fails")
            end

            local rels = (data_res.manifest and data_res.manifest.files) or {}
            for _, rel in ipairs(rels) do
                local full = path .. "/" .. rel
                files[#files + 1] = full
                local st, stat_err = storage:stat(full)
                if stat_err then return fail(stat_err) end
                parts[#parts + 1] = { name = rel, path = full, len = (st :: any).size }
            end
        end

        components[#components + 1] = {
            component_id = shell_res.component_id,
            impl_id = shell_res.impl_id,
            shell = shell_res.shell,
            has_portable = shell_res.has_portable,
            parts = parts,
        }
    end

    local bundle_path = run .. "/bundle.kxb"
    files[#files + 1] = bundle_path
    local parent_ok, parent_err = pio.ensure_parent(storage, bundle_path)
    if not parent_ok then return fail(parent_err) end
    local ok, berr = bundle.write_bundle(storage, bundle_path, components)
    if not ok then return fail(berr) end

    local bst, stat_err = storage:stat(bundle_path)
    if stat_err then return fail(stat_err) end
    return {
        storage_id = storage_id,
        path = bundle_path,
        size = (bst :: any).size,
        files = files,
        dirs = dirs,
    }, nil
end

-- discard(info): remove the staged bundle + part files + dirs once it has been streamed.
function M.discard(info: any)
    if type(info) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "transfer staging info required" }) end
    local storage_id = type(info.storage_id) == "string" and info.storage_id or consts.scratch_storage()
    local storage, err = fs.get(storage_id)
    if err then return nil, err end
    if not storage then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "scratch storage unavailable" }) end
    return rmtree(storage, (info :: any).files or {}, (info :: any).dirs or {})
end

-- import_file(storage, bundle_path, opts) -> (result, err). opts: { slot_values,
-- parent_id }. Streams the bundle from a file: reads only the header + manifest, then
-- pulls each component's parts by byte range into scratch and replays them through the
-- portable contract -- bounded memory at any bundle size. Atomic across the batch: any
-- failure rolls back every component created in this call.
function M.import_file(storage, bundle_path, opts)
    opts = type(opts) == "table" and opts or {}
    local storage_id = type(opts.storage_id) == "string" and opts.storage_id ~= ""
        and opts.storage_id or consts.scratch_storage()
    local hdr, herr = bundle.read_header(storage, bundle_path)
    if not hdr then return nil, herr end

    local svc, serr = service()
    if not svc then return nil, serr end

    local run = "transfer/import-" .. uuid.v7()
    local created = {}
    local id_map = { components = {}, rows = {} }
    local warnings = {}

    local staged = {}
    local dirs = {}
    local function finish(a: any, b: any)
        local _, cleanup_err = rmtree(storage, staged, dirs)
        if cleanup_err then return nil, cleanup_err end
        return a, b
    end
    local function fail(msg)
        local _, rollback_err = rollback(svc, created)
        return finish(nil, rollback_err or msg)
    end

    -- Parts are concatenated in manifest order; walk a byte cursor across them.
    local offset = (hdr :: any).data_offset
    for _, c in ipairs((hdr :: any).components) do
        local imp, import_err = svc:import({
            shell = (c :: any).shell,
            slot_values = opts.slot_values,
            id_map = id_map,
            parent_id = opts.parent_id,
        })
        if import_err then return fail(import_err) end
        if not imp or not imp.success then
            return fail((imp and imp.error) or "component import fails")
        end

        local new_id = imp.component_id
        id_map.components[(c :: any).component_id] = new_id
        created[#created + 1] = new_id

        local cparts = (c :: any).parts or {}
        if (c :: any).has_portable and #cparts > 0 then
            local path = run .. "/" .. new_id
            if #dirs == 0 then dirs[#dirs + 1] = run end
            dirs[#dirs + 1] = path
            dirs[#dirs + 1] = path .. "/data"
            for _, p in ipairs(cparts) do
                local plen = tonumber((p :: any).len) or 0
                local full = path .. "/" .. (p :: any).name
                staged[#staged + 1] = full
                local parent_ok, parent_err = pio.ensure_parent(storage, full)
                if not parent_ok then return fail(parent_err) end
                local ok, werr = bundle.extract_part(storage, bundle_path, offset, plen, full)
                if not ok then return fail(werr) end
                offset = offset + plen
            end

            local inst, oerr = component.open(new_id :: string, component.ACCESS.WRITE, PORTABLE)
            if not inst then return fail(oerr) end

            local dres, data_err = inst:import_into({ storage_id = storage_id, path = path, id_map = id_map })
            if data_err then return fail(data_err) end
            if not dres or not dres.success then
                return fail((dres and dres.error) or "data import fails")
            end

            -- Merge per-table (not replace): a multi-component batch accumulates every
            -- impl's row remap, so a later KB cannot clobber an earlier one's node map.
            if type(dres.id_map) == "table" and type(dres.id_map.rows) == "table" then
                for tbl, m in pairs(dres.id_map.rows) do
                    if type(id_map.rows[tbl]) ~= "table" then id_map.rows[tbl] = {} end
                    if type(m) == "table" then
                        for k, v in pairs(m) do id_map.rows[tbl][k] = v end
                    end
                end
            end
            for _, w in ipairs(dres.warnings or {}) do warnings[#warnings + 1] = w end
        else
            -- Non-portable component: skip past any parts the manifest records for it.
            for _, p in ipairs(cparts) do offset = offset + (tonumber((p :: any).len) or 0) end
        end
    end

    return finish({ success = true, created = created, id_map = id_map, warnings = warnings }, nil)
end

return M
