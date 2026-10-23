-- Placement update under the caller's transaction.
local sql = require("sql")
local security = require("security")
local time = require("time")
local uuid = require("uuid")
local json = require("json")
local meta_ops = require("meta_ops")
local placement = require("placement")
local component_types = require("component_types")
local context_policy = require("context_policy")
local placement_rules = require("placement_rules")
type Executor = sql.DB | sql.Transaction

-- Encode a private-context value to its stored JSON string.
local function encode_context(value: any): (string?, error?)
    if type(value) ~= "table" then
        return tostring(value), nil
    end
    local encoded, err = json.encode(value)
    if err then
        return nil, errors.wrap(err, "failed to encode private context")
    end
    return encoded, nil
end

local identity = require("identity_ops")
local execution_identity = require("execution_identity")
local audit_policy = require("audit_policy")

-- CREATE_COMPONENT payload: { component_id?, impl_id, private_context?,
-- initial_meta?, actor_id, parent_id?, position? }. parent_id omitted =>
-- root; position omitted => append after last sibling.
local function create_component(tx: Executor, db: Executor, command: component_types.Command, captured_identity: any?): (component_types.CommandResult?, error?)
    local payload = command.payload or {}

    if not payload.impl_id or payload.impl_id == "" then
        return nil, (errors.new({ message = "implementation ID is required", kind = errors.INVALID }) :: error)
    end
    if not payload.actor_id or payload.actor_id == "" then
        return nil, (errors.new({ message = "actor_id is required", kind = errors.INVALID }) :: error)
    end
    if not execution_identity.is_valid_id(payload.actor_id)
        and not execution_identity.is_maintenance_key(payload.actor_id) then
        return nil, (errors.new({ message = "actor_id must be a canonical principal id", kind = errors.INVALID }) :: error)
    end
    if execution_identity.is_maintenance_key(payload.actor_id) then
        local allowed, permission_err = security.can(component_types.MAINTENANCE_OWN_ACTION, payload.impl_id)
        if permission_err then return nil, errors.wrap(permission_err, "failed to authorize maintenance ownership") end
        if allowed ~= true then
            return nil, (errors.new({
                message = "framework maintenance actor " .. tostring(payload.actor_id)
                    .. " lacks permission to own a " .. tostring(payload.impl_id)
                    .. " component; the work runs under its owner's execution identity",
                kind = errors.PERMISSION_DENIED,
                retryable = false,
                details = { error_kind = "subject" },
            }) :: error)
        end
    end

    local component_id = (payload.component_id or uuid.v7()) :: string
    if payload.component_id ~= nil and not uuid.validate(component_id) then
        -- component_id is a UUID-typed column on postgres; enforce the same
        -- contract on sqlite so both engines accept identical input.
        return nil, (errors.new({ message = "component ID must be a UUID, got: " .. component_id, kind = errors.INVALID }) :: error)
    end

    -- CREATE_COMPONENT is shared by registration, import, and direct persist
    -- callers. The SQL writer must reject caller-supplied runtime state even
    -- when a caller bypasses the service binding.
    local context = payload.private_context or {}
    local context_err = context_policy.validate_public(context)
    if context_err then return nil, context_err end

    -- Only the authenticated creator or the verified install receipt supplies
    -- captured authority. Generic command payloads cannot select it.
    local initial_identity = captured_identity
    if initial_identity == nil and execution_identity.is_valid_id(payload.actor_id) then
        local actor, actor_err = security.actor()
        if actor_err then return nil, actor_err end
        if actor and actor:id() == payload.actor_id then
            local captured, capture_err = execution_identity.capture()
            if capture_err then return nil, capture_err end
            initial_identity = captured
        end
    end
    local now_ts = execution_identity.utc_now()
    local initial_hash: string? = nil
    if execution_identity.is_valid_id(payload.actor_id) then
        if initial_identity == nil then
            initial_identity = {
                version = 2,
                principal = { kind = "user", id = payload.actor_id },
                authorized_by = { kind = "user", id = payload.actor_id },
                captured_at = now_ts,
            }
        end
        if initial_identity.component_id == nil then initial_identity.component_id = component_id end
        initial_hash = identity.canonical_identity(initial_identity.principal, initial_identity.authorized_by,
            initial_identity.component_id, initial_identity.captured_at,
            initial_identity.credential_id, initial_identity.link_id)
        context._execution_identity = initial_identity
    end
    local private_context, enc_err = encode_context(context)
    if enc_err then
        return nil, enc_err
    end

    local lock_err = placement.lock_tree(tx)
    if lock_err then return nil, lock_err end
    local rule, rule_err = placement_rules.for_impl(payload.impl_id :: string)
    if rule_err then return nil, rule_err end

    -- Resolve parent and materialize the stored path.
    local parent_id = payload.parent_id :: string?
    local parent_path: string? = nil
    local parent_kind = "root"
    if parent_id ~= nil and parent_id ~= "" then
        local parent, perr = placement.read_node(tx, parent_id, true)
        if perr then
            return nil, perr
        end
        if not parent then
            return nil, (errors.new({ message = "parent component not found", kind = errors.NOT_FOUND }) :: error)
        end
        parent_path = parent.path
        parent_kind = parent.impl_id
    else
        parent_id = nil
    end

    local placement_err = placement_rules.check(rule, payload.impl_id :: string, parent_kind, false)
    if placement_err then return nil, placement_err end

    local node_path = placement.build_path(db, component_id, parent_path)

    -- Resolve sibling position: explicit, else append after last sibling.
    local position = payload.position
    if position == nil or position == "" then
        local last, lerr = placement.max_sibling_position(tx, parent_id)
        if lerr then
            return nil, lerr
        end
        position = placement.rank_between(last, nil)
    end

    local component_row: { [string]: any } = {
        component_id = component_id,
        impl_id = payload.impl_id,
        private_context = private_context,
        parent_id = parent_id,
        position = position,
        path = node_path,
        created_at = now_ts,
        updated_at = now_ts,
    }
    if initial_hash ~= nil then component_row.identity_hash = initial_hash end
    local inserted, err = sql.builder.insert(component_types.TABLES.COMPONENTS)
        :set_map(component_row)
        :suffix("ON CONFLICT (component_id) DO NOTHING")
        :run_with(tx):exec()
    if err then
        return nil, errors.wrap(err, "failed to create component")
    end
    local count = inserted and tonumber(inserted.rows_affected)
    if count == 0 then
        return nil, errors.new({message = "component already exists", kind = errors.CONFLICT,
            retryable = false, details = {code = "component_already_exists"}})
    end
    if count ~= 1 then
        return nil, errors.new({message = "component insert returns no affected-row proof", kind = errors.INTERNAL,
            retryable = false, details = {code = "component_insert_result_invalid"}})
    end
    -- Grant full access to the owner. This is a DIRECT grant: source = the
    -- component itself, inherited = 0.
    local _, access_err = sql.builder.insert(component_types.TABLES.ACCESS)
        :set_map({
            access_id = uuid.v7(),
            subject_id = payload.actor_id,
            subject_type = component_types.SUBJECT_TYPES.USER,
            component_id = component_id,
            source_component_id = component_id,
            inherited = 0,
            access_mask = component_types.ACCESS.FULL,
            created_at = now_ts,
        })
        :run_with(tx):exec()
    if access_err then
        return nil, errors.wrap(access_err, "failed to create component access")
    end

    if initial_hash ~= nil then
        local record = identity.audit_record("none",
            initial_identity.principal,
            initial_identity.authorized_by,
            "initial:" .. component_id, "initial", 0, "initial", initial_hash)
        local size_err = audit_policy.check_row(component_id, record, "create_component")
        if size_err then return nil, size_err end
        local result, audit_err = sql.builder.insert("kickside_execution_identity_audit"):set_map({
            component_id = component_id,
            identity_generation = 0,
            request_id = "initial:" .. component_id,
            record_json = record,
            created_at = now_ts,
            published_at = sql.as.null(),
        }):run_with(tx):exec()
        if audit_err then return nil, errors.wrap(audit_err, "failed to write initial identity audit") end
        if not result or tonumber(result.rows_affected) ~= 1 then
            return nil, errors.new({message = "initial identity audit returns no affected-row proof", kind = errors.INTERNAL,
                retryable = false, details = {code = "component_initial_audit_response"}})
        end
    end

    -- Record the owner (the creator) as reserved metadata so the share UI can
    -- mark and protect them — ownership is explicit, not just an implied grant.
    local _, owner_err = sql.builder.insert(component_types.TABLES.META)
        :set_map({
            meta_id = uuid.v7(),
            component_id = component_id,
            key = component_types.OWNER_META_KEY,
            value = payload.actor_id,
            created_at = now_ts,
            updated_at = now_ts,
        })
        :run_with(tx):exec()
    if owner_err then
        return nil, errors.wrap(owner_err, "failed to record owner")
    end

    -- Add initial metadata if provided.
    if payload.initial_meta and type(payload.initial_meta) == "table" then
        for key, value in pairs(payload.initial_meta) do
            local meta_key_err = meta_ops.validate_public_meta_key(key)
            if meta_key_err then return nil, meta_key_err end
            local encoded, encode_err = meta_ops.encode_public_meta_value(key, value)
            if encode_err then return nil, encode_err end
            local _, meta_err = sql.builder.insert(component_types.TABLES.META)
                :set_map({
                    meta_id = uuid.v7(),
                    component_id = component_id,
                    key = key,
                    value = encoded,
                    created_at = now_ts,
                    updated_at = now_ts,
                })
                :run_with(tx):exec()
            if meta_err then
                return nil, errors.wrap(meta_err, "failed to create initial metadata")
            end
        end
    end

    -- Record its ancestry: grants on every ancestor reach it on the next check.
    local link_err = placement.link_node(tx, component_id, parent_id)
    if link_err then
        return nil, link_err
    end

    return { component_id = component_id, changes_made = true }, nil
