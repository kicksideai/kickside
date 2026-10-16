local M = { reads = 0, removed = 0 }

function M.reset(hidden: boolean)
    M.reads, M.removed, M.hidden = 0, 0, hidden
end
function M.is_str(value: any): boolean return type(value) == "string" and value ~= "" end
function M.trim(value: any): string return type(value) == "string" and value or "" end
function M.actor_id(): string return "race-owner" end
function M.actor_principal(): any return { kind = "user", id = "race-owner" } end
function M.keyed_principal(owner_id: string?): any return { kind = "user", id = owner_id } end
function M.is_maintenance_actor(): boolean return false end
function M.declared_identity(): any return { row = {} }, nil end
function M.open_db(): any return { release = function() end }, nil end
function M.emit_update() end

return M
