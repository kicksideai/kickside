local json = require("json")
local canonical_json = require("canonical_json")
local tool_result = require("tool_result")
local component_registry = require("component_registry")
local bundled_meta = require("bundled_meta")
local page_registry = require("page_registry")

local MAX_TITLE_BYTES = 200
local MAX_PREVIEW_BYTES = 500
local MAX_TEXT_BYTES = 1024 * 1024
local MAX_PROPS_BYTES = 64 * 1024
local MAX_PACKAGE_BYTES = 1024 * 1024

local BLOCKED_COMPONENT_PROPS = {
    allow = true,
    class = true,
    crossorigin = true,
    exportparts = true,
    id = true,
    innerhtml = true,
    integrity = true,
    is = true,
    nonce = true,
    outerhtml = true,
    part = true,
    sandbox = true,
    slot = true,
    srcdoc = true,
    style = true,
}

local function non_empty_string(value)
    return type(value) == "string" and value:match("%S") ~= nil
end

local function validate_common(params)
    if not non_empty_string(params.title) then
        return tool_result.fail(errors.INVALID, "title must be a non-empty string")
    end
    if #params.title > MAX_TITLE_BYTES then
        return tool_result.fail(errors.INVALID, "title must be at most " .. tostring(MAX_TITLE_BYTES) .. " bytes")
    end
    if params.preview ~= nil then
        if type(params.preview) ~= "string" then
            return tool_result.fail(errors.INVALID, "preview must be a string")
        end
        if #params.preview > MAX_PREVIEW_BYTES then
            return tool_result.fail(errors.INVALID, "preview must be at most " .. tostring(MAX_PREVIEW_BYTES) .. " bytes")
        end
    end
    if params.instructions ~= nil and type(params.instructions) ~= "boolean" then
        return tool_result.fail(errors.INVALID, "instructions must be a boolean")
    end
    if params.render ~= nil then
        if params.render ~= "inline" and params.render ~= "standalone"
            and params.render ~= "inline-interactive" then
            return tool_result.fail(errors.INVALID, "render must be inline, standalone, or inline-interactive")
        end
    end
    return true, nil
end

local function encode_props(props)
    if props == nil then return {}, nil end
    if type(props) ~= "table" then return tool_result.fail(errors.INVALID, "props must be an object") end
    local encoded, err = json.encode(props)
    if err then return nil, err end
    if #encoded > MAX_PROPS_BYTES then
        return tool_result.fail(errors.INVALID, "props must encode to at most " .. tostring(MAX_PROPS_BYTES) .. " bytes")
    end
    return props, nil
end

local function project_component(component)
    local meta, meta_err = bundled_meta.fetch_for_component(component)
    if meta_err then return nil, meta_err end
    local projected, project_err = bundled_meta.project_component_response(
        meta,
        component,
        component_registry.resolve_base_url(component)
    )
    if project_err then return nil, project_err end
    if type(projected) ~= "table" then
        return tool_result.fail(errors.INVALID, "component metadata projection failed")
    end
    return projected, nil
end

local function validate_component_props(props, projected)
    local schema: any = projected and projected.wippy and projected.wippy.props
    local declared = type(schema) == "table" and schema.properties or nil
    if type(declared) ~= "table" then declared = {} end

    for key, _ in pairs(props) do
        if type(key) ~= "string" or not key:match("^[A-Za-z_][A-Za-z0-9_.:%-]*$") then
            return tool_result.fail(errors.INVALID, "component prop names must be safe attribute identifiers")
        end
        local lower = key:lower()
        if lower:match("^on") or BLOCKED_COMPONENT_PROPS[lower] then
            return tool_result.fail(errors.INVALID, "component prop is not allowed: " .. key)
        end
        if declared[key] == nil then
            return tool_result.fail(errors.INVALID, "component prop is not declared by the live schema: " .. key)
        end
    end

    if type(schema) ~= "table" then
        schema = { type = "object", properties = {}, additionalProperties = false }
    end
    local valid, validation_err = json.validate(canonical_json.normalize_schema(schema), canonical_json.object(props))
    if not valid then return nil, validation_err end

    return props, nil
end

