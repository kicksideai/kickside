-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Doc2MD double whose outcome is named by the input bytes.
local M = { limits = { max_input_bytes = 1048576 } }

local function failure(retryable: boolean): error
    if retryable then
        return errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "converter call deadline exceeded" })
    end
    return errors.new({ kind = errors.INVALID, retryable = false, message = "document cannot be decoded" })
end

function M.convert(request: any, _options: any): (any, error?)
    if request.bytes == "convert-unavailable" then return nil, failure(true) end
    if request.bytes == "convert-invalid" then return nil, failure(false) end
    return { markdown = "<!-- page 1 -->\nscan",
        images = { { page = 1, name = "page1_scan.png", data = "image bytes" } } }, nil
end

function M.page_resources(request: any): (any, error?)
    if request.bytes == "pages-unavailable" then return nil, failure(true) end
    return { { page = 1, text_len = 4, image_count = 1 } }, nil
end

return M
