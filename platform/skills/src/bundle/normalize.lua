-- Bundle normalization — turn parsed frontmatter + body + a flat list of fetched
-- files into the canonical SkillBundle the store consumes. Pure logic; no IO. A
-- source's fetch() builds the raw file list (path + content + encoding); this maps
-- frontmatter scalars to the bundle's typed fields and classifies each file
-- (reference / asset / script) by its path, inferring a mime type and, for
-- scripts, the language from the extension.

local skill_types = require("types")

local M = {}

-- Non-empty string guard shared across the store sides.
function M.is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

-- Normalize a bundle-relative path: forbid absolute paths and `..` traversal,
-- collapse leading slashes, reject the empty string. Returns (clean, nil) or
-- (nil, err). Centralized here so the writer (file prep) and reader (read_file)
-- enforce one path policy.
function M.clean_path(path: any): (string?, string?)
    if not M.is_str(path) then return nil, "path is required" end
    local p = (path :: string):gsub("\\", "/"):gsub("^/+", "")
    if p == "" then return nil, "path is required" end
    if #p > skill_types.LIMITS.PATH then return nil, "path too long" end
    for seg in p:gmatch("[^/]+") do
        if seg == ".." then return nil, "path traversal is not allowed" end
    end
    return p
end

-- Map a file extension to a mime type. Covers the text/markdown/code formats a
-- skill bundle carries; unknown extensions fall back to a generic binary type.
local MIME = {
    md = "text/markdown",
    markdown = "text/markdown",
    txt = "text/plain",
    json = "application/json",
    yaml = "application/yaml",
    yml = "application/yaml",
    csv = "text/csv",
    html = "text/html",
    py = "text/x-python",
    js = "text/javascript",
    ts = "text/typescript",
    sh = "text/x-shellscript",
    lua = "text/x-lua",
    rb = "text/x-ruby",
    png = "image/png",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    gif = "image/gif",
    pdf = "application/pdf",
}

-- Map a script file extension to a language label stored in the file metadata.
-- The future script runner reads this to pick a runtime profile.
local SCRIPT_LANG = {
    py = "python",
    js = "javascript",
    ts = "typescript",
    sh = "bash",
    lua = "lua",
    rb = "ruby",
}

local function ext_of(path: string): string
    return (path:match("%.([%w]+)$") or ""):lower()
end

M.ext_of = ext_of

-- Classify a file by its repo-relative path. scripts/ → script, assets/ →
-- asset, everything else (references/, loose files) → reference.
function M.kind_for_path(path: string): string
    local p = path:lower()
    if p:match("^scripts/") or p:match("/scripts/") then return skill_types.FILE_KIND.SCRIPT end
    if p:match("^assets/") or p:match("/assets/") then return skill_types.FILE_KIND.ASSET end
    return skill_types.FILE_KIND.REFERENCE
end

function M.mime_for_path(path: string): string
    return MIME[ext_of(path)] or "application/octet-stream"
end

-- Normalize a single fetched file (kind/mime/metadata derived from the path; an
-- explicit kind on the input wins so a source can override). The returned table
-- carries content + encoding for the store to decode, so it is the raw fetched
-- shape rather than the stored SkillFile type.
function M.normalize_file(raw: any): skill_types.SkillFileInput
    local file = (type(raw) == "table" and raw or {}) :: skill_types.SkillFileInput
    local path = type(file.path) == "string" and file.path or ""
    local kind = type(file.kind) == "string" and (file.kind :: string) ~= "" and file.kind or M.kind_for_path(path)
    local mime = type(file.mime_type) == "string" and (file.mime_type :: string) ~= "" and file.mime_type or M.mime_for_path(path)

    local metadata: skill_types.Map = type(file.metadata) == "table" and (file.metadata :: skill_types.Map) or {}
    if kind == skill_types.FILE_KIND.SCRIPT then
        local lang = SCRIPT_LANG[ext_of(path)]
        if lang and metadata.language == nil then metadata.language = lang end
    end

    return {
        path = path,
        kind = kind,
        mime_type = mime,
        content = file.content,
        encoding = file.encoding,
        executable = kind == skill_types.FILE_KIND.SCRIPT and true or (file.executable == true),
        metadata = metadata,
    }
end

-- Coerce a frontmatter value (scalar/list) to a string array.
local function to_list(v: any): { string }
    local out: { string } = {}
    if type(v) == "table" then
        for _, item in ipairs(v :: { any }) do
            if type(item) == "string" and (item :: string) ~= "" then out[#out + 1] = item :: string end
        end
    elseif type(v) == "string" and (v :: string) ~= "" then
        for t in (v :: string):gmatch("%S+") do out[#out + 1] = t end
    end
    return out
end

M.to_list = to_list

-- Build a SkillBundle from parsed frontmatter, the markdown body, the raw file
-- list, and the source descriptor. The name falls back to the supplied default
-- (e.g. a directory name) when frontmatter omits it.
function M.to_bundle(fm: any, body: any, files: any, source: any, name_fallback: string?): skill_types.SkillBundle
    local frontmatter = (type(fm) == "table" and fm or {}) :: skill_types.Map
    local name = type(frontmatter.name) == "string" and (frontmatter.name :: string) ~= "" and frontmatter.name or (name_fallback or "")

    local norm_files: { skill_types.SkillFileInput } = {}
    if type(files) == "table" then
        for _, f in ipairs(files :: { skill_types.SkillFileInput }) do
            norm_files[#norm_files + 1] = M.normalize_file(f)
        end
    end

    return ({
        name = name,
        description = type(frontmatter.description) == "string" and frontmatter.description or "",
        version = type(frontmatter.version) == "string" and frontmatter.version or nil,
        body = type(body) == "string" and body or "",
        license = type(frontmatter.license) == "string" and frontmatter.license or nil,
        allowed_tools = to_list(frontmatter["allowed-tools"]),
        compatibility = type(frontmatter.compatibility) == "table" and (frontmatter.compatibility :: skill_types.Map) or {},
        metadata = type(frontmatter.metadata) == "table" and (frontmatter.metadata :: skill_types.Map) or {},
        files = norm_files,
        source = type(source) == "table" and (source :: skill_types.Map) or {},
    }) :: skill_types.SkillBundle
end

return M