local function resolve_tag(tag_name)
    if not tag_name:match("^[a-z][a-z0-9]*%-[a-z0-9%-]+$") then
        return nil, nil, errors.new({ message = "tag_name must be a valid custom-element name", kind = errors.INVALID })
    end
    local components, err = component_registry.find_all()
    if err then return nil, nil, err end
    if not components then
        return nil, nil, errors.new({ message = "component catalog did not return entries", kind = errors.INTERNAL })
    end
    local match = nil
    for _, component in ipairs(components) do
        if component.announced and component.auto_register and not component.secure and component.tag_name == tag_name then
            if match then
                return nil, nil, errors.new({ message = "tag_name is ambiguous in the component catalog", kind = errors.CONFLICT })
            end
            match = component
        end
    end
    if not match then
        return nil, nil, errors.new({ message = "tag_name is not an approved auto-registered component", kind = errors.INVALID })
    end
    local projected, project_err = project_component(match)
    if project_err then return nil, nil, project_err end
    if not projected.wippy or projected.wippy.tagName ~= tag_name then
        return nil, nil, errors.new({ message = "component metadata does not match its registered tag_name", kind = errors.CONFLICT })
    end
    return match, projected, nil
end

local function absolute_entry(base_url, entry)
    if entry:match("^https?://") then return entry end
    if base_url == "" then return entry end
    if not base_url:match("/$") then base_url = base_url .. "/" end
    return base_url .. entry:gsub("^/", "")
end

local function build_component_package(resource_id, props)
    local component, err = component_registry.get(resource_id)
    if err then return nil, err end
    if not component then return tool_result.fail(errors.NOT_FOUND, "component not found or unavailable") end
    if not component.announced or component.secure or component.auto_register then
        return tool_result.fail(errors.INVALID, "component is not approved for package artifacts")
    end
    local projected, project_err = project_component(component)
    if not projected then return nil, project_err end
    local validated_props, props_err = validate_component_props(props, projected)
    if not validated_props then return nil, props_err end
    local tag_name = projected.wippy and projected.wippy.tagName
    local entry = projected.browser
    if not non_empty_string(tag_name) or not non_empty_string(entry) then
        return tool_result.fail(errors.INVALID, "component package is missing tagName or browser entry")
    end
    return {
        specification = "wippy-component-1.0",
        name = projected.name or resource_id,
        version = projected.version or "1.0.0",
        browser = absolute_entry(component_registry.resolve_base_url(component), entry),
        wippy = {
            tagName = tag_name,
            props = projected.wippy.props or { type = "object", properties = {} },
        },
        props = validated_props,
    }, nil
end

local function build_page_package(resource_id)
    local pages, list_err = page_registry.find_all()
    if list_err then return nil, list_err end
    if not pages then return tool_result.fail(errors.INTERNAL, "page catalog did not return entries") end
    local listed = false
    for _, page in ipairs(pages) do
        if page.id == resource_id and page.announced and page.kind == "component" and not page.secure then
            listed = true
            break
        end
    end
    if not listed then return tool_result.fail(errors.INVALID, "page is not approved for package artifacts") end

    local page, err = page_registry.get(resource_id)
    if err then return nil, err end
    if not page then return tool_result.fail(errors.NOT_FOUND, "page not found or unavailable") end
    local meta, meta_err = bundled_meta.fetch_for_page(page)
    if meta_err then return nil, meta_err end
    local projected, project_err = bundled_meta.project_page_response(
        meta,
        page,
        page_registry.resolve_base_url(page)
    )
    if project_err then return nil, project_err end
    if type(projected) ~= "table" then
        return tool_result.fail(errors.INVALID, "page metadata projection failed")
    end
    if not projected.wippy or not non_empty_string(projected.wippy.path) then
        return tool_result.fail(errors.INVALID, "page package is missing its browser path")
    end
    -- Web-page artifact packages require proxy metadata. The app-template
    -- contract supplies the minimal enabled proxy when a page does not declare
    -- optional injections of its own.
    projected.wippy.proxy = projected.wippy.proxy or { enabled = true }
    return projected, nil
end

