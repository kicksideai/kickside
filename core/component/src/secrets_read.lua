-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local reader = require("component_reader")
local types = require("component_types")
local envelope = require("envelope")
local access_policy = require("access_policy")
local context_policy = require("context_policy")
local fields = require("secret_fields")
local document = require("secrets_document")

type Request = {component_id: string?, meta: types.MetadataMap?, access_mask: integer?}

local M = {}


function M.runtime(input: unknown): types.AccessContextResult
    if type(input) ~= "table" then return context_policy.domain_failure(errors.new({message = "request must be a table", kind = errors.INVALID})) end
    local request = input :: Request
    if request.component_id ~= nil and (type(request.component_id) ~= "string" or request.component_id == "") then
        return context_policy.domain_failure(errors.new({message = "component id must be a non-empty string", kind = errors.INVALID}))
    end
    if request.component_id == nil then
        local filter_err = context_policy.validate_meta_filters(request.meta)
        if filter_err then return context_policy.domain_failure(filter_err) end
    end
    local actor, actor_err = security.actor()
    if actor_err then return context_policy.domain_failure(actor_err) end
    if not actor then return context_policy.domain_failure(errors.new({message = "authenticated actor required", kind = errors.PERMISSION_DENIED})) end
    local actor_id, id_err = actor:id()
    if id_err then return context_policy.domain_failure(id_err) end
    local mask, mask_err = access_policy.normalize_access_mask(request.access_mask, types.ACCESS.READ)
    if mask_err then return context_policy.domain_failure(mask_err) end
    if not mask or mask <= 0 then return context_policy.domain_failure(errors.new({message = "positive access mask required", kind = errors.INVALID})) end
    local query = reader.new():with_user(actor_id):with_access_mask(mask)
        :include_options({private_context = true, secrets = true, access_level = true, meta = false})
    if request.component_id then query = query:with_components(request.component_id)
    elseif request.meta then query = query:with_meta(request.meta):limit(2)
    else return context_policy.domain_failure(errors.new({message = "component id or metadata required", kind = errors.INVALID})) end
    local rows, read_err = query:all()
    if read_err then return context_policy.domain_failure(read_err) end
    if #rows == 0 then return context_policy.domain_failure(errors.new({message = "component not found", kind = errors.PERMISSION_DENIED})) end
    if #rows > 1 then return context_policy.domain_failure(errors.new({message = "multiple components match the specified metadata", kind = errors.INVALID})) end
    local row = rows[1]
    local mask_err = document.finish_runtime_read(row)
    if mask_err then return context_policy.domain_failure(mask_err) end
    return {success = true, id = row.component_id, context = row.private_context,
        context_revision = row.context_revision, access_level = row.access_level, impl_id = row.impl_id,
        context_included = true, secret_fields = row.secret_fields, deleting_at = row.deleting_at, deletion_job_id = row.deletion_job_id}
end

function M.private(input: unknown): (types.JsonMap?, error?)
    if type(input) ~= "table" then return nil, errors.new({kind = errors.INVALID, message = "request must be a table"}) end
    local request = input :: Request
    if type(request.component_id) ~= "string" or request.component_id == "" then
        return nil, errors.new({kind = errors.INVALID, message = "component id required"})
    end
    local row, read_err = reader.new():with_components(request.component_id)
        :include_options({private_context = true, secrets = true, meta = false}):one()
    if read_err then return nil, read_err end
    if not row then return nil, errors.new({kind = errors.NOT_FOUND, message = "component not found"}) end
    local mask_err = document.finish_runtime_read(row)
    if mask_err then return nil, mask_err end
    local context = row.private_context or {}
    context.component_id = row.component_id
    return context, nil
end

function M.secrets(input: unknown): types.SecretsResult
    local result = M.runtime(input)
    if result.success ~= true then return result :: types.SecretsResult end
    local allowed, permission_err = security.can("component.secrets.read", result.impl_id :: string)
    if permission_err then return context_policy.domain_failure(permission_err) end
    if allowed ~= true then return context_policy.domain_failure(errors.new({message = "component secrets read denied", kind = errors.PERMISSION_DENIED})) end
    local declarations, declaration_err = fields.for_impl(result.impl_id :: string)
    if declaration_err then return context_policy.domain_failure(declaration_err) end
    local paths, path_err = fields.combine(declarations :: types.SecretField[], result.secret_fields or {})
    if path_err then return context_policy.domain_failure(path_err) end
    local _, secrets, split_err = fields.partition(paths :: types.SecretField[], result.context :: types.JsonMap)
    if split_err then return context_policy.domain_failure(split_err) end
    return {success = true, component_id = result.id, secrets = secrets,
        context_revision = result.context_revision}
end

return M
