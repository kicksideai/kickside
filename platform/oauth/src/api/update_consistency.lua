local M = {}

function M.apply(component_id: string, current_connection: any, fields: any, collaborators: any): (any?, string?)
    local get_meta = collaborators.get_meta
    local update_repo = collaborators.update_repo
    local set_meta = collaborators.set_meta

    -- Fail before either write if the component snapshot cannot be read. This
    -- prevents a repository-only update when component lookup is unavailable.
    local _, snapshot_err = get_meta(component_id)
    if snapshot_err then return nil, snapshot_err end

    local repo_result, repo_err = update_repo(component_id, {
        connection_name = fields.connection_name,
        connection_description = fields.connection_description,
    })
    if repo_err or not repo_result then
        return nil, "Failed to update connection data: " .. tostring(repo_err or "empty result")
    end

    local meta_ok, meta_err = set_meta(component_id, {
        title = fields.connection_name,
        comment = fields.connection_description,
    })
    if meta_ok then return repo_result, nil end

    -- The repository and component service are separate ownership seams. If the
    -- second write fails, restore the old repository fields before returning.
    local restored, restore_err = update_repo(component_id, {
        connection_name = current_connection.connection_name,
        connection_description = current_connection.connection_description or "",
    })
    if restore_err or not restored then
        return nil, "Failed to update component metadata: " .. tostring(meta_err)
            .. "; repository rollback failed: " .. tostring(restore_err or "empty result")
    end
    return nil, "Failed to update component metadata: " .. tostring(meta_err)
end

return M
