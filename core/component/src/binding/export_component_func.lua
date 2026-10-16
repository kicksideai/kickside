local json = require("json")
local security = require("security")
local registry = require("registry")
local component_reader = require("component_reader")
local ops = require("component_ops")
local base = require("base_portable")
local envelope = require("envelope")
local context_policy = require("context_policy")

-- export_component: emit the portable shell envelope for one component. ADMIN-gated.
-- Carries the safe metadata subset + the portable private_context (secrets stripped,
-- refs cleared) + the slots an importer must fill. No backing data — data-bearing
-- impls move their own rows through the kickside.contract:portable instance contract.

local PORTABLE_CONTRACT = "kickside.contract:portable"

local function meta_of(entry)
    if type(entry) ~= "table" then return {} end
    return entry.meta or (entry.data and entry.data.meta) or {}
end

local function contracts_of(entry)
    if type(entry) ~= "table" then return {} end
    local data = entry.data or entry
    return data.contracts or {}
end

local function handle(req)
    if type(req) ~= "table" or type(req.component_id) ~= "string" or req.component_id == "" then
        return envelope.fail("component_id is required", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end
    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail("Invalid actor ID", errors.PERMISSION_DENIED)
    end

    -- Export requires ADMIN; read the full shell, private_context included.
    local reader = component_reader.new()
        :with_user(user_id)
        :with_components(req.component_id)
        :with_access_mask(ops.ACCESS.ADMIN)
        :include_options({ meta = true, private_context = true, placement = false })

    local comp, read_err = reader:one()
    if read_err then
        return envelope.from_error(read_err)
    end
    -- An absent component and a refused one answer alike, so existence stays hidden.
    if not comp then
        return envelope.fail("Component not found or insufficient access (ADMIN required)", errors.PERMISSION_DENIED)
    end

    local impl_id = comp.impl_id
    if type(impl_id) ~= "string" or impl_id == "" then
        return envelope.internal("component has no impl_id")
    end
    local impl, impl_err = registry.get(impl_id)
    if impl_err then
        return envelope.from_error(impl_err, "component impl lookup")
    end
    if not impl then
        return envelope.fail("component impl not installed: " .. impl_id, errors.NOT_FOUND)
    end
    local impl_meta = meta_of(impl)
    local portable_schema = impl_meta.portable_schema
    if type(portable_schema) ~= "table" then
        return envelope.fail("component impl is not exportable (no portable_schema)", errors.INVALID)
    end
    local credential_schema = impl_meta.credential_schema

    local has_portable = false
    for _, c in ipairs(contracts_of(impl)) do
        if type(c) == "table" and c.contract == PORTABLE_CONTRACT then
            has_portable = true
            break
        end
    end

    local portable_context = {}
    for key, value in pairs(comp.private_context or {}) do
        if not context_policy.is_runtime_owned(key) then portable_context[key] = value end
    end
    local shell_envelope = base.build_envelope({
        source_component_id = comp.component_id,
        impl_id = impl_id,
        meta = comp.meta or {},
        private_context = portable_context,
        portable_schema = portable_schema,
        credential_schema = credential_schema,
    })

    local shell, enc_err = json.encode(shell_envelope)
    if enc_err then
        return envelope.from_error(enc_err, "encode")
    end

    return {
        success = true,
        component_id = comp.component_id,
        impl_id = impl_id,
        shell = shell,
        has_portable = has_portable,
        slots = shell_envelope.slots,
    }
end

return { handle = handle }
