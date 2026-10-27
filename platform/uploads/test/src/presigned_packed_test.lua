local test = require("test")
local lifecycle = require("lifecycle")
local uuid = require("uuid")
local time = require("time")
return {run = test.run_cases(function()
    test.describe("presigned packed locations", function()
        test.it("persists native cloud authority and the filesystem volume for reads", function()
            local saved
            local api = {}
            local s3 = {}
            function s3:presigned_put_url(key) return "https://storage.example/" .. key, nil end
            function s3:release() end
            lifecycle.attach(api, {
                uuid = uuid,
                time = time,
                resources = {get_s3 = function() return s3 end,
                    get_s3_id = function() return "app:objects" end,
                    get_storage_id = function() return "app:uploads" end},
                upload_types = {DEFAULT_PRESIGN_EXPIRES_SECONDS = 300},
                token_flow = {bound_token_upload_id = function() end, take_trace_context = function() end},
                determine_upload_type = function() return "text" end,
                freeze_current_identity = function() end,
                upload_record_repo = {create = function(id, actor, size, mime, storage_id, storage_path)
                    saved = {id = id, storage_id = storage_id, storage_path = storage_path}
                    return saved, nil
                end},
            })
            local result, err = api.generate_presigned_url("owner", "note.txt", 5, "text/plain")
            test.is_nil(err)
            test.not_nil(result)
            test.eq("app:uploads", saved.storage_id)
            test.eq("s3://app:objects/owner/" .. saved.id .. "/note.txt", saved.storage_path)
        end)
    end)
end)}
