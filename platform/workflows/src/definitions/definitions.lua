-- Read-only Workflow definition helpers.
--
-- A Flow's immutable published document is the artifact source authority.
-- Compiled commands are deliberately excluded: they are environment-local frozen
-- execution artifacts and must be recreated only by the importer/publisher.

local version_read = require("version_read")
local workflow_repo = require("workflow_repo")
local flow_contract = require("flow_contract")
local flow_ref = require("flow_ref")
local mapping = require("mapping")

local M = {}

type Map = { [string]: any }

local function map(v: any): Map
    return type(v) == "table" and (v :: Map) or {}
end

local function str(v: any): string
    return type(v) == "string" and v or ""
end

local copy_tree = mapping.copy_tree

-- Resolve precisely as other consumer faces do: component READ under the ambient
-- contract actor/scope, then an immutable published version. No list projection is
-- trusted as authorization and no draft document is ever read here.
local function published(ref: any): (Map?, error?)
    local exact, ref_err = flow_ref.validate(ref)
    if ref_err or not exact then return nil, ref_err end
    local workflow_id = exact.id
    local access_err = workflow_repo.require_access(workflow_id, workflow_repo.ACCESS.READ :: number)
    if access_err then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "access denied" }) end
    local source, source_err = version_read.get_source(workflow_id, exact.version)
    if source_err then return nil, source_err end
    if not source then return nil, errors.new({ kind = errors.NOT_FOUND, message = "workflow has no published version" }) end
    return source :: Map, nil
end

local function artifact_key(source: Map): string
    local document = map(source.document)
    local params = map(document.params)
    local key = str(params.key)
    if key == "" then key = str(source.workflow_id) end
    return key
end

-- get_interface(flow_ref) -> immutable graph-derived Start/Finish/Error
-- interface. The same store derivation drives the published list and call faces.
function M.get_interface(flow_ref: any): (Map?, error?)
    local source, err = published(flow_ref)
    if err or not source then return nil, err end
    local iface = source.interface
    if type(iface) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "published workflow has no Start/Finish interface" }) end
    return copy_tree(iface) :: Map, nil
end

-- export(flow_ref) -> one Flow source artifact. It is not a Block
-- declaration and carries no executable or compiled commands.
function M.export(flow_ref: any): (Map?, error?)
    local source, err = published(flow_ref)
    if err or not source then return nil, err end
    local document = copy_tree(source.document) :: Map
    local params = map(document.params)
    local key = artifact_key(source)
    if key == "" then return nil, errors.new({ kind = errors.INTERNAL, message = "published Flow has no id for its artifact key" }) end
    local artifact, artifact_err = flow_contract.build({
        key = key,
        title = str(params.title) ~= "" and str(params.title) or ("Flow " .. str(source.workflow_id)),
        version = tonumber(source.version) or 0,
        -- Live Flows are already concrete. Package-only refs remain solely in the
        -- registry declaration and never leak into the stored document.
        refs = {},
        document = document,
    })
    if artifact_err then return nil, artifact_err end
    if not artifact then return nil, errors.new({ kind = errors.INTERNAL, message = "Flow artifact build returned no artifact" }) end
    return artifact :: Map, nil
end

return M
