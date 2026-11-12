-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local writer = require("inbox_writer")
local resolver = require("inbox_resolve")
local create = require("create_handler")
local delete = require("delete_handler")
local list = require("list_handler")
local context = require("http_context")
local json = require("json")
local contract = require("contract")
local security = require("security")
local addressed = require("addressed")
local component = require("component")

local function run(input: any): (any?, any?)
    if input.operation == "fold" then return funcs.call("kickside.inbox.persist:projection_worker", input.input) end
    if input.operation == "legacy_decision" then
        local params = input.params
        return component.emit_singleton_event("kickside.inbox", {
            type = "kickside.inbox.events:item.created", impl_id = "kickside.inbox:inbox_binding",
            thread_class = "kickside.inbox", body = params,
            external = { external_source = "kickside.inbox", external_id = "item:" .. params.id, external_version = "1" } })
    end
    if input.operation == "identity" then return writer.identity(input.params) end
    if input.operation == "delete" then return writer.delete(input.identity or input.id, type(input.key) == "string" and input.key or nil) end
    if input.operation == "cleanup" then return writer.discard_by_metadata(input.match) end
    if input.operation == "targets" then return addressed.group_inboxes() end
    if input.operation == "provision" then
        local threads = assert(assert(contract.get("kickside.core:threads"))
            :with_actor(security.actor()):with_scope(security.scope()):open())
        return threads:create({ id = input.component_id,
            impl_id = "kickside.inbox:inbox_binding", thread_class = "kickside.inbox",
            additional_access = input.additional_access })
    end
    if input.operation == "api_create" then
        context.input = json.encode(input.params)
        create.handler()
        return context.output
    end
    if input.operation == "api_delete" then
        context.id = input.id
        delete.handler()
        return { status = context.status, body = context.output }
    end
    if input.operation == "api_list" then
        list._modules = { http = context }
        list.handler()
        return context.output
    end
    if input.operation == "close" then return writer.resolve_aggregate(input.params) end
    if input.operation == "resolve" then return resolver.apply(input.id :: string, type(input.action) == "string" and (input.action :: string) or "dismiss", {}) end
    return writer.create(input.params)
end

return { run = run }
