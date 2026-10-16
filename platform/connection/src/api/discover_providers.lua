local http = require("http")
local registry = require("registry")
local conn_types = require("conn_types")
local create_policy = require("create_policy")

local function normalize_classes(classes: any): { string }
    if type(classes) == "string" and classes ~= "" then return { classes } end
    if type(classes) ~= "table" then return {} end
    local out: { string } = {}
    for _, class in ipairs(classes) do
        if type(class) == "string" and class ~= "" then out[#out + 1] = class end
    end
    return out
end

local function parse_registry_id(id: any): (string?, string?)
    if type(id) ~= "string" then return nil, nil end
    return id:match("^(.+):([^:]+)$")
end

local function resolve_view_tag(view_id: any): string?
    if type(view_id) ~= "string" or view_id == "" then return nil end
    local view = registry.get(view_id)
    if type(view) ~= "table" then return nil end
    local meta = (view :: any).meta or {}
    if meta.type ~= "view.component" then return nil end
    if type(meta.tag_name) == "string" and meta.tag_name ~= "" then return meta.tag_name :: string end
    return nil
end

local function arrays_intersect(filter: any, classes: { string }): boolean
    if type(filter) ~= "table" or #filter == 0 then return true end
    for _, wanted in ipairs(filter) do
        for _, class in ipairs(classes) do
            if wanted == class then return true end
        end
    end
    return false
end

local function provider_info(entry: any, class_filter: any): any?
    if type(entry) ~= "table" or entry.kind ~= "contract.binding" then return nil end
    if not create_policy.is_connection_binding(entry, conn_types.CONNECTION_CONTRACT) then return nil end

    local meta = entry.meta or {}
    if type(meta.credential_schema) ~= "table" then return nil end

    local provider = meta.provider
    if type(provider) ~= "string" or provider == "" then return nil end

    local classes = normalize_classes(meta.class)
    if not arrays_intersect(class_filter, classes) then return nil end

    local namespace = parse_registry_id(entry.id)
    local title = meta.title or provider
    local description = meta.comment or ""
    local icon = meta.icon
    if not icon and type(meta.component) == "table" then icon = meta.component.icon end

    local info = {
        id = entry.id,
        impl_id = entry.id,
        provider = provider,
        name = provider,
        title = title,
        description = description,
        auth_type = "credential",
        credential_schema = meta.credential_schema,
        classes = classes,
        namespace = namespace,
        default_scopes = {},
        available_scopes = {},
    }
    if type(icon) == "string" and icon ~= "" then info.icon = icon end
    if meta.group then info.group = meta.group end
    if meta.tags then info.tags = meta.tags end
    local component_meta = type(meta.component) == "table" and meta.component or {}
    local create_meta = type(component_meta.create) == "table" and component_meta.create or {}
    local create_tag = resolve_view_tag(create_meta.view)
    if create_tag then info.create_ui_id = create_tag end
    return info
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local class = req:query("class")
    local class_filter = nil
    if type(class) == "string" and class ~= "" then class_filter = { class } end

    local entries, err = registry.find({
        [".kind"] = "contract.binding",
        ["*meta.provider"] = "",
    })
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local providers: { any } = {}
    local class_seen: { [string]: boolean } = {}
    local classes: { string } = {}

    for _, entry in ipairs(entries or {}) do
        local info = provider_info(entry, class_filter)
        if info then
            providers[#providers + 1] = info
            for _, c in ipairs(info.classes or {}) do
                if not class_seen[c] then
                    class_seen[c] = true
                    classes[#classes + 1] = c
                end
            end
        end
    end

    table.sort(providers, function(a: any, b: any): boolean
        return tostring(a.title or a.provider) < tostring(b.title or b.provider)
    end)
    table.sort(classes)

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #providers,
        total = #providers,
        total_count = #providers,
        available_classes = classes,
        providers = providers,
        filters = { class = class },
    })
end

return { handler = handler }
