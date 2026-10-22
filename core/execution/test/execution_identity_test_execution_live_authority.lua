local test = require("test")
local execution_identity_module = require("execution_identity")
local execution_identity = execution_identity_module
local dependencies: { [string]: any } = {}

-- v2 acceptance (IDENTITY-1): one capture/resolve/bind/run_as path over
-- Principal {kind user|group|service, id}. No reconstruct, reconstruct_row,
-- resolve_subject, or live/subject_id/app_scope/scope_resolver options.

local function fake_actor(id: string, actor_meta: any): any
    return {
        id = function() return id end,
        meta = function() return actor_meta end,
    }
end

local function with_dependency(name: string, stub: any, fn: () -> ())
    local previous = dependencies[name]
    dependencies[name] = stub
    execution_identity = execution_identity_module.new(dependencies)
    fn()
    dependencies[name] = previous
    execution_identity = execution_identity_module.new(dependencies)
end

local function with_security(stub: any, fn: () -> ()) with_dependency("security", stub, fn) end
local function with_contract(stub: any, fn: () -> ()) with_dependency("contract", stub, fn) end
local function with_funcs(stub: any, fn: () -> ()) with_dependency("funcs", stub, fn) end

-- A resolver double answering the v2 contract shape.
local function resolver_double(answer: any, answer_err: any, capture_args: any?): any
    local inst = {
        resolve = function(_self: any, args: any)
            if capture_args then capture_args.value = args end
            if answer_err ~= nil then return nil, answer_err end
            return answer, nil
        end,
    }
    local builder = {}
    builder.with_actor = function(_self: any, _actor: any) return builder end
    builder.with_scope = function(_self: any, _scope: any) return builder end
    builder.open = function() return inst, nil end
    return builder
end

local function live_answer(principal: any, scope_name: string?): any
    local key = principal.kind == "group" and "principal:group:" .. principal.id
        or (principal.kind == "service" and "principal:service:" .. principal.id or principal.id)
    return {
        principal = { kind = principal.kind, id = principal.id },
        actor_id = key,
        groups = principal.kind == "user" and { "users" } or {},
        scope_name = scope_name or "app.security:user",
        meta = { status = "active" },
    }
end

local function v2_identity(principal: any, authorizer: any): any
    return {
        version = 2,
        principal = principal,
        authorized_by = authorizer or { kind = "user", id = "caller-1" },
        captured_at = "2026-09-25T00:00:00Z",
    }
end

local function resolve_frame(): any
    return {
        actor = function() return fake_actor("caller-1", {}) end,
        scope = function() return {} end,
        can = function() return true end,
        new_actor = function(id: string, meta: any) return fake_actor(id, meta or {}) end,
        named_scope = function(s: string): any return { name = s }, nil end,
    }
end

