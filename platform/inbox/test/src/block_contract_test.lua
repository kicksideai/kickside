local test = require("test")
local registry = require("registry")

type Map = { [string]: any }

local BLOCK_ID = "kickside.inbox:block.review"

local function map(value: any): Map
    return type(value) == "table" and (value :: Map) or {}
end

local function run()
    test.describe("kickside.inbox review Block", function()
        test.it("publishes one canonical typed Block with no workflow lowering", function()
            local entry, err = registry.get(BLOCK_ID)
            test.is_nil(err)
            test.not_nil(entry, BLOCK_ID .. " is missing")
            local e = map(entry)
            local meta = map(e.meta)
            local block = map(map(e.data).block)
            test.eq(meta.type, "kickside.block")
            test.eq(meta.public, true)
            test.eq(map(block.execution).kind, "wait")
            test.eq(map(block.execution).arm_id, "kickside.inbox:arm_decision")
            test.eq(map(block.input).type, "object")
            test.eq(map(block.config).type, "object")
            test.eq(map(block.output).type, "object")
            test.eq(map(block.error).type, "object")
            test.eq(map(block.presentation).category, "Human")
            test.eq(map(map(block.config).properties).assignee.picker, "wc-principal-picker")
            test.eq(map(block.ports[1]).condition, "output.outcome == 'approve'")
            test.eq(map(block.ports[2]).condition, "output.outcome == 'reject'")
            test.is_nil(meta.lowering)
            test.is_nil(meta.kind)
        end)

        test.it("keeps the Inbox action callback on the canonical Signal completion handler", function()
            local item_type, item_err = registry.get("kickside.inbox:item_type.flow_decision")
            test.is_nil(item_err)
            local meta = map(map(item_type).meta)
            test.eq(meta.on_resolve, "kickside.inbox:resume_decision")
            test.eq(meta.actions[1], "approve")
            test.eq(meta.actions[2], "reject")
            test.eq(#meta.actions, 2)
        end)
    end)
end

return { run = test.run_cases(run) }
