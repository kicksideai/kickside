-- Splash scope suite. A per-user splash is seen once per user (profile field
-- kickside.ui:seen_splashes); an instance splash (the welcome setup wizard) is
-- completed once for the whole instance (setting kickside.ui:completed_splashes).
-- Every call runs through the splash library under an explicit actor and scope.

local test = require("test")
local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local ui_types = require("ui_types")

local WELCOME = "welcome"
local TOUR = "ui_test_tour"
local PROBE = "kickside.ui:splash_probe"

local function policy(id: string): security.Policy
    local p, err = security.policy(id)
    if not p then error("policy " .. id .. ": " .. tostring(err)) end
    return p
end

local function admin_scope(): any
    return security.new_scope({ policy("app:admin") })
end

local function member_scope(): any
    return security.new_scope({ policy("app:member"), policy("app:member_admin_denied") })
end

local function call(actor_id: string, scope: any, op: string, id: string?): any
    local result, err = funcs.new()
        :with_actor(security.new_actor(actor_id, {}))
        :with_scope(scope)
        :call(PROBE, op, id)
    if err then error("splash probe " .. op .. ": " .. tostring(err)) end
    return result
end

local function resolved_id(actor_id: string, scope: any): string?
    local r = call(actor_id, scope, "resolve")
    if r.splash then return tostring(r.splash.id) end
    return nil
end

local function instance_completed(): { string }
    local def, derr = contract.get("kickside.settings:settings")
    if not def then error("settings contract: " .. tostring(derr)) end
    local inst, oerr = def
        :with_actor(security.new_actor("app:ui_test_reader", {}))
        :with_scope(admin_scope())
        :open()
    if not inst then error("settings open: " .. tostring(oerr)) end
    local r = inst:get({ namespace = "kickside.ui", key = "completed_splashes" })
    test.eq(r.success, true, tostring(r.error))
    return r.value or {}
end

local function contains(list: { any }, value: string): boolean
    for _, v in ipairs(list) do
        if v == value then return true end
    end
    return false
end

-- Clears instance completion so a case starts from an instance that has not
-- completed setup.
local function fresh_instance()
    local r = call("app:ui_test_admin_reset", admin_scope(), "reset")
    test.eq(r.ok, true, tostring(r.err))
end

