local test = require("test")
local execution_identity_module = require("execution_identity")
local funcs = require("funcs")
local security = require("security")
local native_capture_probe = require("native_capture_probe")
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
        test.it("keeps authorization dependencies off the production module table", function()
            test.is_nil(execution_identity._security)
            test.is_nil(execution_identity._funcs)
            test.is_nil(execution_identity._contract)
        end)
        test.it("has no legacy constructor surface", function()
            test.is_nil((execution_identity :: any).reconstruct)
            test.is_nil((execution_identity :: any).reconstruct_row)
            test.is_nil((execution_identity :: any).resolve_subject)
            test.eq(execution_identity.VERSION, 2)
        end)

        test.it("owns every identity primitive in one definition", function()
            test.eq(execution_identity.DELEGATE_ACTION, "security.actor.delegate")
            test.eq(execution_identity.KIND.USER, "user")
            test.eq(execution_identity.KIND.GROUP, "group")
            test.eq(execution_identity.KIND.SERVICE, "service")
            local checked, check_err = execution_identity.check_principal({ kind = "group", id = "eng" }, "principal")
            test.is_nil(check_err)
            test.eq((checked :: any).kind, "group")
            local _, kind_err = execution_identity.check_principal({ kind = "agent", id = "a" }, "principal")
            test.not_nil(kind_err)
            local _, id_err = execution_identity.check_principal({ kind = "user", id = "a:b" }, "principal")
            test.not_nil(id_err)
            test.is_true(execution_identity.is_valid_id("u1"))
            test.is_false(execution_identity.is_valid_id("principal:group:x"))
            test.is_false(execution_identity.is_valid_id("system:worker"))
            test.is_true(execution_identity.same_principal({ kind = "user", id = "u" }, { kind = "user", id = "u" }))
            test.is_false(execution_identity.same_principal({ kind = "user", id = "u" }, { kind = "group", id = "u" }))
            test.is_true(type(execution_identity.utc_now()) == "string" and execution_identity.utc_now() ~= "")
        end)

        test.it("reads every reserved actor key back into its principal", function()
            local cases = {
                { key = "u1", kind = "user", id = "u1" },
                { key = "principal:group:eng", kind = "group", id = "eng" },
                { key = "principal:service:sync", kind = "service", id = "sync" },
            }
            for _, case in ipairs(cases) do
                local principal, err = execution_identity.principal_of_key(case.key)
                test.is_nil(err)
                test.eq((principal :: any).kind, case.kind)
                test.eq((principal :: any).id, case.id)
                test.eq(execution_identity.actor_key(principal :: any), case.key)
            end
            for _, bad in ipairs({ "", "system:automation", "principal:group:", "principal:agent:x", "a b" }) do
                local principal, err = execution_identity.principal_of_key(bad)
                test.is_nil(principal)
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.INVALID)
            end
            test.is_true(execution_identity.is_maintenance_key("system:automation"))
            test.is_false(execution_identity.is_maintenance_key("u1"))
            test.is_false(execution_identity.is_maintenance_key("principal:service:sync"))
        end)

        test.it("captures a service actor key as a service authorizer", function()
            with_security({
                actor = function() return fake_actor("principal:service:sync", {}) end,
            }, function()
                local identity, err = execution_identity.capture(nil)
                test.is_nil(err)
                test.eq((identity :: any).authorized_by.kind, "service")
                test.eq((identity :: any).authorized_by.id, "sync")
                test.eq((identity :: any).principal.kind, "service")
            end)
            with_security({
                actor = function() return fake_actor("principal:group:eng", {}) end,
            }, function()
                local _, err = execution_identity.capture(nil)
                test.not_nil(err)
                test.eq((err :: any):kind(), errors.PERMISSION_DENIED)
            end)
        end)

        test.it("round-trips user, group and service principals through one codec", function()
            local cases = {
                { kind = "user", id = "u1", key = "u1" },
                { kind = "group", id = "eng", key = "principal:group:eng" },
                { kind = "service", id = "sync", key = "principal:service:sync" },
            }
            for _, case in ipairs(cases) do
                local identity = v2_identity({ kind = case.kind, id = case.id }, { kind = "user", id = "admin-1" })
                test.is_true((execution_identity.validate(identity)))
                local row, row_err = execution_identity.to_row(identity)
                test.is_nil(row_err)
                test.eq(row.actor_id, case.key)
                local back, back_err = execution_identity.from_row(row.actor_id, row.actor_context)
                test.is_nil(back_err)
                test.eq(back.principal.kind, case.kind)
                test.eq(back.principal.id, case.id)
                test.eq(back.authorized_by.id, "admin-1")
            end
        end)

        test.it("keeps the same textual id in two kinds distinct", function()
            local user_row = execution_identity.to_row(v2_identity({ kind = "user", id = "same" }, nil))
            local group_row = execution_identity.to_row(v2_identity({ kind = "group", id = "same" }, nil))
            test.is_true(user_row.actor_id ~= group_row.actor_id)
            local user_back = execution_identity.from_row(user_row.actor_id, user_row.actor_context)
            test.eq(user_back.principal.kind, "user")
        end)

        test.it("refuses unknown kinds, group authorizers and delimited ids", function()
            test.is_false((execution_identity.validate(v2_identity({ kind = "agent", id = "a" }, nil))))
            test.is_false((execution_identity.validate(v2_identity({ kind = "user", id = "u" },
                { kind = "group", id = "g" }))))
            for _, bad in ipairs({ "a:b", "a b", "principal:group:x", "system:worker", "" }) do
                test.is_false((execution_identity.validate(v2_identity({ kind = "user", id = bad }, nil))),
                    "id refused: " .. bad)
            end
            test.is_false((execution_identity.validate({ version = 1, principal = { kind = "user", id = "u" },
                authorized_by = { kind = "user", id = "u" }, captured_at = "t" })))
            test.is_false((execution_identity.validate({ actor_id = "u", actor_context = { version = 1 } })))
        end)

        test.it("returns native Invalid failures for every identity validation refusal", function()
            local cases: { any } = {
                false,
                { version = 1 },
                v2_identity({ kind = "agent", id = "a" }, nil),
                { version = 2, principal = { kind = "user", id = "u" } },
                v2_identity({ kind = "user", id = "u" }, { kind = "group", id = "g" }),
                v2_identity({ kind = "user", id = "u" }, { kind = "user", id = "bad:id" }),
                { version = 2, principal = { kind = "user", id = "u" },
                    authorized_by = { kind = "user", id = "u" }, captured_at = "" },
            }
            for _, field in ipairs({ "component_id", "credential_id", "link_id" }) do
                local candidate = v2_identity({ kind = "user", id = "u" }, nil)
                candidate[field] = false
                cases[#cases + 1] = candidate
            end
            for _, candidate in ipairs(cases) do
                local valid, err = execution_identity.validate(candidate)
                test.is_false(valid)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_false(err:retryable())
                test.eq(err:details().code, "declaration")
            end
        end)

        test.it("retains the native validation cause through authorization and row codecs", function()
            local invalid = v2_identity({ kind = "agent", id = "a" }, nil)
            for _, operation in ipairs({
                function() return execution_identity.authorize(invalid) end,
                function() return execution_identity.to_row(invalid) end,
                function() return execution_identity.from_row("u", invalid) end,
            }) do
                local result, err = operation()
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_false(err:retryable())
                test.eq(err:details().code, "declaration")
                test.eq(err:details().cause.kind, errors.INVALID)
                test.is_false(err:details().cause.retryable)
                test.eq(err:details().cause.details.code, "declaration")
            end
        end)

        test.it("retains the native JSON failure in a malformed stored row", function()
            local _, decode_err = require("json").decode("{")
            local result, err = execution_identity.from_row("u", "{")
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.is_false(err:retryable())
            test.eq(err:details().code, "declaration")
            local cause = err:details().cause
            test.eq(cause.kind, decode_err:kind())
            test.eq(cause.message, decode_err:message())
            test.eq(cause.retryable, decode_err:retryable())
            test.eq(cause.details, decode_err:details())
        end)

        test.it("retains the validation cause when admitted metadata is refused", function()
            with_security({ actor = function()
                return fake_actor("u", { execution_identity = { version = 1 } })
            end }, function()
                local captured, err = execution_identity.capture(nil)
                test.is_nil(captured)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.is_false(err:retryable())
                test.eq(err:details().code, "subject")
                test.eq(err:details().cause.kind, errors.INVALID)
                test.is_false(err:details().cause.retryable)
                test.eq(err:details().cause.details.code, "declaration")
            end)
        end)

        test.it("refuses a row whose actor_id does not match the stored principal", function()
            local row = execution_identity.to_row(v2_identity({ kind = "group", id = "eng" }, nil))
            local _, err = execution_identity.from_row("eng", row.actor_context)
            test.not_nil(err)
            test.eq(errors.is(err, errors.INVALID), true)
        end)

        test.it("carries the retry classification on every typed failure", function()
            local row = execution_identity.to_row(v2_identity({ kind = "group", id = "eng" }, nil))
            local _, declaration_err = execution_identity.from_row("eng", row.actor_context)
            test.eq((declaration_err :: any):retryable(), false)

            with_security(resolve_frame(), function()
                with_contract({ get = function() return nil, "resolver down" end }, function()
                    local _, unavailable_err = execution_identity.resolve(v2_identity({ kind = "user", id = "u1" }, nil))
                    test.eq((unavailable_err :: any):kind(), errors.UNAVAILABLE)
                    test.eq((unavailable_err :: any):retryable(), true)
                end)
            end)
        end)

        test.it("keeps single scope lookup failures unchanged", function()
            local unavailable = errors.new({ message = "scope storage unavailable", kind = errors.UNAVAILABLE,
                retryable = true, details = { code = "scope_storage" } })
            with_security({
                named_scope = function() return nil, unavailable end,
            }, function()
                local scope, err = execution_identity.scope_from_groups({ "app.security:user" })
                test.is_nil(scope)
                test.eq(err, unavailable)
                test.eq(errors.is(err, errors.UNAVAILABLE), true)
                test.eq((err :: any):retryable(), true)
                test.eq((err :: any):details().code, "scope_storage")
            end)
        end)

        test.it("keeps scope policy denial while retaining its typed cause", function()
            local unavailable = errors.new({ message = "scope storage unavailable", kind = errors.UNAVAILABLE,
                retryable = true, details = { code = "scope_storage", source = "security" } })
            with_security({
                named_scope = function() return nil, unavailable end,
            }, function()
                local scope, err = execution_identity.scope_from_groups({ "app.security:user", "app.security:admin" })
                test.is_nil(scope)
                test.eq(errors.is(err, errors.PERMISSION_DENIED), true)
                test.eq((err :: any):retryable(), false)
                test.eq((err :: any):details().code, "subject")
                test.eq((err :: any):details().cause.kind, errors.UNAVAILABLE)
                test.eq((err :: any):details().cause.message, "scope storage unavailable")
                test.eq((err :: any):details().cause.retryable, true)
                test.eq((err :: any):details().cause.details.code, "scope_storage")
                test.eq((err :: any):details().cause.details.source, "security")
            end)
        end)



        test.it("refuses component ADMIN self-grants and group grantors", function()
            local self_grant = execution_identity.check_grant(
                { kind = "group", id = "eng" }, { kind = "group", id = "eng" })
            test.not_nil(self_grant)
            local group_grantor = execution_identity.check_grant(
                { kind = "group", id = "eng" }, { kind = "group", id = "admins" })
            test.not_nil(group_grantor)
            test.is_nil(execution_identity.check_grant(
                { kind = "group", id = "eng" }, { kind = "user", id = "admin-1" }))
        end)


        test.it("captures an explicit principal with the caller as authorizer", function()
            with_security({
                actor = function() return fake_actor("caller-1", {}) end,
            }, function()
                local identity, err = execution_identity.capture({
                    principal = { kind = "group", id = "eng" },
                    component_id = "comp-1",
                })
                test.is_nil(err)
                test.eq(identity.principal.kind, "group")
                test.eq(identity.authorized_by.kind, "user")
                test.eq(identity.authorized_by.id, "caller-1")
                test.eq(identity.component_id, "comp-1")
            end)
        end)


        test.it("refuses derived fields, system actors and missing actors at capture", function()
            with_security({
                actor = function() return fake_actor("caller-1", {}) end,
            }, function()
                local _, derived_err = execution_identity.capture({
                    principal = { kind = "user", id = "caller-1" },
                    authorized_by = { kind = "user", id = "caller-1" },
                })
                test.not_nil(derived_err)
                test.eq(errors.is(derived_err, errors.INVALID), true)
            end)
            with_security({
                actor = function() return fake_actor("system:lifecycle", { system = true }) end,
            }, function()
                local _, system_err = execution_identity.capture(nil)
                test.not_nil(system_err)
            end)
            with_security({ actor = function() return nil end }, function()
                local _, auth_err = execution_identity.capture(nil)
                test.not_nil(auth_err)
            end)
        end)

        test.it("keeps the admitted identity and restrictive native scope through a nested function call", function()
            local policy, policy_err = security.policy("app:identity_capture_scope")
            test.is_nil(policy_err)
            test.not_nil(policy)
            local selected = { kind = "user", id = "selected-user" }
            local actor, actor_err = security.new_actor("selected-user", {
                principal = selected,
                execution_identity = {
                    version = 2,
                    principal = selected,
                    authorized_by = { kind = "user", id = "original-authorizer" },
                    component_id = "component-root",
                    credential_id = "credential-boundary",
                    link_id = "link-boundary",
                    captured_at = "2026-10-07T00:00:00Z",
                },
            })
            test.is_nil(actor_err)
            test.not_nil(actor)
            local scope, scope_err = security.new_scope({ policy })
            test.is_nil(scope_err)
            test.not_nil(scope)

            local result, call_err = funcs.new():with_actor(actor):with_scope(scope):call("app:native_capture_probe", {})
            test.is_nil(call_err, tostring(call_err))
            test.not_nil(result)
            test.eq(result.actor_id, "selected-user")
            test.eq(result.identity.principal.id, "selected-user")
            test.eq(result.identity.authorized_by.id, "original-authorizer")
            test.eq(result.identity.component_id, "component-root")
            test.eq(result.identity.credential_id, "credential-boundary")
            test.eq(result.identity.link_id, "link-boundary")
            test.eq(result.allowed, true)
            test.eq(result.broad, false)
        end)












    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
