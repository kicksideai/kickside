local test = require("test")
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")
local test_identity = require("test_identity")

local WRITE_ID = "kickside.inbox.sink:inbox_write"
local SINK_ID = "kickside.inbox.sink:inbox_sink"
local PORT_ID = "kickside.inbox.sink:inbox_item"
local READ_PROBE_ID = "app:inbox_read_probe"
local CATCHUP_PROBE_ID = "app:inbox_catchup_probe"
local ERROR_PROBE_ID = "app:inbox_error_probe"
-- The writing automation every direct sink write names as its origin.
local ORIGIN = "inbox-sink-test-automation"

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

-- Non-standard top-level yaml keys (binding, operations, config_schema,
-- input_schema, contracts) surface under entry.data on a live registry entry.
local function entry_field(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    local data = (entry :: any).data
    if type(data) == "table" and (data :: any)[key] ~= nil then return (data :: any)[key] end
    return (entry :: any)[key]
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function test_scope(): any
    local policy, policy_err = security.policy("app:user")
    if policy_err or not policy then error("inbox sink test policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("inbox sink test scope: " .. tostring(scope_err)) end
    return scope
end

local function executor(actor_id: string): any
    test_identity.ensure_user(actor_id)
    return funcs.new()
        :with_actor(security.new_actor(actor_id, { security_groups = { "app:user" } }))
        :with_scope(test_scope())
end

local function wait_item(actor_id: string, item_id: string, present: boolean): any
    local framed = executor(actor_id)
    local _, catchup_err = framed:call(CATCHUP_PROBE_ID, {})
    test.is_nil(catchup_err)
    local item, err = framed:call(READ_PROBE_ID, { id = item_id })
    test.is_nil(err)
    if present then test.not_nil(item) else test.is_nil(item) end
    return item
end

local function run()
    test.describe("kickside.inbox writable sink", function()
        test.it("reports malformed durable claim data as an internal failure", function()
            local result, err = executor("inbox-broken-claim-user"):call(ERROR_PROBE_ID, { kind = "claim_decode" })
            test.is_nil(err)
            test.is_false(result.acknowledged)
            test.is_true(result.typed)
        end)

        for _, mode in ipairs({ "open", "get" }) do
            test.it("preserves typed read-model " .. mode .. " failures", function()
                local result, err = executor("inbox-model-error-user"):call("app:read_model_error_probe", { mode = mode })
                test.is_nil(err)
                test.is_true(result.typed)
                test.is_true(result.same)
            end)
        end

        test.it("rejects unknown item types at the event creation boundary", function()
            local result, err = executor("inbox-invalid-type-user"):call(ERROR_PROBE_ID, { kind = "unknown_type" })
            test.is_nil(err)
            test.is_false(result.acknowledged)
            test.contains(result.error, "unknown inbox item type")
        end)
        test.it("does not acknowledge a delivery when thread lookup fails", function()
            local result, err = executor("inbox-lookup-error-user"):call(ERROR_PROBE_ID, { kind = "lookup" })
            test.is_nil(err)
            test.is_false(result.acknowledged)
            test.is_true(result.typed)
            test.is_true(result.same)
        end)

        test.it("preserves the typed error returned by event append", function()
            local result, err = executor("inbox-append-error-user"):call(ERROR_PROBE_ID, { kind = "append" })
            test.is_nil(err)
            test.is_false(result.acknowledged)
            test.is_true(result.typed)
            test.is_true(result.same)
        end)

        test.it("rejects unregistered item types before creating an item", function()
            local created, create_err = executor("inbox-sink-invalid-user"):call(WRITE_ID, {
                origin = ORIGIN,
                origin = ORIGIN, identity_key = "inbox-sink-valid-control", input = { content = "Initializes the owner inbox" },
            })
            test.is_nil(create_err)
            test.eq(created.success, true)
            local res, err = executor("inbox-sink-invalid-user"):call(WRITE_ID, {
                origin = ORIGIN,
                origin = ORIGIN, identity_key = "inbox-sink-invalid-type", input = { content = "Must not be written", item_type = "crm_event_unregistered" },
            })
            test.is_nil(err)
            test.eq(res.success, false)
            test.eq(res.error.code, "invalid_request")
            test.eq(res.error.retriable, false)
            wait_item("inbox-sink-invalid-user", "inbox-sink-invalid-type", false)
        end)

        test.it("refuses a write that names no origin before creating an item", function()
            local actor = "inbox-sink-origin-user"
            local seeded, seed_err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN, identity_key = "inbox-sink-origin-control", input = { content = "Initializes the owner inbox" },
            })
            test.is_nil(seed_err)
            test.eq(seeded.success, true)
            local res, err = executor(actor):call(WRITE_ID, {
                identity_key = "inbox-sink-origin-missing", input = { content = "Must not be written" },
            })
            test.is_nil(err)
            test.eq(res.success, false)
            test.eq(res.error.code, "invalid_request")
            test.eq(res.error.retriable, false)
            wait_item(actor, "inbox-sink-origin-missing", false)
        end)

        test.it("preserves the caller's destination slot across redelivery", function()
            local caller = executor("inbox-sink-slot-user")
            for _, delivery in ipairs({ "first", "retry" }) do
                local res, err = caller:call(WRITE_ID, {
                    origin = ORIGIN,
                    identity_key = "inbox-sink-slot-item", idempotency_key = delivery,
                    map_slot = "review", input = { content = "Review this record" },
                })
                test.is_nil(err)
                test.eq(res.success, true)
                test.eq(res.dest_refs.review.dest_ref.item_id, "inbox-sink-slot-item")
                test.is_nil(res.dest_refs.default)
            end
            wait_item("inbox-sink-slot-user", "inbox-sink-slot-item", true)
        end)

        test.it("accepts a pass-through upload record with the configured item body", function()
            -- Sync supplies this configured body before content normalization;
            -- the content declaration also retains string transforms/provenance.
            test.eq(meta(get(SINK_ID)).input_shape, "content")
            local caller = executor("inbox-sink-upload-user")
            local result, err = caller:call(WRITE_ID, {
                origin = ORIGIN,
                identity_key = "inbox-sink-upload-item", idempotency_key = "upload-delivery-1",
                input = { upload_id = "upload-1", filename = "warehouse-notes.txt", status = "completed" },
                config = { content = "Please review the uploaded notes", title = "Uploaded notes" },
            })
            test.is_nil(err)
            test.eq(result.success, true)
            local item = wait_item("inbox-sink-upload-user", "inbox-sink-upload-item", true)
            test.eq(item.content, "Please review the uploaded notes")
            test.eq(item.title, "Uploaded notes")
        end)

        test.it("publishes the inbox_item store port with upsert + identity-keyed delete", function()
            local port = get(PORT_ID)
            test.eq(meta(port).type, "kickside.automation.port")
            test.eq(entry_field(port, "binding"), SINK_ID)

            -- upsert creates the item; delete removes it by the source identity, so no
            -- destination reference is required.
            local operations = entry_field(port, "operations")
            test.not_nil(operations)
            test.not_nil(operations.upsert)
            test.eq(operations.delete.requires_dest_ref, false)

            -- A source-less scheduled action posts a fixed body, so the config exposes a
            -- textarea message field alongside the item_type and priority overrides.
            local config_schema = entry_field(port, "config_schema")
            test.not_nil(config_schema)
            test.eq(config_schema.content.picker, "wc-schema-form")
            test.eq(config_schema.content.format, "textarea")
            test.eq(config_schema.item_type.default, "notice")
            test.eq(config_schema.priority.enum[2], "normal")
            test.eq(config_schema.priority.default, "normal")
            test.not_nil(config_schema.title)
            test.not_nil(config_schema.title_prefix)

            -- The write handler's input envelope is declared as a JSON Schema string.
            test.eq(type(entry_field(port, "input_schema")), "string")
        end)



        test.it("writes an idempotent traced item to the actor inbox", function()
            local trace_context = {
                trace_id = "trace-inbox-sink",
                run_id = "run-inbox-sink",
                correlation_key = "inbox:sink:test",
            }
            local body = {
                origin = ORIGIN,
                config = {
                    item_type = "notice",
                    priority = "high",
                    title_prefix = "[Flow] ",
                },
                input = {
                    title = "Review generated plan",
                    content = "Review generated plan\n\nStep details.",
                    content_type = "text/plain",
                    metadata = { source = "sink-test" },
                    files = { { component_id = "example:content", context = { file_id = "document" } } },
                },
                idempotency_key = "inbox-sink-idempotent-1",
                trace_context = trace_context,
            }

            local res, err = executor("inbox-sink-user"):call(WRITE_ID, body)
            test.is_nil(err)
            test.is_true(res.success, "sink write failed")
            test.eq(res.dest_ref.item_id, "inbox-sink-idempotent-1")
            test.eq(res.dest_refs.default.dest_ref.item_id, "inbox-sink-idempotent-1")

            local repeated, repeat_err = executor("inbox-sink-user"):call(WRITE_ID, body)
            test.is_nil(repeat_err)
            test.is_true(repeated.success, "repeat sink write failed")
            test.eq(repeated.dest_ref.item_id, "inbox-sink-idempotent-1")
            test.eq(repeated.dest_refs.default.dest_ref.item_id, "inbox-sink-idempotent-1")

            local item = wait_item("inbox-sink-user", "inbox-sink-idempotent-1", true)
            test.not_nil(item, "item not found")
            test.eq(item.title, "[Flow] Review generated plan")
            test.eq(item.priority, "high")
            test.eq(item.metadata.source, "sink-test")
            test.eq(item.files[1].context.file_id, "document")
            test.eq(item.metadata.dedup_key, "inbox-sink-idempotent-1")
            test.eq(item.metadata.content_type, "text/plain")
            test.eq(item.trace_context.trace_id, trace_context.trace_id)
            test.eq(item.trace_context.run_id, trace_context.run_id)
            test.eq(item.trace_context.correlation_key, trace_context.correlation_key)
        end)

        -- The idempotency_key is scoped to one delivery, so an engine that
        -- redelivers a record carries a new one. Naming the item after it would
        -- post a second item; the identity_key names the record across
        -- deliveries and must win.
        test.it("names the item by identity_key so a redelivery refreshes rather than duplicates", function()
            local actor = "inbox-sink-identity-user"
            local function deliver(delivery: string): any
                local res, err = executor(actor):call(WRITE_ID, {
                    origin = ORIGIN,
                    config = {},
                    input = { content = "Refreshed item " .. delivery },
                    identity_key = "inbox-sink-identity-1",
                    idempotency_key = "inbox-sink-identity-1:" .. delivery,
                })
                test.is_nil(err)
                test.is_true(res.success, "sink write failed")
                return res
            end

            test.eq(deliver("r1").dest_ref.item_id, "inbox-sink-identity-1")
            test.eq(deliver("r2").dest_ref.item_id, "inbox-sink-identity-1")
            local refreshed = wait_item(actor, "inbox-sink-identity-1", true)
            test.eq(refreshed.content, "Refreshed item r2")
            test.is_nil(wait_item(actor, "inbox-sink-identity-1:r2", false), "a redelivery must not mint a second item")

            local conflict, conflict_err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {}, input = { content = "Different payload for r2" },
                identity_key = "inbox-sink-identity-1",
                idempotency_key = "inbox-sink-identity-1:r2",
            })
            test.is_nil(conflict_err)
            test.is_false(conflict.success)
            test.eq(conflict.error.code, "idempotency_conflict")
            test.eq(wait_item(actor, "inbox-sink-identity-1", true).content, "Refreshed item r2")

            local deleted, derr = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {},
                sink_op = "delete",
                input = { dedup_key = "inbox-sink-identity-1" },
                identity_key = "inbox-sink-identity-1",
                idempotency_key = "inbox-sink-identity-1:r3",
            })
            test.is_nil(derr)
            test.is_true(deleted.success, "sink delete failed")
            test.eq(deleted.dest_ref.item_id, "inbox-sink-identity-1")
            test.is_nil(wait_item(actor, "inbox-sink-identity-1", false), "delete must retract the named item")
        end)

        test.it("replays the original receipt outcome for each immutable delivery", function()
            local actor = "inbox-outcome-user"
            local function deliver(key, content)
                local result, err = executor(actor):call(WRITE_ID, {
                    origin = ORIGIN, identity_key = "outcome-item", idempotency_key = key,
                    input = { content = content },
                })
                test.is_nil(err)
                test.is_true(result.success, tostring(result.error and result.error.message))
                return result
            end
            test.eq(deliver("outcome-first", "Original").result, "created")
            test.eq(deliver("outcome-first", "Original").result, "created")
            test.eq(deliver("outcome-second", "Updated").result, "updated")
            test.eq(deliver("outcome-second", "Updated").result, "updated")
            test.eq(wait_item(actor, "outcome-item", true).content, "Updated")
            test.eq(deliver("outcome-first", "Original").result, "created")
            test.eq(wait_item(actor, "outcome-item", true).content, "Updated")
        end)

        test.it("keeps a real review decision when a later delivery changes its body", function()
            local actor = "inbox-review-version-user"
            local caller = executor(actor)
            local created, create_err = caller:call(WRITE_ID, { origin = ORIGIN,
                identity_key = "review-version", idempotency_key = "review-version:create", input = { content = "Original" } })
            test.is_nil(create_err)
            test.is_true(created.success)
            wait_item(actor, "review-version", true)
            local decision, decision_err = caller:call("app:inbox_delivery_probe", { operation = "resolve", id = "review-version" })
            test.is_nil(decision_err)
            test.eq(decision.status, "dismissed")
            wait_item(actor, "review-version", true)
            local updated, update_err = caller:call(WRITE_ID, { origin = ORIGIN,
                identity_key = "review-version", idempotency_key = "review-version:update", input = { content = "Updated" } })
            test.is_nil(update_err)
            test.is_true(updated.success)
            local current = wait_item(actor, "review-version", true)
            test.eq(current.content, "Updated")
            test.eq(current.status, "dismissed")
            test.eq(current.action, "dismiss")
            test.eq(current.resolution_id, "resolve:review-version")
        end)

        test.it("deletes a durable item before its projection carries it", function()
            local actor = "inbox-early-delete-user"
            local result, err = executor(actor):call("app:inbox_delivery_probe", { id = "early-delete" })
            test.is_nil(err)
            test.is_true(result.deleted)
            test.is_nil(wait_item(actor, "early-delete", false))
        end)

        test.it("posts the body from config.content when there is no input content (recurrent action)", function()
            -- A recurrent action fires this sink on a schedule with no upstream data,
            -- so the item body comes from the configured content. This is the path that
            -- was impossible before the config exposed a content field.
            local res, err = executor("inbox-sink-config-user"):call(WRITE_ID, {
                origin = ORIGIN,
                config = { content = "Scheduled reminder body", priority = "normal" },
                input = {},
                idempotency_key = "inbox-sink-config-content",
            })

            test.is_nil(err)
            test.is_true(res.success, "config-content sink write failed: " .. tostring(res and res.error and res.error.message))
            local item = wait_item("inbox-sink-config-user", "inbox-sink-config-content", true)
            test.not_nil(item, "item not found")
            test.eq(item.content, "Scheduled reminder body")
            test.eq(item.title, "Scheduled reminder body")
        end)

        test.it("still requires a body when neither input nor config supplies content", function()
            local res, err = executor("inbox-sink-empty-user"):call(WRITE_ID, {
                origin = ORIGIN,
                config = { priority = "normal" },
                input = {},
                idempotency_key = "inbox-sink-empty",
            })
            test.is_nil(err)
            test.is_false(res.success)
        end)

        test.it("rejects an unsupported sink_op instead of silently upserting", function()
            local actor = "inbox-sink-badop-user"
            local seeded, seed_err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                input = { content = "Initialize actor inbox" },
                idempotency_key = "inbox-sink-badop-seed",
            })
            test.is_nil(seed_err)
            test.is_true(seeded.success)
            test.not_nil(wait_item(actor, "inbox-sink-badop-seed", true))

            local res, err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = { priority = "normal" },
                sink_op = "merge",
                input = { content = "Should not be created" },
                idempotency_key = "inbox-sink-badop",
            })
            test.is_nil(err)
            test.is_false(res.success)
            test.contains(res.error.message, "unsupported sink operation: merge")
            test.is_nil(wait_item(actor, "inbox-sink-badop", false), "item must not be created for an unsupported sink_op")
        end)

        test.it("delete removes the item the same source identity created", function()
            local actor = "inbox-sink-delete-user"
            local created, cerr = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {},
                input = { content = "Retractable item" },
                idempotency_key = "inbox-sink-retract-1",
            })
            test.is_nil(cerr)
            test.is_true(created.success, "sink write failed")
            test.not_nil(wait_item(actor, "inbox-sink-retract-1", true), "item not found after upsert")

            local res, err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {},
                sink_op = "delete",
                input = { item_key = "src-item-1", dedup_key = "inbox-sink-retract-1" },
                identity_key = "inbox-sink-retract-1", idempotency_key = "inbox-sink-retract-delete-1",
            })
            test.is_nil(err)
            test.is_true(res.success, "sink delete failed: " .. tostring(res and res.error and res.error.message))
            test.eq(res.result, "deleted")
            test.eq(res.dest_ref.item_id, "inbox-sink-retract-1")
            test.is_nil(wait_item(actor, "inbox-sink-retract-1", false), "item must be removed after delete")
        end)

        test.it("delete of an absent identity is an idempotent no-op", function()
            local res, err = executor("inbox-sink-delete-user"):call(WRITE_ID, {
                origin = ORIGIN,
                config = {},
                sink_op = "delete",
                input = { dedup_key = "inbox-sink-never-created" },
                idempotency_key = "inbox-sink-never-created",
            })
            test.is_nil(err)
            test.is_true(res.success, "absent-identity delete must stay a clean no-op")
            test.eq(res.result, "deleted")
        end)

        test.it("rejects reuse of a delete delivery key for another target", function()
            local actor = "inbox-delete-conflict-user"
            local first, first_err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {}, sink_op = "delete", input = {},
                identity_key = "first-target", idempotency_key = "delete-key-1",
            })
            test.is_nil(first_err)
            test.is_true(first.success)
            local second, second_err = executor(actor):call(WRITE_ID, {
                origin = ORIGIN,
                config = {}, sink_op = "delete", input = {},
                identity_key = "second-target", idempotency_key = "delete-key-1",
            })
            test.is_nil(second_err)
            test.is_false(second.success)
            test.eq(second.error.code, "idempotency_conflict")
        end)

        test.it("delete without a source identity fails instead of guessing", function()
            local res, err = executor("inbox-sink-delete-user"):call(WRITE_ID, {
                origin = ORIGIN,
                config = {},
                sink_op = "delete",
                input = {},
            })
            test.is_nil(err)
            test.is_false(res.success)
            test.contains(res.error.message, "source item identity")
        end)

        test.it("derives a title from content when config does not set one", function()
            local res, err = executor("inbox-sink-title-user"):call(WRITE_ID, {
                origin = ORIGIN,
                input = { content = "First line\nSecond line" },
                idempotency_key = "inbox-sink-derived-title",
            })

            test.is_nil(err)
            test.is_true(res.success, "sink write failed")
            local item = wait_item("inbox-sink-title-user", "inbox-sink-derived-title", true)
            test.not_nil(item, "item not found")
            test.eq(item.title, "First line")
            test.eq(item.item_type, "notice")
            test.eq(item.priority, "normal")
        end)
    end)
end

return { run = test.run_cases(run) }
