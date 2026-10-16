local api = require("api")
local raw_api = require("raw_api")
local http = require("probe")
local artifacts = require("artifacts")
local delete_api = require("delete_api")
local identity = require("execution_identity")
local contract = require("contract")
local security = require("security")
local types = require("types")
local function read()
    http.reset()
    api.get_handler()
    return { status = http.status, body = http.body }
end
local function read_artifacts()
    http.reset()
    artifacts.artifacts_handler()
    return { status = http.status, body = http.body }
end
local function delete()
    http.reset()
    delete_api.delete_handler()
    return { status = http.status, body = http.body }
end
local function raw()
    http.reset()
    raw_api.raw_handler()
    return { status = http.status, body = http.body }
end
local function frozen()
    local captured, capture_err = identity.capture()
    if capture_err then return nil, capture_err end
    return identity.to_row(captured)
end
local function events()
    local def = assert(contract.get("kickside.core:threads"))
    local run, open_err = def:with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err then return nil, open_err end
    return run:list_events({ thread_id = types.component_id_for_owner(security.actor():id()) })
end
return { read = read, raw = raw, artifacts = read_artifacts, delete = delete, frozen = frozen, events = events }