local function define_tests()
    test.describe("execution_identity v2", function()
        test.it("checks actor creation before evaluating live authorizer scope", function()
            local builds = 0
            local frame = resolve_frame()
            frame.can = function(action, resource)
                test.eq(action, "security.actor.create")
                test.eq(resource, "caller-1")
                return false
            end
            frame.new_actor = function()
                builds = builds + 1
                error("actor construction is denied")
            end
            with_security(frame, function()
                local decision, err = execution_identity.evaluate_live_scope({
                    principal = {kind = "user", id = "caller-1"}, actor_id = "caller-1",
                    scope_name = "user-scope", meta = {},
                }, "security.actor.delegate", {"resource"})
                test.is_nil(decision)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.eq(err:details().error_kind, "access")
                test.eq(builds, 0)
            end)
        end)
        test.it("binds inherited credential admission to live groups while preserving credential limits and epoch revocation", function()
            local identity = v2_identity({kind = "user", id = "u1"}, {kind = "user", id = "u1"})
            identity.credential_id = "cred-authority"
            local answer = live_answer(identity.principal)
            answer.groups = {"expanded-group"}
            answer.scope_groups = {"live-member-group"}
            answer.authority_epochs = {provider = 7}
            answer.initial_authority_epochs = {provider = 0}
            local credential = {credential_id = identity.credential_id, actor_id = "u1", status = "active",
                whitelist_component_ids = {}, scope_policy_ids = {"deny-control"},
                authority = {policy_ids = {"issuing-policy"}, groups = {"issuing-group"}, epochs = {provider = 7}}}
            local frame = resolve_frame()
            frame.named_scope = function(name)
                return { policies = function() return { { id = function() return name end } } end }, nil
            end
            frame.policy = function(id)
                test.eq(id, "deny-control")
                return { id = function() return id end }, nil
            end
            frame.new_scope = function(policies) return { policies = policies } end
            with_security(frame, function()
                with_contract({get = function() return resolver_double(answer, nil) end}, function()
                    with_funcs({new = function() return {call = function() return credential, nil end} end}, function()
                        local admitted, admitted_err = execution_identity.authorize(identity)
                        test.is_nil(admitted_err)
                        test.eq(admitted.meta.security_groups[1], "expanded-group")
                        test.eq(admitted.scope_groups[1], "live-member-group")
                        test.eq(admitted.scope_policy_ids[1], "deny-control")
                        test.eq(#admitted.scope_policy_ids, 1)
                        local resolved, resolve_err = execution_identity.resolve(identity)
                        test.is_nil(resolve_err)
                        local policy_ids = {}
                        for _, policy in ipairs(resolved.scope.policies) do policy_ids[policy:id()] = true end
                        test.eq(policy_ids["live-member-group"], true)
                        test.eq(policy_ids["deny-control"], true)
                        test.is_nil(policy_ids["issuing-policy"])
                        answer.authority_epochs.provider = 8
                        local revoked, revoked_err = execution_identity.authorize(identity)
                        test.is_nil(revoked)
                        test.is_true(errors.is(revoked_err, errors.PERMISSION_DENIED))
                        answer.authority_epochs = nil
                        local omitted, omitted_err = execution_identity.authorize(identity)
                        test.is_nil(omitted)
                        test.is_true(errors.is(omitted_err, errors.PERMISSION_DENIED))
                    end)
                end)
            end)
        end)
        test.it("binds legacy credentials to optional provider baselines without affecting other identities", function()
            local identity = v2_identity({kind = "user", id = "u1"}, {kind = "user", id = "u1"})
            local answer = live_answer(identity.principal)
            answer.authority_epochs = {provider = 1}
            answer.initial_authority_epochs = {provider = 0}
            with_security(resolve_frame(), function()
                with_contract({get = function() return resolver_double(answer, nil) end}, function()
                    local ordinary, ordinary_err = execution_identity.authorize(identity)
                    test.is_nil(ordinary_err); test.not_nil(ordinary)
                    identity.credential_id = "legacy"
                    with_funcs({new = function() return {call = function()
                        return {credential_id = "legacy", actor_id = "u1", status = "active", whitelist_component_ids = {}}, nil
                    end} end}, function()
                        local revoked, revoked_err = execution_identity.authorize(identity)
                        test.is_nil(revoked)
                        test.is_true(errors.is(revoked_err, errors.PERMISSION_DENIED))
                        answer.authority_epochs = nil; answer.initial_authority_epochs = nil
                        local custom, custom_err = execution_identity.authorize(identity)
                        test.is_nil(custom_err); test.not_nil(custom)
                    end)
                end)
            end)
        end)

        test.it("EE2-2562 authorizes live principal access without constructing an actor or scope", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, nil)
            identity.component_id = "comp-1"
            identity.credential_id = "cred-1"
            local answer = live_answer(identity.principal)
            answer.meta.security_groups = { "forged-admin" }
            local seen = {}
            local frame = resolve_frame()
            frame.actor = function() return fake_actor("caller-1", { via = "mcp" }) end
            frame.can = function() return false end
            frame.new_actor = function() error("authorization does not construct actors") end
            frame.named_scope = function() error("authorization does not construct scopes") end
            with_security(frame, function()
                with_contract({ get = function() return resolver_double(answer, nil, seen), nil end }, function()
                    with_funcs({ new = function() return { call = function()
                        return { credential_id = "cred-1", actor_id = "caller-1", status = "active",
                            whitelist_component_ids = { "comp-1" }, whitelist_prefixes = { "root.comp" } }, nil
                    end }, nil end }, function()
                        local authorized, err = execution_identity.authorize(identity, { deferred_owner = "owner:writer" })
                        test.is_nil(err)
                        test.eq(authorized.principal.id, "caller-1")
                        test.eq(authorized.meta.security_groups[1], "users")
                        test.eq(#authorized.meta.security_groups, 1)
                        test.eq(authorized.meta.component_id, "comp-1")
                        test.eq(authorized.meta.credential_id, "cred-1")
                        test.eq(authorized.meta.access_filter.prefixes[1], "root.comp")
                        test.is_nil(authorized.actor)
                        test.is_nil(authorized.scope)
                        test.eq(seen.value.deferred_owner, "owner:writer")
                        test.eq(seen.value.execution_root.record_id, "comp-1")
                        local resolved, resolve_err = execution_identity.resolve(identity)
                        test.is_nil(resolved)
                        test.eq(errors.is(resolve_err, errors.PERMISSION_DENIED), true)
                    end)
                end)
            end)
        end)

        test.it("EE2-2562 propagates principal authorization denial before resource access", function()
            local denial = errors.new({ message = "principal lacks delegation", kind = errors.PERMISSION_DENIED,
                retryable = false, details = { code = "delegation_missing" } })
            with_security(resolve_frame(), function()
                with_contract({ get = function() return resolver_double(nil, denial), nil end }, function()
                    local authorized, err = execution_identity.authorize(v2_identity({ kind = "user", id = "u1" }, nil))
                    test.is_nil(authorized)
                    test.eq(err, denial)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                    test.eq((err :: any):retryable(), false)
                    test.eq((err :: any):details().code, "delegation_missing")
                end)
            end)
        end)

        test.it("constructs execution scope from every live group supplied by Users", function()
            local frame = resolve_frame()
            local resolved_names = {}
            frame.named_scope = function(name)
                resolved_names[#resolved_names + 1] = name
                return { policies = function() return { { id = function() return name end } } end }, nil
            end
            frame.new_scope = function(policies) return { policies = policies } end
            local answer = live_answer({ kind = "user", id = "u1" })
            answer.scope_groups = { "sales", "support" }
            with_security(frame, function()
                with_contract({ get = function() return resolver_double(answer, nil) end }, function()
                    local result, err = execution_identity.resolve(v2_identity({ kind = "user", id = "u1" }, nil))
                    test.is_nil(err)
                    test.not_nil(result)
                    test.eq(#result.scope.policies, 2)
                    test.eq(resolved_names[1], "sales")
                    test.eq(resolved_names[2], "support")
                end)
            end)
        end)

        test.it("evaluates delegation in the recorded authorizer's live scope with deny precedence", function()
            local evaluated = {}
            local scope_names = {}
            local frame = resolve_frame()
            frame.new_actor = function(id, meta)
                test.eq(id, "authorizer-1")
                test.eq(meta.user_id, "authorizer-1")
                return fake_actor(id, meta)
            end
            frame.named_scope = function(name)
                scope_names[#scope_names + 1] = name
                return {
                    policies = function() return { { id = function() return name end } } end,
                }, nil
            end
            frame.policy = function(id) return { id = function() return id end }, nil end
            frame.new_scope = function(policies)
                test.eq(#policies, 3)
                return {
                    evaluate = function(_self, actor, action, resource)
                        test.eq(actor:id(), "authorizer-1")
                        test.eq(action, execution_identity.DELEGATE_ACTION)
                        evaluated[#evaluated + 1] = resource
                        if resource == "root-grant" then return "allow" end
                        if resource == "all-roots-grant" then return "deny" end
                        return "undefined"
                    end,
                }
            end
            with_security(frame, function()
                local decision, err = execution_identity.evaluate_live_scope(
                    { principal = { kind = "user", id = "authorizer-1" }, actor_id = "authorizer-1",
                        scope_name = "app.security:authorizer_live",
                        scope_groups = { "app.security:authorizer_live", "app.security:credential_narrow" },
                        scope_policy_ids = { "credential-limit" },
                        meta = { user_id = "authorizer-1", status = "active" } },
                    execution_identity.DELEGATE_ACTION,
                    { "root-grant", "all-roots-grant" })
                test.is_nil(err)
                test.eq(decision, "deny")
                test.eq(#evaluated, 2)
                test.eq(scope_names[1], "app.security:authorizer_live")
                test.eq(scope_names[2], "app.security:credential_narrow")
            end)
        end)
        test.it("keeps the owner's module policies when a credential supplies restriction policies", function()
            local frame = resolve_frame()
            frame.named_scope = function(name)
                return { policies = function() return { { id = function() return name end } } end }, nil
            end
            frame.policy = function(id) return { id = function() return id end }, nil end
            frame.new_scope = function(policies) return { policies = policies } end
            local identity = v2_identity({ kind = "user", id = "u1" }, nil)
            identity.credential_id = "cred-1"
            local answer = live_answer(identity.principal)
            answer.scope_groups = { "sales", "support" }
            with_security(frame, function()
                with_contract({ get = function() return resolver_double(answer, nil) end }, function()
                    with_funcs({ new = function() return { call = function()
                        return { credential_id = "cred-1", actor_id = "u1", status = "active",
                            whitelist_component_ids = {}, scope_policy_ids = { "test:credential_denials" } }, nil
                    end }, nil end }, function()
                        local result, err = execution_identity.resolve(identity)
                        test.is_nil(err)
                        test.not_nil(result)
                        local ids = {}
                        for _, policy in ipairs(result.scope.policies) do ids[policy:id()] = true end
                        test.eq(ids.sales, true)
                        test.eq(ids.support, true)
                        test.eq(ids["test:credential_denials"], true)
                        test.is_nil(ids["kickside.mcp.security:session"])
                    end)
                end)
            end)
        end)









        test.it("returns a typed denial when opening the Users resolver loses a binding grant", function()
            local identity = v2_identity({ kind = "user", id = "u1" }, nil)
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return { with_actor = function()
                        return nil, errors.new({ message = "binding denied", kind = errors.PERMISSION_DENIED })
                    end }, nil
                end }, function()
                    local result, err = execution_identity.resolve(identity)
                    test.is_nil(result)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)
        end)

        test.it("pins the ID-22 delegation byte vectors", function()
            local star = execution_identity.delegation_bytes("group", "eng", "*")
            test.eq(execution_identity.delegation_policy_id("group", "eng", "*"),
                "kickside.delegate:010000000567726f757000000003656e67000000012a")
            local uuid = "123e4567-e89b-12d3-a456-426614174000"
            local rooted = execution_identity.delegation_bytes("group", "eng", uuid)
            local other_root = execution_identity.delegation_bytes("group", "eng:x", uuid)
            local user_grant = execution_identity.delegation_bytes("user", "u1", uuid)
            test.is_true(star ~= rooted)
            test.is_true(rooted ~= other_root)
            test.is_true(rooted ~= user_grant)
            test.is_true(#star > 0 and #rooted > #star)
        end)


        test.it("captures the ambient caller as self without touching the resolver", function()
            local contract_calls = 0
            with_security({
                actor = function() return fake_actor("caller-1", { user_id = "caller-1" }) end,
            }, function()
                with_contract({ get = function()
                    contract_calls = contract_calls + 1
                    return nil, "must not resolve at capture"
                end }, function()
                    local identity, err = execution_identity.capture(nil)
                    test.is_nil(err)
                    test.eq(identity.version, 2)
                    test.eq(identity.principal.kind, "user")
                    test.eq(identity.principal.id, "caller-1")
                    test.eq(identity.authorized_by.id, "caller-1")
                    test.is_true(type(identity.captured_at) == "string" and identity.captured_at ~= "")
                    test.eq(contract_calls, 0)
                end)
            end)
        end)


        test.it("inherits protected component, credential and link restrictions on nested capture", function()
            with_security({
                actor = function()
                    return fake_actor("caller-1", { component_id = "comp-1", credential_id = "cred-1", link_id = "link-1" })
                end,
            }, function()
                local inherited, err = execution_identity.capture(nil)
                test.is_nil(err)
                test.eq(inherited.component_id, "comp-1")
                test.eq(inherited.credential_id, "cred-1")
                test.eq(inherited.link_id, "link-1")
                local changed, change_err = execution_identity.capture({ component_id = "comp-2" })
                test.is_nil(changed)
                test.not_nil(change_err)
                test.eq(errors.is(change_err, errors.PERMISSION_DENIED), true)
            end)
        end)

        test.it("the admitted authorizer records a principal selection with its existing authority ceiling", function()
            local admitted = {
                version = 2,
                principal = { kind = "user", id = "owner-1" },
                authorized_by = { kind = "user", id = "owner-1" },
                component_id = "comp-1",
                credential_id = "cred-1",
                link_id = "link-1",
                captured_at = "2026-10-07T00:00:00Z",
            }
            with_security({
                actor = function()
                    return fake_actor("owner-1", { execution_identity = admitted })
                end,
            }, function()
                for _, kind in ipairs({ "user", "group", "service" }) do
                    local selected, err = execution_identity.capture({ principal = { kind = kind, id = "selected-1" } })
                    test.is_nil(err, tostring(err))
                    test.eq(selected.principal.kind, kind)
                    test.eq(selected.principal.id, "selected-1")
                    test.eq(selected.authorized_by.kind, "user")
                    test.eq(selected.authorized_by.id, "owner-1")
                    test.eq(selected.component_id, "comp-1")
                    test.eq(selected.credential_id, "cred-1")
                    test.eq(selected.link_id, "link-1")
                end
            end)
        end)

        test.it("nested capture retains the admitted identity instead of self-authorizing the selected actor", function()
            local admitted = {
                version = 2,
                principal = { kind = "user", id = "bot-1" },
                authorized_by = { kind = "user", id = "admin-1" },
                component_id = "comp-1",
                credential_id = "cred-1",
                link_id = "link-1",
                captured_at = "2026-10-07T00:00:00Z",
            }
            with_security({
                actor = function()
                    return fake_actor("bot-1", {
                        principal = { kind = "user", id = "bot-1" },
                        execution_identity = admitted,
                        component_id = "ambient-component",
                        credential_id = "ambient-credential",
                        link_id = "ambient-link",
                    })
                end,
            }, function()
                local nested, err = execution_identity.capture(nil)
                test.is_nil(err)
                test.eq(nested.principal.id, "bot-1")
                test.eq(nested.authorized_by.id, "admin-1")
                test.eq(nested.component_id, "comp-1")
                test.eq(nested.credential_id, "cred-1")
                test.eq(nested.link_id, "link-1")

                local replaced, replace_err = execution_identity.capture({ principal = { kind = "user", id = "other-1" } })
                test.is_nil(replaced)
                test.not_nil(replace_err)
                test.eq(errors.is(replace_err, errors.PERMISSION_DENIED), true)
            end)
        end)

        test.it("carries an authorize-generated admission into nested capture", function()
            local identity = v2_identity({ kind = "user", id = "bot-1" }, { kind = "user", id = "admin-1" })
            identity.component_id = "comp-1"
            identity.credential_id = "cred-1"
            identity.link_id = "link-1"
            local answer = live_answer(identity.principal)
            answer.meta.execution_identity = v2_identity({ kind = "user", id = "forged-1" }, { kind = "user", id = "forged-1" })
            local nested_actor: any = nil
            local frame = resolve_frame()
            frame.actor = function() return nested_actor or fake_actor("resolver-opener", {}) end
            frame.new_actor = function(id, meta)
                nested_actor = fake_actor(id, meta)
                return nested_actor
            end
            with_security(frame, function()
                with_contract({ get = function() return resolver_double(answer, nil), nil end }, function()
                    with_funcs({ new = function()
                        return { call = function(_self, fn_id, args)
                            if fn_id == "kickside.mcp:credential_restriction" then
                                test.eq(args.credential_id, "cred-1")
                                return { credential_id = "cred-1", actor_id = "bot-1", status = "active",
                                    whitelist_component_ids = {} }, nil
                            end
                            test.eq(fn_id, "kickside.identity:link_get")
                            test.eq(args.link_id, "link-1")
                            return { link_id = "link-1", provider = "discord", external_id = "ext-1", user_id = "bot-1" }, nil
                        end }, nil
                    end }, function()
                        local resolved, resolve_err = execution_identity.resolve(identity)
                        test.is_nil(resolve_err)
                        test.not_nil(resolved)
                        local carrier = nested_actor:meta().execution_identity
                        test.eq(carrier.principal.id, "bot-1")
                        test.eq(carrier.authorized_by.id, "admin-1")
                        test.eq(carrier.component_id, "comp-1")
                        test.eq(carrier.credential_id, "cred-1")
                        test.eq(carrier.link_id, "link-1")

                        local nested, capture_err = execution_identity.capture(nil)
                        test.is_nil(capture_err)
                        test.eq(nested.principal.id, "bot-1")
                        test.eq(nested.authorized_by.id, "admin-1")
                        test.eq(nested.component_id, "comp-1")
                        test.eq(nested.credential_id, "cred-1")
                        test.eq(nested.link_id, "link-1")
                    end)
                end)
            end)
        end)

        test.it("fails closed on malformed or mismatched admitted metadata", function()
            local malformed = { principal = { kind = "user", id = "bot-1" } }
            local mismatched = v2_identity({ kind = "user", id = "other-1" }, { kind = "user", id = "admin-1" })
            for _, carrier in ipairs({ malformed, mismatched }) do
                with_security({
                    actor = function()
                        return fake_actor("bot-1", {
                            principal = { kind = "user", id = "bot-1" }, execution_identity = carrier,
                        })
                    end,
                }, function()
                    local captured, capture_err = execution_identity.capture(nil)
                    test.is_nil(captured)
                    test.not_nil(capture_err)
                    test.eq(errors.is(capture_err, errors.PERMISSION_DENIED), true)
                end)
            end
        end)


        test.it("resolves live with exact principal equality and no frozen opener", function()
            local seen = {}
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            local opener_built = 0
            with_security({
                actor = function() return fake_actor("caller-1", {}) end,
                scope = function() return {} end,
                can = function(action: string, resource: string): boolean
                    test.eq(action, "security.actor.create")
                    test.eq(resource, "caller-1")
                    return true
                end,
                new_actor = function(id: string, meta: any)
                    opener_built = opener_built + 1
                    return fake_actor(id, meta or {})
                end,
                named_scope = function(s: string): any return { name = s }, nil end,
            }, function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, seen), nil
                end }, function()
                    local resolved, err = execution_identity.resolve(identity, nil)
                    test.is_nil(err)
                    test.eq(resolved.actor:id(), "caller-1")
                    test.eq(resolved.scope.name, "app.security:user")
                    test.eq(resolved.principal.id, "caller-1")
                    test.eq(opener_built, 1)
                    local args: any = (seen :: any).value
                    test.eq(args.principal.id, "caller-1")
                    test.eq(args.authorized_by.id, "caller-1")
                    test.is_nil(args.subject_id)
                    test.is_nil(args.app_scope)
                end)
            end)
        end)

        test.it("carries a trusted owner's deferred admission to the resolver, rooted in its component", function()
            local seen = {}
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, seen), nil
                end }, function()
                    local resolved, err = execution_identity.resolve(identity, {
                        deferred_owner = "kickside.core.projections:tick", execution_root = "comp-9",
                    })
                    test.is_nil(err)
                    test.eq(resolved.principal.id, "caller-1")
                    local args: any = (seen :: any).value
                    test.eq(args.deferred_owner, "kickside.core.projections:tick")
                    test.eq(args.authorized_by.id, "caller-1")
                    -- A root named by id is a component root, so the resolver
                    -- checks the recorded authorizer's live root ADMIN.
                    test.eq(args.execution_root.owner_id, "kickside.component")
                    test.eq(args.execution_root.record_id, "comp-9")
                end)
            end)
            test.eq(execution_identity.DEFERRED_ACTION, "kickside.execution.defer")
        end)

        test.it("uses the stored component as the deferred root and refuses a substituted root", function()
            local seen = {}
            local identity = v2_identity({ kind = "user", id = "caller-1" }, nil)
            identity.component_id = "comp-9"
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer(identity.principal), nil, seen), nil
                end }, function()
                    local resolved, err = execution_identity.resolve(identity, { deferred_owner = "owner:worker" })
                    test.is_nil(err)
                    test.not_nil(resolved)
                    test.eq((seen :: any).value.execution_root.owner_id, "kickside.component")
                    test.eq((seen :: any).value.execution_root.record_id, "comp-9")
                    local rejected, root_err = execution_identity.resolve(identity, {
                        deferred_owner = "owner:worker", execution_root = "other-root",
                    })
                    test.is_nil(rejected)
                    test.not_nil(root_err)
                    test.eq(errors.is(root_err, errors.PERMISSION_DENIED), true)
                end)
            end)
        end)

        test.it("rejects a deleted or relinked stored external link before actor creation", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, nil)
            identity.link_id = "link-1"
            local built = 0
            local frame = resolve_frame()
            frame.new_actor = function(id, meta)
                built = built + 1
                return fake_actor(id, meta)
            end
            with_security(frame, function()
                with_contract({ get = function()
                    return resolver_double(live_answer(identity.principal), nil), nil
                end }, function()
                    local function check(answer)
                        with_funcs({ new = function()
                            return { call = function(_self, fn_id, args)
                                test.eq(fn_id, "kickside.identity:link_get")
                                test.eq(args.link_id, "link-1")
                                return answer, nil
                            end }, nil
                        end }, function()
                            local resolved, err = execution_identity.resolve(identity)
                            test.is_nil(resolved)
                            test.not_nil(err)
                            test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                        end)
                    end
                    check(nil)
                    check({ link_id = "link-1", provider = "discord", external_id = "ext-1", user_id = "other" })
                end)
            end)
            test.eq(built, 0)
        end)

        test.it("applies live credential narrowing to the one resolved actor and scope", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, nil)
            identity.credential_id = "cred-1"
            local seen_meta: any = nil
            local frame = resolve_frame()
            frame.new_actor = function(id, meta)
                seen_meta = meta
                return fake_actor(id, meta)
            end
            with_security(frame, function()
                with_contract({ get = function()
                    return resolver_double(live_answer(identity.principal), nil), nil
                end }, function()
                    with_funcs({ new = function()
                        return { call = function(_self, fn_id, args)
                            test.eq(fn_id, "kickside.mcp:credential_restriction")
                            test.eq(args.credential_id, "cred-1")
                            return { credential_id = "cred-1", actor_id = "caller-1", status = "active",
                                whitelist_component_ids = { "comp-1" }, whitelist_prefixes = { "root.comp" } }, nil
                        end }, nil
                    end }, function()
                        local resolved, err = execution_identity.resolve(identity)
                        test.is_nil(err)
                        test.eq(resolved.scope.name, "kickside.mcp.security:session")
                        test.eq(seen_meta.credential_id, "cred-1")
                        test.eq(#seen_meta.security_groups, 1)
                        test.eq(seen_meta.security_groups[1], "users")
                        test.eq(seen_meta.access_filter.prefixes[1], "root.comp")
                    end)
                end)
            end)
        end)

        test.it("refreshes credential groups at every boundary while preserving scope and subtree limits", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, nil)
            identity.credential_id = "cred-1"
            local answer = live_answer(identity.principal, "app.security:admin")
            answer.meta.security_groups = { "stale" }
            local credential: any = { credential_id = "cred-1", actor_id = "caller-1", status = "active",
                whitelist_component_ids = { "comp-1" }, whitelist_prefixes = { "root.comp" } }
            local built = 0
            local frame = resolve_frame()
            frame.new_actor = function(id, meta)
                built = built + 1
                return fake_actor(id, meta)
            end
            with_security(frame, function()
                with_contract({ get = function() return resolver_double(answer, nil), nil end }, function()
                    with_funcs({ new = function()
                        return { call = function() return credential, nil end }, nil
                    end }, function()
                        for _, groups in ipairs({ { "users", "team" }, { "users" }, {}, { "team", "new-team" } }) do
                            answer.groups = groups
                            local resolved, err = execution_identity.resolve(identity)
                            test.is_nil(err)
                            local meta = resolved.actor:meta()
                            test.eq(#meta.security_groups, #groups)
                            for index, group in ipairs(groups) do test.eq(meta.security_groups[index], group) end
                            test.eq(resolved.scope.name, "kickside.mcp.security:session")
                            test.eq(meta.credential_id, "cred-1")
                            test.eq(meta.principal.id, "caller-1")
                            test.eq(meta.access_filter.prefixes[1], "root.comp")
                        end
                        test.eq(built, 4)
                        answer.groups = nil
                        local missing, missing_err = execution_identity.resolve(identity)
                        test.is_nil(missing)
                        test.is_true(errors.is(missing_err, errors.PERMISSION_DENIED))
                        test.eq(built, 4)
                        answer.groups = { "team" }
                        credential.status = "revoked"
                        local revoked, revoked_err = execution_identity.resolve(identity)
                        test.is_nil(revoked)
                        test.is_true(errors.is(revoked_err, errors.PERMISSION_DENIED))
                        test.eq(built, 4)
                        credential.status = "active"
                        credential.actor_id = "other-owner"
                        local mismatched, mismatch_err = execution_identity.resolve(identity)
                        test.is_nil(mismatched)
                        test.is_true(errors.is(mismatch_err, errors.PERMISSION_DENIED))
                        test.eq(built, 4)
                    end)
                end)
            end)
        end)

        test.it("refuses an empty deferred owner before the resolver", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            local opened = 0
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    opened = opened + 1
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, nil), nil
                end }, function()
                    local resolved, err = execution_identity.resolve(identity, { deferred_owner = "" })
                    test.is_nil(resolved)
                    test.not_nil(err)
                    test.eq((err :: any):kind(), errors.INVALID)
                end)
            end)
            test.eq(opened, 0)
        end)

        test.it("refuses a resolver principal or actor mismatch without defaulting", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "other" }, nil), nil, nil), nil
                end }, function()
                    local _, mismatch_err = execution_identity.resolve(identity, nil)
                    test.not_nil(mismatch_err)
                    test.eq(errors.is(mismatch_err, errors.PERMISSION_DENIED), true)
                end)
            end)
        end)

        test.it("denies when the actor-create grant is gone and builds nothing", function()
            local identity = v2_identity({ kind = "group", id = "eng" }, { kind = "user", id = "caller-1" })
            local built = 0
            with_security({
                actor = function() return fake_actor("caller-1", {}) end,
                scope = function() return {} end,
                can = function() return false end,
                new_actor = function(id: string, meta: any)
                    built = built + 1
                    return fake_actor(id, meta or {})
                end,
                named_scope = function(s: string): any return { name = s }, nil end,
            }, function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "group", id = "eng" },
                        "catalog:eng"), nil, nil), nil
                end }, function()
                    local _, err = execution_identity.resolve(identity, nil)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                    test.eq(built, 0)
                end)
            end)
        end)

        test.it("passes the typed carrier through run_as without stringifying", function()
            local carrier = errors.new({ message = "provider blew up", kind = errors.UNAVAILABLE,
                details = { error_kind = "infrastructure" } })
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            local builder: any = nil
            builder = {
                with_actor = function(_self: any, _a: any) return builder end,
                with_scope = function(_self: any, _s: any) return builder end,
                call = function(_self: any, _fn: string, _args: any) return nil, carrier end,
            }
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, nil), nil
                end }, function()
                    with_funcs({ new = function() return builder, nil end }, function()
                        local _, err = execution_identity.run_as(identity, "ns:fn", {})
                        test.is_true(err == carrier)
                    end)
                end)
            end)
        end)

        test.it("parks on revoked delegation with zero downstream calls", function()
            local denied = errors.new({ message = "no delegation grant for group:eng",
                kind = errors.PERMISSION_DENIED, retryable = false,
                details = { code = "delegation_revoked", error_kind = "subject" } })
            local identity = v2_identity({ kind = "group", id = "eng" }, { kind = "user", id = "caller-1" })
            local calls = 0
            local builder: any = nil
            builder = {
                with_actor = function(_self: any, _a: any) calls = calls + 1 return builder end,
                with_scope = function(_self: any, _s: any) calls = calls + 1 return builder end,
                call = function(_self: any, _fn: string, _args: any) calls = calls + 1 return nil, nil end,
            }
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(nil, denied, nil), nil
                end }, function()
                    with_funcs({ new = function() return builder, nil end }, function()
                        local _, err = execution_identity.run_as(identity, "ns:fn", {})
                        test.is_true(err == denied)
                        test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                        test.eq((err :: any):retryable(), false)
                        test.eq((err :: any):details().code, "delegation_revoked")
                        test.eq(calls, 0)
                    end)
                end)
            end)
        end)

        test.it("fails each builder grant separately with a typed denial", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, nil), nil
                end }, function()
                    with_funcs({ new = function() return nil, "no builder" end }, function()
                        local _, builder_err = execution_identity.bind(identity, nil)
                        test.not_nil(builder_err)
                        test.eq(errors.is(builder_err, errors.UNAVAILABLE), true)
                    end)
                    local scope_denied: any = {
                        with_actor = function(_self: any, _a: any) return scope_denied end,
                        with_scope = function(_self: any, _s: any) return nil, "scope denied" end,
                    }
                    with_funcs({ new = function() return scope_denied, nil end }, function()
                        local _, scope_err = execution_identity.bind(identity, nil)
                        test.not_nil(scope_err)
                        test.eq(errors.is(scope_err, errors.PERMISSION_DENIED), true)
                    end)
                end)
            end)
        end)

        test.it("preserves native resolver failures without losing structured metadata", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            local upstream = errors.new({ message = "resolver transport unavailable", kind = errors.UNAVAILABLE,
                retryable = true, details = { code = "resolver_transport", endpoint = "scope" } })
            with_security(resolve_frame(), function()
                with_contract({ get = function() return nil, upstream end }, function()
                    local result, err = execution_identity.authorize(identity)
                    test.is_nil(result)
                    test.eq(err, upstream)
                    test.eq(errors.is(err, errors.UNAVAILABLE), true)
                    test.eq((err :: any):retryable(), true)
                    test.eq((err :: any):details().code, "resolver_transport")
                    test.eq((err :: any):details().endpoint, "scope")
                end)
            end)
        end)

        test.it("keeps nested envelopes byte-equivalent through run_as", function()
            local identity = v2_identity({ kind = "user", id = "caller-1" }, { kind = "user", id = "caller-1" })
            local sent: any = nil
            local builder: any = nil
            builder = {
                with_actor = function(_self: any, _a: any) return builder end,
                with_scope = function(_self: any, _s: any) return builder end,
                call = function(_self: any, _fn: string, args: any)
                    sent = args
                    return { ok = true }, nil
                end,
            }
            local nested = { trigger_id = "binding-42",
                envelopes = { { dedup_key = "event-7", item = { lead = { email = "nested@example.test" } } } } }
            with_security(resolve_frame(), function()
                with_contract({ get = function()
                    return resolver_double(live_answer({ kind = "user", id = "caller-1" }, nil), nil, nil), nil
                end }, function()
                    with_funcs({ new = function() return builder, nil end }, function()
                        local res, err = execution_identity.run_as(identity, "ns:fn", nested)
                        test.is_nil(err)
                        test.eq((res :: any).ok, true)
                        test.is_true(sent == nested)
                    end)
                end)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
