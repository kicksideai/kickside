local json = require("json")
local sql = require("sql")
local row_limit = require("row_limit")
local identity = require("delivery_identity")

local M = {}
type Map = { [string]: any }
local TABLE = "kickside_automation_delivery_history"
local KEY = "automation_id,drive_key,round_token,source_port,item_key,identity_key"
local BATCH = 50
M.MAX_ROWS = 10000

local function internal(message: string, cause: any): error
    return errors.new({kind=errors.INTERNAL,retryable=true,message=message .. ": " .. tostring(cause)})
end

function M.record_tx(tx: any, round: Map, outcomes: {Map}, deliveries: {Map}?, prior: Map?): error?
    local delivered: Map={}
    for _,entry in ipairs(deliveries or {}) do delivered[entry.key]=true end
    local states=prior or {}
    local rows: {Map} = {}
    for _,outcome in ipairs(outcomes) do
        local prior=states[outcome.item.item_key .. "\n" .. outcome.item.delivery_key]
        if outcome.state ~= "resolved" or not prior or prior.state ~= outcome.state or delivered[outcome.item.delivery_key] then
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
                attempt_family=identity.family(round,outcome.item),
                round_at=round.now,expires_at=round.resolved_expires_at}
            local encoded,encode_err=json.encode(row)
            if encode_err then return internal("delivery history encoding fails",encode_err) end
            local bound_err=row_limit.check(encoded,"delivery_history",round.automation_id)
            if bound_err then return bound_err end
            rows[#rows+1]=row
        end
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
                row.error_json or sql.NULL,row.round_at,row.expires_at,row.attempt_family}) do
                params[#params+1]=value
                marks[#marks+1]="$" .. tostring(#params)
            end
            values[#values+1]="(" .. table.concat(marks,",") .. ")"
        end
        local _,write_err=tx:execute("INSERT INTO " .. TABLE .. " (" .. KEY
            .. ",state,execution_identity_json,error_json,round_at,expires_at,attempt_family) VALUES " .. table.concat(values,","),params)
        if write_err then return internal("delivery history append fails",write_err) end
        -- The drive index bounds this walk by MAX_ROWS plus this append batch.
        local _,trim_err=tx:execute("DELETE FROM " .. TABLE .. " WHERE (" .. KEY .. ") IN (SELECT " .. KEY
            .. " FROM " .. TABLE .. " WHERE automation_id=$1 AND drive_key=$2 ORDER BY round_at DESC,round_token DESC,"
            .. "source_port DESC,item_key DESC,identity_key DESC LIMIT $3 OFFSET $4)",
            {round.automation_id,round.drive_key,math.min(BATCH,#rows-first+1),M.MAX_ROWS})
        if trim_err then return internal("delivery history window prune fails",trim_err) end
    end
    return nil
end

local function decode_outcomes(rows: {Map}): ({Map}?,error?)
    local outcomes: {Map}={}
    for _,row in ipairs(rows :: {Map}) do
        local failure: any = nil
        if row.error_json ~= nil then
            local decoded,decode_err=json.decode(tostring(row.error_json))
            if decode_err then return nil,internal("delivery history error is not JSON",decode_err) end
            failure=decoded
        end
        outcomes[#outcomes+1]={state=tostring(row.state),error=failure}
    end
    return outcomes,nil
end

-- outcomes(executor, automation_id, source_port, item_key, identity_keys) ->
-- { state, error? } of every retained round outcome of the item under those
-- delivery keys, until the history's retention prunes them.
function M.outcomes(executor: any, automation_id: string, source_port: string, item_key: string,
        identity_keys: {string}): ({Map}?, error?)
    local outcomes: {Map} = {}
    for first=1,#identity_keys,100 do
        local params: {any}={automation_id,source_port,item_key}
        local marks: {string}={}
        for index=first,math.min(#identity_keys,first+99) do
            params[#params+1]=identity_keys[index]
            marks[#marks+1]="$" .. tostring(#params)
        end
        local rows,err=executor:query("SELECT state,error_json FROM " .. TABLE
            .. " WHERE automation_id=$1 AND source_port=$2 AND item_key=$3 AND identity_key IN ("
            .. table.concat(marks,",") .. ")",params)
        if err then return nil,internal("delivery history read fails",err) end
        local decoded,decode_err=decode_outcomes(rows)
        if decode_err or not decoded then return nil,decode_err end
        for _,outcome in ipairs(decoded) do outcomes[#outcomes+1]=outcome end
    end
    return outcomes,nil
end

-- A family groups replay generations of one delivery without enumerating
-- every historical generation. Excess retained evidence refuses inference.
function M.attempts(executor: any, owner: string, port: string, item: string, family: string): ({Map}?,error?,boolean?)
    local rows,err=executor:query("SELECT state,error_json FROM " .. TABLE
        .. " WHERE automation_id=$1 AND source_port=$2 AND item_key=$3 AND attempt_family=$4 LIMIT " .. tostring(M.MAX_ROWS+1),
        {owner,port,item,family})
    if err then return nil,internal("delivery attempt history read fails",err) end
    if #rows > M.MAX_ROWS then return {},nil,false end
    local outcomes,decode_err=decode_outcomes(rows)
    return outcomes,decode_err,true
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