end

-- SET_PLACEMENT payload: { component_id, has_parent_arg, parent_id?, position? }.
-- has_parent_arg true => apply parent_id (false/nil => root); false => keep
-- current parent. This is structure/placement only; ownership and subscription
-- semantics live in access/meta and thread-relation APIs.
-- Re-parents and/or reorders, re-materializing the node's path and every
-- descendant's. Rejects cycles (moving a node under itself/its subtree).
local function set_placement(tx: Executor, db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}

    if not payload.component_id or payload.component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local component_id = payload.component_id :: string

    local lock_err = placement.lock_tree(tx)
    if lock_err then return nil, lock_err end
    local node, nerr = placement.read_node(tx, component_id, true)
    if nerr then
        return nil, nerr
    end
    if not node then
        return nil, (errors.new({ message = "component not found", kind = errors.NOT_FOUND }) :: error)
    end

    -- Determine the target parent.
    local new_parent_id = node.parent_id
    if payload.has_parent_arg then
        local arg = payload.parent_id
        if arg == nil or arg == "" then
            new_parent_id = nil
        else
            new_parent_id = arg :: string
        end
    end

    local rule, rule_err = placement_rules.for_impl(node.impl_id)
    if rule_err then return nil, rule_err end
    if rule and rule.fixed and new_parent_id ~= node.parent_id then
        return nil, placement_rules.check(rule, node.impl_id, "root", true)
    end

    local new_parent_path = nil
    local parent_kind = "root"
    if new_parent_id ~= nil then
        if new_parent_id == component_id then
            return nil, (errors.new({ message = "cannot place a component under itself", kind = errors.INVALID }) :: error)
        end
        -- Cycle guard: the new parent must not be inside this node's subtree.
        local inside, ierr = placement.is_self_or_descendant(tx, component_id, new_parent_id :: string)
        if ierr then
            return nil, ierr
        end
        if inside then
            return nil, (errors.new({ message = "cannot place a component under its own descendant", kind = errors.INVALID }) :: error)
        end

        local parent, perr = placement.read_node(tx, new_parent_id :: string, true)
        if perr then
            return nil, perr
        end
        if not parent then
            return nil, (errors.new({ message = "parent component not found", kind = errors.NOT_FOUND }) :: error)
        end
        new_parent_path = parent.path
        parent_kind = parent.impl_id
    end

    if new_parent_id ~= node.parent_id then
        local placement_err = placement_rules.check(rule, node.impl_id, parent_kind, true)
        if placement_err then return nil, placement_err end
    end

    -- Resolve target position: explicit, else append at end of new siblings.
    local new_position = payload.position
    if new_position == nil or new_position == "" then
        local last, lerr = placement.max_sibling_position(tx, new_parent_id)
        if lerr then
            return nil, lerr
        end
        new_position = placement.rank_between(last, nil)
    end

    -- Re-materialize the node's path, then rewrite every descendant relative to it.
    local old_path = node.path
    local new_path = placement.build_path(db, component_id, new_parent_path)
    local now_ts = time.now():utc():format_rfc3339()

    local _, uerr = sql.builder.update(component_types.TABLES.COMPONENTS)
        :set("parent_id", new_parent_id)
        :set("position", new_position)
        :set("path", new_path)
        :set("updated_at", now_ts)
        :where("component_id = ?", component_id)
        :run_with(tx):exec()
    if uerr then
        return nil, errors.wrap(uerr, "failed to update placement")
    end

    local descendants, derr = placement.descendants(tx, component_id)
    if derr then
        return nil, derr
    end

    for _, d in ipairs(descendants or {}) do
        -- Rewrite each descendant path by swapping the old subtree prefix for the
        -- new one (works for both ltree and sqlite materialized paths).
        local d_new = new_path .. tostring(d.path):sub(#tostring(old_path) + 1)
        local _, dperr = sql.builder.update(component_types.TABLES.COMPONENTS)
            :set("path", d_new)
            :where("component_id = ?", d.component_id)
            :run_with(tx):exec()
        if dperr then
            return nil, errors.wrap(dperr, "failed to re-materialize descendant path")
        end
    end

    -- The moved subtree now hangs under new ancestors: rewrite its ancestry so
    -- old-chain grants stop and new-chain grants reach it on the next check.
    if new_parent_id ~= node.parent_id then
        local relink_err = placement.relink_subtree(tx, db, component_id, new_parent_id)
        if relink_err then
            return nil, relink_err
        end
    end

    return {
        component_id = component_id,
        parent_id = new_parent_id,
        previous_parent_id = node.parent_id,
        position = new_position,
        previous_position = node.position,
        path = new_path,
        changes_made = true,
    }, nil
end

return {
    create_component = create_component,
    set_placement = set_placement,
}
