local registry = require("registry")

-- Constants
local DEFAULT_COMPONENT_CONTRACT = "kickside.oauth:oauth_connection"

-- Create the module table
local provider_registry = {}

-- Helper function to normalize classes to array
local function normalize_classes(classes)
    if not classes then
        return {}
    end

    if type(classes) == "string" then
        return { classes }
    elseif type(classes) == "table" then
        local result = {}
        for _, class in ipairs(classes) do
            if type(class) == "string" and class ~= "" then
                table.insert(result, class)
            end
        end
        return result
    end

    return {}
end

-- Helper function to parse registry ID
local function parse_registry_id(id)
    if not id or type(id) ~= "string" then
        return nil, nil
    end

    local namespace, name = id:match("^(.+):([^:]+)$")
    return namespace, name
end

-- Helper function to check if arrays have intersection
local function arrays_intersect(arr1, arr2)
    if not arr1 or #arr1 == 0 then
        return true -- No filter means all match
    end

    for _, item1 in ipairs(arr1) do
        for _, item2 in ipairs(arr2) do
            if item1 == item2 then
                return true
            end
        end
    end

    return false
end

-- Resolve a provider's declared create/manage view to the mountable WC tag the
-- frontend loads. The declaration domain is the view.component REGISTRY ID --
-- the same domain automation kinds and the create-view resolver use -- resolved
-- through wippy.views:component_registry.get, which enforces meta.type ==
-- view.component. A provider declaring a bare tag is a validation error, not a
-- silent passthrough.
local function resolve_view_tag(declared: any)
    if declared == nil or declared == "" then
        return nil, nil
    end
    if type(declared) ~= "string" or not declared:find(":", 1, true) then
        return nil, "component views must be view.component registry ids, got: " .. tostring(declared)
    end
    local view_components = require("view_components")
    local rec, err = view_components.get(declared)
    if err or type(rec) ~= "table" then
        return nil, "unresolvable view.component '" .. declared .. "': " .. tostring(err)
    end
    local tag = rec.tag_name
    if type(tag) ~= "string" or tag == "" then
        return nil, "view.component '" .. declared .. "' declares no tag_name"
    end
    return tag, nil
end

-- Resolve the create/manage view tags off a provider entry's meta.component
-- block onto the outgoing info table (create_ui_id / manage_ui_id).
local function apply_view_bindings(info: any, meta_component: any)
    if type(meta_component) ~= "table" then
        return nil
    end
    if type(meta_component.create) == "table" and meta_component.create.view then
        local tag, err = resolve_view_tag(meta_component.create.view)
        if err then
            return "create view: " .. err
        end
        info.create_ui_id = tag
    end
    if type(meta_component.manage) == "table" and meta_component.manage.view then
        local tag, err = resolve_view_tag(meta_component.manage.view)
        if err then
            return "manage view: " .. err
        end
        info.manage_ui_id = tag
    end
    return nil
end

-- Helper function to find provider entry
local function find_provider_entry(provider_id, oauth_provider)
    local entry = nil
    local err = nil

    -- Try to find by provider_id first
    if provider_id and provider_id ~= "" then
        entry, err = registry.get(provider_id)
        if err then
            return nil, "Failed to get provider by ID: " .. err
        end
    end

    -- If not found by ID or no ID provided, try to find by oauth_provider field
    if not entry and oauth_provider and oauth_provider ~= "" then
        local entries, find_err = registry.find({
            ["meta.oauth_provider"] = oauth_provider
        })

        if find_err then
            return nil, "Failed to search by oauth_provider: " .. find_err
        end

        if entries and #entries > 0 then
            entry = entries[1] -- Take first match
        end
    end

    if not entry then
        local search_term = provider_id or oauth_provider or "unknown"
        return nil, "OAuth provider not found: " .. search_term
    end

    -- Verify it has oauth_provider metadata
    if not entry.meta or not entry.meta.oauth_provider then
        return nil, "Entry is not an OAuth provider: " .. (entry.id or "unknown")
    end

    return entry, nil
end

