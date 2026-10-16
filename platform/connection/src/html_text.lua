-- Shared HTML-to-plaintext cleaning for provider event extractors. Provider
-- bodies arrive as HTML / entity-laden markup; the embedding and search side
-- wants plain text. This is the single source for that pipeline so the four
-- extractors (discord, github, jira, confluence) can't drift apart.

local html = require("html")

local M = {}

local HTML_ENTITY = {
    ["&nbsp;"] = " ",
    ["&amp;"] = "&",
    ["&lt;"] = "<",
    ["&gt;"] = ">",
    ["&quot;"] = "\"",
    ["&#39;"] = "'",
    ["&apos;"] = "'",
    ["&hellip;"] = "…",
    ["&mdash;"] = "—",
    ["&ndash;"] = "–",
    ["&copy;"] = "©",
    ["&reg;"] = "®",
    ["&trade;"] = "™",
}

local STRICT_POLICY = (function()
    local p, err = html.sanitize.strict_policy()
    if err then error("html.sanitize.strict_policy failed: " .. tostring(err)) end
    return p
end)()

-- Encode a Unicode codepoint as UTF-8. Numeric character references above ASCII
-- (e.g. accents, emoji written as &#233;) must be preserved, not dropped. There
-- is no native utf8.char in this runtime, so the byte math is explicit; the
-- ::integer casts keep string.char's integer contract satisfied.
local function utf8_encode(n: number): string
    if n >= 0xD800 and n <= 0xDFFF then return "" end
    if n < 0x80 then
        return string.char(n :: integer)
    elseif n < 0x800 then
        return string.char((0xC0 + math.floor(n / 0x40)) :: integer, (0x80 + n % 0x40) :: integer)
    elseif n < 0x10000 then
        return string.char(
            (0xE0 + math.floor(n / 0x1000)) :: integer,
            (0x80 + math.floor(n / 0x40) % 0x40) :: integer,
            (0x80 + n % 0x40) :: integer
        )
    end
    return string.char(
        (0xF0 + math.floor(n / 0x40000)) :: integer,
        (0x80 + math.floor(n / 0x1000) % 0x40) :: integer,
        (0x80 + math.floor(n / 0x40) % 0x40) :: integer,
        (0x80 + n % 0x40) :: integer
    )
end

local function trim(s: any): string
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Decode decimal (&#NNN;), hex (&#xHH;), and named HTML entities to real
-- characters. Invalid/out-of-range references are dropped.
function M.decode_entities(s: any): string
    if type(s) ~= "string" or s == "" then return "" end
    local out = s :: string
    out = out:gsub("&#(%d+);", function(code)
        local n = tonumber(code)
        if not n or n < 1 or n > 0x10FFFF then return "" end
        return utf8_encode(math.floor(n))
    end)
    out = out:gsub("&#[xX](%x+);", function(code)
        local n = tonumber(code, 16)
        if not n or n < 1 or n > 0x10FFFF then return "" end
        return utf8_encode(math.floor(n))
    end)
    for entity, ch in pairs(HTML_ENTITY) do out = out:gsub(entity, ch) end
    return out
end

-- Sanitize HTML/entity-laden text into plain text for embedding/search.
-- opts.strip_cdata removes <![CDATA[ ]]> markers first (Confluence storage
-- format wraps macro bodies in them and bluemonday only eats the opener).
-- opts.collapse_newlines defaults to true (collapse runs of blank lines); pass
-- false to preserve newline structure (Discord markdown).
function M.strip_html(text: any, opts: any?): string
    if type(text) ~= "string" or text == "" then return "" end
    opts = type(opts) == "table" and opts or {}

    local input = text :: string
    if opts.strip_cdata then
        input = input:gsub("<!%[CDATA%[", ""):gsub("%]%]>", "")
    end

    local out = STRICT_POLICY:sanitize(input)
    out = M.decode_entities(out)
    -- bluemonday rewrites &nbsp; to U+00A0 (UTF-8 0xC2 0xA0); treat it as space.
    out = out:gsub(string.char(0xC2, 0xA0), " ")
    out = out:gsub("[ \t]+", " ")
    if opts.collapse_newlines ~= false then
        out = out:gsub("\n[ \t]*", "\n")
        out = out:gsub("\n\n\n+", "\n\n")
    end
    return trim(out)
end

return M
