local json = require("json")
local version_publish = require("version_publish")

local function has_iteration_body_edge(document)
    local nodes_by_id = {}
    for _, raw_node in ipairs(type(document.nodes) == "table" and document.nodes or {}) do
        if type(raw_node) == "table" and type(raw_node.id) == "string" then
            nodes_by_id[raw_node.id] = raw_node
        end
    end
    for _, raw_edge in ipairs(type(document.edges) == "table" and document.edges or {}) do
        if type(raw_edge) == "table" and raw_edge.source_port == "body" then
            local source = nodes_by_id[raw_edge.source_id]
            if type(source) == "table" and (source.kind == "for_each" or source.kind == "cycle") then
                return true
            end
        end
    end
    return false
end

local function encode(value, label)
    local encoded, err = json.encode(value)
    if err or not encoded then error("encode " .. label .. ": " .. tostring(err)) end
    return encoded
end

local function recompile(db)
    local rows, query_err = db:query(
        "SELECT workflow_id, version, document FROM workflow_versions ORDER BY workflow_id, version")
    if query_err then error("read workflow versions: " .. tostring(query_err)) end

    for _, row in ipairs(rows or {}) do
        local document, decode_err = json.decode(tostring(row.document or ""))
        if decode_err or type(document) ~= "table" then
            error("decode workflow version " .. tostring(row.workflow_id) .. "/" .. tostring(row.version)
                .. ": " .. tostring(decode_err))
        end
        if has_iteration_body_edge(document) then
            local compiled, compile_err = version_publish.compile_document(document, tostring(row.workflow_id),
                tonumber(row.version) or 0)
            if compile_err or not compiled or compiled.ok ~= true then
                local detail = compiled and compiled.errors and compiled.errors[1]
                error("recompile workflow version " .. tostring(row.workflow_id) .. "/" .. tostring(row.version)
                    .. ": " .. tostring(compile_err or (detail and detail.message) or "failed"))
            end
            local _, update_err = db:execute(
                "UPDATE workflow_versions SET compiled_commands = $1, allowlist = $2 WHERE workflow_id = $3 AND version = $4",
                { encode(compiled.commands, "compiled commands"), encode(compiled.allowlist, "allowlist"),
                    tostring(row.workflow_id), tonumber(row.version) or 0 })
            if update_err then error("update workflow version " .. tostring(row.workflow_id) .. "/"
                .. tostring(row.version) .. ": " .. tostring(update_err)) end
        end
    end
end

return require("migration").define(function()
    migration("06 iteration input routes", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(recompile)
            end)
        end
    end)
end)
