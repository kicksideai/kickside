-- Automation artifacts: export of an installed automation's portable
-- declaration and import through install_type.

local automation_types = require("types")
local support = require("engine_support")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local PORTABLE_INPUT_KEY = support.PORTABLE_INPUT_KEY
    local is_object = support.is_object
    local portable_copy = support.portable_copy
    local portable_merge = support.portable_merge
    local reject_unknown_fields = support.reject_unknown_fields

    local ARTIFACT_FIELDS: Map = {
        apiVersion = true,
        kind = true,
        metadata = true,
        spec = true,
    }

    local AUTOMATION_SPEC_FIELDS: Map = {
        type = true,
        input = true,
    }

    local ARTIFACT_METADATA_FIELDS: Map = {
        title = true,
    }

    local function validate_artifact_envelope(raw: Map): error?
        local fields_err = reject_unknown_fields(raw, ARTIFACT_FIELDS, "artifact")
        if fields_err then return fields_err end
        if raw.apiVersion ~= "kickside.automation/v1" then
            return errors.new({ kind = errors.INVALID, message = "unsupported automation artifact apiVersion" })
        end
        if type(raw.kind) ~= "string" or raw.kind == "" then
            return errors.new({ kind = errors.INVALID, message = "artifact kind is required" })
        end
        if raw.metadata ~= nil then
            if not is_object(raw.metadata) then return errors.new({ kind = errors.INVALID, message = "artifact metadata must be an object" }) end
            local metadata = raw.metadata :: Map
            local metadata_err = reject_unknown_fields(metadata, ARTIFACT_METADATA_FIELDS, "artifact metadata")
            if metadata_err then return metadata_err end
            if metadata.title ~= nil and type(metadata.title) ~= "string" then
                return errors.new({ kind = errors.INVALID, message = "artifact metadata.title must be a string" })
            end
        end
        if not is_object(raw.spec) then return errors.new({ kind = errors.INVALID, message = "artifact spec is required" }) end
        return nil
    end

    -- export_artifact returns a portable declaration, not a component snapshot.
    -- Runtime identity, placement, rollback state, progress, and component ids are
    -- deliberately absent. The install input remains intact, including a Data
    -- Sync's transform, so the artifact can recreate the automation elsewhere.
    function M.export_artifact(component_id: string): (Map?, error?)
        if type(component_id) ~= "string" or component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end
        local component = dependencies.component :: automation_types.ComponentModule
        local rows, query_err = component.query({
            component_ids = { component_id },
            include = { meta = true },
            access_mask = component.ACCESS.READ,
        })
        if query_err then return nil, query_err end
        local row = rows and rows[1]
        if not row or type(row.impl_id) ~= "string" or row.impl_id == "" then
            return nil, errors.new({ kind = errors.NOT_FOUND, message = "automation not found" })
        end

        local registry = dependencies.registry :: automation_types.RegistryModule
        local raw_entry, entry_err = registry.get(row.impl_id :: string)
        local entry = raw_entry :: automation_types.RegistryEntry?
        if entry_err then return nil, entry_err end
        if not entry then return nil, errors.new({ kind = errors.NOT_FOUND, message = "automation type not found" }) end
        local entry_meta = type(entry.meta) == "table" and (entry.meta :: Map) or {}
        if entry_meta.exportable ~= true then return nil, errors.new({ kind = errors.INVALID, message = "automation type is not exportable" }) end
        local state, state_err = component.get_context(component_id, component.ACCESS.READ)
        if state_err then return nil, state_err end
        local portable = type(state) == "table" and (state :: Map)[PORTABLE_INPUT_KEY] or nil
        if type(portable) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "automation has no portable install input" }) end
        local config = portable_copy(portable :: Map) :: Map
        local title = type((config :: Map).title) == "string" and (config :: Map).title or ""
        return {
            apiVersion = "kickside.automation/v1",
            kind = "Automation",
            metadata = { title = title },
            spec = {
                type = row.impl_id,
                input = config :: Map,
            },
        }, nil
    end

    -- import_artifact is the inverse of export_artifact. Placement is an explicit
    -- destination concern and therefore is supplied separately rather than being
    -- embedded in the portable artifact.
    function M.import_artifact(artifact: any, parent_id: string?, input_overrides: any?): (Map?, error?)
        if type(artifact) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "artifact must be an object" }) end
        local raw = artifact :: Map
        local envelope_err = validate_artifact_envelope(raw)
        if envelope_err then return nil, envelope_err end
        local spec = raw.spec :: Map
        if raw.kind == "Automation" then
            local spec_err = reject_unknown_fields(spec, AUTOMATION_SPEC_FIELDS, "automation artifact spec")
            if spec_err then return nil, spec_err end
            if type(spec.type) ~= "string" or spec.type == "" then
                return nil, errors.new({ kind = errors.INVALID, message = "automation artifact spec.type is required" })
            end
            if not is_object(spec.input) then return nil, errors.new({ kind = errors.INVALID, message = "automation artifact spec.input is required" }) end
            if input_overrides ~= nil and not is_object(input_overrides) then
                return nil, errors.new({ kind = errors.INVALID, message = "input_overrides must be an object" })
            end
            local install_input = input_overrides ~= nil
                and portable_merge(spec.input, input_overrides)
                or portable_merge(nil, spec.input)
            local installed, install_err = M.install_type(spec.type :: string, install_input, parent_id)
            if install_err then return nil, install_err end
            if not installed then return nil, errors.new({ kind = errors.INTERNAL, message = "automation import returned no automation" }) end
            return {
                id = installed.id,
                type = installed.type,
                created = installed.created,
            }, nil
        end
        return nil, errors.new({ kind = errors.INVALID, message = "unsupported automation artifact kind" })
    end
end

return part
