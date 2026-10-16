local agent_context = require("agent_context")
local prompt_builder = require("prompt_builder")
local file_provider = require("file_provider")
local funcs = require("funcs")
local security = require("security")

local function run(args)
    local context = agent_context.new({ enable_cache = false })
    local agent, load_err = context:load_agent({
        id = "attachment-reader", name = "Attachment reader", model = "class:fast",
        traits = { "kickside.uploads.traits:file_manager" },
    })
    if load_err then error(tostring(load_err)) end
    local info = file_provider.get_info({ file_uuid = args.upload_id })
    local builder, prompt_err = prompt_builder.build({{
        message_id = "attachment-question", type = "user", data = "Quote the attached PDF.",
        metadata = { file_uuids = { args.upload_id } },
    }}, {}, {}, { include_files = true })
    if prompt_err then error(tostring(prompt_err)) end
    local read_id
    for _, tool in pairs(agent.tools) do
        if tool.registry_id == "kickside.uploads.traits:view_files" then read_id = tool.registry_id end
    end
    if not read_id then error("File Manager does not expose ViewFiles") end
    local result, read_err = funcs.call(read_id, { upload_ids = { args.upload_id } })
    return {
        actor_id = security.actor():id(), metadata = info.metadata,
        messages = builder:get_messages(), instructions = agent.system_prompt,
        result = result, read_error = read_err and tostring(read_err) or nil,
    }
end

return { run = run }
