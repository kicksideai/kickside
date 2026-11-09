-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local h = require("round_harness")

local function define_tests()
    test.describe("reference-only event payload", function()
        test.it("completes a round without inline document content", function()
            local env = h.setup("reference_payload")
            local key = "artifact_events"
            h.new_drive({automation_id=env.automation_id,drive_key=key,source_kind="event",
                source_thread_id=env.thread_id,action={source_ref="fixture:events",event_type=h.EVENT_TYPE}})
            local appended, append_err = env.threads:append_event({thread_id=env.thread_id,
                event={type=h.EVENT_TYPE,role="user",body={content_omitted=true,content_bytes=5*1024*1024,
                    source_ref={kind="upload",upload_id="test-upload",artifact_id="test-text"}}}})
            test.is_nil(append_err)
            test.not_nil(appended)
            test.is_false(appended.success == false)
            local _, round_err = env.run(env.automation_id,key)
            test.is_nil(round_err,tostring(round_err))
            local rows = h.log_rows(env.automation_id,key)
            test.eq(#rows,1,"the round delivers the reference payload")
            test.eq(h.read_drive(env.automation_id,key).phase,"active")
            test.ok(h.read_drive(env.automation_id,key).event_seq > 0)
            local delivered = h.query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1", {env.automation_id})
            test.eq(#delivered,0,"a successful first delivery creates no unresolved ledger item")
            local _, again_err = env.run(env.automation_id,key)
            test.is_nil(again_err,tostring(again_err))
            test.eq(#h.log_rows(env.automation_id,key),1,"the committed event is delivered once")
        end)
    end)
end

return {run=test.run_cases(define_tests)}
