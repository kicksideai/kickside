local M = { ACCESS = { READ = 1 }, rows = {
    {uuid = "first", actor_id = "owner", metadata = {}},
    {uuid = "second", actor_id = "owner", metadata = {}},
} }
function M.actor() return {id = function() return "owner" end} end
function M.validate_access() return true, nil end
function M.count_for_actor() return #M.rows, nil end
function M.list_for_actor() return M.rows, nil end
function M.get_for_actor() return M.rows[1], nil end
function M.get() return M.rows[1], nil end
function M.get_storage() return {}, nil end
return M
