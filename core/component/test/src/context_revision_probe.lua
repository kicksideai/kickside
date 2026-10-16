local component = require("component")

-- Probe entry: runs the component client under the actor + scope the caller bound onto
-- the func executor (the client reads security.actor() and security.scope()
-- ambiently). Returns a flat envelope the test asserts on, with the error
-- classification resolved here because typed errors do not cross the call.

local function failure(err: any): any
    return {
        ok = false,
        err = tostring(err),
        details = err and err:details() or nil,
        kind = err and err:kind() or nil,
        retryable = err and err:retryable(),
        conflict = errors.is(err :: any, errors.CONFLICT),
        invalid = errors.is(err :: any, errors.INVALID),
        internal = errors.is(err :: any, errors.INTERNAL),
        permission_denied = errors.is(err :: any, errors.PERMISSION_DENIED),
    }
end

local function run(args: any): any
    args = type(args) == "table" and args or {}
    local component_id = tostring(args.component_id or "")

    if args.op == "update" then
        local result, err = component.update(component_id, args.commands, args.opts)
        if err or not result then
            return failure(err)
        end
        return { ok = true, revision = (result :: any).context_revision }
    end

    if args.op == "validate" then
        local level, err = component.validate_access(component_id, component.ACCESS.READ)
        if err then
            return failure(err)
        end
        return { ok = true, level = level }
    end

    if args.op == "by_meta" then
        local meta: { [string]: string } = type(args.meta) == "table" and args.meta or {}
        local context, err = component.get_context_by_meta(meta, component.ACCESS.READ)
        if err then
            return failure(err)
        end
        return { ok = true, context = context }
    end

    if args.op == "query" then
        local rows, err = component.query({ component_ids = { component_id } })
        if err or not rows then
            return failure(err)
        end
        return { ok = true, count = #rows }
    end

    return { ok = false, err = "unknown op: " .. tostring(args.op) }
end

return { run = run }
