local test = require("test")
local registry = require("registry")
local security = require("security")
local authority = require("declaration_authority")
local execution_identity = require("execution_identity")

local principal = {kind = "user", id = "declaration_selected"}
local scope_name = "app:declaration_selected_group"
local identity = {version = 2, principal = principal, authorized_by = principal,
    captured_at = "2026-10-07T00:00:00Z"}
local resources = {
    {kind = "module", id = "app:declaration_module", entry_kind = "ns.definition",
        actions = {"registry.get"}},
    {kind = "function", id = "app:declaration_function", entry_kind = "function.lua",
        actions = {"registry.get", "funcs.call"}},
    {kind = "contract", id = "app:declaration_contract", entry_kind = "contract.definition",
        actions = {"registry.get", "contract.get", "contract.open", "contract.call"}},
}

local function check(ref, immediate, recorded, actor_id, caller_id, resolution_error)
    local value = recorded or identity
    local checker = authority.new({registry = registry, execution_identity = {
        actor_key = execution_identity.actor_key,
        validate = execution_identity.validate,
        authorize = function()
            if resolution_error then return nil, resolution_error end
            return {principal = principal, actor_id = principal.id, scope_name = scope_name,
                meta = {security_groups = {scope_name}}}, nil
        end,
        evaluate_live_scope = execution_identity.evaluate_live_scope,
    }, security = {actor = function()
        if caller_id == false then return nil end
        return assert(security.new_actor(caller_id or "declaration_operator", {}))
    end}})
    return checker.check(value, actor_id or principal.id, {{kind = ref.kind, id = ref.id, access = "READ"}},
        not immediate and "kickside.automation:declaration_writer_create" or nil)
end

return test.run_cases(function()
    test.describe("native declaration registry authority", function()
        local original
        test.before_each(function() original = assert(registry.current_version()) end)
        test.after_each(function() test.is_true((registry.apply_version(original))) end)
        for _, ref in ipairs(resources) do
            test.it("checks selected " .. ref.kind .. " authority independently of the worker", function()
                local allowed, err = check(ref)
                test.is_nil(err)
                test.is_false(allowed)
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:declaration_selection_grant", kind = "security.policy", data = {
                    groups = {scope_name}, policy = {actions = ref.actions, resources = ref.id, effect = "allow"},
                }})
                test.is_nil(select(2, changes:apply()))
                allowed, err = check(ref)
                test.is_nil(err)
                test.is_true(allowed)
                changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:declaration_selection_deny", kind = "security.policy", data = {
                    groups = {scope_name}, policy = {actions = ref.actions[#ref.actions], resources = ref.id, effect = "deny"},
                }})
                test.is_nil(select(2, changes:apply()))
                allowed, err = check(ref)
                test.is_nil(err)
                test.is_false(allowed)
            end)
        end
        test.it("RA-H15 preflights a delegated principal as its authenticated authorizer", function()
            local selected = {version = 2, principal = principal,
                authorized_by = {kind = "user", id = "declaration_operator"}, captured_at = identity.captured_at}
            local changes = assert(registry.snapshot()):changes()
            changes:create({id = "app:declaration_selection_grant", kind = "security.policy", data = {
                groups = {scope_name}, policy = {actions = resources[1].actions, resources = resources[1].id, effect = "allow"},
            }})
            test.is_nil(select(2, changes:apply()))
            local allowed, err = check(resources[1], true, selected)
            test.is_nil(err, tostring(err))
            test.is_true(allowed)
        end)
        test.it("RA-H15 retains selected native resource denial during immediate preflight", function()
            local selected = {version = 2, principal = principal,
                authorized_by = {kind = "user", id = "declaration_operator"}, captured_at = identity.captured_at}
            local allowed, err = check(resources[1], true, selected)
            test.is_nil(err, tostring(err))
            test.is_false(allowed)
        end)
        test.it("RA-H15 rejects a forged authorizer before principal resolution", function()
            local allowed, err = check(resources[1], true)
            test.is_false(allowed)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        test.it("RA-H15 rejects a selected actor mismatch", function()
            local allowed, err = check(resources[1], true, identity, "declaration_operator")
            test.is_false(allowed)
            test.is_true(errors.is(err, errors.INVALID))
        end)
        test.it("RA-H15 requires an authenticated configuring actor", function()
            local allowed, err = check(resources[1], true, identity, principal.id, false)
            test.is_false(allowed)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        for _, kind in ipairs({errors.PERMISSION_DENIED, errors.UNAVAILABLE}) do
            test.it("RA-H15 preserves live resolution failure " .. kind, function()
                local selected = {version = 2, principal = principal,
                    authorized_by = {kind = "user", id = "declaration_operator"}, captured_at = identity.captured_at}
                local expected = errors.new({kind = kind, message = "native resolver refusal"})
                local allowed, err = check(resources[1], true, selected, nil, nil, expected)
                test.is_false(allowed)
                test.eq(err, expected)
            end)
        end
        test.it("RA-H13 keeps self-selected immediate preflight", function()
            local allowed, err = check(resources[1], true, identity, principal.id, principal.id)
            test.is_nil(err)
            test.is_false(allowed)
        end)
    end)
end)
