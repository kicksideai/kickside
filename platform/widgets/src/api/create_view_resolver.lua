-- GET /api/v1/component-kinds/create-view?class=<class>
--
-- Generic resolver behind the shared component picker's create-path. Given a
-- component class, it finds the contract.binding that declares that class AND a
-- meta.component.create.view, then resolves that view id to its mountable
-- view.component (tag_name/title). The picker offers "+ Create new <noun>" only when
-- a create view exists. No per-kind knowledge lives here: a kind becomes creatable
-- from any picker the moment its binding declares meta.component.create.view.

local http = require("http")
local security = require("security")
local registry = require("registry")

local M = {}

-- A binding's meta.class is a string or a list of strings. Match when the requested
-- class equals the string or appears in the list.
local function class_matches(declared: any, want: string): boolean
    if type(declared) == "string" then return declared == want end
    if type(declared) == "table" then
        for _, v in ipairs(declared :: { any }) do
            if v == want then return true end
        end
    end
    return false
end

-- create_view_id(class) -> the create.view registry id declared by the binding for
-- this class, or nil. First match wins (a class has one creating binding).
local function create_view_id(class: string): (string?, any?)
    local entries, err = registry.find({ [".kind"] = "contract.binding" })
    if err then return nil, err end
    for _, entry in ipairs(entries :: { any }) do
        local meta: any = (entry :: any).meta or {}
        if class_matches(meta.class, class) then
            local comp: any = meta.component
            if type(comp) == "table" and type(comp.create) == "table" then
                local view = (comp.create :: any).view
                if type(view) == "string" and view ~= "" then return view end
            end
        end
    end
    return nil
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local class = req:query("class")
    if type(class) ~= "string" or class == "" then
        res:write_json({ success = true, create_view = nil })
        return
    end

    local view_id, find_err = create_view_id(class :: string)
    if find_err then return nil, find_err end
    if not view_id then
        res:write_json({ success = true, create_view = nil })
        return
    end

    local entry, get_err = registry.get(view_id)
    if get_err then return nil, get_err end
    if type(entry) ~= "table" then
        res:write_json({ success = true, create_view = nil })
        return
    end
    local meta: any = (entry :: any).meta or {}
    if meta.type ~= "view.component" or type(meta.tag_name) ~= "string" or meta.tag_name == "" then
        res:write_json({ success = true, create_view = nil })
        return
    end

    res:write_json({
        success = true,
        create_view = {
            tag_name = meta.tag_name,
            title = meta.title or "",
            base_path = meta.base_path or "",
            entry_point = meta.entry_point or "",
        },
    })
end

return { handler = handler, create_view_id = create_view_id, class_matches = class_matches }
