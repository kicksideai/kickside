local json = require("json")
local sql = require("sql")
local row_limit = require("row_limit")

local M = {}
type Map = { [string]: any }
local TABLE = "kickside_automation_delivery_history"
local KEY = "automation_id,drive_key,round_token,source_port,item_key,identity_key"
local BATCH = 50

local function internal(message: string, cause: any): error
    return errors.new({kind=errors.INTERNAL,retryable=true,message=message .. ": " .. tostring(cause)})
end

function M.record_tx(tx: any, round: Map, outcomes: {Map}): error?
    local rows: {Map} = {}
    for _,outcome in ipairs(outcomes) do
        local error_json: string? = nil
        if outcome.error ~= nil then
            local encoded,err=json.encode(outcome.error)
            if err then return internal("delivery history error encoding fails",err) end
            error_json=encoded
        end
        local row: Map={automation_id=round.automation_id,drive_key=round.drive_key,
            round_token=round.captured.round_token,source_port=round.source_port,
            item_key=outcome.item.item_key,identity_key=outcome.item.delivery_key,state=outcome.state,
            execution_identity_json=outcome.execution_identity_json,error_json=error_json,
            round_at=round.now,expires_at=round.resolved_expires_at}
        local encoded,encode_err=json.encode(row)
        if encode_err then return internal("delivery history encoding fails",encode_err) end
        local bound_err=row_limit.check(encoded,"delivery_history",round.automation_id)
        if bound_err then return bound_err end
        rows[#rows+1]=row
    end
    table.sort(rows,function(a: Map,b: Map): boolean
        if a.item_key ~= b.item_key then return a.item_key < b.item_key end
        return a.identity_key < b.identity_key
    end)
    for first=1,#rows,BATCH do
        local params: {any}={}
        local values: {string}={}
        for index=first,math.min(#rows,first+BATCH-1) do
            local row=rows[index]
            local marks: {string}={}
            for _,value in ipairs({row.automation_id,row.drive_key,row.round_token,row.source_port,
                row.item_key,row.identity_key,row.state,row.execution_identity_json or sql.NULL,
                row.error_json or sql.NULL,row.round_at,row.expires_at}) do
                params[#params+1]=value
                marks[#marks+1]="$" .. tostring(#params)
            end
            values[#values+1]="(" .. table.concat(marks,",") .. ")"
        end
        local _,write_err=tx:execute("INSERT INTO " .. TABLE .. " (" .. KEY
            .. ",state,execution_identity_json,error_json,round_at,expires_at) VALUES " .. table.concat(values,","),params)
        if write_err then return internal("delivery history append fails",write_err) end
    end
    return nil
end

function M.prune_tx(tx: any, now: string, limit: integer): (integer?,error?)
    if type(now) ~= "string" or now == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil,errors.new({kind=errors.INVALID,message="delivery history cutoff and limit 1..1000 required"})
    end
    local deleted,err=tx:execute("DELETE FROM " .. TABLE .. " WHERE (" .. KEY .. ") IN (SELECT " .. KEY
        .. " FROM " .. TABLE .. " WHERE expires_at <= $1 ORDER BY expires_at," .. KEY .. " LIMIT $2)",{now,limit})
    local count=deleted and tonumber(deleted.rows_affected) or nil
    if err or count == nil then
        return nil,internal("delivery history prune fails",err or "missing affected-row count")
    end
    return math.floor(count),nil
end

return M
