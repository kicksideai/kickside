local M = {}
local counters = {}
local reject_open = false
local delete_error = nil
local remove_error = nil
local failures = {}
local mkdir_allowed = false
local portable = true
local staging_absent = false

function M.reset()
    counters = { assembled = 0, extracted = 0, created = 0, deleted = 0, removed = 0, written = 0, closed = 0 }
    reject_open = false
    delete_error = nil
    remove_error = nil
    failures = {}
    mkdir_allowed = false
    portable = true
    staging_absent = false
end

function M.counters() return counters end
function M.reject_open() reject_open = true end
function M.reject_delete(err) delete_error = err end
function M.reject_remove(err) remove_error = err end
function M.reject(stage, err) failures[stage] = err end
function M.failure(stage) return failures[stage] end
function M.allow_mkdir() mkdir_allowed = true end
function M.nonportable() portable = false end
function M.has_portable() return portable end
function M.absent_staging() staging_absent = true end

function M.open_service()
    if reject_open then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "component service unavailable" })
    end
    return M.service(), nil
end

function M.storage()
    return {
        mkdir = function(_self, _path)
            if mkdir_allowed then return true, nil end
            if failures.mkdir then return nil, failures.mkdir end
            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "directory backend unavailable" })
        end,
        remove = function(_self, _path)
            counters.removed = counters.removed + 1
            if staging_absent then return nil, errors.new({ kind = errors.NOT_FOUND, message = "staging path absent" }) end
            if remove_error then return nil, remove_error end
            return true, nil
        end,
        exists = function(_self, _path)
            if failures.exists then return nil, failures.exists end
            return not staging_absent, nil
        end,
        stat = function(_self, _path)
            if failures.stat then return nil, failures.stat end
            return { size = 0 }, nil
        end,
        writefile = function(_self, _path, _stream)
            counters.written = counters.written + 1
            if failures.write then return nil, failures.write end
            return true, nil
        end,
        open = function(_self, _path, _mode)
            if failures.open then return nil, failures.open end
            local read = false
            return {
                read = function()
                    if failures.read then return nil, failures.read end
                    if read then return nil, errors.new({ kind = errors.NOT_FOUND, message = "EOF" }) end
                    read = true
                    return "bundle bytes", nil
                end,
                close = function()
                    counters.closed = counters.closed + 1
                    if failures.close then return nil, failures.close end
                    return true, nil
                end,
            }, nil
        end,
    }
end

function M.service()
    return {
        export = function(_self, args)
            if failures.export then return nil, failures.export end
            return { success = true, component_id = args.component_id,
                impl_id = "fixture:portable", shell = {}, has_portable = false }, nil
        end,
        import = function(_self, _args)
            if failures.import then return nil, failures.import end
            counters.created = counters.created + 1
            return { success = true, component_id = "imported-component" }, nil
        end,
        delete = function(_self, args)
            assert(args.component_id == "imported-component")
            counters.deleted = counters.deleted + 1
            if delete_error then return nil, delete_error end
            return { success = true }, nil
        end,
    }
end

function M.assembled() counters.assembled = counters.assembled + 1 end
function M.extracted() counters.extracted = counters.extracted + 1 end

return M
