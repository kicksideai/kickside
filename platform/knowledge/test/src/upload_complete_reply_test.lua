-- The upload completion callback answers its waiting caller from a principal
-- without process messaging authority (a group principal holds no members-only
-- process grant).

local test = require("test")
local security = require("security")
local funcs = require("funcs")
local uuid = require("uuid")
local channel = require("channel")
local time = require("time")

local CALLBACK = "kickside.knowledge.injection:on_upload_complete"

local function define_tests()
    test.describe("upload completion reply", function()
        test.it("answers the waiting caller without caller process messaging authority", function()
            local respond_to = "injection.upload." .. uuid.v4()
            local mailbox = process.listen("upload.complete")
            local _, reg_err = process.registry.register(respond_to)
            test.is_nil(reg_err, tostring(reg_err))
            local policy = assert(security.policy("kickside.knowledge.api:upload_complete_constrained"))
            local result, err = funcs.new():with_actor(security.new_actor("principal:group:kb-upload", {}))
                :with_scope(security.new_scope({ policy })):call(CALLBACK, {
                    upload_id = uuid.v4(), status = "error", error = "conversion failed",
                    params = { kb_id = uuid.v4(), respond_to = respond_to },
                })
            local selected = channel.select({ mailbox:case_receive(), time.after("2s"):case_receive() })
            process.registry.unregister(respond_to)
            process.unlisten(mailbox)
            test.is_nil(err, tostring(err))
            test.is_true(result and result.terminal_upload_error)
            test.eq(selected.channel, mailbox, "the waiting caller never received the completion")
            test.eq(selected.value.success, false)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
