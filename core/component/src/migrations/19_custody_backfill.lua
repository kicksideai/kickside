-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local uuid = require("uuid")

local PAGE = 200

-- An adoption audit is an explicit principal ownership write. Creation identity,
-- ACLs and public metadata cannot distinguish an owned registration from an
-- ordinary one. Producer migrations must prove that relation independently.
local function adopted_principal(tx, id)
    local rows, err = tx:query([[SELECT request_id,record_json FROM kickside_execution_identity_audit
        WHERE component_id=$1 AND request_id LIKE 'adopt:%' ORDER BY identity_generation DESC LIMIT 1]], {id})
    if err then error(err) end
    if not rows[1] then return nil end
    local record = json.decode(rows[1].record_json)
    if type(record) ~= "table" or record.outcome ~= "adopted" or record.component_id ~= id
        or record.request_id ~= rows[1].request_id or record.authorizer ~= record.new_principal
        or type(record.new_principal) ~= "string" then return nil end
    return record.new_principal:match("^user:([^:%s]+)$")
end

local function backfill(tx, cursor)
    local query = "SELECT component_id,secrets_incarnation FROM kickside_components"
    local rows, read_err
    if cursor == nil then
        rows, read_err = tx:query(query .. " ORDER BY component_id LIMIT $1", {PAGE})
    else
        rows, read_err = tx:query(query .. " WHERE component_id > $1 ORDER BY component_id LIMIT $2", {cursor, PAGE})
    end
    if read_err then error(read_err) end
    for _, row in ipairs(rows) do
        local id = row.component_id
        if row.secrets_incarnation == nil then
            local _, err = tx:execute([[UPDATE kickside_components SET secrets_incarnation=$1
                WHERE component_id=$2 AND secrets_incarnation IS NULL]], {uuid.v4(), id})
            if err then error(err) end
        end
        local principal = adopted_principal(tx, id)
        if principal then
            local _, err = tx:execute([[UPDATE kickside_components SET owner_type='principal',owner_kind='user',owner_id=$1
                WHERE component_id=$2 AND owner_type='unresolved']], {principal, id})
            if err then error(err) end
        end
    end
    return #rows == PAGE and rows[PAGE].component_id or nil
end

return require("migration").define(function()
    migration("19 establish component incarnations for custody", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(backfill, "batch")
            end)
        end
    end)
end)
