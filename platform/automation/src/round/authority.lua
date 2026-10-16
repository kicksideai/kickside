local automations = require("automations_lib")
local execution_identity = require("execution_identity")
local round_write = require("round_write")
local registry = require("registry")
local provenance = require("round_provenance")

local M = {}
type Map = { [string]: any }
local OWNER = "kickside.automation:round_authority"

local function identity(request: Map): (any?, error?, Map?)
    local d = request.drive
    local fence_err = round_write.check_fence(d)
    if fence_err then return nil, fence_err end
    if type(request.key) ~= "string" or request.key == "" then
        return nil,errors.new({kind=errors.INVALID,retryable=false,message="effect names its admitted delivery",details={error_kind="declaration"}})
    end
    local evidence,read_err=provenance.load_evidence(d,request.delivery_key or request.key)
    if read_err or not evidence then return nil,read_err end
    local stored,identity_err=provenance.identity(evidence)
    return stored,identity_err,evidence
end

function M.check(request: Map): (any?, error?)
    local stored,read_err,evidence=identity(request)
    if read_err then return nil,read_err end
    local resolved,resolve_err=execution_identity.authorize(stored,{deferred_owner=OWNER})
    if resolve_err or not resolved then return nil,resolve_err end
    if request.prepared_lookup then return {prepared_key=evidence.prepared_key or request.key},nil end
    return true,nil
end

function M.write(request: Map): (Map?, error?)
    local stored,read_err=identity(request)
    if read_err then return nil,read_err end
    return execution_identity.run_as(stored,"kickside.automation:round_sink_effect",request,{deferred_owner=OWNER})
end

function M.compute(request: Map): (any?, error?)
    local stored,read_err=identity(request)
    if read_err then return nil,read_err end
    local entry,entry_err=registry.get(request.target)
    if entry_err then return nil,entry_err end
    if not entry or not entry.meta or entry.meta.type ~= "kickside.automation.round.effect" then
        return nil,errors.new({kind=errors.INVALID,retryable=false,message="preparation target requires a round effect capability",
            details={error_kind="declaration"}})
    end
    return execution_identity.run_as(stored,request.target,request.args,{deferred_owner=OWNER})
end

function M.sink(request: Map): (Map?, any)
    local writer,open_err,open_envelope=automations.open_sink_writer(request.binding,request.config,request.drive.deadline)
    if not writer then return {message=open_err,envelope=open_envelope},nil end
    local result,message,envelope=writer:write(request.body)
    return {result=result,message=message,envelope=envelope},nil
end

return M
