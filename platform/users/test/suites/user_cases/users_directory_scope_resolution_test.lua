local test = require("test")
local json = require("json")
local time = require("time")
local sql = require("sql")
local crypto = require("crypto")
local hash = require("hash")
local security = require("security")
local user_repo = require("user_repo")
local user_credentials_repo = require("user_credentials_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local user_group_sources_repo = require("user_group_sources_repo")
local admin_repo = require("admin_repo")
local provisioning = require("provisioning")
local directory = require("directory")
local scope_resolver = require("scope_resolver")
local execution_identity = require("execution_identity")
local set_user_groups = require("set_user_groups")
local delete_user = require("delete_user")
local delete_principal = require("delete_principal")
local update_user = require("update_user")
local list_users = require("list_users")
local lifecycle_report = require("lifecycle_report")
local session_index = require("session_index")

local TEST_USER_ID = "test_user_structure_suite"
local TEST_EMAIL = TEST_USER_ID .. "@test.local"

local function define_tests()
    test.describe("user management", function()
        test.it("resolves an email share reference to the login user id", function()
            local suffix, suffix_err = crypto.random.uuid()
            test.is_nil(suffix_err)
            local email = "share-" .. suffix .. "@northwind.example"
            local created, create_err = user_repo.create({ email = email, full_name = "Northwind Member", password = "Northwind-2026!", status = "active" })
            test.is_nil(create_err)
            local answer, resolve_err = directory.resolve({ refs = { { type = "user", id = email:upper() } } })
            test.is_nil(resolve_err)
            test.eq(answer.principals[1].id, created.user_id)
        end)
        test.describe("scope resolver v2 explicit path", function()
            test.it("preserves builder errors before subject lookup", function()
                local source = errors.new({kind = errors.TIMEOUT, retryable = true,
                    message = "subject executor unavailable", details = {code = "subject_executor"}})
                local previous = rawget(scope_resolver, "_funcs")
                rawset(scope_resolver, "_funcs", {new = function() return nil, source end})
                local ok, resolved, err = pcall(scope_resolver.lookup_subject, "user-lookup")
                rawset(scope_resolver, "_funcs", previous)
                test.is_true(ok)
                test.is_nil(resolved)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.TIMEOUT))
                test.eq(err:details().code, "subject_executor")
                test.is_true(err:retryable())
            end)
            test.it("classifies an absent subject builder as unavailable", function()
                local previous = rawget(scope_resolver, "_funcs")
                rawset(scope_resolver, "_funcs", {new = function() return nil, nil end})
                local ok, resolved, err = pcall(scope_resolver.lookup_subject, "user-lookup")
                rawset(scope_resolver, "_funcs", previous)
                test.is_true(ok)
                test.is_nil(resolved)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.eq(err:details().error_kind, "infrastructure")
                test.is_true(err:retryable())
            end)
            local sid = ""
            local semail = "scope_" .. tostring(os.time()) .. "@test.local"
            local other = ""

            local function fake_actor(id)
                return { id = function() return id end, meta = function() return {} end }
            end

            local function with_overrides(overrides, body)
                local saved = {}
                for key, value in pairs(overrides) do
                    saved[key] = rawget(scope_resolver, key)
                    rawset(scope_resolver, key, value)
                end
                local ok, err = pcall(body)
                for key, _ in pairs(overrides) do rawset(scope_resolver, key, saved[key]) end
                if not ok then error(err) end
            end

            local function self_security(id)
                return {
                    actor = function() return fake_actor(id) end,
                    can = function() return false end,
                    policy = function() return nil, "no policy" end,
                }
            end

            test.it("resolves explicit self through the store, not the ambient snapshot", function()
                local created, cerr = user_repo.create({
                    email = semail, full_name = "Scope Resolver", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                sid = tostring(created.user_id)
                local _, serr = user_group_sources_repo.set_user_groups(sid, { "app.security:admin" })
                test.is_nil(serr)

                with_overrides({ _security = self_security(sid) }, function()
                    local resolved, err = scope_resolver.resolve({ principal = { kind = "user", id = sid } })
                    test.is_nil(err)
                    test.eq(resolved.principal.kind, "user")
                    test.eq(resolved.principal.id, sid)
                    test.eq(resolved.actor_id, sid)
                    local found_admin = false
                    for _, g in ipairs(resolved.groups or {}) do
                        if g == "app.security:admin" then found_admin = true end
                    end
                    test.is_true(found_admin)
                    test.not_nil(resolved.scope_name)
                end)
            end)

            test.it("resolves explicit self through the Users-owned function lookup", function()
                local previous_funcs = rawget(scope_resolver, "_funcs")
                local previous_security = rawget(scope_resolver, "_security")
                local called_target = ""
                local called_subject = ""
                rawset(scope_resolver, "_security", self_security("reconciliation-self"))
                rawset(scope_resolver, "_funcs", { new = function()
                    return { call = function(_self, target, args)
                        called_target = target
                        called_subject = args.subject_id
                        return { subject_id = called_subject, groups = { "app.security:user" },
                            scope_name = "app.security:user",
                            meta = { user_id = called_subject, status = "active" } }, nil
                    end }
                end })
                local resolved, err = scope_resolver.resolve({ principal = { kind = "user", id = "reconciliation-self" } })
                rawset(scope_resolver, "_funcs", previous_funcs)
                rawset(scope_resolver, "_security", previous_security)
                test.is_nil(err)
                test.eq(called_target, "kickside.users.binding:subject_lookup")
                test.eq(called_subject, "reconciliation-self")
                test.eq(resolved.actor_id, "reconciliation-self")
                test.eq(resolved.groups[1], "app.security:user")
            end)

            test.it("preserves the complete Users-owned executable scope descriptor", function()
                with_overrides({ _security = self_security("scope-descriptor-self"),
                    _funcs = { new = function()
                        return { call = function(_self, _target, args)
                            return { subject_id = args.subject_id, groups = { "app.security:user", "app.security:admin" },
                                scope_name = "app.security:admin",
                                scope_groups = { "app.security:user", "app.security:admin" },
                                meta = { user_id = args.subject_id, status = "active" } }, nil
                        end }
                    end } }, function()
                    local resolved, err = scope_resolver.resolve({ principal = { kind = "user", id = "scope-descriptor-self" } })
                    test.is_nil(err)
                    test.eq(#resolved.scope_groups, 2)
                    test.eq(resolved.scope_groups[1], "app.security:user")
                    test.eq(resolved.scope_groups[2], "app.security:admin")
                end)
            end)

            test.it("rejects malformed Users-owned executable scope descriptors", function()
                local malformed = { "app.security:user", {}, { "" }, { false },
                    { "app.security:user", 17 }, { [2] = "app.security:user" },
                    { unexpected = "app.security:user" } }
                for _, scope_groups in ipairs(malformed) do
                    with_overrides({ _security = self_security("scope-descriptor-self"),
                        _funcs = { new = function()
                            return { call = function(_self, _target, args)
                                return { subject_id = args.subject_id, groups = { "app.security:user" },
                                    scope_name = "app.security:user", scope_groups = scope_groups,
                                    meta = { user_id = args.subject_id, status = "active" } }, nil
                            end }
                        end } }, function()
                        local resolved, err = scope_resolver.resolve({ principal = { kind = "user", id = "scope-descriptor-self" } })
                        test.is_nil(resolved)
                        test.not_nil(err)
                        test.is_true(errors.is(err, errors.UNAVAILABLE))
                    end)
                end
            end)

            test.it("denies another user without delegation", function()
                local created, cerr = user_repo.create({
                    email = "other_" .. semail, full_name = "Other", password = "testpass123", status = "active",
                })
                test.is_nil(cerr)
                other = tostring(created.user_id)
                with_overrides({ _security = self_security(sid) }, function()
                    local _, err = scope_resolver.resolve({ principal = { kind = "user", id = other } })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("allows explicit delegation only when the recorded authorizer's live scope allows it", function()
                local root = "comp-1"
                local bytes = execution_identity.delegation_bytes("user", other, root)
                with_overrides({ _security = {
                    actor = function() return fake_actor(sid) end,
                    can = function() return false end,
                    policy = function() return nil, "policy records do not authorize delegation" end,
                }, _evaluate_live_scope = function(authorized, action, resources)
                    test.eq(authorized.principal.kind, "user")
                    test.eq(authorized.principal.id, sid)
                    test.eq(authorized.actor_id, sid)
                    test.not_nil(authorized.scope_name)
                    test.not_nil(authorized.scope_groups)
                    test.eq(authorized.meta.user_id, sid)
                    test.not_nil(authorized.meta.security_groups)
                    test.eq(#authorized.meta.security_groups, 1)
                    test.eq(authorized.meta.security_groups[1], "app.security:admin")
                    test.eq(action, execution_identity.DELEGATE_ACTION)
                    test.eq(resources[1], bytes)
                    test.eq(resources[2], execution_identity.delegation_bytes("user", other, "*"))
                    return "allow", nil
                end }, function()
                    local resolved, err = scope_resolver.resolve({
                        principal = { kind = "user", id = other },
                        authorized_by = { kind = "user", id = sid },
                        execution_root = root,
                    })
                    test.is_nil(err)
                    test.eq(resolved.principal.id, other)
                    test.eq(resolved.actor_id, other)
                end)
            end)

            test.it("denies delegation when native authorizer evaluation is undefined or denied", function()
                local root = "comp-1"
                local cases = {
                    { name = "no policy", decision = "undefined" },
                    { name = "ambient allow without native authority", decision = "undefined", grant = {} },
                    { name = "expired record", decision = "undefined", grant = { expires_at = "2020-01-01T00:00:00Z" } },
                    { name = "self-granted record", decision = "undefined", grant = { granted_by = { kind = "user", id = other } } },
                    { name = "group-granted record", decision = "undefined", grant = { granted_by = { kind = "group", id = "admins" } } },
                    { name = "inactive service-granted record", decision = "undefined", grant = { granted_by = { kind = "service", id = "no_such_service" } } },
                    { name = "resource mismatch", decision = "undefined", grant = { resource = "wrong" } },
                    { name = "native deny", decision = "deny", grant = {} },
                }
                for _, case in ipairs(cases) do
                    with_overrides({ _security = {
                        actor = function() return fake_actor(sid) end,
                        can = function() return true end,
                        policy = function() return case.grant, nil end,
                    }, _evaluate_live_scope = function()
                        return case.decision, nil
                    end }, function()
                        local _, err = scope_resolver.resolve({
                            principal = { kind = "user", id = other },
                            execution_root = root,
                        })
                        test.not_nil(err, case.name)
                        test.eq(errors.is(err, errors.PERMISSION_DENIED), true, case.name)
                    end)
                end
            end)

            test.it("evaluates native delegation policies under the authorizer's native scope", function()
                local authorizer = { kind = "user", id = sid }
                local meta = { user_id = sid, status = "active" }
                local descriptor = { principal = authorizer, actor_id = sid,
                    scope_name = "app.security:delegation_authorizer",
                    scope_groups = { "app.security:delegation_authorizer" }, meta = meta }
                local allowed, allow_err = execution_identity.evaluate_live_scope(descriptor, execution_identity.DELEGATE_ACTION,
                    { "native-delegation-resource" })
                test.is_nil(allow_err)
                test.eq(allowed, "allow")
                local denied, deny_err = execution_identity.evaluate_live_scope(descriptor, execution_identity.DELEGATE_ACTION,
                    { "native-delegation-resource", "native-delegation-denied-resource" })
                test.is_nil(deny_err)
                test.eq(denied, "deny")
                local missing, missing_err = execution_identity.evaluate_live_scope(descriptor, execution_identity.DELEGATE_ACTION,
                    { "native-delegation-missing-resource" })
                test.is_nil(missing_err)
                test.eq(missing, "undefined")
            end)

            test.it("retains selected source policy IDs while evaluating live delegation", function()
                local source = "app:selected_delegation"
                with_overrides({ _security = self_security(sid),
                    _funcs = {new = function() return {call = function(_builder, _id, args)
                        return {subject_id = args.subject_id, groups = {}, scope_name = "app:custom_scope",
                            scope_groups = {}, scope_policy_ids = {source}, meta = {}}, nil
                    end}, nil end},
                    _evaluate_live_scope = function(descriptor)
                        test.eq(descriptor.scope_policy_ids[1], source)
                        return "allow", nil
                    end,
                }, function()
                    local result, err = scope_resolver.resolve({principal = {kind = "user", id = other}})
                    test.is_nil(err)
                    test.eq(result.scope_policy_ids[1], source)
                end)
            end)

            test.it("rejects group authorizers", function()
                with_overrides({ _security = self_security(sid) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        authorized_by = { kind = "group", id = "admins" },
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.INVALID), true)
                end)
            end)

            -- Deferred resolution: a trusted owner entry (a worker frame holding
            -- kickside.execution.defer on its owner id) resolves a stored identity
            -- against the recorded authorizer, never against the worker itself.
            local OWNER = "kickside.core.projections:tick"

            local function worker_security(owner_granted: boolean, delegate_can: boolean, policy_of: any)
                return {
                    actor = function() return fake_actor("system:projections") end,
                    can = function(action, resource)
                        if action == execution_identity.DEFERRED_ACTION then
                            return owner_granted and resource == OWNER
                        end
                        return delegate_can
                    end,
                    policy = function(id)
                        if policy_of then return policy_of(id) end
                        return nil, "no policy"
                    end,
                }
            end

            test.it("resolves a deferred self identity for a trusted owner entry", function()
                with_overrides({ _security = worker_security(true, false, nil) }, function()
                    local resolved, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        authorized_by = { kind = "user", id = sid },
                        deferred_owner = OWNER,
                    })
                    test.is_nil(err)
                    test.eq(resolved.principal.id, sid)
                    test.eq(resolved.actor_id, sid)
                end)
            end)

            test.it("refuses deferred work when the recorded authorizer loses root ADMIN", function()
                local checked = 0
                with_overrides({
                    _security = worker_security(true, false, nil),
                    _root_admin = function(root, authorizer)
                        checked = checked + 1
                        test.eq(authorizer.id, sid)
                        test.eq(root, "comp-1")
                        return false, nil
                    end,
                }, function()
                    local resolved, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        authorized_by = { kind = "user", id = sid },
                        execution_root = { owner_id = "kickside.component", record_id = "comp-1" },
                        deferred_owner = OWNER,
                    })
                    test.is_nil(resolved)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                    test.eq(err:details().error_kind, "access")
                end)
                test.eq(checked, 1)
            end)

            test.it("keeps a root ACL outage distinct from revoked ADMIN", function()
                with_overrides({
                    _security = worker_security(true, false, nil),
                    _root_admin = function()
                        return false, errors.new({ message = "ACL database unavailable", kind = errors.UNAVAILABLE })
                    end,
                }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        authorized_by = { kind = "user", id = sid },
                        execution_root = { owner_id = "kickside.component", record_id = "comp-1" },
                        deferred_owner = OWNER,
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.UNAVAILABLE), true)
                    test.eq(err:details().error_kind, "infrastructure")
                end)
            end)

            test.it("refuses deferred resolution from an entry without the owner grant", function()
                with_overrides({ _security = worker_security(false, true, nil) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        authorized_by = { kind = "user", id = sid },
                        deferred_owner = OWNER,
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("refuses deferred resolution without a recorded authorizer", function()
                with_overrides({ _security = worker_security(true, false, nil) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = sid },
                        deferred_owner = OWNER,
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.INVALID), true)
                end)
            end)

            test.it("refuses a deferred identity whose authorizer is no longer a live user", function()
                with_overrides({ _security = worker_security(true, true, nil) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = "missing_" .. tostring(os.time()) },
                        authorized_by = { kind = "user", id = "missing_" .. tostring(os.time()) },
                        deferred_owner = OWNER,
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("evaluates deferred delegation under the recorded authorizer, never the worker", function()
                local root = "comp-1"
                local bytes = execution_identity.delegation_bytes("user", other, root)
                local args = {
                    principal = { kind = "user", id = other },
                    authorized_by = { kind = "user", id = sid },
                    execution_root = root,
                    deferred_owner = OWNER,
                }
                with_overrides({ _security = worker_security(true, true, function()
                    return { action = "security.actor.delegate", resource = bytes }, nil
                end), _evaluate_live_scope = function(authorized, action, resources)
                    test.eq(authorized.principal.kind, "user")
                    test.eq(authorized.principal.id, sid)
                    test.is_false(authorized.principal.id == "system:projections")
                    test.not_nil(authorized.scope_name)
                    test.eq(authorized.meta.user_id, sid)
                    test.eq(authorized.meta.security_groups[1], "app.security:admin")
                    test.eq(action, execution_identity.DELEGATE_ACTION)
                    test.eq(resources[1], bytes)
                    return "allow", nil
                end }, function()
                    local resolved, err = scope_resolver.resolve(args)
                    test.is_nil(err)
                    test.eq(resolved.principal.id, other)
                end)
                -- The worker's broad delegation capability cannot answer for
                -- the recorded authorizer when native evaluation is undefined.
                with_overrides({ _security = worker_security(true, true, nil),
                    _evaluate_live_scope = function() return "undefined", nil end }, function()
                    local _, err = scope_resolver.resolve(args)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("default-denies group selection even with membership, a catalog scope, and a native allow", function()
                local gid = "id_group_" .. tostring(os.time())
                with_overrides({
                    _security = {
                        actor = function() return fake_actor(sid) end,
                        can = function() return true end,
                    },
                    _funcs = { new = function()
                        return { call = function(_self, _target, args)
                            test.eq(args.subject_id, sid)
                            return { subject_id = sid, groups = { "app.security:admin", gid },
                                scope_name = "app.security:admin", scope_groups = { "app.security:admin" },
                                meta = { user_id = sid, status = "active" } }, nil
                        end }
                    end },
                    _group_scope = function() return "catalog:" .. gid, nil end,
                    _evaluate_live_scope = function() return "allow", nil end,
                }, function()
                    local resolved, err = scope_resolver.resolve({
                        principal = { kind = "group", id = gid },
                        execution_root = "comp-1",
                    })
                    test.is_nil(resolved)
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("denies group execution without a catalog entry", function()
                with_overrides({ _security = self_security(sid) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "group", id = "no-catalog-group" },
                        execution_root = "*",
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("default-denies service selection even when a service catalog record exists", function()
                with_overrides({ _security = self_security(sid),
                    _service_record = function() return { execution_scope = "service:scope" }, nil end }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "service", id = "sync" },
                        execution_root = "*",
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                end)
            end)

            test.it("normalizes a missing principal to PERMISSION_DENIED", function()
                with_overrides({ _security = self_security(sid) }, function()
                    local _, err = scope_resolver.resolve({
                        principal = { kind = "user", id = "nobody-missing-" .. tostring(os.time()) },
                    })
                    test.not_nil(err)
                    test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                    test.eq(err:details().error_kind, "subject")
                end)
            end)

            test.it("keeps a lookup outage typed infrastructure without falling through", function()
                local outage = errors.new({ message = "store down", kind = errors.UNAVAILABLE,
                    details = { error_kind = "infrastructure" } })
                with_overrides({
                    _security = self_security(sid),
                    _funcs = { new = function()
                        return { call = function() return nil, outage end }
                    end },
                }, function()
                    local _, err = scope_resolver.resolve({ principal = { kind = "user", id = sid } })
                    test.is_true(err == outage)
                end)
            end)

            test.it("requires an explicit principal", function()
                local result, err = scope_resolver.resolve({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                local missing, missing_err = scope_resolver.resolve(nil)
                test.is_nil(missing)
                test.is_true(errors.is(missing_err, errors.INVALID))
            end)

        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
