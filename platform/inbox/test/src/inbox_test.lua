-- Unit coverage for the event-sourced inbox: declarative item-type discovery and
-- the fixed vocabulary. The full create -> list -> resolve lifecycle runs over the
-- live kickside.core thread engine (needs an authenticated actor + the thread DB),
-- so it is exercised as an integration check, not here.

local test = require("test")
local registry = require("registry")
local inbox_item_types = require("inbox_item_types")
local inbox_types = require("inbox_types")
local inbox_writer = require("inbox_writer")
local inbox_events = require("inbox_events")

local function define_tests()
    test.describe("inbox item-type discovery", function()
        test.it("discovers declarative inbox.item_type entries with render metadata", function()
            local item_types = inbox_item_types.all()
            test.not_nil(item_types, "item_types.all() returned nil")
            local by_value: { [string]: any } = {}
            for _, item_type in ipairs(item_types) do by_value[tostring(item_type.value)] = item_type end

            test.not_nil(by_value.notice, "the base 'notice' item type is missing")
            test.eq(by_value.notice.component_tag, "kickside-inbox-notice")
            -- name carries the declared human title, never the raw machine value.
            test.eq(by_value.notice.name, "Notice")
            test.eq(#by_value.notice.actions, 1)
            test.eq(by_value.notice.actions[1], "dismiss")

            test.not_nil(by_value.system, "the 'system' item type is missing")
            test.eq(by_value.system.name, "System")
            test.eq(#by_value.system.actions, 3)
            test.eq(by_value.system.actions[1], "approve")
            test.eq(by_value.system.actions[2], "reject")
            test.eq(by_value.system.actions[3], "dismiss")

            test.not_nil(by_value.flow_decision, "the Flow decision item type is missing")
            test.eq(by_value.flow_decision.name, "Flow Decision")
            test.eq(by_value.flow_decision.actions[1], "approve")
            test.eq(by_value.flow_decision.actions[2], "reject")
            test.eq(#by_value.flow_decision.actions, 2)
            test.is_nil(by_value.flow_decision.on_validate)
            test.is_nil(by_value.flow_decision.on_resolve)

            local executable, executable_err = inbox_item_types.get("flow_decision")
            test.is_nil(executable_err)
            test.eq(executable.on_resolve, "kickside.inbox:resume_decision")
        end)

        test.it("publishes only the canonical component action owner", function()
            local listed = inbox_item_types.all()

            local by_value: { [string]: any } = {}
            for _, item_type in ipairs(listed) do by_value[tostring(item_type.value)] = item_type end
            test.eq(by_value.owned.action_owner, "component")
            test.is_nil(by_value.owned.on_resolve)
            test.is_nil(by_value.default.action_owner)
            test.is_nil(by_value.invalid.action_owner)
        end)
    end)

    test.describe("inbox vocabulary", function()
        test.it("exposes the stable status set", function()
            test.eq(inbox_types.STATUS.PENDING, "pending")
            test.eq(inbox_types.STATUS.RESOLVED, "resolved")
            test.eq(inbox_types.STATUS.APPROVED, "approved")
            test.eq(inbox_types.STATUS.REJECTED, "rejected")
            test.eq(inbox_types.STATUS.DISMISSED, "dismissed")
        end)

        test.it("uses durable event names and the canonical component meta topic", function()
            test.eq(inbox_types.EVENT.CREATED, "kickside.inbox.events:item.created")
            test.eq(inbox_types.EVENT.RESOLVED, "kickside.inbox.events:item.resolved")
            test.eq(inbox_types.component_topic("cmp-1"), "component.cmp-1")
        end)

        test.it("keeps resolution in the one item projection with no effect worker", function()
            local binding = registry.get("kickside.inbox:inbox_binding")
            test.not_nil(binding)
            local metadata = type((binding :: any).meta) == "table" and (binding :: any).meta or {}
            local projections = type((metadata :: any).projections) == "table" and (metadata :: any).projections or {}
            local item_projection: any = nil
            for _, projection in ipairs(projections) do
                test.eq((projection :: any).kind ~= "kickside.inbox:resolution-effects", true)
                if (projection :: any).kind == "kickside.inbox:items" then item_projection = projection end
            end
            test.not_nil(item_projection)
            test.eq(item_projection.worker_ref, "func://kickside.inbox.persist:projection_worker")
        end)

        test.it("has no stale Migration or hard Workflows, Dataflow, or Jobs dependency", function()
            test.is_nil((registry.get("kickside.inbox:dep.wippy.migration")))
            test.is_nil((registry.get("kickside.inbox:dep.kickside.workflows")))
            test.is_nil((registry.get("kickside.inbox:dep.wippy.dataflow")))
            test.is_nil((registry.get("kickside.inbox:dep.kickside.jobs")))
        end)

        test.it("keeps terminal resolution behind the canonical resolver", function()
            test.is_nil((inbox_writer :: any).resolve)
            test.is_nil((inbox_writer :: any).approve)
            test.is_nil((inbox_writer :: any).reject)
            test.is_nil((inbox_writer :: any).dismiss)
            test.is_nil((inbox_events :: any).resolve)

            local ok, err = inbox_events._commit_resolution("i1", inbox_types.STATUS.APPROVED, {
                resolution_id = "resolve:i1",
            })
            test.eq(ok, false)
            test.contains(tostring(err), "action is required")

            ok, err = inbox_events._commit_resolution("i1", inbox_types.STATUS.APPROVED, {
                action = "approve",
            })
            test.eq(ok, false)
            test.contains(tostring(err), "resolution_id is required")
        end)
    end)

    test.describe("inbox lifecycle cleanup", function()
        test.it("discards only pending items matching the complete metadata binding", function()
            local deleted = {}
            local prior = inbox_writer._events
            inbox_writer._events = {
                reduce = function()
                    return {
                        pending_match = { status = inbox_types.STATUS.PENDING, metadata = { kind = "gtm_import_batch_review", session_id = "session-1" } },
                        pending_other = { status = inbox_types.STATUS.PENDING, metadata = { kind = "gtm_import_batch_review", session_id = "session-2" } },
                        resolved_match = { status = inbox_types.STATUS.APPROVED, metadata = { kind = "gtm_import_batch_review", session_id = "session-1" } },
                    }, nil
                end,
                delete = function(id)
                    deleted[#deleted + 1] = id
                    return true, nil
                end,
            }
            local result, err = inbox_writer.discard_by_metadata({ kind = "gtm_import_batch_review", session_id = "session-1" })
            inbox_writer._events = prior
            test.is_nil(err)
            test.eq(result.discarded, 1)
            test.eq(deleted[1], "pending_match")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
