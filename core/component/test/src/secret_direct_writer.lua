-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local json = require("json")
local context_ops = require("context_ops")
local cleanup = require("error_envelope").cleanup
local types = require("component_types")

local function write(id: string): (boolean?, error?)
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local tx, primary = db:begin()
    if not primary then
        local rows, read_err = tx:query("SELECT component_id,impl_id,private_context,encrypted_secrets FROM kickside_components WHERE component_id=$1", {id})
        primary = read_err
        if not primary then
            local context, decode_err = json.decode(rows[1].private_context)
            primary = decode_err
            if not primary then
                local _, write_err = context_ops.write_context_tx(tx, rows[1] :: types.SecretRow, context, {_rollback = {marker = "kept"}})
                primary = write_err
            end
        end
        if primary then primary = cleanup(function() return tx:rollback() end, primary, "rollback runtime context write")
        else local _, commit_err = tx:commit(); primary = commit_err end
    end
    primary = cleanup(function() return db:release() end, primary, "release runtime context write")
    if primary then return nil, primary end
    return true, nil
end

return {write = write}
