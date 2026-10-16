local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.acquisitions, M.releases, M.deletes, M.purges = stage, source, 0, 0, 0, 0
    M.release_sources, M.purge_source = {}, nil
end
function M.db_id() return "fixture-db" end
function M.sql_get()
    M.acquisitions = M.acquisitions + 1
    local stage = M.acquisitions == 1 and "database" or (M.purges == 0 and "remove_database" or "retry_database")
    if M.stage == stage then return nil, M.source end
    local db: any = {}
    function db:release()
        M.releases = M.releases + 1
        local release_err = M.release_sources[M.acquisitions]
        if release_err then return nil, release_err end
        return true, nil
    end
    function db:query()
        if M.stage == "scan" then return nil, M.source end
        return {{component_id = "fixture-component"}}, nil
    end
    function db:execute(statement)
        if statement:sub(1, 6) == "UPDATE" then
            if M.stage == "retry_stamp" then return nil, M.source end
        else
            M.deletes = M.deletes + 1
            if M.stage == "remove" then return nil, M.source end
        end
        return {rows_affected = 1}, nil
    end
    return db, nil
end
function M.contract_get()
    if M.stage == "contract" then return nil, M.source end
    local definition: any = {}
    function definition:open()
        if M.stage == "open" then return nil, M.source end
        local instance: any = {}
        function instance:purge()
            if M.purge_source or M.stage == "retry_database" or M.stage == "retry_stamp" or M.stage == "purge" then
                M.purges = M.purges + 1
                return nil, M.purge_source or (M.stage == "purge" and M.source) or errors.new({kind = errors.INTERNAL, retryable = false, message = "purge refusal"})
            end
            return {purged = true}, nil
        end
        return instance, nil
    end
    return definition, nil
end
return M
