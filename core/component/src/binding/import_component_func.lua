local json = require("json")
local security = require("security")
local registry = require("registry")
local register = require("register")
local base = require("base_portable")
local envelope = require("envelope")

-- import_component: reconstruct a component shell from a portable envelope, owned by
-- the current actor. The envelope cannot set owner/access — authority comes from the
-- importing actor. The TRUSTED locally-installed binding schema (looked up by impl_id,
-- never the blob's claims) drives context re-filtering and slot resolution. Registration
-- runs through register_component_func, so there is one creation path and rollback lives
-- in its transaction.

local function meta_of(entry)
    if type(entry) ~= "table" then return {} end
    return entry.meta or (entry.data and entry.data.meta) or {}
end

local function handle(req)
    if type(req) ~= "table" then
        return envelope.fail("Invalid request: must be a table", errors.INVALID)
    end

    local shell = req.shell
    if type(shell) ~= "string" or shell == "" then
        return envelope.fail("shell (envelope JSON) is required", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end

    local decoded, dec_err = json.decode(shell)
    if dec_err then
        return envelope.fail("decode: " .. tostring(dec_err), errors.INVALID)
    end

    local parsed, perr = base.parse_envelope(decoded)
    if not parsed then
        return envelope.from_error(perr, "envelope")
    end

    -- Trust the local binding's schema, never the envelope's own slot/context claims.
    -- parse_envelope already guaranteed impl_id is a non-empty string.
    local impl_id = parsed.impl_id
    if type(impl_id) ~= "string" or impl_id == "" then
        return envelope.fail("envelope missing impl_id", errors.INVALID)
    end
    local impl, impl_err = registry.get(impl_id)
    if impl_err then
        return envelope.from_error(impl_err, "impl lookup")
    end
    if not impl then
        return envelope.fail("impl not installed: " .. tostring(impl_id), errors.NOT_FOUND)
    end
    local impl_meta = meta_of(impl)
    local portable_schema = impl_meta.portable_schema
    if type(portable_schema) ~= "table" then
        return envelope.fail("impl is not importable (no portable_schema): " .. tostring(parsed.impl_id), errors.INVALID)
    end
    local credential_schema = impl_meta.credential_schema

    local ctx, cerr = base.resolve_context(portable_schema, credential_schema, parsed, req.slot_values, req.id_map)
    if not ctx then
        return envelope.from_error(cerr, "resolve")
    end

    local meta = type(parsed.meta) == "table" and parsed.meta or {}

    local res = register.handle({
        impl_id = parsed.impl_id,
        private_context = ctx,
        meta = meta,
        parent_id = req.parent_id,
        position = req.position,
    })
    -- Registration classifies its own failure; the import answers with it.
    if not res.success then
        return res
    end

    return {
        success = true,
        component_id = res.component_id,
        impl_id = res.impl_id,
        warnings = {},
    }
end

return { handle = handle }
