-- URL / form encoding shared by the OAuth flows: auth-URL query params and the
-- token exchange + refresh request bodies. RFC 3986 percent-encoding — required
-- so a client_secret or authorization code containing reserved characters
-- (+ & = / etc.) doesn't corrupt the request.

local form = {}

local function needs_encoding(byte: number): boolean
    return not (
        (byte >= 65 and byte <= 90) or  -- A-Z
        (byte >= 97 and byte <= 122) or -- a-z
        (byte >= 48 and byte <= 57) or  -- 0-9
        byte == 45 or byte == 46 or     -- - .
        byte == 95 or byte == 126       -- _ ~
    )
end

-- Percent-encode a single value (RFC 3986 unreserved set passes through).
function form.url_encode(str: any): any
    if str == nil then return nil end
    local encoded = string.gsub(tostring(str), ".", function(char: string): string
        if needs_encoding(string.byte(char)) then
            return string.format("%%%02X", string.byte(char))
        end
        return char
    end)
    return encoded
end

-- Encode a flat table as an application/x-www-form-urlencoded body.
function form.encode(params: any): string
    local parts: { string } = {}
    for k, v in pairs(params :: { [string]: any }) do
        parts[#parts + 1] = (form.url_encode(k) :: string) .. "=" .. (form.url_encode(v) :: string)
    end
    return table.concat(parts, "&")
end

return form