-- Scan registry for all available OAuth providers
function provider_registry.scan_available_providers(filters: any)
    filters = filters or {}

    -- Find all registry entries that have a meta.oauth_provider field. The "*"
    -- key prefix is the finder's CONTAINS operator; an empty substring matches
    -- any string value (and excludes entries without the field) — i.e. "exists".
    local provider_entries, err = registry.find({
        ["*meta.oauth_provider"] = ""
    })

    if err then
        return nil, "Failed to scan registry: " .. err
    end

    if not provider_entries then
        provider_entries = {}
    end

    local providers = {}
    local all_classes = {}

    for _, entry in ipairs(provider_entries) do
        local namespace, name = parse_registry_id(entry.id)
        if namespace and name and entry.meta then
            local provider_name = entry.meta.title or name
            local title = entry.meta.title or name
            local description = entry.meta.comment or ""
            local oauth_provider = entry.meta.oauth_provider
            local icon = nil

            if entry.meta.component and entry.meta.component.icon then
                icon = entry.meta.component.icon
            end

            local classes = normalize_classes(entry.meta.class)

            -- Collect all classes for filtering
            for _, class in ipairs(classes) do
                local found = false
                for _, existing_class in ipairs(all_classes) do
                    if existing_class == class then
                        found = true
                        break
                    end
                end
                if not found then
                    table.insert(all_classes, class)
                end
            end

            -- Apply filters - only class filtering
            local include = true

            -- Filter by classes
            if filters.classes and #filters.classes > 0 then
                if not arrays_intersect(filters.classes, classes) then
                    include = false
                end
            end

            if include then
                local provider_info = {
                    id = entry.id,
                    -- provider is the single provider-identity field the client keys on;
                    -- for OAuth entries it equals oauth_provider, and it matches the
                    -- provider stored on a created connection's component meta.
                    provider = oauth_provider,
                    name = provider_name,
                    title = title,
                    description = description,
                    oauth_provider = oauth_provider,
                    classes = classes,
                    namespace = namespace
                }

                if icon then
                    provider_info.icon = icon
                end

                -- Catalog category (the UI groups by this; SPA holds no
                -- provider-specific knowledge). tags carried for search/filter.
                if entry.meta.group then
                    provider_info.group = entry.meta.group
                end
                if entry.meta.tags then
                    provider_info.tags = entry.meta.tags
                end

                -- Add UI bindings if available (declared registry ids resolved
                -- to mountable WC tags; a bad declaration fails the scan).
                local view_err = apply_view_bindings(provider_info, entry.meta.component)
                if view_err then
                    return nil, "provider " .. tostring(entry.id) .. " " .. view_err
                end

                -- Extract scopes from entry.data
                provider_info.default_scopes = (entry.data and entry.data.default_scopes) or {}
                provider_info.available_scopes = (entry.data and entry.data.available_scopes) or {}

                table.insert(providers, provider_info)
            end
        end
    end

    -- Sort classes alphabetically
    table.sort(all_classes)

    return {
        providers = providers,
        total_count = #providers,
        available_classes = all_classes
    }
end

-- Get detailed information about a specific OAuth provider
function provider_registry.get_provider_info(provider_id: any, oauth_provider: any)
    local entry, err = find_provider_entry(provider_id :: string, oauth_provider)
    if not entry then
        return nil, err
    end

    local namespace, name = parse_registry_id(entry.id)
    if not namespace or not name then
        return nil, "Invalid provider ID format: " .. (entry.id or "unknown")
    end

    local provider_name = entry.meta.title or name
    local title = entry.meta.title or name
    local description = entry.meta.comment or ""
    local oauth_provider_value = entry.meta.oauth_provider
    local icon = nil

    if entry.meta.component and entry.meta.component.icon then
        icon = entry.meta.component.icon
    end

    local classes = normalize_classes(entry.meta.class)

    local result = {
        id = entry.id,
        provider = oauth_provider_value,
        name = provider_name,
        title = title,
        description = description,
        oauth_provider = oauth_provider_value,
        classes = classes,
        namespace = namespace
    }

    if icon then
        result.icon = icon
    end

    -- Add UI bindings from meta.component (declared registry ids resolved to
    -- mountable WC tags; a bad declaration is an error, not a passthrough).
    local view_err = apply_view_bindings(result, entry.meta.component)
    if view_err then
        return nil, "provider " .. tostring(entry.id) .. " " .. view_err
    end

    -- Extract scopes from entry.data
    result.default_scopes = (entry.data and entry.data.default_scopes) or {}
    result.available_scopes = (entry.data and entry.data.available_scopes) or {}

    return result
end

-- Get connector contract implementation and context values for a provider
function provider_registry.get_connector_contract(provider_id: any, oauth_provider: any)
    local entry, err = find_provider_entry(provider_id :: string, oauth_provider)
    if not entry then
        return nil, err
    end

    -- Verify it has connector_contract configuration in data
    if not entry.data or not entry.data.connector_contract then
        return nil, "Provider has no connector_contract configuration: " .. (entry.id or "unknown")
    end

    local connector_contract = entry.data.connector_contract
    if type(connector_contract) ~= "table" then
        return nil, "Invalid connector_contract format: " .. (entry.id or "unknown")
    end

    if not connector_contract.implementation_id or connector_contract.implementation_id == "" then
        return nil, "Missing implementation_id in connector_contract: " .. (entry.id or "unknown")
    end

    local context_values = connector_contract.context_values or {}
    if type(context_values) ~= "table" then
        return nil, "Invalid context_values format: " .. (entry.id or "unknown")
    end

    return {
        provider_id = entry.id,
        oauth_provider = entry.meta.oauth_provider,
        implementation_id = connector_contract.implementation_id,
        context_values = context_values
    }
end

-- Get component contract ID for registering OAuth connection components
function provider_registry.get_component_contract(provider_id: any, oauth_provider: any)
    local entry, err = find_provider_entry(provider_id :: string, oauth_provider)
    if not entry then
        return nil, err
    end

    -- Check if provider has custom component_contract specified
    local component_contract_id = DEFAULT_COMPONENT_CONTRACT
    local declared = entry.data and (entry.data.component_contract_id or entry.data.component_contract)
    if type(declared) == "string" and declared ~= "" then
        component_contract_id = declared
    end

    return {
        component_contract_id = component_contract_id,
        provider_id = entry.id,
        oauth_provider = entry.meta.oauth_provider
    }
end

return provider_registry
