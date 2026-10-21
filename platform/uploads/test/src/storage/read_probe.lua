local contract = require("contract")
local file_provider = require("file_provider")
local prompt_builder = require("prompt_builder")
local M = {}

function M.run(args: any): (any?, any?)
    local definition = assert(contract.get("kickside.contract:content_provider"))
    local scoped, context_err = definition:with_context({ upload_id = args.upload_id })
    if context_err then return nil, context_err end
    local provider, open_err = scoped:open("kickside.uploads:content_provider")
    if open_err then return nil, open_err end
    local content, content_err = provider:get_content({})
    if content_err then return nil, content_err end
    local builder, prompt_err = prompt_builder.build({{
        message_id = "storage-message", type = "user", data = "Read my attachment",
        metadata = { file_uuids = { args.upload_id } },
    }}, {}, {}, { include_files = true })
    if prompt_err then return nil, prompt_err end
    return {
        content = content,
        attachment = file_provider.get_info({ file_uuid = args.upload_id }),
        messages = builder:get_messages(),
    }, nil
end

return M
