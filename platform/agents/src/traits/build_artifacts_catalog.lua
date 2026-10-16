local component_registry = require("component_registry")
local page_registry = require("page_registry")

local MAX_ITEMS = 50
local MAX_PROMPT_BYTES = 12000

local function safe_id(value)
    return type(value) == "string"
        and #value > 0
        and #value <= 160
        and value:match("^[%w%._:/%-]+$") ~= nil
end

local function safe_tag(value)
    return type(value) == "string"
        and #value <= 120
        and value:match("^[a-z][a-z0-9]*%-[a-z0-9%-]+$") ~= nil
end

local function sorted_unique(values)
    local seen = {}
    local result = {}
    for _, value in ipairs(values) do
        if not seen[value] then
            seen[value] = true
            table.insert(result, value)
        end
    end
    table.sort(result)
    return result
end

local function append_bounded(lines, values)
    local count = 0
    local bytes = #table.concat(lines, "\n")
    for _, value in ipairs(values) do
        if count >= MAX_ITEMS or bytes + #value + 1 > MAX_PROMPT_BYTES then break end
        table.insert(lines, value)
        bytes = bytes + #value + 1
        count = count + 1
    end
    if #values > count then
        table.insert(lines, "(catalog truncated; use only identifiers shown above)")
    elseif count == 0 then
        table.insert(lines, "(none registered)")
    end
end

local function execute(_base_prompt: string?, _ctx: any?): any
    local components, component_err = component_registry.find_all()
    if component_err then return nil, component_err end
    if not components then return nil, "component catalog did not return entries" end

    local tag_lines = {}
    local component_lines = {}
    for _, component in ipairs(components) do
        if component.announced and not component.secure and safe_id(component.id) then
            local tag_name = component.tag_name
            if safe_tag(tag_name) then
                if component.auto_register then
                    table.insert(tag_lines, "- tag_name=`" .. tag_name .. "`")
                else
                    table.insert(component_lines, "- resource_kind=`component`, resource_id=`" .. component.id .. "`, tag=`" .. tag_name .. "`")
                end
            end
        end
    end

    local page_lines = {}
    local pages, page_err = page_registry.find_all()
    if page_err then return nil, page_err end
    if not pages then return nil, "page catalog did not return entries" end
    if pages then
        for _, page in ipairs(pages) do
            if page.announced and page.kind == "component" and not page.secure
                and safe_id(page.id) then
                table.insert(page_lines, "- resource_kind=`page`, resource_id=`" .. page.id .. "`")
            end
        end
    end

    local lines = {
        "## Approved artifact resources",
        "",
        "CreateArtifact is the only artifact-authoring path. Never write component or artifact tags directly in reply text.",
        "Only use tag names and resource IDs listed below. Package JSON is constructed and validated by the tool; never supply package JSON yourself.",
        "",
        "### Auto-registered component tags",
    }
    append_bounded(lines, sorted_unique(tag_lines))
    table.insert(lines, "")
    table.insert(lines, "### Component packages")
    append_bounded(lines, sorted_unique(component_lines))
    table.insert(lines, "")
    table.insert(lines, "### Page packages")
    append_bounded(lines, sorted_unique(page_lines))

    return { prompt = table.concat(lines, "\n") }
end

return { execute = execute }
