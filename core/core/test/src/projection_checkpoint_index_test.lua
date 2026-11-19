-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local declaration = require("declaration")
local execution_identity = require("execution_identity")
local fixture = require("fixture")
local register = require("register")
local test = require("test")

return {run = test.run_cases(function()
    test.describe("private checkpoint declaration index", function()
        test.it("indexes unrelated kinds once per revision and reads owner authority on every dispatch", function()
            local owner = "app:installed_owner"
            local id = "01a1eda8-f32c-753d-a020-c67f97f21911"
            local actor = {kind = "user", id = "test-owner"}
            local identity = {version = 2, principal = actor, authorized_by = actor, component_id = id,
                captured_at = "2026-11-01T00:00:00Z"}
            local row = assert(execution_identity.to_row(identity))
            fixture.reset({component_id = id, impl_id = owner,
                private_context = {[execution_identity.CONTEXT_KEY] = identity}}, 4096)
            local descriptor = {impl_id = "app:descriptor", component_impl_id = owner, class = "owned",
                projections = {{kind = "checkpoint", worker_ref = "proc://app:worker", input_mode = "prefetch_events"}}}
            fixture.kinds[4097] = descriptor
            local cursor = {thread_id = id, component_id = id, thread_class = "owned", kind = "checkpoint",
                projection_key = "default", cursor_key = "default", actor_id = row.actor_id,
                execution_identity_json = row.actor_context, body = assert(register.declaration_body({
                    worker_ref = "proc://app:worker", worker_input_mode = "prefetch_events"}))}

            for _ = 1, 100 do test.is_nil(declaration.check(cursor, "one")) end
            test.eq(fixture.enumerations, 1)
            test.eq(fixture.component_reads, 100)

            fixture.component.private_context = {}
            local changed = declaration.check(cursor, "one")
            test.is_true(errors.is(changed, errors.PERMISSION_DENIED), tostring(changed))
            test.eq(fixture.enumerations, 1)
            test.eq(fixture.component_reads, 101)

            fixture.component.private_context = {[execution_identity.CONTEXT_KEY] = identity}
            fixture.kinds[4097] = nil
            local removed = declaration.check(cursor, "two")
            test.is_true(errors.is(removed, errors.PERMISSION_DENIED), tostring(removed))
            test.eq(fixture.enumerations, 2)
            fixture.kinds[4097] = descriptor
            test.is_nil(declaration.check(cursor, "three"))
            test.eq(fixture.enumerations, 3)
            test.eq(fixture.component_reads, 103)
        end)
    end)
end)}
