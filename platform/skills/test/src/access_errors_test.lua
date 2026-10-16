local test = require("test")
local identity = require("test_identity")
local http_errors = require("http_errors")
local uuid = require("uuid")

return { run = test.run_cases(function()
    test.describe("Skills access failure contract", function()
        local owner: any
        local reader: any
        local reader_id: string = ""
        local skill_id: string = ""
        test.before_all(function()
            local suffix = uuid.v4()
            owner = identity.executor("status_owner_" .. suffix)
            reader, reader_id = identity.executor("status_reader_" .. suffix)
            local created, err = owner:call("kickside.skills:skill_create", {
                name = "Status contract", description = "Permission fixture", body = "steps",
            })
            test.is_nil(err, tostring(err))
            skill_id = created
            local _, share_err = owner:call("kickside.skills:skill_share", { skill_id = skill_id, user_id = reader_id })
            test.is_nil(share_err, tostring(share_err))
        end)
        test.after_all(function()
            local _, err = owner:call("kickside.skills:skill_delete", { skill_id = skill_id })
            test.is_nil(err, tostring(err))
        end)
        for _, action in ipairs({ "refine", "delete", "share" }) do
            test.it("returns 403 for refused " .. action .. " through store and trait", function()
                local args = { skill_id = skill_id, description = "changed", user_id = reader_id }
                local result, err = reader:call("kickside.skills:skill_" .. action, args)
                test.is_nil(result)
                test.eq((http_errors.classify(err)), 403, tostring(err))
                args.action = action
                local tool_result, tool_err = reader:call("kickside.skills.traits:skill_tool", args)
                test.is_nil(tool_result)
                test.eq((http_errors.classify(tool_err)), 403, tostring(tool_err))
            end)
            test.it("returns 400 for invalid " .. action .. " input", function()
                local result, err = owner:call("kickside.skills:skill_" .. action, {})
                test.is_nil(result)
                test.eq((http_errors.classify(err)), 400, tostring(err))
            end)
        end
        test.it("returns 400 for invalid create input", function()
            local result, err = owner:call("kickside.skills:skill_create", {})
            test.is_nil(result)
            test.eq((http_errors.classify(err)), 400, tostring(err))
        end)
        test.it("preserves file tool access and missing-file errors", function()
            local stranger = identity.executor("file_status_stranger_" .. uuid.v4())
            for _, action in ipairs({ "list", "read" }) do
                local result, err = stranger:call("kickside.skills.traits:skill_file_tool", {
                    action = action, skill_id = skill_id, path = "missing.txt",
                })
                test.is_nil(result)
                test.eq((http_errors.classify(err)), 403, tostring(err))
            end
            local result, err = owner:call("kickside.skills.traits:skill_file_tool", {
                action = "read", skill_id = skill_id, path = "missing.txt",
            })
            test.is_nil(result)
            test.eq((http_errors.classify(err)), 404, tostring(err))
        end)
        test.it("returns 400 for invalid files and access masks", function()
            for _, files in ipairs({ "invalid", { { path = "../secret", content = "x" } }, { { path = "missing-content" } },
                { { path = "asset", encoding = "base64", content = "!invalid!" } } }) do
                local result, err = owner:call("kickside.skills:skill_refine", { skill_id = skill_id, files = files })
                test.is_nil(result)
                test.eq((http_errors.classify(err)), 400, tostring(err))
            end
            local result, err = owner:call("kickside.skills:skill_share", {
                skill_id = skill_id, user_id = reader_id, access_mask = 999,
            })
            test.is_nil(result)
            test.eq((http_errors.classify(err)), 400, tostring(err))
            test.is_true(errors.is(err, errors.INVALID))
            test.is_false(err:retryable())
            test.eq(err:details().code, "component_access_invalid")
        end)
        test.it("returns 404 for a missing historical version", function()
            local result, err = owner:call("kickside.skills:skill_get", { skill_id = skill_id, version = 999 })
            test.is_nil(result)
            test.eq((http_errors.classify(err)), 404, tostring(err))
        end)
    end)
end) }
