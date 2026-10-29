-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local test = require("test")

local function get_content()
    return { success = true, content = "The reference describes accessible travel.", content_type = "text/plain", title = "Reference" }
end
local function accept(request: any): any
    test.eq(request.content, "The reference describes accessible travel.")
    test.eq(request.content_type, "text/plain")
    test.not_nil(request.source_ref)
    local component_id = assert(ctx.get("component_id"))
    return { success = true, thread_id = component_id, run_id = "run:" .. component_id, external_id = "admitted:" .. component_id }
end
local function refuse()
    return { success = false, error = "content admission refused" }
end
return { get_content = get_content, accept = accept, refuse = refuse }
