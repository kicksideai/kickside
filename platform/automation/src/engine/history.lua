local json = require("json")
local errors = require("errors")
local provenance = require("round_provenance")

type Map = { [string]: any }
local M = {}
local DELIVERY_KEYS = {"round_at","drive_key","round_token","source_port","item_key","identity_key"}
local CONTROL_KEYS = {"generation","request_id"}

local function invalid(message: string): error
    return errors.new({kind=errors.INVALID,message=message})
end

local function internal(message: string, cause: any): error
    return errors.new({kind=errors.INTERNAL,retryable=true,message=message .. ": " .. tostring(cause)})
end

local function decoded(raw: string, field: string): (Map?,error?)
    local value,err=json.decode(raw)
    if err or type(value) ~= "table" then return nil,internal("invalid retained " .. field,err) end
    return value,nil
end

local function admission(raw: any, id: string, validate: any): (Map?,string?,error?)
    if raw == nil then return nil,"absent",nil end
    local evidence,err=provenance.decode(raw)
    if err or not evidence then return nil,nil,err end
    if evidence.identity ~= nil then
        local valid,identity_err=validate(evidence.identity)
        if not valid then return nil,nil,identity_err or internal("invalid retained identity",nil) end
        if evidence.identity.component_id ~= id then return nil,nil,internal("retained identity root mismatch",id) end
    end
    if evidence.unresolved == true then return evidence,"unresolved",nil end
    if evidence.inferred ~= nil then
        if type(evidence.inferred) ~= "table" then return nil,nil,internal("invalid inferred evidence",nil) end
        return evidence,"inferred",nil
    end
    if evidence.identity == nil then return nil,nil,internal("retained admission has no identity",nil) end
    return evidence,"recorded",nil
end

function M.list(db: any, id: string, opts: any, validate: any): (Map?,error?)
    local o: Map=type(opts) == "table" and opts or {}
    local kind=o.kind or "deliveries"
    if kind ~= "deliveries" and kind ~= "controls" then return nil,invalid("history kind must be deliveries or controls") end
    local size=o.page_size == nil and 50 or tonumber(o.page_size)
    if size == nil or size < 1 or size > 100 or size ~= math.floor(size) then
        return nil,invalid("history page_size must be an integer in [1, 100]")
    end
    local keys=kind == "deliveries" and DELIVERY_KEYS or CONTROL_KEYS
    local after: {any}?=nil
    if o.page_token ~= nil then
        if type(o.page_token) ~= "string" or o.page_token == "" then return nil,invalid("invalid history page_token") end
        local token,token_err=json.decode(o.page_token)
        if token_err or type(token) ~= "table" or token.version ~= 1 or token.automation_id ~= id
            or token.kind ~= kind or type(token.after) ~= "table" or #token.after ~= #keys then
            return nil,invalid("history page_token does not match this root and record kind")
        end
        for index,key in ipairs(keys) do
            local value=token.after[index]
            if key == "generation" then
                if type(value) ~= "number" or value < 1 or value ~= math.floor(value) then
                    return nil,invalid("invalid history generation cursor")
                end
            elseif type(value) ~= "string" then return nil,invalid("invalid history key cursor") end
        end
        after=token.after
    end
    local params: {any}={id}
    local predicate="automation_id=$1"
    if after then
        local marks: {string}={}
        for index=1,#keys do
            params[#params+1]=after[index]
            marks[#marks+1]="$" .. tostring(#params)
        end
        predicate=predicate .. " AND (" .. table.concat(keys,",") .. ") < (" .. table.concat(marks,",") .. ")"
    end
    local order: {string}={}
    for _,key in ipairs(keys) do order[#order+1]=key .. " DESC" end
    params[#params+1]=size+1
    local columns=kind == "deliveries"
        and "round_at,drive_key,round_token,source_port,item_key,identity_key,state,execution_identity_json,error_json"
        or "generation,request_id,state,created_at,completed_at,target_receipts_json"
    local name=kind == "deliveries" and "kickside_automation_delivery_history" or "kickside_automation_op"
    local rows,read_err=db:query("SELECT " .. columns .. " FROM " .. name .. " WHERE " .. predicate
        .. " ORDER BY " .. table.concat(order,",") .. " LIMIT $" .. tostring(#params),params)
    if read_err or type(rows) ~= "table" then return nil,internal("history read fails",read_err or "missing rows") end
    local entries: {Map}={}
    for index=1,math.min(#rows,size) do
        local row=rows[index]
        local entry: Map={state=row.state}
        for _,key in ipairs(keys) do entry[key]=row[key] end
        if kind == "deliveries" then
            local evidence,status,evidence_err=admission(row.execution_identity_json,id,validate)
            if evidence_err then return nil,evidence_err end
            entry.evidence=evidence;entry.evidence_status=status
            if row.error_json ~= nil then
                local failure,failure_err=json.decode(row.error_json)
                if failure_err then return nil,internal("invalid retained delivery error",failure_err) end
                entry.error=failure
            end
        else
            entry.generation=tonumber(row.generation)
            entry.created_at=row.created_at;entry.completed_at=row.completed_at
            local receipts,receipt_err=decoded(row.target_receipts_json,"control receipts")
            if receipt_err or not receipts then return nil,receipt_err end
            if receipts.initiation ~= nil then
                local recorded=receipts.initiation
                if type(recorded) ~= "table" or type(recorded.actor_id) ~= "string" or recorded.actor_id == "" then
                    return nil,internal("invalid retained control initiation",nil)
                end
                entry.initiation={actor_id=recorded.actor_id}
            end
        end
        entries[#entries+1]=entry
    end
    local next_token: string?=nil
    if #rows > size then
        local last=entries[#entries]
        local tuple: {any}={}
        for _,key in ipairs(keys) do tuple[#tuple+1]=last[key] end
        local encoded,encode_err=json.encode({version=1,automation_id=id,kind=kind,after=tuple})
        if encode_err then return nil,internal("history cursor encoding fails",encode_err) end
        next_token=encoded
    end
    return {kind=kind,entries=entries,next_page_token=next_token},nil
end

return M
