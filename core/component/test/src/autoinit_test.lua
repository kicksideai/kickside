-- Autoinit declaration parsing (class/scope/projections/retention/event-contract)
-- and the deterministic per-actor component id. Materializing a declaration into a
-- real component+thread+projections+retention is the provision slice's job (core/core)
-- and is tested there; this covers the pure declaration + id derivation.

local test = require("test")
local uuid = require("uuid")
local autoinit = require("autoinit")

local function define_tests()
    test.describe("Component Autoinit", function()
        local suffix = uuid.v4():sub(1, 8)
        local actor_id = "ai-user-" .. suffix

        test.it("returns a missing kind read error instead of an absent thread declaration", function()
            local declared, err = autoinit.thread_for_impl("missing:thread_kind")
            test.is_nil(declared)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            local optional, optional_err = autoinit.thread_for_impl("app:autoinit_test_decl")
            test.is_nil(optional)
            test.is_nil(optional_err)
        end)

        local function find_decl(class)
            for _, d in ipairs(autoinit.declarations()) do
                if d.class == class then return d end
            end
            return nil
        end

        test.it("parses the autoinit declaration with projections and retention", function()
            local decl = find_decl("test_workspace")
            test.not_nil(decl)
            test.eq(decl.scope, "user")
            test.eq(decl.title, "Test Workspace")
            test.eq(#decl.projections, 1)
            test.eq(decl.projections[1].kind, "test.lifecycle")
            test.eq(decl.projections[1].worker_ref, "func://app:test_autoinit_worker")
            test.not_nil(decl.retention)
            test.eq(decl.retention.event_days, 30)
            test.is_true(decl.retention.drain_aware)
        end)

        test.it("parses projection-level child.lifecycle event filters", function()
            local decl = find_decl("test_workspace")
            test.not_nil(decl)
            test.eq(decl.projections[1].on, "child.lifecycle")
            test.not_nil(decl.projections[1].events)
            test.eq(#decl.projections[1].events.input, 3)
            test.eq(decl.projections[1].events.input[1].type, "kickside.component.events:created")
            test.eq(decl.projections[1].events.input[2].type, "kickside.component.events:updated")
            test.eq(decl.projections[1].events.input[3].type, "kickside.component.events:deleted")
            -- Projection-level nested input events inherit thread-backed defaults.
            test.eq(decl.projections[1].events.input[1].via, "thread")
            test.eq(#decl.projections[1].events.output, 0)
        end)

        test.it("parses the event contract: input triggers + output shapes", function()
            local decl = find_decl("test_workspace")
            test.not_nil(decl)
            test.not_nil(decl.events)
            test.eq(#decl.events.input, 1)
            test.eq(decl.events.input[1].type, "kickside.test.workspace.events:trigger")
            test.not_nil(decl.events.input[1].schema)
            -- An input shape with no declared via defaults to the component's own thread.
            test.eq(decl.events.input[1].via, "thread")
            test.eq(#decl.events.output, 1)
            test.eq(decl.events.output[1].type, "kickside.test.workspace.events:changed")
            -- An explicit via on an output shape is preserved verbatim.
            test.eq(decl.events.output[1].via, "func://app:test_autoinit_worker")
        end)

        test.it("keeps declared grant subject types explicit and never defaults a missing one", function()
            local decl = find_decl("test_grants_workspace")
            test.not_nil(decl)
            test.eq(#decl.grants, 3)
            local by_id: { [string]: any } = {}
            for _, g in ipairs(decl.grants) do by_id[g.subject_id] = g end
            test.eq(by_id["grants-user-1"].subject_type, "user")
            test.eq(by_id["grants-group-1"].subject_type, "group")
            test.is_nil(by_id["grants-typeless-1"].subject_type)
        end)

        test.it("discovers registry entry primary-thread declarations alongside bindings", function()
            local found = false
            for _, kind in ipairs(autoinit.declared_kinds()) do
                if kind.impl_id == "app:autoinit_descriptor_decl" then
                    test.eq(kind.class, "test.descriptor.thread")
                    test.eq(#kind.projections, 0)
                    found = true
                end
            end
            test.is_true(found, "registry.entry thread owner was omitted from convergence")
        end)

        test.it("derives a stable, distinct component id per (actor, class)", function()
            local id = autoinit.component_id(actor_id, "test_workspace")
            test.eq(id, autoinit.component_id(actor_id, "test_workspace"))
            test.is_true(id ~= autoinit.component_id(actor_id, "other_class"))
            test.is_true(id ~= autoinit.component_id("other-actor", "test_workspace"))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
