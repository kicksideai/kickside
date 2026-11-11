-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fs = require("fs")
local json = require("json")
local base64 = require("base64")
local sql = require("sql")

return {run = function(req)
    local storage = assert(fs.get(req.ref.storage_id))
    local config = assert(json.decode(req.ref.bytes))
    local log_path = req.ref.storage_path .. ".calls"
    local log = storage:exists(log_path) and assert(storage:readfile(log_path)) or ""
    assert(storage:writefile(log_path, log .. (req.count_only and "count\n" or "render\n")))
    if req.count_only then
        if config.invalid_count then return {ok = true} end
        if config.count_error then return {err = {message = "Count fails"}} end
        return {ok = {total = config.total or 257}}
    end
    if config.render_error then return {err = {message = "Render fails"}} end
    if config.mutate_source then
        local db = assert(sql.get("app:db"))
        assert(db:execute("UPDATE kickside_upload_artifacts SET checksum=$1 WHERE artifact_id=$2",
            {string.rep("a", 64), config.mutate_source}))
        db:release()
    end
    if config.invalid_page then return {ok = {total = config.total or 257, pages = {false}}} end
    if config.extra_page then return {ok = {total = config.total or 257, pages = {}}} end
    return {ok = {total = config.total or 257, pages = {{page = req.pages[1],
        bytes = config.bad_image and "invalid" or assert(base64.decode(config.image)), format = config.format or "png"}}}}
end}
