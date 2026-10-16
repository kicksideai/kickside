local component = require("component")
local contract = require("contract")
local funcs = require("funcs")
local registry = require("registry")
local json = require("json")

local allowed = {
    ["kickside.kb10.graph:create_concept"] = true,
    ["kickside.kb10.graph:attach_document"] = true,
    ["kickside.kb10.graph:move_document"] = true,
    ["kickside.kb10.graph:merge_concept"] = true,
    ["kickside.kb10.graph:get_concept_documents"] = true,
    ["kickside.knowledge.traits.kb_ingest:fetch_url"] = true,
    ["kickside.uploads.traits:fetch_url"] = true,


    ["app.smoke.providers:bounds"] = true,
    ["app.smoke.providers:web_bounds"] = true,
    ["kickside.phantombuster.traits:get_tool"] = true,
    ["kickside.phantombuster.traits:write_tool"] = true,
    ["kickside.github.traits:read_tool"] = true,
    ["kickside.github.traits:write_tool"] = true,
    ["kickside.slack.traits:slack_get"] = true,
    ["kickside.slack.traits:slack_write"] = true,
    ["kickside.discord.traits:discord_get"] = true,
    ["kickside.discord.traits:discord_write"] = true,
    ["kickside.hubspot.traits:read_tool"] = true,
    ["kickside.hubspot.traits:write_tool"] = true,
    ["kickside.telegram.traits:telegram_get"] = true,
    ["kickside.telegram.traits:telegram_write"] = true,
    ["kickside.fireflies.traits:get_tool"] = true,
    ["kickside.google.traits:gmail_read_tool"] = true,
    ["kickside.google.traits:gmail_write_tool"] = true,
    ["kickside.google.traits:drive_read_tool"] = true,
    ["kickside.google.traits:drive_write_tool"] = true,
    ["kickside.google.traits:calendar_read_tool"] = true,
    ["kickside.google.traits:calendar_write_tool"] = true,
    ["kickside.google.traits:docs_read_tool"] = true,
    ["kickside.google.traits:docs_write_tool"] = true,
    ["kickside.google.traits:sheets_read_tool"] = true,
    ["kickside.google.traits:sheets_write_tool"] = true,
    ["kickside.google.traits:slides_read_tool"] = true,
    ["kickside.google.traits:slides_write_tool"] = true,
    ["kickside.google.traits:contacts_read_tool"] = true,
    ["kickside.google.traits:analytics_read_tool"] = true,
    ["kickside.webscout.traits:search"] = true,
    ["kickside.atlassian.jira.traits:jira_get"] = true,
    ["kickside.atlassian.jira.traits:jira_write"] = true,
    ["kickside.atlassian.confluence.traits:confluence_get"] = true,
    ["kickside.atlassian.confluence.traits:confluence_write"] = true,
    ["kickside.simplefin.traits:read_tool"] = true,
    ["kickside.mcp_client:invoke_tool"] = true,
    ["kickside.mcp_client:build_tools"] = true,
    ["kickside.webscout.traits:read"] = true,
    ["kickside.webscout.traits:links"] = true,
}
local function handler(args: any): (any?, any)
    local context = args.context or {}
    if args.connection_id then
        local access = args.write == true and component.ACCESS.WRITE or component.ACCESS.READ
        local ok, err = component.validate_access(args.connection_id, access)
        if err or not ok then return nil, err or "connection access denied" end
        context.connection_id = args.connection_id
        context.component_id = args.connection_id
    end
    local result, call_err
    if args.port then
        local entry, entry_err = registry.get(args.port)
        if entry_err or not entry then return nil, entry_err or "port missing" end
        if entry.kind ~= "registry.entry" or not entry.meta or entry.meta.type ~= "kickside.automation.port" then
            return nil, "requested entry is not a declared automation port"
        end
        local method = args.write == true and "write" or "pull"
        local binding, binding_err = registry.get(entry.data.binding)
        if binding_err or not binding then return nil, binding_err or "port binding missing" end
        local expected = method == "pull" and "kickside.data:pullable" or "kickside.data:writable"
        local declared = false
        for _, declaration in ipairs(binding.data.contracts or {}) do
            if declaration.contract == expected then declared = true end
        end
        if not declared then return nil, "port does not declare the requested data direction" end
        local target, target_err = contract.get(method == "pull" and "kickside.data:pullable" or "kickside.data:writable")
        if target_err or not target then return nil, target_err end
        local bound, bind_err = target:open(entry.data.binding, context)
        if bind_err or not bound then return nil, bind_err end
        if method == "pull" then result, call_err = bound:pull(args.arguments)
        else result, call_err = bound:write(args.arguments) end
    else
        if not allowed[args.tool] then return nil, "tool is outside the fixture allow-list" end
        if args.trait then
            local entry, entry_err = registry.get(args.trait)
            if entry_err or not entry then return nil, entry_err or "trait missing" end
            local found = false
            for _, id in ipairs(entry.data.tools or {}) do if id == args.tool then found = true end end
            if entry.data.build_func_id == args.tool then found = true end
            if not found then return nil, "tool is not provided by the requested trait" end
        end
        local builder, builder_err = funcs.new()
        if builder_err or not builder then return nil, builder_err end
        local bound, bind_err = builder:with_context(context)
        if bind_err or not bound then return nil, bind_err end
        result, call_err = bound:call(args.tool, args.arguments or {})
    end
    if call_err then return nil, call_err end
    return { value = result }, nil
end
return { handler = handler }