local function handler(params)
    if type(params) ~= "table" then return tool_result.fail(errors.INVALID, "input must be an object") end
    local ok, common_err = validate_common(params)
    if not ok then return nil, common_err end

    local text_mode = params.content ~= nil or params.content_type ~= nil
    local tag_mode = params.tag_name ~= nil
    local package_mode = params.resource_id ~= nil or params.resource_kind ~= nil
    local mode_count = (text_mode and 1 or 0) + (tag_mode and 1 or 0) + (package_mode and 1 or 0)
    if mode_count ~= 1 then
        return tool_result.fail(errors.INVALID, "choose exactly one mode: text content, tag_name, or resource_kind + resource_id")
    end

    -- Two independent axes, deliberately kept apart:
    --   display_type = PLACEMENT. "standalone" makes the session emit a separate
    --     artifact message; "inline" means the agent embeds the returned tag in its
    --     own reply. Derived from `instructions`, unchanged.
    --   type = RENDER MODE, stored by the session as the artifact `kind` and read
    --     back by the renderer as ArtifactType: "inline" draws the content in the
    --     thread, "standalone" draws a button that opens it, "inline-interactive"
    --     embeds it in a proxy-enabled iframe. Omitted keeps the session default
    --     ("inline"), which is the pre-existing behaviour for every artifact.
    local artifact = {
        title = params.title,
        display_type = params.instructions == true and "inline" or "standalone",
        preview = params.preview or "",
        instructions = params.instructions == true,
    }
    if params.render ~= nil then artifact.type = params.render end

    if text_mode then
        if params.props ~= nil then return tool_result.fail(errors.INVALID, "props are only valid in component modes") end
        if not non_empty_string(params.content) then return tool_result.fail(errors.INVALID, "content must be a non-empty string") end
        if #params.content > MAX_TEXT_BYTES then
            return tool_result.fail(errors.INVALID, "content must be at most " .. tostring(MAX_TEXT_BYTES) .. " bytes")
        end
        local content_type = params.content_type or "text/markdown"
        if content_type ~= "text/markdown" and content_type ~= "text/html" then
            return tool_result.fail(errors.INVALID, "text mode requires content_type: text/markdown or text/html")
        end
        if content_type == "text/html" then
            local content = params.content:match("^%s*(.-)%s*$")
            local first = content:sub(1, 1)
            if content:sub(1, 3) == "```" or first == "{" or first == "[" then
                return tool_result.fail(errors.INVALID, "HTML content requires rendered HTML markup; use a complete HTML document with SVG or canvas for charts, without code fences or JSON configuration")
            end
        end
        artifact.content = params.content
        artifact.content_type = content_type
    elseif tag_mode then
        if params.resource_id ~= nil or params.resource_kind ~= nil or params.content ~= nil or params.content_type ~= nil then
            return tool_result.fail(errors.INVALID, "tag mode cannot include text or resource fields")
        end
        local props, props_err = encode_props(params.props)
        if not props then return nil, props_err end
        local component, projected, tag_err = resolve_tag(params.tag_name)
        if not component then return nil, tag_err end
        local validated_props, validation_err = validate_component_props(props, projected)
        if not validated_props then return nil, validation_err end
        local package = {
            specification = "wippy-component-tag-1.0",
            wippy = { tagName = params.tag_name },
            props = validated_props,
        }
        local encoded, encode_err = json.encode(package)
        if encode_err then return nil, encode_err end
        artifact.content = encoded
        artifact.content_type = "application/json"
    else
        if not non_empty_string(params.resource_id) then return tool_result.fail(errors.INVALID, "resource_id must be a non-empty string") end
        if params.resource_kind ~= "component" and params.resource_kind ~= "page" then
            return tool_result.fail(errors.INVALID, "resource_kind must be component or page")
        end
        local props, props_err = encode_props(params.props)
        if not props then return nil, props_err end
        if params.resource_kind == "page" and params.props ~= nil then
            return tool_result.fail(errors.INVALID, "props are not supported for page resources")
        end
        local package, package_err
        if params.resource_kind == "component" then
            package, package_err = build_component_package(params.resource_id, props)
        else
            package, package_err = build_page_package(params.resource_id)
        end
        if not package then return nil, package_err end
        local encoded, encode_err = json.encode(package)
        if encode_err then return nil, encode_err end
        if #encoded > MAX_PACKAGE_BYTES then
            return tool_result.fail(errors.INVALID, "package must encode to at most " .. tostring(MAX_PACKAGE_BYTES) .. " bytes")
        end
        artifact.content = encoded
        artifact.content_type = "application/json"
    end

    return {
        success = true,
        message = "Artifact queued: " .. params.title,
        _control = { artifacts = { artifact } },
    }
end

return { handler = handler }
