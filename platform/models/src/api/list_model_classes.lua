local http = require("http")
local models = require("models")
local classes_read_model = require("classes_read_model")

-- GET /models/classes — the model-class catalog. Declarative model_class registry
-- entries are the source of truth (title / description / icon / weight), so a
-- declared class shows even before any model adopts it. The list is unioned with
-- any class a model actually references (so nothing is hidden), and each class
-- carries its member models ranked by priority — the top one is what class:<name>
-- resolves to. Ordered by weight (fastest/lightest first).
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end
    res:set_content_type(http.CONTENT.JSON)

    -- Start from the declared class vocabulary; track insertion-independent order.
    local class_map = {}
    local meta_by_name = {}
    for _, def in ipairs(classes_read_model.model_classes()) do
        meta_by_name[def.name] = def
        if not class_map[def.name] then class_map[def.name] = {} end
    end

    -- Union in classes actually used by models, collecting members.
    local all_models, err = models.get_all()
    if err then return nil, err end
    for _, model in ipairs(all_models) do
        local classes = model.class or {}
        if type(classes) ~= "table" then classes = { classes } end
        for _, cls in ipairs(classes) do
            if not class_map[cls] then class_map[cls] = {} end
            table.insert(class_map[cls], {
                name = model.name,
                title = model.title or model.name,
                priority = tonumber(model.priority) or 0,
            })
        end
    end

    local classes = {}
    for cls_name, cls_models in pairs(class_map) do
        table.sort(cls_models, function(a, b) return a.priority > b.priority end)
        local def = meta_by_name[cls_name] or {}
        classes[#classes + 1] = {
            name = cls_name,
            title = def.title or cls_name,
            description = def.description or "",
            icon = def.icon,
            weight = def.weight or 100,
            -- Declared tier kind: "embed" classes are configured from embedding
            -- models, everything else from generation models. Absent = generate.
            capability = def.capability or "generate",
            declared = meta_by_name[cls_name] ~= nil,
            models = cls_models,
        }
    end

    -- Fastest/lightest first; stable tiebreak by name.
    table.sort(classes, function(a, b)
        if a.weight ~= b.weight then return a.weight < b.weight end
        return tostring(a.name) < tostring(b.name)
    end)

    res:set_header("Cache-Control", "no-store")
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, classes = classes })
end

return {
    handler = handler,
}