local function define_tests()
    test.describe("kickside.ui splash scope", function()
        test.it("requires every declared splash capability and preserves undeclared access", function()
            local function can(id) return id == "fixture:read" end
            test.eq(ui_types.splash_access(nil, can), true)
            test.eq(ui_types.splash_access({}, can), true)
            test.eq(ui_types.splash_access({"fixture:read"}, can), true)
            test.eq(ui_types.splash_access({"fixture:read", "fixture:write"}, can), false)
            test.eq(ui_types.splash_access({"fixture:write", "fixture:read"}, can), false)
            for _, declaration in ipairs({"fixture:read", true, {""}, {true}, {key = "fixture:read"}, {[1] = "fixture:read", [3] = "fixture:write", [4] = "fixture:read"}}) do
                local admitted, err = ui_types.splash_access(declaration, can)
                test.is_nil(admitted)
                test.not_nil(err)
            end
        end)

        test.it("resolves dialog and defaults instance setup to fullscreen", function()
            fresh_instance()
            test.eq(call("app:ui_test_presentation_admin", admin_scope(), "resolve").splash.presentation, "fullscreen")
            test.eq(call("app:ui_test_presentation_member", member_scope(), "resolve").splash.presentation, "dialog")
        end)

        test.it("validates the optional presentation declaration", function()
            test.eq(ui_types.splash_presentation(nil), "fullscreen")
            test.eq(ui_types.splash_presentation("fullscreen"), "fullscreen")
            test.eq(ui_types.splash_presentation("dialog"), "dialog")
            for _, value in ipairs({"panel", "", true, 1}) do
                local presentation, err = ui_types.splash_presentation(value)
                test.is_nil(presentation)
                test.is_true(string.find(tostring(err), "splash presentation", 1, true) ~= nil)
            end
        end)

        test.it("surfaces eligibility errors and rejects non-boolean results", function()
            for _, actor in ipairs({"app:ui_test_eligibility_error", "app:ui_test_eligibility_invalid"}) do
                local _, err = funcs.new():with_actor(security.new_actor(actor, {})):with_scope(member_scope())
                    :call(PROBE, "resolve")
                test.not_nil(err)
            end
        end)

        test.it("gates the instance wizard on the administrator capability only", function()
            local admin = funcs.new()
                :with_actor(security.new_actor("app:ui_test_admin_probe", {}))
                :with_scope(admin_scope())
            local member = funcs.new()
                :with_actor(security.new_actor("app:ui_test_member_probe", {}))
                :with_scope(member_scope())
            test.eq(admin:call(PROBE, "can_admin").ok, true)
            test.eq(member:call(PROBE, "can_admin").ok, false)
        end)

        test.it("hides the instance wizard for every admin once one admin completes it", function()
            fresh_instance()
            test.eq(resolved_id("app:ui_test_admin_b1", admin_scope()), WELCOME)

            local r = call("app:ui_test_admin_a1", admin_scope(), "mark_seen", WELCOME)
            test.eq(r.ok, true, tostring(r.err))

            test.neq(resolved_id("app:ui_test_admin_b1", admin_scope()), WELCOME)
            test.neq(resolved_id("app:ui_test_admin_c1", admin_scope()), WELCOME)
            test.is_true(contains(instance_completed(), WELCOME))
        end)

        test.it("instance completion is readable only by admins through both settings read methods", function()
            local def = contract.get("kickside.settings:settings") :: any
            local member = def:with_actor(security.new_actor("app:ui_test_member_reader", {}))
                :with_scope(member_scope()):open()
            local r = member:get({ namespace = "kickside.ui", key = "completed_splashes" })
            test.eq(r.success, false)
            test.is_nil(r.value)
            local ns = member:get_namespace({ namespace = "kickside.ui" })
            test.eq(ns.success, true)
            test.is_nil(ns.values.completed_splashes)
        end)

        test.it("keeps a per-user splash per user", function()
            test.eq(resolved_id("app:ui_test_member_c2", member_scope()), TOUR)

            local r = call("app:ui_test_member_c2", member_scope(), "mark_seen", TOUR)
            test.eq(r.ok, true, tostring(r.err))

            test.is_nil(resolved_id("app:ui_test_member_c2", member_scope()))
            test.eq(resolved_id("app:ui_test_member_d2", member_scope()), TOUR)
        end)

        test.it("reopens personal onboarding only for the requesting user", function()
            local first = "app:consol_b_onboarding_first"
            local second = "app:consol_b_onboarding_second"
            test.eq(resolved_id(first, member_scope()), TOUR)
            test.eq(call(first, member_scope(), "mark_seen", TOUR).ok, true)
            test.eq(call(second, member_scope(), "mark_seen", TOUR).ok, true)
            test.is_nil(resolved_id(first, member_scope()))
            test.eq(call(first, member_scope(), "mark_unseen", TOUR).ok, true)
            test.eq(resolved_id(first, member_scope()), TOUR)
            test.is_nil(resolved_id(second, member_scope()))
        end)

        test.it("reset by an admin clears the instance completion", function()
            fresh_instance()
            test.eq(call("app:ui_test_admin_a3", admin_scope(), "mark_seen", WELCOME).ok, true)
            test.neq(resolved_id("app:ui_test_admin_b3", admin_scope()), WELCOME)

            local r = call("app:ui_test_admin_a3", admin_scope(), "reset")
            test.eq(r.ok, true, tostring(r.err))

            test.eq(resolved_id("app:ui_test_admin_b3", admin_scope()), WELCOME)
            test.is_false(contains(instance_completed(), WELCOME))
        end)

        test.it("non-admins never resolve the instance wizard, including after reset", function()
            fresh_instance()
            test.neq(resolved_id("app:ui_test_member_never", member_scope()), WELCOME)
            test.eq(call("app:ui_test_admin_once", admin_scope(), "mark_seen", WELCOME).ok, true)
            test.eq(call("app:ui_test_member_never", member_scope(), "reset").ok, false)
            test.neq(resolved_id("app:ui_test_admin_two", admin_scope()), WELCOME)
        end)

        test.it("reset re-triggers setup once and preserves personal splash completion", function()
            local a = "app:ui_test_admin_personal"
            fresh_instance()
            test.eq(call(a, admin_scope(), "mark_seen", TOUR).ok, true)
            test.eq(call(a, admin_scope(), "mark_seen", WELCOME).ok, true)
            test.eq(call(a, admin_scope(), "reset").ok, true)
            test.eq(resolved_id(a, admin_scope()), WELCOME)
            test.eq(call(a, admin_scope(), "mark_seen", WELCOME).ok, true)
            test.is_nil(resolved_id(a, admin_scope()))
            test.neq(resolved_id("app:ui_test_admin_second", admin_scope()), WELCOME)
        end)

        test.it("mark_unseen by an admin clears the instance completion", function()
            fresh_instance()
            test.eq(call("app:ui_test_admin_a4", admin_scope(), "mark_seen", WELCOME).ok, true)

            local r = call("app:ui_test_admin_a4", admin_scope(), "mark_unseen", WELCOME)
            test.eq(r.ok, true, tostring(r.err))

            test.eq(resolved_id("app:ui_test_admin_b4", admin_scope()), WELCOME)
        end)

        test.it("refuses a non-admin writing instance completion", function()
            fresh_instance()

            local r = call("app:ui_test_member_c5", member_scope(), "mark_seen", WELCOME)
            test.eq(r.ok, false)
            test.eq(resolved_id("app:ui_test_admin_b5", admin_scope()), WELCOME)

            test.eq(call("app:ui_test_admin_a5", admin_scope(), "mark_seen", WELCOME).ok, true)
            test.eq(call("app:ui_test_member_c5", member_scope(), "mark_unseen", WELCOME).ok, false)
            test.eq(call("app:ui_test_member_c5", member_scope(), "reset").ok, false)
            test.neq(resolved_id("app:ui_test_admin_b5", admin_scope()), WELCOME)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
